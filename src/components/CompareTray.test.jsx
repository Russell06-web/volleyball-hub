import { beforeEach, describe, expect, it } from 'vitest'
import { fireEvent, screen } from '@testing-library/react'
import CompareTray from './CompareTray'
import { renderAtRoute } from '../test/testProviders'

beforeEach(() => {
  localStorage.clear()
})

describe('CompareTray', () => {
  it('renders nothing when nothing is queued for comparison', () => {
    const { container } = renderAtRoute(<CompareTray />, { route: '/explore' })
    expect(container).toBeEmptyDOMElement()
  })

  it('starts collapsed — the full chip list is present in the DOM but not the default visible state (CSS handles the mobile/desktop split)', () => {
    localStorage.setItem('vh-compare', JSON.stringify(['e1', 'e2']))
    renderAtRoute(<CompareTray />, { route: '/explore' })
    const toggle = screen.getByRole('button', { name: /已選 2\/3/ })
    expect(toggle).toHaveAttribute('aria-expanded', 'false')
  })

  it('expanding the toggle reveals event-name chips with individual remove buttons', () => {
    localStorage.setItem('vh-compare', JSON.stringify(['e1', 'e2']))
    renderAtRoute(<CompareTray />, { route: '/explore' })
    fireEvent.click(screen.getByRole('button', { name: /已選 2\/3/ }))
    expect(screen.getByRole('button', { name: /已選 2\/3/ })).toHaveAttribute('aria-expanded', 'true')
    expect(document.querySelectorAll('.compare-tray-chip').length).toBe(2)
  })

  it('清除 clears every queued event at once', () => {
    localStorage.setItem('vh-compare', JSON.stringify(['e1', 'e2']))
    renderAtRoute(<CompareTray />, { route: '/explore' })
    fireEvent.click(screen.getByRole('button', { name: '清除' }))
    expect(screen.queryByRole('region', { name: '活動比較' })).toBeNull()
  })

  it('開始比較 is disabled with an explained reason when fewer than 2 events are queued', () => {
    localStorage.setItem('vh-compare', JSON.stringify(['e1']))
    renderAtRoute(<CompareTray />, { route: '/explore' })
    const cta = screen.getByRole('button', { name: '開始比較' })
    expect(cta).toBeDisabled()
    expect(cta).toHaveAttribute('aria-describedby', 'compareTrayHint')
    expect(screen.getByText('再選 1 場活動即可開始比較')).toBeInTheDocument()
  })

  it('開始比較 is enabled once 2 or more events are queued, with no leftover hint text', () => {
    localStorage.setItem('vh-compare', JSON.stringify(['e1', 'e2']))
    renderAtRoute(<CompareTray />, { route: '/explore' })
    expect(screen.getByRole('button', { name: '開始比較' })).not.toBeDisabled()
    expect(screen.queryByText(/再選 \d+ 場活動即可開始比較/)).toBeNull()
  })
})
