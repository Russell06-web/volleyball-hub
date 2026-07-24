import { useEffect, useMemo, useRef, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import Header from '../components/Header'
import BottomTabs from '../components/BottomTabs'
import SiteFooter from '../components/SiteFooter'
import FilterPanel, { matchesFilters } from '../components/FilterPanel'
import FilterModal from '../components/FilterModal'
import EventCard from '../components/EventCard'
import { Icon } from '../components/Icons'
import { useEvents } from '../context/EventsContext'
import { usePreferences } from '../context/PreferencesContext'
import { DEFAULT_FILTERS, EVENT_TYPES, FILTER_ALL, SECTION_VIEW, SORTS } from '../constants/taxonomy'
import { formatPrice } from '../utils/format'
import { matchesSearch } from '../utils/search'
import { sortEvents } from '../utils/sortEvents'
import '../styles/explore.css'

const QUICK_TYPES = [{ value: FILTER_ALL, label: '全部' }, ...EVENT_TYPES]
const FILTER_KEYS = ['type', 'gender', 'level', 'price', 'city']

function isDefaultParam(key, value) {
  if (key === 'q') return !value || !value.trim()
  if (key === 'sort') return value === 'default'
  if (key === 'view') return value === SECTION_VIEW.ALL
  return value === DEFAULT_FILTERS[key]
}

function paramsToFilters(params) {
  const f = { ...DEFAULT_FILTERS }
  FILTER_KEYS.forEach((k) => { const v = params.get(k); if (v) f[k] = v })
  return f
}

export default function Explore() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [filterOpen, setFilterOpen] = useState(false)
  const { filters: storedFilters, setFilters: setStoredFilters, resetFilters: resetStoredFilters } = usePreferences()
  const { events } = useEvents()
  const seededRef = useRef(false)

  useEffect(() => {
    document.title = '排球活動探索｜Volleyball Hub'
  }, [])

  // URL is the source of truth once it has any of these params — a
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
    const seeded = new URLSearchParams()
    FILTER_KEYS.forEach((k) => { if (storedFilters[k] && storedFilters[k] !== DEFAULT_FILTERS[k]) seeded.set(k, storedFilters[k]) })
    if ([...seeded.keys()].length) setSearchParams(seeded, { replace: true })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const query = searchParams.get('q') || ''
  const filters = useMemo(() => paramsToFilters(searchParams), [searchParams])
  const sort = SORTS.some((s) => s.value === searchParams.get('sort')) ? searchParams.get('sort') : 'default'
  const sectionView = Object.values(SECTION_VIEW).includes(searchParams.get('view')) ? searchParams.get('view') : SECTION_VIEW.ALL

  function updateParams(patch) {
    const next = new URLSearchParams(searchParams)
    Object.entries(patch).forEach(([key, value]) => {
      if (isDefaultParam(key, value)) next.delete(key)
      else next.set(key, value)
    })
    setSearchParams(next, { replace: true })
  }

  function handleFilterChange(key, value) {
    updateParams({ [key]: value })
    setStoredFilters({ ...filters, [key]: value })
  }
  function handleResetFilters() {
    const next = new URLSearchParams(searchParams)
    FILTER_KEYS.forEach((k) => next.delete(k))
    setSearchParams(next, { replace: true })
    resetStoredFilters()
  }
  function handleQueryChange(value) { updateParams({ q: value }) }
  function handleQueryClear() { updateParams({ q: '' }) }
  function handleSortChange(value) { updateParams({ sort: value }) }
  function handleSectionView(view) { updateParams({ view }) }

  const isFiltering = FILTER_KEYS.some((k) => filters[k] !== DEFAULT_FILTERS[k])
  const isSearching = query.trim().length > 0

  const searchedAndFiltered = useMemo(
    () => events.filter((e) => matchesFilters(e, filters) && matchesSearch(e, query)),
    [events, filters, query],
  )
  const sorted = useMemo(() => sortEvents(searchedAndFiltered, sort), [searchedAndFiltered, sort])

  const featured = useMemo(() => sorted.filter((e) => e.isFeatured), [sorted])
  const urgent = useMemo(() => sorted.filter((e) => e.isUrgent), [sorted])
  const more = useMemo(() => sorted.filter((e) => !e.isFeatured && !e.isUrgent), [sorted])
  const totalCount = sorted.length

  function resetSearchAndFilters() {
    const next = new URLSearchParams(searchParams)
    FILTER_KEYS.forEach((k) => next.delete(k))
    next.delete('q')
    setSearchParams(next, { replace: true })
    resetStoredFilters()
  }

  return (
    <>
      <Header
        title="排球探索"
        subtitle={isFiltering || isSearching ? '符合目前搜尋與篩選條件' : '發現精彩活動'}
        active="explore"
        showSearch
        searchValue={query}
        onSearchChange={handleQueryChange}
        onSearchClear={handleQueryClear}
      />

      <div className="layout">
        <aside className="filter-sidebar" aria-label="篩選活動">
          <FilterPanel filters={filters} onChange={handleFilterChange} onReset={handleResetFilters} resultCount={totalCount} />
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

          <div className="explore-toolbar">
            <p className="filter-result-count top" aria-live="polite">
              <span>{totalCount} 場活動符合條件</span>
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
            <p className="empty-state" role="status">
              找不到符合搜尋與篩選條件的活動。
              <button type="button" className="link-btn" onClick={resetSearchAndFilters}>清除搜尋及重置篩選</button>
            </p>
          ) : sectionView === SECTION_VIEW.FEATURED ? (
            <SectionOnly title="精選活動" list={featured} filters={filters} onBack={() => handleSectionView(SECTION_VIEW.ALL)} />
          ) : sectionView === SECTION_VIEW.URGENT ? (
            <SectionOnly title="臨打專區" list={urgent} filters={filters} onBack={() => handleSectionView(SECTION_VIEW.ALL)} urgent />
          ) : (
            <>
              {featured.length > 0 && (
                <section className="strip">
                  <div className="strip-head">
                    <h2>精選活動</h2>
                    <button type="button" className="see-all" onClick={() => handleSectionView(SECTION_VIEW.FEATURED)}>
                      查看全部 <Icon id="i-chevron" size={14} />
                    </button>
                  </div>
                  <div className="card-scroll">
                    {featured.map((ev) => <EventCard key={ev.id} ev={ev} filters={filters} />)}
                  </div>
                </section>
              )}

              {urgent.length > 0 && (
                <section className="strip">
                  <div className="strip-head">
                    <h2>臨打專區 <span className="badge live"><i />急徵隊友</span></h2>
                    <button type="button" className="see-all" onClick={() => handleSectionView(SECTION_VIEW.URGENT)}>
                      查看全部 <Icon id="i-chevron" size={14} />
                    </button>
                  </div>
                  <div className="urgent-grid">
                    {urgent.map((ev) => <UrgentCard key={ev.id} ev={ev} />)}
                  </div>
                </section>
              )}

              <section className="strip" id="more-events">
                <div className="strip-head"><h2>更多活動</h2><span className="result-count">{more.length} 場符合條件</span></div>
                {more.length === 0 ? (
                  <p className="empty-state">這個分類目前沒有符合條件的活動。</p>
                ) : (
                  <div className="event-grid">
                    {more.map((ev) => <EventCard key={ev.id} ev={ev} filters={filters} />)}
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
        onChange={handleFilterChange}
        onReset={handleResetFilters}
        resultCount={totalCount}
      />
    </>
  )
}

function SectionOnly({ title, list, filters, onBack, urgent = false }) {
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
      ) : urgent ? (
        <div className="urgent-grid">{list.map((ev) => <UrgentCard key={ev.id} ev={ev} />)}</div>
      ) : (
        <div className="event-grid">{list.map((ev) => <EventCard key={ev.id} ev={ev} filters={filters} />)}</div>
      )}
    </section>
  )
}

function UrgentCard({ ev }) {
  return (
    <article className="card urgent-card">
      <div className="card-top"><span className="badge live"><i />急徵隊友</span></div>
      <Link to={`/event/${ev.id}`}><h3>{ev.title}</h3></Link>
      <ul className="meta">
        <li><Icon id="i-pin" size={14} />{ev.venueName}</li>
        <li><Icon id="i-clock" size={14} />{ev.date === new Date().toISOString().slice(0, 10) ? '今天' : ev.date} {ev.startTime}</li>
        <li><Icon id="i-users" size={14} />{ev.registeredCount} / {ev.capacity} 人</li>
      </ul>
      <div className="card-foot">
        <span className="price">{formatPrice(ev.price)}</span>
        <Link to={`/event/${ev.id}`} className="btn-cta urgent">立刻加入</Link>
      </div>
    </article>
  )
}
