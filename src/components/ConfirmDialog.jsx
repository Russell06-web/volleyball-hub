import Sheet from './Sheet'
import { Icon } from './Icons'

// Shared replacement for window.confirm — gets the same focus trap,
// Escape-to-close, focus-return, and scroll lock as every other dialog
// (all inherited from Sheet) instead of a native browser dialog that
// can't be styled and blocks the whole tab.
export default function ConfirmDialog({
  open, onClose, onConfirm, titleId, title, description, confirmLabel = '確認', cancelLabel = '取消', danger = false,
}) {
  return (
    <Sheet open={open} onClose={onClose} labelledBy={titleId}>
      <div className="filter-modal-head">
        <h2 id={titleId}>{title}</h2>
        <button className="icon-btn" onClick={onClose} aria-label="關閉"><Icon id="i-chevron" size={16} /></button>
      </div>

      {description && <p className="confirm-dialog-desc">{description}</p>}

      <div className="filter-modal-actions">
        <button type="button" className="btn-secondary" onClick={onClose}>{cancelLabel}</button>
        <button type="button" className={danger ? 'btn-cta danger' : 'btn-primary'} onClick={onConfirm}>{confirmLabel}</button>
      </div>
    </Sheet>
  )
}
