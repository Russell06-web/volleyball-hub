import PositionChip from './PositionChip'
import { getPositionLabel } from '../constants/volleyballTaxonomy'

// A simplified 3×2 layout, not a real court diagram or live lineup — just
// a visual organiser for "which named roles does this event still need"
// (see docs/PRODUCT_LIMITATIONS.md: positionsNeeded is organiser-entered
// demo data, not a real-time roster). The 6th cell covers "不限位置"
// (universal) rather than a 6th named role, since this app only tracks 5
// specific positions.
const COURT_LAYOUT = [
  ['outside', 'middle', 'opposite'],
  ['setter', 'libero', 'universal'],
]

export default function PositionShortageBoard({ positionsNeeded }) {
  const needed = (positionsNeeded || []).filter((p) => p && p.count > 0)
  if (needed.length === 0) return null

  const neededMap = new Map(needed.map((p) => [p.position, p.count]))
  const textList = needed.map((p) => `${getPositionLabel(p.position)} ${p.count} 位`).join('、')

  return (
    <section className="position-board">
      <h2>目前缺少位置</h2>
      <div className="position-court" aria-hidden="true">
        {COURT_LAYOUT.flat().map((position) => (
          <PositionChip key={position} position={position} needed={neededMap.has(position)} count={neededMap.get(position)} />
        ))}
      </div>
      {/* The grid above is aria-hidden — this text list is the real,
          screen-reader-accessible source of the same information. */}
      <p className="position-board-text">目前需要：{textList}</p>
      <p className="position-board-disclaimer">以上為主辦方填寫的示範資料，非即時陣容或報名系統自動計算的名額分配。</p>
    </section>
  )
}
