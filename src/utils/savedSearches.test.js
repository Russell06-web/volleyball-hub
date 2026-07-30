import { describe, expect, it } from 'vitest'
import {
  buildSavedSearchFilters, MAX_NAME_LENGTH, sanitizeSavedSearches, savedSearchToQueryString, validateSavedSearchName,
} from './savedSearches'
import { DEFAULT_EXPLORE_STATE } from './exploreParams'

describe('validateSavedSearchName', () => {
  it('rejects an empty or whitespace-only name', () => {
    expect(validateSavedSearchName('', [])).toBeTruthy()
    expect(validateSavedSearchName('   ', [])).toBeTruthy()
  })

  it('rejects a name longer than the max length', () => {
    expect(validateSavedSearchName('x'.repeat(MAX_NAME_LENGTH + 1), [])).toBeTruthy()
  })

  it('accepts a name at exactly the max length', () => {
    expect(validateSavedSearchName('x'.repeat(MAX_NAME_LENGTH), [])).toBeNull()
  })

  it('rejects a duplicate name rather than silently allowing it', () => {
    expect(validateSavedSearchName('台北中階', [{ name: '台北中階' }])).toBeTruthy()
  })

  it('accepts a valid, unique name', () => {
    expect(validateSavedSearchName('週末場', [{ name: '平日場' }])).toBeNull()
  })
})

describe('buildSavedSearchFilters', () => {
  it('never includes the search text (q) or the section view', () => {
    const state = { ...DEFAULT_EXPLORE_STATE, q: '台北 中階', type: 'indoor', view: 'featured' }
    const { filters } = buildSavedSearchFilters(state)
    expect(filters).not.toHaveProperty('q')
    expect(filters).not.toHaveProperty('view')
    expect(filters.type).toBe('indoor')
  })

  it('never stores default-valued filters', () => {
    const { filters } = buildSavedSearchFilters(DEFAULT_EXPLORE_STATE)
    expect(Object.keys(filters)).toHaveLength(0)
  })

  it('captures sort separately from the filter set', () => {
    const state = { ...DEFAULT_EXPLORE_STATE, sort: 'priceAsc' }
    const { sort } = buildSavedSearchFilters(state)
    expect(sort).toBe('priceAsc')
  })

  it('saves urgentOnly like any other filter — "今天臨打" stays applyable once saved', () => {
    const state = { ...DEFAULT_EXPLORE_STATE, dateRange: 'today', urgentOnly: 'true' }
    const { filters } = buildSavedSearchFilters(state)
    expect(filters.dateRange).toBe('today')
    expect(filters.urgentOnly).toBe('true')
  })
})

describe('sanitizeSavedSearches', () => {
  it('returns an empty array for invalid input', () => {
    expect(sanitizeSavedSearches(null)).toEqual([])
    expect(sanitizeSavedSearches('not an array')).toEqual([])
  })

  it('drops entries missing an id or name', () => {
    const raw = [{ id: 'a', name: '有效' }, { name: '缺 id' }, { id: 'b' }]
    expect(sanitizeSavedSearches(raw)).toHaveLength(1)
  })

  it('caps at MAX_SAVED_SEARCHES', () => {
    const raw = Array.from({ length: 8 }, (_, i) => ({ id: `s${i}`, name: `條件 ${i}` }))
    expect(sanitizeSavedSearches(raw)).toHaveLength(5)
  })
})

describe('savedSearchToQueryString', () => {
  it('rebuilds a valid, applyable query string from a saved entry', () => {
    const saved = { filters: { type: 'indoor', city: 'taipei' }, sort: 'dateAsc' }
    const qs = savedSearchToQueryString(saved)
    expect(qs).toContain('type=indoor')
    expect(qs).toContain('city=taipei')
    expect(qs).toContain('sort=dateAsc')
    expect(qs).not.toContain('q=')
  })

  it('drops a filter value that is no longer legal (e.g. a removed taxonomy option)', () => {
    const saved = { filters: { type: 'not-a-real-type' }, sort: 'default' }
    const qs = savedSearchToQueryString(saved)
    expect(qs).not.toContain('type=')
  })

  it('returns an empty string for an all-default saved search', () => {
    const saved = { filters: {}, sort: 'default' }
    expect(savedSearchToQueryString(saved)).toBe('')
  })
})
