import { describe, expect, it } from 'vitest'
import { getPositionShortageSummary, orderedPositionChoices } from './positionShortage'

describe('getPositionShortageSummary', () => {
  it('returns null when the event is full (no remaining slots) — never shows a shortage for a full event', () => {
    const event = { registeredCount: 10, capacity: 10, positionsNeeded: [{ position: 'setter', count: 1 }] }
    expect(getPositionShortageSummary(event)).toBeNull()
  })

  it('shows "不限位置，缺 N 人" when positionsNeeded is empty entirely', () => {
    const event = { registeredCount: 5, capacity: 8, positionsNeeded: [] }
    expect(getPositionShortageSummary(event).text).toBe('不限位置，缺 3 人')
  })

  it('shows "不限位置，缺 N 人" when positionsNeeded only has a universal entry', () => {
    const event = { registeredCount: 6, capacity: 10, positionsNeeded: [{ position: 'universal', count: 4 }] }
    expect(getPositionShortageSummary(event).text).toBe('不限位置，缺 4 人')
  })

  it('lists up to 2 specific roles by name and count', () => {
    const event = {
      registeredCount: 5, capacity: 8,
      positionsNeeded: [{ position: 'setter', count: 1 }, { position: 'middle', count: 1 }],
    }
    expect(getPositionShortageSummary(event).text).toBe('缺舉球 1・副攻 1')
  })

  it('adds an overflow note when there are more than 2 roles named', () => {
    const event = {
      registeredCount: 5, capacity: 10,
      positionsNeeded: [
        { position: 'setter', count: 1 }, { position: 'middle', count: 1 },
        { position: 'opposite', count: 1 }, { position: 'libero', count: 1 },
      ],
    }
    const result = getPositionShortageSummary(event)
    expect(result.text).toBe('缺舉球 1・副攻 1・另有 2 種位置')
  })

  it('folds a universal entry into the overflow count when specific roles are also present', () => {
    const event = {
      registeredCount: 5, capacity: 8,
      positionsNeeded: [{ position: 'setter', count: 1 }, { position: 'middle', count: 1 }, { position: 'universal', count: 1 }],
    }
    expect(getPositionShortageSummary(event).text).toBe('缺舉球 1・副攻 1・另有 1 種位置')
  })

  it('ignores a zero-count entry rather than listing a role that is not actually needed', () => {
    const event = {
      registeredCount: 5, capacity: 8,
      positionsNeeded: [{ position: 'setter', count: 1 }, { position: 'libero', count: 0 }],
    }
    expect(getPositionShortageSummary(event).text).toBe('缺舉球 1')
  })

  it('never produces a negative count even if positionsNeeded is inconsistent with remaining slots', () => {
    const event = {
      registeredCount: 9, capacity: 10, // only 1 remaining
      positionsNeeded: [{ position: 'setter', count: 5 }], // organiser data says 5, more than remaining
    }
    const result = getPositionShortageSummary(event)
    expect(result.text).not.toMatch(/-/)
    expect(result.text).toBe('缺舉球 5') // shows the organiser's stated need as-is; remaining-slots sanity is a separate, non-negative concern
  })
})

describe('orderedPositionChoices', () => {
  it('always leads with 不限位置 (universal) regardless of what is needed', () => {
    const choices = orderedPositionChoices([{ position: 'setter', count: 1 }])
    expect(choices[0].value).toBe('universal')
  })

  it('surfaces genuinely-needed positions right after universal, before the rest', () => {
    const choices = orderedPositionChoices([{ position: 'libero', count: 1 }])
    const values = choices.map((c) => c.value)
    expect(values[0]).toBe('universal')
    expect(values[1]).toBe('libero')
  })

  it('ignores a zero-count entry when deciding what counts as "needed"', () => {
    const choices = orderedPositionChoices([{ position: 'libero', count: 0 }])
    const values = choices.map((c) => c.value)
    // libero still appears (it's a valid position), just not promoted to 2nd place
    expect(values[1]).not.toBe('libero')
  })

  it('includes every position exactly once, with no duplicates or omissions', () => {
    const choices = orderedPositionChoices([{ position: 'setter', count: 2 }, { position: 'middle', count: 1 }])
    const values = choices.map((c) => c.value)
    expect(new Set(values).size).toBe(values.length)
    expect(values).toContain('outside')
    expect(values).toContain('opposite')
  })

  it('handles an empty/missing positionsNeeded without throwing', () => {
    expect(() => orderedPositionChoices(undefined)).not.toThrow()
    expect(orderedPositionChoices([])[0].value).toBe('universal')
  })
})
