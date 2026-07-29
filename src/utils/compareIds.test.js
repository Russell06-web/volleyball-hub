import { describe, expect, it } from 'vitest'
import {
  addCompareId, canAddCompareId, MAX_COMPARE, pruneCompareIds, removeCompareId, sanitizeCompareIds,
} from './compareIds'

describe('sanitizeCompareIds', () => {
  it('returns an empty array for non-array input', () => {
    expect(sanitizeCompareIds(null)).toEqual([])
    expect(sanitizeCompareIds(undefined)).toEqual([])
    expect(sanitizeCompareIds({ foo: 'bar' })).toEqual([])
    expect(sanitizeCompareIds('e1')).toEqual([])
  })

  it('drops non-string / empty entries', () => {
    expect(sanitizeCompareIds(['e1', 42, null, '', 'e2'])).toEqual(['e1', 'e2'])
  })

  it('de-duplicates', () => {
    expect(sanitizeCompareIds(['e1', 'e2', 'e1'])).toEqual(['e1', 'e2'])
  })

  it('caps at MAX_COMPARE even if the stored data has more', () => {
    expect(sanitizeCompareIds(['e1', 'e2', 'e3', 'e4', 'e5'])).toHaveLength(MAX_COMPARE)
  })
})

describe('canAddCompareId / addCompareId', () => {
  it('allows adding up to MAX_COMPARE ids', () => {
    expect(canAddCompareId(['e1', 'e2'], 'e3')).toBe(true)
    expect(addCompareId(['e1', 'e2'], 'e3')).toEqual(['e1', 'e2', 'e3'])
  })

  it('refuses a 4th id once already at MAX_COMPARE', () => {
    expect(canAddCompareId(['e1', 'e2', 'e3'], 'e4')).toBe(false)
    expect(addCompareId(['e1', 'e2', 'e3'], 'e4')).toEqual(['e1', 'e2', 'e3'])
  })

  it('refuses (and is a no-op) adding an id already in the list', () => {
    expect(canAddCompareId(['e1', 'e2'], 'e1')).toBe(false)
    expect(addCompareId(['e1', 'e2'], 'e1')).toEqual(['e1', 'e2'])
  })
})

describe('removeCompareId', () => {
  it('removes an existing id', () => {
    expect(removeCompareId(['e1', 'e2', 'e3'], 'e2')).toEqual(['e1', 'e3'])
  })

  it('is a no-op for an id that is not in the list', () => {
    const ids = ['e1', 'e2']
    expect(removeCompareId(ids, 'e9')).toBe(ids) // same reference — no unnecessary state change
  })
})

describe('pruneCompareIds', () => {
  it('drops ids for events that no longer exist', () => {
    expect(pruneCompareIds(['e1', 'e2', 'e3'], ['e1', 'e3'])).toEqual(['e1', 'e3'])
  })

  it('returns the same reference when nothing needs pruning (avoids a pointless re-render)', () => {
    const ids = ['e1', 'e2']
    expect(pruneCompareIds(ids, ['e1', 'e2', 'e3'])).toBe(ids)
  })
})
