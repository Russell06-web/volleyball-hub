import { useEffect, useMemo, useRef, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import Header from '../components/Header'
import BottomTabs from '../components/BottomTabs'
import SiteFooter from '../components/SiteFooter'
import FilterPanel, { matchesFilters } from '../components/FilterPanel'
import FilterModal from '../components/FilterModal'
import SaveSearchDialog from '../components/SaveSearchDialog'
import EventCard from '../components/EventCard'
import { Icon } from '../components/Icons'
import { useEvents } from '../context/EventsContext'
import { usePreferences } from '../context/PreferencesContext'
import { useProfile } from '../context/ProfileContext'
import { useSavedSearches } from '../context/SavedSearchesContext'
import { DEFAULT_FILTERS, EVENT_TYPES, FILTER_ALL, SECTION_VIEW, SORTS } from '../constants/taxonomy'
import {
  DEFAULT_EXPLORE_STATE, FILTER_KEYS, getPreferencesSyncPatch, parseExploreParams, sanitizeExploreParams,
} from '../utils/exploreParams'
import { getLabelForFilter } from '../utils/exploreFilterLabels'
import { useSearchInput } from '../hooks/useSearchInput'
import { matchesSearch } from '../utils/search'
import { sortEvents } from '../utils/sortEvents'
import { isPubliclyVisible } from '../utils/eventStatus'
import { getAlternativeFilterSuggestions } from '../utils/alternativeFilters'
import { savedSearchToQueryString } from '../utils/savedSearches'
import '../styles/explore.css'

const QUICK_TYPES = [{ value: FILTER_ALL, label: '全部' }, ...EVENT_TYPES]

// Compact one-click shortcuts into a filtered state — not a new filter
// dimension, each just applies filters/dateRange the app already has.
// "我需要的位置" only carries a real value when the visitor has actually
// set a specific default position in their volleyball preferences
// (universal/unset has nothing honest to filter by), in which case it
// opens the filter sheet on that section instead of applying a
// meaningless filter.
function buildQuickEntries(profile) {
  const hasRealPosition = profile.defaultPosition && profile.defaultPosition !== 'universal'
  return [
    { key: 'today', label: '今天臨打', patch: { dateRange: 'today' } },
    { key: 'weekend', label: '週末球局', patch: { dateRange: 'weekend' } },
    { key: 'intermediate', label: '中階活動', patch: { level: 'intermediate' } },
    { key: 'myPosition', label: '我需要的位置', patch: hasRealPosition ? { position: profile.defaultPosition } : null },
  ]
}

function getResultCountText(count, query, isFiltering) {
  const trimmed = query.trim()
  if (trimmed && isFiltering) return `「${trimmed}」在目前條件下找到 ${count} 場活動`
  if (trimmed) return `「${trimmed}」找到 ${count} 場活動`
  if (isFiltering) return `${count} 場活動符合目前條件`
  return `共 ${count} 場活動`
}

function getResultsHeading(isSearching, isFiltering, query) {
  if (isSearching && isFiltering) return '搜尋與篩選結果'
  if (isSearching) return `「${query.trim()}」的搜尋結果`
  return '篩選結果'
}

export default function Explore() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [filterOpen, setFilterOpen] = useState(false)
  const [saveSearchOpen, setSaveSearchOpen] = useState(false)
  const { filters: storedFilters, setFilters: setStoredFilters, resetFilters: resetStoredFilters } = usePreferences()
  const { events } = useEvents()
  const { profile } = useProfile()
  const { savedSearches } = useSavedSearches()
  const seededRef = useRef(false)

  useEffect(() => {
    document.title = '排球活動探索｜Volleyball Hub'
  }, [])

  // URL is the source of truth once it has any relevant param — a
  // refresh, a pasted link, or browser back/forward all just re-derive
  // state from searchParams below. On the very first arrival at a bare
  // /explore with nothing in the query string, seed it once from
  // whatever was last saved to localStorage so a returning visitor's
  // filters still apply.
  useEffect(() => {
    if (seededRef.current) return
    seededRef.current = true
    const hasAnyParam = [...FILTER_KEYS, 'q', 'sort', 'view'].some((k) => searchParams.has(k))
    if (hasAnyParam) return
    const seeded = sanitizeExploreParams({ ...DEFAULT_EXPLORE_STATE, ...storedFilters })
    if ([...seeded.keys()].length) setSearchParams(seeded, { replace: true })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Whatever the address bar holds, once parsed and re-sanitised, is the
  // only state this page trusts — an unknown/invalid value (?level=abc)
  // or a redundant default (?type=all) is silently corrected here rather
  // than left in the URL as a filter that looks selected but matches
  // nothing.
  const state = useMemo(() => parseExploreParams(searchParams), [searchParams])
  useEffect(() => {
    const canonical = sanitizeExploreParams(state)
    if (canonical.toString() !== searchParams.toString()) {
      setSearchParams(canonical, { replace: true })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams])

  const { q: query, sort, view: sectionView } = state
  const filters = useMemo(() => {
    const f = { ...DEFAULT_FILTERS }
    FILTER_KEYS.forEach((k) => { f[k] = state[k] })
    return f
  }, [state])

  // EventDetail reads PreferencesContext directly for its own
  // condition-match explanation — keep it following whatever Explore's
  // URL actually says, so a shared link / back-forward / refresh doesn't
  // leave the two disagreeing about what "the current filters" are. Never
  // runs the other direction (Context never pushes into the URL here) and
  // never fires when the URL carries no filter at all, so a bare
  // /explore visit doesn't wipe out a previously saved preference.
  useEffect(() => {
    const patch = getPreferencesSyncPatch(searchParams, filters, storedFilters)
    if (patch) setStoredFilters(patch)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams])

  // Filter/sort/view-toggle clicks build normal browser history (so
  // "back" undoes one change at a time); the search box replaces so
  // keystrokes don't spam history — see useSearchInput below.
  function commit(patch, { push = false } = {}) {
    const next = sanitizeExploreParams({ ...state, ...patch })
    setSearchParams(next, { replace: !push })
  }

  const { inputValue: searchInput, handleChange: handleSearchInputChange, handleCommitNow: commitSearchNow, handleClear: clearSearchInput } = useSearchInput(
    query,
    (value) => commit({ q: value, view: SECTION_VIEW.ALL }),
  )

  function handleFilterChange(key, value) {
    // Changing what's actually being searched for should always return
    // to the full result set — staying inside a 精選/臨打 "查看全部" view
    // while the underlying list changes is how a filtered search ends up
    // showing the wrong empty state.
    commit({ [key]: value, view: SECTION_VIEW.ALL }, { push: true })
    setStoredFilters({ ...filters, [key]: value })
  }
  function handleQuickEntry(patch) {
    if (!patch) { setFilterOpen(true); return }
    const basicPatch = {}
    Object.keys(patch).forEach((k) => { if (k in DEFAULT_FILTERS) basicPatch[k] = patch[k] })
    commit({ ...patch, view: SECTION_VIEW.ALL }, { push: true })
    if (Object.keys(basicPatch).length) setStoredFilters({ ...filters, ...basicPatch })
  }
  function handleResetFilters() {
    const cleared = {}
    FILTER_KEYS.forEach((k) => { cleared[k] = FILTER_ALL })
    commit({ ...cleared, view: SECTION_VIEW.ALL }, { push: true })
    resetStoredFilters()
  }
  function handleSortChange(value) { commit({ sort: value }, { push: true }) }
  function handleSectionView(view) { commit({ view }, { push: true }) }
  function resetSearchAndFilters() {
    const cleared = { q: '' }
    FILTER_KEYS.forEach((k) => { cleared[k] = FILTER_ALL })
    commit({ ...cleared, view: SECTION_VIEW.ALL }, { push: true })
    resetStoredFilters()
  }

  // FilterModal owns its own draft state and only calls this once, when
  // "套用篩選" is pressed — so opening the sheet, poking around, and
  // closing it never touches the real URL, and a genuine apply is always
  // exactly one history entry. If the draft came back identical to what's
  // already live, skip the commit entirely rather than push a no-op.
  function handleApplyFilters(draftFilters) {
    const changed = FILTER_KEYS.some((k) => draftFilters[k] !== filters[k])
    if (changed) {
      commit({ ...draftFilters, view: SECTION_VIEW.ALL }, { push: true })
      setStoredFilters({ ...filters, ...draftFilters })
    }
    setFilterOpen(false)
  }

  const isFiltering = FILTER_KEYS.some((k) => filters[k] !== FILTER_ALL)
  const isSearching = query.trim().length > 0
  const isBrowsingHome = !isFiltering && !isSearching

  // Explore only ever shows what a visitor could actually act on right
  // now — drafts are Manage-only, and a cancelled/completed/expired event
  // has nothing left to offer here (its own detail page still explains
  // that state if someone follows an old link/booking to it).
  const visibleEvents = useMemo(() => events.filter((e) => isPubliclyVisible(e)), [events])

  function getResultCountForFilters(candidateFilters) {
    return visibleEvents.filter((e) => matchesFilters(e, candidateFilters) && matchesSearch(e, query)).length
  }
  // Same idea as getResultCountForFilters, but for a full candidate
  // explore state (including q) — what getAlternativeFilterSuggestions
  // needs to check whether relaxing one dimension would really help.
  function getCountForExploreState(candidateState) {
    return visibleEvents.filter((e) => matchesFilters(e, candidateState) && matchesSearch(e, candidateState.q ?? '')).length
  }

  const searchedAndFiltered = useMemo(
    () => visibleEvents.filter((e) => matchesFilters(e, filters) && matchesSearch(e, query)),
    [visibleEvents, filters, query],
  )
  const sorted = useMemo(() => sortEvents(searchedAndFiltered, sort), [searchedAndFiltered, sort])
  const totalCount = sorted.length

  const alternativeSuggestions = useMemo(() => {
    if (totalCount !== 0) return []
    return getAlternativeFilterSuggestions(state, totalCount, getCountForExploreState)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [totalCount, state, visibleEvents])

  function applySuggestion(patch) {
    commit(patch, { push: true })
  }

  // Homepage categorisation only applies when nothing is being searched
  // or filtered — and an event that's both isUrgent and isFeatured only
  // ever appears once, in 臨打專區 (time-sensitive beats "editorially
  // featured").
  const urgent = useMemo(() => sorted.filter((e) => e.isUrgent), [sorted])
  const featured = useMemo(() => sorted.filter((e) => e.isFeatured && !e.isUrgent), [sorted])
  const more = useMemo(() => sorted.filter((e) => !e.isFeatured && !e.isUrgent), [sorted])

  const resultCountText = getResultCountText(totalCount, query, isFiltering)

  return (
    <>
      <Header
        title="排球探索"
        subtitle={isFiltering || isSearching ? '符合目前搜尋與篩選條件' : '發現精彩活動'}
        active="explore"
        showSearch
        searchValue={searchInput}
        onSearchChange={handleSearchInputChange}
        onSearchClear={clearSearchInput}
        onSearchCommit={commitSearchNow}
      />

      {isBrowsingHome && (
        <div className="explore-hero court-texture">
          <Icon id="i-ball" size={72} className="explore-hero-ball" />
          <div className="explore-hero-body">
            <h1>找到適合你的下一場球</h1>
            <p className="explore-hero-sub">依地區、程度、位置與時間，快速找到可以加入的排球活動。</p>
            <label className="explore-hero-search">
              <span className="sr-only">搜尋活動</span>
              <Icon id="i-search" size={17} />
              <input
                type="search"
                placeholder="搜尋球館、地區或活動"
                value={searchInput}
                onChange={(e) => handleSearchInputChange(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') commitSearchNow() }}
                onBlur={commitSearchNow}
              />
              {searchInput && (
                <button type="button" aria-label="清除搜尋" onClick={clearSearchInput}>
                  <Icon id="i-close" size={13} />
                </button>
              )}
            </label>
            <p className="explore-hero-stat">{visibleEvents.length} 場開放中的活動，隨時可以加入</p>
          </div>
        </div>
      )}

      {isBrowsingHome && (
        <div className="quick-entry-row" aria-label="快速入口">
          {buildQuickEntries(profile).map((entry) => (
            <button key={entry.key} type="button" className="quick-entry-chip" onClick={() => handleQuickEntry(entry.patch)}>
              {entry.label}
            </button>
          ))}
        </div>
      )}

      <div className="layout">
        <aside className="filter-sidebar" aria-label="篩選活動">
          <FilterPanel filters={filters} onChange={handleFilterChange} onReset={handleResetFilters} resultCount={totalCount} isFiltering={isFiltering} />
        </aside>

        <main className="content">
          <div className="filter-chips-mobile" aria-label="快速篩選">
            {QUICK_TYPES.map((t) => (
              <button
                key={t.value}
                type="button"
                className={`chip primary${filters.type === t.value ? ' active' : ''}`}
                aria-pressed={filters.type === t.value}
                onClick={() => handleFilterChange('type', t.value)}
              >
                {t.label}
              </button>
            ))}
            <button className="icon-btn filter-trigger" aria-label="更多篩選" aria-haspopup="dialog" onClick={() => setFilterOpen(true)}>
              <Icon id="i-filter" size={17} />
            </button>
          </div>

          {isFiltering && (
            <div className="active-filters" aria-label="目前套用的篩選條件">
              {FILTER_KEYS.filter((k) => filters[k] !== FILTER_ALL).map((k) => (
                <button
                  key={k}
                  type="button"
                  className="active-filter-chip"
                  aria-label={`移除${getLabelForFilter(k, filters[k])}篩選`}
                  onClick={() => handleFilterChange(k, FILTER_ALL)}
                >
                  <span aria-hidden="true">{getLabelForFilter(k, filters[k])}</span>
                  <span className="chip-remove" aria-hidden="true"><Icon id="i-close" size={11} /></span>
                </button>
              ))}
              <button type="button" className="active-filters-clear" onClick={handleResetFilters}>清除全部</button>
              <button type="button" className="link-btn save-search-trigger" onClick={() => setSaveSearchOpen(true)}>儲存這組條件</button>
            </div>
          )}

          <div className="explore-toolbar">
            <p className="filter-result-count top" aria-live="polite">
              <span>{resultCountText}</span>
              {(isFiltering || isSearching) && (
                <button type="button" className="link-btn" onClick={resetSearchAndFilters}>清除搜尋及篩選</button>
              )}
            </p>
            <label className="sort-select">
              <span className="sr-only">排序方式</span>
              <select value={sort} onChange={(e) => handleSortChange(e.target.value)}>
                {SORTS.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
              </select>
            </label>
          </div>

          {totalCount === 0 ? (
            <div className="empty-state-block" role="status">
              <p className="empty-state">
                {isSearching
                  ? `找不到符合「${query.trim()}」${isFiltering ? '與目前篩選條件' : ''}的活動。`
                  : '找不到符合目前篩選條件的活動。'}
              </p>
              {alternativeSuggestions.length > 0 && (
                <ul className="alt-suggestions" aria-label="可以試試">
                  {alternativeSuggestions.map((s) => (
                    <li key={s.id}>
                      <button type="button" className="alt-suggestion-btn" onClick={() => applySuggestion(s.patch)}>
                        <span>{s.label}</span>
                        <span className="alt-suggestion-count">{s.resultCount} 場</span>
                      </button>
                    </li>
                  ))}
                </ul>
              )}
              <button type="button" className="link-btn" onClick={resetSearchAndFilters}>
                {isSearching ? '清除搜尋及重置篩選' : '重置篩選'}
              </button>
            </div>
          ) : !isBrowsingHome ? (
            // Searching or filtering collapses everything into a single
            // list — every matching event appears exactly once, with no
            // 精選/臨打/更多 split to keep straight.
            <section className="strip" aria-label="搜尋與篩選結果">
              <div className="results-heading-row">
                <h2>{getResultsHeading(isSearching, isFiltering, query)}</h2>
              </div>
              <div className="event-grid">
                {sorted.map((ev) => <EventCard key={ev.id} ev={ev} variant={ev.isUrgent ? 'urgent' : 'default'} />)}
              </div>
            </section>
          ) : sectionView === SECTION_VIEW.FEATURED ? (
            <SectionOnly title="精選活動" list={featured} onBack={() => handleSectionView(SECTION_VIEW.ALL)} variant="featured" />
          ) : sectionView === SECTION_VIEW.URGENT ? (
            <SectionOnly title="臨打專區" list={urgent} onBack={() => handleSectionView(SECTION_VIEW.ALL)} variant="urgent" />
          ) : (
            <>
              {urgent.length > 0 && (
                <section className="strip">
                  <div className="strip-head">
                    <h2>近期臨打 <span className="badge live"><i />急徵隊友</span></h2>
                    <button type="button" className="see-all" onClick={() => handleSectionView(SECTION_VIEW.URGENT)}>
                      查看全部 <Icon id="i-chevron" size={14} />
                    </button>
                  </div>
                  <div className="urgent-grid">
                    {urgent.map((ev) => <EventCard key={ev.id} ev={ev} variant="urgent" />)}
                  </div>
                </section>
              )}

              {featured.length > 0 && (
                <section className="strip">
                  <div className="strip-head">
                    <h2>精選活動</h2>
                    <button type="button" className="see-all" onClick={() => handleSectionView(SECTION_VIEW.FEATURED)}>
                      查看全部 <Icon id="i-chevron" size={14} />
                    </button>
                  </div>
                  <div className="card-scroll">
                    {featured.map((ev) => <EventCard key={ev.id} ev={ev} variant="featured" />)}
                  </div>
                </section>
              )}

              {savedSearches.length > 0 && (
                <section className="strip saved-search-strip">
                  <div className="strip-head"><h2>常用的探索條件</h2></div>
                  <div className="saved-search-chip-row">
                    {savedSearches.map((s) => (
                      <Link key={s.id} to={`/explore${savedSearchToQueryString(s)}`} className="saved-search-entry-chip">
                        <Icon id="i-filter" size={13} />{s.name}
                      </Link>
                    ))}
                  </div>
                </section>
              )}

              <section className="strip" id="more-events">
                <div className="strip-head"><h2>全部活動</h2><span className="result-count">{more.length} 場</span></div>
                {more.length === 0 ? (
                  <p className="empty-state">目前沒有其他活動。</p>
                ) : (
                  <div className="event-grid">
                    {more.map((ev) => <EventCard key={ev.id} ev={ev} />)}
                  </div>
                )}
              </section>
            </>
          )}
        </main>
      </div>

      <SiteFooter />
      <BottomTabs active="explore" />
      <FilterModal
        open={filterOpen}
        onClose={() => setFilterOpen(false)}
        filters={filters}
        onApply={handleApplyFilters}
        getResultCountForFilters={getResultCountForFilters}
      />
      <SaveSearchDialog
        open={saveSearchOpen}
        onClose={() => setSaveSearchOpen(false)}
        exploreState={state}
      />
    </>
  )
}

function SectionOnly({ title, list, onBack, variant = 'default' }) {
  const isUrgent = variant === 'urgent'
  return (
    <section className="strip">
      <div className="strip-head">
        <button type="button" className="link-btn back-to-all" onClick={onBack}>
          <Icon id="i-back" size={14} />返回全部活動
        </button>
      </div>
      <h2 className="section-only-title">{title}</h2>
      {list.length === 0 ? (
        <p className="empty-state">目前沒有符合條件的{title}。</p>
      ) : (
        <div className={isUrgent ? 'urgent-grid' : 'event-grid'}>
          {list.map((ev) => <EventCard key={ev.id} ev={ev} variant={variant} />)}
        </div>
      )}
    </section>
  )
}
