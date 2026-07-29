import { describe, expect, it } from 'vitest'
import { buildFromState, resolveBackTo } from './navigation'

describe('buildFromState', () => {
  it('captures pathname and search from a location object', () => {
    const location = { pathname: '/explore', search: '?type=beach&sort=dateAsc' }
    expect(buildFromState(location)).toEqual({ from: { pathname: '/explore', search: '?type=beach&sort=dateAsc' } })
  })
})

describe('resolveBackTo', () => {
  it('reconstructs the full path + query string from a from object', () => {
    expect(resolveBackTo({ pathname: '/explore', search: '?q=%E5%8F%B0%E5%8C%97' })).toBe('/explore?q=%E5%8F%B0%E5%8C%97')
  })

  it('falls back to /explore when there is no from at all (e.g. a direct event URL)', () => {
    expect(resolveBackTo(undefined)).toBe('/explore')
    expect(resolveBackTo(null)).toBe('/explore')
  })

  it('accepts a custom fallback', () => {
    expect(resolveBackTo(null, '/favorites')).toBe('/favorites')
  })

  it('handles a from with no search string', () => {
    expect(resolveBackTo({ pathname: '/favorites', search: '' })).toBe('/favorites')
  })
})
