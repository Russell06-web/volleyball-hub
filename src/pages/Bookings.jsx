import { useState } from 'react'
import { Link } from 'react-router-dom'
import Header from '../components/Header'
import BottomTabs from '../components/BottomTabs'
import SiteFooter from '../components/SiteFooter'
import { Icon } from '../components/Icons'
import '../styles/bookings.css'

const TABS = ['全部 (5)', '待確認 (2)', '已確認 (2)', '已完成 (1)']
const TAB_TONES = ['', 'warn', 'ok', '']

const BOOKINGS = [
  { title: '高手對決賽', status: '待確認', tone: 'warn', level: '高階', loc: '新北運動中心', date: '2025-12-16', time: '20:00–23:00', org: '新北排球聯盟', phone: '0922-456-789', price: 'NT$350', action: 'cancel' },
  { title: '海灘排球日', status: '待確認', tone: 'warn', level: '高階', loc: '淡水沙灘', date: '2025-12-21', time: '10:00–16:00', org: '陽光排球會', phone: '0955-789-012', price: 'NT$200', action: 'cancel' },
  { title: '週末排球大戰', status: '已確認', tone: 'ok', level: '中階', loc: '台北市立體育館', date: '2025-12-12', time: '19:00–21:00', org: '台北排球俱樂部', phone: '0912-345-678', price: 'NT$280', action: 'detail' },
  { title: '排球新手體驗', status: '已完成', tone: 'done', level: '初階', loc: '台北體育館', date: '2025-11-30', time: '14:00–17:00', org: '新手排球教室', phone: '0933-222-111', price: '免費', free: true, action: 'review', done: true },
]

export default function Bookings() {
  const [tab, setTab] = useState(0)

  return (
    <>
      <Header title="我的報名" subtitle="管理你的活動" active="bookings" />

      <main className="content">
        <div className="stats-strip">
          <div className="stat-tile"><b>5</b><span>全部</span></div>
          <div className="stat-tile warn"><b>2</b><span>待確認</span></div>
          <div className="stat-tile ok"><b>2</b><span>已確認</span></div>
          <div className="stat-tile"><b>1</b><span>已完成</span></div>
        </div>

        <div className="chip-row tab-filter">
          {TABS.map((label, i) => (
            <button key={label} type="button" className={`chip ${TAB_TONES[i]}${i === tab ? ' active' : ''}`} onClick={() => setTab(i)}>{label}</button>
          ))}
        </div>

        <div className="booking-grid">
          {BOOKINGS.map((b) => (
            <article key={b.title} className={`card booking-item${b.done ? ' done' : ''}`}>
              <div className="card-top"><h3>{b.title}</h3><span className={`badge ${b.tone}`}>{b.status}</span></div>
              <div className="tag-row"><span className="tag level">{b.level}</span></div>
              <ul className="meta box">
                <li><Icon id="i-pin" size={14} />{b.loc}</li>
                <li><Icon id="i-calendar" size={14} />{b.date}</li>
                <li><Icon id="i-clock" size={14} />{b.time}</li>
              </ul>
              <div className="organizer-row">
                <div><b>主辦單位</b><span>{b.org}</span></div>
                <div><b>聯絡電話</b><span>{b.phone}</span></div>
              </div>
              <div className="card-foot">
                <span className={`price${b.free ? ' free' : ''}`}>{b.price}</span>
                {b.action === 'cancel' && (
                  <button className="btn-cta danger"><Icon id="i-back" size={13} />取消</button>
                )}
                {b.action === 'detail' && (
                  <Link to="/event" className="btn-secondary sm">查看詳情</Link>
                )}
                {b.action === 'review' && (
                  <button className="btn-secondary sm">給予評價</button>
                )}
              </div>
            </article>
          ))}
        </div>
      </main>

      <SiteFooter />
      <BottomTabs active="bookings" />
    </>
  )
}
