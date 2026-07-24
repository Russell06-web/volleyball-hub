import { BrowserRouter, Routes, Route, useLocation, Link } from 'react-router-dom'
import { useEffect } from 'react'
import Icons from './components/Icons'
import { BookingsProvider } from './context/BookingsContext'
import { PreferencesProvider } from './context/PreferencesContext'
import { FavoritesProvider } from './context/FavoritesContext'
import { HistoryProvider } from './context/HistoryContext'
import { ProfileProvider } from './context/ProfileContext'
import { EventsProvider } from './context/EventsContext'
import LanguageOnboarding from './pages/LanguageOnboarding'
import Explore from './pages/Explore'
import EventDetail from './pages/EventDetail'
import Bookings from './pages/Bookings'
import Favorites from './pages/Favorites'
import History from './pages/History'
import Profile from './pages/Profile'
import Manage from './pages/Manage'

function ScrollToTop() {
  const { pathname } = useLocation()
  useEffect(() => { window.scrollTo(0, 0) }, [pathname])
  return null
}

function NotFound() {
  return (
    <div style={{ padding: 48, textAlign: 'center' }}>
      <p>找不到這個頁面。</p>
      <Link to="/explore" className="btn-primary" style={{ display: 'inline-block', marginTop: 12 }}>回到探索頁</Link>
    </div>
  )
}

export default function App() {
  return (
    <BrowserRouter basename={import.meta.env.BASE_URL}>
      <ProfileProvider>
        <EventsProvider>
          <PreferencesProvider>
            <FavoritesProvider>
              <HistoryProvider>
                <BookingsProvider>
                  <Icons />
                  <ScrollToTop />
                  <Routes>
                    <Route path="/" element={<LanguageOnboarding />} />
                    <Route path="/explore" element={<Explore />} />
                    <Route path="/event" element={<EventDetail />} />
                    <Route path="/event/:id" element={<EventDetail />} />
                    <Route path="/bookings" element={<Bookings />} />
                    <Route path="/favorites" element={<Favorites />} />
                    <Route path="/history" element={<History />} />
                    <Route path="/profile" element={<Profile />} />
                    <Route path="/manage" element={<Manage />} />
                    <Route path="*" element={<NotFound />} />
                  </Routes>
                </BookingsProvider>
              </HistoryProvider>
            </FavoritesProvider>
          </PreferencesProvider>
        </EventsProvider>
      </ProfileProvider>
    </BrowserRouter>
  )
}
