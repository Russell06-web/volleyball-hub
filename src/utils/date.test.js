import { describe, expect, it } from 'vitest'
import {
  addDaysInTaipei, formatEventDateLabel, futureDate, futureDateWithLabel, getEventEndDateTime,
  getTaipeiDateString, getTaipeiNowParts, isPastEvent,
} from './date'

describe('futureDate', () => {
  it('returns a YYYY-MM-DD string that is actually in the future', () => {
    const today = new Date(); today.setHours(0, 0, 0, 0)
    const result = new Date(futureDate(5))
    expect(result.getTime()).toBeGreaterThan(today.getTime())
  })

  it('returns today (Taipei) for an offset of 0, regardless of the test runner\'s own timezone', () => {
    expect(futureDate(0)).toBe(getTaipeiDateString())
  })

  it('is anchored to Taipei\'s calendar date, not the device/runtime timezone, given a fixed reference instant', () => {
    // 2026-03-01 23:30 UTC is already 2026-03-02 in Taipei (UTC+8). A
    // device-local-timezone implementation (e.g. US Pacific, UTC-8) would
    // still think it's the 1st and compute the wrong seed date.
    const reference = new Date('2026-03-01T23:30:00Z')
    expect(futureDate(0, reference)).toBe('2026-03-02')
    expect(futureDate(1, reference)).toBe('2026-03-03')
  })

  it('correctly rolls over a month/year boundary', () => {
    const reference = new Date('2026-12-30T04:00:00Z') // 2026-12-30 12:00 Taipei
    expect(futureDate(3, reference)).toBe('2027-01-02')
  })
})

describe('futureDateWithLabel', () => {
  it('returns a date string plus a matching weekday and short label', () => {
    const { date, dow, md } = futureDateWithLabel(3)
    expect(date).toMatch(/^\d{4}-\d{2}-\d{2}$/)
    expect(dow).toMatch(/^週[日一二三四五六]$/)
    expect(md).toMatch(/^\d{2}\/\d{2}$/)
  })

  it('agrees with futureDate on the same date string for the same offset', () => {
    const reference = new Date('2026-03-01T23:30:00Z')
    expect(futureDateWithLabel(2, reference).date).toBe(futureDate(2, reference))
  })

  // Regression guard: Manage.jsx's wizard once built its date options via
  // `[2,3,4,7,9].map(futureDateWithLabel)` — Array.map calls its callback
  // with (element, index, array), and futureDateWithLabel's 2nd parameter
  // is `referenceDate`, so the array index silently landed there (0 for
  // the first entry -> `new Date(0)` -> 1970-01-0x). Every event the
  // wizard published got a ~1970 date as a result, invisible until
  // something finally validated "date not before today". The fix wraps
  // the call so only daysFromNow is ever passed through; this test pins
  // that a bare multi-arg `.map(futureDateWithLabel)` call is the wrong
  // pattern by proving the safe wrapper stays anchored near "today" while
  // the unsafe form drifts to the epoch.
  it('demonstrates why callers must not pass this directly to Array.map', () => {
    const safe = [2, 3, 4, 7, 9].map((daysFromNow) => futureDateWithLabel(daysFromNow))
    const todayYear = Number(new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Taipei', year: 'numeric' }).format(new Date()))
    safe.forEach((d) => expect(Number(d.date.slice(0, 4))).toBeGreaterThanOrEqual(todayYear))

    const unsafe = [2, 3, 4, 7, 9].map(futureDateWithLabel)
    expect(unsafe[0].date.slice(0, 4)).toBe('1970')
  })
})

describe('addDaysInTaipei', () => {
  it('gives the same calendar result no matter what UTC offset the reference instant represents, as long as the Taipei date is the same', () => {
    // Both instants fall on 2026-06-15 in Taipei (one is early morning,
    // one is late evening there) — the +N day math should be identical.
    const earlyTaipeiMorning = new Date('2026-06-14T16:05:00Z') // 2026-06-15 00:05 Taipei
    const lateTaipeiEvening = new Date('2026-06-15T13:55:00Z') // 2026-06-15 21:55 Taipei
    expect(getTaipeiDateString(addDaysInTaipei(5, earlyTaipeiMorning))).toBe(getTaipeiDateString(addDaysInTaipei(5, lateTaipeiEvening)))
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

  it('boundary: one minute before endTime is not past, exactly at endTime IS past, one minute after is past', () => {
    const event = { date: '2026-03-02', startTime: '19:00', endTime: '21:00' }
    const oneMinuteBefore = new Date('2026-03-02T12:59:00Z') // 20:59 Taipei
    const exactlyAtEnd = new Date('2026-03-02T13:00:00Z') // 21:00 Taipei
    const oneMinuteAfter = new Date('2026-03-02T13:01:00Z') // 21:01 Taipei
    expect(isPastEvent(event, oneMinuteBefore)).toBe(false)
    expect(isPastEvent(event, exactlyAtEnd)).toBe(true)
    expect(isPastEvent(event, oneMinuteAfter)).toBe(true)
  })
})
