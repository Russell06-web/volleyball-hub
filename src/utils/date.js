const WEEKDAYS = ['週日', '週一', '週二', '週三', '週四', '週五', '週六']

function pad(n) {
  return String(n).padStart(2, '0')
}

// Dates are generated relative to "today" so the demo never ships with
// events that have already happened — a hardcoded 2025-12-12 etc. goes
// stale the moment the calendar turns the page.
export function futureDate(daysFromNow) {
  const d = new Date()
  d.setDate(d.getDate() + daysFromNow)
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
}

// Same idea, but also returns the weekday label and a short "MM/DD" for
// compact date-picker cards (used by the create-event wizard).
export function futureDateWithLabel(daysFromNow) {
  const d = new Date()
  d.setDate(d.getDate() + daysFromNow)
  return {
    date: `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`,
    dow: WEEKDAYS[d.getDay()],
    md: `${pad(d.getMonth() + 1)}/${pad(d.getDate())}`,
  }
}
