import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { createDebouncer } from './debounce'

beforeEach(() => { vi.useFakeTimers() })
afterEach(() => { vi.useRealTimers() })

describe('createDebouncer', () => {
  it('does not call the function before the delay has elapsed', () => {
    const debouncer = createDebouncer(300)
    const fn = vi.fn()
    debouncer.schedule(fn)
    vi.advanceTimersByTime(299)
    expect(fn).not.toHaveBeenCalled()
  })

  it('calls the function once the delay elapses', () => {
    const debouncer = createDebouncer(300)
    const fn = vi.fn()
    debouncer.schedule(fn)
    vi.advanceTimersByTime(300)
    expect(fn).toHaveBeenCalledTimes(1)
  })

  it('restarts the timer on every schedule() call — only the last one fires', () => {
    const debouncer = createDebouncer(300)
    const fn1 = vi.fn()
    const fn2 = vi.fn()
    const fn3 = vi.fn()
    debouncer.schedule(fn1)
    vi.advanceTimersByTime(150)
    debouncer.schedule(fn2)
    vi.advanceTimersByTime(150)
    debouncer.schedule(fn3)
    vi.advanceTimersByTime(300)
    expect(fn1).not.toHaveBeenCalled()
    expect(fn2).not.toHaveBeenCalled()
    expect(fn3).toHaveBeenCalledTimes(1)
  })

  it('cancel() prevents a pending call from ever firing', () => {
    const debouncer = createDebouncer(300)
    const fn = vi.fn()
    debouncer.schedule(fn)
    debouncer.cancel()
    vi.advanceTimersByTime(1000)
    expect(fn).not.toHaveBeenCalled()
  })

  it('isPending() reflects whether a call is currently scheduled', () => {
    const debouncer = createDebouncer(300)
    expect(debouncer.isPending()).toBe(false)
    debouncer.schedule(() => {})
    expect(debouncer.isPending()).toBe(true)
    vi.advanceTimersByTime(300)
    expect(debouncer.isPending()).toBe(false)
  })
})
