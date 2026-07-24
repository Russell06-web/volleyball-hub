import { describe, expect, it } from 'vitest'
import { matchesFilters } from './FilterPanel'
import { DEFAULT_FILTERS } from '../constants/taxonomy'

const event = { type: 'indoor', gender: 'mixed', level: 'intermediate', city: 'taipei', price: 280 }

describe('matchesFilters', () => {
  it('matches everything when every filter is "all"', () => {
    expect(matchesFilters(event, DEFAULT_FILTERS)).toBe(true)
  })

  it('filters by type', () => {
    expect(matchesFilters(event, { ...DEFAULT_FILTERS, type: 'indoor' })).toBe(true)
    expect(matchesFilters(event, { ...DEFAULT_FILTERS, type: 'beach' })).toBe(false)
  })

  it('filters by gender, but an event with gender "open" always passes', () => {
    expect(matchesFilters(event, { ...DEFAULT_FILTERS, gender: 'mixed' })).toBe(true)
    expect(matchesFilters(event, { ...DEFAULT_FILTERS, gender: 'male' })).toBe(false)
    expect(matchesFilters({ ...event, gender: 'open' }, { ...DEFAULT_FILTERS, gender: 'male' })).toBe(true)
  })

  it('filters by level, but an event with level "open" always passes', () => {
    expect(matchesFilters(event, { ...DEFAULT_FILTERS, level: 'intermediate' })).toBe(true)
    expect(matchesFilters(event, { ...DEFAULT_FILTERS, level: 'advanced' })).toBe(false)
    expect(matchesFilters({ ...event, level: 'open' }, { ...DEFAULT_FILTERS, level: 'advanced' })).toBe(true)
  })

  it('filters by city', () => {
    expect(matchesFilters(event, { ...DEFAULT_FILTERS, city: 'taipei' })).toBe(true)
    expect(matchesFilters(event, { ...DEFAULT_FILTERS, city: 'taoyuan' })).toBe(false)
  })

  it('filters by price bracket (event price is 280)', () => {
    expect(matchesFilters(event, { ...DEFAULT_FILTERS, price: 'under300' })).toBe(true)
    expect(matchesFilters(event, { ...DEFAULT_FILTERS, price: '300to500' })).toBe(false)
  })

  it('requires every active filter to match at once', () => {
    expect(matchesFilters(event, { ...DEFAULT_FILTERS, type: 'indoor', city: 'taipei' })).toBe(true)
    expect(matchesFilters(event, { ...DEFAULT_FILTERS, type: 'indoor', city: 'taoyuan' })).toBe(false)
  })
})
