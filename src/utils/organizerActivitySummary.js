import { EVENT_STATUS, getEventStatus } from './eventStatus'

// A verifiable count of this organiser's own local events — never a
// rating, review, or "trusted organiser" claim (see
// docs/PRODUCT_LIMITATIONS.md: there's no real account/verification
// system here). Draft events are excluded — they're only ever visible to
// the organiser themselves in Manage, so counting them into a
// visitor-facing summary would describe something the visitor could never
// actually have seen.
export function getOrganizerActivitySummary(events, ownerId) {
  const owned = (events || []).filter((e) => e.ownerId === ownerId)
  const summary = { total: 0, completed: 0, upcoming: 0, cancelled: 0 }

  owned.forEach((event) => {
    const status = getEventStatus(event)
    if (status === EVENT_STATUS.DRAFT) return
    summary.total += 1
    if (status === EVENT_STATUS.COMPLETED) summary.completed += 1
    else if (status === EVENT_STATUS.CANCELLED) summary.cancelled += 1
    else if (status === EVENT_STATUS.PUBLISHED || status === EVENT_STATUS.FULL) summary.upcoming += 1
  })

  return summary
}
