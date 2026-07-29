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

  it('every organizerContact is an obviously-fake demo number, not something that reads as real personal data', () => {
    SEED_EVENTS.forEach((e) => {
      expect(e.organizerContact).toMatch(/^0900-000-\d{3}$/)
    })
  })

  it('a description only mentions a coach or insurance when the event actually has that flag set', () => {
    SEED_EVENTS.forEach((e) => {
      if (!e.hasCoach) expect(e.description).not.toContain('教練')
      if (!e.hasInsurance) expect(e.description).not.toContain('保險')
    })
  })

  it('urgent-event titles are real venue/time names, not bare headcount callouts', () => {
    const urgentTitles = SEED_EVENTS.filter((e) => e.isUrgent).map((e) => e.title)
    expect(urgentTitles.length).toBeGreaterThan(0)
    urgentTitles.forEach((title) => {
      expect(title).not.toMatch(/[！!]$/)
      expect(title).not.toMatch(/^還缺|湊團中$/)
    })
  })

  it('urgent (臨打) events always have a real positionsNeeded shortage to display', () => {
    SEED_EVENTS.filter((e) => e.isUrgent).forEach((e) => {
      const totalNeeded = e.positionsNeeded.reduce((sum, p) => sum + p.count, 0)
      expect(totalNeeded).toBeGreaterThan(0)
    })
  })

  it('family/recreational events have no competitive position requirements (empty array, not fabricated roles)', () => {
    SEED_EVENTS.filter((e) => e.type === 'family').forEach((e) => {
      expect(e.positionsNeeded).toEqual([])
    })
  })

  it('every event has a volleyballFormat, and not every event uses the same one', () => {
    const formats = new Set(SEED_EVENTS.map((e) => e.volleyballFormat))
    expect(SEED_EVENTS.every((e) => !!e.volleyballFormat)).toBe(true)
    expect(formats.size).toBeGreaterThan(1)
  })

  it('beach events always report courtSurface "sand" — definitionally true, not a guess', () => {
    SEED_EVENTS.filter((e) => e.type === 'beach').forEach((e) => {
      expect(e.courtSurface).toBe('sand')
    })
  })

  it('positionsNeeded totals never exceed what is actually still needed (sanity against the seed data itself)', () => {
    SEED_EVENTS.forEach((e) => {
      const totalNeeded = e.positionsNeeded.reduce((sum, p) => sum + p.count, 0)
      expect(totalNeeded).toBeLessThanOrEqual(e.capacity)
      e.positionsNeeded.forEach((p) => expect(p.count).toBeGreaterThanOrEqual(0))
    })
  })
})
