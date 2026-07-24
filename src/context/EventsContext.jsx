import { createContext, useContext, useEffect, useState } from 'react'
import { SEED_EVENTS } from '../data/events'

const STORAGE_KEY = 'vh-events'

// Single shared source of truth for event data — Explore, EventDetail,
// Favorites, History, and Manage all read from here instead of a static
// import, so a real registration actually moves `registered`, a real
// cancellation frees the slot back up, and an event created through the
// "建立活動" wizard shows up in Explore immediately, not just on Manage's
// own disconnected mock list.
const EventsContext = createContext(null)

export function EventsProvider({ children }) {
  const [events, setEvents] = useState(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      return raw ? JSON.parse(raw) : SEED_EVENTS
    } catch {
      return SEED_EVENTS
    }
  })

  useEffect(() => {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(events)) } catch { /* storage unavailable */ }
  }, [events])

  function getEventById(id) {
    return events.find((e) => e.id === id)
  }

  function addEvent(data) {
    const id = 'e' + Date.now()
    const newEvent = { section: 'more', tone: '', badgeLabel: '', registered: 0, rating: null, ownedByMe: true, ...data, id }
    setEvents((prev) => [newEvent, ...prev])
    return id
  }

  function removeEvent(id) {
    setEvents((prev) => prev.filter((e) => e.id !== id))
  }

  // Used on registration/cancellation to keep an event's headcount honest
  // — clamped so a cancelled team of 6 can't push registered below 0, and
  // a race of near-simultaneous individual registrations can't push it
  // over capacity (there's no server to arbitrate this for real; see
  // docs/PRODUCT_LIMITATIONS.md).
  function adjustRegistered(id, delta) {
    setEvents((prev) => prev.map((e) => {
      if (e.id !== id) return e
      const next = Math.max(0, Math.min(e.capacity, e.registered + delta))
      return { ...e, registered: next }
    }))
  }

  return (
    <EventsContext.Provider value={{ events, getEventById, addEvent, removeEvent, adjustRegistered }}>
      {children}
    </EventsContext.Provider>
  )
}

export function useEvents() {
  const ctx = useContext(EventsContext)
  if (!ctx) throw new Error('useEvents must be used within an EventsProvider')
  return ctx
}
