import { describe, expect, it } from 'vitest'
import {
  ADVANCED_FILTER_KEYS, BASIC_FILTER_KEYS, DEFAULT_EXPLORE_STATE, FILTER_KEYS, getPreferencesSyncPatch,
  parseExploreParams, QUICK_FILTER_KEYS, sanitizeExploreParams,
} from './exploreParams'
import { DEFAULT_FILTERS } from '../constants/taxonomy'

describe('parseExploreParams', () => {
  it('returns all defaults for an empty URL', () => {
    expect(parseExploreParams(new URLSearchParams(''))).toEqual(DEFAULT_EXPLORE_STATE)
  })

  it('reads every valid, whitelisted basic value', () => {
    const params = new URLSearchParams('q=%E5%8F%B0%E5%8C%97&type=indoor&gender=male&level=advanced&price=free&city=taipei&sort=priceAsc&view=featured')
    const state = parseExploreParams(params)
    expect(state.q).toBe('台北')
    expect(state.type).toBe('indoor')
    expect(state.gender).toBe('male')
    expect(state.level).toBe('advanced')
    expect(state.price).toBe('free')
    expect(state.city).toBe('taipei')
    expect(state.sort).toBe('priceAsc')
    expect(state.view).toBe('featured')
  })

  it('reads every valid, whitelisted advanced volleyball value', () => {
    const params = new URLSearchParams(
      'position=setter&playStyle=competitive&netHeight=mixed&format=sixPlayer&surface=wood'
      + '&rotation=true&soloJoin=true&equipment=volleyball&includeOpenLevel=true&includeOpenGender=true&dateRange=weekend',
    )
    const state = parseExploreParams(params)
    expect(state.position).toBe('setter')
    expect(state.playStyle).toBe('competitive')
    expect(state.netHeight).toBe('mixed')
    expect(state.format).toBe('sixPlayer')
    expect(state.surface).toBe('wood')
    expect(state.rotation).toBe('true')
    expect(state.soloJoin).toBe('true')
    expect(state.equipment).toBe('volleyball')
    expect(state.includeOpenLevel).toBe('true')
    expect(state.includeOpenGender).toBe('true')
    expect(state.dateRange).toBe('weekend')
  })

  it('falls back to the default for any value not on the whitelist, instead of keeping an unmatchable value', () => {
    const params = new URLSearchParams('level=abc&type=wrong&price=nope&city=nowhere&sort=random&view=bogus&rotation=maybe&position=goalkeeper&dateRange=next-tuesday')
    const state = parseExploreParams(params)
    expect(state.level).toBe('all')
    expect(state.type).toBe('all')
    expect(state.price).toBe('all')
    expect(state.city).toBe('all')
    expect(state.sort).toBe('default')
    expect(state.view).toBe('all')
    expect(state.rotation).toBe('all')
    expect(state.position).toBe('all')
    expect(state.dateRange).toBe('all')
  })

  it('treats an unknown price bracket the same way as any other unknown filter value (falls back to "all", not silently matching everything)', () => {
    const state = parseExploreParams(new URLSearchParams('price=under300'))
    expect(state.price).toBe('all')
  })

  it('a boolean flag only accepts the literal "true" — anything else (including "false" or "1") falls back to "all"/off', () => {
    expect(parseExploreParams(new URLSearchParams('rotation=false')).rotation).toBe('all')
    expect(parseExploreParams(new URLSearchParams('soloJoin=1')).soloJoin).toBe('all')
    expect(parseExploreParams(new URLSearchParams('includeOpenGender=yes')).includeOpenGender).toBe('all')
  })

  it('reads urgentOnly=true, and rejects any other raw value', () => {
    expect(parseExploreParams(new URLSearchParams('urgentOnly=true')).urgentOnly).toBe('true')
    expect(parseExploreParams(new URLSearchParams('urgentOnly=false')).urgentOnly).toBe('all')
    expect(parseExploreParams(new URLSearchParams('urgentOnly=1')).urgentOnly).toBe('all')
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

  it('writes advanced volleyball filters and boolean flags the same way as any other filter', () => {
    const params = sanitizeExploreParams({
      ...DEFAULT_EXPLORE_STATE, position: 'libero', rotation: 'true', dateRange: 'today',
    })
    expect(params.get('position')).toBe('libero')
    expect(params.get('rotation')).toBe('true')
    expect(params.get('dateRange')).toBe('today')
  })

  it('writes urgentOnly=true only when explicitly set, never as a default-visible key', () => {
    expect(sanitizeExploreParams({ ...DEFAULT_EXPLORE_STATE, urgentOnly: 'true' }).get('urgentOnly')).toBe('true')
    expect(sanitizeExploreParams(DEFAULT_EXPLORE_STATE).has('urgentOnly')).toBe(false)
  })

  it('produces a stable, canonical key order regardless of insertion order in the input state', () => {
    const a = sanitizeExploreParams({ ...DEFAULT_EXPLORE_STATE, city: 'taipei', type: 'beach', rotation: 'true' })
    const b = sanitizeExploreParams({ ...DEFAULT_EXPLORE_STATE, rotation: 'true', type: 'beach', city: 'taipei' })
    expect(a.toString()).toBe(b.toString())
  })

  it('round-trips through parse -> sanitize to the same canonical form', () => {
    const raw = new URLSearchParams('type=beach&city=taoyuan&q=%20cup%20')
    const roundTripped = sanitizeExploreParams(parseExploreParams(raw))
    expect(roundTripped.get('type')).toBe('beach')
    expect(roundTripped.get('city')).toBe('taoyuan')
    expect(roundTripped.get('q')).toBe('cup') // trimmed
  })
})

describe('filter key groupings', () => {
  it('BASIC_FILTER_KEYS, dateRange, QUICK_FILTER_KEYS and ADVANCED_FILTER_KEYS together make up FILTER_KEYS', () => {
    expect(new Set([...BASIC_FILTER_KEYS, 'dateRange', ...QUICK_FILTER_KEYS, ...ADVANCED_FILTER_KEYS])).toEqual(new Set(FILTER_KEYS))
  })

  it('QUICK_FILTER_KEYS is exactly urgentOnly — a hard flag, not a soft PreferencesContext dimension', () => {
    expect(QUICK_FILTER_KEYS).toEqual(['urgentOnly'])
  })

  it('BASIC_FILTER_KEYS is exactly the 5 dimensions PreferencesContext/matchState compare', () => {
    expect(BASIC_FILTER_KEYS).toEqual(Object.keys(DEFAULT_FILTERS))
  })
})

describe('getPreferencesSyncPatch', () => {
  it('returns null when the URL has no filter keys at all — Context is left alone', () => {
    const params = new URLSearchParams('q=hello')
    const urlFilters = { ...DEFAULT_FILTERS }
    const contextFilters = { ...DEFAULT_FILTERS, city: 'taoyuan' } // some pre-existing stored preference
    expect(getPreferencesSyncPatch(params, urlFilters, contextFilters)).toBeNull()
  })

  it('returns the URL-derived filters when the URL has a filter key and Context disagrees', () => {
    const params = new URLSearchParams('type=indoor&level=advanced')
    const urlFilters = { ...DEFAULT_FILTERS, type: 'indoor', level: 'advanced' }
    const contextFilters = { ...DEFAULT_FILTERS }
    expect(getPreferencesSyncPatch(params, urlFilters, contextFilters)).toEqual(urlFilters)
  })

  it('returns null when Context already matches the URL — no redundant write', () => {
    const params = new URLSearchParams('type=indoor')
    const urlFilters = { ...DEFAULT_FILTERS, type: 'indoor' }
    const contextFilters = { ...DEFAULT_FILTERS, type: 'indoor' }
    expect(getPreferencesSyncPatch(params, urlFilters, contextFilters)).toBeNull()
  })

  it('only ever hands back already-validated values — an invalid raw param never reaches Context because urlFilters was pre-sanitized by parseExploreParams', () => {
    const params = new URLSearchParams('level=abc') // invalid, key present
    const urlFilters = parseExploreParams(params) // level falls back to 'all' internally
    const contextFilters = { ...DEFAULT_FILTERS, level: 'advanced' }
    const patch = getPreferencesSyncPatch(params, urlFilters, contextFilters)
    expect(patch.level).toBe('all') // the safe fallback, never the raw "abc"
  })

  it('ignores advanced/volleyball-specific URL params — an activity-format-only search does not touch Context', () => {
    const params = new URLSearchParams('format=sixPlayer')
    const urlFilters = parseExploreParams(params)
    const contextFilters = { ...DEFAULT_FILTERS }
    expect(getPreferencesSyncPatch(params, urlFilters, contextFilters)).toBeNull()
  })

  it('the returned patch only ever contains the 5 basic keys, never the advanced ones', () => {
    const params = new URLSearchParams('type=indoor&position=setter')
    const urlFilters = parseExploreParams(params)
    const contextFilters = { ...DEFAULT_FILTERS }
    const patch = getPreferencesSyncPatch(params, urlFilters, contextFilters)
    expect(Object.keys(patch).sort()).toEqual(BASIC_FILTER_KEYS.slice().sort())
  })
})
