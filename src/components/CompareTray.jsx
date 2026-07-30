import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Icon } from './Icons'
import { useCompare, MAX_COMPARE } from '../context/CompareContext'
import { useEvents } from '../context/EventsContext'

// Fixed above BottomTabs (not overlapping it), safe-area aware. Only
// rendered once at least one event is queued for comparison.
//
// The full event-name chip list is always shown on desktop (see
// .compare-tray-chips in style.css — it stays display:flex there
// regardless of `expanded`), but on mobile it starts collapsed to just a
// count + CTA so three event names never push the tray to an awkward
// height above BottomTabs — tapping the count expands it to show names
// and individual remove buttons.
export default function CompareTray() {
  const { compareIds, removeCompare, clearCompare } = useCompare()
  const { getEventById } = useEvents()
  const navigate = useNavigate()
  const [expanded, setExpanded] = useState(false)

  if (compareIds.length === 0) return null

  const events = compareIds.map((id) => getEventById(id)).filter(Boolean)

  return (
    <div className="compare-tray" role="region" aria-label="活動比較">
      <div className="compare-tray-inner">
        <div className="compare-tray-head">
          <button
            type="button"
            className="compare-tray-toggle"
            aria-expanded={expanded}
            aria-controls="compareTrayChips"
            onClick={() => setExpanded((v) => !v)}
          >
            <span>已選 {events.length}/{MAX_COMPARE}</span>
            <Icon id="i-chevron" size={13} className={`compare-tray-chevron${expanded ? ' open' : ''}`} />
          </button>
          <button type="button" className="link-btn" onClick={clearCompare}>清除</button>
        </div>
        <div id="compareTrayChips" className={`compare-tray-chips${expanded ? ' expanded' : ''}`}>
          {events.map((ev) => (
            <span key={ev.id} className="compare-tray-chip">
              {ev.title}
              <button type="button" aria-label={`從比較移除${ev.title}`} onClick={() => removeCompare(ev.id)}>
                <Icon id="i-close" size={11} />
              </button>
            </span>
          ))}
        </div>
        <button
          type="button"
          className="btn-primary compare-tray-cta"
          onClick={() => navigate('/compare')}
          disabled={events.length < 2}
          aria-describedby={events.length < 2 ? 'compareTrayHint' : undefined}
        >
          開始比較
        </button>
        {events.length < 2 && <p id="compareTrayHint" className="compare-tray-hint">再選 1 場活動即可開始比較</p>}
      </div>
    </div>
  )
}
