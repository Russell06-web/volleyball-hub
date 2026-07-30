import EventListRow from './EventListRow'
import { groupEventsByTaipeiDate } from '../utils/groupEventsByTaipeiDate'

// Time-and-shortage-first schedule list for 近期臨打 — a pickup game is
// decided by "when, and who's still missing", not by browsing a card grid
// identical to every other section. Grouped 今天/明天/其他日期 via the same
// groupEventsByTaipeiDate utility "更多活動" uses, and every row is the
// exact same EventListRow (with urgent styling) EventCard's business logic
// already backs — no second status/favorite/compare/CTA implementation.
export default function UrgentTimeline({ events }) {
  const groups = groupEventsByTaipeiDate(events)
  if (groups.length === 0) return null

  return (
    <div className="urgent-timeline">
      {groups.map((group) => (
        <div key={group.date} className="date-group">
          <h3 className="date-group-heading">{group.label}</h3>
          <div className="event-list">
            {group.events.map((ev) => <EventListRow key={ev.id} ev={ev} urgent />)}
          </div>
        </div>
      ))}
    </div>
  )
}
