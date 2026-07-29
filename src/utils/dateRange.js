import { addDaysInTaipei, getTaipeiDateString } from './date'

export const DATE_RANGES = [
  { value: 'today', label: '今天' },
  { value: 'tomorrow', label: '明天' },
  { value: 'thisWeek', label: '本週' },
  { value: 'weekend', label: '週末' },
]

// A full custom date picker is deliberately out of scope for this pass —
// see docs/PRODUCT_LIMITATIONS.md / README roadmap — these four presets
// cover the common "when do I actually have time to play" question
// without the added UI surface of a calendar widget.
export function matchesDateRange(event, range, now = new Date()) {
  if (!range || range === 'all') return true
  if (!event?.date) return false

  const today = getTaipeiDateString(now)
  if (range === 'today') return event.date === today
  if (range === 'tomorrow') return event.date === getTaipeiDateString(addDaysInTaipei(1, now))
  if (range === 'thisWeek') {
    const end = getTaipeiDateString(addDaysInTaipei(6, now))
    return event.date >= today && event.date <= end
  }
  if (range === 'weekend') {
    for (let i = 0; i < 7; i += 1) {
      const d = addDaysInTaipei(i, now)
      const isWeekendDay = d.getUTCDay() === 0 || d.getUTCDay() === 6
      if (isWeekendDay && event.date === getTaipeiDateString(d)) return true
    }
    return false
  }
  return true
}
