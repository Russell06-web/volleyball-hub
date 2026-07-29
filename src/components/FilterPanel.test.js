import { describe, expect, it } from 'vitest'
import { matchesFilters } from './FilterPanel'
import { DEFAULT_FILTERS, FILTER_ALL } from '../constants/taxonomy'
import { DEFAULT_EXPLORE_STATE } from '../utils/exploreParams'

const event = {
  type: 'indoor', gender: 'mixed', level: 'intermediate', city: 'taipei', price: 280,
  date: '2026-03-07', volleyballFormat: 'sixPlayer', netHeight: 'mixed', courtSurface: 'wood',
  rotationRequired: true, soloJoinAllowed: true, playStyle: 'competitive',
  equipmentProvided: ['volleyball', 'net'],
  positionsNeeded: [{ position: 'setter', count: 1 }, { position: 'libero', count: 0 }],
}

// The full 16-key shape Explore actually passes at runtime.
const ALL_FILTERS = DEFAULT_EXPLORE_STATE

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

  it('includeOpenGender only widens the match when it is explicitly "true" — an "open" event stays excluded otherwise', () => {
    const openGenderEvent = { ...event, gender: 'open' }
    expect(matchesFilters(openGenderEvent, { ...ALL_FILTERS, gender: 'male' })).toBe(false)
    expect(matchesFilters(openGenderEvent, { ...ALL_FILTERS, gender: 'male', includeOpenGender: 'true' })).toBe(true)
    // and a genuinely male-restricted event still matches normally either way
    expect(matchesFilters({ ...event, gender: 'male' }, { ...ALL_FILTERS, gender: 'male' })).toBe(true)
  })

  it('includeOpenLevel only widens the match when it is explicitly "true"', () => {
    const openLevelEvent = { ...event, level: 'open' }
    expect(matchesFilters(openLevelEvent, { ...ALL_FILTERS, level: 'advanced' })).toBe(false)
    expect(matchesFilters(openLevelEvent, { ...ALL_FILTERS, level: 'advanced', includeOpenLevel: 'true' })).toBe(true)
  })

  it('filters by required position — only events that actually still need that role match', () => {
    expect(matchesFilters(event, { ...ALL_FILTERS, position: 'setter' })).toBe(true)
    expect(matchesFilters(event, { ...ALL_FILTERS, position: 'outside' })).toBe(false)
    // libero is listed but its count is 0 — not actually needed
    expect(matchesFilters(event, { ...ALL_FILTERS, position: 'libero' })).toBe(false)
  })

  it('filters by playStyle / netHeight / format / surface as exact matches', () => {
    expect(matchesFilters(event, { ...ALL_FILTERS, playStyle: 'competitive' })).toBe(true)
    expect(matchesFilters(event, { ...ALL_FILTERS, playStyle: 'casual' })).toBe(false)
    expect(matchesFilters(event, { ...ALL_FILTERS, netHeight: 'mixed' })).toBe(true)
    expect(matchesFilters(event, { ...ALL_FILTERS, netHeight: 'men' })).toBe(false)
    expect(matchesFilters(event, { ...ALL_FILTERS, format: 'sixPlayer' })).toBe(true)
    expect(matchesFilters(event, { ...ALL_FILTERS, format: 'beachTwoPlayer' })).toBe(false)
    expect(matchesFilters(event, { ...ALL_FILTERS, surface: 'wood' })).toBe(true)
    expect(matchesFilters(event, { ...ALL_FILTERS, surface: 'sand' })).toBe(false)
  })

  it('rotation / soloJoin boolean flags only exclude when "true" and the event does not satisfy them', () => {
    expect(matchesFilters(event, { ...ALL_FILTERS, rotation: 'true' })).toBe(true) // event.rotationRequired is true
    expect(matchesFilters({ ...event, rotationRequired: false }, { ...ALL_FILTERS, rotation: 'true' })).toBe(false)
    expect(matchesFilters(event, { ...ALL_FILTERS, soloJoin: 'true' })).toBe(true)
    expect(matchesFilters({ ...event, soloJoinAllowed: false }, { ...ALL_FILTERS, soloJoin: 'true' })).toBe(false)
    // FILTER_ALL (off) never excludes on this dimension regardless of the event
    expect(matchesFilters({ ...event, rotationRequired: false }, { ...ALL_FILTERS, rotation: FILTER_ALL })).toBe(true)
  })

  it('filters by provided equipment', () => {
    expect(matchesFilters(event, { ...ALL_FILTERS, equipment: 'volleyball' })).toBe(true)
    expect(matchesFilters(event, { ...ALL_FILTERS, equipment: 'shower' })).toBe(false)
  })

  it('filters by dateRange using the shared matchesDateRange logic', () => {
    // event.date is 2026-03-07 — see dateRange.test.js for the fixed
    // "today" used there; here we just confirm the filter wires through.
    expect(matchesFilters(event, { ...ALL_FILTERS, dateRange: 'all' })).toBe(true)
  })
})
