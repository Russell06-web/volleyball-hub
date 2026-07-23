import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import Header from '../components/Header'
import BottomTabs from '../components/BottomTabs'
import SiteFooter from '../components/SiteFooter'
import FilterPanel, { matchesFilters } from '../components/FilterPanel'
import FilterModal from '../components/FilterModal'
import { Icon } from '../components/Icons'
import { EVENTS, isFull } from '../data/events'
import { usePreferences } from '../context/PreferencesContext'
import { getRecommendation, STATE_META } from '../utils/recommend'
import '../styles/explore.css'

const FEATURED = EVENTS.filter((e) => e.section === 'featured')
const URGENT = EVENTS.filter((e) => e.section === 'urgent')
const MORE = EVENTS.filter((e) => e.section === 'more')
const QUICK_TYPES = ['全部', '室內排球', '沙灘排球', '草地排球', '親子・體驗']

function EventCard({ ev, filters }) {
  const full = isFull(ev)
  const rec = getRecommendation(ev, filters)
  return (
    <article className="card event-card">
      <div className="card-top">
        {ev.badgeLabel && <span className={`badge ${ev.tone}`}>{ev.badgeLabel}</span>}
        <button className="icon-btn ghost" aria-label="收藏"><Icon id="i-heart" size={16} /></button>
      </div>
      <Link to={`/event/${ev.id}`}><h3>{ev.title}</h3></Link>
      <div className="tag-row">
        {ev.level !== '不限' && <span className="tag level">{ev.level}</span>}
        <span className="tag type">{ev.type}</span>
        {full && <span className="tag wait">已額滿</span>}
      </div>
      {rec && (
        <div className="rec-block">
          <span className={`badge ${STATE_META[rec.state].tone}`}>{STATE_META[rec.state].label}</span>
          <div className="rec-reasons">
            {rec.reasons.map((r) => <span key={r} className="tag reason">{r}</span>)}
          </div>
        </div>
      )}
      <ul className="meta">
        <li><Icon id="i-pin" size={14} />{ev.loc}</li>
        <li><Icon id="i-calendar" size={14} />{ev.date}・{ev.time}</li>
        <li><Icon id="i-users" size={14} />{ev.registered} / {ev.capacity} 人</li>
      </ul>
      <div className="card-foot">
        <span className={`price${ev.free ? ' free' : ''}`}>{ev.free ? '免費' : `NT$${ev.price}`}</span>
        <Link to={`/event/${ev.id}`} className={`btn-cta${full ? ' waitlist' : ''}`}>{full ? '候補' : '報名'}</Link>
      </div>
    </article>
  )
}

export default function Explore() {
  const [filterOpen, setFilterOpen] = useState(false)
  const { filters, setFilter, resetFilters } = usePreferences()

  function handleChange(key, value) {
    setFilter(key, value)
  }

  const filteredFeatured = useMemo(() => FEATURED.filter((e) => matchesFilters(e, filters)), [filters])
  const filteredUrgent = useMemo(() => URGENT.filter((e) => matchesFilters(e, filters)), [filters])
  const filteredMore = useMemo(() => MORE.filter((e) => matchesFilters(e, filters)), [filters])
  const totalCount = filteredFeatured.length + filteredUrgent.length + filteredMore.length
  const isFiltering = useMemo(() => (
    filters.type !== '全部' || filters.gender !== '不限' || filters.level !== '全部' || filters.price !== '全部' || filters.city !== '全部'
  ), [filters])

  return (
    <>
      <Header title="排球探索" subtitle={isFiltering ? '符合目前篩選條件' : '發現精彩活動'} active="explore" showSearch />

      <div className="layout">
        <aside className="filter-sidebar" aria-label="篩選活動">
          <FilterPanel filters={filters} onChange={handleChange} onReset={resetFilters} resultCount={totalCount} />
        </aside>

        <main className="content">
          <div className="filter-chips-mobile" aria-label="快速篩選">
            {QUICK_TYPES.map((t) => (
              <button
                key={t}
                type="button"
                className={`chip primary${filters.type === t ? ' active' : ''}`}
                onClick={() => handleChange('type', t)}
              >
                {t}
              </button>
            ))}
            <button className="icon-btn filter-trigger" aria-label="更多篩選" aria-haspopup="dialog" onClick={() => setFilterOpen(true)}>
              <Icon id="i-filter" size={17} />
            </button>
          </div>

          {isFiltering && (
            <p className="filter-result-count top">
              {totalCount} 場活動符合篩選條件
              <button type="button" className="link-btn" onClick={resetFilters}>清除篩選</button>
            </p>
          )}

          {filteredFeatured.length > 0 && (
            <section className="strip">
              <div className="strip-head"><h2>熱門活動</h2><a href="#more-events" className="see-all">查看全部 <Icon id="i-chevron" size={14} /></a></div>
              <div className="card-scroll">
                {filteredFeatured.map((ev) => <EventCard key={ev.id} ev={ev} filters={filters} />)}
              </div>
            </section>
          )}

          {filteredUrgent.length > 0 && (
            <section className="strip">
              <div className="strip-head">
                <h2>臨打專區 <span className="badge live"><i />急徵隊友</span></h2>
                <a href="#more-events" className="see-all">查看全部 <Icon id="i-chevron" size={14} /></a>
              </div>
              <div className="urgent-grid">
                {filteredUrgent.map((ev) => (
                  <article key={ev.id} className="card urgent-card">
                    <div className="card-top"><span className="badge live"><i />{ev.badgeLabel}</span></div>
                    <Link to={`/event/${ev.id}`}><h3>{ev.title}</h3></Link>
                    <ul className="meta">
                      <li><Icon id="i-pin" size={14} />{ev.loc}</li>
                      <li><Icon id="i-clock" size={14} />{ev.date} {ev.time}</li>
                      <li><Icon id="i-users" size={14} />{ev.registered} / {ev.capacity} 人</li>
                    </ul>
                    <div className="card-foot"><span className="price">NT${ev.price}</span><Link to={`/event/${ev.id}`} className="btn-cta urgent">立刻加入</Link></div>
                  </article>
                ))}
              </div>
            </section>
          )}

          <section className="strip" id="more-events">
            <div className="strip-head"><h2>更多活動</h2><span className="result-count">{filteredMore.length} 場符合條件</span></div>
            {filteredMore.length === 0 ? (
              <p className="empty-state">沒有符合篩選條件的活動，試試調整篩選項目。</p>
            ) : (
              <div className="event-grid">
                {filteredMore.map((ev) => <EventCard key={ev.id} ev={ev} filters={filters} />)}
              </div>
            )}
          </section>
        </main>
      </div>

      <SiteFooter />
      <BottomTabs active="explore" />
      <FilterModal
        open={filterOpen}
        onClose={() => setFilterOpen(false)}
        filters={filters}
        onChange={handleChange}
        onReset={resetFilters}
        resultCount={totalCount}
      />
    </>
  )
}
