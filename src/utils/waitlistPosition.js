// Honest, purely-local waitlist ordering — computed from this browser's
// own booking records, never claimed as a synced/authoritative queue (see
// docs/PRODUCT_LIMITATIONS.md). Ordered by createdAt; a tie (which can
// legitimately happen — Date.now() has millisecond resolution and two
// bookings could in theory land in the same tick) breaks on id so the
// order is always stable and reproducible, never dependent on Array
// iteration order.
export function getWaitlistPosition(bookings, eventId, bookingId) {
  const waitlisted = (bookings || [])
    .filter((b) => b.eventId === eventId && b.status === 'waitlist')
    .slice()
    .sort((a, b) => {
      if (a.createdAt !== b.createdAt) return a.createdAt - b.createdAt
      if (a.id < b.id) return -1
      if (a.id > b.id) return 1
      return 0
    })

  const index = waitlisted.findIndex((b) => b.id === bookingId)
  return index === -1 ? null : index + 1
}
