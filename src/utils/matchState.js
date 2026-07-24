import { matchesPriceBracket } from './priceBracket'

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
    filters.type !== '全部' ||
    filters.gender !== '不限' ||
    filters.level !== '全部' ||
    filters.city !== '全部' ||
    filters.price !== '全部'
  )
}

// Compares the explore page's currently-selected filters — the only
// stated preference this app actually has — against one event's real
// attributes. Every row is a literal, inspectable comparison, which is
// what the "查看比對依據" panel renders back to the user. No hidden
// scoring, no invented match percentage, no claim of personalisation.
export function getMatchResult(ev, filters) {
  if (!hasActivePreference(filters)) return null

  const criteria = []

  if (filters.type !== '全部') {
    criteria.push({ key: 'type', met: ev.type === filters.type, unspecified: false })
  }
  if (filters.gender !== '不限') {
    const unspecified = ev.gender === '不限'
    criteria.push({ key: 'gender', met: !unspecified && ev.gender === filters.gender, unspecified })
  }
  if (filters.level !== '全部') {
    const unspecified = ev.level === '不限'
    criteria.push({ key: 'level', met: !unspecified && ev.level === filters.level, unspecified })
  }
  if (filters.city !== '全部') {
    criteria.push({ key: 'city', met: ev.city === filters.city, unspecified: false })
  }
  if (filters.price !== '全部') {
    criteria.push({ key: 'price', met: matchesPriceBracket(ev.price, filters.price), unspecified: false })
  }

  const full = ev.registered >= ev.capacity
  const hasUnspecified = criteria.some((c) => c.unspecified)
  const metCount = criteria.filter((c) => c.met).length

  // A full event, or one where the organiser left a dimension the user
  // filtered on unspecified (level/gender "不限"), always needs a human
  // to confirm — it never gets labelled a confident match regardless of
  // how many other criteria line up.
  let state
  if (full || hasUnspecified) state = 'check'
  else if (metCount >= 2) state = 'match'
  else if (metCount >= 1) state = 'partial'
  else state = 'check'

  const reasons = []
  const priority = ['level', 'city', 'price', 'type', 'gender']
  priority.forEach((key) => {
    if (reasons.length >= 3) return
    const c = criteria.find((cc) => cc.key === key)
    if (c && c.met) reasons.push(REASON_LABEL[key])
  })
  if (!full && reasons.length < 3) reasons.push(REASON_LABEL.availability)

  return { state, reasons: reasons.slice(0, 3), criteria, full }
}
