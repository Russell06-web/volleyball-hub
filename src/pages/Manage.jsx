import { useMemo, useState } from 'react'
import Header from '../components/Header'
import BottomTabs from '../components/BottomTabs'
import SiteFooter from '../components/SiteFooter'
import { Icon } from '../components/Icons'
import { useEvents } from '../context/EventsContext'
import { useBookings } from '../context/BookingsContext'
import { useProfile } from '../context/ProfileContext'
import { futureDateWithLabel } from '../utils/date'
import { formatPrice } from '../utils/format'
import '../styles/bookings.css'
import '../styles/manage.css'

const STATUS_META = {
  pending: { label: '待確認', tone: 'warn' },
  confirmed: { label: '已確認', tone: 'ok' },
  waitlist: { label: '候補中', tone: 'wait' },
  completed: { label: '已完成', tone: 'done' },
  cancelled: { label: '已取消', tone: 'done' },
}

const VENUES = [
  { name: '台北市立體育館', city: '台北', rating: '4.5 · 4 個場地', loc: '台北市松山區南京東路四段10號', price: 'NT$1,200', tags: ['更衣室', '淋浴間', '停車場', '飲水機'] },
  { name: '新北運動中心', city: '新北', rating: '4.7 · 6 個場地', loc: '新北市板橋區縣民大道二段7號', price: 'NT$1,500', tags: ['更衣室', '淋浴間', '停車場', '置物櫃'] },
  { name: '中正運動中心', city: '台北', rating: '4.1 · 2 個場地', loc: '台北市中正區信義路一段1號', price: 'NT$800', tags: ['更衣室', '飲水機'] },
  { name: '信義運動中心', city: '台北', rating: '4.8 · 5 個場地', loc: '台北市信義區松勤街100號', price: 'NT$1,800', tags: ['更衣室', '淋浴間', '停車場', 'WiFi'] },
]

// Real upcoming dates, generated the same way src/data/events.js does —
// no more hardcoded "12/15" that's already in the past by the time
// someone looks at this.
const DATE_OPTIONS = [2, 3, 4, 7, 9].map(futureDateWithLabel)

const SLOTS = [
  { label: '早上 06:00–09:00', time: '06:00', endTime: '09:00', rentalPrice: 'NT$960 / 小時', badge: '-20%', tone: 'down' },
  { label: '上午 09:00–12:00', time: '09:00', endTime: '12:00', rentalPrice: 'NT$1,200 / 小時' },
  { label: '下午 12:00–15:00', time: '12:00', endTime: '15:00', rentalPrice: 'NT$1,200 / 小時' },
  { label: '晚上 18:00–21:00', time: '18:00', endTime: '21:00', rentalPrice: 'NT$1,560 / 小時', badge: '+30%', tone: 'up' },
  { label: '夜間 21:00–23:59', time: '21:00', endTime: '23:59', rentalPrice: 'NT$1,440 / 小時', badge: '+20%', tone: 'up' },
]

const TYPES = ['室內排球', '沙灘排球', '草地排球', '親子・體驗']
const LEVELS = ['初階', '中階', '高階']
const GENDERS = ['不限', '男生', '女生', '混合']

function Dashboard({ onNewEvent }) {
  const { events, removeEvent } = useEvents()
  const { bookings } = useBookings()
  const [subTab, setSubTab] = useState('events')

  const myEvents = useMemo(() => events.filter((e) => e.ownedByMe), [events])
  const myEventIds = useMemo(() => myEvents.map((e) => e.id), [myEvents])

  const totalRegistrations = myEvents.reduce((sum, e) => sum + e.registered, 0)
  // A real, computed fill rate across the events this organiser actually
  // runs — not a fixed "85%" with nothing behind it.
  const avgFillRate = myEvents.length
    ? Math.round((myEvents.reduce((sum, e) => sum + e.registered / e.capacity, 0) / myEvents.length) * 100)
    : 0

  const records = useMemo(
    () => bookings
      .filter((b) => b.eventId && myEventIds.includes(b.eventId))
      .map((b) => ({
        key: b.id,
        name: b.registrant?.name || '訪客',
        event: b.title,
        status: b.status,
        date: new Date(b.createdAt || Date.now()).toISOString().slice(0, 10),
      })),
    [bookings, myEventIds],
  )

  function handleDelete(id, title) {
    if (window.confirm(`確定要刪除「${title}」這場活動嗎？此動作無法復原，探索頁也會立即看不到這場活動。`)) {
      removeEvent(id)
    }
  }

  return (
    <div>
      <div className="stats-strip cols-3">
        <div className="stat-tile"><Icon id="i-calendar" size={17} /><b>{myEvents.length}</b><span>活動總數</span></div>
        <div className="stat-tile"><Icon id="i-users" size={17} /><b>{totalRegistrations}</b><span>報名總數</span></div>
        <div className="stat-tile"><Icon id="i-trend" size={17} /><b>{avgFillRate}%</b><span>平均報名率</span></div>
      </div>

      <button className="btn-dark full" onClick={onNewEvent}>＋新增活動</button>

      <div className="chip-row tab-filter">
        <button className={`chip${subTab === 'events' ? ' active' : ''}`} onClick={() => setSubTab('events')}>活動管理</button>
        <button className={`chip${subTab === 'records' ? ' active' : ''}`} onClick={() => setSubTab('records')}>報名紀錄</button>
      </div>

      {subTab === 'events' ? (
        myEvents.length === 0 ? (
          <p className="empty-state">你還沒有主辦任何活動，點上面的「＋新增活動」開始建立第一場。</p>
        ) : (
          <div className="booking-grid">
            {myEvents.map((ev) => (
              <article key={ev.id} className="card manage-event-card">
                <div className="card-top">
                  <h3>{ev.title}</h3>
                  <button className="icon-btn ghost sm danger" aria-label="刪除活動" onClick={() => handleDelete(ev.id, ev.title)}>
                    <Icon id="i-trash" size={15} />
                  </button>
                </div>
                <ul className="meta"><li><Icon id="i-calendar" size={14} />{ev.date}・{ev.time}{ev.endTime ? `–${ev.endTime}` : ''}</li></ul>
                <div className="tag-row">
                  <span className="tag level">{ev.level}</span>
                  <span className="tag">{ev.registered} / {ev.capacity} 人</span>
                  <span className="badge featured">{formatPrice(ev.price, ev.free)}</span>
                </div>
              </article>
            ))}
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
    </div>
  )
}

function CreateWizard({ onBack }) {
  const { addEvent } = useEvents()
  const { profile } = useProfile()

  const [step, setStep] = useState(1)
  const [venue, setVenue] = useState(0)
  const [dateIdx, setDateIdx] = useState(0)
  const [slot, setSlot] = useState(1)

  const [title, setTitle] = useState('')
  const [type, setType] = useState(TYPES[0])
  const [level, setLevel] = useState(LEVELS[0])
  const [gender, setGender] = useState(GENDERS[0])
  const [capacity, setCapacity] = useState('')
  const [price, setPrice] = useState('')
  const [description, setDescription] = useState('')
  const [rules, setRules] = useState('')

  const pct = Math.round((step / 3) * 100)
  const capacityNum = Number(capacity)
  const priceNum = Number(price)
  const canPublish = title.trim().length > 0 && capacityNum > 0 && price !== '' && priceNum >= 0

  function handleNext() {
    if (step < 3) { setStep(step + 1); return }
    if (!canPublish) return

    const chosenVenue = VENUES[venue]
    const chosenDate = DATE_OPTIONS[dateIdx]
    const chosenSlot = SLOTS[slot]

    addEvent({
      title: title.trim(),
      type,
      level,
      gender,
      city: chosenVenue.city,
      loc: chosenVenue.name,
      date: chosenDate.date,
      time: chosenSlot.time,
      endTime: chosenSlot.endTime,
      capacity: capacityNum,
      price: priceNum,
      free: priceNum === 0,
      description: description.trim() || undefined,
      org: profile.name,
      phone: '',
      badgeLabel: '',
      tone: '',
    })

    onBack()
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
          <div className="venue-grid">
            {VENUES.map((v, i) => (
              <label key={v.name} className="card venue-card">
                <input type="radio" name="venue" checked={venue === i} onChange={() => setVenue(i)} />
                <div className="venue-top">
                  <span className="venue-icon"><Icon id="i-home" size={20} /></span>
                  <div><b>{v.name}</b><span className="rating"><Icon id="i-star" size={12} />{v.rating}</span></div>
                </div>
                <div className="venue-loc"><Icon id="i-pin" size={13} />{v.loc}</div>
                <div className="venue-price">租金 <b>{v.price}</b> / 小時</div>
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
            <div><b>{VENUES[venue].name}</b><span>{VENUES[venue].price} / 小時（場地租金，非參加者費用）</span></div>
            <button className="link-btn" onClick={() => setStep(1)}>更換</button>
          </div>

          <h3 className="field-label">活動日期</h3>
          <div className="date-grid">
            {DATE_OPTIONS.map((d, i) => (
              <button key={d.date} className={`date-card${dateIdx === i ? ' active' : ''}`} onClick={() => setDateIdx(i)}>
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
            <label className="field full"><span>活動標題 *</span><input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="例如：週末排球友誼賽" /></label>

            <div className="field full"><span>活動類型</span>
              <div className="chip-row">
                {TYPES.map((t) => <button key={t} type="button" className={`chip${type === t ? ' active' : ''}`} onClick={() => setType(t)}>{t}</button>)}
              </div>
            </div>

            <div className="field full"><span>活動程度 *</span>
              <div className="chip-row">
                {LEVELS.map((l) => <button key={l} type="button" className={`chip${level === l ? ' active' : ''}`} onClick={() => setLevel(l)}>{l}</button>)}
              </div>
            </div>

            <div className="field full"><span>性別限制</span>
              <div className="chip-row">
                {GENDERS.map((g) => <button key={g} type="button" className={`chip dark${gender === g ? ' active' : ''}`} onClick={() => setGender(g)}>{g}</button>)}
              </div>
            </div>

            <label className="field"><span>人數上限 *</span><input type="number" min="1" value={capacity} onChange={(e) => setCapacity(e.target.value)} placeholder="例如：20" /></label>
            <label className="field"><span>每人費用 (NT$) *</span><input type="number" min="0" value={price} onChange={(e) => setPrice(e.target.value)} placeholder="0 表示免費" /></label>

            <label className="field full"><span>活動介紹</span><textarea rows="3" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="介紹活動內容、流程等…" /></label>
            <label className="field full"><span>活動規則</span><textarea rows="3" value={rules} onChange={(e) => setRules(e.target.value)} placeholder="例如：請提前10分鐘到場、自備運動服裝…" /></label>
          </div>

          <div className="notice">
            <Icon id="i-info" size={18} />
            <div><b>提示</b><span>填寫詳細的活動資訊可以提高報名率。建議清楚說明活動內容與程度要求。</span></div>
          </div>
        </section>
      )}

      <div className="sticky-cta wizard-cta">
        {step > 1 && <button className="btn-secondary" onClick={() => setStep(step - 1)}>上一步</button>}
        <button className="btn-primary" disabled={step === 3 && !canPublish} onClick={handleNext}>
          {step === 3 ? '發布活動' : '下一步'}
        </button>
      </div>
    </div>
  )
}

export default function Manage() {
  const [view, setView] = useState('dashboard')

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
