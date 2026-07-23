import { useState } from 'react'
import { Link } from 'react-router-dom'
import Header from '../components/Header'
import BottomTabs from '../components/BottomTabs'
import SiteFooter from '../components/SiteFooter'
import FilterPanel from '../components/FilterPanel'
import FilterModal from '../components/FilterModal'
import { Icon } from '../components/Icons'
import '../styles/explore.css'

const FEATURED = [
  { tone: 'featured', label: '推薦', title: '週末排球大戰', level: '中階', type: '室內排球', loc: '台北市立體育館', when: '2025-12-12・19:00', people: '18 / 20 人', price: 'NT$280' },
  { tone: 'featured', label: '推薦', title: '高手對決之夜', level: '高階', type: '室內排球', loc: '新北運動中心', when: '2025-12-14・20:00', people: '14 / 16 人', price: 'NT$320' },
  { tone: 'female', label: '女生', title: '台北女子室內專場', level: '中階', type: '室內排球', loc: '大安運動中心', when: '2025-12-17・18:00', people: '12 / 16 人', price: 'NT$250' },
]

const MORE = [
  { tone: 'male', label: '男生', title: '板橋男子室內賽', type: '室內排球', loc: '板橋體育館', when: '2025-12-16・19:00', people: '8 / 12 人', price: 'NT$260' },
  { tone: 'mixed', label: '混合', title: '新北混合室內聯賽', type: '室內排球', loc: '新北運動中心', when: '2025-12-19・19:00', people: '16 / 18 人', price: 'NT$280' },
  { tone: 'male', label: '男生', title: '新北男子沙灘賽', type: '沙灘排球', loc: '福隆沙灘', when: '2025-12-20・14:00', people: '8 / 10 人', price: 'NT$220' },
  { tone: 'female', label: '女生', title: '三重女子室內賽', type: '室內排球', loc: '三重體育館', when: '2025-12-18・19:00', people: '6 / 10 人', price: 'NT$250' },
  { tone: 'mixed', label: '混合', title: '桃園混合沙灘賽', type: '沙灘排球', loc: '桃園沙灘場', when: '2025-12-20・14:00', people: '8 / 12 人', price: 'NT$200' },
  { tone: '', label: '親子', title: '親子排球同樂會', type: '排球', loc: '大安森林公園', when: '2025-12-23・09:00', people: '15 / 30 人', price: '免費', free: true },
]

function EventCard({ ev }) {
  return (
    <article className="card event-card">
      <div className="card-top">
        <span className={`badge ${ev.tone}`}>{ev.label}</span>
        <button className="icon-btn ghost" aria-label="收藏"><Icon id="i-heart" size={16} /></button>
      </div>
      <Link to="/event"><h3>{ev.title}</h3></Link>
      <div className="tag-row">
        {ev.level && <span className="tag level">{ev.level}</span>}
        <span className="tag type">{ev.type}</span>
      </div>
      <ul className="meta">
        <li><Icon id="i-pin" size={14} />{ev.loc}</li>
        <li><Icon id="i-calendar" size={14} />{ev.when}</li>
        <li><Icon id="i-users" size={14} />{ev.people}</li>
      </ul>
      <div className="card-foot">
        <span className={`price${ev.free ? ' free' : ''}`}>{ev.price}</span>
        <Link to="/event" className="btn-cta">報名</Link>
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
              {FEATURED.map((ev) => <EventCard key={ev.title} ev={ev} />)}
            </div>
          </section>

          <section className="strip">
            <div className="strip-head">
              <h2>臨打專區 <span className="badge live"><i />急徵隊友</span></h2>
              <a href="#top" className="see-all">查看全部 <Icon id="i-chevron" size={14} /></a>
            </div>
            <div className="urgent-grid">
              <article className="card urgent-card">
                <div className="card-top"><span className="badge live"><i />今晚缺打</span></div>
                <h3>還缺 3 人！</h3>
                <ul className="meta">
                  <li><Icon id="i-pin" size={14} />中正運動中心</li>
                  <li><Icon id="i-clock" size={14} />今晚 20:00</li>
                  <li><Icon id="i-users" size={14} />5 / 8 人</li>
                </ul>
                <div className="card-foot"><span className="price">NT$150</span><Link to="/event" className="btn-cta urgent">立刻加入</Link></div>
              </article>
              <article className="card urgent-card">
                <div className="card-top"><span className="badge live"><i />下午場</span></div>
                <h3>臨打湊團中</h3>
                <ul className="meta">
                  <li><Icon id="i-pin" size={14} />松山運動中心</li>
                  <li><Icon id="i-clock" size={14} />今天 15:00</li>
                  <li><Icon id="i-users" size={14} />6 / 10 人</li>
                </ul>
                <div className="card-foot"><span className="price">NT$120</span><Link to="/event" className="btn-cta urgent">立刻加入</Link></div>
              </article>
            </div>
          </section>

          <section className="strip">
            <div className="strip-head"><h2>更多活動</h2><span className="result-count">14 場符合條件</span></div>
            <div className="event-grid">
              {MORE.map((ev) => <EventCard key={ev.title} ev={ev} />)}
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
