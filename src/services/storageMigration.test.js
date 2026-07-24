import { beforeEach, describe, expect, it } from 'vitest'
import { __testables, CURRENT_STORAGE_VERSION, runStorageMigrations } from './storageMigration'
import { readStorage, STORAGE_KEYS, writeStorage } from './storage'
import { CURRENT_USER_ID } from '../constants/taxonomy'

const { migrateEventRecord, migrateBookingRecord } = __testables

function makeMemoryStorage() {
  const store = new Map()
  return {
    getItem: (key) => (store.has(key) ? store.get(key) : null),
    setItem: (key, value) => { store.set(key, String(value)) },
    removeItem: (key) => { store.delete(key) },
    clear: () => store.clear(),
  }
}

beforeEach(() => {
  globalThis.localStorage = makeMemoryStorage()
})

describe('migrateEventRecord', () => {
  it('maps every old field name to its new schema equivalent', () => {
    const old = {
      id: 'e1', title: '週末賽', section: 'featured', type: '室內排球', level: '中階', gender: '不限',
      city: '台北', loc: '台北市立體育館', date: '2025-01-01', time: '19:00', endTime: '21:00',
      capacity: 20, registered: 18, price: 280, org: '台北排球俱樂部', phone: '0912-345-678', ownedByMe: true,
    }
    const migrated = migrateEventRecord(old)
    expect(migrated.registeredCount).toBe(18)
    expect(migrated.venueName).toBe('台北市立體育館')
    expect(migrated.organizerName).toBe('台北排球俱樂部')
    expect(migrated.organizerContact).toBe('0912-345-678')
    expect(migrated.startTime).toBe('19:00')
    expect(migrated.ownerId).toBe(CURRENT_USER_ID)
    expect(migrated.isFeatured).toBe(true)
    expect(migrated.type).toBe('indoor')
    expect(migrated.level).toBe('intermediate')
    expect(migrated.gender).toBe('open')
    expect(migrated.city).toBe('taipei')
  })

  it('drops an invalid record rather than throwing', () => {
    expect(migrateEventRecord(null)).toBeNull()
    expect(migrateEventRecord('not an object')).toBeNull()
  })

  it('generates a fallback id when the old record has none', () => {
    const migrated = migrateEventRecord({ title: '無 id 活動' })
    expect(typeof migrated.id).toBe('string')
    expect(migrated.id.length).toBeGreaterThan(0)
  })
})

describe('migrateBookingRecord', () => {
  it('keeps only the new booking fields and drops the duplicated event snapshot', () => {
    const old = {
      id: 'b1', eventId: 'e1', status: 'confirmed', title: '週末賽', loc: '台北市立體育館',
      date: '2025-01-01', time: '19:00–21:00', org: '台北排球俱樂部', phone: '0912-345-678', price: 'NT$280',
      registrant: { name: '王小明', phone: '0912-345-678', mode: 'individual' },
    }
    const migrated = migrateBookingRecord(old)
    expect(migrated).toEqual({
      id: 'b1', eventId: 'e1', status: 'confirmed', participantCount: 1,
      registrant: old.registrant, createdAt: migrated.createdAt, updatedAt: migrated.updatedAt, cancelReason: undefined,
    })
    expect(migrated.title).toBeUndefined()
    expect(migrated.loc).toBeUndefined()
  })

  it('drops legacy rows with eventId: null — nothing honest to migrate them into', () => {
    expect(migrateBookingRecord({ id: 'b2', eventId: null, title: '孤兒紀錄' })).toBeNull()
  })
})

describe('runStorageMigrations', () => {
  it('migrates events + bookings once and bumps the stored version', () => {
    writeStorage(STORAGE_KEYS.events, [{ id: 'e1', title: '舊活動', registered: 3, capacity: 10, ownedByMe: false }])
    writeStorage(STORAGE_KEYS.bookings, [{ id: 'b1', eventId: 'e1', status: 'pending' }, { id: 'b2', eventId: null }])

    runStorageMigrations()

    const events = readStorage(STORAGE_KEYS.events, [])
    expect(events[0].registeredCount).toBe(3)
    const bookings = readStorage(STORAGE_KEYS.bookings, [])
    expect(bookings).toHaveLength(1)
    expect(bookings[0].eventId).toBe('e1')
    expect(readStorage(STORAGE_KEYS.version, 0)).toBe(CURRENT_STORAGE_VERSION)
  })

  it('is a no-op once already at the current version', () => {
    writeStorage(STORAGE_KEYS.version, CURRENT_STORAGE_VERSION)
    writeStorage(STORAGE_KEYS.events, [{ id: 'e1', title: '不應被更動' }])
    runStorageMigrations()
    const events = readStorage(STORAGE_KEYS.events, [])
    expect(events[0].title).toBe('不應被更動')
    expect(events[0]).not.toHaveProperty('registeredCount')
  })

  it('never throws on corrupted JSON — readStorage already isolates it, so migration just sees "nothing to migrate" and the app falls back to seed data', () => {
    globalThis.localStorage.setItem(STORAGE_KEYS.events, '{not valid json')
    expect(() => runStorageMigrations()).not.toThrow()
    expect(readStorage(STORAGE_KEYS.version, 0)).toBe(CURRENT_STORAGE_VERSION)
    // readStorage on the still-corrupted key keeps returning the fallback,
    // which is exactly what EventsContext's own initializer uses too.
    expect(readStorage(STORAGE_KEYS.events, 'fallback-marker')).toBe('fallback-marker')
  })
})
