import { describe, expect, it } from 'vitest'
import { futureDate, futureDateWithLabel } from './date'

describe('futureDate', () => {
  it('returns a YYYY-MM-DD string that is actually in the future', () => {
    const today = new Date(); today.setHours(0, 0, 0, 0)
    const result = new Date(futureDate(5))
    expect(result.getTime()).toBeGreaterThan(today.getTime())
  })

  it('returns today for an offset of 0', () => {
    const today = new Date()
    const expected = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`
    expect(futureDate(0)).toBe(expected)
  })
})

describe('futureDateWithLabel', () => {
  it('returns a date string plus a matching weekday and short label', () => {
    const { date, dow, md } = futureDateWithLabel(3)
    expect(date).toMatch(/^\d{4}-\d{2}-\d{2}$/)
    expect(dow).toMatch(/^週[日一二三四五六]$/)
    expect(md).toMatch(/^\d{2}\/\d{2}$/)
  })
})
