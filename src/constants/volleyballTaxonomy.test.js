import { describe, expect, it } from 'vitest'
import {
  getCourtSurfaceLabel, getEquipmentLabel, getNetHeightLabel, getPositionLabel, getVolleyballFormatLabel,
} from './volleyballTaxonomy'

describe('volleyball taxonomy label getters', () => {
  it('never returns the raw enum value for a known option', () => {
    expect(getVolleyballFormatLabel('sixPlayer')).toBe('六人制')
    expect(getNetHeightLabel('mixed')).toBe('混合網')
    expect(getCourtSurfaceLabel('sand')).toBe('沙地')
    expect(getPositionLabel('setter')).toBe('舉球')
    expect(getEquipmentLabel('volleyball')).toBe('球')
  })

  it('renders "unspecified" net height / court surface as "未說明", not the raw enum', () => {
    expect(getNetHeightLabel('unspecified')).toBe('未說明')
    expect(getCourtSurfaceLabel('unspecified')).toBe('未說明')
  })

  it('falls back to the raw value for something unrecognised rather than throwing', () => {
    expect(getPositionLabel('not-a-real-position')).toBe('not-a-real-position')
  })
})
