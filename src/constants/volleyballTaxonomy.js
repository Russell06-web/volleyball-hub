// Volleyball-specific vocabulary, kept separate from constants/taxonomy.js
// (which owns the general activity-platform fields: type/level/gender/
// city/price). Same pattern as the rest of the app: `value` is the
// stable internal enum stored on an event / used in a URL query, `label`
// is the only place Chinese text lives — nothing here is ever compared
// against a label string.

export const VOLLEYBALL_FORMATS = [
  { value: 'sixPlayer', label: '六人制' },
  { value: 'fourPlayer', label: '四人制' },
  { value: 'beachTwoPlayer', label: '沙灘雙人' },
  { value: 'recreational', label: '休閒不限制' },
]

// Like LEVEL_OPEN/GENDER_OPEN in taxonomy.js — "unspecified" is a
// distinct concept from a filter's "all": it means the organiser hasn't
// said, not that a viewer doesn't care.
export const NET_HEIGHT_UNSPECIFIED = 'unspecified'
export const NET_HEIGHTS = [
  { value: 'men', label: '男網' },
  { value: 'women', label: '女網' },
  { value: 'mixed', label: '混合網' },
  { value: 'custom', label: '其他' },
]

export const COURT_SURFACE_UNSPECIFIED = 'unspecified'
export const COURT_SURFACES = [
  { value: 'wood', label: '木地板' },
  { value: 'pu', label: 'PU' },
  { value: 'sand', label: '沙地' },
  { value: 'grass', label: '草地' },
  { value: 'outdoorHard', label: '戶外硬地' },
]

// An event's overall "feel" — kept as its own small enum (instead of the
// free-text Chinese it used to be) so it can be searched, filtered, and
// put in a URL query the same way every other taxonomy value is.
export const PLAY_STYLES = [
  { value: 'competitive', label: '競技對抗' },
  { value: 'casual', label: '休閒臨打' },
  { value: 'beachCompetitive', label: '沙灘競技' },
  { value: 'experience', label: '休閒體驗' },
]

export const POSITIONS = [
  { value: 'setter', label: '舉球' },
  { value: 'outside', label: '主攻' },
  { value: 'middle', label: '副攻' },
  { value: 'opposite', label: '接應' },
  { value: 'libero', label: '自由球員' },
  { value: 'universal', label: '不限位置' },
]

export const EQUIPMENT_OPTIONS = [
  { value: 'volleyball', label: '球' },
  { value: 'net', label: '球網' },
  { value: 'water', label: '飲水' },
  { value: 'locker', label: '置物櫃' },
  { value: 'shower', label: '淋浴間' },
  { value: 'parking', label: '停車場' },
  { value: 'bibs', label: '背心' },
]

// Reuses the app's existing icon set (Icons.jsx) rather than adding new
// SVG shapes just for this — good enough to give each option a visual
// anchor in chip/filter UI without growing the icon sprite.
export const POSITION_ICON = {
  setter: 'i-hand',
  outside: 'i-trend',
  middle: 'i-shield',
  opposite: 'i-star',
  libero: 'i-whistle',
  universal: 'i-users',
}
export const EQUIPMENT_ICON = {
  volleyball: 'i-ball',
  net: 'i-filter',
  water: 'i-info',
  locker: 'i-home',
  shower: 'i-users',
  parking: 'i-pin',
  bibs: 'i-shield',
}

function labelOf(list, value, unspecifiedValue, unspecifiedLabel) {
  if (unspecifiedValue && value === unspecifiedValue) return unspecifiedLabel
  const found = list.find((item) => item.value === value)
  return found ? found.label : value
}

export const getVolleyballFormatLabel = (value) => labelOf(VOLLEYBALL_FORMATS, value)
export const getPlayStyleLabel = (value) => labelOf(PLAY_STYLES, value)
export const getNetHeightLabel = (value) => labelOf(NET_HEIGHTS, value, NET_HEIGHT_UNSPECIFIED, '未說明')
export const getCourtSurfaceLabel = (value) => labelOf(COURT_SURFACES, value, COURT_SURFACE_UNSPECIFIED, '未說明')
export const getPositionLabel = (value) => labelOf(POSITIONS, value)
export const getEquipmentLabel = (value) => labelOf(EQUIPMENT_OPTIONS, value)

// Shared field labels for the places that describe an event's volleyball
// attributes as a labelled list (registration-readiness summary, compare
// table, EventDetail info blocks) — one source so the same field is never
// worded three different ways in three components.
export const VOLLEYBALL_FIELD_LABELS = {
  volleyballFormat: '球制',
  netHeight: '網高',
  courtSurface: '場地材質',
  rotationRequired: '是否需要輪轉',
  liberoAllowed: '是否允許自由球員',
  soloJoinAllowed: '是否允許單人加入',
  equipmentProvided: '提供設備',
  positionsNeeded: '需要位置',
  skillNotes: '技能說明',
}
