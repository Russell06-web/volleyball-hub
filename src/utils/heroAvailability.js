import { EVENT_STATUS, getEventStatus } from './eventStatus'

// The Explore Hero used to just say `${visibleEvents.length} 場開放中的活動，
// 隨時可以加入` — but visibleEvents already mixes two very different
// situations (still-registrable vs already-full-but-waitlistable), so that
// single number and "隨時可以加入" copy overstated what a visitor could
// actually do. This recomputes status itself (rather than trusting a
// caller's own pre-filtered list) so cancelled/completed/expired/draft
// events are excluded here too, not just wherever the caller happened to
// filter from.
export function getHeroAvailabilityCounts(events, now = new Date()) {
  let registrableCount = 0
  let waitlistCount = 0
  ;(events || []).forEach((event) => {
    const status = getEventStatus(event, now)
    if (status === EVENT_STATUS.PUBLISHED) registrableCount += 1
    else if (status === EVENT_STATUS.FULL) waitlistCount += 1
  })
  return { registrableCount, waitlistCount }
}

// Four honest states, never "隨時可以加入" / "即時更新" / "即時名額" /
// "保證有位置" — this is a snapshot count of localStorage data, not a
// live-inventory claim.
export function getHeroAvailabilityText({ registrableCount, waitlistCount }) {
  if (registrableCount > 0 && waitlistCount > 0) return `${registrableCount} 場報名中・${waitlistCount} 場開放候補`
  if (registrableCount > 0) return `${registrableCount} 場活動開放報名`
  if (waitlistCount > 0) return `${waitlistCount} 場活動開放候補`
  return '目前沒有開放中的活動'
}
