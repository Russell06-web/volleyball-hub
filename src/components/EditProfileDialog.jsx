import { useEffect, useState } from 'react'
import Sheet from './Sheet'
import { Icon } from './Icons'
import { useProfile } from '../context/ProfileContext'

const LEVELS = ['初階', '中階', '高階']

export default function EditProfileDialog({ open, onClose }) {
  const { profile, updateProfile } = useProfile()
  const [name, setName] = useState(profile.name)
  const [bio, setBio] = useState(profile.bio)
  const [level, setLevel] = useState(profile.level)

  // Re-sync the draft with the stored profile every time the dialog is
  // (re)opened, so a cancelled edit never leaks into the next open.
  useEffect(() => {
    if (open) {
      setName(profile.name)
      setBio(profile.bio)
      setLevel(profile.level)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open])

  function submit() {
    updateProfile({ name: name.trim() || profile.name, bio: bio.trim(), level })
    onClose()
  }

  return (
    <Sheet open={open} onClose={onClose} labelledBy="editProfileTitle" wide>
      <div className="filter-modal-head">
        <h2 id="editProfileTitle">編輯個人資料</h2>
        <button className="icon-btn" onClick={onClose} aria-label="關閉"><Icon id="i-chevron" size={16} /></button>
      </div>

      <div className="form-grid">
        <label className="field full"><span>暱稱</span><input value={name} onChange={(e) => setName(e.target.value)} /></label>
        <label className="field full"><span>自我介紹</span><textarea rows="3" value={bio} onChange={(e) => setBio(e.target.value)} /></label>
        <div className="field full">
          <span>自評程度（非官方認證，僅供其他玩家參考）</span>
          <div className="chip-row">
            {LEVELS.map((l) => (
              <button key={l} type="button" className={`chip dark${level === l ? ' active' : ''}`} onClick={() => setLevel(l)}>{l}</button>
            ))}
          </div>
        </div>
      </div>

      <div className="filter-modal-actions">
        <button type="button" className="btn-secondary" onClick={onClose}>取消</button>
        <button type="button" className="btn-primary" onClick={submit}>儲存</button>
      </div>
    </Sheet>
  )
}
