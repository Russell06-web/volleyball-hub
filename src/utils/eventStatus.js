import { EVENT_STATUS } from '../constants/taxonomy'

export { EVENT_STATUS }

// Explore, EventCard, EventDetail, Bookings, and Manage all used to work
// out "is this full / cancelled / done" with their own slightly different
// checks. One function, one set of rules: `status` on the record is the
// organiser-controlled state (draft/published/cancelled/completed);
// "full" is never stored — it's always derived from registeredCount vs
// capacity so it can't drift out of sync with the real headcount.
export function getEventStatus(event) {
  if (!event) return null
  if (event.status === EVENT_STATUS.CANCELLED) return EVENT_STATUS.CANCELLED
  if (event.status === EVENT_STATUS.COMPLETED) return EVENT_STATUS.COMPLETED
  if (event.status === EVENT_STATUS.DRAFT) return EVENT_STATUS.DRAFT
  if (event.registeredCount >= event.capacity) return EVENT_STATUS.FULL
  return EVENT_STATUS.PUBLISHED
}

export function isRegistrable(event) {
  return getEventStatus(event) === EVENT_STATUS.PUBLISHED
}

export function isWaitlistable(event) {
  return getEventStatus(event) === EVENT_STATUS.FULL
}

export function getRemainingSlots(event) {
  if (!event) return 0
  return Math.max(0, event.capacity - event.registeredCount)
}

export const EVENT_STATUS_META = {
  [EVENT_STATUS.DRAFT]: { label: '草稿', tone: 'wait' },
  [EVENT_STATUS.PUBLISHED]: { label: '報名中', tone: 'ok' },
  [EVENT_STATUS.FULL]: { label: '已額滿', tone: 'warn' },
  [EVENT_STATUS.CANCELLED]: { label: '已取消', tone: 'done' },
  [EVENT_STATUS.COMPLETED]: { label: '已結束', tone: 'done' },
}
