function pad(n) {
  return String(n).padStart(2, '0')
}

function toIcsLocal(dateStr, timeStr) {
  const [y, m, d] = dateStr.split('-').map(Number)
  const [hh, mm] = timeStr.split(':').map(Number)
  return `${y}${pad(m)}${pad(d)}T${pad(hh)}${pad(mm)}00`
}

function escapeIcsText(value) {
  return String(value).replace(/([,;])/g, '\\$1').replace(/\n/g, '\\n')
}

// Only offer this for events with a real calendar date — "今晚"/"今天"
// pickup-game listings have no fixed date to anchor a calendar entry to.
export function hasCalendarDate(event) {
  return /^\d{4}-\d{2}-\d{2}$/.test(event.date)
}

export function downloadEventIcs(event) {
  if (!hasCalendarDate(event)) return

  const start = toIcsLocal(event.date, event.startTime)
  const end = toIcsLocal(event.date, event.endTime || event.startTime)
  const now = new Date()
  const stamp = `${now.getUTCFullYear()}${pad(now.getUTCMonth() + 1)}${pad(now.getUTCDate())}T${pad(now.getUTCHours())}${pad(now.getUTCMinutes())}${pad(now.getUTCSeconds())}Z`

  const lines = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Volleyball Hub//zh-Hant//EN',
    'CALSCALE:GREGORIAN',
    'BEGIN:VEVENT',
    `UID:${event.id}@volleyball-hub`,
    `DTSTAMP:${stamp}`,
    `DTSTART:${start}`,
    `DTEND:${end}`,
    `SUMMARY:${escapeIcsText(event.title)}`,
    `LOCATION:${escapeIcsText(event.venueName)}`,
    `DESCRIPTION:${escapeIcsText(event.description || '')}`,
    'END:VEVENT',
    'END:VCALENDAR',
  ]

  const blob = new Blob([lines.join('\r\n')], { type: 'text/calendar;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `${event.title}.ics`
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}
