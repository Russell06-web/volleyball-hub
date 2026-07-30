import { Link, useLocation } from 'react-router-dom'
import { Icon } from './Icons'
import DateBadge from './DateBadge'
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
import { getEventInformationQuality } from '../utils/informationQuality'

// Shared by Explore, Favorites, and History — one definition so a
// favorite toggled in one place is styled identically everywhere it
// shows up, and so "is this full/cancelled/done" is always the same
// getEventStatus() call instead of each card re-deriving it.
//
// Three real variants — 'default' (Standard) / 'featured' / 'urgent' —
// change visual weight only (background tint, which facts get emphasis,
// CTA prominence). Every rule underneath (status, full → waitlist,
// cancelled/completed → disabled, favorites, compare, a11y labels, and
// which data fields exist at all) is identical across all three: there
// is no separate FeaturedCard/UrgentCard component, and no variant ever
// sees a business-logic path the others don't.
//
// Condition-match ("符合目前條件" etc.) intentionally does NOT appear
// here — Explore's filters already decide which events are in this list
// at all, so repeating that judgement per-card would just be restating
// the filter result. The full comparison against the user's filters
// lives on EventDetail, where it's actually new information.
// `compact` only ever applies alongside variant="featured" — the two
// secondary slots in the asymmetric Featured layout (see Explore.jsx),
// where the same card just carries less visual weight than the lead. It
// changes CSS only (see .featured-card.compact), never which data or
// business logic runs.
export default function EventCard({ ev, variant = 'default', compact = false }) {
  const status = getEventStatus(ev)
  const full = status === EVENT_STATUS.FULL
  const inactive = status === EVENT_STATUS.CANCELLED || status === EVENT_STATUS.COMPLETED
  const { isFavorite, toggleFavorite } = useFavorites()
  const favorited = isFavorite(ev.id)
  const { isCompared, toggleCompare } = useCompare()
  const compared = isCompared(ev.id)
  const isUrgent = variant === 'urgent'
  const isFeatured = variant === 'featured'
  const shortage = isUrgent && !inactive && !full ? getPositionShortageSummary(ev) : null
  const infoQuality = getEventInformationQuality(ev)
  const location = useLocation()
  const linkState = buildFromState(location)

  const ctaLabel = inactive
    ? EVENT_STATUS_META[status].label
    : full
      ? '候補'
      : isUrgent ? '立刻加入' : '報名'

  // Tier-2 tags (程度/場地/網高/球制) — capped at what the card can hold
  // without turning into a wall of chips; level/city are the two most
  // decision-relevant facts so they always show when meaningful, net
  // height only shows once an organiser has actually specified it.
  const netHeightKnown = ev.netHeight && ev.netHeight !== NET_HEIGHT_UNSPECIFIED

  return (
    <article className={`card event-card${isUrgent ? ' urgent-card' : ''}${isFeatured ? ' featured-card' : ''}${isFeatured && compact ? ' compact' : ''}`}>
      <div className="card-top">
        {isUrgent ? (
          <span className="badge live"><i />急徵隊友</span>
        ) : isFeatured ? (
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
      {isFeatured ? (
        <div className="card-title-row">
          <DateBadge date={ev.date} />
          <Link to={`/event/${ev.id}`} state={linkState} className="card-title-row-text"><h3>{ev.title}</h3></Link>
        </div>
      ) : (
        <>
          <Link to={`/event/${ev.id}`} state={linkState}><h3>{ev.title}</h3></Link>
          {shortage && <p className="shortage-row"><Icon id="i-info" size={12} />{shortage.text}</p>}
        </>
      )}
      <div className="tag-row">
        {ev.level !== 'open' && <span className="tag level">{getLevelLabel(ev.level)}</span>}
        <span className="tag type">{getCityLabel(ev.city)}</span>
        {/* Volleyball-specific detail tags only compete for space when the
            event is actually joinable — a cancelled/full card needs its
            status tag to stand out, not share the row with 4+ tags. */}
        {!inactive && !full && netHeightKnown && <span className="tag detail">{getNetHeightLabel(ev.netHeight)}</span>}
        {!inactive && !full && <span className="tag detail">{getVolleyballFormatLabel(ev.volleyballFormat)}</span>}
        {inactive && <span className="tag wait">{EVENT_STATUS_META[status].label}</span>}
        {!inactive && full && <span className="tag wait">已額滿</span>}
      </div>
      <ul className="meta">
        <li><Icon id="i-pin" size={14} /><span>{ev.venueName}</span></li>
        <li className="meta-date"><Icon id="i-calendar" size={14} />{formatEventDateLabel(ev.date)}・{ev.startTime}</li>
        {/* Featured/Urgent get the full capacity bar (see CapacityBar.jsx);
            Standard keeps the plain count — a deliberately simplified
            version, not every card needs the same visual weight here. */}
        {isFeatured || isUrgent ? (
          <li className="meta-capacity"><CapacityBar event={ev} /></li>
        ) : (
          <li><Icon id="i-users" size={14} />{ev.registeredCount} / {ev.capacity} 人</li>
        )}
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
          <Link to={`/event/${ev.id}`} state={linkState} className={`btn-cta${full ? ' waitlist' : ''}${isUrgent && !full ? ' urgent' : ''}${isFeatured && !full ? ' featured' : ''}`}>{ctaLabel}</Link>
        )}
      </div>
    </article>
  )
}
