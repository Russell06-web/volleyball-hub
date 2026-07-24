import { describe, expect, it } from 'vitest'
import { getMatchResult, hasActivePreference } from './matchState'
import { DEFAULT_FILTERS } from '../constants/taxonomy'

const baseEvent = { type: 'indoor', gender: 'female', level: 'intermediate', city: 'taipei', price: 250, registeredCount: 5, capacity: 10 }

describe('hasActivePreference', () => {
  it('is false when every filter is at its default', () => {
    expect(hasActivePreference(DEFAULT_FILTERS)).toBe(false)
  })

  it('is true once any single filter moves off its default', () => {
    expect(hasActivePreference({ ...DEFAULT_FILTERS, city: 'taipei' })).toBe(true)
  })
})

describe('getMatchResult', () => {
  it('returns null when there is no stated preference to compare against', () => {
    expect(getMatchResult(baseEvent, DEFAULT_FILTERS)).toBeNull()
  })

  it('is "match" only when every active filter is satisfied and the event is not full', () => {
    const filters = { ...DEFAULT_FILTERS, city: 'taipei', level: 'intermediate' }
    const result = getMatchResult(baseEvent, filters)
    expect(result.state).toBe('match')
  })

  it('is "partial" when some but not all active filters are satisfied', () => {
    const filters = { ...DEFAULT_FILTERS, city: 'taipei', level: 'advanced' }
    const result = getMatchResult(baseEvent, filters)
    expect(result.state).toBe('partial')
  })

  it('is "check" when zero of the active filters are satisfied', () => {
    const filters = { ...DEFAULT_FILTERS, city: 'newTaipei', level: 'advanced' }
    const result = getMatchResult(baseEvent, filters)
    expect(result.state).toBe('check')
  })

  it('is "check" when the organiser left a filtered dimension unspecified, even if other criteria match', () => {
    const openLevelEvent = { ...baseEvent, level: 'open' }
    const filters = { ...DEFAULT_FILTERS, city: 'taipei', level: 'intermediate' }
    const result = getMatchResult(openLevelEvent, filters)
    expect(result.state).toBe('check')
    expect(result.criteria.find((c) => c.key === 'level').unspecified).toBe(true)
  })

  it('is "check" whenever the event is full, regardless of how well it otherwise matches', () => {
    const fullEvent = { ...baseEvent, registeredCount: 10, capacity: 10 }
    const filters = { ...DEFAULT_FILTERS, city: 'taipei', level: 'intermediate' }
    const result = getMatchResult(fullEvent, filters)
    expect(result.state).toBe('check')
    expect(result.full).toBe(true)
  })

  it('never returns more than 3 reasons', () => {
    const filters = { type: 'indoor', gender: 'female', level: 'intermediate', city: 'taipei', price: 'under300' }
    const result = getMatchResult(baseEvent, filters)
    expect(result.reasons.length).toBeLessThanOrEqual(3)
  })
})
