import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { Icon, LogoMark } from '../components/Icons'
import RegisterModal from '../components/RegisterModal'
import { useBookings } from '../context/BookingsContext'
import { usePreferences } from '../context/PreferencesContext'
import { useFavorites } from '../context/FavoritesContext'
import { useHistory } from '../context/HistoryContext'
import { useEvents } from '../context/EventsContext'
import { useToast } from '../context/ToastContext'
import { DIMENSION_LABEL, getMatchResult, MATCH_STATE_META } from '../utils/matchState'
import { downloadEventIcs, hasCalendarDate } from '../utils/ics'
import { formatPrice } from '../utils/format'
import { getCityLabel, getGenderLabel, getLevelLabel, getPriceBracketLabel, getTypeLabel } from '../constants/taxonomy'
import { EVENT_STATUS, EVENT_STATUS_META, getEventStatus, isWaitlistable } from '../utils/eventStatus'
import { planRegistration } from '../services/registrationService'
import '../styles/detail.css'
import '../styles/modals.css'
import '../styles/notfound.css'

function eventValueLabel(ev, key) {
  if (key === 'price') return formatPrice(ev.price)
  if (key === 'type') return getTypeLabel(ev.type)
  if (key === 'level') return getLevelLabel(ev.level)
  if (key === 'gender') return getGenderLabel(ev.gender)
  if (key === 'city') return getCityLabel(ev.city)
  return ev[key]
}

// Filters store a price *bracket* ("underOrEqual300"), not a number, so it needs
// its own label lookup rather than formatPrice — sharing eventValueLabel
// for both sides of the "你的篩選 / 活動" comparison would try to format
// a bracket string as if it were a price.
function filterValueLabel(key, value) {
  if (key === 'price') return getPriceBracketLabel(value)
  if (key === 'type') return getTypeLabel(value)
  if (key === 'level') return getLevelLabel(value)
  if (key === 'gender') return getGenderLabel(value)
  if (key === 'city') return getCityLabel(value)
  return value
}

function bannerSubtext(match) {
  if (match.full) return '這場活動目前已額滿，你可以加入候補名單'
  if (match.state === 'match') return '這個活動符合你目前設定的篩選條件'
  if (match.state === 'partial') return '這個活動符合你設定的部分篩選條件'
  return '有些條件是主辦方未限制或尚待確認，請詳閱活動資訊再決定'
}

function EventNotFound() {
  const navigate = useNavigate()
  useEffect(() => { document.title = '找不到此活動｜Volleyball Hub' }, [])
  return (
    <div className="event-notfound">
      <span className="notfound-mark"><LogoMark width={36} height={47} /></span>
      <h1>找不到此活動</h1>
      <p>這場活動可能已經被移除，或網址不正確。</p>
      <div className="notfound-actions">
        <Link to="/explore" className="btn-primary"><Icon id="i-home" size={16} />返回探索活動</Link>
        <button type="button" className="btn-secondary" onClick={() => navigate(-1)}><Icon id="i-back" size={16} />返回上一頁</button>
      </div>
    </div>
  )
}

export default function EventDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { addBooking, hasActiveBooking, hasWaitlistBooking, bookings } = useBookings()
  const { filters } = usePreferences()
  const { isFavorite, toggleFavorite } = useFavorites()
  const { recordView } = useHistory()
  const { getEventById, updateEvent } = useEvents()
  const { showToast } = useToast()
  const [modalOpen, setModalOpen] = useState(false)
  const [reasonsOpen, setReasonsOpen] = useState(false)

  const event = getEventById(id)

  useEffect(() => {
    if (event) recordView(event.id)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [event?.id])

  useEffect(() => {
    document.title = event ? `${event.title}｜Volleyball Hub` : '找不到此活動｜Volleyball Hub'
  }, [event])

  if (!event) return <EventNotFound />

  const status = getEventStatus(event)
  const cancelled = status === EVENT_STATUS.CANCELLED
  const completed = status === EVENT_STATUS.COMPLETED
  const full = isWaitlistable(event)
  const priceLabel = formatPrice(event.price)
  const match = !cancelled && !completed ? getMatchResult(event, filters) : null
  const favorited = isFavorite(event.id)
  const alreadyActive = hasActiveBooking(event.id)
  const alreadyWaitlist = hasWaitlistBooking(event.id)
  const hasHighlights = event.hasInsurance || event.hasCoach || event.playStyle || (event.features && event.features.length > 0)

  async function handleShare() {
    const shareData = { title: event.title, text: `${event.title}・${event.date}`, url: window.location.href }
    if (navigator.share) {
      try {
        await navigator.share(shareData)
      } catch (err) {
        if (err?.name !== 'AbortError') showToast('分享失敗，請稍後再試')
      }
      return
    }
    if (navigator.clipboard) {
      try {
        await navigator.clipboard.writeText(shareData.url)
        showToast('連結已複製')
      } catch {
        showToast('複製連結失敗，請手動複製網址列')
      }
    } else {
      showToast('這個瀏覽器不支援分享或複製連結')
    }
  }

  function handleCtaClick() {
    if (alreadyActive) { showToast('你已報名此活動'); return }
    if (alreadyWaitlist) { showToast('你已加入候補'); return }
    setModalOpen(true)
  }

  function handleConfirm(registrant) {
    const plan = planRegistration(event, bookings, registrant)
    if (!plan.ok) {
      showToast(plan.message)
      return
    }
    if (plan.eventPatch) updateEvent(event.id, plan.eventPatch)
    addBooking({
      eventId: event.id,
      status: plan.bookingStatus,
      participantCount: plan.participantCount,
      registrant,
    })
    setModalOpen(false)
    showToast(plan.bookingStatus === 'waitlist' ? '已加入候補名單' : '報名成功')
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
          <button className="icon-btn ghost" aria-label="分享" onClick={handleShare}>
            <Icon id="i-share" size={18} />
          </button>
        </div>
      </header>

      <div className="detail-layout">
        <main className="detail-main">
          {cancelled ? (
            <div className="match-banner warn">
              <Icon id="i-info" size={20} />
              <div><b>這場活動已取消</b><span>主辦方已取消此活動，目前無法報名。已報名的紀錄可以在「我的報名」查看取消狀態。</span></div>
            </div>
          ) : completed ? (
            <div className="match-banner wait">
              <Icon id="i-info" size={20} />
              <div><b>這場活動已結束</b><span>活動時間已過，目前無法再報名。</span></div>
            </div>
          ) : match ? (
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
              <div><b>目前活動已額滿</b><span>候補為目前瀏覽器中的原型示範狀態，不會自動遞補或發送通知。</span></div>
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
                      <span>你的篩選：{filterValueLabel(c.key, filters[c.key])}　活動：{c.unspecified ? `主辦方未限制${DIMENSION_LABEL[c.key]}，仍需自行確認` : eventValueLabel(event, c.key)}</span>
                    </div>
                  </li>
                ))}
                <li>
                  <Icon id={match.full ? 'i-info' : 'i-check'} size={16} className={match.full ? 'muted' : 'ok'} />
                  <div><b>名額</b><span>{match.full ? '已額滿' : `尚有名額（${event.registeredCount}/${event.capacity}）`}</span></div>
                </li>
              </ul>
              <p className="reason-disclaimer">比對結果依你目前設定的篩選條件計算，實際活動內容與程度以主辦方說明為準。</p>
            </div>
          )}

          <div className="detail-title-row">
            <div>
              <h1>{event.title}</h1>
              <div className="tag-row">
                {event.level !== 'open' && <span className="tag level">{getLevelLabel(event.level)}</span>}
                {(cancelled || completed) && <span className={`badge ${EVENT_STATUS_META[status].tone}`}>{EVENT_STATUS_META[status].label}</span>}
              </div>
            </div>
          </div>

          <section className="info-card">
            <h2>活動資訊</h2>
            <ul className="info-list">
              <li><Icon id="i-pin" size={18} /><div><b>活動地點</b><span>{event.venueName}</span><a href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(event.address || event.venueName)}`} target="_blank" rel="noopener noreferrer">在 Google 地圖開啟 →</a></div></li>
              <li><Icon id="i-calendar" size={18} /><div><b>活動日期</b><span>{event.date}</span></div></li>
              <li><Icon id="i-clock" size={18} /><div><b>活動時間</b><span>{event.startTime}{event.endTime ? `–${event.endTime}` : ''}</span></div></li>
              <li><Icon id="i-users" size={18} /><div><b>參加人數</b><span>{event.registeredCount} / {event.capacity} 人{full ? '（已額滿）' : ''}</span></div></li>
              <li><Icon id="i-info" size={18} /><div><b>活動費用</b><span>{priceLabel}</span></div></li>
              <li><Icon id="i-shield" size={18} /><div><b>付款方式</b><span>{event.price === 0 ? '無需付款' : (event.paymentMethod || '現場付款')}</span></div></li>
            </ul>
          </section>

          {hasHighlights && (
            <section>
              <h2>活動亮點</h2>
              <div className="highlight-grid">
                {event.hasInsurance && <div className="highlight blue"><Icon id="i-shield" size={20} /><b>保險保障</b><span>含活動期間保險</span></div>}
                {event.hasCoach && <div className="highlight green"><Icon id="i-whistle" size={20} /><b>專業教練</b><span>現場指導</span></div>}
                {event.playStyle && <div className="highlight purple"><Icon id="i-users" size={20} /><b>活動風格</b><span>{event.playStyle}</span></div>}
                {event.features?.map((f) => (
                  <div key={f} className="highlight orange"><Icon id="i-trend" size={20} /><b>{f}</b></div>
                ))}
              </div>
            </section>
          )}

          <section>
            <h2>活動描述</h2>
            <p className="desc">{event.description}</p>
            {event.rules && (
              <div className="notice">
                <Icon id="i-info" size={18} />
                <div><b>活動須知</b><p>{event.rules}</p></div>
              </div>
            )}
          </section>
        </main>

        <aside className="booking-card">
          <div className="booking-price"><span className="price">{priceLabel}</span>{event.feeNote && <span>{event.feeNote}</span>}</div>
          <ul className="booking-mini">
            <li><Icon id="i-users" size={15} />已報名 {event.registeredCount} / {event.capacity} 人</li>
            <li><Icon id="i-calendar" size={15} />{event.date}・{event.startTime}</li>
          </ul>
          {cancelled || completed ? (
            <button className="btn-secondary full" disabled>{EVENT_STATUS_META[status].label}，無法報名</button>
          ) : (
            <button className="btn-primary full" onClick={handleCtaClick} disabled={alreadyActive || alreadyWaitlist}>
              {alreadyActive ? '你已報名此活動' : alreadyWaitlist ? '你已加入候補' : full ? '加入候補名單' : '立即報名'}
            </button>
          )}
          {hasCalendarDate(event) && !cancelled && (
            <button className="btn-secondary full" onClick={() => downloadEventIcs(event)}>
              <Icon id="i-calendar" size={15} />加入行事曆
            </button>
          )}
          <Link to="/explore" className="btn-secondary full">返回首頁</Link>
        </aside>
      </div>

      {!cancelled && !completed && (
        <div className="sticky-cta detail-cta">
          <Link to="/explore" className="btn-secondary">返回首頁</Link>
          <button className="btn-primary" onClick={handleCtaClick} disabled={alreadyActive || alreadyWaitlist}>
            {alreadyActive ? '你已報名此活動' : alreadyWaitlist ? '你已加入候補' : full ? '加入候補名單' : `立即報名 · ${priceLabel}`}
          </button>
        </div>
      )}

      <RegisterModal event={event} open={modalOpen} onClose={() => setModalOpen(false)} onConfirm={handleConfirm} />
    </>
  )
}
