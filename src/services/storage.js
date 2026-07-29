// Single place that touches window.localStorage directly. Every Context
// used to duplicate its own try/catch around getItem/setItem/JSON.parse —
// centralising it here means "storage unavailable" (private browsing,
// quota exceeded, corrupted JSON) is handled once, the same way, everywhere.

export const STORAGE_KEYS = {
  events: 'vh-events',
  bookings: 'vh-bookings',
  preferences: 'vh-preferences',
  favorites: 'vh-favorites',
  history: 'vh-history',
  profile: 'vh-profile',
  compare: 'vh-compare',
  savedSearches: 'vh-saved-searches',
  version: 'vh-storage-version',
}

export function readStorage(key, fallback) {
  try {
    const raw = localStorage.getItem(key)
    if (raw == null) return fallback
    return JSON.parse(raw)
  } catch {
    // Either storage isn't available at all, or what's sitting under this
    // key isn't valid JSON (corrupted write, hand-edited devtools, etc).
    // Either way, the fallback is the only safe value to hand back.
    return fallback
  }
}

export function writeStorage(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value))
    return true
  } catch {
    // Quota exceeded or storage disabled — the app keeps working in
    // memory for this session, it just won't persist across reloads.
    return false
  }
}

export function removeStorage(key) {
  try {
    localStorage.removeItem(key)
  } catch {
    /* storage unavailable */
  }
}

export function clearVolleyballHubStorage() {
  Object.values(STORAGE_KEYS).forEach(removeStorage)
}
