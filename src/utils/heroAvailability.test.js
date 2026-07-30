import { describe, expect, it } from 'vitest'
import { getHeroAvailabilityCounts, getHeroAvailabilityText } from './heroAvailability'

const NOW = new Date('2026-03-07T10:00:00+08:00')

function ev(overrides) {
  return {
    id: overrides.id,
    date: '2026-03-07',
    startTime: '20:00',
    endTime: '22:00',
    capacity: 10,
    registeredCount: 0,
    status: 'published',
    ...overrides,
  }
}

describe('getHeroAvailabilityCounts', () => {
  it('counts published and full separately', () => {
    const events = [
      ev({ id: 'a', registeredCount: 2 }), // published
      ev({ id: 'b', registeredCount: 10 }), // full
      ev({ id: 'c', registeredCount: 5 }), // published
    ]
    expect(getHeroAvailabilityCounts(events, NOW)).toEqual({ registrableCount: 2, waitlistCount: 1 })
  })

  it('excludes cancelled, completed, expired and draft events entirely', () => {
    const events = [
      ev({ id: 'a', status: 'cancelled' }),
      ev({ id: 'b', status: 'draft' }),
      ev({ id: 'c', status: 'completed' }),
      ev({ id: 'd', date: '2020-01-01', endTime: '10:00' }), // expired via date, status still "published"
      ev({ id: 'e', registeredCount: 3 }), // the only one that should count
    ]
    expect(getHeroAvailabilityCounts(events, NOW)).toEqual({ registrableCount: 1, waitlistCount: 0 })
  })

  it('returns zero/zero for an empty list', () => {
    expect(getHeroAvailabilityCounts([], NOW)).toEqual({ registrableCount: 0, waitlistCount: 0 })
  })
})

describe('getHeroAvailabilityText', () => {
  it('shows both counts when there is a mix of registrable and waitlistable events', () => {
    expect(getHeroAvailabilityText({ registrableCount: 12, waitlistCount: 3 })).toBe('12 場報名中・3 場開放候補')
  })

  it('shows only the registrable count when there is no waitlist', () => {
    expect(getHeroAvailabilityText({ registrableCount: 12, waitlistCount: 0 })).toBe('12 場活動開放報名')
  })

  it('shows only the waitlist count when everything open is full', () => {
    expect(getHeroAvailabilityText({ registrableCount: 0, waitlistCount: 3 })).toBe('3 場活動開放候補')
  })

  it('shows the honest empty-state copy when nothing is open at all', () => {
    expect(getHeroAvailabilityText({ registrableCount: 0, waitlistCount: 0 })).toBe('目前沒有開放中的活動')
  })

  it('never uses overstated language like 隨時可以加入 or 即時名額', () => {
    const text = getHeroAvailabilityText({ registrableCount: 5, waitlistCount: 1 })
    expect(text).not.toContain('隨時可以加入')
    expect(text).not.toContain('即時')
    expect(text).not.toContain('保證有位置')
  })
})
