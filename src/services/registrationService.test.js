import { describe, expect, it } from 'vitest'
import { planCancelBooking, planRegistration } from './registrationService'

const openEvent = { id: 'e1', registeredCount: 8, capacity: 10, waitlistCount: 0, status: 'published' }
const fullEvent = { id: 'e2', registeredCount: 10, capacity: 10, waitlistCount: 1, status: 'published' }

describe('planRegistration', () => {
  it('registers an individual and increments registeredCount by 1', () => {
    const plan = planRegistration(openEvent, [], { mode: 'individual' })
    expect(plan.ok).toBe(true)
    expect(plan.bookingStatus).toBe('pending')
    expect(plan.participantCount).toBe(1)
    expect(plan.eventPatch).toEqual({ registeredCount: 9 })
  })

  it('registers a team and increments registeredCount by the team size', () => {
    const plan = planRegistration(openEvent, [], { mode: 'team', teamSize: 2 })
    expect(plan.ok).toBe(true)
    expect(plan.eventPatch).toEqual({ registeredCount: 10 })
  })

  it('rejects a team registration that would exceed remaining capacity', () => {
    const plan = planRegistration(openEvent, [], { mode: 'team', teamSize: 5 })
    expect(plan.ok).toBe(false)
    expect(plan.code).toBe('exceeds-capacity')
  })

  it('sends a full event to the waitlist instead of registeredCount, and never touches registeredCount', () => {
    const plan = planRegistration(fullEvent, [], { mode: 'individual' })
    expect(plan.ok).toBe(true)
    expect(plan.bookingStatus).toBe('waitlist')
    expect(plan.eventPatch).toEqual({ waitlistCount: 2 })
  })

  it('rejects a second registration while an active (pending/confirmed) booking already exists', () => {
    const bookings = [{ id: 'b1', eventId: 'e1', status: 'pending' }]
    const plan = planRegistration(openEvent, bookings, { mode: 'individual' })
    expect(plan.ok).toBe(false)
    expect(plan.code).toBe('already-active')
  })

  it('rejects a second waitlist attempt while already on the waitlist', () => {
    const bookings = [{ id: 'b1', eventId: 'e2', status: 'waitlist' }]
    const plan = planRegistration(fullEvent, bookings, { mode: 'individual' })
    expect(plan.ok).toBe(false)
    expect(plan.code).toBe('already-waitlist')
  })

  it('does not consider a cancelled booking for the same event as blocking a new one', () => {
    const bookings = [{ id: 'b1', eventId: 'e1', status: 'cancelled' }]
    const plan = planRegistration(openEvent, bookings, { mode: 'individual' })
    expect(plan.ok).toBe(true)
  })
})

describe('planCancelBooking', () => {
  it('cancelling a confirmed/pending booking returns registeredCount by its participantCount', () => {
    const booking = { id: 'b1', eventId: 'e1', status: 'pending', participantCount: 3 }
    const plan = planCancelBooking(openEvent, booking)
    expect(plan.ok).toBe(true)
    expect(plan.eventPatch).toEqual({ registeredCount: 5 })
  })

  it('never drops registeredCount below 0', () => {
    const weirdEvent = { ...openEvent, registeredCount: 1 }
    const booking = { id: 'b1', eventId: 'e1', status: 'confirmed', participantCount: 5 }
    const plan = planCancelBooking(weirdEvent, booking)
    expect(plan.eventPatch.registeredCount).toBe(0)
  })

  it('cancelling a waitlist booking decrements waitlistCount and leaves registeredCount untouched', () => {
    const booking = { id: 'b2', eventId: 'e2', status: 'waitlist', participantCount: 1 }
    const plan = planCancelBooking(fullEvent, booking)
    expect(plan.ok).toBe(true)
    expect(plan.eventPatch).toEqual({ waitlistCount: 0 })
  })

  it('rejects cancelling a booking that is already cancelled', () => {
    const booking = { id: 'b3', eventId: 'e1', status: 'cancelled', participantCount: 1 }
    const plan = planCancelBooking(openEvent, booking)
    expect(plan.ok).toBe(false)
    expect(plan.code).toBe('already-cancelled')
  })
})
