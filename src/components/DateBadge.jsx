import { getDateBadgeParts } from '../utils/date'

// Purely decorative visual anchor — aria-hidden because the full,
// screen-reader-readable date always exists elsewhere on the same card
// (the .meta-date line / detail hero), so this never becomes the only
// place the date is available. Used on the Featured lead card and the
// urgent Timeline, where a quick scan benefits from a number to land on
// before reading the rest of the row.
export default function DateBadge({ date, size = 'md' }) {
  const parts = getDateBadgeParts(date)
  if (!parts) return null
  return (
    <div className={`date-badge ${size}`} aria-hidden="true">
      <span className="date-badge-day">{parts.day}</span>
      <span className="date-badge-weekday">{parts.weekday}</span>
    </div>
  )
}
