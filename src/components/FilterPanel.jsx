import { Icon } from './Icons'

export const DEFAULT_FILTERS = { type: '全部', gender: '不限', level: '全部', price: '全部', city: '全部' }

const TYPES = [
  { icon: 'i-ball', label: '全部' },
  { icon: 'i-trend', label: '排球' },
  { icon: 'i-users', label: '沙灘排球' },
  { icon: 'i-home', label: '室內排球' },
]
const GENDERS = ['不限', '男生', '女生', '混合']
const LEVELS = ['全部', '初階', '中階', '高階']
const PRICES = ['全部', 'NT$ 300 以下', 'NT$ 300–500', 'NT$ 500 以上']
const CITIES = ['全部', '台北', '新北', '桃園']

export function matchesFilters(ev, f) {
  if (f.type !== '全部' && ev.type !== f.type) return false
  if (f.gender !== '不限' && ev.gender !== f.gender && ev.gender !== '不限') return false
  if (f.level !== '全部' && ev.level !== f.level && ev.level !== '不限') return false
  if (f.city !== '全部' && ev.city !== f.city) return false
  if (f.price === 'NT$ 300 以下' && ev.price >= 300) return false
  if (f.price === 'NT$ 300–500' && (ev.price < 300 || ev.price > 500)) return false
  if (f.price === 'NT$ 500 以上' && ev.price <= 500) return false
  return true
}

export default function FilterPanel({ heading = '篩選活動', filters, onChange, onApply, onReset, resultCount, applyLabel }) {
  return (
    <>
      {heading && <h2>{heading}</h2>}

      <div className="filter-group">
        <h3>活動類型</h3>
        <div className="type-grid">
          {TYPES.map((t) => (
            <button key={t.label} type="button" className={`type-card${filters.type === t.label ? ' active' : ''}`} onClick={() => onChange('type', t.label)}>
              <Icon id={t.icon} size={20} />{t.label}
            </button>
          ))}
        </div>
      </div>

      <div className="filter-group">
        <h3>性別限制</h3>
        <div className="chip-row">
          {GENDERS.map((g) => (
            <button key={g} type="button" className={`chip dark${filters.gender === g ? ' active' : ''}`} onClick={() => onChange('gender', g)}>{g}</button>
          ))}
        </div>
      </div>

      <div className="filter-group">
        <h3>技能等級</h3>
        <div className="chip-row">
          {LEVELS.map((l) => (
            <button key={l} type="button" className={`chip${filters.level === l ? ' active' : ''}`} onClick={() => onChange('level', l)}>{l}</button>
          ))}
        </div>
      </div>

      <div className="filter-group">
        <h3>價格範圍</h3>
        <div className="chip-row col">
          {PRICES.map((p) => (
            <button key={p} type="button" className={`chip full${filters.price === p ? ' active' : ''}`} onClick={() => onChange('price', p)}>{p}</button>
          ))}
        </div>
      </div>

      <div className="filter-group">
        <h3>城市</h3>
        <div className="type-grid">
          {CITIES.map((c) => (
            <button key={c} type="button" className={`type-card${filters.city === c ? ' active' : ''}`} onClick={() => onChange('city', c)}>{c}</button>
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
