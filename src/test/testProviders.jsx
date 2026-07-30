import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { render } from '@testing-library/react'
import { ToastProvider } from '../context/ToastContext'
import { ProfileProvider } from '../context/ProfileContext'
import { EventsProvider } from '../context/EventsContext'
import { CompareProvider } from '../context/CompareContext'
import { SavedSearchesProvider } from '../context/SavedSearchesContext'
import { PreferencesProvider } from '../context/PreferencesContext'
import { FavoritesProvider } from '../context/FavoritesContext'
import { HistoryProvider } from '../context/HistoryContext'
import { BookingsProvider } from '../context/BookingsContext'

// Mirrors the exact provider nesting in App.jsx (minus BrowserRouter,
// which callers supply themselves via MemoryRouter so tests can control
// the starting route/history) — so a component under test sees the same
// Context shape it would in the real app, not a hand-picked subset.
export function AllProviders({ children }) {
  return (
    <ToastProvider>
      <ProfileProvider>
        <EventsProvider>
          <CompareProvider>
            <SavedSearchesProvider>
              <PreferencesProvider>
                <FavoritesProvider>
                  <HistoryProvider>
                    <BookingsProvider>
                      {children}
                    </BookingsProvider>
                  </HistoryProvider>
                </FavoritesProvider>
              </PreferencesProvider>
            </SavedSearchesProvider>
          </CompareProvider>
        </EventsProvider>
      </ProfileProvider>
    </ToastProvider>
  )
}

// Renders `element` at `path`, with the router's initial history entry set
// to `route` (defaults to the same pathname as `route`, stripped of any
// query string — so passing only `route: '/bookings?x=1'` just works,
// rather than silently matching nothing because `path` still defaulted to
// somewhere else). Pass a route containing a query string (e.g.
// '/explore?q=台北') to test URL-driven state, or an array of entries to
// test back/forward navigation.
export function renderAtRoute(element, { route, path, initialEntries } = {}) {
  const entries = initialEntries || [route || path || '/explore']
  const resolvedPath = path || (route || '/explore').split('?')[0]
  return render(
    <MemoryRouter initialEntries={entries}>
      <AllProviders>
        <Routes>
          <Route path={resolvedPath} element={element} />
          <Route path="/event/:id" element={<div>event detail stub</div>} />
        </Routes>
      </AllProviders>
    </MemoryRouter>,
  )
}
