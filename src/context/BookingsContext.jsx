import { createContext, useContext, useEffect, useState } from 'react'

const STORAGE_KEY = 'vh-bookings'

// Seed data so "我的報名" isn't empty on a first visit — mirrors the
// original static-site demo content. Anything a visitor registers for
// during this session is added on top of this and persisted locally
// (there's no backend, so localStorage stands in for it).
const SEED = [
  { id: 'b1', eventId: 'e2', title: '高手對決賽', status: 'pending', level: '高階', loc: '新北運動中心', date: '2025-12-16', time: '20:00–23:00', org: '新北排球聯盟', phone: '0922-456-789', price: 'NT$350' },
  { id: 'b2', eventId: null, title: '海灘排球日', status: 'pending', level: '高階', loc: '淡水沙灘', date: '2025-12-21', time: '10:00–16:00', org: '陽光排球會', phone: '0955-789-012', price: 'NT$200' },
  { id: 'b3', eventId: 'e1', title: '週末排球大戰', status: 'confirmed', level: '中階', loc: '台北市立體育館', date: '2025-12-12', time: '19:00–21:00', org: '台北排球俱樂部', phone: '0912-345-678', price: 'NT$280' },
  { id: 'b4', eventId: null, title: '排球新手體驗', status: 'completed', level: '初階', loc: '台北體育館', date: '2025-11-30', time: '14:00–17:00', org: '新手排球教室', phone: '0933-222-111', price: '免費', free: true },
]

const BookingsContext = createContext(null)

export function BookingsProvider({ children }) {
  const [bookings, setBookings] = useState(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      return raw ? JSON.parse(raw) : SEED
    } catch {
      return SEED
    }
  })

  useEffect(() => {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(bookings)) } catch { /* storage unavailable */ }
  }, [bookings])

  function addBooking(booking) {
    const id = 'b' + Date.now()
    setBookings((prev) => [{ id, createdAt: Date.now(), ...booking }, ...prev])
    return id
  }

  function cancelBooking(id, reason) {
    setBookings((prev) => prev.map((b) => (b.id === id ? { ...b, status: 'cancelled', cancelReason: reason } : b)))
  }

  function markReviewed(id) {
    setBookings((prev) => prev.map((b) => (b.id === id ? { ...b, reviewed: true } : b)))
  }

  return (
    <BookingsContext.Provider value={{ bookings, addBooking, cancelBooking, markReviewed }}>
      {children}
    </BookingsContext.Provider>
  )
}

export function useBookings() {
  const ctx = useContext(BookingsContext)
  if (!ctx) throw new Error('useBookings must be used within a BookingsProvider')
  return ctx
}
