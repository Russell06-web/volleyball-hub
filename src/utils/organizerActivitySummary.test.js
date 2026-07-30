import { describe, expect, it } from 'vitest'
import { getOrganizerActivitySummary } from './organizerActivitySummary'

const FAR_FUTURE = '2099-01-01'
const FAR_PAST = '2000-01-01'

function ev(overrides) {
  return {
    id: overrides.id, ownerId: 'org-1', date: overrides.date || FAR_FUTURE, startTime: '10:00', endTime: '12:00',
    status: 'published', capacity: 10, registeredCount: 0,
    ...overrides,
  }
}

describe('getOrganizerActivitySummary', () => {
  it('counts total/completed/upcoming/cancelled correctly', () => {
    const events = [
      ev({ id: 'e1', status: 'published' }), // upcoming
      ev({ id: 'e2', date: FAR_PAST, status: 'published' }), // expired -> completed
      ev({ id: 'e3', status: 'cancelled' }),
      ev({ id: 'e4', status: 'completed' }),
    ]
    expect(getOrganizerActivitySummary(events, 'org-1')).toEqual({ total: 4, completed: 2, upcoming: 1, cancelled: 1 })
  })

  it('counts a full-but-not-yet-happened event as upcoming, not completed', () => {
    const events = [ev({ id: 'e1', registeredCount: 10 })]
    expect(getOrganizerActivitySummary(events, 'org-1').upcoming).toBe(1)
  })

  it('excludes draft events from every bucket, including the total', () => {
    const events = [ev({ id: 'e1', status: 'draft' }), ev({ id: 'e2', status: 'published' })]
    const summary = getOrganizerActivitySummary(events, 'org-1')
    expect(summary.total).toBe(1)
    expect(summary.upcoming).toBe(1)
  })

  it('only counts events owned by the given ownerId', () => {
    const events = [ev({ id: 'e1', ownerId: 'org-1' }), ev({ id: 'e2', ownerId: 'someone-else' })]
    expect(getOrganizerActivitySummary(events, 'org-1').total).toBe(1)
  })

  it('never includes a rating, review count, or trust/verification field', () => {
    const summary = getOrganizerActivitySummary([ev({ id: 'e1' })], 'org-1')
    expect(summary).not.toHaveProperty('rating')
    expect(summary).not.toHaveProperty('reviews')
    expect(summary).not.toHaveProperty('verified')
    expect(summary).not.toHaveProperty('trustScore')
  })

  it('returns all zeros for an organiser with no events', () => {
    expect(getOrganizerActivitySummary([], 'org-1')).toEqual({ total: 0, completed: 0, upcoming: 0, cancelled: 0 })
  })
})
