import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import Header from '../components/Header'
import BottomTabs from '../components/BottomTabs'
import SiteFooter from '../components/SiteFooter'
import CancelModal from '../components/CancelModal'
import { Icon } from '../components/Icons'
import { useBookings } from '../context/BookingsContext'
import { useEvents } from '../context/EventsContext'
import { useToast } from '../context/ToastContext'
import { planCancelBooking } from '../services/registrationService'
import { EVENT_STATUS, getEventStatus } from '../utils/eventStatus'
import { formatPrice } from '../utils/format'
import { getLevelLabel } from '../constants/taxonomy'
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
  const { getEventById, updateEvent } = useEvents()
  const { showToast } = useToast()
  const [tab, setTab] = useState('all')
  const [cancelTarget, setCancelTarget] = useState(null)

  useEffect(() => {
    document.title = '我的報名｜Volleyball Hub'
  }, [])

  const counts = useMemo(() => {
    const c = { all: bookings.length, pending: 0, confirmed: 0, waitlist: 0, completed: 0 }
    bookings.forEach((b) => { if (c[b.status] !== undefined) c[b.status] += 1 })
    return c
  }, [bookings])

  const visible = tab === 'all' ? bookings : bookings.filter((b) => b.status === tab)
  const cancelTargetEvent = cancelTarget ? getEventById(cancelTarget.eventId) : null

  function handleConfirmCancel(reason) {
    const event = getEventById(cancelTarget.eventId)
    const plan = planCancelBooking(event, cancelTarget)
    if (!plan.ok) {
      showToast(plan.message)
      setCancelTarget(null)
      return
    }
    if (plan.eventPatch && event) updateEvent(event.id, plan.eventPatch)
    cancelBooking(cancelTarget.id, reason)
    setCancelTarget(null)
    showToast('已取消')
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

        <div className="chip-row tab-filter" role="tablist" aria-label="報名狀態篩選">
          {TABS.map((t) => (
            <button
              key={t.key}
              type="button"
              role="tab"
              aria-selected={tab === t.key}
              className={`chip ${STATUS_META[t.key]?.tone || ''}${tab === t.key ? ' active' : ''}`}
              onClick={() => setTab(t.key)}
            >
              {t.label} ({counts[t.key]})
            </button>
          ))}
        </div>

        {visible.length === 0 ? (
          <p className="empty-state">這個分類目前沒有報名紀錄。</p>
        ) : (
          <div className="booking-grid">
            {visible.map((b) => (
              <BookingCard
                key={b.id}
                booking={b}
                event={getEventById(b.eventId)}
                onCancel={() => setCancelTarget(b)}
                onReview={() => markReviewed(b.id)}
              />
            ))}
          </div>
        )}
      </main>

      <SiteFooter />
      <BottomTabs active="bookings" />
      <CancelModal booking={cancelTarget} event={cancelTargetEvent} onClose={() => setCancelTarget(null)} onConfirm={handleConfirmCancel} />
    </>
  )
}

function BookingCard({ booking: b, event, onCancel, onReview }) {
  const meta = STATUS_META[b.status] || STATUS_META.pending
  const upcoming = b.status === 'pending' || b.status === 'confirmed' || b.status === 'waitlist'
  const eventCancelled = event && getEventStatus(event) === EVENT_STATUS.CANCELLED

  if (!event) {
    return (
      <article className={`card booking-item done`}>
        <div className="card-top"><h3>活動資料已不存在</h3><span className={`badge ${meta.tone}`}>{meta.label}</span></div>
        <p className="empty-state">這場活動的資料已經被移除，無法顯示詳細資訊。</p>
      </article>
    )
  }

  return (
    <article className={`card booking-item${b.status === 'cancelled' ? ' done' : ''}`}>
      <div className="card-top"><h3>{event.title}</h3><span className={`badge ${meta.tone}`}>{meta.label}</span></div>
      {eventCancelled && b.status !== 'cancelled' && (
        <div className="warn-banner inline-warn">
          <Icon id="i-info" size={16} />
          <span>主辦方已取消這場活動</span>
        </div>
      )}
      <div className="tag-row">{event.level !== 'open' && <span className="tag level">{getLevelLabel(event.level)}</span>}</div>
      <ul className="meta box">
        <li><Icon id="i-pin" size={14} />{event.venueName}</li>
        <li><Icon id="i-calendar" size={14} />{event.date}</li>
        <li><Icon id="i-clock" size={14} />{event.startTime}{event.endTime ? `–${event.endTime}` : ''}</li>
        <li><Icon id="i-users" size={14} />{b.participantCount} 人{b.registrant?.mode === 'team' ? `（${b.registrant.teamName}）` : ''}</li>
      </ul>
      <div className="organizer-row">
        <div><b>主辦單位</b><span>{event.organizerName || '—'}</span></div>
        <div><b>聯絡電話</b><span>{event.organizerContact || '—'}</span></div>
      </div>
      {b.status === 'cancelled' && b.cancelReason && (
        <p className="cancel-reason-note">取消原因：{b.cancelReason}</p>
      )}
      <div className="card-foot">
        <span className={`price${event.price === 0 ? ' free' : ''}`}>{formatPrice(event.price)}</span>
        <div className="card-foot-actions">
          <Link to={`/event/${event.id}`} className="btn-secondary sm">查看詳情</Link>
          {upcoming && !eventCancelled && (
            <button className="btn-cta danger" onClick={onCancel}><Icon id="i-back" size={13} />取消</button>
          )}
          {b.status === 'completed' && (
            <button className="btn-secondary sm" disabled={b.reviewed} onClick={onReview}>
              {b.reviewed ? '已評價' : '給予評價'}
            </button>
          )}
        </div>
      </div>
    </article>
  )
}
