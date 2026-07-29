import { getRemainingSlots } from './eventStatus'

function safeFillRate(ev) {
  const capacity = Number(ev.capacity)
  if (!Number.isFinite(capacity) || capacity <= 0) return 1 // invalid/zero capacity sorts as "fully booked", not NaN
  return Math.min(1, ev.registeredCount / capacity)
}

function byDateAsc(a, b) {
  return String(a.date || '').localeCompare(String(b.date || ''))
}

// Pulled out of Explore.jsx so it's testable without rendering anything,
// and so "what does 即將額滿 mean" has exactly one definition.
export function sortEvents(list, sort) {
  const arr = [...list]
  switch (sort) {
    case 'dateAsc':
      return arr.sort(byDateAsc)

    case 'priceAsc':
      return arr.sort((a, b) => a.price - b.price)

    case 'availability':
      return arr.sort((a, b) => getRemainingSlots(b) - getRemainingSlots(a))

    case 'almostFull': {
      // "即將額滿" means "still joinable, but filling up" — an already-full
      // event isn't "almost" full, it's done, so it belongs at the end,
      // not the front. Registrable events are ranked by fill rate
      // (registeredCount / capacity) descending, ties broken by soonest date.
      const registrable = arr.filter((e) => getRemainingSlots(e) > 0)
      const full = arr.filter((e) => getRemainingSlots(e) <= 0)
      registrable.sort((a, b) => safeFillRate(b) - safeFillRate(a) || byDateAsc(a, b))
      return [...registrable, ...full]
    }

    default:
      // An explainable default — urgent first, then featured, then
      // soonest date — never just "whatever order the array happened to
      // already be in".
      return arr.sort((a, b) => (
        (b.isUrgent ? 1 : 0) - (a.isUrgent ? 1 : 0)
        || (b.isFeatured ? 1 : 0) - (a.isFeatured ? 1 : 0)
        || byDateAsc(a, b)
      ))
  }
}
