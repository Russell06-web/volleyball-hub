import { describe, expect, it } from 'vitest'
import {
  EVENT_STATUS, getEventStatus, getRemainingSlots, isPubliclyVisible, isRegistrable, isWaitlistable,
} from './eventStatus'

describe('getEventStatus', () => {
  it('reports cancelled and completed as-is regardless of headcount', () => {
    expect(getEventStatus({ status: 'cancelled', registeredCount: 0, capacity: 10 })).toBe(EVENT_STATUS.CANCELLED)
    expect(getEventStatus({ status: 'completed', registeredCount: 10, capacity: 10 })).toBe(EVENT_STATUS.COMPLETED)
  })

  it('reports draft as-is', () => {
    expect(getEventStatus({ status: 'draft', registeredCount: 0, capacity: 10 })).toBe(EVENT_STATUS.DRAFT)
  })

  it('derives "full" from registeredCount >= capacity — never stored directly', () => {
    expect(getEventStatus({ status: 'published', registeredCount: 10, capacity: 10 })).toBe(EVENT_STATUS.FULL)
    expect(getEventStatus({ status: 'published', registeredCount: 9, capacity: 10 })).toBe(EVENT_STATUS.PUBLISHED)
  })

  it('checks in order: cancelled > draft > completed-flag > expired > full > published', () => {
    // cancelled wins even over an expired date
    expect(getEventStatus({
      status: 'cancelled', date: '2020-01-01', startTime: '10:00', endTime: '11:00', registeredCount: 0, capacity: 10,
    })).toBe(EVENT_STATUS.CANCELLED)
  })

  it('an event whose end time has already passed reports as completed, even if its stored status is still "published"', () => {
    const longPastEvent = {
      status: 'published', date: '2020-01-01', startTime: '10:00', endTime: '12:00', registeredCount: 5, capacity: 10,
    }
    expect(getEventStatus(longPastEvent, new Date('2026-01-01T00:00:00Z'))).toBe(EVENT_STATUS.COMPLETED)
  })

  it('a today event that has not ended yet is still published/full, not completed', () => {
    const event = {
      status: 'published', date: '2026-03-02', startTime: '19:00', endTime: '21:00', registeredCount: 5, capacity: 10,
    }
    const now = new Date('2026-03-02T10:00:00Z') // 18:00 in Taipei, before the 21:00 end
    expect(getEventStatus(event, now)).toBe(EVENT_STATUS.PUBLISHED)
  })

  it('returns null for a missing event instead of throwing', () => {
    expect(getEventStatus(null)).toBeNull()
    expect(getEventStatus(undefined)).toBeNull()
  })
})

describe('isPubliclyVisible', () => {
  it('published and full events are visible in Explore', () => {
    expect(isPubliclyVisible({ status: 'published', registeredCount: 5, capacity: 10 })).toBe(true)
    expect(isPubliclyVisible({ status: 'published', registeredCount: 10, capacity: 10 })).toBe(true)
  })

  it('draft, cancelled, completed, and expired events are all excluded from Explore', () => {
    expect(isPubliclyVisible({ status: 'draft', registeredCount: 0, capacity: 10 })).toBe(false)
    expect(isPubliclyVisible({ status: 'cancelled', registeredCount: 0, capacity: 10 })).toBe(false)
    expect(isPubliclyVisible({ status: 'completed', registeredCount: 0, capacity: 10 })).toBe(false)
    const expired = { status: 'published', date: '2020-01-01', startTime: '10:00', endTime: '11:00', registeredCount: 0, capacity: 10 }
    expect(isPubliclyVisible(expired, new Date('2026-01-01T00:00:00Z'))).toBe(false)
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
