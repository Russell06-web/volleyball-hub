import { act, renderHook } from '@testing-library/react'
import { beforeEach, describe, expect, it } from 'vitest'
import { EXPLORE_LAYOUT_STORAGE_KEY, useExploreLayout } from './useExploreLayout'

beforeEach(() => {
  localStorage.clear()
})

describe('useExploreLayout', () => {
  it('defaults to grid when nothing is stored yet', () => {
    const { result } = renderHook(() => useExploreLayout())
    expect(result.current.layout).toBe('grid')
  })

  it('persists a valid choice to localStorage and reflects it immediately', () => {
    const { result } = renderHook(() => useExploreLayout())
    act(() => result.current.setLayout('list'))
    expect(result.current.layout).toBe('list')
    expect(localStorage.getItem(EXPLORE_LAYOUT_STORAGE_KEY)).toBe('"list"')
  })

  it('a fresh hook instance picks up a previously-stored valid value', () => {
    localStorage.setItem(EXPLORE_LAYOUT_STORAGE_KEY, JSON.stringify('list'))
    const { result } = renderHook(() => useExploreLayout())
    expect(result.current.layout).toBe('list')
  })

  it('falls back to grid for a corrupted or unrecognised stored value', () => {
    localStorage.setItem(EXPLORE_LAYOUT_STORAGE_KEY, 'not even json{')
    const { result: r1 } = renderHook(() => useExploreLayout())
    expect(r1.current.layout).toBe('grid')

    localStorage.setItem(EXPLORE_LAYOUT_STORAGE_KEY, JSON.stringify('carousel'))
    const { result: r2 } = renderHook(() => useExploreLayout())
    expect(r2.current.layout).toBe('grid')
  })

  it('setLayout ignores an invalid value rather than storing it', () => {
    const { result } = renderHook(() => useExploreLayout())
    act(() => result.current.setLayout('carousel'))
    expect(result.current.layout).toBe('grid')
  })
})
