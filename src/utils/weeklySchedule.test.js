import { describe, expect, it } from 'vitest'
import { getWeeklyScheduleGroups } from './weeklySchedule'

const NOW = new Date('2026-03-07T10:00:00+08:00') // Saturday

function booking(overrides) {
  return { id: overrides.id, eventId: overrides.eventId, status: overrides.status || 'confirmed', ...overrides }
}
function event(overrides) {
  return { id: overrides.id, date: overrides.date, startTime: overrides.startTime || '10:00', title: overrides.title || 'Event', ...overrides }
}

describe('getWeeklyScheduleGroups', () => {
  it('includes a booking whose event falls within the next 7 days (today..+6)', () => {
    const bookings = [booking({ id: 'b1', eventId: 'e1' })]
    const events = [event({ id: 'e1', date: '2026-03-09' })]
    const groups = getWeeklyScheduleGroups(bookings, events, NOW)
    expect(groups).toHaveLength(1)
    expect(groups[0].entries[0].booking.id).toBe('b1')
  })

  it('excludes an event date before today', () => {
    const bookings = [booking({ id: 'b1', eventId: 'e1' })]
    const events = [event({ id: 'e1', date: '2026-03-01' })]
    expect(getWeeklyScheduleGroups(bookings, events, NOW)).toEqual([])
  })

  it('excludes an event date more than 6 days out', () => {
    const bookings = [booking({ id: 'b1', eventId: 'e1' })]
    const events = [event({ id: 'e1', date: '2026-03-20' })]
    expect(getWeeklyScheduleGroups(bookings, events, NOW)).toEqual([])
  })

  it('includes every booking status — registered, waitlisted, cancelled, completed', () => {
    const bookings = [
      booking({ id: 'b1', eventId: 'e1', status: 'confirmed' }),
      booking({ id: 'b2', eventId: 'e2', status: 'waitlist' }),
      booking({ id: 'b3', eventId: 'e3', status: 'cancelled' }),
      booking({ id: 'b4', eventId: 'e4', status: 'completed' }),
    ]
    const events = [
      event({ id: 'e1', date: '2026-03-08' }), event({ id: 'e2', date: '2026-03-08' }),
      event({ id: 'e3', date: '2026-03-08' }), event({ id: 'e4', date: '2026-03-08' }),
    ]
    const groups = getWeeklyScheduleGroups(bookings, events, NOW)
    expect(groups[0].entries).toHaveLength(4)
  })

  it('groups by date and sorts entries within a date by startTime', () => {
    const bookings = [booking({ id: 'b1', eventId: 'e1' }), booking({ id: 'b2', eventId: 'e2' })]
    const events = [
      event({ id: 'e1', date: '2026-03-08', startTime: '20:00', title: '晚場' }),
      event({ id: 'e2', date: '2026-03-08', startTime: '09:00', title: '早場' }),
    ]
    const groups = getWeeklyScheduleGroups(bookings, events, NOW)
    expect(groups[0].entries.map((e) => e.event.title)).toEqual(['早場', '晚場'])
  })

  it('labels today/tomorrow the same way groupEventsByTaipeiDate does', () => {
    const bookings = [booking({ id: 'b1', eventId: 'e1' })]
    const events = [event({ id: 'e1', date: '2026-03-07' })]
    const groups = getWeeklyScheduleGroups(bookings, events, NOW)
    expect(groups[0].label).toContain('今天')
  })

  it('drops a booking whose event no longer exists, without throwing', () => {
    const bookings = [booking({ id: 'b1', eventId: 'missing' })]
    expect(() => getWeeklyScheduleGroups(bookings, [], NOW)).not.toThrow()
    expect(getWeeklyScheduleGroups(bookings, [], NOW)).toEqual([])
  })

  it('returns an empty array when there are no bookings at all', () => {
    expect(getWeeklyScheduleGroups([], [], NOW)).toEqual([])
  })
})
