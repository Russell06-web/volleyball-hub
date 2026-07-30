import { beforeEach, describe, expect, it } from 'vitest'
import { fireEvent, screen } from '@testing-library/react'
import EventListRow from './EventListRow'
import { renderAtRoute } from '../test/testProviders'

beforeEach(() => {
  localStorage.clear()
})

function ev(overrides) {
  return {
    id: 'ev1', title: '測試活動', date: '2099-01-01', startTime: '19:00', venueName: '測試場館',
    city: 'taipei', level: 'intermediate', netHeight: 'unspecified', volleyballFormat: 'sixPlayer',
    capacity: 10, registeredCount: 4, price: 100, status: 'published',
    ...overrides,
  }
}

describe('EventListRow', () => {
  it('renders the core fields: time-first, title, venue, capacity, price, CTA', () => {
    renderAtRoute(<EventListRow ev={ev({})} />, { route: '/explore' })
    expect(screen.getByText('19:00')).toBeInTheDocument()
    expect(screen.getByText('測試活動')).toBeInTheDocument()
    expect(screen.getByText('測試場館')).toBeInTheDocument()
    expect(screen.getByText('NT$100')).toBeInTheDocument()
    expect(screen.getByRole('link', { name: '報名' })).toBeInTheDocument()
  })

  it('shows 候補 instead of 報名 once the event is full', () => {
    renderAtRoute(<EventListRow ev={ev({ registeredCount: 10 })} />, { route: '/explore' })
    expect(screen.getByRole('link', { name: '候補' })).toBeInTheDocument()
  })

  it('urgent mode shows the short 急徵隊友 badge plus a separate shortage line, never merged into one string', () => {
    renderAtRoute(
      <EventListRow ev={ev({ positionsNeeded: [{ position: 'setter', count: 1 }] })} urgent />,
      { route: '/explore' },
    )
    expect(screen.getByText('急徵隊友')).toBeInTheDocument()
    expect(screen.getByText(/缺舉球 1/)).toBeInTheDocument()
    expect(screen.getByText('急徵隊友').textContent).toBe('急徵隊友')
  })

  it('favorite and compare toggles work independently and update aria-pressed', () => {
    renderAtRoute(<EventListRow ev={ev({})} />, { route: '/explore' })
    const favButton = screen.getByRole('button', { name: '收藏' })
    expect(favButton).toHaveAttribute('aria-pressed', 'false')
    fireEvent.click(favButton)
    expect(screen.getByRole('button', { name: '取消收藏' })).toHaveAttribute('aria-pressed', 'true')
  })

  it('a cancelled event shows a disabled status label instead of a CTA link', () => {
    renderAtRoute(<EventListRow ev={ev({ status: 'cancelled' })} />, { route: '/explore' })
    expect(screen.queryByRole('link', { name: '報名' })).toBeNull()
    expect(document.querySelector('.btn-cta.waitlist')).toHaveAttribute('aria-disabled', 'true')
    expect(document.querySelector('.btn-cta.waitlist').textContent).toBe('已取消')
  })
})
