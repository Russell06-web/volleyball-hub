// Date.now() collides when several records are created in the same
// millisecond (e.g. a fast test loop, or two tabs open at once). Real
// UUIDs don't have that problem; the manual fallback only exists for the
// rare runtime with no crypto.randomUUID (older Safari, non-HTTPS
// contexts) so id generation never throws.
export function createId(prefix = '') {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return prefix + crypto.randomUUID()
  }
  const random = Math.random().toString(36).slice(2, 10)
  return `${prefix}${Date.now().toString(36)}-${random}`
}
