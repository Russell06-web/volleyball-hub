// Stable internal enum values for everything that used to be compared
// and stored as raw Chinese display text (event.type === '室內排球', etc).
// That made it impossible to put a clean value in a URL query string and
// meant "the display label" and "the data value" were the same string —
// change one and you silently break filtering. Every list below is
// { value, label }: `value` is what's stored on an event / used in
// ?type=indoor, `label` is what's ever shown to a person.

// There's no real account system in this prototype, so "the organiser"
// is just this one demo identity — see docs/PRODUCT_LIMITATIONS.md.
export const CURRENT_USER_ID = 'demo-organiser'

export const FILTER_ALL = 'all'

export const EVENT_TYPES = [
  { value: 'indoor', label: '室內排球' },
  { value: 'beach', label: '沙灘排球' },
  { value: 'grass', label: '草地排球' },
  { value: 'family', label: '親子・體驗' },
]

// An event's own level/gender can be explicitly "open" (主辦方未限制),
// which is a different concept from a filter being set to "all" (使用者
//沒有選擇篩選條件) — collapsing them into one value was what let a
// full-looking match hide an unspecified/unconfirmed dimension.
export const LEVEL_OPEN = 'open'
export const LEVELS = [
  { value: 'beginner', label: '初階' },
  { value: 'intermediate', label: '中階' },
  { value: 'advanced', label: '高階' },
]

export const GENDER_OPEN = 'open'
export const GENDERS = [
  { value: 'male', label: '男生' },
  { value: 'female', label: '女生' },
  { value: 'mixed', label: '混合' },
]

export const CITIES = [
  { value: 'taipei', label: '台北' },
  { value: 'newTaipei', label: '新北' },
  { value: 'taoyuan', label: '桃園' },
]

// Mutually exclusive on purpose — every price maps to exactly one
// bracket, never two. "免費" is its own bracket rather than the bottom of
// "NT$1–300" because a free activity is a different decision for most
// people than a NT$50 one.
export const PRICE_BRACKETS = [
  { value: 'free', label: '免費' },
  { value: 'underOrEqual300', label: 'NT$1–300' },
  { value: 'between301And500', label: 'NT$301–500' },
  { value: 'over500', label: 'NT$501 以上' },
]

export const SORTS = [
  { value: 'default', label: '預設' },
  { value: 'dateAsc', label: '日期最近' },
  { value: 'priceAsc', label: '價格最低' },
  { value: 'availability', label: '尚有名額' },
  { value: 'almostFull', label: '即將額滿' },
]

export const SECTION_VIEW = { ALL: 'all', FEATURED: 'featured', URGENT: 'urgent' }

export const EVENT_STATUS = {
  DRAFT: 'draft',
  PUBLISHED: 'published',
  FULL: 'full',
  CANCELLED: 'cancelled',
  COMPLETED: 'completed',
}

function labelOf(list, value, openLabel) {
  if (openLabel && value === LEVEL_OPEN) return openLabel
  const found = list.find((item) => item.value === value)
  return found ? found.label : value
}

export const getTypeLabel = (value) => labelOf(EVENT_TYPES, value)
export const getLevelLabel = (value) => labelOf(LEVELS, value, '不限')
export const getGenderLabel = (value) => labelOf(GENDERS, value, '不限')
export const getCityLabel = (value) => labelOf(CITIES, value)
export const getPriceBracketLabel = (value) => labelOf(PRICE_BRACKETS, value)

export const DEFAULT_FILTERS = {
  type: FILTER_ALL,
  gender: FILTER_ALL,
  level: FILTER_ALL,
  price: FILTER_ALL,
  city: FILTER_ALL,
}
