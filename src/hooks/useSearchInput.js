import { useEffect, useRef, useState } from 'react'
import { createDebouncer } from '../utils/debounce'

const DEBOUNCE_MS = 300

// Keeps a local, uncommitted search-input value in sync with a committed
// external value (Explore's URL ?q=), without two problems the naive
// "controlled input bound straight to the URL" version had:
//   1. Every keystroke wrote a new URL param, which trims the value — so
//      a trailing space (mid-typing "台北 中階") vanished the instant it
//      was typed, silently merging the two words.
//   2. Every keystroke replaced the URL, coupling render-value directly
//      to the URL with no window to type freely before committing.
// Here, `inputValue` is untouched raw text; committing (debounced, or
// forced via Enter/blur) is the only thing that ever normalises it. The
// actual debounce timing lives in utils/debounce.js so it can be unit
// tested with fake timers independent of React.
export function useSearchInput(committedValue, commit) {
  const [inputValue, setInputValue] = useState(committedValue)
  const debouncerRef = useRef(null)
  const lastCommittedRef = useRef(committedValue)
  if (!debouncerRef.current) debouncerRef.current = createDebouncer(DEBOUNCE_MS)

  // An external change — back/forward, a pasted/shared URL, a
  // programmatic reset — always wins over anything mid-debounce locally.
  useEffect(() => {
    if (committedValue !== lastCommittedRef.current) {
      lastCommittedRef.current = committedValue
      setInputValue(committedValue)
    }
  }, [committedValue])

  useEffect(() => () => debouncerRef.current.cancel(), [])

  function commitNow(value) {
    debouncerRef.current.cancel()
    lastCommittedRef.current = value
    commit(value)
  }

  function handleChange(value) {
    setInputValue(value)
    debouncerRef.current.schedule(() => commitNow(value))
  }

  function handleCommitNow() {
    commitNow(inputValue)
  }

  function handleClear() {
    debouncerRef.current.cancel()
    setInputValue('')
    lastCommittedRef.current = ''
    commit('')
  }

  return { inputValue, handleChange, handleCommitNow, handleClear }
}
