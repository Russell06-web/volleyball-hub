import { createContext, useContext, useEffect, useState } from 'react'

const STORAGE_KEY = 'vh-favorites'

const FavoritesContext = createContext(null)

export function FavoritesProvider({ children }) {
  const [favorites, setFavorites] = useState(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      return raw ? JSON.parse(raw) : []
    } catch {
      return []
    }
  })

  useEffect(() => {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(favorites)) } catch { /* storage unavailable */ }
  }, [favorites])

  function isFavorite(eventId) {
    return favorites.includes(eventId)
  }

  function toggleFavorite(eventId) {
    setFavorites((prev) => (prev.includes(eventId) ? prev.filter((id) => id !== eventId) : [eventId, ...prev]))
  }

  return (
    <FavoritesContext.Provider value={{ favorites, isFavorite, toggleFavorite }}>
      {children}
    </FavoritesContext.Provider>
  )
}

export function useFavorites() {
  const ctx = useContext(FavoritesContext)
  if (!ctx) throw new Error('useFavorites must be used within a FavoritesProvider')
  return ctx
}
