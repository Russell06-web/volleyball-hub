import { describe, expect, it } from 'vitest'
import { matchesPriceBracket } from './priceBracket'

describe('matchesPriceBracket', () => {
  it('treats "all" as matching any price', () => {
    expect(matchesPriceBracket(0, 'all')).toBe(true)
    expect(matchesPriceBracket(9999, 'all')).toBe(true)
  })

  it('free only matches price === 0', () => {
    expect(matchesPriceBracket(0, 'free')).toBe(true)
    expect(matchesPriceBracket(1, 'free')).toBe(false)
  })

  it('brackets are mutually exclusive at the 300 boundary', () => {
    expect(matchesPriceBracket(300, 'underOrEqual300')).toBe(true)
    expect(matchesPriceBracket(300, 'between301And500')).toBe(false)
    expect(matchesPriceBracket(301, 'underOrEqual300')).toBe(false)
    expect(matchesPriceBracket(301, 'between301And500')).toBe(true)
  })

  it('brackets are mutually exclusive at the 500 boundary', () => {
    expect(matchesPriceBracket(500, 'between301And500')).toBe(true)
    expect(matchesPriceBracket(500, 'over500')).toBe(false)
    expect(matchesPriceBracket(501, 'between301And500')).toBe(false)
    expect(matchesPriceBracket(501, 'over500')).toBe(true)
  })

  it('underOrEqual300 excludes free (price must be >= 1)', () => {
    expect(matchesPriceBracket(0, 'underOrEqual300')).toBe(false)
    expect(matchesPriceBracket(1, 'underOrEqual300')).toBe(true)
    expect(matchesPriceBracket(1, 'free')).toBe(false)
  })

  it('excludes prices clearly outside a bracket', () => {
    expect(matchesPriceBracket(1000, 'underOrEqual300')).toBe(false)
    expect(matchesPriceBracket(50, 'between301And500')).toBe(false)
    expect(matchesPriceBracket(499, 'over500')).toBe(false)
  })
})
