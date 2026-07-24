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
import { futureDateWithLabel } from '../utils/date'
import { formatPrice } from '../utils/format'
import { CURRENT_USER_ID, EVENT_STATUS, GENDER_OPEN, GENDERS, LEVEL_OPEN, LEVELS, EVENT_TYPES } from '../constants/taxonomy'
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
const DATE_OPTIONS = [2, 3, 4, 7, 9].map(futureDateWithLabel)
const MAX_CAPACITY = 200
const DESCRIPTION_MAX = 500
const RULES_MAX = 300

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
            <div key={r.key} className="record-row">
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

function CreateWizard({ onBack }) {
  const { addEvent } = useEvents()
  const { profile } = useProfile()
  const { showToast } = useToast()

  const [step, setStep] = useState(1)
  const [venue, setVenue] = useState(0)
  const [dateIdx, setDateIdx] = useState(0)
  const [slot, setSlot] = useState(1)

  const [title, setTitle] = useState('')
  const [type, setType] = useState(EVENT_TYPES[0].value)
  const [level, setLevel] = useState(LEVEL_OPEN)
  const [gender, setGender] = useState(GENDER_OPEN)
  const [capacity, setCapacity] = useState('')
  const [price, setPrice] = useState('')
  const [description, setDescription] = useState('')
  const [rules, setRules] = useState('')
  const [contact, setContact] = useState('')
  const [errors, setErrors] = useState({})

  const pct = Math.round((step / 3) * 100)
  const capacityNum = Number(capacity)
  const priceNum = Number(price)
  const chosenVenue = VENUES[venue]
  const chosenSlot = SLOTS[slot]

  function validateStep3() {
    const errs = {}
    if (!title.trim()) errs.title = '請輸入活動標題'
    if (!description.trim()) errs.description = '請輸入活動介紹'
    if (!rules.trim()) errs.rules = '請輸入活動規則'
    if (!Number.isInteger(capacityNum) || capacityNum <= 0) errs.capacity = '人數上限請輸入正整數'
    else if (capacityNum > MAX_CAPACITY) errs.capacity = `人數上限不可超過 ${MAX_CAPACITY} 人`
    if (price === '' || Number.isNaN(priceNum) || priceNum < 0) errs.price = '每人費用請輸入 0 或正數'
    if (!contact.trim()) errs.contact = '請輸入聯絡方式'
    else if (!/^09\d{2}-?\d{3}-?\d{3}$/.test(contact.replace(/\s/g, ''))) errs.contact = '請輸入有效的台灣手機號碼，例如 0912-345-678'
    return errs
  }

  function handleNext() {
    if (step === 3) {
      const errs = validateStep3()
      setErrors(errs)
      if (Object.keys(errs).length > 0) return
      addEvent({
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
        capacity: capacityNum,
        price: priceNum,
        paymentMethod: priceNum === 0 ? '無需付款' : '現場付款',
        organizerName: profile.name,
        organizerContact: contact.trim(),
        ownerId: CURRENT_USER_ID,
      })
      showToast('活動已發布')
      onBack()
      return
    }
    setStep(step + 1)
  }

  return (
    <div>
      <button className="text-back" onClick={onBack}><Icon id="i-back" size={16} />返回活動管理</button>

      <div className="step-progress">
        <div className="step-progress-head"><span>步驟 {step} / 3</span><span>{pct}%</span></div>
        <div className="step-progress-bar"><div className="step-progress-fill" style={{ width: `${pct}%` }} /></div>
      </div>

      {step === 1 && (
        <section className="wizard-step">
          <h2>選擇場地</h2>
          <p className="step-sub">請選擇適合的球館場地</p>
          <div className="mock-data-notice">
            <Icon id="i-info" size={15} />
            <span>以下場館、評分與費用為原型示範資料，尚未串接真實場館 API。</span>
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
        </section>
      )}

      {step === 2 && (
        <section className="wizard-step">
          <h2>設定活動時間</h2>
          <p className="step-sub">選擇活動日期和時段</p>
          <div className="venue-summary">
            <span className="venue-icon"><Icon id="i-home" size={18} /></span>
            <div><b>{chosenVenue.name}</b><span>{chosenVenue.rentalPrice} / 小時（場地租金，非參加者費用）</span></div>
            <button className="link-btn" onClick={() => setStep(1)}>更換</button>
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
        </section>
      )}

      {step === 3 && (
        <section className="wizard-step">
          <h2>填寫活動詳情</h2>
          <p className="step-sub">完善活動資訊以吸引參與者</p>

          <div className="form-grid">
            <label className="field full">
              <span>活動標題 *</span>
              <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="例如：週末排球友誼賽" aria-invalid={!!errors.title} aria-describedby={errors.title ? 'w-title-err' : undefined} />
              {errors.title && <span className="field-error" id="w-title-err">{errors.title}</span>}
            </label>

            <div className="field full"><span>活動類型</span>
              <div className="chip-row">
                {EVENT_TYPES.map((t) => <button key={t.value} type="button" className={`chip${type === t.value ? ' active' : ''}`} aria-pressed={type === t.value} onClick={() => setType(t.value)}>{t.label}</button>)}
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

            <label className="field">
              <span>人數上限 *</span>
              <input type="number" min="1" max={MAX_CAPACITY} value={capacity} onChange={(e) => setCapacity(e.target.value)} placeholder="例如：20" aria-invalid={!!errors.capacity} aria-describedby={errors.capacity ? 'w-cap-err' : undefined} />
              {errors.capacity && <span className="field-error" id="w-cap-err">{errors.capacity}</span>}
            </label>
            <label className="field">
              <span>每人費用 (NT$) *</span>
              <input type="number" min="0" value={price} onChange={(e) => setPrice(e.target.value)} placeholder="0 表示免費" aria-invalid={!!errors.price} aria-describedby={errors.price ? 'w-price-err' : undefined} />
              {errors.price && <span className="field-error" id="w-price-err">{errors.price}</span>}
            </label>

            <label className="field full">
              <span>聯絡方式 *</span>
              <input value={contact} onChange={(e) => setContact(e.target.value)} placeholder="0912-345-678" inputMode="tel" aria-invalid={!!errors.contact} aria-describedby={errors.contact ? 'w-contact-err' : undefined} />
              {errors.contact && <span className="field-error" id="w-contact-err">{errors.contact}</span>}
            </label>

            <label className="field full">
              <span>活動介紹 * <span className="field-hint">{description.length}/{DESCRIPTION_MAX}</span></span>
              <textarea rows="3" maxLength={DESCRIPTION_MAX} value={description} onChange={(e) => setDescription(e.target.value)} placeholder="介紹活動內容、流程等…" aria-invalid={!!errors.description} aria-describedby={errors.description ? 'w-desc-err' : undefined} />
              {errors.description && <span className="field-error" id="w-desc-err">{errors.description}</span>}
            </label>
            <label className="field full">
              <span>活動規則 * <span className="field-hint">{rules.length}/{RULES_MAX}</span></span>
              <textarea rows="3" maxLength={RULES_MAX} value={rules} onChange={(e) => setRules(e.target.value)} placeholder="例如：請提前10分鐘到場、自備運動服裝…" aria-invalid={!!errors.rules} aria-describedby={errors.rules ? 'w-rules-err' : undefined} />
              {errors.rules && <span className="field-error" id="w-rules-err">{errors.rules}</span>}
            </label>
          </div>

          <div className="notice">
            <Icon id="i-info" size={18} />
            <div><b>提示</b><span>填寫詳細的活動資訊可以提高報名率。建議清楚說明活動內容與程度要求。</span></div>
          </div>
        </section>
      )}

      <div className="sticky-cta wizard-cta">
        {step > 1 && <button className="btn-secondary" onClick={() => setStep(step - 1)}>上一步</button>}
        <button className="btn-primary" onClick={handleNext}>
          {step === 3 ? '發布活動' : '下一步'}
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
