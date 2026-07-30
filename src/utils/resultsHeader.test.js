import { describe, expect, it } from 'vitest'
import { getResultsHeaderHeading, getResultsHeaderMeta } from './resultsHeader'

describe('getResultsHeaderHeading', () => {
  it('search only', () => {
    expect(getResultsHeaderHeading(true, false, '台北')).toBe('「台北」的搜尋結果')
  })
  it('filter only', () => {
    expect(getResultsHeaderHeading(false, true, '')).toBe('篩選結果')
  })
  it('search and filter', () => {
    expect(getResultsHeaderHeading(true, true, '台北')).toBe('搜尋與篩選結果')
  })
  it('trims the query before quoting it', () => {
    expect(getResultsHeaderHeading(true, false, '  台北  ')).toBe('「台北」的搜尋結果')
  })
})

describe('getResultsHeaderMeta', () => {
  it('search only never mentions applied-filter count', () => {
    const meta = getResultsHeaderMeta({ isSearching: true, isFiltering: false, query: '台北', count: 4, appliedFilterCount: 0 })
    expect(meta).toBe('共 4 場')
  })
  it('filter only shows the applied-filter count', () => {
    const meta = getResultsHeaderMeta({ isSearching: false, isFiltering: true, query: '', count: 6, appliedFilterCount: 3 })
    expect(meta).toBe('共 6 場・已套用 3 個條件')
  })
  it('search and filter shows the query, count, and applied-filter count together', () => {
    const meta = getResultsHeaderMeta({ isSearching: true, isFiltering: true, query: '台北', count: 3, appliedFilterCount: 2 })
    expect(meta).toBe('「台北」・共 3 場・已套用 2 個條件')
  })
})
