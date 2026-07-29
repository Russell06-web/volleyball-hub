import { COURT_SURFACE_UNSPECIFIED, NET_HEIGHT_UNSPECIFIED } from '../constants/volleyballTaxonomy'

// Never a score, never a percentage — a plain "did the organiser fill in
// the fields someone would actually want before deciding to join" check.
// Field labels shared with EventDetail's "缺少的資訊" list and Manage's
// preview step so the same gap is never worded three different ways.
export const INFO_FIELD_LABELS = {
  title: '活動名稱',
  description: '活動說明',
  rules: '活動規則／取消政策',
  venueName: '場地名稱',
  address: '詳細地址',
  date: '日期',
  startTime: '開始時間',
  endTime: '結束時間',
  level: '程度限制',
  gender: '性別限制',
  organizerName: '主辦方名稱',
  organizerContact: '主辦方聯絡方式',
  volleyballFormat: '球制',
  netHeight: '網高',
  courtSurface: '場地材質',
  positionsNeeded: '需要位置',
  skillNotes: '技能／參與說明',
}

// Only a gap in one of these should ever read as a real risk — a missing
// equipment list or skill note is a nice-to-have, not something that
// should block someone from deciding whether to register.
const IMPORTANT_FIELDS = new Set(['address', 'startTime', 'endTime', 'level', 'organizerContact'])

function isFilledString(value) {
  return typeof value === 'string' && value.trim().length > 0
}

// `rules` doubles as this event's cancellation/participation policy —
// the schema has no separate cancellationPolicy field, and adding one
// just for this check would be a bigger data-model change than a
// completeness indicator warrants.
const FIELD_CHECKS = {
  title: (ev) => isFilledString(ev.title),
  description: (ev) => isFilledString(ev.description),
  rules: (ev) => isFilledString(ev.rules),
  venueName: (ev) => isFilledString(ev.venueName),
  address: (ev) => isFilledString(ev.address),
  date: (ev) => isFilledString(ev.date),
  startTime: (ev) => isFilledString(ev.startTime),
  endTime: (ev) => isFilledString(ev.endTime),
  level: (ev) => isFilledString(ev.level),
  gender: (ev) => isFilledString(ev.gender),
  organizerName: (ev) => isFilledString(ev.organizerName),
  organizerContact: (ev) => isFilledString(ev.organizerContact),
  volleyballFormat: (ev) => isFilledString(ev.volleyballFormat),
  netHeight: (ev) => Boolean(ev.netHeight) && ev.netHeight !== NET_HEIGHT_UNSPECIFIED,
  courtSurface: (ev) => Boolean(ev.courtSurface) && ev.courtSurface !== COURT_SURFACE_UNSPECIFIED,
  // An empty positionsNeeded is a legitimate "no specific positions
  // needed" declaration (see the family/experience seed events) — this
  // schema has no separate flag to tell that apart from "never filled
  // in", so any array at all (including empty) counts as answered.
  positionsNeeded: (ev) => Array.isArray(ev.positionsNeeded),
  skillNotes: (ev) => isFilledString(ev.skillNotes),
}

export const INFO_QUALITY_FIELDS = Object.keys(FIELD_CHECKS)

export const INFO_QUALITY_STATE_META = {
  complete: { label: '資訊完整' },
  partial: { label: '部分資訊未提供' },
  needsInfo: { label: '尚缺重要資訊' },
}

export function isImportantInfoField(key) {
  return IMPORTANT_FIELDS.has(key)
}

// {state, label, missingFields, completedFields} — never a fabricated
// "85 分" style score. `state` is 'complete' when nothing is missing,
// 'needsInfo' when at least one IMPORTANT_FIELDS entry is missing, and
// 'partial' when only non-essential fields are missing.
export function getEventInformationQuality(event) {
  if (!event) return { state: 'complete', label: INFO_QUALITY_STATE_META.complete.label, missingFields: [], completedFields: [] }

  const missingFields = INFO_QUALITY_FIELDS.filter((key) => !FIELD_CHECKS[key](event))
  const completedFields = INFO_QUALITY_FIELDS.filter((key) => FIELD_CHECKS[key](event))
  const missingImportant = missingFields.some((key) => IMPORTANT_FIELDS.has(key))

  const state = missingFields.length === 0 ? 'complete' : (missingImportant ? 'needsInfo' : 'partial')
  return { state, label: INFO_QUALITY_STATE_META[state].label, missingFields, completedFields }
}
