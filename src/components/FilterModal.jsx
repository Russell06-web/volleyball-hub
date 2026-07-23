import Sheet from './Sheet'
import { Icon } from './Icons'
import FilterPanel from './FilterPanel'

export default function FilterModal({ open, onClose }) {
  return (
    <Sheet open={open} onClose={onClose} labelledBy="filterModalTitle">
      <div className="filter-modal-head">
        <h2 id="filterModalTitle">篩選活動</h2>
        <button className="icon-btn" onClick={onClose} aria-label="關閉篩選"><Icon id="i-chevron" size={16} /></button>
      </div>
      <FilterPanel heading="" onApply={onClose} />
    </Sheet>
  )
}
