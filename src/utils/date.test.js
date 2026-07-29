import { describe, expect, it } from 'vitest'
import {
  formatEventDateLabel, futureDate, futureDateWithLabel, getEventEndDateTime,
  getTaipeiDateString, getTaipeiNowParts, isPastEvent,
} from './date'

describe('futureDate', () => {
  it('returns a YYYY-MM-DD string that is actually in the future', () => {
    const today = new Date(); today.setHours(0, 0, 0, 0)
    const result = new Date(futureDate(5))
    expect(result.getTime()).toBeGreaterThan(today.getTime())
  })

  it('returns today for an offset of 0', () => {
    const today = new Date()
    const expected = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`
    expect(futureDate(0)).toBe(expected)
  })
})

describe('futureDateWithLabel', () => {
  it('returns a date string plus a matching weekday and short label', () => {
    const { date, dow, md } = futureDateWithLabel(3)
    expect(date).toMatch(/^\d{4}-\d{2}-\d{2}$/)
    expect(dow).toMatch(/^週[日一二三四五六]$/)
    expect(md).toMatch(/^\d{2}\/\d{2}$/)
  })
})

describe('getTaipeiDateString / getTaipeiNowParts', () => {
  it('returns a YYYY-MM-DD string regardless of the runtime\'s own timezone', () => {
    // 2026-03-01 16:30 UTC is already 2026-03-02 00:30 in Asia/Taipei
    // (UTC+8) — a naive toISOString().slice(0,10) would report the 1st.
    const utcMoment = new Date('2026-03-01T16:30:00Z')
    expect(getTaipeiDateString(utcMoment)).toBe('2026-03-02')
  })

  it('getTaipeiNowParts reports the Taipei-local date and time as zero-padded strings', () => {
    const utcMoment = new Date('2026-03-01T16:05:00Z')
    const parts = getTaipeiNowParts(utcMoment)
    expect(parts.date).toBe('2026-03-02')
    expect(parts.time).toBe('00:05')
  })
})

describe('formatEventDateLabel', () => {
  it('shows "今天" only when the date matches today in Asia/Taipei, not the raw string otherwise', () => {
    const now = new Date('2026-03-01T16:05:00Z') // 2026-03-02 in Taipei
    expect(formatEventDateLabel('2026-03-02', now)).toBe('今天')
    expect(formatEventDateLabel('2026-03-01', now)).toBe('2026-03-01')
  })
})

describe('getEventEndDateTime / isPastEvent', () => {
  it('prefers endTime, falls back to startTime, and null when there is no date at all', () => {
    expect(getEventEndDateTime({ date: '2026-01-01', startTime: '19:00', endTime: '21:00' })).toBe('2026-01-01 21:00')
    expect(getEventEndDateTime({ date: '2026-01-01', startTime: '19:00' })).toBe('2026-01-01 19:00')
    expect(getEventEndDateTime({})).toBeNull()
  })

  it('is not past while "now" (Taipei time) is still before the event\'s end time', () => {
    const event = { date: '2026-03-02', startTime: '19:00', endTime: '21:00' }
    const now = new Date('2026-03-02T10:00:00Z') // 2026-03-02 18:00 in Taipei — before 21:00
    expect(isPastEvent(event, now)).toBe(false)
  })

  it('becomes past the moment "now" (Taipei time) crosses the event\'s end time', () => {
    const event = { date: '2026-03-02', startTime: '19:00', endTime: '21:00' }
    const now = new Date('2026-03-02T13:01:00Z') // 2026-03-02 21:01 in Taipei — after 21:00
    expect(isPastEvent(event, now)).toBe(true)
  })

  it('a today event that has not ended yet is still not past, even in the small hours of Taipei morning', () => {
    // 2026-03-01 23:30 UTC is 2026-03-02 07:30 in Taipei — well before a
    // same-day 20:00 event has even started. A naive UTC date check
    // would misreport this as "yesterday" and could wrongly mark it past.
    const event = { date: '2026-03-02', startTime: '20:00', endTime: '22:00' }
    const now = new Date('2026-03-01T23:30:00Z')
    expect(isPastEvent(event, now)).toBe(false)
  })
})
