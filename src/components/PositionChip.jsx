import { getPositionLabel } from '../constants/volleyballTaxonomy'

// A single labelled position slot — `needed` (dashed/light) means the
// organiser still wants someone there, `filled` (solid) means they don't
// currently need that role. This is presentation of organiser-entered
// data, not a live seating chart — see the disclaimer text wherever this
// is used.
export default function PositionChip({ position, needed, count }) {
  return (
    <span className={`position-chip${needed ? ' needed' : ' filled'}`}>
      {getPositionLabel(position)}
      {needed && count > 0 ? <b>{count}</b> : null}
    </span>
  )
}
