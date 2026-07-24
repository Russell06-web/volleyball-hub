import { describe, expect, it } from 'vitest'
import { matchesPriceBracket } from './priceBracket'

describe('matchesPriceBracket', () => {
  it('treats "all" as matching any price', () => {
    expect(matchesPriceBracket(0, 'all')).toBe(true)
    expect(matchesPriceBracket(9999, 'all')).toBe(true)
  })

  it('includes the boundary value in both adjacent brackets on purpose', () => {
    expect(matchesPriceBracket(300, 'under300')).toBe(true)
    expect(matchesPriceBracket(300, '300to500')).toBe(true)
    expect(matchesPriceBracket(500, '300to500')).toBe(true)
    expect(matchesPriceBracket(500, 'over500')).toBe(true)
  })

  it('excludes prices clearly outside a bracket', () => {
    expect(matchesPriceBracket(301, 'under300')).toBe(false)
    expect(matchesPriceBracket(200, '300to500')).toBe(false)
    expect(matchesPriceBracket(499, 'over500')).toBe(false)
  })
})
