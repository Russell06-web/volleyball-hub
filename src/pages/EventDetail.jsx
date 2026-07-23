import { useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { Icon } from '../components/Icons'
import RegisterModal from '../components/RegisterModal'
import { EVENTS, getEventById, isFull } from '../data/events'
import { useBookings } from '../context/BookingsContext'
import { downloadEventIcs, hasCalendarDate } from '../utils/ics'
import '../styles/detail.css'
import '../styles/modals.css'

export default function EventDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { addBooking } = useBookings()
  const [modalOpen, setModalOpen] = useState(false)

  const event = getEventById(id) || EVENTS[0]
  const full = isFull(event)
  const priceLabel = event.free ? '免費' : `NT$${event.price}`

  function handleConfirm(registrant) {
    addBooking({
      eventId: event.id,
      title: event.title,
      status: full ? 'waitlist' : 'pending',
      level: event.level,
      loc: event.loc,
      date: event.date,
      time: `${event.time}${event.endTime ? `–${event.endTime}` : ''}`,
      org: event.org,
      phone: event.phone,
      price: priceLabel,
      free: event.free,
      registrant,
    })
    setModalOpen(false)
    navigate('/bookings')
  }

  return (
    <>
      <header className="detail-header">
        <Link to="/explore" className="icon-btn" aria-label="返回探索頁"><Icon id="i-back" size={19} /></Link>
        <span>活動詳情</span>
        <div className="header-actions">
          <button className="icon-btn ghost" aria-label="收藏"><Icon id="i-heart" size={18} /></button>
          <button className="icon-btn ghost" aria-label="分享"><Icon id="i-share" size={18} /></button>
        </div>
      </header>

      <div className="detail-layout">
        <main className="detail-main">
          {full ? (
            <div className="match-banner wait">
              <Icon id="i-info" size={20} />
              <div><b>目前活動已額滿</b><span>你可以加入候補名單，若有名額釋出主辦單位會主動聯繫</span></div>
            </div>
          ) : (
            <div className="match-banner">
              <Icon id="i-check" size={20} />
              <div><b>非常適合你！</b><span>根據你的資料，這個活動很適合你</span></div>
              <b className="match-pct">85%</b>
            </div>
          )}

          <div className="detail-title-row">
            <div>
              <h1>{event.title}</h1>
              <div className="tag-row"><span className="tag level">{event.level}</span><span className="rating"><Icon id="i-star" size={14} />{event.rating}</span></div>
            </div>
            {event.badgeLabel && <span className="badge featured lg">{event.badgeLabel}</span>}
          </div>

          <section className="info-card">
            <h2>活動資訊</h2>
            <ul className="info-list">
              <li><Icon id="i-pin" size={18} /><div><b>活動地點</b><span>{event.loc}</span><a href="#top">查看地圖 →</a></div></li>
              <li><Icon id="i-calendar" size={18} /><div><b>活動日期</b><span>{event.date}</span></div></li>
              <li><Icon id="i-clock" size={18} /><div><b>活動時間</b><span>{event.time}{event.endTime ? `–${event.endTime}` : ''}</span></div></li>
              <li><Icon id="i-users" size={18} /><div><b>參加人數</b><span>{event.registered} / {event.capacity} 人{full ? '（已額滿）' : ''}</span></div></li>
            </ul>
          </section>

          <section>
            <h2>活動亮點</h2>
            <div className="highlight-grid">
              <div className="highlight blue"><Icon id="i-shield" size={20} /><b>保險保障</b><span>含活動期間保險</span></div>
              <div className="highlight green"><Icon id="i-whistle" size={20} /><b>專業教練</b><span>現場指導</span></div>
              <div className="highlight purple"><Icon id="i-users" size={20} /><b>友善氛圍</b><span>歡迎新手</span></div>
              <div className="highlight orange"><Icon id="i-trend" size={20} /><b>技能提升</b><span>實戰演練</span></div>
            </div>
          </section>

          <section>
            <h2>活動描述</h2>
            <p className="desc">{event.description}</p>
            <div className="notice">
              <Icon id="i-info" size={18} />
              <div><b>活動須知</b><ul><li>請穿著運動服裝及球鞋</li><li>自備飲水及毛巾</li><li>提前 10 分鐘到場報到</li></ul></div>
            </div>
          </section>
        </main>

        <aside className="booking-card">
          <div className="booking-price"><span className="price">{priceLabel}</span><span>包含場地費、器材使用費</span></div>
          <ul className="booking-mini">
            <li><Icon id="i-users" size={15} />已報名 {event.registered} / {event.capacity} 人</li>
            <li><Icon id="i-calendar" size={15} />{event.date}・{event.time}</li>
          </ul>
          <button className="btn-primary full" onClick={() => setModalOpen(true)}>{full ? '加入候補名單' : '立即報名'}</button>
          {hasCalendarDate(event) && (
            <button className="btn-secondary full" onClick={() => downloadEventIcs(event)}>
              <Icon id="i-calendar" size={15} />加入行事曆
            </button>
          )}
          <Link to="/explore" className="btn-secondary full">返回首頁</Link>
        </aside>
      </div>

      <div className="sticky-cta detail-cta">
        <Link to="/explore" className="btn-secondary">返回首頁</Link>
        <button className="btn-primary" onClick={() => setModalOpen(true)}>{full ? '加入候補名單' : `立即報名 · ${priceLabel}`}</button>
      </div>

      <RegisterModal event={event} open={modalOpen} onClose={() => setModalOpen(false)} onConfirm={handleConfirm} />
    </>
  )
}
