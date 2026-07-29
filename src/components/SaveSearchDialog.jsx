import { useEffect, useState } from 'react'
import Sheet from './Sheet'
import { Icon } from './Icons'
import { useSavedSearches, MAX_SAVED_SEARCHES } from '../context/SavedSearchesContext'
import { buildSavedSearchFilters, MAX_NAME_LENGTH } from '../utils/savedSearches'
import { getLabelForFilter } from '../utils/exploreFilterLabels'
import { SORTS } from '../constants/taxonomy'

// Only ever saves a reusable filters+sort combination — never the typed
// search text, never a promise of future notifications (see the fixed
// copy below). buildSavedSearchFilters() is the same function the
// underlying context/tests already validate, so the chip preview shown
// here is guaranteed to match exactly what gets saved.
export default function SaveSearchDialog({ open, onClose, exploreState }) {
  const { savedSearches, saveSearch } = useSavedSearches()
  const [name, setName] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    if (open) {
      setName('')
      setError('')
    }
  }, [open])

  const { filters, sort } = buildSavedSearchFilters(exploreState)
  const chips = Object.entries(filters).map(([key, value]) => getLabelForFilter(key, value))
  if (sort !== 'default') chips.push(SORTS.find((s) => s.value === sort)?.label || sort)
  const atLimit = savedSearches.length >= MAX_SAVED_SEARCHES

  function handleSave() {
    const result = saveSearch(name, filters, sort)
    if (!result.ok) {
      setError(result.message)
      return
    }
    onClose()
  }

  return (
    <Sheet open={open} onClose={onClose} labelledBy="saveSearchTitle" describedBy="saveSearchDesc">
      <div className="filter-modal-head">
        <h2 id="saveSearchTitle">儲存這組條件</h2>
        <button className="icon-btn" onClick={onClose} aria-label="關閉"><Icon id="i-close" size={16} /></button>
      </div>
      <p id="saveSearchDesc" className="field-hint">
        此功能只會儲存篩選組合，不會發送新活動通知。最多可儲存 {MAX_SAVED_SEARCHES} 組，之後可以在「個人資料」頁面套用、重新命名或刪除。
      </p>

      {chips.length > 0 && (
        <div className="chip-row" aria-label="這組條件包含">
          {chips.map((c, i) => <span key={i} className="tag type">{c}</span>)}
        </div>
      )}

      <label className="field full">
        <span>名稱</span>
        <input
          value={name}
          maxLength={MAX_NAME_LENGTH}
          placeholder="例如：週末台北中階場"
          onChange={(e) => { setName(e.target.value); setError('') }}
          aria-describedby={error ? 'saveSearchError' : undefined}
          aria-invalid={error ? 'true' : undefined}
        />
      </label>
      {error && <p id="saveSearchError" className="field-error">{error}</p>}
      {atLimit && !error && (
        <p className="field-hint">已達 {MAX_SAVED_SEARCHES} 組上限，儲存前請先到個人資料頁面刪除一組。</p>
      )}

      <div className="filter-modal-actions">
        <button type="button" className="link-btn" onClick={onClose}>取消</button>
        <button type="button" className="btn-primary" onClick={handleSave}>儲存</button>
      </div>
    </Sheet>
  )
}
