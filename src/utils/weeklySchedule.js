import { addDaysInTaipei, getTaipeiDateString } from './date'
import { getRelativeTaipeiDateLabel } from './groupEventsByTaipeiDate'

// "我的本週球局" — this visitor's own bookings (any status: registered/
// waitlisted/cancelled/completed all included, per the spec) whose event
// falls within the next 7 days (today..+6, Asia/Taipei), grouped by date.
// A booking only ever stores its eventId (see BookingsContext.jsx), so the
// live event is always looked up fresh here too — an organiser edit to the
// date/title is reflected immediately, never a stale copy.
export function getWeeklyScheduleGroups(bookings, events, now = new Date()) {
  const todayStr = getTaipeiDateString(now)
  const weekEndStr = getTaipeiDateString(addDaysInTaipei(6, now))
  const eventsById = new Map((events || []).map((e) => [e.id, e]))

  const byDate = new Map()
  ;(bookings || []).forEach((booking) => {
    const event = eventsById.get(booking.eventId)
    if (!event || !event.date) return
    if (event.date < todayStr || event.date > weekEndStr) return
    if (!byDate.has(event.date)) byDate.set(event.date, [])
    byDate.get(event.date).push({ booking, event })
  })

  return [...byDate.keys()].sort().map((date) => {
    const entries = byDate.get(date).slice().sort((a, b) => (a.event.startTime || '').localeCompare(b.event.startTime || ''))
    return { date, label: getRelativeTaipeiDateLabel(date, now), entries }
  })
}
