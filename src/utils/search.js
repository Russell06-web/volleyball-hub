import { getCityLabel, getLevelLabel, getTypeLabel } from '../constants/taxonomy'

// trim + lowercase + collapse internal whitespace, so "  Taipei   Cup " and
// "taipei cup" search the same way and a phone-keyboard double-space
// doesn't silently produce zero results.
export function normalizeSearchQuery(value) {
  return String(value || '').trim().toLowerCase().replace(/\s+/g, ' ')
}

// Every field a person might reasonably type to find an event again:
// title, type/level as their display labels (not the enum value), venue,
// city, address, organiser, and playStyle.
export function matchesSearch(event, rawQuery) {
  const query = normalizeSearchQuery(rawQuery)
  if (!query) return true

  const haystack = [
    event.title,
    getTypeLabel(event.type),
    getLevelLabel(event.level),
    event.venueName,
    getCityLabel(event.city),
    event.address,
    event.organizerName,
    event.playStyle,
  ]
    .filter(Boolean)
    .join(' ')
    .toLowerCase()

  return haystack.includes(query)
}
