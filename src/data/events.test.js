import { describe, expect, it } from 'vitest'
import { SEED_EVENTS, isFull } from './events'
import { CURRENT_USER_ID } from '../constants/taxonomy'

describe('events seed data', () => {
  it('every seed event has a unique id', () => {
    const ids = SEED_EVENTS.map((e) => e.id)
    expect(new Set(ids).size).toBe(ids.length)
  })

  it('isFull reflects registeredCount vs capacity, not a hardcoded flag', () => {
    expect(isFull({ registeredCount: 10, capacity: 10 })).toBe(true)
    expect(isFull({ registeredCount: 9, capacity: 10 })).toBe(false)
  })

  it('includes at least one event owned by the current demo organiser, for the Manage dashboard', () => {
    expect(SEED_EVENTS.some((e) => e.ownerId === CURRENT_USER_ID)).toBe(true)
  })

  it('scheduled events (real dates, not "今天"/"今晚") are never in the past', () => {
    const today = new Date(); today.setHours(0, 0, 0, 0)
    const dated = SEED_EVENTS.filter((e) => /^\d{4}-\d{2}-\d{2}$/.test(e.date))
    expect(dated.length).toBeGreaterThan(0)
    dated.forEach((e) => {
      expect(new Date(e.date).getTime()).toBeGreaterThanOrEqual(today.getTime())
    })
  })

  it('never stores a "section" / "tone" / "badgeLabel" / "ownedByMe" field from the old schema', () => {
    SEED_EVENTS.forEach((e) => {
      expect(e).not.toHaveProperty('section')
      expect(e).not.toHaveProperty('tone')
      expect(e).not.toHaveProperty('badgeLabel')
      expect(e).not.toHaveProperty('ownedByMe')
      expect(e).not.toHaveProperty('registered')
    })
  })
})
