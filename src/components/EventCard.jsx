import { Link } from 'react-router-dom'
import { Icon } from './Icons'
import { useFavorites } from '../context/FavoritesContext'
import { formatPrice } from '../utils/format'
import { formatEventDateLabel } from '../utils/date'
import { getCityLabel, getLevelLabel } from '../constants/taxonomy'
import { EVENT_STATUS, EVENT_STATUS_META, getEventStatus, getRemainingSlots } from '../utils/eventStatus'

// Shared by Explore, Favorites, and History — one definition so a
// favorite toggled in one place is styled identically everywhere it
// shows up, and so "is this full/cancelled/done" is always the same
// getEventStatus() call instead of each card re-deriving it.
//
// `variant="urgent"` only changes visual presentation (badge, CTA
// colour/label) for the 臨打專區 strip — every rule underneath (status,
// full → waitlist, cancelled/completed → disabled, favorites, a11y
// labels) is identical to the default card. There is no separate
// UrgentCard component anymore.
//
// Condition-match ("符合目前條件" etc.) intentionally does NOT appear
// here — Explore's filters already decide which events are in this list
// at all, so repeating that judgement per-card would just be restating
// the filter result. The full comparison against the user's filters
// lives on EventDetail, where it's actually new information.
export default function EventCard({ ev, variant = 'default' }) {
  const status = getEventStatus(ev)
  const full = status === EVENT_STATUS.FULL
  const inactive = status === EVENT_STATUS.CANCELLED || status === EVENT_STATUS.COMPLETED
  const { isFavorite, toggleFavorite } = useFavorites()
  const favorited = isFavorite(ev.id)
  const isUrgent = variant === 'urgent'
  const remaining = getRemainingSlots(ev)

  const ctaLabel = inactive
    ? EVENT_STATUS_META[status].label
    : full
      ? '候補'
      : isUrgent ? '立刻加入' : '報名'

  return (
    <article className={`card event-card${isUrgent ? ' urgent-card' : ''}`}>
      <div className="card-top">
        {isUrgent ? (
          <span className="badge live">
            <i />急徵隊友{!inactive && !full && remaining > 0 ? `・還缺 ${remaining} 人` : ''}
          </span>
        ) : ev.isFeatured ? (
          <span className="badge featured">精選</span>
        ) : <span aria-hidden="true" />}
        <button
          className={`icon-btn ghost${favorited ? ' active-fav' : ''}`}
          aria-label={favorited ? '取消收藏' : '收藏'}
          aria-pressed={favorited}
          onClick={() => toggleFavorite(ev.id)}
        >
          <Icon id="i-heart" size={16} />
        </button>
      </div>
      <Link to={`/event/${ev.id}`}><h3>{ev.title}</h3></Link>
      <div className="tag-row">
        {ev.level !== 'open' && <span className="tag level">{getLevelLabel(ev.level)}</span>}
        <span className="tag type">{getCityLabel(ev.city)}</span>
        {inactive && <span className="tag wait">{EVENT_STATUS_META[status].label}</span>}
        {!inactive && full && <span className="tag wait">已額滿</span>}
      </div>
      <ul className="meta">
        <li><Icon id="i-pin" size={14} />{ev.venueName}</li>
        <li><Icon id="i-calendar" size={14} />{formatEventDateLabel(ev.date)}・{ev.startTime}</li>
        <li><Icon id="i-users" size={14} />{ev.registeredCount} / {ev.capacity} 人</li>
      </ul>
      <div className="card-foot">
        <span className={`price${ev.price === 0 ? ' free' : ''}`}>{formatPrice(ev.price)}</span>
        {inactive ? (
          <span className="btn-cta waitlist" aria-disabled="true">{ctaLabel}</span>
        ) : (
          <Link to={`/event/${ev.id}`} className={`btn-cta${full ? ' waitlist' : ''}${isUrgent && !full ? ' urgent' : ''}`}>{ctaLabel}</Link>
        )}
      </div>
    </article>
  )
}
