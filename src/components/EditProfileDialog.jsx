import { useEffect, useState } from 'react'
import Sheet from './Sheet'
import { Icon } from './Icons'
import { useProfile } from '../context/ProfileContext'
import { isValidTaiwanMobile } from '../utils/bookingValidation'
import { POSITIONS } from '../constants/volleyballTaxonomy'
import { CITIES, FILTER_ALL, LEVELS } from '../constants/taxonomy'

// This is a self-declared skill label ("高階" etc, shown on the profile
// card), unrelated to `preferredLevel` below — that one is a filter
// preference (uses the same LEVELS enum Explore's filters use), not a
// claim about the visitor's own ability.
const SELF_RATING_LEVELS = ['初階', '中階', '高階']

export default function EditProfileDialog({ open, onClose }) {
  const { profile, updateProfile } = useProfile()
  const [name, setName] = useState(profile.name)
  const [bio, setBio] = useState(profile.bio)
  const [level, setLevel] = useState(profile.level)
  const [phone, setPhone] = useState(profile.phone)
  const [defaultPosition, setDefaultPosition] = useState(profile.defaultPosition)
  const [preferredLevel, setPreferredLevel] = useState(profile.preferredLevel)
  const [preferredCity, setPreferredCity] = useState(profile.preferredCity)
  const [quickJoinEnabled, setQuickJoinEnabled] = useState(profile.quickJoinEnabled)
  const [phoneError, setPhoneError] = useState('')

  // Re-sync the draft with the stored profile every time the dialog is
  // (re)opened, so a cancelled edit never leaks into the next open.
  useEffect(() => {
    if (open) {
      setName(profile.name)
      setBio(profile.bio)
      setLevel(profile.level)
      setPhone(profile.phone)
      setDefaultPosition(profile.defaultPosition)
      setPreferredLevel(profile.preferredLevel)
      setPreferredCity(profile.preferredCity)
      setQuickJoinEnabled(profile.quickJoinEnabled)
      setPhoneError('')
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open])

  function submit() {
    // Quick Join can only be ON with a real-looking phone number behind
    // it — turning the toggle on with an empty/invalid phone would just
    // silently never activate (isQuickJoinReady would still say no), so
    // catching it here with a real error is more honest than that.
    if (quickJoinEnabled && !isValidTaiwanMobile(phone)) {
      setPhoneError('啟用快速加入前，請先填寫有效的台灣手機號碼')
      return
    }
    updateProfile({
      name: name.trim() || profile.name,
      bio: bio.trim(),
      level,
      phone: phone.trim(),
      defaultPosition,
      preferredLevel,
      preferredCity,
      quickJoinEnabled,
    })
    onClose()
  }

  return (
    <Sheet open={open} onClose={onClose} labelledBy="editProfileTitle" wide>
      <div className="filter-modal-head">
        <h2 id="editProfileTitle">編輯個人資料</h2>
        <button className="icon-btn" onClick={onClose} aria-label="關閉"><Icon id="i-close" size={16} /></button>
      </div>

      <div className="form-grid">
        <label className="field full"><span>暱稱</span><input value={name} onChange={(e) => setName(e.target.value)} /></label>
        <label className="field full"><span>自我介紹</span><textarea rows="3" value={bio} onChange={(e) => setBio(e.target.value)} /></label>
        <div className="field full">
          <span>自評程度（非官方認證，僅供其他玩家參考）</span>
          <div className="chip-row">
            {SELF_RATING_LEVELS.map((l) => (
              <button key={l} type="button" className={`chip dark${level === l ? ' active' : ''}`} aria-pressed={level === l} onClick={() => setLevel(l)}>{l}</button>
            ))}
          </div>
        </div>
      </div>

      <h3 className="field-label">排球偏好</h3>
      <p className="field-hint">這些只是你自己的常用設定，不會限制你能瀏覽或報名哪些活動。</p>
      <div className="form-grid">
        <div className="field full">
          <span>常用位置</span>
          <div className="chip-row">
            {POSITIONS.map((p) => (
              <button key={p.value} type="button" className={`chip${defaultPosition === p.value ? ' active' : ''}`} aria-pressed={defaultPosition === p.value} onClick={() => setDefaultPosition(p.value)}>{p.label}</button>
            ))}
          </div>
        </div>
        <div className="field full">
          <span>常用程度</span>
          <div className="chip-row">
            <button type="button" className={`chip${preferredLevel === FILTER_ALL ? ' active' : ''}`} aria-pressed={preferredLevel === FILTER_ALL} onClick={() => setPreferredLevel(FILTER_ALL)}>不限</button>
            {LEVELS.map((l) => (
              <button key={l.value} type="button" className={`chip${preferredLevel === l.value ? ' active' : ''}`} aria-pressed={preferredLevel === l.value} onClick={() => setPreferredLevel(l.value)}>{l.label}</button>
            ))}
          </div>
        </div>
        <div className="field full">
          <span>常用城市</span>
          <div className="chip-row">
            <button type="button" className={`chip${preferredCity === FILTER_ALL ? ' active' : ''}`} aria-pressed={preferredCity === FILTER_ALL} onClick={() => setPreferredCity(FILTER_ALL)}>不限</button>
            {CITIES.map((c) => (
              <button key={c.value} type="button" className={`chip${preferredCity === c.value ? ' active' : ''}`} aria-pressed={preferredCity === c.value} onClick={() => setPreferredCity(c.value)}>{c.label}</button>
            ))}
          </div>
        </div>
      </div>

      <h3 className="field-label profile-quickjoin-heading">快速加入設定</h3>
      <p className="field-hint profile-quickjoin-intro">
        以下資料只會保存在這個瀏覽器裡，用來預填「快速加入」的報名表單，不會上傳到任何伺服器。請勿填寫真實敏感個資，示範用的假電話即可。
      </p>

      <div className="form-grid">
        <label className="field full">
          <span>示範電話</span>
          <input
            value={phone}
            onChange={(e) => { setPhone(e.target.value); setPhoneError('') }}
            placeholder="0912-345-678"
            inputMode="tel"
            aria-invalid={!!phoneError}
            aria-describedby={phoneError ? 'profile-phone-error' : undefined}
          />
          {phoneError && <span className="field-error" id="profile-phone-error">{phoneError}</span>}
        </label>
      </div>

      <label className="agree-row profile-quickjoin-toggle">
        <input type="checkbox" checked={quickJoinEnabled} onChange={(e) => { setQuickJoinEnabled(e.target.checked); setPhoneError('') }} />
        <span>啟用快速加入——活動詳情頁會用上面的資料直接跳出確認視窗，仍需要你按確認才會送出報名。</span>
      </label>

      <div className="filter-modal-actions">
        <button type="button" className="btn-secondary" onClick={onClose}>取消</button>
        <button type="button" className="btn-primary" onClick={submit}>儲存</button>
      </div>
    </Sheet>
  )
}
