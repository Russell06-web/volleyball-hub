import { CITIES, EVENT_TYPES, FILTER_ALL, GENDERS, LEVELS, PRICE_BRACKETS, SECTION_VIEW, SORTS } from '../constants/taxonomy'

// Every filter dimension Explore's URL can carry, in the order they're
// rendered. Kept in one place so nothing has to remember the list twice.
export const FILTER_KEYS = ['type', 'gender', 'level', 'price', 'city']

const VALID_VALUES = {
  type: new Set([FILTER_ALL, ...EVENT_TYPES.map((t) => t.value)]),
  gender: new Set([FILTER_ALL, ...GENDERS.map((g) => g.value)]),
  level: new Set([FILTER_ALL, ...LEVELS.map((l) => l.value)]),
  price: new Set([FILTER_ALL, ...PRICE_BRACKETS.map((p) => p.value)]),
  city: new Set([FILTER_ALL, ...CITIES.map((c) => c.value)]),
  sort: new Set(SORTS.map((s) => s.value)),
  view: new Set(Object.values(SECTION_VIEW)),
}

export const DEFAULT_EXPLORE_STATE = {
  q: '',
  type: FILTER_ALL,
  gender: FILTER_ALL,
  level: FILTER_ALL,
  price: FILTER_ALL,
  city: FILTER_ALL,
  sort: 'default',
  view: SECTION_VIEW.ALL,
}

// Reads raw URLSearchParams into a fully-valid state object. Any value
// that isn't on the relevant whitelist (e.g. ?level=abc, ?type=wrong) is
// silently treated as "not set" rather than being kept around as a value
// nothing can ever match — the alternative is a filter chip that *looks*
// selected but the list is permanently empty underneath it.
export function parseExploreParams(searchParams) {
  const state = { ...DEFAULT_EXPLORE_STATE }
  state.q = searchParams.get('q') || ''

  FILTER_KEYS.forEach((key) => {
    const raw = searchParams.get(key)
    if (raw && VALID_VALUES[key].has(raw)) state[key] = raw
  })

  const rawSort = searchParams.get('sort')
  if (rawSort && VALID_VALUES.sort.has(rawSort)) state.sort = rawSort

  const rawView = searchParams.get('view')
  if (rawView && VALID_VALUES.view.has(rawView)) state.view = rawView

  return state
}

// Turns a full state object back into a URLSearchParams containing only
// the non-default, whitelisted keys — used both to write the URL after a
// user action, and to canonicalise (strip invalid/default) whatever the
// address bar currently holds.
export function sanitizeExploreParams(state) {
  const params = new URLSearchParams()
  const q = (state.q || '').trim()
  if (q) params.set('q', q)

  FILTER_KEYS.forEach((key) => {
    const value = state[key]
    if (value && value !== FILTER_ALL && VALID_VALUES[key].has(value)) params.set(key, value)
  })

  if (state.sort && state.sort !== DEFAULT_EXPLORE_STATE.sort && VALID_VALUES.sort.has(state.sort)) {
    params.set('sort', state.sort)
  }
  if (state.view && state.view !== DEFAULT_EXPLORE_STATE.view && VALID_VALUES.view.has(state.view)) {
    params.set('view', state.view)
  }

  return params
}

// Convenience for "does the URLSearchParams need to be rewritten to its
// canonical form" — true whenever it holds an invalid value, a
// default-valued key, or keys in a different order than sanitize would
// produce (URLSearchParams.toString() order follows insertion order, so
// this also naturally settles on a stable key order).
export function needsSanitizing(searchParams) {
  return sanitizeExploreParams(parseExploreParams(searchParams)).toString() !== searchParams.toString()
}
