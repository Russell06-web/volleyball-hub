import { createContext, useCallback, useContext, useRef, useState } from 'react'
import { createId } from '../utils/id'

// One consistent, non-blocking feedback mechanism for the whole app —
// favoriting, registering, waitlisting, cancelling, creating/cancelling
// an event, resetting demo data, and share-API failures all go through
// this instead of alert()/window.confirm(), which block the whole page
// and can't be styled or queued.
const ToastContext = createContext(null)

const AUTO_DISMISS_MS = 3200

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([])
  const timers = useRef(new Map())

  const dismissToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id))
    const timer = timers.current.get(id)
    if (timer) { clearTimeout(timer); timers.current.delete(id) }
  }, [])

  const showToast = useCallback((message, tone = 'default') => {
    const id = createId('toast-')
    setToasts((prev) => [...prev, { id, message, tone }])
    const timer = setTimeout(() => dismissToast(id), AUTO_DISMISS_MS)
    timers.current.set(id, timer)
    return id
  }, [dismissToast])

  return (
    <ToastContext.Provider value={{ toasts, showToast, dismissToast }}>
      {children}
    </ToastContext.Provider>
  )
}

export function useToast() {
  const ctx = useContext(ToastContext)
  if (!ctx) throw new Error('useToast must be used within a ToastProvider')
  return ctx
}
