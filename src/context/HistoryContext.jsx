import { createContext, useContext, useEffect, useState } from 'react'

const STORAGE_KEY = 'vh-history'
const MAX_ENTRIES = 20

const HistoryContext = createContext(null)

export function HistoryProvider({ children }) {
  const [history, setHistory] = useState(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      return raw ? JSON.parse(raw) : []
    } catch {
      return []
    }
  })

  useEffect(() => {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(history)) } catch { /* storage unavailable */ }
  }, [history])

  // Most-recent-first, de-duplicated, capped — a real (if small) browsing
  // history rather than an ever-growing log.
  function recordView(eventId) {
    setHistory((prev) => [eventId, ...prev.filter((id) => id !== eventId)].slice(0, MAX_ENTRIES))
  }

  return (
    <HistoryContext.Provider value={{ history, recordView }}>
      {children}
    </HistoryContext.Provider>
  )
}

export function useHistory() {
  const ctx = useContext(HistoryContext)
  if (!ctx) throw new Error('useHistory must be used within a HistoryProvider')
  return ctx
}
