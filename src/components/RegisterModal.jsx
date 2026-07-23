import { useState } from 'react'
import Sheet from './Sheet'
import { Icon } from './Icons'

export default function RegisterModal({ event, open, onClose, onConfirm }) {
  const [mode, setMode] = useState('individual')
  const [name, setName] = useState('Russell')
  const [phone, setPhone] = useState('')
  const [teamName, setTeamName] = useState('')
  const [teamSize, setTeamSize] = useState(6)
  const [agree, setAgree] = useState(false)

  if (!event) return null

  const full = event.registered >= event.capacity
  const canSubmit = name.trim() && phone.trim() && agree && (mode === 'individual' || teamName.trim())

  function submit() {
    onConfirm({
      mode,
      name: name.trim(),
      phone: phone.trim(),
      teamName: mode === 'team' ? teamName.trim() : undefined,
      teamSize: mode === 'team' ? teamSize : undefined,
    })
  }

  return (
    <Sheet open={open} onClose={onClose} labelledBy="registerTitle" wide>
      <div className="filter-modal-head">
        <h2 id="registerTitle">{full ? '加入候補名單' : '報名活動'}</h2>
        <button className="icon-btn" onClick={onClose} aria-label="關閉"><Icon id="i-chevron" size={16} /></button>
      </div>

      {full && (
        <div className="warn-banner info">
          <Icon id="i-info" size={18} />
          <div><b>目前活動已額滿</b><span>加入候補名單後，若有名額釋出主辦單位將主動與你聯繫，不會自動遞補。</span></div>
        </div>
      )}

      <div className="venue-summary">
        <div><b>{event.title}</b><span>{event.date}・{event.time}{event.endTime ? `–${event.endTime}` : ''}　{event.free ? '免費' : `NT$${event.price}`}</span></div>
      </div>

      <div className="field full" style={{ marginTop: 18, marginBottom: 4 }}>
        <span>報名方式</span>
        <div className="chip-row">
          <button type="button" className={`chip dark${mode === 'individual' ? ' active' : ''}`} onClick={() => setMode('individual')}>個人報名</button>
          <button type="button" className={`chip dark${mode === 'team' ? ' active' : ''}`} onClick={() => setMode('team')}>揪團報名</button>
        </div>
      </div>

      <div className="form-grid" style={{ marginTop: 16 }}>
        <label className="field"><span>姓名 *</span><input value={name} onChange={(e) => setName(e.target.value)} /></label>
        <label className="field"><span>聯絡電話 *</span><input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="09xx-xxx-xxx" /></label>
        {mode === 'team' && (
          <>
            <label className="field"><span>隊伍名稱 *</span><input value={teamName} onChange={(e) => setTeamName(e.target.value)} placeholder="例如：週三固定班" /></label>
            <label className="field"><span>隊伍人數</span><input type="number" min={2} value={teamSize} onChange={(e) => setTeamSize(Number(e.target.value))} /></label>
          </>
        )}
      </div>

      <label className="agree-row">
        <input type="checkbox" checked={agree} onChange={(e) => setAgree(e.target.checked)} />
        <span>我已閱讀並同意活動須知與{full ? '候補' : '報名'}規範</span>
      </label>

      <div className="filter-modal-actions">
        <button className="btn-secondary" onClick={onClose}>取消</button>
        <button className="btn-primary" disabled={!canSubmit} onClick={submit}>{full ? '確認加入候補' : '確認報名'}</button>
      </div>
    </Sheet>
  )
}
