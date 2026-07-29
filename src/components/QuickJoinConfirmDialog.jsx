import { useEffect, useState } from 'react'
import Sheet from './Sheet'
import { Icon } from './Icons'
import { formatPrice } from '../utils/format'
import { getLevelLabel } from '../constants/taxonomy'
import { getNetHeightLabel, getPositionLabel } from '../constants/volleyballTaxonomy'
import { getRemainingSlots, isWaitlistable } from '../utils/eventStatus'

// Quick Join skips re-typing name/phone/position every time — it does
// NOT skip confirming. Nothing here bypasses registrationService: this
// dialog builds the exact same registrant shape RegisterModal does and
// hands it to the same onConfirm the caller already validates through
// planRegistration, so duplicate-booking/waitlist/capacity rules apply
// identically either way.
export default function QuickJoinConfirmDialog({ event, profile, open, onClose, onConfirm, onEditFull }) {
  const [agree, setAgree] = useState(false)

  useEffect(() => {
    if (open) setAgree(false)
  }, [open, event?.id])

  if (!event) return null

  const full = isWaitlistable(event)
  const remaining = getRemainingSlots(event)
  const priceLabel = formatPrice(event.price)

  function handleConfirm() {
    onConfirm({
      mode: 'individual',
      name: profile.name.trim(),
      phone: profile.phone.trim(),
      preferredPosition: profile.defaultPosition,
    })
  }

  return (
    <Sheet open={open} onClose={onClose} labelledBy="quickJoinTitle" describedBy="quickJoinDesc" wide className="quick-join-sheet">
      <div className="filter-modal-head">
        <h2 id="quickJoinTitle">{full ? '快速加入候補' : '快速加入'}</h2>
        <button className="icon-btn" onClick={onClose} aria-label="關閉"><Icon id="i-close" size={16} /></button>
      </div>
      <p id="quickJoinDesc" className="sr-only">使用你在個人資料設定的常用報名資料快速加入這場活動，送出前仍需確認。</p>

      {full && (
        <div className="warn-banner info">
          <Icon id="i-info" size={18} />
          <div>
            <b>目前活動已額滿</b>
            <span>候補為目前瀏覽器中的原型示範狀態，不會自動遞補或發送通知。</span>
          </div>
        </div>
      )}

      <ul className="kv-list quick-join-summary">
        <li><span>活動名稱</span><b>{event.title}</b></li>
        <li><span>日期時間</span><b>{event.date}・{event.startTime}{event.endTime ? `–${event.endTime}` : ''}</b></li>
        <li><span>地點</span><b>{event.venueName}</b></li>
        <li><span>程度</span><b>{event.level === 'open' ? '不限' : getLevelLabel(event.level)}</b></li>
        <li><span>網高</span><b>{getNetHeightLabel(event.netHeight)}</b></li>
        <li><span>費用</span><b>{priceLabel}</b></li>
        <li><span>剩餘名額</span><b>{full ? '已額滿' : `${remaining} 位`}</b></li>
      </ul>

      <h3 className="field-label">報名資料（來自個人資料設定）</h3>
      <ul className="kv-list quick-join-registrant">
        <li><span>姓名</span><b>{profile.name}</b></li>
        <li><span>聯絡電話</span><b>{profile.phone}</b></li>
        <li><span>位置偏好</span><b>{getPositionLabel(profile.defaultPosition)}</b></li>
        <li><span>付款方式</span><b>{event.price === 0 ? '無需付款' : (event.paymentMethod || '現場付款')}</b></li>
      </ul>

      <label className="agree-row">
        <input type="checkbox" checked={agree} onChange={(e) => setAgree(e.target.checked)} />
        <span>我已閱讀並同意活動須知與{full ? '候補' : '報名'}規範</span>
      </label>

      <div className="filter-modal-actions quick-join-actions">
        <button type="button" className="link-btn" onClick={onEditFull}>編輯報名資料</button>
        <button type="button" className="btn-primary" disabled={!agree} onClick={handleConfirm}>
          {full ? '確認加入候補' : '確認加入'}
        </button>
      </div>
    </Sheet>
  )
}
