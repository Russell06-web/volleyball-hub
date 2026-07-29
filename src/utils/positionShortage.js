import { getPositionLabel, POSITIONS } from '../constants/volleyballTaxonomy'
import { getRemainingSlots } from './eventStatus'

const DEFAULT_POSITION = 'universal'

// Positions the event actually still needs are surfaced first in
// RegisterModal's picker — a nudge, not a restriction (enforcing "only
// needed positions selectable" is left to a future phase, see
// docs/PRODUCT_DECISIONS.md). "不限位置" always leads regardless, since
// it's the safe default for anyone who doesn't have a strong preference.
export function orderedPositionChoices(positionsNeeded) {
  const neededSet = new Set((positionsNeeded || []).filter((p) => p.count > 0).map((p) => p.position))
  const universal = POSITIONS.find((p) => p.value === DEFAULT_POSITION)
  const needed = POSITIONS.filter((p) => neededSet.has(p.value))
  const rest = POSITIONS.filter((p) => p.value !== DEFAULT_POSITION && !neededSet.has(p.value))
  return [universal, ...needed, ...rest].filter(Boolean)
}

const MAX_ROLES_SHOWN = 2

// Turns an event's organiser-entered positionsNeeded + its real remaining
// slots into a short, honest shortage summary. This is never framed as
// live roster data — it's exactly what the organiser typed in when the
// event was created/edited (see docs/PRODUCT_LIMITATIONS.md) — but it's
// still real information, not a fabricated headcount.
//
// Returns null when there's nothing to recruit for (full, or no
// remaining slots at all) — callers should hide the shortage UI entirely
// in that case rather than show an empty/zeroed-out summary.
export function getPositionShortageSummary(event) {
  const remaining = getRemainingSlots(event)
  if (remaining <= 0) return null

  const needed = (event.positionsNeeded || []).filter((p) => p && p.count > 0)
  const universal = needed.find((p) => p.position === 'universal')
  const specific = needed.filter((p) => p.position !== 'universal')

  if (needed.length === 0 || (specific.length === 0 && universal)) {
    return { text: `不限位置，缺 ${remaining} 人`, roles: [] }
  }

  const shown = specific.slice(0, MAX_ROLES_SHOWN)
  const overflowCount = (specific.length - shown.length) + (universal ? 1 : 0)
  const shownText = shown.map((p) => `${getPositionLabel(p.position)} ${p.count}`).join('・')
  const suffix = overflowCount > 0 ? `・另有 ${overflowCount} 種位置` : ''

  return { text: `缺${shownText}${suffix}`, roles: shown.map((p) => p.position) }
}
