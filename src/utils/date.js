const WEEKDAYS = ['週日', '週一', '週二', '週三', '週四', '週五', '週六']

function pad(n) {
  return String(n).padStart(2, '0')
}

// Volleyball Hub is a Taiwan-only demo, so "what date/time is it right
// now" always means Asia/Taipei, regardless of what timezone the visitor's
// own device or browser is set to. `new Date().toISOString().slice(0,10)`
// gives the UTC date, which is wrong for roughly a third of the day
// (00:00–08:00 Taipei time is still "yesterday" in UTC) — exactly the
// window where a "今天" pickup game would otherwise misreport its own date.
const TAIPEI_DATE_FORMATTER = new Intl.DateTimeFormat('en-CA', {
  timeZone: 'Asia/Taipei', year: 'numeric', month: '2-digit', day: '2-digit',
})
const TAIPEI_DATETIME_FORMATTER = new Intl.DateTimeFormat('en-CA', {
  timeZone: 'Asia/Taipei', year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', hour12: false,
})

export function getTaipeiDateString(date = new Date()) {
  return TAIPEI_DATE_FORMATTER.format(date) // en-CA formats as YYYY-MM-DD
}

export function getTaipeiNowParts(date = new Date()) {
  const parts = TAIPEI_DATETIME_FORMATTER.formatToParts(date)
  const map = {}
  parts.forEach((p) => { map[p.type] = p.value })
  // Some ICU builds render midnight as hour "24" — normalise back to "00"
  // so the resulting string still sorts correctly.
  const hour = map.hour === '24' ? '00' : map.hour
  return { date: `${map.year}-${map.month}-${map.day}`, time: `${hour}:${map.minute}` }
}

// Day-arithmetic anchored to Taipei's calendar date, not the runtime's own
// local timezone. Reads "today" via Asia/Taipei, then does the +N days
// math against a UTC-flagged Date built from those Y/M/D components —
// using Date.UTC (and reading back with getUTC*) sidesteps the calling
// device's own timezone/DST rules entirely, so a browser in UTC-8 or
// UTC+14 computes exactly the same seed dates as one in Taipei. Taiwan
// itself hasn't observed DST since 1979, so there's no local ambiguity to
// worry about on the Taipei side either.
export function addDaysInTaipei(daysFromNow, referenceDate = new Date()) {
  const [y, m, d] = getTaipeiDateString(referenceDate).split('-').map(Number)
  return new Date(Date.UTC(y, m - 1, d + daysFromNow))
}

// Dates are generated relative to "today" (Taipei) so the demo never
// ships with events that have already happened — a hardcoded 2025-12-12
// etc. goes stale the moment the calendar turns the page.
export function futureDate(daysFromNow, referenceDate = new Date()) {
  const d = addDaysInTaipei(daysFromNow, referenceDate)
  return `${d.getUTCFullYear()}-${pad(d.getUTCMonth() + 1)}-${pad(d.getUTCDate())}`
}

// Same idea, but also returns the weekday label and a short "MM/DD" for
// compact date-picker cards (used by the create-event wizard).
export function futureDateWithLabel(daysFromNow, referenceDate = new Date()) {
  const d = addDaysInTaipei(daysFromNow, referenceDate)
  return {
    date: `${d.getUTCFullYear()}-${pad(d.getUTCMonth() + 1)}-${pad(d.getUTCDate())}`,
    dow: WEEKDAYS[d.getUTCDay()],
    md: `${pad(d.getUTCMonth() + 1)}/${pad(d.getUTCDate())}`,
  }
}

// A "今天" pickup-game label should only ever be decided against Taipei's
// own calendar date, never the browser's local date or UTC.
export function formatEventDateLabel(dateStr, now = new Date()) {
  return dateStr === getTaipeiDateString(now) ? '今天' : dateStr
}

// One event has ended once "now" (Taipei time) reaches or passes its end
// time (or start time, if no end time is set) on its scheduled date.
// Plain string comparison works because both sides are zero-padded
// "YYYY-MM-DD HH:mm".
export function getEventEndDateTime(event) {
  if (!event?.date) return null
  const time = event.endTime || event.startTime || '23:59'
  return `${event.date} ${time}`
}

export function isPastEvent(event, now = new Date()) {
  const end = getEventEndDateTime(event)
  if (!end) return false
  const nowParts = getTaipeiNowParts(now)
  // <= on purpose: an event is considered over the moment its end time is
  // reached, not only strictly after it.
  return end <= `${nowParts.date} ${nowParts.time}`
}
