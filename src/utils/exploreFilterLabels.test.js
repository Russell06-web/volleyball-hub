import { describe, expect, it } from 'vitest'
import { getLabelForFilter } from './exploreFilterLabels'

describe('getLabelForFilter', () => {
  it('returns the taxonomy display label, never the raw enum value', () => {
    expect(getLabelForFilter('city', 'taipei')).toBe('台北')
    expect(getLabelForFilter('level', 'intermediate')).toBe('中階')
    expect(getLabelForFilter('gender', 'mixed')).toBe('混合')
    expect(getLabelForFilter('price', 'free')).toBe('免費')
    expect(getLabelForFilter('type', 'beach')).toBe('沙灘排球')
  })
})
