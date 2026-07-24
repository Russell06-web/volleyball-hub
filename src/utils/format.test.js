import { describe, expect, it } from 'vitest'
import { formatPrice } from './format'

describe('formatPrice', () => {
  it('always shows 免費 for free events, regardless of a stray price value', () => {
    expect(formatPrice(0, true)).toBe('免費')
    expect(formatPrice(180, true)).toBe('免費')
  })

  it('shows 免費 for a zero price even if free is not explicitly set', () => {
    expect(formatPrice(0, false)).toBe('免費')
  })

  it('formats a real price with the NT$ prefix via Intl.NumberFormat', () => {
    expect(formatPrice(280, false)).toBe('NT$280')
    expect(formatPrice(1200, false)).toBe('NT$1,200')
  })
})
