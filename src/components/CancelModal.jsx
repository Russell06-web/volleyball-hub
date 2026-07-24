import { useEffect, useState } from 'react'
import Sheet from './Sheet'
import { Icon } from './Icons'
import { formatPrice } from '../utils/format'

const REASONS = ['時間無法配合', '臨時有事', '身體不適', '找到其他活動', '費用考量', '其他原因']

// Bookings no longer copy the event's title/date/price — this always
// takes the live event (looked up by eventId from EventsContext) so the
// summary reflects reality even if the event was edited since booking.
export default function CancelModal({ booking, event, onClose, onConfirm }) {
  const [reason, setReason] = useState(null)
  const [agree, setAgree] = useState(false)

  useEffect(() => {
    if (booking) { setReason(null); setAgree(false) }
  }, [booking])

  if (!booking) return null
  const canSubmit = reason !== null && agree
  const isWaitlist = booking.status === 'waitlist'

  function submit() {
    onConfirm(reason)
  }

  return (
    <Sheet open={!!booking} onClose={onClose} labelledBy="cancelTitle" wide>
      <div className="filter-modal-head">
        <h2 id="cancelTitle">{isWaitlist ? '取消候補' : '取消報名'}</h2>
        <button className="icon-btn" onClick={onClose} aria-label="關閉"><Icon id="i-chevron" size={16} /></button>
      </div>

      <div className="warn-banner">
        <Icon id="i-info" size={18} />
        <div><b>確定要{isWaitlist ? '取消候補' : '取消報名'}嗎？</b><span>取消後將無法恢復，請確認是否繼續。</span></div>
      </div>

      <ul className="kv-list">
        <li><span>活動名稱</span><b>{event ? event.title : '活動資料已不存在'}</b></li>
        <li><span>訂單編號</span><b>{booking.id.toUpperCase()}</b></li>
        {event && <li><span>活動日期</span><b>{event.date}</b></li>}
        {event && !isWaitlist && <li><span>報名費用</span><b>{formatPrice(event.price)}</b></li>}
      </ul>

      {!isWaitlist && (
        <div className="refund-notice">
          <b>退款資訊</b>
          <ol>
            <li><span className="step">1</span><div><b>活動開始前 7 天取消</b><span>退款 100% 費用</span></div></li>
            <li><span className="step">2</span><div><b>活動開始前 3–7 天取消</b><span>退款 70% 費用</span></div></li>
            <li><span className="step">3</span><div><b>活動開始前 3 天內取消</b><span>不予退款</span></div></li>
          </ol>
        </div>
      )}

      <h3 className="field-label">請選擇取消原因</h3>
      <div className="reason-list">
        {REASONS.map((r) => (
          <button key={r} type="button" className={`reason-row${reason === r ? ' active' : ''}`} aria-pressed={reason === r} onClick={() => setReason(r)}>{r}</button>
        ))}
      </div>

      <label className="agree-row">
        <input type="checkbox" checked={agree} onChange={(e) => setAgree(e.target.checked)} />
        <span>我已了解並同意{isWaitlist ? '取消候補' : '退款政策'}，確認要取消{isWaitlist ? '候補' : '此活動報名'}</span>
      </label>

      <div className="filter-modal-actions">
        <button type="button" className="btn-secondary" onClick={onClose}>返回</button>
        <button type="button" className="btn-primary" disabled={!canSubmit} onClick={submit}>確認取消{isWaitlist ? '候補' : '報名'}</button>
      </div>
    </Sheet>
  )
}
