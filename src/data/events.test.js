import { describe, expect, it } from 'vitest'
import { SEED_EVENTS, isFull } from './events'

describe('events seed data', () => {
  it('every seed event has a unique id', () => {
    const ids = SEED_EVENTS.map((e) => e.id)
    expect(new Set(ids).size).toBe(ids.length)
  })

  it('isFull reflects registered vs capacity, not a hardcoded flag', () => {
    expect(isFull({ registered: 10, capacity: 10 })).toBe(true)
    expect(isFull({ registered: 9, capacity: 10 })).toBe(false)
  })

  it('includes at least one event flagged ownedByMe, for the Manage dashboard', () => {
    expect(SEED_EVENTS.some((e) => e.ownedByMe)).toBe(true)
  })

  it('scheduled events (real dates, not "今天"/"今晚") are never in the past', () => {
    const today = new Date(); today.setHours(0, 0, 0, 0)
    const dated = SEED_EVENTS.filter((e) => /^\d{4}-\d{2}-\d{2}$/.test(e.date))
    expect(dated.length).toBeGreaterThan(0)
    dated.forEach((e) => {
      expect(new Date(e.date).getTime()).toBeGreaterThanOrEqual(today.getTime())
    })
  })
})
