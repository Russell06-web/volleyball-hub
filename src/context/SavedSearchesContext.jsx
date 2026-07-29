import { createContext, useContext, useEffect, useState } from 'react'
import { readStorage, writeStorage, STORAGE_KEYS } from '../services/storage'
import { createId } from '../utils/id'
import {
  MAX_SAVED_SEARCHES, normalizeSavedSearchName, sanitizeSavedSearches, validateSavedSearchName,
} from '../utils/savedSearches'
import { useToast } from './ToastContext'

export { MAX_SAVED_SEARCHES }

// A saved search only ever stores a reusable filters+sort combination —
// never the search text, never a notification promise. See
// utils/savedSearches.js for the validation rules this wraps.
const SavedSearchesContext = createContext(null)

export function SavedSearchesProvider({ children }) {
  const { showToast } = useToast()
  const [savedSearches, setSavedSearches] = useState(() => sanitizeSavedSearches(readStorage(STORAGE_KEYS.savedSearches, [])))

  useEffect(() => {
    writeStorage(STORAGE_KEYS.savedSearches, savedSearches)
  }, [savedSearches])

  function saveSearch(name, filters, sort) {
    const trimmed = normalizeSavedSearchName(name)
    const error = validateSavedSearchName(trimmed, savedSearches)
    if (error) return { ok: false, message: error }
    if (savedSearches.length >= MAX_SAVED_SEARCHES) {
      return { ok: false, message: `最多只能儲存 ${MAX_SAVED_SEARCHES} 組條件，請先刪除一組再儲存。` }
    }
    const entry = { id: createId('search-'), name: trimmed, filters, sort, createdAt: Date.now() }
    setSavedSearches((prev) => [...prev, entry])
    showToast('已儲存這組條件')
    return { ok: true, entry }
  }

  function renameSearch(id, name) {
    const trimmed = normalizeSavedSearchName(name)
    const others = savedSearches.filter((s) => s.id !== id)
    const error = validateSavedSearchName(trimmed, others)
    if (error) return { ok: false, message: error }
    setSavedSearches((prev) => prev.map((s) => (s.id === id ? { ...s, name: trimmed } : s)))
    return { ok: true }
  }

  function deleteSearch(id) {
    setSavedSearches((prev) => prev.filter((s) => s.id !== id))
    showToast('已刪除這組儲存條件')
  }

  return (
    <SavedSearchesContext.Provider value={{ savedSearches, saveSearch, renameSearch, deleteSearch }}>
      {children}
    </SavedSearchesContext.Provider>
  )
}

export function useSavedSearches() {
  const ctx = useContext(SavedSearchesContext)
  if (!ctx) throw new Error('useSavedSearches must be used within a SavedSearchesProvider')
  return ctx
}
