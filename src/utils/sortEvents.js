import { getRemainingSlots } from './eventStatus'

// Pulled out of Explore.jsx so it's testable without rendering anything,
// and so "what does 即將額滿 mean" has exactly one definition.
export function sortEvents(list, sort) {
  const arr = [...list]
  switch (sort) {
    case 'dateAsc':
      return arr.sort((a, b) => String(a.date || '').localeCompare(String(b.date || '')))
    case 'priceAsc':
      return arr.sort((a, b) => a.price - b.price)
    case 'availability':
      return arr.sort((a, b) => getRemainingSlots(b) - getRemainingSlots(a))
    case 'almostFull':
      return arr.sort((a, b) => getRemainingSlots(a) - getRemainingSlots(b))
    default:
      return arr
  }
}
