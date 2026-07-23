import { createContext, useContext, useEffect, useState } from 'react'
import { DEFAULT_FILTERS } from '../components/FilterPanel'

const STORAGE_KEY = 'vh-preferences'

// The explore page's filters ARE the user's stated preference in this
// app — there's no separate profile/onboarding form. Lifting them here
// (instead of local state in Explore) means the event detail page can
// read the same values to explain why something is/isn't recommended,
// and a visit to /event/:id directly still reflects whatever the user
// last told the explore page they wanted.
const PreferencesContext = createContext(null)

export function PreferencesProvider({ children }) {
  const [filters, setFiltersState] = useState(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      return raw ? { ...DEFAULT_FILTERS, ...JSON.parse(raw) } : DEFAULT_FILTERS
    } catch {
      return DEFAULT_FILTERS
    }
  })

  useEffect(() => {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(filters)) } catch { /* storage unavailable */ }
  }, [filters])

  function setFilter(key, value) {
    setFiltersState((f) => ({ ...f, [key]: value }))
  }
  function resetFilters() {
    setFiltersState(DEFAULT_FILTERS)
  }

  return (
    <PreferencesContext.Provider value={{ filters, setFilter, resetFilters }}>
      {children}
    </PreferencesContext.Provider>
  )
}

export function usePreferences() {
  const ctx = useContext(PreferencesContext)
  if (!ctx) throw new Error('usePreferences must be used within a PreferencesProvider')
  return ctx
}
