import { describe, expect, it } from 'vitest'
import { matchesSearch, normalizeSearchQuery } from './search'

const event = {
  title: '週末排球大戰',
  type: 'indoor',
  level: 'intermediate',
  venueName: '台北市立體育館',
  city: 'taipei',
  address: '台北市松山區南京東路四段10號',
  organizerName: 'Northside Volleyball Club',
  playStyle: '競技對抗',
}

describe('normalizeSearchQuery', () => {
  it('trims, lowercases, and collapses internal whitespace', () => {
    expect(normalizeSearchQuery('  Taipei   Cup ')).toBe('taipei cup')
  })
})

describe('matchesSearch', () => {
  it('matches an empty query against anything', () => {
    expect(matchesSearch(event, '')).toBe(true)
    expect(matchesSearch(event, '   ')).toBe(true)
  })

  it('matches by title', () => {
    expect(matchesSearch(event, '排球大戰')).toBe(true)
  })

  it('matches by venue name', () => {
    expect(matchesSearch(event, '市立體育館')).toBe(true)
  })

  it('matches by city label, not the internal enum value', () => {
    expect(matchesSearch(event, '台北')).toBe(true)
    expect(matchesSearch(event, 'taipei')).toBe(false)
  })

  it('matches by organiser name, case-insensitively', () => {
    expect(matchesSearch(event, 'northside volleyball')).toBe(true)
    expect(matchesSearch(event, 'NORTHSIDE VOLLEYBALL')).toBe(true)
  })

  it('does not match unrelated text', () => {
    expect(matchesSearch(event, '沙灘排球')).toBe(false)
  })

  it('requires every keyword to match (AND), even when they are not adjacent in the source text', () => {
    // "台北" is only in venue/address/city; "中階" is only in level — a
    // naive substring check on the raw query would fail this even though
    // the event genuinely satisfies both keywords.
    expect(matchesSearch(event, '台北 中階')).toBe(true)
  })

  it('rejects when only some of several keywords match', () => {
    expect(matchesSearch(event, '台北 高階')).toBe(false)
  })

  it('is insensitive to keyword order and extra whitespace between them', () => {
    expect(matchesSearch(event, '中階   台北')).toBe(true)
  })
})
