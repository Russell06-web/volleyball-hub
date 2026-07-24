import { createContext, useContext, useEffect, useState } from 'react'
import { readStorage, writeStorage, STORAGE_KEYS } from '../services/storage'
import { createId } from '../utils/id'

// A booking only ever stores its own facts (status, headcount, who
// registered, when) plus the eventId it points at — never a copy of the
// event's title/date/price/etc. Every page reads the live event through
// EventsContext via that eventId, so an edited or cancelled event is
// reflected everywhere immediately instead of going stale inside old
// booking rows.
const BookingsContext = createContext(null)

export function BookingsProvider({ children }) {
  const [bookings, setBookings] = useState(() => readStorage(STORAGE_KEYS.bookings, []))

  useEffect(() => {
    writeStorage(STORAGE_KEYS.bookings, bookings)
  }, [bookings])

  function addBooking(booking) {
    const id = createId('b-')
    const now = Date.now()
    setBookings((prev) => [{ id, createdAt: now, updatedAt: now, ...booking }, ...prev])
    return id
  }

  function updateBooking(id, patch) {
    setBookings((prev) => prev.map((b) => (b.id === id ? { ...b, ...patch, updatedAt: Date.now() } : b)))
  }

  // Idempotent on purpose — a cancelled booking can't be cancelled again
  // (no double-freeing of a slot that was already returned).
  function cancelBooking(id, reason) {
    setBookings((prev) => prev.map((b) => (
      b.id === id && b.status !== 'cancelled'
        ? { ...b, status: 'cancelled', cancelReason: reason, updatedAt: Date.now() }
        : b
    )))
  }

  function markReviewed(id) {
    updateBooking(id, { reviewed: true })
  }

  function getBookingByEventId(eventId) {
    return bookings.find((b) => b.eventId === eventId && (b.status === 'pending' || b.status === 'confirmed' || b.status === 'waitlist'))
  }

  function hasActiveBooking(eventId) {
    return bookings.some((b) => b.eventId === eventId && (b.status === 'pending' || b.status === 'confirmed'))
  }

  function hasWaitlistBooking(eventId) {
    return bookings.some((b) => b.eventId === eventId && b.status === 'waitlist')
  }

  return (
    <BookingsContext.Provider
      value={{
        bookings,
        addBooking,
        updateBooking,
        cancelBooking,
        markReviewed,
        getBookingByEventId,
        hasActiveBooking,
        hasWaitlistBooking,
      }}
    >
      {children}
    </BookingsContext.Provider>
  )
}

export function useBookings() {
  const ctx = useContext(BookingsContext)
  if (!ctx) throw new Error('useBookings must be used within a BookingsProvider')
  return ctx
}
