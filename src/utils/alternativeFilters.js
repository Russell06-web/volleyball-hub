import { FILTER_ALL } from '../constants/taxonomy'

// Human-readable "what would change" copy for dropping each dimension
// back to "all". Only the dimensions with a real everyday equivalent to
// "show me more" are listed — position/format/etc. all read the same way
// ("顯示所有／不限 X 的活動"), so a visitor always knows exactly what
// clicking a suggestion will do before they click it.
const DROP_FILTER_LABELS = {
  type: '顯示所有類型的活動',
  gender: '顯示所有性別限制的活動',
  level: '顯示所有程度限制的活動',
  price: '顯示所有價格範圍的活動',
  city: '顯示所有城市的活動',
  dateRange: '顯示所有日期的活動',
  position: '顯示不限位置需求的活動',
  playStyle: '顯示所有活動風格的活動',
  netHeight: '顯示所有網高的活動',
  format: '顯示所有球制的活動',
  surface: '顯示所有場地材質的活動',
  equipment: '顯示不限提供設備的活動',
  rotation: '顯示不要求輪轉的活動',
  soloJoin: '顯示不限單人加入規則的活動',
}

// Turning these ON is a widen, not a "reset" — includeOpenLevel/Gender
// default to off, so the useful suggestion is switching them on while
// keeping the level/gender filter itself intact (see
// docs/PRODUCT_DECISIONS.md on why "open" is never silently treated as a
// match without this explicit opt-in).
const WIDEN_LABELS = {
  includeOpenLevel: '包含程度不限的活動',
  includeOpenGender: '包含性別不限的活動',
}

const DEFAULT_MAX_SUGGESTIONS = 3

// Every candidate is verified against getCountForState before it is ever
// returned — nothing here is guessed, random, or "AI": it is exactly
// "if you relaxed this one condition, you would see N more results",
// checked for real against the caller's actual event list. Suggestions
// that don't genuinely increase the result count are never offered, and
// the strongest ones (biggest jump in count) come first.
//
// `getCountForState(candidateState)` is supplied by the caller (Explore
// already has one via matchesFilters/matchesSearch/visibleEvents) so this
// stays a pure function with no dependency on the filtering
// implementation itself.
export function getAlternativeFilterSuggestions(state, currentCount, getCountForState, { max = DEFAULT_MAX_SUGGESTIONS } = {}) {
  const candidates = []

  Object.keys(DROP_FILTER_LABELS).forEach((key) => {
    if (!state || state[key] === undefined || state[key] === FILTER_ALL) return
    const count = getCountForState({ ...state, [key]: FILTER_ALL })
    if (count > currentCount) {
      candidates.push({ id: `drop-${key}`, label: DROP_FILTER_LABELS[key], patch: { [key]: FILTER_ALL }, resultCount: count })
    }
  })

  Object.keys(WIDEN_LABELS).forEach((key) => {
    if (!state || state[key] === 'true') return
    const count = getCountForState({ ...state, [key]: 'true' })
    if (count > currentCount) {
      candidates.push({ id: `widen-${key}`, label: WIDEN_LABELS[key], patch: { [key]: 'true' }, resultCount: count })
    }
  })

  if (state?.q && state.q.trim()) {
    const count = getCountForState({ ...state, q: '' })
    if (count > currentCount) {
      candidates.push({ id: 'clear-search', label: '清除搜尋文字，只依篩選條件顯示活動', patch: { q: '' }, resultCount: count })
    }
  }

  candidates.sort((a, b) => b.resultCount - a.resultCount)
  return candidates.slice(0, max)
}
