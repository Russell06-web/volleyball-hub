import { useEffect, useState } from 'react'
import { Icon } from './Icons'

// How many active-filter chips show before collapsing into "+N", per
// breakpoint — mobile shouldn't ever have to scroll through a wall of
// chips just to reach the result list. Falls back to the mobile cap
// when matchMedia isn't available (older test/runtime environments)
// rather than throwing.
function getCap() {
  if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') return 4
  try {
    if (window.matchMedia('(min-width: 1024px)').matches) return 6
    if (window.matchMedia('(min-width: 640px)').matches) return 5
    return 4
  } catch {
    return 4
  }
}

function useActiveFilterCap() {
  const [cap, setCap] = useState(getCap)
  useEffect(() => {
    function handleResize() { setCap(getCap()) }
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])
  return cap
}

// Active filter chips (removable) are kept strictly separate from the
// "清除全部"/"儲存這組條件" actions below them — those are page-level
// actions, not filter values, and mixing them into the chip row made it
// unclear which pills were "a condition you can remove" vs "a button that
// does something else". Sort is never represented here (it isn't a
// filter), and neither is the search text (see Explore.jsx).
export default function ActiveFiltersSummary({ items, onRemove, onClearAll, onSaveSearch }) {
  const cap = useActiveFilterCap()
  const [expanded, setExpanded] = useState(false)

  if (items.length === 0) return null

  const overflowing = items.length > cap
  const visibleItems = expanded ? items : items.slice(0, cap)
  const hiddenCount = items.length - visibleItems.length

  return (
    <div className="active-filters-block">
      <div className="active-filters" aria-label="目前套用的篩選條件">
        {visibleItems.map((item) => (
          <button
            key={item.key}
            type="button"
            className="active-filter-chip"
            aria-label={`移除${item.label}篩選`}
            onClick={() => onRemove(item.key)}
          >
            <span aria-hidden="true">{item.label}</span>
            <span className="chip-remove" aria-hidden="true"><Icon id="i-close" size={11} /></span>
          </button>
        ))}
        {overflowing && (
          <button
            type="button"
            className="active-filter-more"
            aria-expanded={expanded}
            onClick={() => setExpanded((v) => !v)}
          >
            {expanded ? '收合' : `+${hiddenCount}`}
          </button>
        )}
      </div>
      <div className="active-filters-actions">
        <button type="button" className="active-filters-clear" onClick={onClearAll}>清除全部</button>
        <button type="button" className="link-btn save-search-trigger" onClick={onSaveSearch}>儲存這組條件</button>
      </div>
    </div>
  )
}
