import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { Icon } from '../components/Icons'
import RegisterModal from '../components/RegisterModal'
import { isFull } from '../data/events'
import { useBookings } from '../context/BookingsContext'
import { usePreferences } from '../context/PreferencesContext'
import { useFavorites } from '../context/FavoritesContext'
import { useHistory } from '../context/HistoryContext'
import { useEvents } from '../context/EventsContext'
import { DIMENSION_LABEL, getMatchResult, MATCH_STATE_META } from '../utils/matchState'
import { downloadEventIcs, hasCalendarDate } from '../utils/ics'
import { formatPrice } from '../utils/format'
import '../styles/detail.css'
import '../styles/modals.css'

const PAYMENT_METHOD = '現場付款'

function eventValueLabel(ev, key) {
  if (key === 'price') return formatPrice(ev.price, ev.free)
  return ev[key]
}

function bannerSubtext(match) {
  if (match.full) return '這場活動目前已額滿，你可以加入候補名單'
  if (match.state === 'match') return '這個活動符合你目前設定的篩選條件'
  if (match.state === 'partial') return '這個活動符合你設定的部分篩選條件'
  return '有些條件是主辦方未限制或尚待確認，請詳閱活動資訊再決定'
}

export default function EventDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { addBooking } = useBookings()
  const { filters } = usePreferences()
  const { isFavorite, toggleFavorite } = useFavorites()
  const { recordView } = useHistory()
  const { events, getEventById, adjustRegistered } = useEvents()
  const [modalOpen, setModalOpen] = useState(false)
  const [reasonsOpen, setReasonsOpen] = useState(false)
  const [shareCopied, setShareCopied] = useState(false)

  const event = getEventById(id) || events[0]
  const full = isFull(event)
  const priceLabel = formatPrice(event.price, event.free)
  const match = getMatchResult(event, filters)
  const favorited = isFavorite(event.id)

  useEffect(() => {
    recordView(event.id)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [event.id])

  async function handleShare() {
    const shareData = { title: event.title, text: `${event.title}・${event.date}`, url: window.location.href }
    if (navigator.share) {
      try { await navigator.share(shareData) } catch { /* user cancelled the share sheet */ }
      return
    }
    if (navigator.clipboard) {
      await navigator.clipboard.writeText(shareData.url)
      setShareCopied(true)
      setTimeout(() => setShareCopied(false), 2000)
    }
  }

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
    // A waitlisted signup doesn't occupy a real slot — only a pending/
    // confirmed registration actually moves the headcount.
    if (!full) {
      const headcount = registrant.mode === 'team' ? (registrant.teamSize || 1) : 1
      adjustRegistered(event.id, headcount)
    }
    setModalOpen(false)
    navigate('/bookings')
  }

  return (
    <>
      <header className="detail-header">
        <Link to="/explore" className="icon-btn" aria-label="返回探索頁"><Icon id="i-back" size={19} /></Link>
        <span>活動詳情</span>
        <div className="header-actions">
          <button
            className={`icon-btn ghost${favorited ? ' active-fav' : ''}`}
            aria-label={favorited ? '取消收藏' : '收藏'}
            aria-pressed={favorited}
            onClick={() => toggleFavorite(event.id)}
          >
            <Icon id="i-heart" size={18} />
          </button>
          <button className="icon-btn ghost" aria-label={shareCopied ? '連結已複製' : '分享'} onClick={handleShare}>
            <Icon id={shareCopied ? 'i-check' : 'i-share'} size={18} />
          </button>
        </div>
      </header>

      <div className="detail-layout">
        <main className="detail-main">
          {match ? (
            <div className={`match-banner ${MATCH_STATE_META[match.state].tone}`}>
              <Icon id={match.state === 'match' ? 'i-check' : 'i-info'} size={20} />
              <div><b>{MATCH_STATE_META[match.state].label}</b><span>{bannerSubtext(match)}</span></div>
              <button type="button" className="link-btn reason-toggle" onClick={() => setReasonsOpen((v) => !v)}>
                查看比對依據
              </button>
            </div>
          ) : full ? (
            <div className="match-banner wait">
              <Icon id="i-info" size={20} />
              <div><b>目前活動已額滿</b><span>你可以加入候補名單，若有名額釋出主辦單位會主動聯繫</span></div>
            </div>
          ) : null}

          {match && reasonsOpen && (
            <div className="reason-panel">
              <h3>比對依據</h3>
              <ul className="reason-panel-list">
                {match.criteria.map((c) => (
                  <li key={c.key}>
                    <Icon id={c.met ? 'i-check' : 'i-info'} size={16} className={c.met ? 'ok' : 'muted'} />
                    <div>
                      <b>{DIMENSION_LABEL[c.key]}</b>
                      <span>你的篩選：{filters[c.key]}　活動：{c.unspecified ? `主辦方未限制${DIMENSION_LABEL[c.key]}` : eventValueLabel(event, c.key)}</span>
                    </div>
                  </li>
                ))}
                <li>
                  <Icon id={match.full ? 'i-info' : 'i-check'} size={16} className={match.full ? 'muted' : 'ok'} />
                  <div><b>名額</b><span>{match.full ? '已額滿' : `尚有名額（${event.registered}/${event.capacity}）`}</span></div>
                </li>
              </ul>
              <p className="reason-disclaimer">比對結果依你目前設定的篩選條件計算，實際活動內容與程度以主辦方說明為準。</p>
            </div>
          )}

          <div className="detail-title-row">
            <div>
              <h1>{event.title}</h1>
              <div className="tag-row">
                <span className="tag level">{event.level}</span>
                {event.rating != null && <span className="rating"><Icon id="i-star" size={14} />{event.rating}</span>}
              </div>
            </div>
            {event.badgeLabel && <span className="badge featured lg">{event.badgeLabel}</span>}
          </div>

          <section className="info-card">
            <h2>活動資訊</h2>
            <ul className="info-list">
              <li><Icon id="i-pin" size={18} /><div><b>活動地點</b><span>{event.loc}</span><a href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(event.loc)}`} target="_blank" rel="noopener noreferrer">在 Google 地圖開啟 →</a></div></li>
              <li><Icon id="i-calendar" size={18} /><div><b>活動日期</b><span>{event.date}</span></div></li>
              <li><Icon id="i-clock" size={18} /><div><b>活動時間</b><span>{event.time}{event.endTime ? `–${event.endTime}` : ''}</span></div></li>
              <li><Icon id="i-users" size={18} /><div><b>參加人數</b><span>{event.registered} / {event.capacity} 人{full ? '（已額滿）' : ''}</span></div></li>
              <li><Icon id="i-info" size={18} /><div><b>活動費用</b><span>{priceLabel}</span></div></li>
              <li><Icon id="i-shield" size={18} /><div><b>付款方式</b><span>{PAYMENT_METHOD}</span></div></li>
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
