import { HashRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { useEffect } from 'react'
import Icons from './components/Icons'
import Toast from './components/Toast'
import CompareTray from './components/CompareTray'
import { ToastProvider } from './context/ToastContext'
import { BookingsProvider } from './context/BookingsContext'
import { PreferencesProvider } from './context/PreferencesContext'
import { FavoritesProvider } from './context/FavoritesContext'
import { HistoryProvider } from './context/HistoryContext'
import { ProfileProvider } from './context/ProfileContext'
import { EventsProvider } from './context/EventsContext'
import { CompareProvider } from './context/CompareContext'
import { SavedSearchesProvider } from './context/SavedSearchesContext'
import Explore from './pages/Explore'
import EventDetail from './pages/EventDetail'
import Bookings from './pages/Bookings'
import Favorites from './pages/Favorites'
import History from './pages/History'
import Profile from './pages/Profile'
import Manage from './pages/Manage'
import Compare from './pages/Compare'
import NotFound from './pages/NotFound'

function ScrollToTop() {
  const { pathname } = useLocation()
  useEffect(() => { window.scrollTo(0, 0) }, [pathname])
  return null
}

export default function App() {
  // HashRouter, not BrowserRouter — GitHub Pages has no server-side rewrite
  // rule, so a direct/refreshed request for a clean path like /explore is a
  // real, unavoidable 404 at the HTTP level (the dist/404.html-copies-
  // index.html trick makes the *page* still render, but the response status
  // is still a genuine 404, which any status-code check or crawler sees).
  // With HashRouter, every real navigation only ever requests
  // /volleyball-hub/ itself — the route lives after the `#`, which the
  // browser never sends to the server at all, so refreshing any route
  // (…/#/explore, …/#/event/e1, …) always gets a real 200. No `basename`
  // needed here: that's for stripping a path prefix, and HashRouter's
  // "path" is whatever's after `#`, independent of the pre-`#` prefix Vite's
  // `base` already puts index.html/assets under.
  return (
    <HashRouter>
      <ToastProvider>
        <ProfileProvider>
          <EventsProvider>
            <CompareProvider>
              <SavedSearchesProvider>
                <PreferencesProvider>
                  <FavoritesProvider>
                    <HistoryProvider>
                      <BookingsProvider>
                        <Icons />
                        <ScrollToTop />
                        <Routes>
                          {/* No real i18n dictionary exists yet, so the language
                              onboarding screen was removed rather than kept as a
                              choice that doesn't actually translate anything —
                              see README.md's Future Roadmap. */}
                          <Route path="/" element={<Navigate to="/explore" replace />} />
                          <Route path="/explore" element={<Explore />} />
                          <Route path="/event/:id" element={<EventDetail />} />
                          <Route path="/bookings" element={<Bookings />} />
                          <Route path="/favorites" element={<Favorites />} />
                          <Route path="/history" element={<History />} />
                          <Route path="/profile" element={<Profile />} />
                          <Route path="/manage" element={<Manage />} />
                          <Route path="/compare" element={<Compare />} />
                          <Route path="*" element={<NotFound />} />
                        </Routes>
                        <CompareTray />
                        <Toast />
                      </BookingsProvider>
                    </HistoryProvider>
                  </FavoritesProvider>
                </PreferencesProvider>
              </SavedSearchesProvider>
            </CompareProvider>
          </EventsProvider>
        </ProfileProvider>
      </ToastProvider>
    </HashRouter>
  )
}
