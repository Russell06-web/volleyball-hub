import { createContext, useContext, useEffect, useState } from 'react'
import { SEED_EVENTS } from '../data/events'
import { readStorage, writeStorage, STORAGE_KEYS } from '../services/storage'
import { createId } from '../utils/id'
import { EVENT_STATUS } from '../constants/taxonomy'

// Single shared source of truth for event data — Explore, EventDetail,
// Favorites, History, Bookings and Manage all read from here instead of a
// static import, so a real registration actually moves registeredCount, a
// real cancellation frees the slot back up, and an event created through
// the "建立活動" wizard shows up in Explore immediately.
const EventsContext = createContext(null)

export function EventsProvider({ children }) {
  const [events, setEvents] = useState(() => readStorage(STORAGE_KEYS.events, SEED_EVENTS))

  useEffect(() => {
    writeStorage(STORAGE_KEYS.events, events)
  }, [events])

  function getEventById(id) {
    return events.find((e) => e.id === id)
  }

  function addEvent(data) {
    const now = Date.now()
    const id = createId('e-')
    const newEvent = {
      waitlistCount: 0,
      registeredCount: 0,
      status: EVENT_STATUS.PUBLISHED,
      isFeatured: false,
      isUrgent: false,
      hasInsurance: false,
      hasCoach: false,
      playStyle: '',
      features: [],
      ...data,
      id,
      createdAt: now,
      updatedAt: now,
    }
    setEvents((prev) => [newEvent, ...prev])
    return id
  }

  // Generic patch used by the registration/cancellation/create flows —
  // the actual "what changes" decision lives in registrationService.js,
  // this just applies it and stamps updatedAt.
  function updateEvent(id, patch) {
    setEvents((prev) => prev.map((e) => (e.id === id ? { ...e, ...patch, updatedAt: Date.now() } : e)))
  }

  // Only for organiser-created demo events nobody has booked yet — Manage
  // enforces that precondition before calling this (see cancelEvent for
  // the path used once real bookings exist).
  function removeEvent(id) {
    setEvents((prev) => prev.filter((e) => e.id !== id))
  }

  // Cancelling never deletes the record — Explore stops offering
  // registration for it, EventDetail explains it's cancelled, and any
  // booking tied to it can show the same notice via its eventId lookup.
  function cancelEvent(id) {
    updateEvent(id, { status: EVENT_STATUS.CANCELLED })
  }

  return (
    <EventsContext.Provider value={{ events, getEventById, addEvent, updateEvent, removeEvent, cancelEvent }}>
      {children}
    </EventsContext.Provider>
  )
}

export function useEvents() {
  const ctx = useContext(EventsContext)
  if (!ctx) throw new Error('useEvents must be used within an EventsProvider')
  return ctx
}
