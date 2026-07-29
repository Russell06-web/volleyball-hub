import { createContext, useContext, useEffect, useState } from 'react'
import { readStorage, writeStorage, STORAGE_KEYS } from '../services/storage'
import { addCompareId, canAddCompareId, MAX_COMPARE, pruneCompareIds, removeCompareId, sanitizeCompareIds } from '../utils/compareIds'
import { useEvents } from './EventsContext'
import { useToast } from './ToastContext'

export { MAX_COMPARE }

// Only ever stores event IDs — never a snapshot of the event itself, same
// rule as bookings/favorites/history. Comparing 2–3 events is a small,
// purely client-side convenience; see docs/PRODUCT_LIMITATIONS.md. The
// actual validation/list-mutation rules live in utils/compareIds.js as
// plain functions so they're testable without a React render.
const CompareContext = createContext(null)

export function CompareProvider({ children }) {
  const { events } = useEvents()
  const { showToast } = useToast()
  const [compareIds, setCompareIds] = useState(() => sanitizeCompareIds(readStorage(STORAGE_KEYS.compare, [])))

  useEffect(() => {
    writeStorage(STORAGE_KEYS.compare, compareIds)
  }, [compareIds])

  // An event that's since been deleted (Manage's zero-booking delete
  // path) should just quietly disappear from the compare list.
  useEffect(() => {
    setCompareIds((prev) => pruneCompareIds(prev, events.map((e) => e.id)))
  }, [events])

  function isCompared(id) {
    return compareIds.includes(id)
  }

  function addCompare(id) {
    if (!canAddCompareId(compareIds, id)) {
      if (compareIds.includes(id)) return
      showToast(`最多只能比較 ${MAX_COMPARE} 場活動`)
      return
    }
    setCompareIds((prev) => addCompareId(prev, id))
    showToast('已加入比較')
  }

  function removeCompare(id) {
    if (!compareIds.includes(id)) return
    setCompareIds((prev) => removeCompareId(prev, id))
    showToast('已從比較移除')
  }

  function toggleCompare(id) {
    if (isCompared(id)) removeCompare(id)
    else addCompare(id)
  }

  function clearCompare() {
    setCompareIds([])
  }

  return (
    <CompareContext.Provider value={{ compareIds, isCompared, addCompare, removeCompare, toggleCompare, clearCompare }}>
      {children}
    </CompareContext.Provider>
  )
}

export function useCompare() {
  const ctx = useContext(CompareContext)
  if (!ctx) throw new Error('useCompare must be used within a CompareProvider')
  return ctx
}
