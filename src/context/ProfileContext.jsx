import { createContext, useContext, useEffect, useState } from 'react'
import { readStorage, writeStorage, STORAGE_KEYS } from '../services/storage'

// Everything here is self-reported by whoever is using the demo — there's
// no account system, so "level" is a declared preference, not a verified
// rank, and nothing here is presented as a computed statistic.
//
// `language` stays in the schema (so old localStorage data migrates
// cleanly) but there's no public language picker anymore — see
// README.md's Future Roadmap for why: without a real i18n dictionary, a
// language switch that doesn't translate anything is actively misleading.
const DEFAULT_PROFILE = {
  name: 'Russell',
  bio: '熱愛排球的運動愛好者，期待與大家一起享受排球的樂趣！',
  level: '高階',
  language: 'zh-Hant',
  // Quick Join prefill data — deliberately starts empty/off rather than
  // seeded with a fake phone number, since this is exactly the kind of
  // field the Profile screen warns not to fill with anything real.
  phone: '',
  defaultPosition: 'universal',
  preferredLevel: 'all',
  preferredCity: 'all',
  quickJoinEnabled: false,
}

const ProfileContext = createContext(null)

export function ProfileProvider({ children }) {
  const [profile, setProfileState] = useState(() => ({
    ...DEFAULT_PROFILE,
    ...readStorage(STORAGE_KEYS.profile, {}),
  }))

  useEffect(() => {
    writeStorage(STORAGE_KEYS.profile, profile)
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
