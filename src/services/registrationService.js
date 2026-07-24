// Pure decision layer for register / cancel / cancel-waitlist. Nothing
// here touches React state or localStorage — each function takes the
// current event + bookings and returns a plan describing exactly what
// should change. EventDetail.jsx and Bookings.jsx just call these, check
// `ok`, and if true apply `eventPatch` (via EventsContext.updateEvent)
// and the booking write together — validation always happens before either
// side is written, so a rejected plan never leaves a partial update behind.
import { getRemainingSlots, isWaitlistable } from '../utils/eventStatus'

export function findActiveBooking(bookings, eventId) {
  return bookings.find((b) => b.eventId === eventId && (b.status === 'pending' || b.status === 'confirmed'))
}

export function findWaitlistBooking(bookings, eventId) {
  return bookings.find((b) => b.eventId === eventId && b.status === 'waitlist')
}

export function planRegistration(event, bookings, registrant) {
  if (findActiveBooking(bookings, event.id)) {
    return { ok: false, code: 'already-active', message: '你已報名此活動' }
  }
  if (findWaitlistBooking(bookings, event.id)) {
    return { ok: false, code: 'already-waitlist', message: '你已加入候補' }
  }

  const participantCount = registrant.mode === 'team' ? Number(registrant.teamSize) : 1
  const full = isWaitlistable(event)

  if (full) {
    return {
      ok: true,
      bookingStatus: 'waitlist',
      participantCount,
      eventPatch: { waitlistCount: (event.waitlistCount || 0) + 1 },
    }
  }

  const remaining = getRemainingSlots(event)
  if (participantCount > remaining) {
    return { ok: false, code: 'exceeds-capacity', message: `目前僅剩 ${remaining} 個名額，請調整隊伍人數。` }
  }

  return {
    ok: true,
    bookingStatus: 'pending',
    participantCount,
    eventPatch: { registeredCount: event.registeredCount + participantCount },
  }
}

export function planCancelBooking(event, booking) {
  if (!booking || booking.status === 'cancelled') {
    return { ok: false, code: 'already-cancelled', message: '此報名已經取消過了' }
  }

  if (booking.status === 'waitlist') {
    const eventPatch = event ? { waitlistCount: Math.max(0, (event.waitlistCount || 0) - 1) } : null
    return { ok: true, eventPatch }
  }

  if (booking.status === 'pending' || booking.status === 'confirmed') {
    const eventPatch = event
      ? { registeredCount: Math.max(0, event.registeredCount - booking.participantCount) }
      : null
    return { ok: true, eventPatch }
  }

  return { ok: false, code: 'not-cancellable', message: '此報名狀態無法取消' }
}
