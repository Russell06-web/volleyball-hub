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

  it('resolves volleyball-specific advanced filter values to their labels', () => {
    expect(getLabelForFilter('position', 'setter')).toBe('舉球')
    expect(getLabelForFilter('playStyle', 'competitive')).toBe('競技對抗')
    expect(getLabelForFilter('netHeight', 'mixed')).toBe('混合網')
    expect(getLabelForFilter('format', 'sixPlayer')).toBe('六人制')
    expect(getLabelForFilter('surface', 'sand')).toBe('沙地')
    expect(getLabelForFilter('equipment', 'volleyball')).toBe('球')
    expect(getLabelForFilter('dateRange', 'weekend')).toBe('週末')
  })

  it('gives boolean-flag filters a fixed, readable chip label instead of the literal "true"', () => {
    expect(getLabelForFilter('rotation', 'true')).toBe('需要輪轉')
    expect(getLabelForFilter('soloJoin', 'true')).toBe('允許單人加入')
    expect(getLabelForFilter('includeOpenLevel', 'true')).toBe('含未限制程度')
    expect(getLabelForFilter('includeOpenGender', 'true')).toBe('含未限制性別')
  })
})
