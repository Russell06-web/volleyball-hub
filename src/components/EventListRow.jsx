import { Link, useLocation } from 'react-router-dom'
import { Icon } from './Icons'
import CapacityBar from './CapacityBar'
import { useFavorites } from '../context/FavoritesContext'
import { useCompare } from '../context/CompareContext'
import { formatPrice } from '../utils/format'
import { formatEventDateLabel } from '../utils/date'
import { getCityLabel, getLevelLabel } from '../constants/taxonomy'
import { getNetHeightLabel, getVolleyballFormatLabel, NET_HEIGHT_UNSPECIFIED } from '../constants/volleyballTaxonomy'
import { EVENT_STATUS, EVENT_STATUS_META, getEventStatus } from '../utils/eventStatus'
import { buildFromState } from '../utils/navigation'
import { getPositionShortageSummary } from '../utils/positionShortage'

// The List-mode counterpart to EventCard — same status/favorite/compare/
// CTA business logic (getEventStatus, useFavorites, useCompare, the same
// price/date formatters), just a single compact row instead of a card, so
// switching Grid<->List never means two different sources of truth for
// what a "full" or "cancelled" event looks like. Mobile stacks the row's
// pieces vertically (see .event-list-row in explore.css) but never grows
// back into a second full card treatment.
//
// `urgent` reuses this exact same row for the Timeline (see
// UrgentTimeline.jsx) instead of forking a second component/business-logic
// path — it only adds the short status badge and a separate shortage line,
// never a duplicate of the shared data above.
export default function EventListRow({ ev, urgent = false }) {
  const status = getEventStatus(ev)
  const full = status === EVENT_STATUS.FULL
  const inactive = status === EVENT_STATUS.CANCELLED || status === EVENT_STATUS.COMPLETED
  const { isFavorite, toggleFavorite } = useFavorites()
  const favorited = isFavorite(ev.id)
  const { isCompared, toggleCompare } = useCompare()
  const compared = isCompared(ev.id)
  const location = useLocation()
  const linkState = buildFromState(location)
  const netHeightKnown = ev.netHeight && ev.netHeight !== NET_HEIGHT_UNSPECIFIED
  const shortage = urgent && !inactive && !full ? getPositionShortageSummary(ev) : null
  const ctaLabel = inactive ? EVENT_STATUS_META[status].label : full ? '候補' : urgent ? '立刻加入' : '報名'

  return (
    <article className="event-list-row">
      <div className="event-list-when">
        <span className="event-list-date">{formatEventDateLabel(ev.date)}</span>
        <span className="event-list-time">{ev.startTime}</span>
      </div>
      <div className="event-list-main">
        {urgent && <span className="badge live event-list-badge"><i />急徵隊友</span>}
        <Link to={`/event/${ev.id}`} state={linkState} className="event-list-title">{ev.title}</Link>
        {shortage && <p className="shortage-row"><Icon id="i-info" size={12} />{shortage.text}</p>}
        <div className="tag-row">
          {ev.level !== 'open' && <span className="tag level">{getLevelLabel(ev.level)}</span>}
          <span className="tag type">{getCityLabel(ev.city)}</span>
          {!inactive && !full && netHeightKnown && <span className="tag detail">{getNetHeightLabel(ev.netHeight)}</span>}
          {!inactive && !full && <span className="tag detail">{getVolleyballFormatLabel(ev.volleyballFormat)}</span>}
          {inactive && <span className="tag wait">{EVENT_STATUS_META[status].label}</span>}
        </div>
        <p className="event-list-venue"><Icon id="i-pin" size={13} />{ev.venueName}</p>
      </div>
      <div className="event-list-capacity"><CapacityBar event={ev} /></div>
      <div className="event-list-actions">
        <span className={`price${ev.price === 0 ? ' free' : ''}`}>{formatPrice(ev.price)}</span>
        <button
          className={`icon-btn ghost sm${compared ? ' active-compare' : ''}`}
          aria-label={compared ? '從比較中移除' : '加入比較'}
          aria-pressed={compared}
          onClick={() => toggleCompare(ev.id)}
        >
          <Icon id="i-compare" size={14} />
        </button>
        <button
          className={`icon-btn ghost sm${favorited ? ' active-fav' : ''}`}
          aria-label={favorited ? '取消收藏' : '收藏'}
          aria-pressed={favorited}
          onClick={() => toggleFavorite(ev.id)}
        >
          <Icon id="i-heart" size={14} />
        </button>
        {inactive ? (
          <span className="btn-cta waitlist sm" aria-disabled="true">{ctaLabel}</span>
        ) : (
          <Link to={`/event/${ev.id}`} state={linkState} className={`btn-cta sm${full ? ' waitlist' : ''}${urgent && !full ? ' urgent' : ''}`}>{ctaLabel}</Link>
        )}
      </div>
    </article>
  )
}
