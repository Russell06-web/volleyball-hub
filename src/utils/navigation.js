// Every link into /event/:id carries where it was clicked from, so
// EventDetail's back button can return to that exact URL (including
// Explore's search/filter/sort query string) instead of always landing
// on a bare /explore or relying on navigate(-1) — which breaks the
// moment someone opens an event's URL directly, with no browser history
// of their own to go back to.
export function buildFromState(location) {
  return { from: { pathname: location.pathname, search: location.search } }
}

// Turns a stored `from` back into a path Link/navigate can use. Falls
// back to /explore when there's nothing to return to.
export function resolveBackTo(from, fallback = '/explore') {
  if (!from?.pathname) return fallback
  return `${from.pathname}${from.search || ''}`
}
