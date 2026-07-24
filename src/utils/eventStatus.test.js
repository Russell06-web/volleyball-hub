import { describe, expect, it } from 'vitest'
import { EVENT_STATUS, getEventStatus, getRemainingSlots, isRegistrable, isWaitlistable } from './eventStatus'

describe('getEventStatus', () => {
  it('reports cancelled and completed as-is regardless of headcount', () => {
    expect(getEventStatus({ status: 'cancelled', registeredCount: 0, capacity: 10 })).toBe(EVENT_STATUS.CANCELLED)
    expect(getEventStatus({ status: 'completed', registeredCount: 10, capacity: 10 })).toBe(EVENT_STATUS.COMPLETED)
  })

  it('derives "full" from registeredCount >= capacity — never stored directly', () => {
    expect(getEventStatus({ status: 'published', registeredCount: 10, capacity: 10 })).toBe(EVENT_STATUS.FULL)
    expect(getEventStatus({ status: 'published', registeredCount: 9, capacity: 10 })).toBe(EVENT_STATUS.PUBLISHED)
  })

  it('returns null for a missing event instead of throwing', () => {
    expect(getEventStatus(null)).toBeNull()
    expect(getEventStatus(undefined)).toBeNull()
  })
})

describe('isRegistrable / isWaitlistable', () => {
  it('a published, not-full event is registrable but not waitlistable', () => {
    const ev = { status: 'published', registeredCount: 5, capacity: 10 }
    expect(isRegistrable(ev)).toBe(true)
    expect(isWaitlistable(ev)).toBe(false)
  })

  it('a full event is waitlistable but not registrable', () => {
    const ev = { status: 'published', registeredCount: 10, capacity: 10 }
    expect(isRegistrable(ev)).toBe(false)
    expect(isWaitlistable(ev)).toBe(true)
  })

  it('a cancelled event is neither registrable nor waitlistable, even with open slots', () => {
    const ev = { status: 'cancelled', registeredCount: 0, capacity: 10 }
    expect(isRegistrable(ev)).toBe(false)
    expect(isWaitlistable(ev)).toBe(false)
  })
})

describe('getRemainingSlots', () => {
  it('is capacity minus registeredCount, floored at 0', () => {
    expect(getRemainingSlots({ registeredCount: 7, capacity: 10 })).toBe(3)
    expect(getRemainingSlots({ registeredCount: 12, capacity: 10 })).toBe(0)
  })
})
