import { describe, expect, it } from 'vitest'
import { getEventInformationQuality, isImportantInfoField } from './informationQuality'

function fullEvent(overrides = {}) {
  return {
    title: '週末排球場',
    description: '一場歡樂的排球活動',
    rules: '請提前 10 分鐘到場，取消需於前一天告知',
    venueName: '台北體育館',
    address: '台北市信義區松壽路 2 號',
    date: '2026-08-01',
    startTime: '19:00',
    endTime: '21:00',
    level: 'intermediate',
    gender: 'open',
    organizerName: '排球社',
    organizerContact: '0900-000-001',
    volleyballFormat: 'sixPlayer',
    netHeight: 'men',
    courtSurface: 'wood',
    positionsNeeded: [],
    skillNotes: '需有基本傳接球經驗',
    ...overrides,
  }
}

describe('getEventInformationQuality', () => {
  it('reports complete when every field is filled', () => {
    const result = getEventInformationQuality(fullEvent())
    expect(result.state).toBe('complete')
    expect(result.missingFields).toEqual([])
  })

  it('reports needsInfo when an important field (address) is missing', () => {
    const result = getEventInformationQuality(fullEvent({ address: '' }))
    expect(result.state).toBe('needsInfo')
    expect(result.missingFields).toContain('address')
  })

  it('reports needsInfo when organizerContact is missing', () => {
    const result = getEventInformationQuality(fullEvent({ organizerContact: '' }))
    expect(result.state).toBe('needsInfo')
  })

  it('reports partial (not needsInfo) when only a non-essential field is missing', () => {
    const result = getEventInformationQuality(fullEvent({ skillNotes: '' }))
    expect(result.state).toBe('partial')
    expect(result.missingFields).toEqual(['skillNotes'])
  })

  it('treats an unspecified netHeight/courtSurface as missing', () => {
    const result = getEventInformationQuality(fullEvent({ netHeight: 'unspecified', courtSurface: 'unspecified' }))
    expect(result.missingFields).toEqual(expect.arrayContaining(['netHeight', 'courtSurface']))
    expect(result.state).toBe('partial')
  })

  it('never treats an empty positionsNeeded array as missing (it is a valid "no specific position" declaration)', () => {
    const result = getEventInformationQuality(fullEvent({ positionsNeeded: [] }))
    expect(result.missingFields).not.toContain('positionsNeeded')
  })

  it('is defensive against a null/undefined event', () => {
    expect(getEventInformationQuality(null).state).toBe('complete')
    expect(getEventInformationQuality(undefined).missingFields).toEqual([])
  })

  it('never returns a numeric score, only a fixed state/label', () => {
    const result = getEventInformationQuality(fullEvent({ skillNotes: '' }))
    expect(typeof result.state).toBe('string')
    expect(typeof result.label).toBe('string')
    expect(result).not.toHaveProperty('score')
    expect(result).not.toHaveProperty('percentage')
  })
})

describe('isImportantInfoField', () => {
  it('flags address/startTime/endTime/level/organizerContact as important', () => {
    expect(isImportantInfoField('address')).toBe(true)
    expect(isImportantInfoField('startTime')).toBe(true)
    expect(isImportantInfoField('endTime')).toBe(true)
    expect(isImportantInfoField('level')).toBe(true)
    expect(isImportantInfoField('organizerContact')).toBe(true)
  })

  it('does not flag equipment/skillNotes as important', () => {
    expect(isImportantInfoField('skillNotes')).toBe(false)
    expect(isImportantInfoField('positionsNeeded')).toBe(false)
  })
})
