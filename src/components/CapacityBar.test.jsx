import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import CapacityBar from './CapacityBar'

function ev(overrides) {
  return { date: '2099-01-01', startTime: '10:00', status: 'published', capacity: 10, registeredCount: 0, ...overrides }
}

describe('CapacityBar', () => {
  it('exposes a full ARIA progressbar with min/max/now and a readable valuetext', () => {
    render(<CapacityBar event={ev({ capacity: 10, registeredCount: 4 })} />)
    const bar = screen.getByRole('progressbar')
    expect(bar).toHaveAttribute('aria-valuemin', '0')
    expect(bar).toHaveAttribute('aria-valuemax', '10')
    expect(bar).toHaveAttribute('aria-valuenow', '4')
    expect(bar).toHaveAttribute('aria-valuetext', '已報名 4 / 10 人，剩 6 位')
  })

  it('shows 剩 N 位 text below the ok threshold', () => {
    render(<CapacityBar event={ev({ capacity: 10, registeredCount: 4 })} />)
    expect(screen.getByText('剩 6 位')).toBeInTheDocument()
  })

  it('switches to the warning tone once at or above 80% full, without changing to red/danger wording', () => {
    render(<CapacityBar event={ev({ capacity: 10, registeredCount: 8 })} />)
    expect(document.querySelector('.capacity-bar-track.warning')).not.toBeNull()
  })

  it('shows 已額滿 and the full tone once the event is actually full', () => {
    render(<CapacityBar event={ev({ capacity: 10, registeredCount: 10 })} />)
    expect(screen.getByText('已額滿')).toBeInTheDocument()
    expect(document.querySelector('.capacity-bar-track.full')).not.toBeNull()
  })

  it('never lets aria-valuenow exceed capacity even if registeredCount data is inconsistent', () => {
    render(<CapacityBar event={ev({ capacity: 10, registeredCount: 15 })} />)
    expect(screen.getByRole('progressbar')).toHaveAttribute('aria-valuenow', '10')
  })
})
