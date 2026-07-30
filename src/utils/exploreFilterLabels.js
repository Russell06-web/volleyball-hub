import { getCityLabel, getGenderLabel, getLevelLabel, getPriceBracketLabel, getTypeLabel } from '../constants/taxonomy'
import {
  getCourtSurfaceLabel, getEquipmentLabel, getNetHeightLabel, getPlayStyleLabel, getPositionLabel, getVolleyballFormatLabel,
} from '../constants/volleyballTaxonomy'
import { DATE_RANGES } from './dateRange'

const BOOLEAN_FLAG_LABELS = {
  rotation: '需要輪轉',
  soloJoin: '允許單人加入',
  includeOpenLevel: '含未限制程度',
  includeOpenGender: '含未限制性別',
  urgentOnly: '僅看臨打',
}

function getDateRangeLabel(value) {
  const found = DATE_RANGES.find((d) => d.value === value)
  return found ? found.label : value
}

// Active-filter chips must show the taxonomy display label, never the raw
// enum value (a chip reading "underOrEqual300" instead of "NT$1–300", or
// "setter" instead of "舉球", would be exactly the internal-value leak
// the enum refactor was meant to prevent).
export function getLabelForFilter(key, value) {
  if (BOOLEAN_FLAG_LABELS[key]) return BOOLEAN_FLAG_LABELS[key]
  switch (key) {
    case 'type': return getTypeLabel(value)
    case 'gender': return getGenderLabel(value)
    case 'level': return getLevelLabel(value)
    case 'price': return getPriceBracketLabel(value)
    case 'city': return getCityLabel(value)
    case 'dateRange': return getDateRangeLabel(value)
    case 'position': return getPositionLabel(value)
    case 'playStyle': return getPlayStyleLabel(value)
    case 'netHeight': return getNetHeightLabel(value)
    case 'format': return getVolleyballFormatLabel(value)
    case 'surface': return getCourtSurfaceLabel(value)
    case 'equipment': return getEquipmentLabel(value)
    default: return value
  }
}
