// Pure text-building for Explore's unified Results Header (search count +
// filter count + sort, collapsed into one heading instead of three
// overlapping pieces of copy — see docs/PRODUCT_DECISIONS.md). Kept as
// plain functions so the exact wording for each of the three states
// (search-only / filter-only / search+filter) is unit-testable without
// rendering the page.
export function getResultsHeaderHeading(isSearching, isFiltering, query) {
  if (isSearching && isFiltering) return '搜尋與篩選結果'
  if (isSearching) return `「${query.trim()}」的搜尋結果`
  return '篩選結果'
}

export function getResultsHeaderMeta({ isSearching, isFiltering, query, count, appliedFilterCount }) {
  if (isSearching && isFiltering) return `「${query.trim()}」・共 ${count} 場・已套用 ${appliedFilterCount} 個條件`
  if (isSearching) return `共 ${count} 場`
  return `共 ${count} 場・已套用 ${appliedFilterCount} 個條件`
}
