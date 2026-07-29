import { describe, expect, it } from 'vitest'
import { isQuickJoinReady } from './quickJoin'

const readyProfile = { name: '王小明', phone: '0912-345-678', quickJoinEnabled: true }

describe('isQuickJoinReady', () => {
  it('is ready when enabled with a real name and valid phone', () => {
    expect(isQuickJoinReady(readyProfile)).toBe(true)
  })

  it('is not ready when quickJoinEnabled is off, even with valid data', () => {
    expect(isQuickJoinReady({ ...readyProfile, quickJoinEnabled: false })).toBe(false)
  })

  it('is not ready without a usable name', () => {
    expect(isQuickJoinReady({ ...readyProfile, name: '   ' })).toBe(false)
    expect(isQuickJoinReady({ ...readyProfile, name: '' })).toBe(false)
  })

  it('is not ready without a valid Taiwan mobile number', () => {
    expect(isQuickJoinReady({ ...readyProfile, phone: '123' })).toBe(false)
    expect(isQuickJoinReady({ ...readyProfile, phone: '' })).toBe(false)
  })

  it('handles a missing profile object without throwing', () => {
    expect(isQuickJoinReady(null)).toBe(false)
    expect(isQuickJoinReady(undefined)).toBe(false)
  })
})
