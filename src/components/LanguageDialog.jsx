import Sheet from './Sheet'
import { Icon } from './Icons'
import { useProfile } from '../context/ProfileContext'

const LANGUAGES = [
  { code: 'zh-Hant', label: '中文' },
  { code: 'en', label: 'English' },
  { code: 'ja', label: '日本語' },
]

export default function LanguageDialog({ open, onClose }) {
  const { profile, updateProfile } = useProfile()

  return (
    <Sheet open={open} onClose={onClose} labelledBy="languageDialogTitle">
      <div className="filter-modal-head">
        <h2 id="languageDialogTitle">語言設定</h2>
        <button className="icon-btn" onClick={onClose} aria-label="關閉"><Icon id="i-chevron" size={16} /></button>
      </div>

      <div className="chip-row col">
        {LANGUAGES.map((lang) => (
          <button
            key={lang.code}
            type="button"
            className={`chip full${profile.language === lang.code ? ' active' : ''}`}
            onClick={() => updateProfile({ language: lang.code })}
          >
            {lang.label}
          </button>
        ))}
      </div>

      <p className="reason-disclaimer">這個選擇會保留在你的瀏覽器裡，但目前介面文字都還是繁體中文——完整多語系介面是尚未實作的未來規劃，這裡只是先記住你的偏好。</p>

      <div className="filter-modal-actions">
        <button type="button" className="btn-primary full" onClick={onClose}>完成</button>
      </div>
    </Sheet>
  )
}
