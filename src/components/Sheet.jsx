import { useEffect } from 'react'

// Shared overlay shell: bottom sheet on mobile, centered dialog on
// desktop (see .filter-modal* in explore.css). Used by the filter,
// registration, and cancellation flows so they open/close consistently.
export default function Sheet({ open, onClose, labelledBy, children, wide = false }) {
  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [open])

  useEffect(() => {
    if (!open) return
    function onKeyDown(e) { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', onKeyDown)
    return () => document.removeEventListener('keydown', onKeyDown)
  }, [open, onClose])

  if (!open) return null

  return (
    <div className="filter-modal" role="dialog" aria-modal="true" aria-labelledby={labelledBy}>
      <div className="filter-modal-backdrop" onClick={onClose} />
      <div className={`filter-modal-sheet${wide ? ' wide' : ''}`}>{children}</div>
    </div>
  )
}
