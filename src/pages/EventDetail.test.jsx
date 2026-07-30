import { beforeEach, describe, expect, it } from 'vitest'
import { screen } from '@testing-library/react'
import EventDetail from './EventDetail'
import { renderAtRoute } from '../test/testProviders'

beforeEach(() => {
  localStorage.clear()
})

// e13 is a seed event owned by the demo organiser (CURRENT_USER_ID) and is
// full (18/18) — see src/data/events.js.
describe('EventDetail — organizer activity summary', () => {
  it('shows verifiable counts, never a rating/review/certification claim', () => {
    renderAtRoute(<EventDetail />, { route: '/event/e13', path: '/event/:id' })
    expect(screen.getByText('主辦方資訊')).toBeInTheDocument()
    expect(screen.getByText('已建立活動')).toBeInTheDocument()
    expect(screen.getByText('已完成')).toBeInTheDocument()
    expect(screen.getByText('即將舉行')).toBeInTheDocument()
    expect(screen.getByText('已取消')).toBeInTheDocument()
    expect(screen.getByText(/不是評分、推薦或平台認證/)).toBeInTheDocument()
    expect(screen.queryByText(/★/)).toBeNull()
  })

  it('does not show the organizer-summary block for an event with no ownerId', () => {
    renderAtRoute(<EventDetail />, { route: '/event/e2', path: '/event/:id' })
    expect(screen.queryByText('已建立活動')).toBeNull()
  })
})

describe('EventDetail — waitlist position', () => {
  it('shows the honest waitlist position and disclaimer once this booking is on the waitlist', () => {
    localStorage.setItem('vh-bookings', JSON.stringify([
      { id: 'b1', eventId: 'e13', status: 'waitlist', participantCount: 1, registrant: { name: 'A', mode: 'individual' }, createdAt: 1, updatedAt: 1 },
    ]))
    renderAtRoute(<EventDetail />, { route: '/event/e13', path: '/event/:id' })
    expect(screen.getByText(/目前候補第 1 位/)).toBeInTheDocument()
    expect(screen.getByText(/此原型不會發送名額通知或自動遞補/)).toBeInTheDocument()
  })

  it('shows no waitlist-position note when there is no waitlist booking for this event', () => {
    renderAtRoute(<EventDetail />, { route: '/event/e13', path: '/event/:id' })
    expect(screen.queryByText(/目前候補第/)).toBeNull()
  })
})
