import { describe, expect, it } from 'vitest'
import { getWaitlistPosition } from './waitlistPosition'

function wb(id, eventId, createdAt, status = 'waitlist') {
  return { id, eventId, createdAt, status }
}

describe('getWaitlistPosition', () => {
  it('returns 1-based position ordered by createdAt ascending', () => {
    const bookings = [wb('b3', 'e1', 300), wb('b1', 'e1', 100), wb('b2', 'e1', 200)]
    expect(getWaitlistPosition(bookings, 'e1', 'b1')).toBe(1)
    expect(getWaitlistPosition(bookings, 'e1', 'b2')).toBe(2)
    expect(getWaitlistPosition(bookings, 'e1', 'b3')).toBe(3)
  })

  it('excludes cancelled waitlist entries from the ordering entirely', () => {
    const bookings = [wb('b1', 'e1', 100), wb('b2', 'e1', 200, 'cancelled'), wb('b3', 'e1', 300)]
    expect(getWaitlistPosition(bookings, 'e1', 'b1')).toBe(1)
    expect(getWaitlistPosition(bookings, 'e1', 'b3')).toBe(2) // moves up since b2 doesn't count
    expect(getWaitlistPosition(bookings, 'e1', 'b2')).toBeNull()
  })

  it('only counts bookings for the same event — a different event\'s waitlist never affects this one', () => {
    const bookings = [wb('b1', 'e1', 100), wb('other', 'e2', 50)]
    expect(getWaitlistPosition(bookings, 'e1', 'b1')).toBe(1)
  })

  it('breaks a createdAt tie stably by booking id', () => {
    const bookings = [wb('zzz', 'e1', 100), wb('aaa', 'e1', 100)]
    expect(getWaitlistPosition(bookings, 'e1', 'aaa')).toBe(1)
    expect(getWaitlistPosition(bookings, 'e1', 'zzz')).toBe(2)
  })

  it('returns null when the booking is not found on this event\'s waitlist', () => {
    const bookings = [wb('b1', 'e1', 100)]
    expect(getWaitlistPosition(bookings, 'e1', 'does-not-exist')).toBeNull()
    expect(getWaitlistPosition(bookings, 'e1', 'b1')).toBe(1)
    expect(getWaitlistPosition([], 'e1', 'b1')).toBeNull()
  })

  it('a booking that is not actually in waitlist status is never counted, even if the id matches', () => {
    const bookings = [wb('b1', 'e1', 100, 'confirmed')]
    expect(getWaitlistPosition(bookings, 'e1', 'b1')).toBeNull()
  })
})
