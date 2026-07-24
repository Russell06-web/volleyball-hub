import { describe, expect, it } from 'vitest'
import { getMatchResult, hasActivePreference } from './matchState'
import { DEFAULT_FILTERS } from '../components/FilterPanel'

const baseEvent = { type: '室內排球', gender: '女生', level: '中階', city: '台北', price: 250, registered: 5, capacity: 10 }

describe('hasActivePreference', () => {
  it('is false when every filter is at its default', () => {
    expect(hasActivePreference(DEFAULT_FILTERS)).toBe(false)
  })

  it('is true once any single filter moves off its default', () => {
    expect(hasActivePreference({ ...DEFAULT_FILTERS, city: '台北' })).toBe(true)
  })
})

describe('getMatchResult', () => {
  it('returns null when there is no stated preference to compare against', () => {
    expect(getMatchResult(baseEvent, DEFAULT_FILTERS)).toBeNull()
  })

  it('is "match" when 2+ active criteria are exactly satisfied and the event is not full', () => {
    const filters = { ...DEFAULT_FILTERS, city: '台北', level: '中階' }
    const result = getMatchResult(baseEvent, filters)
    expect(result.state).toBe('match')
  })

  it('is "partial" when only one active criterion is satisfied', () => {
    const filters = { ...DEFAULT_FILTERS, city: '台北' }
    const result = getMatchResult(baseEvent, filters)
    expect(result.state).toBe('partial')
  })

  it('is "check" when the organiser left a filtered dimension unspecified, even if other criteria match', () => {
    const openLevelEvent = { ...baseEvent, level: '不限' }
    const filters = { ...DEFAULT_FILTERS, city: '台北', level: '中階' }
    const result = getMatchResult(openLevelEvent, filters)
    expect(result.state).toBe('check')
    expect(result.criteria.find((c) => c.key === 'level').unspecified).toBe(true)
  })

  it('is "check" whenever the event is full, regardless of how well it otherwise matches', () => {
    const fullEvent = { ...baseEvent, registered: 10, capacity: 10 }
    const filters = { ...DEFAULT_FILTERS, city: '台北', level: '中階' }
    const result = getMatchResult(fullEvent, filters)
    expect(result.state).toBe('check')
    expect(result.full).toBe(true)
  })

  it('never returns more than 3 reasons', () => {
    const filters = { type: '室內排球', gender: '女生', level: '中階', city: '台北', price: 'NT$ 300 以下' }
    const result = getMatchResult(baseEvent, filters)
    expect(result.reasons.length).toBeLessThanOrEqual(3)
  })
})
