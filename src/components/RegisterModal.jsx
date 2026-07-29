import { useEffect, useRef, useState } from 'react'
import Sheet from './Sheet'
import { Icon } from './Icons'
import { validateRegistrant } from '../utils/bookingValidation'
import { getRemainingSlots, isWaitlistable } from '../utils/eventStatus'
import { formatPrice } from '../utils/format'
import { getPositionLabel } from '../constants/volleyballTaxonomy'
import { orderedPositionChoices } from '../utils/positionShortage'

const FIELD_ORDER = ['name', 'phone', 'teamName', 'teamSize', 'agree']
const DEFAULT_POSITION = 'universal'

export default function RegisterModal({ event, open, onClose, onConfirm }) {
  const [mode, setMode] = useState('individual')
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [teamName, setTeamName] = useState('')
  const [teamSize, setTeamSize] = useState(2)
  const [preferredPosition, setPreferredPosition] = useState(DEFAULT_POSITION)
  const [agree, setAgree] = useState(false)
  const [errors, setErrors] = useState({})

  const fieldRefs = useRef({})

  // Every time the sheet opens for whatever event, start from a clean
  // slate — closing without submitting (or opening a different event's
  // modal) must never leak the previous form's values or error state.
  useEffect(() => {
    if (!open) return
    setMode('individual')
    setName('')
    setPhone('')
    setTeamName('')
    setTeamSize(2)
    setPreferredPosition(DEFAULT_POSITION)
    setAgree(false)
    setErrors({})
  }, [open, event?.id])

  if (!event) return null

  const full = isWaitlistable(event)
  const remaining = getRemainingSlots(event)
  const positionChoices = orderedPositionChoices(event.positionsNeeded)

  function submit() {
    const result = validateRegistrant({ mode, name, phone, agree, teamName, teamSize }, event)
    if (!result.valid) {
      setErrors(result.errors)
      const firstInvalidKey = FIELD_ORDER.find((k) => result.errors[k])
      fieldRefs.current[firstInvalidKey]?.focus()
      return
    }
    setErrors({})
    onConfirm({
      mode,
      name: name.trim(),
      phone: phone.trim(),
      teamName: mode === 'team' ? teamName.trim() : undefined,
      teamSize: mode === 'team' ? Number(teamSize) : undefined,
      preferredPosition: mode === 'individual' ? preferredPosition : null,
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
          <div>
            <b>目前活動已額滿</b>
            <span>候補為目前瀏覽器中的原型示範狀態，不會自動遞補或發送通知。正式產品需由後端管理候補順序並通知參加者。</span>
          </div>
        </div>
      )}

      <div className="venue-summary">
        <div><b>{event.title}</b><span>{event.date}・{event.startTime}{event.endTime ? `–${event.endTime}` : ''}　{formatPrice(event.price)}</span></div>
      </div>

      <div className="field full register-mode-field">
        <span>報名方式</span>
        <div className="chip-row">
          <button type="button" className={`chip dark${mode === 'individual' ? ' active' : ''}`} aria-pressed={mode === 'individual'} onClick={() => setMode('individual')}>個人報名</button>
          <button type="button" className={`chip dark${mode === 'team' ? ' active' : ''}`} aria-pressed={mode === 'team'} onClick={() => setMode('team')}>揪團報名</button>
        </div>
      </div>

      {!full && mode === 'team' && (
        <p className="field-hint team-remaining-hint">目前尚有 {remaining} 個名額</p>
      )}

      <div className="field full register-position-field">
        <span>希望參加的位置</span>
        {mode === 'team' ? (
          <p className="field-hint">由隊伍自行安排，不需要在此指定個人位置。</p>
        ) : (
          <>
            <div className="chip-row">
              {positionChoices.map((p) => (
                <button
                  key={p.value}
                  type="button"
                  className={`chip${preferredPosition === p.value ? ' active' : ''}`}
                  aria-pressed={preferredPosition === p.value}
                  onClick={() => setPreferredPosition(p.value)}
                >
                  {getPositionLabel(p.value)}
                </button>
              ))}
            </div>
            <p className="field-hint">位置為偏好，實際安排由主辦方確認。</p>
          </>
        )}
      </div>

      <div className="form-grid register-form-grid">
        <label className="field">
          <span>姓名 *</span>
          <input
            ref={(el) => { fieldRefs.current.name = el }}
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="例如：王小明"
            aria-invalid={!!errors.name}
            aria-describedby={errors.name ? 'reg-name-error' : undefined}
          />
          {errors.name && <span className="field-error" id="reg-name-error">{errors.name}</span>}
        </label>
        <label className="field">
          <span>聯絡電話 *</span>
          <input
            ref={(el) => { fieldRefs.current.phone = el }}
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="0912-345-678"
            inputMode="tel"
            aria-invalid={!!errors.phone}
            aria-describedby={errors.phone ? 'reg-phone-error' : undefined}
          />
          {errors.phone && <span className="field-error" id="reg-phone-error">{errors.phone}</span>}
        </label>
        {mode === 'team' && (
          <>
            <label className="field">
              <span>隊伍名稱 *</span>
              <input
                ref={(el) => { fieldRefs.current.teamName = el }}
                value={teamName}
                onChange={(e) => setTeamName(e.target.value)}
                placeholder="例如：週三固定班"
                aria-invalid={!!errors.teamName}
                aria-describedby={errors.teamName ? 'reg-teamname-error' : undefined}
              />
              {errors.teamName && <span className="field-error" id="reg-teamname-error">{errors.teamName}</span>}
            </label>
            <label className="field">
              <span>隊伍人數 *</span>
              <input
                ref={(el) => { fieldRefs.current.teamSize = el }}
                type="number"
                min={2}
                step={1}
                value={teamSize}
                onChange={(e) => setTeamSize(e.target.value)}
                aria-invalid={!!errors.teamSize}
                aria-describedby={errors.teamSize ? 'reg-teamsize-error' : undefined}
              />
              {errors.teamSize && <span className="field-error" id="reg-teamsize-error">{errors.teamSize}</span>}
            </label>
          </>
        )}
      </div>

      <label className="agree-row">
        <input
          ref={(el) => { fieldRefs.current.agree = el }}
          type="checkbox"
          checked={agree}
          onChange={(e) => setAgree(e.target.checked)}
          aria-invalid={!!errors.agree}
          aria-describedby={errors.agree ? 'reg-agree-error' : undefined}
        />
        <span>我已閱讀並同意活動須知與{full ? '候補' : '報名'}規範</span>
      </label>
      {errors.agree && <span className="field-error agree-error" id="reg-agree-error">{errors.agree}</span>}

      <div className="filter-modal-actions">
        <button className="btn-secondary" onClick={onClose}>取消</button>
        <button className="btn-primary" onClick={submit}>{full ? '確認加入候補' : '確認報名'}</button>
      </div>
    </Sheet>
  )
}
