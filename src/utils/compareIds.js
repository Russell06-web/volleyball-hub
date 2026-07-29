export const MAX_COMPARE = 3

// Validates whatever raw JSON.parse gave back for vh-compare — never
// trusts it's already a clean array of unique string ids (hand-edited
// devtools, an older/corrupted shape, anything).
export function sanitizeCompareIds(raw) {
  if (!Array.isArray(raw)) return []
  const deduped = [...new Set(raw.filter((id) => typeof id === 'string' && id))]
  return deduped.slice(0, MAX_COMPARE)
}

export function canAddCompareId(ids, id) {
  return !ids.includes(id) && ids.length < MAX_COMPARE
}

export function addCompareId(ids, id) {
  if (!canAddCompareId(ids, id)) return ids
  return [...ids, id]
}

export function removeCompareId(ids, id) {
  if (!ids.includes(id)) return ids
  return ids.filter((x) => x !== id)
}

// An event deleted from Manage should just quietly vanish from the
// compare list rather than leave a ghost id every consumer has to guard
// against.
export function pruneCompareIds(ids, validIds) {
  const valid = new Set(validIds)
  const pruned = ids.filter((id) => valid.has(id))
  return pruned.length === ids.length ? ids : pruned
}
