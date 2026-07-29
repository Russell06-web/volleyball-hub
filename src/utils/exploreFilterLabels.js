import { getCityLabel, getGenderLabel, getLevelLabel, getPriceBracketLabel, getTypeLabel } from '../constants/taxonomy'

// Active-filter chips must show the taxonomy display label, never the raw
// enum value (a chip reading "underOrEqual300" instead of "NT$1–300"
// would be exactly the internal-value leak the enum refactor was meant
// to prevent).
export function getLabelForFilter(key, value) {
  switch (key) {
    case 'type': return getTypeLabel(value)
    case 'gender': return getGenderLabel(value)
    case 'level': return getLevelLabel(value)
    case 'price': return getPriceBracketLabel(value)
    case 'city': return getCityLabel(value)
    default: return value
  }
}
