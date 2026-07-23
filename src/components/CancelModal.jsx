import { useState } from 'react'
import Sheet from './Sheet'
import { Icon } from './Icons'

const REASONS = ['時間無法配合', '臨時有事', '身體不適', '找到其他活動', '費用考量', '其他原因']

export default function CancelModal({ booking, onClose, onConfirm }) {
  const [reason, setReason] = useState(null)
  const [agree, setAgree] = useState(false)

  if (!booking) return null
  const canSubmit = reason !== null && agree

  function submit() {
    onConfirm(reason)
    setReason(null)
    setAgree(false)
  }

  return (
    <Sheet open={!!booking} onClose={onClose} labelledBy="cancelTitle" wide>
      <div className="filter-modal-head">
        <h2 id="cancelTitle">取消報名</h2>
        <button className="icon-btn" onClick={onClose} aria-label="關閉"><Icon id="i-chevron" size={16} /></button>
      </div>

      <div className="warn-banner">
        <Icon id="i-info" size={18} />
        <div><b>確定要取消報名嗎？</b><span>取消報名後將無法恢復，請確認是否繼續。</span></div>
      </div>

      <ul className="kv-list">
        <li><span>活動名稱</span><b>{booking.title}</b></li>
        <li><span>訂單編號</span><b>{booking.id.toUpperCase()}</b></li>
        <li><span>活動日期</span><b>{booking.date}</b></li>
        <li><span>報名費用</span><b>{booking.price}</b></li>
      </ul>

      <div className="refund-notice">
        <b>退款資訊</b>
        <ol>
          <li><span className="step">1</span><div><b>活動開始前 7 天取消</b><span>退款 100% 費用</span></div></li>
          <li><span className="step">2</span><div><b>活動開始前 3–7 天取消</b><span>退款 70% 費用</span></div></li>
          <li><span className="step">3</span><div><b>活動開始前 3 天內取消</b><span>不予退款</span></div></li>
        </ol>
      </div>

      <h3 className="field-label">請選擇取消原因</h3>
      <div className="reason-list">
        {REASONS.map((r) => (
          <button key={r} type="button" className={`reason-row${reason === r ? ' active' : ''}`} onClick={() => setReason(r)}>{r}</button>
        ))}
      </div>

      <label className="agree-row">
        <input type="checkbox" checked={agree} onChange={(e) => setAgree(e.target.checked)} />
        <span>我已了解並同意退款政策，確認要取消此活動報名</span>
      </label>

      <div className="filter-modal-actions">
        <button className="btn-secondary" onClick={onClose}>返回</button>
        <button className="btn-primary" disabled={!canSubmit} onClick={submit}>確認取消報名</button>
      </div>
    </Sheet>
  )
}
