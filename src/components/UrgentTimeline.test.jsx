import { beforeEach, describe, expect, it } from 'vitest'
import { screen } from '@testing-library/react'
import UrgentTimeline from './UrgentTimeline'
import { renderAtRoute } from '../test/testProviders'

const NOW_TODAY = '2099-03-07'

beforeEach(() => {
  localStorage.clear()
})

function ev(overrides) {
  return {
    id: overrides.id, title: overrides.title || '臨打活動', date: overrides.date || NOW_TODAY, startTime: overrides.startTime || '19:00',
    venueName: '測試場館', city: 'taipei', level: 'open', netHeight: 'unspecified', volleyballFormat: 'sixPlayer',
    capacity: 10, registeredCount: 4, price: 100, status: 'published', isUrgent: true,
    ...overrides,
  }
}

describe('UrgentTimeline', () => {
  it('renders nothing for an empty event list', () => {
    const { container } = renderAtRoute(<UrgentTimeline events={[]} />, { route: '/explore' })
    expect(container).toBeEmptyDOMElement()
  })

  it('groups events by date with a heading per date group', () => {
    renderAtRoute(
      <UrgentTimeline events={[ev({ id: 'a', date: '2099-03-07' }), ev({ id: 'b', date: '2099-03-08' })]} />,
      { route: '/explore' },
    )
    expect(document.querySelectorAll('.date-group')).toHaveLength(2)
    expect(document.querySelectorAll('.date-group-heading')).toHaveLength(2)
  })

  it('sorts rows within a date group by startTime', () => {
    renderAtRoute(
      <UrgentTimeline events={[
        ev({ id: 'late', date: '2099-03-07', startTime: '21:00', title: '晚場' }),
        ev({ id: 'early', date: '2099-03-07', startTime: '09:00', title: '早場' }),
      ]} />,
      { route: '/explore' },
    )
    const titles = [...document.querySelectorAll('.event-list-title')].map((el) => el.textContent)
    expect(titles).toEqual(['早場', '晚場'])
  })

  it('every row uses the short 急徵隊友 badge, not a merged status+shortage string', () => {
    renderAtRoute(
      <UrgentTimeline events={[ev({ id: 'a', positionsNeeded: [{ position: 'setter', count: 2 }] })]} />,
      { route: '/explore' },
    )
    expect(screen.getAllByText('急徵隊友')).toHaveLength(1)
    expect(screen.getByText(/缺舉球 2/)).toBeInTheDocument()
  })
})
