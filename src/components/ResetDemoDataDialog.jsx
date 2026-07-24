import { useState } from 'react'
import Sheet from './Sheet'
import { Icon } from './Icons'

const DEMO_KEYS = ['vh-bookings', 'vh-preferences', 'vh-favorites', 'vh-history', 'vh-profile']

export default function ResetDemoDataDialog({ open, onClose }) {
  const [confirming, setConfirming] = useState(false)

  function handleClose() {
    setConfirming(false)
    onClose()
  }

  function handleReset() {
    DEMO_KEYS.forEach((key) => { try { localStorage.removeItem(key) } catch { /* storage unavailable */ } })
    // Reloading is the simplest way to guarantee every context re-reads
    // its (now-empty) localStorage key and falls back to its real
    // default seed — no risk of one context resetting while another
    // still holds stale in-memory state.
    window.location.reload()
  }

  return (
    <Sheet open={open} onClose={handleClose} labelledBy="resetDemoTitle">
      <div className="filter-modal-head">
        <h2 id="resetDemoTitle">重置示範資料</h2>
        <button className="icon-btn" onClick={handleClose} aria-label="關閉"><Icon id="i-chevron" size={16} /></button>
      </div>

      <div className="warn-banner">
        <Icon id="i-info" size={18} />
        <div>
          <b>此操作只會清除這個瀏覽器裡 Volleyball Hub 的原型資料</b>
          <span>不會影響任何真實帳號、金流或外部服務——因為本原型本來就沒有串接這些東西。</span>
        </div>
      </div>

      <p className="reset-scope-intro">會被清除的內容：</p>
      <ul className="reset-scope-list">
        <li>我的報名與候補紀錄</li>
        <li>活動篩選偏好</li>
        <li>收藏的活動</li>
        <li>瀏覽歷史</li>
        <li>個人資料（暱稱、自我介紹、自評程度、語言設定）</li>
      </ul>

      {!confirming ? (
        <div className="filter-modal-actions">
          <button type="button" className="btn-secondary" onClick={handleClose}>取消</button>
          <button type="button" className="btn-primary" onClick={() => setConfirming(true)}>清除示範資料</button>
        </div>
      ) : (
        <div className="reset-confirm-step">
          <p>確定要清除嗎？這個動作無法復原，頁面會重新整理。</p>
          <div className="filter-modal-actions">
            <button type="button" className="btn-secondary" onClick={() => setConfirming(false)}>再想一下</button>
            <button type="button" className="btn-cta danger" onClick={handleReset}>確認清除</button>
          </div>
        </div>
      )}
    </Sheet>
  )
}
