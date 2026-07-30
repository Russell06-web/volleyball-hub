import { sanitizeExploreParams } from './exploreParams'
import { SORTS } from '../constants/taxonomy'
import { getLabelForFilter } from './exploreFilterLabels'

export const MAX_SAVED_SEARCHES = 5
export const MIN_NAME_LENGTH = 1
export const MAX_NAME_LENGTH = 20

export function normalizeSavedSearchName(value) {
  return String(value || '').trim()
}

export function validateSavedSearchName(name, existing) {
  const trimmed = normalizeSavedSearchName(name)
  if (trimmed.length < MIN_NAME_LENGTH) return '請輸入名稱'
  if (trimmed.length > MAX_NAME_LENGTH) return `名稱請在 ${MAX_NAME_LENGTH} 字以內`
  if (existing.some((s) => s.name === trimmed)) return '已經有同名的儲存條件，請換個名稱或先刪除舊的'
  return null
}

// A saved search only ever stores a filters+sort combination that's
// actually reusable — never the search text (a saved "condition set" you
// re-apply later means little once it's tied to one specific typed
// phrase), never the current section view (that's a display toggle, not
// a condition), and never a default/invalid value (nothing to "apply"
// there). Reuses sanitizeExploreParams so a saved search is validated
// exactly the same way a URL is.
export function buildSavedSearchFilters(state) {
  const params = sanitizeExploreParams({ ...state, q: '', view: 'all' })
  const filters = {}
  for (const [key, value] of params.entries()) {
    if (key === 'sort') continue
    filters[key] = value
  }
  const sort = params.get('sort') || 'default'
  return { filters, sort }
}

export function sanitizeSavedSearches(raw) {
  if (!Array.isArray(raw)) return []
  return raw
    .filter((s) => s && typeof s === 'object' && typeof s.id === 'string' && typeof s.name === 'string')
    .slice(0, MAX_SAVED_SEARCHES)
    .map((s) => ({
      id: s.id,
      name: s.name,
      filters: s.filters && typeof s.filters === 'object' ? s.filters : {},
      sort: typeof s.sort === 'string' ? s.sort : 'default',
      createdAt: typeof s.createdAt === 'number' ? s.createdAt : Date.now(),
    }))
}

// Rebuilds an actual /explore?... query string from a saved entry,
// re-validating through sanitizeExploreParams so a saved search can never
// apply a value that would no longer be legal (e.g. a taxonomy option
// that was removed since it was saved).
export function savedSearchToQueryString(saved) {
  const params = sanitizeExploreParams({ ...saved.filters, sort: saved.sort, q: '', view: 'all' })
  const query = params.toString()
  return query ? `?${query}` : ''
}

// Shared by Profile's saved-search list and Explore's "常用的探索條件"
// strip — one short, readable summary of what a saved search actually
// applies, so the two places never phrase the same saved entry two
// different ways.
export function summarizeSavedSearchFilters(saved) {
  const parts = Object.entries(saved.filters).map(([key, value]) => getLabelForFilter(key, value))
  if (saved.sort && saved.sort !== 'default') {
    parts.push(SORTS.find((s) => s.value === saved.sort)?.label || saved.sort)
  }
  return parts.length > 0 ? parts.join('・') : '無篩選條件（僅排序）'
}
