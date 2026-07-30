import { Icon } from './Icons'
import AccordionSection from './Accordion'
import { matchesPriceBracket } from '../utils/priceBracket'
import { DATE_RANGES, matchesDateRange } from '../utils/dateRange'
import {
  CITIES, DEFAULT_FILTERS, EVENT_TYPES, FILTER_ALL, GENDER_OPEN, GENDERS, LEVEL_OPEN, LEVELS, PRICE_BRACKETS,
} from '../constants/taxonomy'
import {
  COURT_SURFACES, EQUIPMENT_OPTIONS, NET_HEIGHTS, PLAY_STYLES, POSITIONS, VOLLEYBALL_FORMATS,
} from '../constants/volleyballTaxonomy'

export { DEFAULT_FILTERS }

const TYPE_OPTIONS = [{ value: FILTER_ALL, label: '全部', icon: 'i-ball' }, ...EVENT_TYPES.map((t) => ({ ...t, icon: iconForType(t.value) }))]
const GENDER_OPTIONS = [{ value: FILTER_ALL, label: '不限' }, ...GENDERS]
const LEVEL_OPTIONS = [{ value: FILTER_ALL, label: '全部' }, ...LEVELS]
const PRICE_OPTIONS = [{ value: FILTER_ALL, label: '全部' }, ...PRICE_BRACKETS]
const CITY_OPTIONS = [{ value: FILTER_ALL, label: '全部' }, ...CITIES]
const DATE_RANGE_OPTIONS = [{ value: FILTER_ALL, label: '全部日期' }, ...DATE_RANGES]
const POSITION_OPTIONS = [{ value: FILTER_ALL, label: '全部' }, ...POSITIONS]
const PLAY_STYLE_OPTIONS = [{ value: FILTER_ALL, label: '全部' }, ...PLAY_STYLES]
const NET_HEIGHT_OPTIONS = [{ value: FILTER_ALL, label: '全部' }, ...NET_HEIGHTS]
const FORMAT_OPTIONS = [{ value: FILTER_ALL, label: '全部' }, ...VOLLEYBALL_FORMATS]
const SURFACE_OPTIONS = [{ value: FILTER_ALL, label: '全部' }, ...COURT_SURFACES]
const EQUIPMENT_FILTER_OPTIONS = [{ value: FILTER_ALL, label: '全部' }, ...EQUIPMENT_OPTIONS]

function iconForType(value) {
  switch (value) {
    case 'indoor': return 'i-home'
    case 'beach': return 'i-users'
    case 'grass': return 'i-trend'
    case 'family': return 'i-heart'
    default: return 'i-ball'
  }
}

// Explore's hard filter is strict on purpose: when the user has
// explicitly chosen a level or gender, an event the organiser left "open"
// (unspecified) does NOT count as a match unless the matching
// includeOpenLevel/includeOpenGender flag is on — it goes to
// EventDetail's condition-match explanation instead by default, which
// can say "主辦方未限制，仍需自行確認". The volleyball-specific fields
// (position/playStyle/netHeight/format/surface/rotation/soloJoin/
// equipment) are objective hard facts, not soft preferences, so they
// only ever filter this list — see docs/PRODUCT_DECISIONS.md.
export function matchesFilters(ev, f) {
  if (f.type !== FILTER_ALL && ev.type !== f.type) return false

  if (f.gender !== FILTER_ALL) {
    const genderOk = ev.gender === f.gender || (f.includeOpenGender === 'true' && ev.gender === GENDER_OPEN)
    if (!genderOk) return false
  }
  if (f.level !== FILTER_ALL) {
    const levelOk = ev.level === f.level || (f.includeOpenLevel === 'true' && ev.level === LEVEL_OPEN)
    if (!levelOk) return false
  }
  if (f.city !== FILTER_ALL && ev.city !== f.city) return false
  if (!matchesPriceBracket(ev.price, f.price)) return false
  if (f.dateRange && f.dateRange !== FILTER_ALL && !matchesDateRange(ev, f.dateRange)) return false

  if (f.position && f.position !== FILTER_ALL) {
    const hasPosition = (ev.positionsNeeded || []).some((p) => p.position === f.position && p.count > 0)
    if (!hasPosition) return false
  }
  if (f.playStyle && f.playStyle !== FILTER_ALL && ev.playStyle !== f.playStyle) return false
  if (f.netHeight && f.netHeight !== FILTER_ALL && ev.netHeight !== f.netHeight) return false
  if (f.format && f.format !== FILTER_ALL && ev.volleyballFormat !== f.format) return false
  if (f.surface && f.surface !== FILTER_ALL && ev.courtSurface !== f.surface) return false
  if (f.rotation === 'true' && !ev.rotationRequired) return false
  if (f.soloJoin === 'true' && !ev.soloJoinAllowed) return false
  if (f.equipment && f.equipment !== FILTER_ALL && !(ev.equipmentProvided || []).includes(f.equipment)) return false
  if (f.urgentOnly === 'true' && !ev.isUrgent) return false

  return true
}

function OptionGrid({ options, value, field, onChange, variant = 'type' }) {
  const cls = variant === 'type' ? 'type-grid' : 'chip-row'
  return (
    <div className={cls}>
      {options.map((opt) => (
        <button
          key={opt.value}
          type="button"
          className={variant === 'type' ? `type-card${value === opt.value ? ' active' : ''}` : `chip${value === opt.value ? ' active' : ''}`}
          aria-pressed={value === opt.value}
          onClick={() => onChange(field, opt.value)}
        >
          {opt.icon && <Icon id={opt.icon} size={20} />}{opt.label}
        </button>
      ))}
    </div>
  )
}

function ToggleChip({ label, active, onToggle }) {
  return (
    <button type="button" className={`chip toggle-chip${active ? ' active' : ''}`} aria-pressed={active} onClick={onToggle}>
      {active && <Icon id="i-check" size={13} />}{label}
    </button>
  )
}

function BasicFilterFields({ filters, onChange }) {
  return (
    <>
      <div className="filter-group">
        <h3>活動類型</h3>
        <OptionGrid options={TYPE_OPTIONS} value={filters.type} field="type" onChange={onChange} variant="type" />
        <ToggleChip label="僅看臨打" active={filters.urgentOnly === 'true'} onToggle={() => onChange('urgentOnly', filters.urgentOnly === 'true' ? FILTER_ALL : 'true')} />
      </div>

      <div className="filter-group">
        <h3>性別限制</h3>
        <OptionGrid options={GENDER_OPTIONS} value={filters.gender} field="gender" onChange={onChange} variant="chip" />
        {filters.gender !== FILTER_ALL && (
          <ToggleChip label="含未限制性別的活動" active={filters.includeOpenGender === 'true'} onToggle={() => onChange('includeOpenGender', filters.includeOpenGender === 'true' ? FILTER_ALL : 'true')} />
        )}
      </div>

      <div className="filter-group">
        <h3>技能等級</h3>
        <OptionGrid options={LEVEL_OPTIONS} value={filters.level} field="level" onChange={onChange} variant="chip" />
        {filters.level !== FILTER_ALL && (
          <ToggleChip label="含未限制程度的活動" active={filters.includeOpenLevel === 'true'} onToggle={() => onChange('includeOpenLevel', filters.includeOpenLevel === 'true' ? FILTER_ALL : 'true')} />
        )}
      </div>

      <div className="filter-group">
        <h3>日期</h3>
        <div className="chip-row">
          {DATE_RANGE_OPTIONS.map((d) => (
            <button key={d.value} type="button" className={`chip${filters.dateRange === d.value ? ' active' : ''}`} aria-pressed={filters.dateRange === d.value} onClick={() => onChange('dateRange', d.value)}>{d.label}</button>
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
        <OptionGrid options={CITY_OPTIONS} value={filters.city} field="city" onChange={onChange} variant="type" />
      </div>
    </>
  )
}

function VolleyballConditionFields({ filters, onChange }) {
  return (
    <>
      <div className="filter-group" data-filter-field="position">
        <h3>位置需求</h3>
        <OptionGrid options={POSITION_OPTIONS} value={filters.position} field="position" onChange={onChange} variant="chip" />
      </div>
      <div className="filter-group">
        <h3>活動風格</h3>
        <OptionGrid options={PLAY_STYLE_OPTIONS} value={filters.playStyle} field="playStyle" onChange={onChange} variant="chip" />
      </div>
      <div className="filter-group">
        <h3>網高</h3>
        <OptionGrid options={NET_HEIGHT_OPTIONS} value={filters.netHeight} field="netHeight" onChange={onChange} variant="chip" />
      </div>
      <div className="filter-group">
        <h3>球制</h3>
        <OptionGrid options={FORMAT_OPTIONS} value={filters.format} field="format" onChange={onChange} variant="chip" />
      </div>
      <div className="filter-group">
        <h3>其他條件</h3>
        <div className="chip-row">
          <ToggleChip label="需要輪轉" active={filters.rotation === 'true'} onToggle={() => onChange('rotation', filters.rotation === 'true' ? FILTER_ALL : 'true')} />
          <ToggleChip label="允許單人加入" active={filters.soloJoin === 'true'} onToggle={() => onChange('soloJoin', filters.soloJoin === 'true' ? FILTER_ALL : 'true')} />
        </div>
      </div>
    </>
  )
}

function VenueEquipmentFields({ filters, onChange }) {
  return (
    <>
      <div className="filter-group">
        <h3>場地材質</h3>
        <OptionGrid options={SURFACE_OPTIONS} value={filters.surface} field="surface" onChange={onChange} variant="chip" />
      </div>
      <div className="filter-group">
        <h3>提供設備</h3>
        <OptionGrid options={EQUIPMENT_FILTER_OPTIONS} value={filters.equipment} field="equipment" onChange={onChange} variant="chip" />
      </div>
    </>
  )
}

// `layout="sidebar"` (desktop, default): basic fields always visible,
// all 10 volleyball-specific fields collapsed under one "進階排球條件"
// toggle. `layout="modal"` (mobile/tablet FilterModal): three accordion
// sections — 基本條件 (open by default) / 排球條件 / 場地與設備 — so a
// first-time visitor sees 6 simple controls, not 16, per the progressive-
// disclosure brief.
//
// `initialSection` only matters for layout="modal": when it's 'volleyball'
// (set by Explore's "我需要的位置" quick entry when the visitor has no
// real default position to apply directly), the 排球條件 accordion also
// opens by default alongside 基本條件 — a normal filter-trigger open
// passes no initialSection, so it always starts from 基本條件 only, per
// the "don't jump to position on a generic open" rule.
export default function FilterPanel({
  heading = '篩選活動', filters, onChange, onApply, onReset, resultCount, isFiltering, applyLabel, layout = 'sidebar', initialSection = null,
}) {
  const resultCountText = isFiltering ? `${resultCount} 場活動符合條件` : `共 ${resultCount} 場活動`

  return (
    <>
      {heading && <h2>{heading}</h2>}

      {layout === 'modal' ? (
        <>
          <AccordionSection title="基本條件" defaultOpen>
            <BasicFilterFields filters={filters} onChange={onChange} />
          </AccordionSection>
          <AccordionSection title="排球條件" defaultOpen={initialSection === 'volleyball'}>
            <VolleyballConditionFields filters={filters} onChange={onChange} />
          </AccordionSection>
          <AccordionSection title="場地與設備">
            <VenueEquipmentFields filters={filters} onChange={onChange} />
          </AccordionSection>
        </>
      ) : (
        <>
          <BasicFilterFields filters={filters} onChange={onChange} />
          <AccordionSection title="進階排球條件">
            <VolleyballConditionFields filters={filters} onChange={onChange} />
            <VenueEquipmentFields filters={filters} onChange={onChange} />
          </AccordionSection>
        </>
      )}

      <p className="filter-result-count">{resultCountText}</p>

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
