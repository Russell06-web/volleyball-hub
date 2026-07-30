import { afterEach, describe, expect, it, vi } from 'vitest'
import { fireEvent, render, screen } from '@testing-library/react'
import ActiveFiltersSummary from './ActiveFiltersSummary'

function stubMatchMedia(minWidthThatMatches) {
  vi.stubGlobal('matchMedia', (query) => {
    const match = /min-width:\s*(\d+)px/.exec(query)
    const threshold = match ? Number(match[1]) : 0
    return { matches: minWidthThatMatches >= threshold, media: query, addEventListener() {}, removeEventListener() {} }
  })
}

function items(n) {
  return Array.from({ length: n }, (_, i) => ({ key: `k${i}`, label: `條件${i}` }))
}

afterEach(() => {
  vi.unstubAllGlobals()
})

describe('ActiveFiltersSummary', () => {
  it('renders nothing when there are no active filters', () => {
    const { container } = render(<ActiveFiltersSummary items={[]} onRemove={() => {}} onClearAll={() => {}} onSaveSearch={() => {}} />)
    expect(container).toBeEmptyDOMElement()
  })

  it('shows every chip with no "+N" when under the mobile cap of 4', () => {
    stubMatchMedia(0) // neither >=640 nor >=1024 matches -> mobile cap (4)
    render(<ActiveFiltersSummary items={items(4)} onRemove={() => {}} onClearAll={() => {}} onSaveSearch={() => {}} />)
    items(4).forEach((it_) => expect(screen.getByText(it_.label)).toBeInTheDocument())
    expect(screen.queryByText(/^\+\d+$/)).toBeNull()
  })

  it('collapses beyond the mobile cap of 4 into a "+N" toggle', () => {
    stubMatchMedia(0)
    render(<ActiveFiltersSummary items={items(6)} onRemove={() => {}} onClearAll={() => {}} onSaveSearch={() => {}} />)
    expect(screen.getByText('+2')).toBeInTheDocument()
    expect(screen.queryByText('條件4')).toBeNull()
    expect(screen.queryByText('條件5')).toBeNull()
  })

  it('uses a larger cap (6) at desktop widths, so 6 items show with no overflow toggle', () => {
    stubMatchMedia(1024)
    render(<ActiveFiltersSummary items={items(6)} onRemove={() => {}} onClearAll={() => {}} onSaveSearch={() => {}} />)
    expect(screen.queryByText(/^\+\d+$/)).toBeNull()
    expect(screen.getByText('條件5')).toBeInTheDocument()
  })

  it('expands to show every chip and flips the toggle label to 收合, with aria-expanded reflecting state', () => {
    stubMatchMedia(0)
    render(<ActiveFiltersSummary items={items(6)} onRemove={() => {}} onClearAll={() => {}} onSaveSearch={() => {}} />)
    const toggle = screen.getByText('+2')
    expect(toggle).toHaveAttribute('aria-expanded', 'false')
    fireEvent.click(toggle)
    expect(screen.getByText('條件4')).toBeInTheDocument()
    expect(screen.getByText('條件5')).toBeInTheDocument()
    const collapseToggle = screen.getByText('收合')
    expect(collapseToggle).toHaveAttribute('aria-expanded', 'true')
    fireEvent.click(collapseToggle)
    expect(screen.queryByText('條件4')).toBeNull()
  })

  it('removes one chip via onRemove without touching the others', () => {
    stubMatchMedia(0)
    const onRemove = vi.fn()
    render(<ActiveFiltersSummary items={items(2)} onRemove={onRemove} onClearAll={() => {}} onSaveSearch={() => {}} />)
    fireEvent.click(screen.getByRole('button', { name: /移除條件0篩選/ }))
    expect(onRemove).toHaveBeenCalledWith('k0')
    expect(onRemove).toHaveBeenCalledTimes(1)
  })

  it('清除全部 and 儲存這組條件 sit in their own action row, separate from the filter chips', () => {
    stubMatchMedia(0)
    const onClearAll = vi.fn()
    const onSaveSearch = vi.fn()
    render(<ActiveFiltersSummary items={items(2)} onRemove={() => {}} onClearAll={onClearAll} onSaveSearch={onSaveSearch} />)
    fireEvent.click(screen.getByRole('button', { name: '清除全部' }))
    expect(onClearAll).toHaveBeenCalledTimes(1)
    fireEvent.click(screen.getByRole('button', { name: '儲存這組條件' }))
    expect(onSaveSearch).toHaveBeenCalledTimes(1)
  })
})
