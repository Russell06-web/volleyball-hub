import { beforeEach, describe, expect, it } from 'vitest'
import { screen, within } from '@testing-library/react'
import Bookings from './Bookings'
import { renderAtRoute } from '../test/testProviders'

beforeEach(() => {
  localStorage.clear()
})

describe('Bookings — 我的本週球局', () => {
  it('shows an empty state when nothing is booked this week', () => {
    renderAtRoute(<Bookings />, { route: '/bookings', path: '/bookings' })
    const section = screen.getByRole('heading', { name: '我的本週球局' }).closest('section')
    expect(within(section).getByText('這週沒有已報名或候補的活動。')).toBeInTheDocument()
  })

  it('groups this-week bookings by date and shows the event, time, and status badge', () => {
    localStorage.setItem('vh-bookings', JSON.stringify([
      { id: 'b1', eventId: 'e1', status: 'confirmed', participantCount: 1, registrant: { name: 'A', mode: 'individual' }, createdAt: 1, updatedAt: 1 },
    ]))
    renderAtRoute(<Bookings />, { route: '/bookings', path: '/bookings' })
    const section = screen.getByRole('heading', { name: '我的本週球局' }).closest('section')
    expect(within(section).getByText('週末排球大戰')).toBeInTheDocument()
    expect(within(section).getByText('已確認')).toBeInTheDocument()
  })

  it('shows the honest waitlist-position note on a waitlisted booking card, never a synced-notification claim', () => {
    localStorage.setItem('vh-bookings', JSON.stringify([
      { id: 'b1', eventId: 'e13', status: 'waitlist', participantCount: 1, registrant: { name: 'A', mode: 'individual' }, createdAt: 1, updatedAt: 1 },
    ]))
    renderAtRoute(<Bookings />, { route: '/bookings', path: '/bookings' })
    expect(screen.getByText('目前候補第 1 位')).toBeInTheDocument()
    expect(screen.getByText(/此原型不會發送名額通知或自動遞補/)).toBeInTheDocument()
  })

  it('never shows a waitlist-position note on a cancelled booking', () => {
    localStorage.setItem('vh-bookings', JSON.stringify([
      { id: 'b1', eventId: 'e13', status: 'cancelled', participantCount: 1, registrant: { name: 'A', mode: 'individual' }, createdAt: 1, updatedAt: 1, cancelReason: 'test' },
    ]))
    renderAtRoute(<Bookings />, { route: '/bookings', path: '/bookings' })
    expect(screen.queryByText(/目前候補第/)).toBeNull()
  })
})
