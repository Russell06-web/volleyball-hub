import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import Header from '../components/Header'
import BottomTabs from '../components/BottomTabs'
import SiteFooter from '../components/SiteFooter'
import CancelModal from '../components/CancelModal'
import { Icon } from '../components/Icons'
import { useBookings } from '../context/BookingsContext'
import { useEvents } from '../context/EventsContext'
import '../styles/bookings.css'
import '../styles/modals.css'

const STATUS_META = {
  pending: { label: '待確認', tone: 'warn' },
  confirmed: { label: '已確認', tone: 'ok' },
  waitlist: { label: '候補中', tone: 'wait' },
  completed: { label: '已完成', tone: 'done' },
  cancelled: { label: '已取消', tone: 'done' },
}

const TABS = [
  { key: 'all', label: '全部' },
  { key: 'pending', label: '待確認' },
  { key: 'confirmed', label: '已確認' },
  { key: 'waitlist', label: '候補中' },
  { key: 'completed', label: '已完成' },
]

export default function Bookings() {
  const { bookings, cancelBooking, markReviewed } = useBookings()
  const { adjustRegistered } = useEvents()
  const [tab, setTab] = useState('all')
  const [cancelTarget, setCancelTarget] = useState(null)

  const counts = useMemo(() => {
    const c = { all: bookings.length, pending: 0, confirmed: 0, waitlist: 0, completed: 0 }
    bookings.forEach((b) => { if (c[b.status] !== undefined) c[b.status] += 1 })
    return c
  }, [bookings])

  const visible = tab === 'all' ? bookings : bookings.filter((b) => b.status === tab)

  function handleConfirmCancel(reason) {
    // A waitlisted booking never actually occupied a slot, so only
    // pending/confirmed cancellations free one back up.
    if (cancelTarget.eventId && (cancelTarget.status === 'pending' || cancelTarget.status === 'confirmed')) {
      const headcount = cancelTarget.registrant?.mode === 'team' ? (cancelTarget.registrant.teamSize || 1) : 1
      adjustRegistered(cancelTarget.eventId, -headcount)
    }
    cancelBooking(cancelTarget.id, reason)
    setCancelTarget(null)
  }

  return (
    <>
      <Header title="我的報名" subtitle="管理你的活動" active="bookings" />

      <main className="content">
        <div className="stats-strip">
          <div className="stat-tile"><b>{counts.all}</b><span>全部</span></div>
          <div className="stat-tile warn"><b>{counts.pending}</b><span>待確認</span></div>
          <div className="stat-tile ok"><b>{counts.confirmed}</b><span>已確認</span></div>
          <div className="stat-tile"><b>{counts.completed}</b><span>已完成</span></div>
        </div>

        <div className="chip-row tab-filter">
          {TABS.map((t) => (
            <button
              key={t.key}
              type="button"
              className={`chip ${STATUS_META[t.key]?.tone || ''}${tab === t.key ? ' active' : ''}`}
              onClick={() => setTab(t.key)}
            >
              {t.label} ({counts[t.key]})
            </button>
          ))}
        </div>

        {visible.length === 0 ? (
          <p style={{ color: 'var(--text-muted)', fontSize: 13.5, textAlign: 'center', padding: '32px 0' }}>這個分類目前沒有報名紀錄。</p>
        ) : (
          <div className="booking-grid">
            {visible.map((b) => {
              const meta = STATUS_META[b.status] || STATUS_META.pending
              const upcoming = b.status === 'pending' || b.status === 'confirmed' || b.status === 'waitlist'
              return (
                <article key={b.id} className={`card booking-item${b.status === 'cancelled' ? ' done' : ''}`}>
                  <div className="card-top"><h3>{b.title}</h3><span className={`badge ${meta.tone}`}>{meta.label}</span></div>
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
                  {b.status === 'cancelled' && b.cancelReason && (
                    <p style={{ fontSize: 12, color: 'var(--text-muted)', margin: 0 }}>取消原因：{b.cancelReason}</p>
                  )}
                  <div className="card-foot">
                    <span className={`price${b.free ? ' free' : ''}`}>{b.price}</span>
                    <div style={{ display: 'flex', gap: 8 }}>
                      {b.eventId && (
                        <Link to={`/event/${b.eventId}`} className="btn-secondary sm">查看詳情</Link>
                      )}
                      {upcoming && (
                        <button className="btn-cta danger" onClick={() => setCancelTarget(b)}><Icon id="i-back" size={13} />取消</button>
                      )}
                      {b.status === 'completed' && (
                        <button className="btn-secondary sm" disabled={b.reviewed} onClick={() => markReviewed(b.id)}>
                          {b.reviewed ? '已評價' : '給予評價'}
                        </button>
                      )}
                    </div>
                  </div>
                </article>
              )
            })}
          </div>
        )}
      </main>

      <SiteFooter />
      <BottomTabs active="bookings" />
      <CancelModal booking={cancelTarget} onClose={() => setCancelTarget(null)} onConfirm={handleConfirmCancel} />
    </>
  )
}
