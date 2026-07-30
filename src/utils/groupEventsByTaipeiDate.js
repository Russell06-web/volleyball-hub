import { addDaysInTaipei, getTaipeiDateString } from './date'

const WEEKDAYS = ['週日', '週一', '週二', '週三', '週四', '週五', '週六']

// event.date is already a plain "YYYY-MM-DD" calendar date (see
// data/events.js) — parsed via Date.UTC rather than `new Date(dateStr)` so
// the weekday never shifts a day depending on the runtime's own local
// timezone (the whole point of anchoring everything to Asia/Taipei).
function formatShortDate(dateStr) {
  const [y, m, d] = dateStr.split('-').map(Number)
  const utcDate = new Date(Date.UTC(y, m - 1, d))
  return `${m} 月 ${d} 日・${WEEKDAYS[utcDate.getUTCDay()]}`
}

// Shared by groupEventsByTaipeiDate below and Bookings' 我的本週球局 (see
// weeklySchedule.js) — one place decides what "今天"/"明天" means so the
// two date-grouped views never disagree about which date is today.
export function getRelativeTaipeiDateLabel(dateStr, now = new Date()) {
  const today = getTaipeiDateString(now)
  const tomorrow = getTaipeiDateString(addDaysInTaipei(1, now))
  if (dateStr === today) return `今天・${formatShortDate(dateStr)}`
  if (dateStr === tomorrow) return `明天・${formatShortDate(dateStr)}`
  return formatShortDate(dateStr)
}

// Groups events by calendar date (Asia/Taipei), sorted ascending by date
// and, within a date, by startTime — used by both the "更多活動" section
// (date-grouped grid) and the urgent Timeline (今天/明天/其他日期). Events
// with no date at all are dropped rather than grouped under a fake key —
// there's nothing honest to show them under.
export function groupEventsByTaipeiDate(events, now = new Date()) {
  const byDate = new Map()
  ;(events || []).forEach((ev) => {
    if (!ev?.date) return
    if (!byDate.has(ev.date)) byDate.set(ev.date, [])
    byDate.get(ev.date).push(ev)
  })

  return [...byDate.keys()].sort().map((date) => {
    const dayEvents = byDate.get(date).slice().sort((a, b) => (a.startTime || '').localeCompare(b.startTime || ''))
    return { date, label: getRelativeTaipeiDateLabel(date, now), events: dayEvents }
  })
}
