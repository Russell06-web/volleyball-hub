import { useEffect, useRef } from 'react'

const FOCUSABLE_SELECTOR = 'a[href], button:not([disabled]), input:not([disabled]), textarea:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])'

// Shared overlay shell: bottom sheet on mobile, centered dialog on
// desktop (see .filter-modal* in explore.css). Used by every dialog in
// the app so open/close, focus handling, and scroll locking only need
// to be correct once:
//  - focus moves into the dialog on open, and is trapped there (Tab/
//    Shift+Tab cycle instead of escaping to the page behind it)
//  - focus returns to whatever triggered the dialog when it closes
//  - Escape closes it, background scroll is locked while it's open
export default function Sheet({ open, onClose, labelledBy, describedBy, children, wide = false, className = '' }) {
  const panelRef = useRef(null)
  const triggerRef = useRef(null)

  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [open])

  useEffect(() => {
    if (!open) return undefined

    triggerRef.current = document.activeElement

    const panel = panelRef.current
    const focusable = panel ? [...panel.querySelectorAll(FOCUSABLE_SELECTOR)] : []
    ;(focusable[0] || panel)?.focus()

    function onKeyDown(e) {
      if (e.key === 'Escape') {
        onClose()
        return
      }
      if (e.key !== 'Tab' || focusable.length === 0) return
      const first = focusable[0]
      const last = focusable[focusable.length - 1]
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault()
        last.focus()
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault()
        first.focus()
      }
    }

    document.addEventListener('keydown', onKeyDown)
    return () => {
      document.removeEventListener('keydown', onKeyDown)
      triggerRef.current?.focus?.()
    }
  }, [open, onClose])

  if (!open) return null

  return (
    <div className="filter-modal" role="dialog" aria-modal="true" aria-labelledby={labelledBy} aria-describedby={describedBy}>
      <div className="filter-modal-backdrop" onClick={onClose} />
      <div className={`filter-modal-sheet${wide ? ' wide' : ''}${className ? ` ${className}` : ''}`} ref={panelRef} tabIndex={-1}>
        {children}
      </div>
    </div>
  )
}
