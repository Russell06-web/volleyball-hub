import { matchesPriceBracket } from './priceBracket'
import { FILTER_ALL, GENDER_OPEN, LEVEL_OPEN } from '../constants/taxonomy'
import { isWaitlistable } from './eventStatus'

// This is condition comparison, not personalised recommendation — there's
// no user profile, no scoring model, and no "smart" anything behind it.
// Three explainable states, never a percentage or a claim of intelligence.
export const MATCH_STATE_META = {
  match: { label: '符合目前條件', tone: 'ok' },
  partial: { label: '部分條件符合', tone: 'warn' },
  check: { label: '資訊需要確認', tone: 'wait' },
}

export const DIMENSION_LABEL = {
  type: '活動類型',
  gender: '性別',
  level: '技能程度',
  city: '城市',
  price: '價格範圍',
}

const REASON_LABEL = {
  level: '程度相符',
  city: '地區符合偏好',
  price: '價格符合預算',
  type: '類型符合偏好',
  gender: '性別符合偏好',
  availability: '活動仍有名額',
}

export function hasActivePreference(filters) {
  return (
    filters.type !== FILTER_ALL ||
    filters.gender !== FILTER_ALL ||
    filters.level !== FILTER_ALL ||
    filters.city !== FILTER_ALL ||
    filters.price !== FILTER_ALL
  )
}

// Compares the explore page's currently-selected filters — the only
// stated preference this app actually has — against one event's real
// attributes. Every row is a literal, inspectable comparison, which is
// what the "查看比對依據" panel renders back to the user. No hidden
// scoring, no invented match percentage, no claim of personalisation.
//
// State rules (see docs/PRODUCT_LIMITATIONS.md for why these three and
// not a score):
//   match   — every filter the user actually set is satisfied, nothing
//             the organiser left unspecified, and the event isn't full.
//   partial — at least one set filter is satisfied, but not all of them.
//   check   — an unspecified dimension, a full event, or zero filters
//             satisfied: there's something a person needs to confirm.
export function getMatchResult(ev, filters) {
  if (!hasActivePreference(filters)) return null

  const criteria = []

  if (filters.type !== FILTER_ALL) {
    criteria.push({ key: 'type', met: ev.type === filters.type, unspecified: false })
  }
  if (filters.gender !== FILTER_ALL) {
    const unspecified = ev.gender === GENDER_OPEN
    criteria.push({ key: 'gender', met: !unspecified && ev.gender === filters.gender, unspecified })
  }
  if (filters.level !== FILTER_ALL) {
    const unspecified = ev.level === LEVEL_OPEN
    criteria.push({ key: 'level', met: !unspecified && ev.level === filters.level, unspecified })
  }
  if (filters.city !== FILTER_ALL) {
    criteria.push({ key: 'city', met: ev.city === filters.city, unspecified: false })
  }
  if (filters.price !== FILTER_ALL) {
    criteria.push({ key: 'price', met: matchesPriceBracket(ev.price, filters.price), unspecified: false })
  }

  const full = isWaitlistable(ev)
  const hasUnspecified = criteria.some((c) => c.unspecified)
  const allMet = criteria.length > 0 && criteria.every((c) => c.met)
  const anyMet = criteria.some((c) => c.met)

  let state
  if (full || hasUnspecified) state = 'check'
  else if (allMet) state = 'match'
  else if (anyMet) state = 'partial'
  else state = 'check'

  const reasons = []
  const priority = ['level', 'city', 'price', 'type', 'gender']
  priority.forEach((key) => {
    if (reasons.length >= 3) return
    const c = criteria.find((cc) => cc.key === key)
    if (c && c.met) reasons.push(REASON_LABEL[key])
  })
  if (!full && reasons.length < 3 && state !== 'check') reasons.push(REASON_LABEL.availability)

  return { state, reasons: reasons.slice(0, 3), criteria, full }
}
