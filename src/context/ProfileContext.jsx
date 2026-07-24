import { createContext, useContext, useEffect, useState } from 'react'

const STORAGE_KEY = 'vh-profile'

// Everything here is self-reported by whoever is using the demo — there's
// no account system, so "level" is a declared preference, not a verified
// rank, and nothing here is presented as a computed statistic.
const DEFAULT_PROFILE = {
  name: 'Russell',
  bio: '熱愛排球的運動愛好者，期待與大家一起享受排球的樂趣！',
  level: '高階',
  language: 'zh-Hant',
}

const ProfileContext = createContext(null)

export function ProfileProvider({ children }) {
  const [profile, setProfileState] = useState(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      return raw ? { ...DEFAULT_PROFILE, ...JSON.parse(raw) } : DEFAULT_PROFILE
    } catch {
      return DEFAULT_PROFILE
    }
  })

  useEffect(() => {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(profile)) } catch { /* storage unavailable */ }
  }, [profile])

  function updateProfile(patch) {
    setProfileState((p) => ({ ...p, ...patch }))
  }

  return (
    <ProfileContext.Provider value={{ profile, updateProfile }}>
      {children}
    </ProfileContext.Provider>
  )
}

export function useProfile() {
  const ctx = useContext(ProfileContext)
  if (!ctx) throw new Error('useProfile must be used within a ProfileProvider')
  return ctx
}
