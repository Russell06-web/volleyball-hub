import { createContext, useContext, useEffect, useState } from 'react'
import { DEFAULT_FILTERS } from '../constants/taxonomy'
import { readStorage, writeStorage, STORAGE_KEYS } from '../services/storage'

// The explore page's filters ARE the user's stated preference in this
// app — there's no separate profile/onboarding form. Lifting them here
// (instead of local state in Explore) means the event detail page can
// read the same values to explain why something is/isn't a match, and a
// visit to /event/:id directly still reflects whatever was last set.
//
// Explore itself treats the URL (?type=...&level=...) as the source of
// truth when present — this context is the localStorage fallback for
// "no query string yet" and the value that persists once the user leaves
// /explore.
const PreferencesContext = createContext(null)

export function PreferencesProvider({ children }) {
  const [filters, setFiltersState] = useState(() => ({
    ...DEFAULT_FILTERS,
    ...readStorage(STORAGE_KEYS.preferences, {}),
  }))

  useEffect(() => {
    writeStorage(STORAGE_KEYS.preferences, filters)
  }, [filters])

  function setFilter(key, value) {
    setFiltersState((f) => ({ ...f, [key]: value }))
  }
  function setFilters(next) {
    setFiltersState({ ...DEFAULT_FILTERS, ...next })
  }
  function resetFilters() {
    setFiltersState(DEFAULT_FILTERS)
  }

  return (
    <PreferencesContext.Provider value={{ filters, setFilter, setFilters, resetFilters }}>
      {children}
    </PreferencesContext.Provider>
  )
}

export function usePreferences() {
  const ctx = useContext(PreferencesContext)
  if (!ctx) throw new Error('usePreferences must be used within a PreferencesProvider')
  return ctx
}
