import { beforeEach, describe, expect, it } from 'vitest'
import { clearVolleyballHubStorage, readStorage, removeStorage, STORAGE_KEYS, writeStorage } from './storage'

// vitest's default test environment has no browser localStorage, so a
// minimal in-memory stand-in is installed once for this file — it also
// happens to be the easiest way to simulate "storage unavailable" and
// "corrupted JSON" without touching a real browser.
function makeMemoryStorage() {
  const store = new Map()
  return {
    getItem: (key) => (store.has(key) ? store.get(key) : null),
    setItem: (key, value) => { store.set(key, String(value)) },
    removeItem: (key) => { store.delete(key) },
    clear: () => store.clear(),
  }
}

beforeEach(() => {
  globalThis.localStorage = makeMemoryStorage()
})

describe('readStorage / writeStorage', () => {
  it('round-trips a JSON-serialisable value', () => {
    writeStorage('vh-test', { a: 1, b: [1, 2, 3] })
    expect(readStorage('vh-test', null)).toEqual({ a: 1, b: [1, 2, 3] })
  })

  it('returns the fallback when the key is missing', () => {
    expect(readStorage('vh-does-not-exist', 'fallback')).toBe('fallback')
  })

  it('returns the fallback instead of throwing when the stored value is corrupted JSON', () => {
    globalThis.localStorage.setItem('vh-corrupt', '{not valid json')
    expect(readStorage('vh-corrupt', 'fallback')).toBe('fallback')
  })

  it('returns the fallback instead of throwing when localStorage itself is unavailable', () => {
    delete globalThis.localStorage
    expect(readStorage('vh-anything', 'fallback')).toBe('fallback')
    expect(writeStorage('vh-anything', 'value')).toBe(false)
  })
})

describe('removeStorage / clearVolleyballHubStorage', () => {
  it('removeStorage deletes exactly the given key', () => {
    writeStorage('vh-a', 1)
    writeStorage('vh-b', 2)
    removeStorage('vh-a')
    expect(readStorage('vh-a', null)).toBeNull()
    expect(readStorage('vh-b', null)).toBe(2)
  })

  it('clearVolleyballHubStorage removes every known app key', () => {
    Object.values(STORAGE_KEYS).forEach((key) => writeStorage(key, 'x'))
    clearVolleyballHubStorage()
    Object.values(STORAGE_KEYS).forEach((key) => {
      expect(readStorage(key, null)).toBeNull()
    })
  })
})
