import { EVENT_STATUS } from '../constants/taxonomy'
import { isPastEvent } from './date'

export { EVENT_STATUS }

// Explore, EventCard, EventDetail, Bookings, and Manage all used to work
// out "is this full / cancelled / done" with their own slightly different
// checks — none of which accounted for an event's date simply having
// passed. One function, one set of rules, checked in this order:
//   1. cancelled  — organiser-set, always wins
//   2. draft      — organiser-set, only ever visible in Manage
//   3. completed  — organiser-set (e.g. manually closed out)
//   4. expired    — the event's own end time has passed (Asia/Taipei) but
//                   nobody ever flipped its status — still reported as
//                   "completed" to callers, since the distinction between
//                   "closed manually" and "just ran out the clock" isn't
//                   meaningful to a visitor
//   5. full       — never stored — always derived from registeredCount
//                   vs capacity so it can't drift out of sync
//   6. published  — everything else
export function getEventStatus(event, now = new Date()) {
  if (!event) return null
  if (event.status === EVENT_STATUS.CANCELLED) return EVENT_STATUS.CANCELLED
  if (event.status === EVENT_STATUS.DRAFT) return EVENT_STATUS.DRAFT
  if (event.status === EVENT_STATUS.COMPLETED) return EVENT_STATUS.COMPLETED
  if (isPastEvent(event, now)) return EVENT_STATUS.COMPLETED
  if (event.registeredCount >= event.capacity) return EVENT_STATUS.FULL
  return EVENT_STATUS.PUBLISHED
}

export function isRegistrable(event, now = new Date()) {
  return getEventStatus(event, now) === EVENT_STATUS.PUBLISHED
}

export function isWaitlistable(event, now = new Date()) {
  return getEventStatus(event, now) === EVENT_STATUS.FULL
}

export function getRemainingSlots(event) {
  if (!event) return 0
  return Math.max(0, event.capacity - event.registeredCount)
}

// The one gate Explore (and only Explore) applies before search/filter/
// sort ever run: drafts are Manage-only, cancelled/completed/expired
// events don't belong in a "what can I join" list, but a full event still
// does (its detail page and waitlist are still reachable and relevant).
export function isPubliclyVisible(event, now = new Date()) {
  const status = getEventStatus(event, now)
  return status === EVENT_STATUS.PUBLISHED || status === EVENT_STATUS.FULL
}

export const EVENT_STATUS_META = {
  [EVENT_STATUS.DRAFT]: { label: '草稿', tone: 'wait' },
  [EVENT_STATUS.PUBLISHED]: { label: '報名中', tone: 'ok' },
  [EVENT_STATUS.FULL]: { label: '已額滿', tone: 'warn' },
  [EVENT_STATUS.CANCELLED]: { label: '已取消', tone: 'done' },
  [EVENT_STATUS.COMPLETED]: { label: '已結束', tone: 'done' },
}
