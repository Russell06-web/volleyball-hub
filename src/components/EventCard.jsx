import { Link } from 'react-router-dom'
import { Icon } from './Icons'
import { useFavorites } from '../context/FavoritesContext'
import { getMatchResult, MATCH_STATE_META } from '../utils/matchState'
import { formatPrice } from '../utils/format'
import { getCityLabel, getLevelLabel } from '../constants/taxonomy'
import { EVENT_STATUS, EVENT_STATUS_META, getEventStatus } from '../utils/eventStatus'

// Shared card used by Explore, Favorites, and History — one definition
// so a favorite toggled in one place is styled identically everywhere
// it shows up.
export default function EventCard({ ev, filters }) {
  const status = getEventStatus(ev)
  const full = status === EVENT_STATUS.FULL
  const inactive = status === EVENT_STATUS.CANCELLED || status === EVENT_STATUS.COMPLETED
  const match = filters && !inactive ? getMatchResult(ev, filters) : null
  const { isFavorite, toggleFavorite } = useFavorites()
  const favorited = isFavorite(ev.id)

  return (
    <article className="card event-card">
      <div className="card-top">
        {ev.isFeatured && <span className="badge featured">精選</span>}
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
        {inactive && <span className={`tag wait`}>{EVENT_STATUS_META[status].label}</span>}
        {!inactive && full && <span className="tag wait">已額滿</span>}
      </div>
      {match && (
        <div className="match-block">
          <span className={`badge ${MATCH_STATE_META[match.state].tone}`}>{MATCH_STATE_META[match.state].label}</span>
          <div className="match-reasons">
            {match.reasons.map((r) => <span key={r} className="tag reason">{r}</span>)}
          </div>
        </div>
      )}
      <ul className="meta">
        <li><Icon id="i-pin" size={14} />{ev.venueName}</li>
        <li><Icon id="i-calendar" size={14} />{ev.date}・{ev.startTime}</li>
        <li><Icon id="i-users" size={14} />{ev.registeredCount} / {ev.capacity} 人</li>
      </ul>
      <div className="card-foot">
        <span className={`price${ev.price === 0 ? ' free' : ''}`}>{formatPrice(ev.price)}</span>
        {inactive ? (
          <span className="btn-cta waitlist" aria-disabled="true">{EVENT_STATUS_META[status].label}</span>
        ) : (
          <Link to={`/event/${ev.id}`} className={`btn-cta${full ? ' waitlist' : ''}`}>{full ? '候補' : '報名'}</Link>
        )}
      </div>
    </article>
  )
}
