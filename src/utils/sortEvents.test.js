import { describe, expect, it } from 'vitest'
import { sortEvents } from './sortEvents'

const events = [
  { id: 'a', date: '2026-03-03', price: 500, registeredCount: 9, capacity: 10 },
  { id: 'b', date: '2026-01-01', price: 100, registeredCount: 2, capacity: 10 },
  { id: 'c', date: '2026-02-02', price: 300, registeredCount: 5, capacity: 10 },
]

describe('sortEvents', () => {
  it('default leaves the original order untouched', () => {
    expect(sortEvents(events, 'default').map((e) => e.id)).toEqual(['a', 'b', 'c'])
  })

  it('dateAsc sorts by date ascending', () => {
    expect(sortEvents(events, 'dateAsc').map((e) => e.id)).toEqual(['b', 'c', 'a'])
  })

  it('priceAsc sorts by price ascending', () => {
    expect(sortEvents(events, 'priceAsc').map((e) => e.id)).toEqual(['b', 'c', 'a'])
  })

  it('availability sorts by most remaining slots first', () => {
    expect(sortEvents(events, 'availability').map((e) => e.id)).toEqual(['b', 'c', 'a'])
  })

  it('almostFull sorts by fewest remaining slots first', () => {
    expect(sortEvents(events, 'almostFull').map((e) => e.id)).toEqual(['a', 'c', 'b'])
  })

  it('never mutates the input array', () => {
    const copy = [...events]
    sortEvents(events, 'priceAsc')
    expect(events).toEqual(copy)
  })
})
