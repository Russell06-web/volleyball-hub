import { describe, expect, it } from 'vitest'
import { groupEventsByTaipeiDate } from './groupEventsByTaipeiDate'

const NOW = new Date('2026-03-07T10:00:00+08:00') // 2026-03-07 is a Saturday

function ev(overrides) {
  return { id: overrides.id, date: overrides.date, startTime: overrides.startTime || '10:00', ...overrides }
}

describe('groupEventsByTaipeiDate', () => {
  it('groups events across different dates, sorted ascending', () => {
    const events = [
      ev({ id: 'a', date: '2026-03-09' }),
      ev({ id: 'b', date: '2026-03-07' }),
      ev({ id: 'c', date: '2026-03-08' }),
    ]
    const groups = groupEventsByTaipeiDate(events, NOW)
    expect(groups.map((g) => g.date)).toEqual(['2026-03-07', '2026-03-08', '2026-03-09'])
  })

  it('sorts events within the same date by startTime ascending', () => {
    const events = [
      ev({ id: 'a', date: '2026-03-07', startTime: '20:00' }),
      ev({ id: 'b', date: '2026-03-07', startTime: '09:00' }),
      ev({ id: 'c', date: '2026-03-07', startTime: '14:30' }),
    ]
    const groups = groupEventsByTaipeiDate(events, NOW)
    expect(groups[0].events.map((e) => e.id)).toEqual(['b', 'c', 'a'])
  })

  it('labels the current Taipei date as 今天, regardless of what UTC date it straddles', () => {
    // 2026-03-07T10:00+08:00 is 2026-03-07T02:00 UTC — still safely inside
    // 2026-03-07 in Taipei even though a naive UTC read would agree here;
    // the real risk window is near Taipei midnight, covered below.
    const events = [ev({ id: 'a', date: '2026-03-07' })]
    const groups = groupEventsByTaipeiDate(events, NOW)
    expect(groups[0].label).toBe('今天・3 月 7 日・週六')
  })

  it('labels the very early Taipei morning correctly as 今天, not the UTC-previous-day date', () => {
    // 00:30 Taipei time on 2026-03-07 is still 2026-03-06T16:30 UTC — a
    // naive `new Date().toISOString().slice(0,10)` would misreport this as
    // 2026-03-06.
    const earlyTaipeiMorning = new Date('2026-03-07T00:30:00+08:00')
    const events = [ev({ id: 'a', date: '2026-03-07' })]
    const groups = groupEventsByTaipeiDate(events, earlyTaipeiMorning)
    expect(groups[0].label).toContain('今天')
  })

  it('labels the next Taipei date as 明天', () => {
    const events = [ev({ id: 'a', date: '2026-03-08' })]
    const groups = groupEventsByTaipeiDate(events, NOW)
    expect(groups[0].label).toBe('明天・3 月 8 日・週日')
  })

  it('labels any other date with just the month/day/weekday, no relative prefix', () => {
    const events = [ev({ id: 'a', date: '2026-03-20' })]
    const groups = groupEventsByTaipeiDate(events, NOW)
    expect(groups[0].label).toBe('3 月 20 日・週五')
  })

  it('drops events with no date rather than grouping them under a fake key', () => {
    const events = [ev({ id: 'a', date: '' }), ev({ id: 'b', date: '2026-03-07' })]
    const groups = groupEventsByTaipeiDate(events, NOW)
    expect(groups).toHaveLength(1)
    expect(groups[0].events.map((e) => e.id)).toEqual(['b'])
  })

  it('returns an empty array for an empty input list', () => {
    expect(groupEventsByTaipeiDate([], NOW)).toEqual([])
  })
})
