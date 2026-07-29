import { isValidTaiwanMobile, normalizeName } from './bookingValidation'

// Quick Join only ever appears once there's real, usable data behind it —
// a name and a real-looking phone number to prefill. quickJoinEnabled is
// a separate opt-in on top of that (see ProfileContext): having valid
// data doesn't mean the feature turns itself on.
export function isQuickJoinReady(profile) {
  if (!profile || !profile.quickJoinEnabled) return false
  return !!normalizeName(profile.name) && isValidTaiwanMobile(profile.phone)
}
