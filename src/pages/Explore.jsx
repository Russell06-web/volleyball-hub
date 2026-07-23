import { useState } from 'react'
import { Link } from 'react-router-dom'
import Header from '../components/Header'
import BottomTabs from '../components/BottomTabs'
import SiteFooter from '../components/SiteFooter'
import FilterPanel from '../components/FilterPanel'
import FilterModal from '../components/FilterModal'
import { Icon } from '../components/Icons'
import { EVENTS, isFull } from '../data/events'
import '../styles/explore.css'

const FEATURED = EVENTS.filter((e) => e.section === 'featured')
const URGENT = EVENTS.filter((e) => e.section === 'urgent')
const MORE = EVENTS.filter((e) => e.section === 'more')

function EventCard({ ev }) {
  const full = isFull(ev)
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

  return (
    <>
      <Header title="排球探索" subtitle="發現精彩活動" active="explore" showSearch />

      <div className="layout">
        <aside className="filter-sidebar" aria-label="篩選活動">
          <FilterPanel />
        </aside>

        <main className="content">
          <div className="filter-chips-mobile" aria-label="快速篩選">
            <button className="chip primary active">全部</button>
            <button className="chip">排球</button>
            <button className="chip">沙灘排球</button>
            <button className="chip">室內排球</button>
            <button className="icon-btn filter-trigger" aria-label="更多篩選" aria-haspopup="dialog" onClick={() => setFilterOpen(true)}>
              <Icon id="i-filter" size={17} />
            </button>
          </div>

          <section className="strip">
            <div className="strip-head"><h2>熱門活動</h2><a href="#top" className="see-all">查看全部 <Icon id="i-chevron" size={14} /></a></div>
            <div className="card-scroll">
              {FEATURED.map((ev) => <EventCard key={ev.id} ev={ev} />)}
            </div>
          </section>

          <section className="strip">
            <div className="strip-head">
              <h2>臨打專區 <span className="badge live"><i />急徵隊友</span></h2>
              <a href="#top" className="see-all">查看全部 <Icon id="i-chevron" size={14} /></a>
            </div>
            <div className="urgent-grid">
              {URGENT.map((ev) => (
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

          <section className="strip">
            <div className="strip-head"><h2>更多活動</h2><span className="result-count">{MORE.length} 場符合條件</span></div>
            <div className="event-grid">
              {MORE.map((ev) => <EventCard key={ev.id} ev={ev} />)}
            </div>
          </section>
        </main>
      </div>

      <SiteFooter />
      <BottomTabs active="explore" />
      <FilterModal open={filterOpen} onClose={() => setFilterOpen(false)} />
    </>
  )
}
