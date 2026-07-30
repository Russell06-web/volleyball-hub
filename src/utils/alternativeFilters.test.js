import { describe, expect, it } from 'vitest'
import { getAlternativeFilterSuggestions } from './alternativeFilters'
import { matchesFilters } from '../components/FilterPanel'
import { matchesSearch } from './search'
import { DEFAULT_EXPLORE_STATE } from './exploreParams'

// Real integration, not a mock: the counter this test hands to
// getAlternativeFilterSuggestions is the exact matchesFilters/
// matchesSearch pair Explore.jsx itself uses, run against a small fixed
// event fixture — so a passing test here is proof the suggested count is
// what the app would actually show, not just what the suggestion claims.
function makeCounter(events) {
  return (state) => events.filter((e) => matchesFilters(e, state) && matchesSearch(e, state.q || '')).length
}

function ev(overrides) {
  return {
    id: overrides.id,
    title: overrides.title || 'Event',
    type: 'indoor',
    city: 'taipei',
    level: 'intermediate',
    gender: 'open',
    price: 0,
    registeredCount: 0,
    capacity: 10,
    positionsNeeded: [],
    playStyle: '',
    volleyballFormat: 'sixPlayer',
    netHeight: 'unspecified',
    courtSurface: 'unspecified',
    rotationRequired: false,
    soloJoinAllowed: true,
    equipmentProvided: [],
    venueName: '', address: '', organizerName: '', organizerContact: '',
    ...overrides,
  }
}

const EVENTS = [
  ev({ id: 'e1', city: 'taipei', level: 'intermediate', price: 200, type: 'indoor', isUrgent: false }),
  ev({ id: 'e2', city: 'newTaipei', level: 'intermediate', price: 200, type: 'indoor', isUrgent: false }),
  ev({ id: 'e3', city: 'newTaipei', level: 'open', price: 400, type: 'indoor', isUrgent: false }),
  ev({ id: 'e4', city: 'taoyuan', level: 'beginner', price: 600, type: 'beach', isUrgent: false }),
]

describe('getAlternativeFilterSuggestions', () => {
  it('suggests dropping a filter only when it genuinely increases the result count', () => {
    // city=taipei alone matches only e1 (1 result)
    const state = { ...DEFAULT_EXPLORE_STATE, city: 'taipei' }
    const counter = makeCounter(EVENTS)
    const currentCount = counter(state)
    expect(currentCount).toBe(1)

    const suggestions = getAlternativeFilterSuggestions(state, currentCount, counter)
    const cityDrop = suggestions.find((s) => s.id === 'drop-city')
    expect(cityDrop).toBeTruthy()
    expect(cityDrop.resultCount).toBe(4)
    expect(cityDrop.patch).toEqual({ city: 'all' })
  })

  it('never offers a suggestion that would not actually increase the count', () => {
    // Every event is type=indoor except e4 — filtering type=indoor already
    // includes 3/4; dropping city (already 'all') should not be offered,
    // and dropping type shouldn't be offered if it wouldn't help given
    // other active filters make the count identical.
    const state = { ...DEFAULT_EXPLORE_STATE, level: 'intermediate', price: 'all' }
    const counter = makeCounter(EVENTS)
    const currentCount = counter(state) // e1, e2 -> 2
    const suggestions = getAlternativeFilterSuggestions(state, currentCount, counter)
    // dropping level should increase (level intermediate -> all = 4)
    const levelDrop = suggestions.find((s) => s.id === 'drop-level')
    expect(levelDrop).toBeTruthy()
    expect(levelDrop.resultCount).toBeGreaterThan(currentCount)
    // no suggestion is ever offered with resultCount <= currentCount
    suggestions.forEach((s) => expect(s.resultCount).toBeGreaterThan(currentCount))
  })

  it('suggests widening includeOpenLevel rather than dropping level, as a distinct option', () => {
    const state = { ...DEFAULT_EXPLORE_STATE, level: 'intermediate' }
    const counter = makeCounter(EVENTS)
    const currentCount = counter(state) // e1, e2 -> 2
    const suggestions = getAlternativeFilterSuggestions(state, currentCount, counter)
    const widen = suggestions.find((s) => s.id === 'widen-includeOpenLevel')
    // e3 has level 'open', so widening should surface it in addition
    expect(widen).toBeTruthy()
    expect(widen.resultCount).toBeGreaterThan(currentCount)
    expect(widen.patch).toEqual({ includeOpenLevel: 'true' })
  })

  it('suggests clearing the search text when that alone would help', () => {
    const state = { ...DEFAULT_EXPLORE_STATE, q: 'nonexistent keyword xyz' }
    const counter = makeCounter(EVENTS)
    const currentCount = counter(state)
    expect(currentCount).toBe(0)
    const suggestions = getAlternativeFilterSuggestions(state, currentCount, counter)
    const clearSearch = suggestions.find((s) => s.id === 'clear-search')
    expect(clearSearch).toBeTruthy()
    expect(clearSearch.resultCount).toBe(4)
  })

  it('caps suggestions at the requested max, ranked by highest result count first', () => {
    const state = { ...DEFAULT_EXPLORE_STATE, city: 'taipei', level: 'intermediate', type: 'indoor', price: 'underOrEqual300' }
    const counter = makeCounter(EVENTS)
    const currentCount = counter(state)
    const suggestions = getAlternativeFilterSuggestions(state, currentCount, counter, { max: 2 })
    expect(suggestions.length).toBeLessThanOrEqual(2)
    for (let i = 1; i < suggestions.length; i += 1) {
      expect(suggestions[i - 1].resultCount).toBeGreaterThanOrEqual(suggestions[i].resultCount)
    }
  })

  it('suggests removing urgentOnly when no urgent event matches, using the same drop-a-filter path as any other dimension', () => {
    const state = { ...DEFAULT_EXPLORE_STATE, urgentOnly: 'true' }
    const counter = makeCounter(EVENTS) // none of the fixtures are isUrgent
    const currentCount = counter(state)
    expect(currentCount).toBe(0)
    const suggestions = getAlternativeFilterSuggestions(state, currentCount, counter)
    const dropUrgent = suggestions.find((s) => s.id === 'drop-urgentOnly')
    expect(dropUrgent).toBeTruthy()
    expect(dropUrgent.patch).toEqual({ urgentOnly: 'all' })
    expect(dropUrgent.resultCount).toBe(4)
  })

  it('returns an empty list when nothing on the whitelist would help (caller falls back to a full reset)', () => {
    const state = { ...DEFAULT_EXPLORE_STATE }
    const counter = () => 4 // already showing everything, at the state's own count
    const suggestions = getAlternativeFilterSuggestions(state, 4, counter)
    expect(suggestions).toEqual([])
  })
})
