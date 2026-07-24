import { describe, expect, it } from 'vitest'
import { matchesPriceBracket } from './priceBracket'

describe('matchesPriceBracket', () => {
  it('treats "全部" as matching any price', () => {
    expect(matchesPriceBracket(0, '全部')).toBe(true)
    expect(matchesPriceBracket(9999, '全部')).toBe(true)
  })

  it('includes the boundary value in both adjacent brackets on purpose', () => {
    expect(matchesPriceBracket(300, 'NT$ 300 以下')).toBe(true)
    expect(matchesPriceBracket(300, 'NT$ 300–500')).toBe(true)
    expect(matchesPriceBracket(500, 'NT$ 300–500')).toBe(true)
    expect(matchesPriceBracket(500, 'NT$ 500 以上')).toBe(true)
  })

  it('excludes prices clearly outside a bracket', () => {
    expect(matchesPriceBracket(301, 'NT$ 300 以下')).toBe(false)
    expect(matchesPriceBracket(200, 'NT$ 300–500')).toBe(false)
    expect(matchesPriceBracket(499, 'NT$ 500 以上')).toBe(false)
  })
})
