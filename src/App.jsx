import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { useEffect } from 'react'
import Icons from './components/Icons'
import Toast from './components/Toast'
import { ToastProvider } from './context/ToastContext'
import { BookingsProvider } from './context/BookingsContext'
import { PreferencesProvider } from './context/PreferencesContext'
import { FavoritesProvider } from './context/FavoritesContext'
import { HistoryProvider } from './context/HistoryContext'
import { ProfileProvider } from './context/ProfileContext'
import { EventsProvider } from './context/EventsContext'
import Explore from './pages/Explore'
import EventDetail from './pages/EventDetail'
import Bookings from './pages/Bookings'
import Favorites from './pages/Favorites'
import History from './pages/History'
import Profile from './pages/Profile'
import Manage from './pages/Manage'
import NotFound from './pages/NotFound'

function ScrollToTop() {
  const { pathname } = useLocation()
  useEffect(() => { window.scrollTo(0, 0) }, [pathname])
  return null
}

export default function App() {
  return (
    <BrowserRouter basename={import.meta.env.BASE_URL}>
      <ToastProvider>
        <ProfileProvider>
          <EventsProvider>
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
                      <Route path="*" element={<NotFound />} />
                    </Routes>
                    <Toast />
                  </BookingsProvider>
                </HistoryProvider>
              </FavoritesProvider>
            </PreferencesProvider>
          </EventsProvider>
        </ProfileProvider>
      </ToastProvider>
    </BrowserRouter>
  )
}
