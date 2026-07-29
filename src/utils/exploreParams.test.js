import { describe, expect, it } from 'vitest'
import { DEFAULT_EXPLORE_STATE, parseExploreParams, sanitizeExploreParams } from './exploreParams'

describe('parseExploreParams', () => {
  it('returns all defaults for an empty URL', () => {
    expect(parseExploreParams(new URLSearchParams(''))).toEqual(DEFAULT_EXPLORE_STATE)
  })

  it('reads every valid, whitelisted value', () => {
    const params = new URLSearchParams('q=%E5%8F%B0%E5%8C%97&type=indoor&gender=male&level=advanced&price=free&city=taipei&sort=priceAsc&view=featured')
    const state = parseExploreParams(params)
    expect(state).toEqual({
      q: '台北', type: 'indoor', gender: 'male', level: 'advanced', price: 'free', city: 'taipei', sort: 'priceAsc', view: 'featured',
    })
  })

  it('falls back to the default for any value not on the whitelist, instead of keeping an unmatchable value', () => {
    const params = new URLSearchParams('level=abc&type=wrong&price=nope&city=nowhere&sort=random&view=bogus')
    const state = parseExploreParams(params)
    expect(state.level).toBe('all')
    expect(state.type).toBe('all')
    expect(state.price).toBe('all')
    expect(state.city).toBe('all')
    expect(state.sort).toBe('default')
    expect(state.view).toBe('all')
  })

  it('treats an unknown price bracket the same way as any other unknown filter value (falls back to "all", not silently matching everything)', () => {
    const state = parseExploreParams(new URLSearchParams('price=under300'))
    expect(state.price).toBe('all')
  })
})

describe('sanitizeExploreParams', () => {
  it('produces an empty params object for the default state', () => {
    expect(sanitizeExploreParams(DEFAULT_EXPLORE_STATE).toString()).toBe('')
  })

  it('only includes non-default, whitelisted keys', () => {
    const params = sanitizeExploreParams({ ...DEFAULT_EXPLORE_STATE, type: 'indoor', sort: 'default', view: 'urgent' })
    expect(params.get('type')).toBe('indoor')
    expect(params.has('sort')).toBe(false) // still default, omitted
    expect(params.get('view')).toBe('urgent')
  })

  it('drops an invalid value rather than writing it back to the URL', () => {
    const params = sanitizeExploreParams({ ...DEFAULT_EXPLORE_STATE, level: 'not-a-real-level' })
    expect(params.has('level')).toBe(false)
  })

  it('round-trips through parse -> sanitize to the same canonical form', () => {
    const raw = new URLSearchParams('type=beach&city=taoyuan&q=%20cup%20')
    const roundTripped = sanitizeExploreParams(parseExploreParams(raw))
    expect(roundTripped.get('type')).toBe('beach')
    expect(roundTripped.get('city')).toBe('taoyuan')
    expect(roundTripped.get('q')).toBe('cup') // trimmed
  })
})
