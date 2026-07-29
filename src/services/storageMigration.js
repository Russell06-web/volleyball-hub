// Versioned, one-shot migration for the keys whose shape has changed
// across iterations of this prototype (vh-events, vh-bookings). Runs once
// at app boot (see main.jsx) before any Context reads localStorage.
//
// Anything that can't be safely converted is dropped rather than left in
// a half-migrated shape — EventsContext/BookingsContext already fall back
// to seed data / an empty array when their key is missing, so removing a
// key here is a safe "give up cleanly" path, never a white screen.
import { readStorage, removeStorage, writeStorage, STORAGE_KEYS } from './storage'
import { CURRENT_USER_ID, EVENT_STATUS } from '../constants/taxonomy'
import {
  COURT_SURFACE_UNSPECIFIED, COURT_SURFACES, EQUIPMENT_OPTIONS, NET_HEIGHT_UNSPECIFIED, NET_HEIGHTS, PLAY_STYLES,
  POSITIONS, VOLLEYBALL_FORMATS,
} from '../constants/volleyballTaxonomy'
import { createId } from '../utils/id'

// v4 adds two brand-new keys — vh-compare and vh-saved-searches. Neither
// has a legacy shape to convert *from* (they didn't exist before), so
// there's no transform step for them here; CompareContext/
// SavedSearchesContext each validate their own key on every load via
// utils/compareIds.js / utils/savedSearches.js, which is stricter than a
// one-time migration would be (it defends against corruption on every
// read, not just the first one after an upgrade). The version bump alone
// is what keeps this file honest about what "current" means.
export const CURRENT_STORAGE_VERSION = 4

const TYPE_LABEL_TO_VALUE = { '室內排球': 'indoor', '沙灘排球': 'beach', '草地排球': 'grass', '親子・體驗': 'family' }
const LEVEL_LABEL_TO_VALUE = { '不限': 'open', '初階': 'beginner', '中階': 'intermediate', '高階': 'advanced' }
const GENDER_LABEL_TO_VALUE = { '不限': 'open', '男生': 'male', '女生': 'female', '混合': 'mixed' }
const CITY_LABEL_TO_VALUE = { '台北': 'taipei', '新北': 'newTaipei', '桃園': 'taoyuan' }

const VALID_TYPES = new Set(['indoor', 'beach', 'grass', 'family'])
const VALID_LEVELS = new Set(['open', 'beginner', 'intermediate', 'advanced'])
const VALID_GENDERS = new Set(['open', 'male', 'female', 'mixed'])
const VALID_CITIES = new Set(['taipei', 'newTaipei', 'taoyuan'])
const VALID_EVENT_STATUSES = new Set(Object.values(EVENT_STATUS))
const VALID_BOOKING_STATUSES = new Set(['pending', 'confirmed', 'waitlist', 'completed', 'cancelled'])
const VALID_FORMATS = new Set(VOLLEYBALL_FORMATS.map((f) => f.value))
const VALID_NET_HEIGHTS = new Set(NET_HEIGHTS.map((n) => n.value))
const VALID_COURT_SURFACES = new Set(COURT_SURFACES.map((s) => s.value))
const VALID_POSITIONS = new Set(POSITIONS.map((p) => p.value))
const VALID_EQUIPMENT = new Set(EQUIPMENT_OPTIONS.map((e) => e.value))
const VALID_PLAY_STYLES = new Set(PLAY_STYLES.map((p) => p.value))
const PLAY_STYLE_LABEL_TO_VALUE = { '競技對抗': 'competitive', '休閒臨打': 'casual', '沙灘競技': 'beachCompetitive', '休閒體驗': 'experience' }

function numberOr(value, fallback) {
  const n = Number(value)
  return Number.isFinite(n) ? n : fallback
}

// Pre-Phase-2 events never had any volleyball-specific fields at all, so
// there's nothing real to migrate — this is a one-time *demo-data*
// conversion that guesses a plausible default from the event's general
// `type`, purely so old seed/organiser data doesn't show up with every
// volleyball field blank. It is never presented as real organiser input.
function inferVolleyballFormat(type) {
  if (type === 'beach') return 'beachTwoPlayer'
  if (type === 'family') return 'recreational'
  return 'sixPlayer'
}
function inferCourtSurface(type) {
  if (type === 'beach') return 'sand'
  if (type === 'grass') return 'grass'
  return COURT_SURFACE_UNSPECIFIED
}

function migratePositionsNeeded(raw) {
  if (!Array.isArray(raw)) return []
  return raw
    .filter((p) => p && typeof p === 'object' && VALID_POSITIONS.has(p.position))
    .map((p) => ({ position: p.position, count: Math.max(0, Math.floor(numberOr(p.count, 0))) }))
}

function migrateEventRecord(raw) {
  if (!raw || typeof raw !== 'object') return null

  const id = typeof raw.id === 'string' && raw.id.trim() ? raw.id : createId('e-')
  const capacity = Math.max(0, numberOr(raw.capacity, 0))
  const registeredCount = Math.min(
    Math.max(0, numberOr(raw.registeredCount, numberOr(raw.registered, 0))),
    capacity || Number.MAX_SAFE_INTEGER,
  )
  const price = Math.max(0, numberOr(raw.price, 0))
  const type = VALID_TYPES.has(raw.type) ? raw.type : (TYPE_LABEL_TO_VALUE[raw.type] || 'indoor')

  return {
    id,
    ownerId: raw.ownerId !== undefined ? raw.ownerId : (raw.ownedByMe ? CURRENT_USER_ID : null),
    title: typeof raw.title === 'string' && raw.title.trim() ? raw.title : '未命名活動',
    description: raw.description || '',
    rules: raw.rules || '',
    type,
    level: VALID_LEVELS.has(raw.level) ? raw.level : (LEVEL_LABEL_TO_VALUE[raw.level] || 'open'),
    gender: VALID_GENDERS.has(raw.gender) ? raw.gender : (GENDER_LABEL_TO_VALUE[raw.gender] || 'open'),
    city: VALID_CITIES.has(raw.city) ? raw.city : (CITY_LABEL_TO_VALUE[raw.city] || 'taipei'),
    venueName: raw.venueName || raw.loc || '',
    address: raw.address || raw.loc || '',
    date: raw.date || '',
    startTime: raw.startTime || raw.time || '',
    endTime: raw.endTime || '',
    timezone: raw.timezone || 'Asia/Taipei',
    capacity,
    registeredCount,
    waitlistCount: Math.max(0, numberOr(raw.waitlistCount, 0)),
    price,
    paymentMethod: raw.paymentMethod || (price === 0 ? '無需付款' : '現場付款'),
    organizerName: raw.organizerName || raw.org || '',
    organizerContact: raw.organizerContact || raw.phone || '',
    isFeatured: raw.isFeatured !== undefined ? !!raw.isFeatured : raw.section === 'featured',
    isUrgent: raw.isUrgent !== undefined ? !!raw.isUrgent : raw.section === 'urgent',
    hasInsurance: !!raw.hasInsurance,
    hasCoach: !!raw.hasCoach,
    playStyle: VALID_PLAY_STYLES.has(raw.playStyle) ? raw.playStyle : (PLAY_STYLE_LABEL_TO_VALUE[raw.playStyle] || ''),
    features: Array.isArray(raw.features) ? raw.features : [],
    status: VALID_EVENT_STATUSES.has(raw.status) ? raw.status : EVENT_STATUS.PUBLISHED,
    // Volleyball-specific fields (added in storage v3) — see the
    // infer* helpers above for what happens when an old record has none.
    volleyballFormat: VALID_FORMATS.has(raw.volleyballFormat) ? raw.volleyballFormat : inferVolleyballFormat(type),
    netHeight: VALID_NET_HEIGHTS.has(raw.netHeight) ? raw.netHeight : NET_HEIGHT_UNSPECIFIED,
    courtSurface: VALID_COURT_SURFACES.has(raw.courtSurface) ? raw.courtSurface : inferCourtSurface(type),
    rotationRequired: !!raw.rotationRequired,
    liberoAllowed: !!raw.liberoAllowed,
    soloJoinAllowed: raw.soloJoinAllowed !== undefined ? !!raw.soloJoinAllowed : true,
    equipmentProvided: Array.isArray(raw.equipmentProvided) ? raw.equipmentProvided.filter((v) => VALID_EQUIPMENT.has(v)) : [],
    positionsNeeded: migratePositionsNeeded(raw.positionsNeeded),
    skillNotes: typeof raw.skillNotes === 'string' ? raw.skillNotes : '',
    createdAt: raw.createdAt || Date.now(),
    updatedAt: raw.updatedAt || Date.now(),
  }
}

function migrateBookingRecord(raw) {
  // Old seed rows with eventId: null can't resolve to any real event
  // under the new eventId-only booking model — there's nothing honest to
  // migrate them into, so they're dropped rather than kept as orphans.
  if (!raw || typeof raw !== 'object' || !raw.eventId) return null

  const rawRegistrant = raw.registrant && typeof raw.registrant === 'object'
    ? raw.registrant
    : { name: raw.registrantName || '', phone: raw.phone || '', mode: 'individual' }
  const registrant = {
    ...rawRegistrant,
    preferredPosition: VALID_POSITIONS.has(rawRegistrant.preferredPosition) ? rawRegistrant.preferredPosition : null,
  }

  const participantCount = Math.max(
    1,
    numberOr(raw.participantCount, registrant.mode === 'team' ? numberOr(registrant.teamSize, 1) : 1),
  )

  return {
    id: typeof raw.id === 'string' && raw.id.trim() ? raw.id : createId('b-'),
    eventId: raw.eventId,
    status: VALID_BOOKING_STATUSES.has(raw.status) ? raw.status : 'pending',
    participantCount,
    registrant,
    createdAt: raw.createdAt || Date.now(),
    updatedAt: raw.updatedAt || raw.createdAt || Date.now(),
    cancelReason: raw.cancelReason,
  }
}

export function runStorageMigrations() {
  const version = readStorage(STORAGE_KEYS.version, 0)
  if (version >= CURRENT_STORAGE_VERSION) return

  try {
    const rawEvents = readStorage(STORAGE_KEYS.events, null)
    if (Array.isArray(rawEvents)) {
      const migrated = rawEvents.map(migrateEventRecord).filter(Boolean)
      if (migrated.length) writeStorage(STORAGE_KEYS.events, migrated)
      else removeStorage(STORAGE_KEYS.events)
    }

    const rawBookings = readStorage(STORAGE_KEYS.bookings, null)
    if (Array.isArray(rawBookings)) {
      const migrated = rawBookings.map(migrateBookingRecord).filter(Boolean)
      writeStorage(STORAGE_KEYS.bookings, migrated)
    }

    // Favorites/history/profile/preferences carry no schema changes in
    // this version bump — untouched, so nothing here can lose them.

    writeStorage(STORAGE_KEYS.version, CURRENT_STORAGE_VERSION)
  } catch {
    // Whatever was in there couldn't be read/converted safely — wipe the
    // two mutable-schema keys and let the app fall back to seed data
    // rather than crash-looping on a broken migration. Favorites/
    // bookings/profile are untouched by this catch block on purpose.
    removeStorage(STORAGE_KEYS.events)
    removeStorage(STORAGE_KEYS.bookings)
    writeStorage(STORAGE_KEYS.version, CURRENT_STORAGE_VERSION)
  }
}

export const __testables = { migrateEventRecord, migrateBookingRecord }
