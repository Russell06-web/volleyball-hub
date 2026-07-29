import { describe, expect, it } from 'vitest'
import { matchesDateRange } from './dateRange'

// Fixed reference: 2026-03-02 12:00 Taipei (Monday). Verified against
// getTaipeiDateString elsewhere in the suite.
const REFERENCE = new Date('2026-03-02T04:00:00Z')

describe('matchesDateRange', () => {
  it('"all" matches any date, including none at all', () => {
    expect(matchesDateRange({ date: '2026-03-02' }, 'all', REFERENCE)).toBe(true)
    expect(matchesDateRange({}, 'all', REFERENCE)).toBe(true)
  })

  it('"today" matches only today\'s date (Taipei)', () => {
    expect(matchesDateRange({ date: '2026-03-02' }, 'today', REFERENCE)).toBe(true)
    expect(matchesDateRange({ date: '2026-03-03' }, 'today', REFERENCE)).toBe(false)
  })

  it('"tomorrow" matches only the next calendar day', () => {
    expect(matchesDateRange({ date: '2026-03-03' }, 'tomorrow', REFERENCE)).toBe(true)
    expect(matchesDateRange({ date: '2026-03-02' }, 'tomorrow', REFERENCE)).toBe(false)
  })

  it('"thisWeek" matches today through 6 days out, inclusive', () => {
    expect(matchesDateRange({ date: '2026-03-02' }, 'thisWeek', REFERENCE)).toBe(true)
    expect(matchesDateRange({ date: '2026-03-08' }, 'thisWeek', REFERENCE)).toBe(true)
    expect(matchesDateRange({ date: '2026-03-09' }, 'thisWeek', REFERENCE)).toBe(false)
    expect(matchesDateRange({ date: '2026-03-01' }, 'thisWeek', REFERENCE)).toBe(false)
  })

  it('"weekend" matches the next upcoming Saturday/Sunday, not any random future date', () => {
    // 2026-03-02 is a Monday; the next weekend is 2026-03-07 (Sat) / 03-08 (Sun)
    expect(matchesDateRange({ date: '2026-03-07' }, 'weekend', REFERENCE)).toBe(true)
    expect(matchesDateRange({ date: '2026-03-08' }, 'weekend', REFERENCE)).toBe(true)
    expect(matchesDateRange({ date: '2026-03-04' }, 'weekend', REFERENCE)).toBe(false)
  })

  it('an event with no date never matches a specific range', () => {
    expect(matchesDateRange({}, 'today', REFERENCE)).toBe(false)
  })
})
