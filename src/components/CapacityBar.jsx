import { EVENT_STATUS, getEventStatus, getRemainingSlots } from '../utils/eventStatus'

// Thin, honest capacity indicator — a real registeredCount/capacity ratio,
// never an animated "looks like it's filling up live" effect. Tone is
// never red (that's reserved for cancel/error elsewhere): teal/navy for
// normal headroom, warning (amber) once genuinely close to full, and
// full/waitlist still uses the neutral navy "waitlist" tone rather than a
// pressure colour.
export default function CapacityBar({ event }) {
  const capacity = Math.max(0, event.capacity || 0)
  const registered = Math.min(Math.max(0, event.registeredCount || 0), capacity || Number.MAX_SAFE_INTEGER)
  const status = getEventStatus(event)
  const full = status === EVENT_STATUS.FULL
  const remaining = getRemainingSlots(event)
  const pct = capacity > 0 ? Math.min(100, Math.round((registered / capacity) * 100)) : 0
  const tone = full ? 'full' : pct >= 80 ? 'warning' : 'ok'
  const label = full ? '已額滿' : `剩 ${remaining} 位`

  return (
    <div className="capacity-indicator">
      <div
        className={`capacity-bar-track ${tone}`}
        role="progressbar"
        aria-valuemin={0}
        aria-valuemax={capacity}
        aria-valuenow={registered}
        aria-valuetext={`已報名 ${registered} / ${capacity} 人，${label}`}
      >
        <div className="capacity-bar-fill" style={{ width: `${pct}%` }} />
      </div>
      <span className="capacity-label">{label}</span>
    </div>
  )
}
