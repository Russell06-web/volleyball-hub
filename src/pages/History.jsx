import { Link } from 'react-router-dom'
import Header from '../components/Header'
import BottomTabs from '../components/BottomTabs'
import SiteFooter from '../components/SiteFooter'
import EventCard from '../components/EventCard'
import { useEvents } from '../context/EventsContext'
import { useHistory } from '../context/HistoryContext'
import '../styles/explore.css'

export default function History() {
  const { history } = useHistory()
  const { getEventById } = useEvents()
  const events = history.map((id) => getEventById(id)).filter(Boolean)

  return (
    <>
      <Header title="瀏覽歷史" subtitle="最近瀏覽的活動" active="profile" avatarLink={false} />

      <main className="content">
        {events.length === 0 ? (
          <p className="empty-state">
            還沒有瀏覽紀錄。打開<Link to="/explore" className="link-btn">任何一個活動詳情頁</Link>之後就會出現在這裡。
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
