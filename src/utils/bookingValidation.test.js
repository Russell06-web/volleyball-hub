import { describe, expect, it } from 'vitest'
import { isValidTaiwanMobile, validateRegistrant } from './bookingValidation'

const openEvent = { registeredCount: 8, capacity: 10, status: 'published' }
const fullEvent = { registeredCount: 10, capacity: 10, status: 'published' }

describe('isValidTaiwanMobile', () => {
  it('accepts a valid mobile number with or without dashes', () => {
    expect(isValidTaiwanMobile('0912-345-678')).toBe(true)
    expect(isValidTaiwanMobile('0912345678')).toBe(true)
  })

  it('rejects numbers that are the wrong length, prefix, or not a phone at all', () => {
    expect(isValidTaiwanMobile('091234567')).toBe(false)
    expect(isValidTaiwanMobile('0212345678')).toBe(false)
    expect(isValidTaiwanMobile('not a phone')).toBe(false)
    expect(isValidTaiwanMobile('')).toBe(false)
  })
})

describe('validateRegistrant — individual', () => {
  it('rejects a whitespace-only name', () => {
    const result = validateRegistrant({ mode: 'individual', name: '   ', phone: '0912-345-678', agree: true }, openEvent)
    expect(result.valid).toBe(false)
    expect(result.errors.name).toBeTruthy()
  })

  it('rejects when the agreement checkbox is not checked', () => {
    const result = validateRegistrant({ mode: 'individual', name: '王小明', phone: '0912-345-678', agree: false }, openEvent)
    expect(result.valid).toBe(false)
    expect(result.errors.agree).toBeTruthy()
  })

  it('succeeds with a valid name, phone, and agreement', () => {
    const result = validateRegistrant({ mode: 'individual', name: '王小明', phone: '0912-345-678', agree: true }, openEvent)
    expect(result.valid).toBe(true)
  })
})

describe('validateRegistrant — team', () => {
  const base = { mode: 'team', name: '王小明', phone: '0912-345-678', agree: true, teamName: '週三固定班' }

  it('succeeds with a valid team size within the remaining slots', () => {
    const result = validateRegistrant({ ...base, teamSize: 2 }, openEvent)
    expect(result.valid).toBe(true)
  })

  it('rejects a team size below the 2-person minimum', () => {
    const result = validateRegistrant({ ...base, teamSize: 1 }, openEvent)
    expect(result.valid).toBe(false)
    expect(result.errors.teamSize).toBeTruthy()
  })

  it('rejects a non-integer team size', () => {
    const result = validateRegistrant({ ...base, teamSize: 2.5 }, openEvent)
    expect(result.valid).toBe(false)
    expect(result.errors.teamSize).toBeTruthy()
  })

  it('rejects a NaN team size', () => {
    const result = validateRegistrant({ ...base, teamSize: 'abc' }, openEvent)
    expect(result.valid).toBe(false)
    expect(result.errors.teamSize).toBeTruthy()
  })

  it('rejects a team size larger than what remains on the event (2 slots left, asks for 6)', () => {
    const result = validateRegistrant({ ...base, teamSize: 6 }, openEvent)
    expect(result.valid).toBe(false)
    expect(result.errors.teamSize).toBe('目前僅剩 2 個名額，請調整隊伍人數。')
  })

  it('does not enforce the remaining-slots cap once the event is already full (waitlist path)', () => {
    const result = validateRegistrant({ ...base, teamSize: 6 }, fullEvent)
    expect(result.valid).toBe(true)
  })

  it('rejects a team size above the sanity upper bound even when slots are available', () => {
    const bigEvent = { registeredCount: 0, capacity: 500, status: 'published' }
    const result = validateRegistrant({ ...base, teamSize: 999 }, bigEvent)
    expect(result.valid).toBe(false)
    expect(result.errors.teamSize).toBeTruthy()
  })
})
