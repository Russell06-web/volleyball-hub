import { useState } from 'react'
import Header from '../components/Header'
import BottomTabs from '../components/BottomTabs'
import SiteFooter from '../components/SiteFooter'
import { Icon } from '../components/Icons'
import '../styles/bookings.css'
import '../styles/manage.css'

const MY_EVENTS = [
  { title: '65Player 週五夜晚男排', when: '2025-12-26・19:00–22:00', level: '中階', people: '18 / 18 人', price: 'NT$260' },
  { title: '週末混打友誼賽', when: '2025-12-27・14:00–17:00', level: '初階', people: '12 / 16 人', price: 'NT$200' },
  { title: '高階對抗賽', when: '2025-12-28・20:00–22:00', level: '高階', people: '10 / 12 人', price: 'NT$300' },
]

const RECORDS = [
  { name: '陳柏宇', event: '65Player 週五夜晚男排', status: '已確認', tone: 'ok', date: '2025-12-20' },
  { name: '林曉雯', event: '週末混打友誼賽', status: '已確認', tone: 'ok', date: '2025-12-19' },
  { name: '黃冠廷', event: '高階對抗賽', status: '待確認', tone: 'warn', date: '2025-12-18' },
  { name: '王詩涵', event: '65Player 週五夜晚男排', status: '已確認', tone: 'ok', date: '2025-12-17' },
  { name: '李承翰', event: '週末混打友誼賽', status: '已取消', tone: 'done', date: '2025-12-15' },
]

const VENUES = [
  { name: '台北市立體育館', rating: '4.5 · 4 個場地', loc: '台北市松山區南京東路四段10號', price: 'NT$1,200', tags: ['更衣室', '淋浴間', '停車場', '飲水機'] },
  { name: '新北運動中心', rating: '4.7 · 6 個場地', loc: '新北市板橋區縣民大道二段7號', price: 'NT$1,500', tags: ['更衣室', '淋浴間', '停車場', '置物櫃'] },
  { name: '中正運動中心', rating: '4.1 · 2 個場地', loc: '台北市中正區信義路一段1號', price: 'NT$800', tags: ['更衣室', '飲水機'] },
  { name: '信義運動中心', rating: '4.8 · 5 個場地', loc: '台北市信義區松勤街100號', price: 'NT$1,800', tags: ['更衣室', '淋浴間', '停車場', 'WiFi'] },
]

const DATES = [{ dow: '週一', md: '12/15' }, { dow: '週二', md: '12/16' }, { dow: '週三', md: '12/17' }, { dow: '週六', md: '12/20' }, { dow: '週一', md: '12/22' }]
const SLOTS = [
  { label: '早上 06:00–09:00', price: 'NT$960 / 小時', badge: '-20%', tone: 'down' },
  { label: '上午 09:00–12:00', price: 'NT$1,200 / 小時' },
  { label: '下午 12:00–15:00', price: 'NT$1,200 / 小時' },
  { label: '晚上 18:00–21:00', price: 'NT$1,560 / 小時', badge: '+30%', tone: 'up' },
  { label: '夜間 21:00–24:00', price: 'NT$1,440 / 小時', badge: '+20%', tone: 'up' },
]

function Dashboard({ onNewEvent }) {
  const [subTab, setSubTab] = useState('events')

  return (
    <div>
      <div className="stats-strip cols-3">
        <div className="stat-tile"><Icon id="i-calendar" size={17} /><b>3</b><span>活動總數</span></div>
        <div className="stat-tile"><Icon id="i-users" size={17} /><b>50</b><span>報名總數</span></div>
        <div className="stat-tile"><Icon id="i-trend" size={17} /><b>85%</b><span>參與率</span></div>
      </div>

      <button className="btn-dark full" onClick={onNewEvent}>＋新增活動</button>

      <div className="chip-row tab-filter">
        <button className={`chip${subTab === 'events' ? ' active' : ''}`} onClick={() => setSubTab('events')}>活動管理</button>
        <button className={`chip${subTab === 'records' ? ' active' : ''}`} onClick={() => setSubTab('records')}>報名紀錄</button>
      </div>

      {subTab === 'events' ? (
        <div className="booking-grid">
          {MY_EVENTS.map((ev) => (
            <article key={ev.title} className="card manage-event-card">
              <div className="card-top"><h3>{ev.title}</h3><button className="icon-btn ghost sm danger" aria-label="刪除活動"><Icon id="i-trash" size={15} /></button></div>
              <ul className="meta"><li><Icon id="i-calendar" size={14} />{ev.when}</li></ul>
              <div className="tag-row">
                <span className="tag level">{ev.level}</span>
                <span className="tag">{ev.people}</span>
                <span className="badge featured">{ev.price}</span>
              </div>
            </article>
          ))}
        </div>
      ) : (
        <div className="record-list">
          {RECORDS.map((r) => (
            <div key={r.name + r.date} className="record-row">
              <div><b>{r.name}</b><span>{r.event}</span></div>
              <span className={`badge ${r.tone}`}>{r.status}</span>
              <span className="record-date">{r.date}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

function CreateWizard({ onBack }) {
  const [step, setStep] = useState(1)
  const [venue, setVenue] = useState(0)
  const [date, setDate] = useState(0)
  const [slot, setSlot] = useState(1)

  const pct = Math.round((step / 3) * 100)

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
          <div className="chip-row" style={{ marginBottom: 16 }}>
            <button className="chip dark active">全部</button>
            <button className="chip">台北市</button>
            <button className="chip">新北市</button>
            <button className="chip">高評分</button>
          </div>
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
            <div><b>{VENUES[venue].name}</b><span>{VENUES[venue].price} / 小時</span></div>
            <button className="link-btn" onClick={() => setStep(1)}>更換</button>
          </div>

          <h3 className="field-label">活動日期</h3>
          <div className="date-grid">
            {DATES.map((d, i) => (
              <button key={d.md} className={`date-card${date === i ? ' active' : ''}`} onClick={() => setDate(i)}>
                <span>{d.dow}</span><b>{d.md}</b>
              </button>
            ))}
          </div>

          <h3 className="field-label">時間段</h3>
          <div className="slot-list">
            {SLOTS.map((s, i) => (
              <label key={s.label} className="slot-row">
                <input type="radio" name="slot" checked={slot === i} onChange={() => setSlot(i)} />
                <div><b>{s.label}</b><span>{s.price}</span></div>
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
            <label className="field full"><span>活動標題 *</span><input type="text" placeholder="例如：週末排球友誼賽" /></label>

            <div className="field full"><span>活動類型</span>
              <div className="chip-row"><button className="chip active">排球</button><button className="chip">沙灘排球</button><button className="chip">室內排球</button></div>
            </div>

            <div className="field full"><span>活動程度 *</span>
              <div className="chip-row"><button className="chip active">初階</button><button className="chip">中階</button><button className="chip">高階</button></div>
            </div>

            <div className="field full"><span>性別限制</span>
              <div className="chip-row"><button className="chip dark active">不限</button><button className="chip">男生</button><button className="chip">女生</button><button className="chip">混合</button></div>
            </div>

            <label className="field"><span>人數上限 *</span><input type="number" placeholder="例如：20" /></label>
            <label className="field"><span>每人費用 (NT$) *</span><input type="number" placeholder="例如：250" /></label>

            <label className="field full"><span>活動介紹</span><textarea rows="3" placeholder="介紹活動內容、流程等…" /></label>
            <label className="field full"><span>活動規則</span><textarea rows="3" placeholder="例如：請提前10分鐘到場、自備運動服裝…" /></label>
          </div>

          <div className="notice">
            <Icon id="i-info" size={18} />
            <div><b>提示</b><span>填寫詳細的活動資訊可以提高報名率。建議上傳活動照片並清楚說明活動內容。</span></div>
          </div>
        </section>
      )}

      <div className="sticky-cta wizard-cta">
        {step > 1 && <button className="btn-secondary" onClick={() => setStep(step - 1)}>上一步</button>}
        <button className="btn-primary" onClick={() => (step < 3 ? setStep(step + 1) : onBack())}>
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
