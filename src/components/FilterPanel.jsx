import { useState } from 'react'
import { Icon } from './Icons'

const TYPES = [
  { icon: 'i-ball', label: '全部' },
  { icon: 'i-trend', label: '排球' },
  { icon: 'i-users', label: '沙灘排球' },
  { icon: 'i-home', label: '室內排球' },
]
const GENDERS = ['不限', '男生', '女生', '混合']
const LEVELS = ['初階', '中階', '高階']
const PRICES = ['NT$ 300 以下', 'NT$ 300–500', 'NT$ 500 以上']
const CITIES = ['全部', '台北', '新北', '桃園']

function useToggle(defaultIndex) {
  const [active, setActive] = useState(defaultIndex)
  return [active, setActive]
}

export default function FilterPanel({ heading = '篩選活動', onApply, applyLabel = '套用篩選 · 共 14 場' }) {
  const [type, setType] = useToggle(0)
  const [gender, setGender] = useToggle(0)
  const [level, setLevel] = useToggle(1)
  const [price, setPrice] = useToggle(1)
  const [city, setCity] = useToggle(0)

  return (
    <>
      {heading && <h2>{heading}</h2>}

      <div className="filter-group">
        <h3>活動類型</h3>
        <div className="type-grid">
          {TYPES.map((t, i) => (
            <button key={t.label} type="button" className={`type-card${i === type ? ' active' : ''}`} onClick={() => setType(i)}>
              <Icon id={t.icon} size={20} />{t.label}
            </button>
          ))}
        </div>
      </div>

      <div className="filter-group">
        <h3>性別限制</h3>
        <div className="chip-row">
          {GENDERS.map((g, i) => (
            <button key={g} type="button" className={`chip dark${i === gender ? ' active' : ''}`} onClick={() => setGender(i)}>{g}</button>
          ))}
        </div>
      </div>

      <div className="filter-group">
        <h3>技能等級</h3>
        <div className="chip-row">
          {LEVELS.map((l, i) => (
            <button key={l} type="button" className={`chip${i === level ? ' active' : ''}`} onClick={() => setLevel(i)}>{l}</button>
          ))}
        </div>
      </div>

      <div className="filter-group">
        <h3>價格範圍</h3>
        <div className="chip-row col">
          {PRICES.map((p, i) => (
            <button key={p} type="button" className={`chip full${i === price ? ' active' : ''}`} onClick={() => setPrice(i)}>{p}</button>
          ))}
        </div>
      </div>

      <div className="filter-group">
        <h3>城市</h3>
        <div className="type-grid">
          {CITIES.map((c, i) => (
            <button key={c} type="button" className={`type-card${i === city ? ' active' : ''}`} onClick={() => setCity(i)}>{c}</button>
          ))}
        </div>
      </div>

      {onApply ? (
        <div className="filter-modal-actions">
          <button type="button" className="btn-secondary">重置</button>
          <button type="button" className="btn-primary" onClick={onApply}>{applyLabel}</button>
        </div>
      ) : (
        <button type="button" className="btn-primary full">{applyLabel}</button>
      )}
    </>
  )
}
