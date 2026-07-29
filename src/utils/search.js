import { getCityLabel, getLevelLabel, getTypeLabel } from '../constants/taxonomy'
import { getPlayStyleLabel } from '../constants/volleyballTaxonomy'

// trim + lowercase + collapse internal whitespace, so "  Taipei   Cup " and
// "taipei cup" search the same way and a phone-keyboard double-space
// doesn't silently produce zero results.
export function normalizeSearchQuery(value) {
  return String(value || '').trim().toLowerCase().replace(/\s+/g, ' ')
}

// Splits a normalised query into individual keywords — "台北 中階" becomes
// ["台北", "中階"], both of which must appear somewhere in the event's
// searchable text (in any order, not necessarily adjacent) for a match.
function toSearchTerms(rawQuery) {
  const normalized = normalizeSearchQuery(rawQuery)
  return normalized ? normalized.split(' ') : []
}

// Every field a person might reasonably type to find an event again:
// title, type/level as their display labels (not the enum value), venue,
// city, address, organiser, and playStyle.
export function matchesSearch(event, rawQuery) {
  const terms = toSearchTerms(rawQuery)
  if (terms.length === 0) return true

  const haystack = [
    event.title,
    getTypeLabel(event.type),
    getLevelLabel(event.level),
    event.venueName,
    getCityLabel(event.city),
    event.address,
    event.organizerName,
    getPlayStyleLabel(event.playStyle),
  ]
    .filter(Boolean)
    .join(' ')
    .toLowerCase()

  // AND semantics: every keyword must be found somewhere, not just one of
  // them — otherwise "台北 中階" would match anything in Taipei OR
  // anything intermediate-level, which isn't what typing two words means.
  return terms.every((term) => haystack.includes(term))
}
