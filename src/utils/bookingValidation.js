import { getRemainingSlots, isWaitlistable } from './eventStatus'

export const MIN_TEAM_SIZE = 2
export const MAX_TEAM_SIZE = 20

// Accepts 09xx-xxx-xxx with or without the dashes — anything that isn't
// a 10-digit Taiwanese mobile number (09 + 8 digits) is rejected.
export function isValidTaiwanMobile(value) {
  if (typeof value !== 'string') return false
  const digits = value.replace(/[\s-]/g, '')
  return /^09\d{8}$/.test(digits)
}

export function normalizeName(value) {
  return typeof value === 'string' ? value.trim() : ''
}

// Individual and team registration share the same base checks (name,
// phone, agreement); team registration additionally has to fit inside
// whatever's actually left on the event, not just be "a positive number".
export function validateRegistrant({ mode, name, phone, agree, teamName, teamSize }, event) {
  const errors = {}

  if (!normalizeName(name)) errors.name = '請輸入姓名'
  if (!isValidTaiwanMobile(phone)) errors.phone = '請輸入有效的台灣手機號碼，例如 0912-345-678'
  if (!agree) errors.agree = '請先閱讀並同意須知'

  if (mode === 'team') {
    if (!normalizeName(teamName)) errors.teamName = '請輸入隊伍名稱'

    const size = Number(teamSize)
    const full = isWaitlistable(event)
    const remaining = getRemainingSlots(event)

    if (!Number.isInteger(size) || Number.isNaN(size)) {
      errors.teamSize = '隊伍人數請輸入整數'
    } else if (size < MIN_TEAM_SIZE) {
      errors.teamSize = `隊伍人數至少 ${MIN_TEAM_SIZE} 人`
    } else if (size > MAX_TEAM_SIZE) {
      errors.teamSize = `隊伍人數不可超過 ${MAX_TEAM_SIZE} 人`
    } else if (!full && size > remaining) {
      errors.teamSize = `目前僅剩 ${remaining} 個名額，請調整隊伍人數。`
    }
  }

  return { valid: Object.keys(errors).length === 0, errors }
}
