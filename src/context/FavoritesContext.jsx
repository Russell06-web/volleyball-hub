import { createContext, useContext, useEffect, useState } from 'react'
import { readStorage, writeStorage, STORAGE_KEYS } from '../services/storage'

const FavoritesContext = createContext(null)

export function FavoritesProvider({ children }) {
  const [favorites, setFavorites] = useState(() => readStorage(STORAGE_KEYS.favorites, []))

  useEffect(() => {
    writeStorage(STORAGE_KEYS.favorites, favorites)
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
