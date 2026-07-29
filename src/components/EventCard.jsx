import { Link, useLocation } from 'react-router-dom'
import { Icon } from './Icons'
import { useFavorites } from '../context/FavoritesContext'
import { useCompare } from '../context/CompareContext'
import { formatPrice } from '../utils/format'
import { formatEventDateLabel } from '../utils/date'
import { getCityLabel, getLevelLabel } from '../constants/taxonomy'
import { EVENT_STATUS, EVENT_STATUS_META, getEventStatus } from '../utils/eventStatus'
import { buildFromState } from '../utils/navigation'
import { getPositionShortageSummary } from '../utils/positionShortage'
import { getEventInformationQuality } from '../utils/informationQuality'

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
  const { isCompared, toggleCompare } = useCompare()
  const compared = isCompared(ev.id)
  const isUrgent = variant === 'urgent'
  const shortage = isUrgent && !inactive && !full ? getPositionShortageSummary(ev) : null
  const infoQuality = getEventInformationQuality(ev)
  const location = useLocation()
  const linkState = buildFromState(location)

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
            <i />急徵隊友{shortage ? `・${shortage.text}` : ''}
          </span>
        ) : ev.isFeatured ? (
          <span className="badge featured">精選</span>
        ) : <span aria-hidden="true" />}
        <div className="card-actions">
          <button
            className={`icon-btn ghost${compared ? ' active-compare' : ''}`}
            aria-label={compared ? '從比較中移除' : '加入比較'}
            aria-pressed={compared}
            onClick={() => toggleCompare(ev.id)}
          >
            <Icon id="i-compare" size={16} />
          </button>
          <button
            className={`icon-btn ghost${favorited ? ' active-fav' : ''}`}
            aria-label={favorited ? '取消收藏' : '收藏'}
            aria-pressed={favorited}
            onClick={() => toggleFavorite(ev.id)}
          >
            <Icon id="i-heart" size={16} />
          </button>
        </div>
      </div>
      <Link to={`/event/${ev.id}`} state={linkState}><h3>{ev.title}</h3></Link>
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
      {!inactive && infoQuality.state !== 'complete' && (
        <p className={`info-quality-hint${infoQuality.state === 'needsInfo' ? ' needs-info' : ''}`}>
          <Icon id="i-info" size={12} />{infoQuality.label}
        </p>
      )}
      <div className="card-foot">
        <span className={`price${ev.price === 0 ? ' free' : ''}`}>{formatPrice(ev.price)}</span>
        {inactive ? (
          <span className="btn-cta waitlist" aria-disabled="true">{ctaLabel}</span>
        ) : (
          <Link to={`/event/${ev.id}`} state={linkState} className={`btn-cta${full ? ' waitlist' : ''}${isUrgent && !full ? ' urgent' : ''}`}>{ctaLabel}</Link>
        )}
      </div>
    </article>
  )
}
