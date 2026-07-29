import { useEffect, useMemo, useState } from 'react'
import Header from '../components/Header'
import BottomTabs from '../components/BottomTabs'
import SiteFooter from '../components/SiteFooter'
import ConfirmDialog from '../components/ConfirmDialog'
import { Icon } from '../components/Icons'
import { useEvents } from '../context/EventsContext'
import { useBookings } from '../context/BookingsContext'
import { useProfile } from '../context/ProfileContext'
import { useToast } from '../context/ToastContext'
import { futureDateWithLabel, getTaipeiDateString } from '../utils/date'
import { formatPrice } from '../utils/format'
import { CURRENT_USER_ID, EVENT_STATUS, GENDER_OPEN, GENDERS, LEVEL_OPEN, LEVELS, EVENT_TYPES } from '../constants/taxonomy'
import {
  COURT_SURFACE_UNSPECIFIED, COURT_SURFACES, EQUIPMENT_OPTIONS, getPositionLabel, NET_HEIGHT_UNSPECIFIED,
  NET_HEIGHTS, PLAY_STYLES, POSITIONS, VOLLEYBALL_FORMATS,
} from '../constants/volleyballTaxonomy'
import { isValidTaiwanMobile } from '../utils/bookingValidation'
import { getEventInformationQuality, INFO_FIELD_LABELS } from '../utils/informationQuality'
import { EVENT_STATUS_META, getEventStatus } from '../utils/eventStatus'
import '../styles/bookings.css'
import '../styles/manage.css'

const STATUS_META = {
  pending: { label: '待確認', tone: 'warn' },
  confirmed: { label: '已確認', tone: 'ok' },
  waitlist: { label: '候補中', tone: 'wait' },
  completed: { label: '已完成', tone: 'done' },
  cancelled: { label: '已取消', tone: 'done' },
}

// Venue rating/rental-price data is illustrative — there's no real venue
// booking API behind this wizard. The disclaimer strip in step 1 says so
// explicitly so this never reads as "we integrated with real venues".
const VENUES = [
  { name: '台北市立體育館', city: 'taipei', rating: '4.5 · 4 個場地', address: '台北市松山區南京東路四段10號', rentalPrice: 'NT$1,200', tags: ['更衣室', '淋浴間', '停車場', '飲水機'] },
  { name: '新北運動中心', city: 'newTaipei', rating: '4.7 · 6 個場地', address: '新北市板橋區縣民大道二段7號', rentalPrice: 'NT$1,500', tags: ['更衣室', '淋浴間', '停車場', '置物櫃'] },
  { name: '中正運動中心', city: 'taipei', rating: '4.1 · 2 個場地', address: '台北市中正區信義路一段1號', rentalPrice: 'NT$800', tags: ['更衣室', '飲水機'] },
  { name: '信義運動中心', city: 'taipei', rating: '4.8 · 5 個場地', address: '台北市信義區松勤街100號', rentalPrice: 'NT$1,800', tags: ['更衣室', '淋浴間', '停車場', 'WiFi'] },
]

// Real upcoming dates, generated the same way src/data/events.js does —
// no more hardcoded "12/15" that's already in the past by the time
// someone looks at this. capped 1 year out as a sane upper bound.
//
// Wrapped in an arrow rather than passed directly — Array.map calls its
// callback with (element, index, array), and futureDateWithLabel's
// second parameter is `referenceDate`, so `.map(futureDateWithLabel)`
// silently fed the array index in as referenceDate (0 for the first
// entry → `new Date(0)` → 1970-01-0x). Every event this wizard ever
// published got a bogus ~1970 date as a result; it only surfaced once
// step 4 started validating "date not before today" for real.
const DATE_OPTIONS = [2, 3, 4, 7, 9].map((daysFromNow) => futureDateWithLabel(daysFromNow))
const MAX_CAPACITY = 200
const TITLE_MAX = 40
const DESCRIPTION_MAX = 500
const RULES_MAX = 300
const SKILL_NOTES_MAX = 200

const SLOTS = [
  { label: '早上 06:00–09:00', time: '06:00', endTime: '09:00', rentalPrice: 'NT$960 / 小時', badge: '-20%', tone: 'down' },
  { label: '上午 09:00–12:00', time: '09:00', endTime: '12:00', rentalPrice: 'NT$1,200 / 小時' },
  { label: '下午 12:00–15:00', time: '12:00', endTime: '15:00', rentalPrice: 'NT$1,200 / 小時' },
  { label: '晚上 18:00–21:00', time: '18:00', endTime: '21:00', rentalPrice: 'NT$1,560 / 小時', badge: '+30%', tone: 'up' },
  { label: '夜間 21:00–23:59', time: '21:00', endTime: '23:59', rentalPrice: 'NT$1,440 / 小時', badge: '+20%', tone: 'up' },
]

function Dashboard({ onNewEvent }) {
  const { events, cancelEvent, removeEvent } = useEvents()
  const { bookings } = useBookings()
  const { showToast } = useToast()
  const [subTab, setSubTab] = useState('events')
  const [confirmTarget, setConfirmTarget] = useState(null) // { event, hasBookings }

  const myEvents = useMemo(() => events.filter((e) => e.ownerId === CURRENT_USER_ID), [events])
  const myEventIds = useMemo(() => myEvents.map((e) => e.id), [myEvents])

  const activeEvents = useMemo(() => myEvents.filter((e) => getEventStatus(e) !== EVENT_STATUS.CANCELLED), [myEvents])
  const totalRegistrations = activeEvents.reduce((sum, e) => sum + e.registeredCount, 0)
  // A real, computed fill rate across the events this organiser actually
  // runs — not a fixed "85%" with nothing behind it.
  const avgFillRate = activeEvents.length
    ? Math.round((activeEvents.reduce((sum, e) => sum + e.registeredCount / e.capacity, 0) / activeEvents.length) * 100)
    : 0

  const records = useMemo(
    () => bookings
      .filter((b) => b.eventId && myEventIds.includes(b.eventId))
      .map((b) => {
        const event = events.find((e) => e.id === b.eventId)
        return {
          key: b.id,
          name: b.registrant?.name || '訪客',
          event: event ? event.title : '活動資料已不存在',
          status: b.status,
          date: new Date(b.createdAt || Date.now()).toISOString().slice(0, 10),
        }
      }),
    [bookings, myEventIds, events],
  )

  function eventBookingCount(eventId) {
    return bookings.filter((b) => b.eventId === eventId && b.status !== 'cancelled').length
  }

  function handleDeleteClick(event) {
    const hasBookings = eventBookingCount(event.id) > 0
    setConfirmTarget({ event, hasBookings })
  }

  function handleConfirmRemove() {
    if (!confirmTarget) return
    if (confirmTarget.hasBookings) {
      cancelEvent(confirmTarget.event.id)
      showToast('活動已取消，探索頁不再開放報名')
    } else {
      removeEvent(confirmTarget.event.id)
      showToast('活動已刪除')
    }
    setConfirmTarget(null)
  }

  return (
    <div>
      <div className="stats-strip cols-3">
        <div className="stat-tile"><Icon id="i-calendar" size={17} /><b>{activeEvents.length}</b><span>活動總數</span></div>
        <div className="stat-tile"><Icon id="i-users" size={17} /><b>{totalRegistrations}</b><span>報名總數</span></div>
        <div className="stat-tile"><Icon id="i-trend" size={17} /><b>{avgFillRate}%</b><span>平均報名率</span></div>
      </div>

      <button className="btn-dark full" onClick={onNewEvent}>＋新增活動</button>

      <div className="chip-row tab-filter" role="tablist" aria-label="活動管理檢視">
        <button role="tab" aria-selected={subTab === 'events'} className={`chip${subTab === 'events' ? ' active' : ''}`} onClick={() => setSubTab('events')}>活動管理</button>
        <button role="tab" aria-selected={subTab === 'records'} className={`chip${subTab === 'records' ? ' active' : ''}`} onClick={() => setSubTab('records')}>報名紀錄</button>
      </div>

      {subTab === 'events' ? (
        myEvents.length === 0 ? (
          <p className="empty-state">你還沒有主辦任何活動，點上面的「＋新增活動」開始建立第一場。</p>
        ) : (
          <div className="booking-grid">
            {myEvents.map((ev) => {
              const status = getEventStatus(ev)
              const meta = EVENT_STATUS_META[status]
              return (
                <article key={ev.id} className="card manage-event-card">
                  <div className="card-top">
                    <h3>{ev.title}</h3>
                    <button className="icon-btn ghost sm danger" aria-label={`刪除或取消「${ev.title}」`} onClick={() => handleDeleteClick(ev)}>
                      <Icon id="i-trash" size={15} />
                    </button>
                  </div>
                  <ul className="meta"><li><Icon id="i-calendar" size={14} />{ev.date}・{ev.startTime}{ev.endTime ? `–${ev.endTime}` : ''}</li></ul>
                  <div className="tag-row">
                    <span className={`badge ${meta.tone}`}>{meta.label}</span>
                    <span className="tag">{ev.registeredCount} / {ev.capacity} 人</span>
                    <span className="badge featured">{formatPrice(ev.price)}</span>
                  </div>
                </article>
              )
            })}
          </div>
        )
      ) : records.length === 0 ? (
        <p className="empty-state">目前還沒有人報名你主辦的活動。</p>
      ) : (
        <div className="record-list">
          {records.map((r) => (
            <div key={r.key} className={`record-row ${STATUS_META[r.status]?.tone || ''}`}>
              <div><b>{r.name}</b><span>{r.event}</span></div>
              <span className={`badge ${STATUS_META[r.status]?.tone || ''}`}>{STATUS_META[r.status]?.label || r.status}</span>
              <span className="record-date">{r.date}</span>
            </div>
          ))}
        </div>
      )}

      <ConfirmDialog
        open={!!confirmTarget}
        onClose={() => setConfirmTarget(null)}
        onConfirm={handleConfirmRemove}
        titleId="deleteEventTitle"
        title={confirmTarget?.hasBookings ? '取消這場活動？' : '刪除這場活動？'}
        description={
          confirmTarget?.hasBookings
            ? `「${confirmTarget?.event.title}」已經有人報名，無法直接刪除。確認後活動狀態會改成「已取消」：探索頁不再開放報名，活動詳情頁與相關報名紀錄都會顯示已取消，但不會自動發送通知或退款。`
            : `「${confirmTarget?.event.title}」目前沒有任何報名紀錄，刪除後無法復原，探索頁也會立即看不到這場活動。`
        }
        confirmLabel={confirmTarget?.hasBookings ? '確認取消活動' : '確認刪除'}
        danger
      />
    </div>
  )
}

const STEP_TITLES = ['基本資訊', '場地與時間', '排球規則與需求', '費用與預覽']

function CreateWizard({ onBack }) {
  const { addEvent } = useEvents()
  const { profile } = useProfile()
  const { showToast } = useToast()

  const [step, setStep] = useState(1)

  // Step 1 — 基本資訊
  const [title, setTitle] = useState('')
  const [type, setType] = useState(EVENT_TYPES[0].value)
  const [playStyle, setPlayStyle] = useState('')
  const [level, setLevel] = useState(LEVEL_OPEN)
  const [gender, setGender] = useState(GENDER_OPEN)
  const [description, setDescription] = useState('')

  // Step 2 — 場地與時間
  const [venue, setVenue] = useState(0)
  const [dateIdx, setDateIdx] = useState(0)
  const [slot, setSlot] = useState(1)
  const [netHeight, setNetHeight] = useState(NET_HEIGHT_UNSPECIFIED)
  const [courtSurface, setCourtSurface] = useState(COURT_SURFACE_UNSPECIFIED)

  // Step 3 — 排球規則與需求
  const [format, setFormat] = useState(VOLLEYBALL_FORMATS[0].value)
  const [rotationRequired, setRotationRequired] = useState(false)
  const [liberoAllowed, setLiberoAllowed] = useState(false)
  const [soloJoinAllowed, setSoloJoinAllowed] = useState(true)
  const [positionsNeeded, setPositionsNeeded] = useState([])
  const [newPosition, setNewPosition] = useState(POSITIONS[0].value)
  const [newPositionCount, setNewPositionCount] = useState('')
  const [capacity, setCapacity] = useState('')
  const [equipmentProvided, setEquipmentProvided] = useState([])
  const [skillNotes, setSkillNotes] = useState('')
  const [rules, setRules] = useState('')

  // Step 4 — 費用與預覽
  const [price, setPrice] = useState('')
  const [hasInsurance, setHasInsurance] = useState(false)
  const [hasCoach, setHasCoach] = useState(false)
  const [contact, setContact] = useState('')

  const [errors, setErrors] = useState({})

  const pct = Math.round((step / 4) * 100)
  const capacityNum = Number(capacity)
  const priceNum = Number(price)
  const chosenVenue = VENUES[venue]
  const chosenSlot = SLOTS[slot]
  const positionsSum = positionsNeeded.reduce((sum, p) => sum + p.count, 0)

  // Built once and reused for both the step-4 preview and the info-
  // completeness gate — so "what gets checked" and "what gets published"
  // can never quietly drift apart.
  const previewEvent = {
    title: title.trim(),
    description: description.trim(),
    rules: rules.trim(),
    type,
    level,
    gender,
    city: chosenVenue.city,
    venueName: chosenVenue.name,
    address: chosenVenue.address,
    date: DATE_OPTIONS[dateIdx].date,
    startTime: chosenSlot.time,
    endTime: chosenSlot.endTime,
    capacity: Number.isInteger(capacityNum) ? capacityNum : 0,
    registeredCount: 0,
    price: Number.isNaN(priceNum) ? 0 : priceNum,
    paymentMethod: priceNum === 0 ? '無需付款' : '現場付款',
    organizerName: profile.name,
    organizerContact: contact.trim(),
    hasInsurance,
    hasCoach,
    playStyle,
    volleyballFormat: format,
    netHeight,
    courtSurface,
    rotationRequired,
    liberoAllowed,
    soloJoinAllowed,
    equipmentProvided,
    positionsNeeded,
    skillNotes: skillNotes.trim(),
  }
  const infoQuality = getEventInformationQuality(previewEvent)

  function focusFirstError(errs) {
    const key = Object.keys(errs)[0]
    if (!key) return
    requestAnimationFrame(() => document.getElementById(`w-${key}`)?.focus())
  }

  function validateStep1() {
    const errs = {}
    const trimmed = title.trim()
    if (!trimmed) errs.title = '請輸入活動標題'
    else if (trimmed.length > TITLE_MAX) errs.title = `活動標題請在 ${TITLE_MAX} 字以內`
    if (!description.trim()) errs.description = '請輸入活動介紹'
    return errs
  }

  function validateStep3() {
    const errs = {}
    if (!Number.isInteger(capacityNum) || capacityNum <= 0) errs.capacity = '人數上限請輸入正整數'
    else if (capacityNum > MAX_CAPACITY) errs.capacity = `人數上限不可超過 ${MAX_CAPACITY} 人`
    else if (positionsSum > capacityNum) errs.positionsNeeded = `位置需求人數加總（${positionsSum}）不能超過人數上限（${capacityNum}）`
    if (!soloJoinAllowed && !skillNotes.trim()) errs.skillNotes = '請說明報名方式（例如：僅接受完整隊伍報名，需 6 人以上）'
    if (!rules.trim()) errs.rules = '請輸入活動規則'
    return errs
  }

  function validateStep4() {
    const errs = {}
    if (price === '' || Number.isNaN(priceNum) || priceNum < 0) errs.price = '每人費用請輸入 0 或正數'
    if (!contact.trim()) errs.contact = '請輸入聯絡方式'
    else if (!isValidTaiwanMobile(contact)) errs.contact = '請輸入有效的台灣手機號碼，例如 0912-345-678'
    // DATE_OPTIONS only ever offers dates ≥ today (Asia/Taipei), so this
    // never actually fires — kept as a real safety net rather than an
    // assumption, in case that list's construction ever changes.
    if (previewEvent.date < getTaipeiDateString()) errs.date = '活動日期不能早於今天'
    return errs
  }

  function handleAddPosition() {
    const count = Math.max(0, Math.floor(Number(newPositionCount) || 0))
    if (count <= 0) return
    setPositionsNeeded((prev) => [...prev.filter((p) => p.position !== newPosition), { position: newPosition, count }])
    setNewPositionCount('')
  }
  function removePosition(position) {
    setPositionsNeeded((prev) => prev.filter((p) => p.position !== position))
  }
  function toggleEquipment(value) {
    setEquipmentProvided((prev) => (prev.includes(value) ? prev.filter((v) => v !== value) : [...prev, value]))
  }

  function handlePrev() {
    setErrors({})
    setStep(step - 1)
  }

  function handleNext() {
    if (step === 1) {
      const errs = validateStep1()
      setErrors(errs)
      if (Object.keys(errs).length > 0) { focusFirstError(errs); return }
    } else if (step === 3) {
      const errs = validateStep3()
      setErrors(errs)
      if (Object.keys(errs).length > 0) { focusFirstError(errs); return }
    } else if (step === 4) {
      const errs = validateStep4()
      setErrors(errs)
      if (Object.keys(errs).length > 0) { focusFirstError(errs); return }
      // Structurally unreachable today — venue/date/level are always
      // picked from a fixed list and organizerContact is already
      // required above, so every IMPORTANT_FIELDS entry is already
      // guaranteed filled by this point. Kept as a real gate (not just a
      // disabled button, which would give no explanation) so this stays
      // correct if a future field gets added to the wizard without also
      // being validated here.
      if (infoQuality.state === 'needsInfo') {
        showToast('請先補齊重要資訊再發布')
        return
      }
      addEvent({ ...previewEvent, ownerId: CURRENT_USER_ID })
      showToast('活動已發布')
      onBack()
      return
    }
    setErrors({})
    setStep(step + 1)
  }

  return (
    <div>
      <button className="text-back" onClick={onBack}><Icon id="i-back" size={16} />返回活動管理</button>

      <div className="step-progress">
        <div className="step-progress-head"><span>步驟 {step} / 4・{STEP_TITLES[step - 1]}</span><span>{pct}%</span></div>
        <div className="step-progress-bar"><div className="step-progress-fill" style={{ width: `${pct}%` }} /></div>
      </div>

      {/* Desktop-only stepper — same 4 steps, laid out as circles + labels
          instead of a bar, since there's room to show the whole path at
          once. The bar above still carries the same information on
          mobile/tablet, so this is presentation-only, not a second
          source of truth for what step you're on. */}
      <ol className="stepper" aria-hidden="true">
        {STEP_TITLES.map((title, i) => {
          const n = i + 1
          const state = n < step ? 'done' : n === step ? 'current' : 'upcoming'
          return (
            <li key={title} className={`stepper-item ${state}`}>
              <span className="stepper-dot">{state === 'done' ? <Icon id="i-check" size={13} /> : n}</span>
              <span className="stepper-label">{title}</span>
            </li>
          )
        })}
      </ol>

      {step === 1 && (
        <section className="wizard-step">
          <h2>基本資訊</h2>
          <p className="step-sub">活動的名稱、類型與適合對象</p>

          <div className="form-grid">
            <label className="field full">
              <span>活動標題 *</span>
              <input id="w-title" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="例如：週末排球友誼賽" aria-invalid={!!errors.title} aria-describedby={errors.title ? 'w-title-err' : undefined} />
              {errors.title && <span className="field-error" id="w-title-err">{errors.title}</span>}
            </label>

            <div className="field full"><span>活動類型</span>
              <div className="chip-row">
                {EVENT_TYPES.map((t) => <button key={t.value} type="button" className={`chip${type === t.value ? ' active' : ''}`} aria-pressed={type === t.value} onClick={() => setType(t.value)}>{t.label}</button>)}
              </div>
            </div>

            <div className="field full"><span>活動風格</span>
              <div className="chip-row">
                <button type="button" className={`chip${playStyle === '' ? ' active' : ''}`} aria-pressed={playStyle === ''} onClick={() => setPlayStyle('')}>未指定</button>
                {PLAY_STYLES.map((p) => <button key={p.value} type="button" className={`chip${playStyle === p.value ? ' active' : ''}`} aria-pressed={playStyle === p.value} onClick={() => setPlayStyle(p.value)}>{p.label}</button>)}
              </div>
            </div>

            <div className="field full"><span>活動程度</span>
              <div className="chip-row">
                <button type="button" className={`chip${level === LEVEL_OPEN ? ' active' : ''}`} aria-pressed={level === LEVEL_OPEN} onClick={() => setLevel(LEVEL_OPEN)}>不限</button>
                {LEVELS.map((l) => <button key={l.value} type="button" className={`chip${level === l.value ? ' active' : ''}`} aria-pressed={level === l.value} onClick={() => setLevel(l.value)}>{l.label}</button>)}
              </div>
            </div>

            <div className="field full"><span>性別限制</span>
              <div className="chip-row">
                <button type="button" className={`chip dark${gender === GENDER_OPEN ? ' active' : ''}`} aria-pressed={gender === GENDER_OPEN} onClick={() => setGender(GENDER_OPEN)}>不限</button>
                {GENDERS.map((g) => <button key={g.value} type="button" className={`chip dark${gender === g.value ? ' active' : ''}`} aria-pressed={gender === g.value} onClick={() => setGender(g.value)}>{g.label}</button>)}
              </div>
            </div>

            <label className="field full">
              <span>活動介紹 * <span className="field-hint">{description.length}/{DESCRIPTION_MAX}</span></span>
              <textarea id="w-description" rows="3" maxLength={DESCRIPTION_MAX} value={description} onChange={(e) => setDescription(e.target.value)} placeholder="介紹活動內容、流程等…" aria-invalid={!!errors.description} aria-describedby={errors.description ? 'w-desc-err' : undefined} />
              {errors.description && <span className="field-error" id="w-desc-err">{errors.description}</span>}
            </label>
          </div>
        </section>
      )}

      {step === 2 && (
        <section className="wizard-step">
          <h2>場地與時間</h2>
          <p className="step-sub">選擇場地、日期時段與球場條件</p>
          <div className="mock-data-notice">
            <Icon id="i-info" size={15} />
            <span>以下場館、評分與費用為原型示範資料，尚未串接真實場館 API；建立活動只會寫入這個瀏覽器的本地資料，不會真的預約場地。</span>
          </div>
          <div className="venue-grid">
            {VENUES.map((v, i) => (
              <label key={v.name} className="card venue-card">
                <input type="radio" name="venue" checked={venue === i} onChange={() => setVenue(i)} />
                <div className="venue-top">
                  <span className="venue-icon"><Icon id="i-home" size={20} /></span>
                  <div><b>{v.name}</b><span className="rating"><Icon id="i-star" size={12} />{v.rating}</span></div>
                </div>
                <div className="venue-loc"><Icon id="i-pin" size={13} />{v.address}</div>
                <div className="venue-price">租金 <b>{v.rentalPrice}</b> / 小時</div>
                <div className="tag-row">{v.tags.map((t) => <span key={t} className="tag type">{t}</span>)}</div>
              </label>
            ))}
          </div>

          <h3 className="field-label">活動日期</h3>
          <div className="date-grid">
            {DATE_OPTIONS.map((d, i) => (
              <button key={d.date} className={`date-card${dateIdx === i ? ' active' : ''}`} aria-pressed={dateIdx === i} onClick={() => setDateIdx(i)}>
                <span>{d.dow}</span><b>{d.md}</b>
              </button>
            ))}
          </div>

          <h3 className="field-label">時間段</h3>
          <div className="slot-list">
            {SLOTS.map((s, i) => (
              <label key={s.label} className="slot-row">
                <input type="radio" name="slot" checked={slot === i} onChange={() => setSlot(i)} />
                <div><b>{s.label}</b><span>{s.rentalPrice}</span></div>
                {s.badge && <span className={`slot-badge ${s.tone}`}>{s.badge}</span>}
              </label>
            ))}
          </div>

          <h3 className="field-label">網高</h3>
          <div className="chip-row">
            <button type="button" className={`chip${netHeight === NET_HEIGHT_UNSPECIFIED ? ' active' : ''}`} aria-pressed={netHeight === NET_HEIGHT_UNSPECIFIED} onClick={() => setNetHeight(NET_HEIGHT_UNSPECIFIED)}>未指定</button>
            {NET_HEIGHTS.map((n) => <button key={n.value} type="button" className={`chip${netHeight === n.value ? ' active' : ''}`} aria-pressed={netHeight === n.value} onClick={() => setNetHeight(n.value)}>{n.label}</button>)}
          </div>

          <h3 className="field-label">場地材質</h3>
          <div className="chip-row">
            <button type="button" className={`chip${courtSurface === COURT_SURFACE_UNSPECIFIED ? ' active' : ''}`} aria-pressed={courtSurface === COURT_SURFACE_UNSPECIFIED} onClick={() => setCourtSurface(COURT_SURFACE_UNSPECIFIED)}>未指定</button>
            {COURT_SURFACES.map((s) => <button key={s.value} type="button" className={`chip${courtSurface === s.value ? ' active' : ''}`} aria-pressed={courtSurface === s.value} onClick={() => setCourtSurface(s.value)}>{s.label}</button>)}
          </div>
        </section>
      )}

      {step === 3 && (
        <section className="wizard-step">
          <h2>排球規則與需求</h2>
          <p className="step-sub">球制、規則與人數需求</p>

          <h3 className="field-label">球制</h3>
          <div className="chip-row">
            {VOLLEYBALL_FORMATS.map((f) => <button key={f.value} type="button" className={`chip${format === f.value ? ' active' : ''}`} aria-pressed={format === f.value} onClick={() => setFormat(f.value)}>{f.label}</button>)}
          </div>

          <div className="chip-row wizard-toggle-row">
            <button type="button" className={`chip toggle-chip${rotationRequired ? ' active' : ''}`} aria-pressed={rotationRequired} onClick={() => setRotationRequired((v) => !v)}>
              {rotationRequired && <Icon id="i-check" size={13} />}需要輪轉
            </button>
            <button type="button" className={`chip toggle-chip${liberoAllowed ? ' active' : ''}`} aria-pressed={liberoAllowed} onClick={() => setLiberoAllowed((v) => !v)}>
              {liberoAllowed && <Icon id="i-check" size={13} />}允許自由球員
            </button>
            <button type="button" className={`chip toggle-chip${soloJoinAllowed ? ' active' : ''}`} aria-pressed={soloJoinAllowed} onClick={() => setSoloJoinAllowed((v) => !v)}>
              {soloJoinAllowed && <Icon id="i-check" size={13} />}可個人報名
            </button>
          </div>

          <div className="form-grid">
            <label className="field">
              <span>人數上限 *</span>
              <input id="w-capacity" type="number" min="1" max={MAX_CAPACITY} value={capacity} onChange={(e) => setCapacity(e.target.value)} placeholder="例如：20" aria-invalid={!!errors.capacity} aria-describedby={errors.capacity ? 'w-cap-err' : undefined} />
              {errors.capacity && <span className="field-error" id="w-cap-err">{errors.capacity}</span>}
            </label>

            <div className="field full">
              <span>位置需求（選填，不確定可留空）</span>
              <div className="position-add-row">
                <select value={newPosition} onChange={(e) => setNewPosition(e.target.value)}>
                  {POSITIONS.map((p) => <option key={p.value} value={p.value}>{p.label}</option>)}
                </select>
                <input id="w-positionsNeeded" type="number" min="0" placeholder="缺幾人" value={newPositionCount} onChange={(e) => setNewPositionCount(e.target.value)} />
                <button type="button" className="btn-secondary sm" onClick={handleAddPosition}>新增</button>
              </div>
              {positionsNeeded.length > 0 && (
                <ul className="position-need-list">
                  {positionsNeeded.map((p) => (
                    <li key={p.position}>
                      <span>{getPositionLabel(p.position)}　缺 {p.count} 人</span>
                      <button type="button" className="icon-btn sm ghost" aria-label={`移除${getPositionLabel(p.position)}需求`} onClick={() => removePosition(p.position)}>
                        <Icon id="i-close" size={12} />
                      </button>
                    </li>
                  ))}
                </ul>
              )}
              {errors.positionsNeeded && <span className="field-error" id="w-positionsNeeded-err">{errors.positionsNeeded}</span>}
            </div>

            {!soloJoinAllowed && (
              <label className="field full">
                <span>報名方式說明 * <span className="field-hint">{skillNotes.length}/{SKILL_NOTES_MAX}</span></span>
                <textarea id="w-skillNotes" rows="2" maxLength={SKILL_NOTES_MAX} value={skillNotes} onChange={(e) => setSkillNotes(e.target.value)} placeholder="例如：僅接受完整隊伍報名，需 6 人以上" aria-invalid={!!errors.skillNotes} aria-describedby={errors.skillNotes ? 'w-skillNotes-err' : undefined} />
                {errors.skillNotes && <span className="field-error" id="w-skillNotes-err">{errors.skillNotes}</span>}
              </label>
            )}
            {soloJoinAllowed && (
              <label className="field full">
                <span>技能／參與說明（選填）<span className="field-hint">{skillNotes.length}/{SKILL_NOTES_MAX}</span></span>
                <textarea rows="2" maxLength={SKILL_NOTES_MAX} value={skillNotes} onChange={(e) => setSkillNotes(e.target.value)} placeholder="例如：需有基礎接發球經驗" />
              </label>
            )}

            <div className="field full"><span>提供設備（選填）</span>
              <div className="chip-row">
                {EQUIPMENT_OPTIONS.map((e) => (
                  <button key={e.value} type="button" className={`chip${equipmentProvided.includes(e.value) ? ' active' : ''}`} aria-pressed={equipmentProvided.includes(e.value)} onClick={() => toggleEquipment(e.value)}>{e.label}</button>
                ))}
              </div>
            </div>

            <label className="field full">
              <span>活動規則 * <span className="field-hint">{rules.length}/{RULES_MAX}</span></span>
              <textarea id="w-rules" rows="3" maxLength={RULES_MAX} value={rules} onChange={(e) => setRules(e.target.value)} placeholder="例如：請提前10分鐘到場、自備運動服裝、取消政策…" aria-invalid={!!errors.rules} aria-describedby={errors.rules ? 'w-rules-err' : undefined} />
              {errors.rules && <span className="field-error" id="w-rules-err">{errors.rules}</span>}
            </label>
          </div>
        </section>
      )}

      {step === 4 && (
        <section className="wizard-step">
          <h2>費用與預覽</h2>
          <p className="step-sub">設定費用、確認資訊後發布</p>

          <div className="form-grid">
            <label className="field">
              <span>每人費用 (NT$) *</span>
              <input id="w-price" type="number" min="0" value={price} onChange={(e) => setPrice(e.target.value)} placeholder="0 表示免費" aria-invalid={!!errors.price} aria-describedby={errors.price ? 'w-price-err' : undefined} />
              {errors.price && <span className="field-error" id="w-price-err">{errors.price}</span>}
            </label>
            <label className="field">
              <span>聯絡方式 *</span>
              <input id="w-contact" value={contact} onChange={(e) => setContact(e.target.value)} placeholder="0912-345-678" inputMode="tel" aria-invalid={!!errors.contact} aria-describedby={errors.contact ? 'w-contact-err' : undefined} />
              {errors.contact && <span className="field-error" id="w-contact-err">{errors.contact}</span>}
            </label>

            <div className="field full"><span>其他保障（選填，如實填寫）</span>
              <div className="chip-row wizard-toggle-row">
                <button type="button" className={`chip toggle-chip${hasInsurance ? ' active' : ''}`} aria-pressed={hasInsurance} onClick={() => setHasInsurance((v) => !v)}>
                  {hasInsurance && <Icon id="i-check" size={13} />}含保險保障
                </button>
                <button type="button" className={`chip toggle-chip${hasCoach ? ' active' : ''}`} aria-pressed={hasCoach} onClick={() => setHasCoach((v) => !v)}>
                  {hasCoach && <Icon id="i-check" size={13} />}現場有教練指導
                </button>
              </div>
            </div>
          </div>

          <div className="notice">
            <Icon id="i-info" size={18} />
            <div><b>付款方式</b><span>{priceNum === 0 ? '免費活動，無需付款' : '現場付款——這個原型不會串接真實金流，也不會產生任何線上付款紀錄。'}</span></div>
          </div>

          <h3 className="field-label">發布前預覽</h3>
          <ul className="kv-list wizard-preview">
            <li><span>活動標題</span><b>{previewEvent.title || '（未填寫）'}</b></li>
            <li><span>日期時間</span><b>{previewEvent.date}・{previewEvent.startTime}–{previewEvent.endTime}</b></li>
            <li><span>地點</span><b>{previewEvent.venueName}</b></li>
            <li><span>程度／性別</span><b>{level === LEVEL_OPEN ? '不限' : LEVELS.find((l) => l.value === level)?.label}／{gender === GENDER_OPEN ? '不限' : GENDERS.find((g) => g.value === gender)?.label}</b></li>
            <li><span>人數上限</span><b>{previewEvent.capacity || 0} 人</b></li>
            <li><span>費用</span><b>{formatPrice(previewEvent.price)}</b></li>
          </ul>

          <div className={`info-quality-status ${infoQuality.state}`}>
            <div className="info-quality-status-row">
              <Icon id="i-info" size={16} />
              <span>{infoQuality.state === 'complete' ? '資訊完整，可以發布' : infoQuality.label}</span>
            </div>
            {infoQuality.missingFields.length > 0 && (
              <div className="info-quality-detail">
                <ul>
                  {infoQuality.missingFields.map((key) => <li key={key}>{INFO_FIELD_LABELS[key]}</li>)}
                </ul>
                <p className="field-hint">
                  {infoQuality.state === 'needsInfo'
                    ? '以上是報名者決定是否參加時的重要資訊，請先補齊才能發布。'
                    : '以上細節尚未填寫，不影響發布，但補齊能讓報名者更放心。'}
                </p>
              </div>
            )}
          </div>
        </section>
      )}

      <div className="sticky-cta wizard-cta">
        {step > 1 && <button className="btn-secondary" onClick={handlePrev}>上一步</button>}
        <button className="btn-primary" onClick={handleNext}>
          {step === 4 ? '發布活動' : '下一步'}
        </button>
      </div>
    </div>
  )
}

export default function Manage() {
  const [view, setView] = useState('dashboard')

  useEffect(() => {
    document.title = '活動管理｜Volleyball Hub'
  }, [])

  return (
    <>
      <Header title="活動管理" subtitle="管理你的活動" active="manage" />

      <main className="content">
        {view === 'dashboard'
          ? <Dashboard onNewEvent={() => setView('create')} />
          : <CreateWizard onBack={() => setView('dashboard')} />}
      </main>

      <SiteFooter />
      <BottomTabs active="manage" />
    </>
  )
}
