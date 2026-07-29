import { describe, expect, it } from 'vitest'
import { sortEvents } from './sortEvents'

const events = [
  { id: 'a', date: '2026-03-03', price: 500, registeredCount: 9, capacity: 10, isUrgent: false, isFeatured: false },
  { id: 'b', date: '2026-01-01', price: 100, registeredCount: 2, capacity: 10, isUrgent: false, isFeatured: false },
  { id: 'c', date: '2026-02-02', price: 300, registeredCount: 5, capacity: 10, isUrgent: false, isFeatured: false },
]

describe('sortEvents', () => {
  it('dateAsc sorts by date ascending', () => {
    expect(sortEvents(events, 'dateAsc').map((e) => e.id)).toEqual(['b', 'c', 'a'])
  })

  it('priceAsc sorts by price ascending', () => {
    expect(sortEvents(events, 'priceAsc').map((e) => e.id)).toEqual(['b', 'c', 'a'])
  })

  it('availability sorts by most remaining slots first', () => {
    expect(sortEvents(events, 'availability').map((e) => e.id)).toEqual(['b', 'c', 'a'])
  })

  it('almostFull ranks registrable events by fill rate descending, ties by soonest date', () => {
    // a: fillRate .9, b: .2, c: .5 — none are actually full here
    expect(sortEvents(events, 'almostFull').map((e) => e.id)).toEqual(['a', 'c', 'b'])
  })

  it('almostFull pushes fully-booked events to the end instead of the front', () => {
    const withFull = [
      { id: 'full', date: '2026-01-01', price: 100, registeredCount: 10, capacity: 10 },
      { id: 'near', date: '2026-01-02', price: 100, registeredCount: 9, capacity: 10 },
      { id: 'open', date: '2026-01-03', price: 100, registeredCount: 2, capacity: 10 },
    ]
    expect(sortEvents(withFull, 'almostFull').map((e) => e.id)).toEqual(['near', 'open', 'full'])
  })

  it('almostFull treats an invalid/zero capacity as fully booked, not a crash', () => {
    const weird = [
      { id: 'zero-cap', date: '2026-01-01', price: 100, registeredCount: 0, capacity: 0 },
      { id: 'normal', date: '2026-01-02', price: 100, registeredCount: 5, capacity: 10 },
    ]
    expect(() => sortEvents(weird, 'almostFull')).not.toThrow()
    expect(sortEvents(weird, 'almostFull').map((e) => e.id)).toEqual(['normal', 'zero-cap'])
  })

  it('default sort is explainable: urgent first, then featured, then soonest date — not raw array order', () => {
    const mixed = [
      { id: 'plain-late', date: '2026-05-01', isUrgent: false, isFeatured: false },
      { id: 'featured', date: '2026-06-01', isUrgent: false, isFeatured: true },
      { id: 'urgent', date: '2026-07-01', isUrgent: true, isFeatured: false },
      { id: 'plain-early', date: '2026-01-01', isUrgent: false, isFeatured: false },
    ]
    expect(sortEvents(mixed, 'default').map((e) => e.id)).toEqual(['urgent', 'featured', 'plain-early', 'plain-late'])
  })

  it('never mutates the input array', () => {
    const copy = [...events]
    sortEvents(events, 'priceAsc')
    expect(events).toEqual(copy)
  })
})
