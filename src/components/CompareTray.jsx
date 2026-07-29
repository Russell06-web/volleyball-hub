import { useNavigate } from 'react-router-dom'
import { Icon } from './Icons'
import { useCompare, MAX_COMPARE } from '../context/CompareContext'
import { useEvents } from '../context/EventsContext'

// Fixed above BottomTabs (not overlapping it), safe-area aware. Only
// rendered once at least one event is queued for comparison.
export default function CompareTray() {
  const { compareIds, removeCompare, clearCompare } = useCompare()
  const { getEventById } = useEvents()
  const navigate = useNavigate()

  if (compareIds.length === 0) return null

  const events = compareIds.map((id) => getEventById(id)).filter(Boolean)

  return (
    <div className="compare-tray" role="region" aria-label="活動比較">
      <div className="compare-tray-inner">
        <div className="compare-tray-head">
          <span>已選 {events.length}/{MAX_COMPARE}</span>
          <button type="button" className="link-btn" onClick={clearCompare}>清除</button>
        </div>
        <div className="compare-tray-chips">
          {events.map((ev) => (
            <span key={ev.id} className="compare-tray-chip">
              {ev.title}
              <button type="button" aria-label={`從比較移除${ev.title}`} onClick={() => removeCompare(ev.id)}>
                <Icon id="i-close" size={11} />
              </button>
            </span>
          ))}
        </div>
        <button type="button" className="btn-primary compare-tray-cta" onClick={() => navigate('/compare')} disabled={events.length < 2}>
          開始比較
        </button>
      </div>
    </div>
  )
}
