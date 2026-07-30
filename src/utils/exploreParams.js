import { CITIES, EVENT_TYPES, FILTER_ALL, GENDERS, LEVELS, PRICE_BRACKETS, SECTION_VIEW, SORTS } from '../constants/taxonomy'
import {
  COURT_SURFACES, EQUIPMENT_OPTIONS, NET_HEIGHTS, PLAY_STYLES, POSITIONS, VOLLEYBALL_FORMATS,
} from '../constants/volleyballTaxonomy'
import { DATE_RANGES } from './dateRange'

// The five general-platform dimensions PreferencesContext/matchState.js
// know about — EventDetail's condition-match explanation is scoped to
// exactly these, on purpose (see docs/PRODUCT_DECISIONS.md): they're the
// ones with real "did the organiser leave this unspecified" ambiguity
// worth explaining. The volleyball-specific ones below are objective
// hard facts (a setter slot is open or it isn't), so they only ever
// filter Explore's list — they never feed the soft condition-match story.
export const BASIC_FILTER_KEYS = ['type', 'gender', 'level', 'price', 'city']

// Volleyball-specific "進階排球條件" — collapsed by default in both the
// desktop sidebar and the mobile accordion so a first-time visitor isn't
// faced with sixteen controls at once (progressive disclosure).
export const ADVANCED_FILTER_KEYS = [
  'position', 'playStyle', 'netHeight', 'format', 'surface',
  'rotation', 'soloJoin', 'equipment', 'includeOpenLevel', 'includeOpenGender',
]

// "僅看臨打" (urgentOnly) is a hard boolean flag like rotation/soloJoin —
// not a soft preference PreferencesContext/matchState.js explains — but it
// lives in the always-visible basic section next to 活動類型, not the
// collapsed advanced accordion (see FilterPanel.jsx), so it gets its own
// small group rather than folding into BASIC_FILTER_KEYS or
// ADVANCED_FILTER_KEYS.
export const QUICK_FILTER_KEYS = ['urgentOnly']

// Every filter key Explore's URL/hard-filter/active-chips care about.
// `dateRange` sits with the "quick" filters (not the advanced/collapsed
// group) per the IA brief — date is a everyday decision, not a
// volleyball-specific nuance.
export const FILTER_KEYS = [...BASIC_FILTER_KEYS, 'dateRange', ...QUICK_FILTER_KEYS, ...ADVANCED_FILTER_KEYS]

const VALID_VALUES = {
  type: new Set([FILTER_ALL, ...EVENT_TYPES.map((t) => t.value)]),
  gender: new Set([FILTER_ALL, ...GENDERS.map((g) => g.value)]),
  level: new Set([FILTER_ALL, ...LEVELS.map((l) => l.value)]),
  price: new Set([FILTER_ALL, ...PRICE_BRACKETS.map((p) => p.value)]),
  city: new Set([FILTER_ALL, ...CITIES.map((c) => c.value)]),
  dateRange: new Set([FILTER_ALL, ...DATE_RANGES.map((d) => d.value)]),
  position: new Set([FILTER_ALL, ...POSITIONS.map((p) => p.value)]),
  playStyle: new Set([FILTER_ALL, ...PLAY_STYLES.map((p) => p.value)]),
  netHeight: new Set([FILTER_ALL, ...NET_HEIGHTS.map((n) => n.value)]),
  format: new Set([FILTER_ALL, ...VOLLEYBALL_FORMATS.map((f) => f.value)]),
  surface: new Set([FILTER_ALL, ...COURT_SURFACES.map((s) => s.value)]),
  equipment: new Set([FILTER_ALL, ...EQUIPMENT_OPTIONS.map((e) => e.value)]),
  // Boolean-flag filters use the same string-whitelist pattern as
  // everything else instead of a special boolean code path: 'true' means
  // on, FILTER_ALL ('all') means off/not filtered.
  rotation: new Set([FILTER_ALL, 'true']),
  soloJoin: new Set([FILTER_ALL, 'true']),
  includeOpenLevel: new Set([FILTER_ALL, 'true']),
  includeOpenGender: new Set([FILTER_ALL, 'true']),
  urgentOnly: new Set([FILTER_ALL, 'true']),
  sort: new Set(SORTS.map((s) => s.value)),
  view: new Set(Object.values(SECTION_VIEW)),
}

export const DEFAULT_EXPLORE_STATE = {
  q: '',
  ...Object.fromEntries(FILTER_KEYS.map((key) => [key, FILTER_ALL])),
  sort: 'default',
  view: SECTION_VIEW.ALL,
}

// Reads raw URLSearchParams into a fully-valid state object. Any value
// that isn't on the relevant whitelist (e.g. ?level=abc, ?type=wrong,
// ?rotation=maybe) is silently treated as "not set" rather than being
// kept around as a value nothing can ever match — the alternative is a
// filter chip that *looks* selected but the list is permanently empty
// underneath it.
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
// address bar currently holds. Key order always follows FILTER_KEYS, so
// two states that mean the same thing always produce the same string.
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

// Decides whether Explore's URL-derived filters should be written into
// PreferencesContext (so EventDetail — which reads Context directly —
// sees the same condition-match filters the user just used on Explore).
// Pure on purpose: `urlFilters` is always already validated by
// parseExploreParams before this runs, so there is no path where an
// invalid raw query value (e.g. ?level=abc) reaches Context — it was
// already replaced with its safe default before this function ever sees
// it. Only ever looks at BASIC_FILTER_KEYS — the volleyball-specific
// advanced filters are hard filters, not soft preferences to explain on
// EventDetail (see docs/PRODUCT_DECISIONS.md). Returns the filters object
// to write, or null when nothing should change.
export function getPreferencesSyncPatch(searchParams, urlFilters, currentContextFilters) {
  const urlHasAnyFilterKey = BASIC_FILTER_KEYS.some((key) => searchParams.has(key))
  if (!urlHasAnyFilterKey) return null
  const alreadyInSync = BASIC_FILTER_KEYS.every((key) => currentContextFilters[key] === urlFilters[key])
  if (alreadyInSync) return null
  const patch = {}
  BASIC_FILTER_KEYS.forEach((key) => { patch[key] = urlFilters[key] })
  return patch
}
