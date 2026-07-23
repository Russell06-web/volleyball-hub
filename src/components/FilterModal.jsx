import { useEffect } from 'react'
import { Icon } from './Icons'
import FilterPanel from './FilterPanel'

export default function FilterModal({ open, onClose }) {
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
    <div className="filter-modal" role="dialog" aria-modal="true" aria-labelledby="filterModalTitle">
      <div className="filter-modal-backdrop" onClick={onClose} />
      <div className="filter-modal-sheet">
        <div className="filter-modal-head">
          <h2 id="filterModalTitle">篩選活動</h2>
          <button className="icon-btn" onClick={onClose} aria-label="關閉篩選"><Icon id="i-chevron" size={16} /></button>
        </div>
        <FilterPanelHeadless onApply={onClose} />
      </div>
    </div>
  )
}

// FilterPanel already renders its own <h2>; inside the modal the heading
// is provided by the sheet header above, so it's suppressed here.
function FilterPanelHeadless({ onApply }) {
  return <FilterPanel heading="" onApply={onApply} />
}
