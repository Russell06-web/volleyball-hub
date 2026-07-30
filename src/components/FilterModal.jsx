import { useEffect, useState } from 'react'
import Sheet from './Sheet'
import { Icon } from './Icons'
import FilterPanel from './FilterPanel'
import { FILTER_ALL } from '../constants/taxonomy'
import { FILTER_KEYS } from '../utils/exploreParams'

const RESET_FILTERS = Object.fromEntries(FILTER_KEYS.map((key) => [key, FILTER_ALL]))

// Mobile/tablet filtering uses a real draft model: opening the sheet
// snapshots the current filters into local state, every tap in here only
// changes that local copy, and nothing reaches Explore's actual URL/
// filters until "套用篩選" is pressed. Closing (✕, backdrop, Escape —
// all handled by Sheet) just discards the draft. This matches what the
// "套用篩選" button already implied but didn't do — before this, every
// tap inside the modal silently committed immediately.
//
// `initialSection`/`focusField` are one-shot, caller-supplied hints (see
// Explore's "我需要的位置" quick entry) — Sheet unmounts this whole tree
// on close, so every open is a fresh mount and there's no leftover state
// to reset. `focusField` runs its own effect *after* Sheet's own
// autofocus-first-element effect (Sheet is this component's child, so its
// effect fires first within the same commit) — deliberately overriding
// that default focus target with the specific field the caller asked for.
export default function FilterModal({
  open, onClose, filters, onApply, getResultCountForFilters, initialSection = null, focusField = null,
}) {
  const [draft, setDraft] = useState(filters)

  useEffect(() => {
    if (open) setDraft(filters)
  }, [open, filters])

  useEffect(() => {
    if (!open || !focusField) return
    const target = document.querySelector(`.filter-modal-sheet [data-filter-field="${focusField}"] button`)
    target?.focus()
  }, [open, focusField])

  function handleChange(key, value) {
    setDraft((d) => ({ ...d, [key]: value }))
  }
  function handleReset() {
    setDraft(RESET_FILTERS)
  }
  function handleApply() {
    onApply(draft)
    onClose()
  }

  const isFiltering = FILTER_KEYS.some((k) => draft[k] !== FILTER_ALL)
  const resultCount = getResultCountForFilters(draft)

  return (
    <Sheet open={open} onClose={onClose} labelledBy="filterModalTitle">
      <div className="filter-modal-head">
        <h2 id="filterModalTitle">篩選活動</h2>
        <button className="icon-btn" onClick={onClose} aria-label="關閉篩選"><Icon id="i-close" size={16} /></button>
      </div>
      <FilterPanel
        heading=""
        layout="modal"
        filters={draft}
        onChange={handleChange}
        onApply={handleApply}
        onReset={handleReset}
        resultCount={resultCount}
        isFiltering={isFiltering}
        applyLabel={`套用篩選・共 ${resultCount} 場`}
        initialSection={initialSection}
      />
    </Sheet>
  )
}
