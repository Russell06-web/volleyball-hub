// A minimal, framework-free debouncer — pulled out of useSearchInput so
// the timing behaviour itself (schedule/cancel/flush) can be unit-tested
// with fake timers, without needing a React render to exercise it.
export function createDebouncer(delay) {
  let timer = null

  function schedule(fn) {
    cancel()
    timer = setTimeout(() => {
      timer = null
      fn()
    }, delay)
  }

  function cancel() {
    if (timer) {
      clearTimeout(timer)
      timer = null
    }
  }

  function isPending() {
    return timer !== null
  }

  return { schedule, cancel, isPending }
}
