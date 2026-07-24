import { Icon } from './Icons'
import { matchesPriceBracket } from '../utils/priceBracket'
import { CITIES, DEFAULT_FILTERS, EVENT_TYPES, FILTER_ALL, GENDERS, LEVELS, PRICE_BRACKETS } from '../constants/taxonomy'

export { DEFAULT_FILTERS }

const TYPE_OPTIONS = [{ value: FILTER_ALL, label: '全部', icon: 'i-ball' }, ...EVENT_TYPES.map((t) => ({ ...t, icon: iconForType(t.value) }))]
const GENDER_OPTIONS = [{ value: FILTER_ALL, label: '不限' }, ...GENDERS]
const LEVEL_OPTIONS = [{ value: FILTER_ALL, label: '全部' }, ...LEVELS]
const PRICE_OPTIONS = [{ value: FILTER_ALL, label: '全部' }, ...PRICE_BRACKETS]
const CITY_OPTIONS = [{ value: FILTER_ALL, label: '全部' }, ...CITIES]

function iconForType(value) {
  switch (value) {
    case 'indoor': return 'i-home'
    case 'beach': return 'i-users'
    case 'grass': return 'i-trend'
    case 'family': return 'i-heart'
    default: return 'i-ball'
  }
}

export function matchesFilters(ev, f) {
  if (f.type !== FILTER_ALL && ev.type !== f.type) return false
  if (f.gender !== FILTER_ALL && ev.gender !== f.gender && ev.gender !== 'open') return false
  if (f.level !== FILTER_ALL && ev.level !== f.level && ev.level !== 'open') return false
  if (f.city !== FILTER_ALL && ev.city !== f.city) return false
  if (!matchesPriceBracket(ev.price, f.price)) return false
  return true
}

export default function FilterPanel({ heading = '篩選活動', filters, onChange, onApply, onReset, resultCount, applyLabel }) {
  return (
    <>
      {heading && <h2>{heading}</h2>}

      <div className="filter-group">
        <h3>活動類型</h3>
        <div className="type-grid">
          {TYPE_OPTIONS.map((t) => (
            <button key={t.value} type="button" className={`type-card${filters.type === t.value ? ' active' : ''}`} aria-pressed={filters.type === t.value} onClick={() => onChange('type', t.value)}>
              <Icon id={t.icon} size={20} />{t.label}
            </button>
          ))}
        </div>
      </div>

      <div className="filter-group">
        <h3>性別限制</h3>
        <div className="chip-row">
          {GENDER_OPTIONS.map((g) => (
            <button key={g.value} type="button" className={`chip dark${filters.gender === g.value ? ' active' : ''}`} aria-pressed={filters.gender === g.value} onClick={() => onChange('gender', g.value)}>{g.label}</button>
          ))}
        </div>
      </div>

      <div className="filter-group">
        <h3>技能等級</h3>
        <div className="chip-row">
          {LEVEL_OPTIONS.map((l) => (
            <button key={l.value} type="button" className={`chip${filters.level === l.value ? ' active' : ''}`} aria-pressed={filters.level === l.value} onClick={() => onChange('level', l.value)}>{l.label}</button>
          ))}
        </div>
      </div>

      <div className="filter-group">
        <h3>價格範圍</h3>
        <div className="chip-row col">
          {PRICE_OPTIONS.map((p) => (
            <button key={p.value} type="button" className={`chip full${filters.price === p.value ? ' active' : ''}`} aria-pressed={filters.price === p.value} onClick={() => onChange('price', p.value)}>{p.label}</button>
          ))}
        </div>
      </div>

      <div className="filter-group">
        <h3>城市</h3>
        <div className="type-grid">
          {CITY_OPTIONS.map((c) => (
            <button key={c.value} type="button" className={`type-card${filters.city === c.value ? ' active' : ''}`} aria-pressed={filters.city === c.value} onClick={() => onChange('city', c.value)}>{c.label}</button>
          ))}
        </div>
      </div>

      <p className="filter-result-count">{resultCount} 場活動符合條件</p>

      {onApply ? (
        <div className="filter-modal-actions">
          <button type="button" className="btn-secondary" onClick={onReset}>重置</button>
          <button type="button" className="btn-primary" onClick={onApply}>{applyLabel || '套用篩選'}</button>
        </div>
      ) : (
        <button type="button" className="btn-secondary full" onClick={onReset}>重置篩選</button>
      )}
    </>
  )
}
