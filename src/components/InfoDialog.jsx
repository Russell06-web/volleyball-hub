import Sheet from './Sheet'
import { Icon } from './Icons'

// Generic read-only info dialog — used for every "here's what this
// actually is" panel (privacy & data, about this prototype, technical
// limitations, help). No form fields, just real content plus the
// shared dialog a11y behaviour from Sheet.
export default function InfoDialog({ open, onClose, titleId, title, children }) {
  return (
    <Sheet open={open} onClose={onClose} labelledBy={titleId} wide>
      <div className="filter-modal-head">
        <h2 id={titleId}>{title}</h2>
        <button className="icon-btn" onClick={onClose} aria-label="關閉"><Icon id="i-close" size={16} /></button>
      </div>
      <div className="info-dialog-body">{children}</div>
    </Sheet>
  )
}
