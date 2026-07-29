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

  it('filters by gender strictly — an "open" (unspecified) event does NOT auto-match an explicit gender filter', () => {
    expect(matchesFilters(event, { ...DEFAULT_FILTERS, gender: 'mixed' })).toBe(true)
    expect(matchesFilters(event, { ...DEFAULT_FILTERS, gender: 'male' })).toBe(false)
    expect(matchesFilters({ ...event, gender: 'open' }, { ...DEFAULT_FILTERS, gender: 'male' })).toBe(false)
  })

  it('an "open" gender event still shows when the user has not filtered by gender at all', () => {
    expect(matchesFilters({ ...event, gender: 'open' }, DEFAULT_FILTERS)).toBe(true)
  })

  it('filters by level strictly — an "open" (unspecified) event does NOT auto-match an explicit level filter', () => {
    expect(matchesFilters(event, { ...DEFAULT_FILTERS, level: 'intermediate' })).toBe(true)
    expect(matchesFilters(event, { ...DEFAULT_FILTERS, level: 'advanced' })).toBe(false)
    expect(matchesFilters({ ...event, level: 'open' }, { ...DEFAULT_FILTERS, level: 'advanced' })).toBe(false)
  })

  it('an "open" level event still shows when the user has not filtered by level at all', () => {
    expect(matchesFilters({ ...event, level: 'open' }, DEFAULT_FILTERS)).toBe(true)
  })

  it('filters by city', () => {
    expect(matchesFilters(event, { ...DEFAULT_FILTERS, city: 'taipei' })).toBe(true)
    expect(matchesFilters(event, { ...DEFAULT_FILTERS, city: 'taoyuan' })).toBe(false)
  })

  it('filters by price bracket (event price is 280 -> underOrEqual300, not free or between301And500)', () => {
    expect(matchesFilters(event, { ...DEFAULT_FILTERS, price: 'underOrEqual300' })).toBe(true)
    expect(matchesFilters(event, { ...DEFAULT_FILTERS, price: 'between301And500' })).toBe(false)
    expect(matchesFilters(event, { ...DEFAULT_FILTERS, price: 'free' })).toBe(false)
  })

  it('requires every active filter to match at once', () => {
    expect(matchesFilters(event, { ...DEFAULT_FILTERS, type: 'indoor', city: 'taipei' })).toBe(true)
    expect(matchesFilters(event, { ...DEFAULT_FILTERS, type: 'indoor', city: 'taoyuan' })).toBe(false)
  })
})
