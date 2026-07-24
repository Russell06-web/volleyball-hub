import { Link } from 'react-router-dom'
import Header from '../components/Header'
import BottomTabs from '../components/BottomTabs'
import SiteFooter from '../components/SiteFooter'
import EventCard from '../components/EventCard'
import { useEvents } from '../context/EventsContext'
import { useFavorites } from '../context/FavoritesContext'
import '../styles/explore.css'

export default function Favorites() {
  const { favorites } = useFavorites()
  const { getEventById } = useEvents()
  const events = favorites.map((id) => getEventById(id)).filter(Boolean)

  return (
    <>
      <Header title="我的收藏" subtitle={`${events.length} 場已收藏的活動`} active="profile" avatarLink={false} />

      <main className="content">
        {events.length === 0 ? (
          <p className="empty-state">
            還沒有收藏任何活動。到<Link to="/explore" className="link-btn">探索活動</Link>頁面點活動卡片上的愛心圖示就可以收藏。
          </p>
        ) : (
          <div className="event-grid">
            {events.map((ev) => <EventCard key={ev.id} ev={ev} />)}
          </div>
        )}
      </main>

      <SiteFooter />
      <BottomTabs active="profile" />
    </>
  )
}
