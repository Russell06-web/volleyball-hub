// Versioned, one-shot migration for the two keys whose shape has changed
// across iterations of this prototype (vh-events, vh-bookings). Runs once
// at app boot (see main.jsx) before any Context reads localStorage.
//
// Anything that can't be safely converted is dropped rather than left in
// a half-migrated shape — EventsContext/BookingsContext already fall back
// to seed data / an empty array when their key is missing, so removing a
// key here is a safe "give up cleanly" path, never a white screen.
import { readStorage, removeStorage, writeStorage, STORAGE_KEYS } from './storage'
import { CURRENT_USER_ID, EVENT_STATUS } from '../constants/taxonomy'
import { createId } from '../utils/id'

export const CURRENT_STORAGE_VERSION = 2

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

function numberOr(value, fallback) {
  const n = Number(value)
  return Number.isFinite(n) ? n : fallback
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

  return {
    id,
    ownerId: raw.ownerId !== undefined ? raw.ownerId : (raw.ownedByMe ? CURRENT_USER_ID : null),
    title: typeof raw.title === 'string' && raw.title.trim() ? raw.title : '未命名活動',
    description: raw.description || '',
    rules: raw.rules || '',
    type: VALID_TYPES.has(raw.type) ? raw.type : (TYPE_LABEL_TO_VALUE[raw.type] || 'indoor'),
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
    playStyle: raw.playStyle || '',
    features: Array.isArray(raw.features) ? raw.features : [],
    status: VALID_EVENT_STATUSES.has(raw.status) ? raw.status : EVENT_STATUS.PUBLISHED,
    createdAt: raw.createdAt || Date.now(),
    updatedAt: raw.updatedAt || Date.now(),
  }
}

function migrateBookingRecord(raw) {
  // Old seed rows with eventId: null can't resolve to any real event
  // under the new eventId-only booking model — there's nothing honest to
  // migrate them into, so they're dropped rather than kept as orphans.
  if (!raw || typeof raw !== 'object' || !raw.eventId) return null

  const registrant = raw.registrant && typeof raw.registrant === 'object'
    ? raw.registrant
    : { name: raw.registrantName || '', phone: raw.phone || '', mode: 'individual' }

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

    writeStorage(STORAGE_KEYS.version, CURRENT_STORAGE_VERSION)
  } catch {
    // Whatever was in there couldn't be read/converted safely — wipe the
    // two mutable-schema keys and let the app fall back to seed data
    // rather than crash-looping on a broken migration.
    removeStorage(STORAGE_KEYS.events)
    removeStorage(STORAGE_KEYS.bookings)
    writeStorage(STORAGE_KEYS.version, CURRENT_STORAGE_VERSION)
  }
}

export const __testables = { migrateEventRecord, migrateBookingRecord }
