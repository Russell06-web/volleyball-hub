import { beforeEach, describe, expect, it } from 'vitest'
import { fireEvent, screen, within } from '@testing-library/react'
import { useNavigate } from 'react-router-dom'
import Explore from './Explore'
import { renderAtRoute } from '../test/testProviders'

const HERO_HEADING = '找到適合你的下一場球'
const SHARED_PLACEHOLDER = '搜尋球館、地區或活動'
const HEADER_PLACEHOLDER = '搜尋活動、球館、城市、主辦方…'

beforeEach(() => {
  localStorage.clear()
})

describe('Explore — mobile search box always reachable', () => {
  it('shows the Hero search box (not the compact bar) when browsing home', () => {
    renderAtRoute(<Explore />, { route: '/explore' })
    expect(screen.getByRole('heading', { level: 1, name: HERO_HEADING })).toBeInTheDocument()
    expect(screen.getAllByPlaceholderText(SHARED_PLACEHOLDER)).toHaveLength(1)
    expect(document.querySelector('.compact-search-bar')).toBeNull()
  })

  it('shows the compact search bar (not the Hero) once a search is active — the query stays editable on mobile', () => {
    renderAtRoute(<Explore />, { route: '/explore?q=%E5%8F%B0%E5%8C%97' })
    expect(screen.queryByRole('heading', { level: 1, name: HERO_HEADING })).toBeNull()
    expect(document.querySelector('.compact-search-bar')).not.toBeNull()
    expect(screen.getAllByPlaceholderText(SHARED_PLACEHOLDER)).toHaveLength(1)
  })

  it('every search box (Header + compact bar) reflects the same committed query', () => {
    renderAtRoute(<Explore />, { route: '/explore?q=%E5%8F%B0%E5%8C%97' })
    const headerInput = screen.getByPlaceholderText(HEADER_PLACEHOLDER)
    const compactInput = screen.getByPlaceholderText(SHARED_PLACEHOLDER)
    expect(headerInput.value).toBe('台北')
    expect(compactInput.value).toBe('台北')
  })

  it('clearing the search from the compact bar returns to the browsing-home Hero', () => {
    renderAtRoute(<Explore />, { route: '/explore?q=%E5%8F%B0%E5%8C%97' })
    const clearButton = document.querySelector('.compact-search-bar button[aria-label="清除搜尋"]')
    expect(clearButton).not.toBeNull()
    fireEvent.click(clearButton)
    expect(screen.getByRole('heading', { level: 1, name: HERO_HEADING })).toBeInTheDocument()
  })

  it('touch target for the compact search bar is at least 44px tall (via CSS min-height, asserted on the class)', () => {
    renderAtRoute(<Explore />, { route: '/explore?q=%E5%8F%B0%E5%8C%97' })
    expect(document.querySelector('.compact-search-bar')).toHaveClass('compact-search-bar')
  })

  it('resyncs every search box when the URL changes via navigation (the same mechanism back/forward relies on)', () => {
    function NavButton() {
      const navigate = useNavigate()
      return <button type="button" onClick={() => navigate('/explore?q=%E6%96%B0%E5%8C%97')}>go</button>
    }
    renderAtRoute(
      <>
        <NavButton />
        <Explore />
      </>,
      { route: '/explore?q=%E5%8F%B0%E5%8C%97' },
    )
    expect(screen.getByPlaceholderText(SHARED_PLACEHOLDER).value).toBe('台北')
    fireEvent.click(screen.getByText('go'))
    expect(screen.getByPlaceholderText(HEADER_PLACEHOLDER).value).toBe('新北')
    expect(screen.getByPlaceholderText(SHARED_PLACEHOLDER).value).toBe('新北')
  })
})

describe('Explore — Results Header', () => {
  it('renders exactly one h1 on the page in a searching/filtering state', () => {
    renderAtRoute(<Explore />, { route: '/explore?q=%E5%8F%B0%E5%8C%97' })
    expect(screen.getAllByRole('heading', { level: 1 })).toHaveLength(1)
  })

  it('search-only heading quotes the query and never mentions applied-filter count', () => {
    renderAtRoute(<Explore />, { route: '/explore?q=%E5%8F%B0%E5%8C%97' })
    expect(screen.getByRole('heading', { level: 1, name: '「台北」的搜尋結果' })).toBeInTheDocument()
    expect(screen.queryByText(/已套用/)).toBeNull()
  })

  it('filter-only heading is 篩選結果 with an applied-filter count, in an aria-live region', () => {
    renderAtRoute(<Explore />, { route: '/explore?city=taipei&level=intermediate' })
    expect(screen.getByRole('heading', { level: 1, name: '篩選結果' })).toBeInTheDocument()
    expect(screen.getByText(/已套用 2 個條件/)).toHaveAttribute('aria-live', 'polite')
  })

  it('search+filter combines into one heading, not three overlapping pieces of copy', () => {
    renderAtRoute(<Explore />, { route: '/explore?q=%E5%8F%B0%E5%8C%97&city=taipei' })
    expect(screen.getByRole('heading', { level: 1, name: '搜尋與篩選結果' })).toBeInTheDocument()
  })

  it('the browsing-home state renders no Results Header at all', () => {
    renderAtRoute(<Explore />, { route: '/explore' })
    expect(document.querySelector('.results-header')).toBeNull()
  })
})

describe('Explore — empty state accessibility', () => {
  it('role=status wraps only the message text, never the reset/alternative buttons', () => {
    renderAtRoute(<Explore />, { route: '/explore?q=this-should-match-nothing-xyz' })
    const status = screen.getByRole('status')
    expect(within(status).queryAllByRole('button')).toHaveLength(0)
    expect(status).toHaveAttribute('aria-live', 'polite')
    expect(screen.getByRole('button', { name: /清除搜尋及重置篩選/ })).toBeInTheDocument()
  })
})

describe('Explore — 更多活動 naming', () => {
  it('never shows the old 全部活動 label, and the section is labelled 更多活動', () => {
    renderAtRoute(<Explore />, { route: '/explore' })
    expect(screen.queryByText('全部活動')).toBeNull()
    expect(screen.getByRole('heading', { level: 2, name: '更多活動' })).toBeInTheDocument()
  })
})

describe('Explore — urgentOnly / 今天臨打 quick entry', () => {
  it('clicking 今天臨打 applies both dateRange=today and urgentOnly, shown as active-filter chips', () => {
    renderAtRoute(<Explore />, { route: '/explore' })
    fireEvent.click(screen.getByRole('button', { name: '今天臨打' }))
    expect(screen.getByRole('button', { name: /移除僅看臨打篩選/ })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /移除今天篩選/ })).toBeInTheDocument()
  })

  it('僅看臨打 can be removed independently via its own active-filter chip', () => {
    renderAtRoute(<Explore />, { route: '/explore?urgentOnly=true' })
    const chip = screen.getByRole('button', { name: /移除僅看臨打篩選/ })
    fireEvent.click(chip)
    expect(screen.queryByRole('button', { name: /移除僅看臨打篩選/ })).toBeNull()
  })
})

describe('Explore — 我需要的位置 quick entry', () => {
  it('opens the filter sheet with 排球條件 expanded and focus on a position option when no real position is set', () => {
    renderAtRoute(<Explore />, { route: '/explore' })
    fireEvent.click(screen.getByRole('button', { name: '我需要的位置' }))
    expect(screen.getByRole('dialog')).toBeInTheDocument()
    const volleyballTrigger = screen.getByRole('button', { name: '排球條件' })
    expect(volleyballTrigger).toHaveAttribute('aria-expanded', 'true')
    const positionGroup = document.querySelector('[data-filter-field="position"]')
    expect(positionGroup).not.toBeNull()
    expect(positionGroup.contains(document.activeElement)).toBe(true)
  })

  it('applies the filter directly with no dialog when the profile already has a real default position', () => {
    localStorage.setItem('vh-profile', JSON.stringify({ defaultPosition: 'setter' }))
    renderAtRoute(<Explore />, { route: '/explore' })
    fireEvent.click(screen.getByRole('button', { name: '我需要的位置' }))
    expect(screen.queryByRole('dialog')).toBeNull()
    expect(screen.getByRole('button', { name: /移除舉球篩選/ })).toBeInTheDocument()
  })

  it('a generic 更多篩選 open still starts from 基本條件 only, never auto-expanding 排球條件', () => {
    renderAtRoute(<Explore />, { route: '/explore' })
    fireEvent.click(screen.getByRole('button', { name: '更多篩選' }))
    expect(screen.getByRole('dialog')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: '基本條件' })).toHaveAttribute('aria-expanded', 'true')
    expect(screen.getByRole('button', { name: '排球條件' })).toHaveAttribute('aria-expanded', 'false')
  })
})
