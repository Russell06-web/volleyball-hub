import { useEffect, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import Header from '../components/Header'
import BottomTabs from '../components/BottomTabs'
import SiteFooter from '../components/SiteFooter'
import { Icon } from '../components/Icons'
import { useCompare, MAX_COMPARE } from '../context/CompareContext'
import { useEvents } from '../context/EventsContext'
import { useFavorites } from '../context/FavoritesContext'
import { formatPrice } from '../utils/format'
import { formatEventDateLabel } from '../utils/date'
import { getCityLabel, getGenderLabel, getLevelLabel } from '../constants/taxonomy'
import {
  getCourtSurfaceLabel, getEquipmentLabel, getNetHeightLabel, getPlayStyleLabel, getPositionLabel,
  getVolleyballFormatLabel,
} from '../constants/volleyballTaxonomy'
import { EVENT_STATUS_META, getEventStatus, getRemainingSlots } from '../utils/eventStatus'
import { buildFromState } from '../utils/navigation'
import { getEventInformationQuality } from '../utils/informationQuality'
import '../styles/compare.css'

function positionsNeededSummary(ev) {
  const needed = (ev.positionsNeeded || []).filter((p) => p && p.count > 0)
  if (needed.length === 0) return '未指定缺人位置'
  return needed.map((p) => `${getPositionLabel(p.position)} ${p.count}`).join('・')
}

function equipmentSummary(ev) {
  const list = ev.equipmentProvided || []
  if (list.length === 0) return '未列出提供設備'
  return list.map((v) => getEquipmentLabel(v)).join('・')
}

function boolLabel(value) {
  return value ? '是' : '否'
}

// One row per comparable dimension. `render` always returns plain text —
// the table/tabs shells are the only place that decides how to lay that
// text out, so this list is the single source both views read from.
function buildRows(ev) {
  const status = getEventStatus(ev)
  return [
    { key: 'date', label: '日期時間', value: `${formatEventDateLabel(ev.date)}・${ev.startTime}–${ev.endTime}` },
    { key: 'venue', label: '地點', value: `${getCityLabel(ev.city)}・${ev.venueName}` },
    { key: 'level', label: '程度限制', value: getLevelLabel(ev.level) },
    { key: 'gender', label: '性別限制', value: getGenderLabel(ev.gender) },
    { key: 'price', label: '費用', value: formatPrice(ev.price) },
    { key: 'slots', label: '剩餘名額', value: `${getRemainingSlots(ev)} / ${ev.capacity} 人` },
    { key: 'status', label: '活動狀態', value: EVENT_STATUS_META[status]?.label || '' },
    { key: 'playStyle', label: '活動調性', value: ev.playStyle ? getPlayStyleLabel(ev.playStyle) : '未說明' },
    { key: 'netHeight', label: '網高', value: getNetHeightLabel(ev.netHeight) },
    { key: 'format', label: '球制', value: getVolleyballFormatLabel(ev.volleyballFormat) },
    { key: 'courtSurface', label: '場地材質', value: getCourtSurfaceLabel(ev.courtSurface) },
    { key: 'rotation', label: '是否需要輪轉', value: boolLabel(ev.rotationRequired) },
    { key: 'solo', label: '可單人報名', value: boolLabel(ev.soloJoinAllowed) },
    { key: 'libero', label: '允許自由球員', value: boolLabel(ev.liberoAllowed) },
    { key: 'equipment', label: '提供設備', value: equipmentSummary(ev) },
    { key: 'positions', label: '需要位置', value: positionsNeededSummary(ev) },
    { key: 'info', label: '資訊完整度', value: getEventInformationQuality(ev).label },
  ]
}

export default function Compare() {
  const { compareIds, removeCompare, clearCompare } = useCompare()
  const { getEventById } = useEvents()
  const { isFavorite, toggleFavorite } = useFavorites()
  const location = useLocation()
  const linkState = buildFromState(location)
  const events = compareIds.map((id) => getEventById(id)).filter(Boolean)
  const [activeIndex, setActiveIndex] = useState(0)

  useEffect(() => {
    document.title = '活動比較｜Volleyball Hub'
  }, [])

  useEffect(() => {
    if (activeIndex >= events.length && events.length > 0) setActiveIndex(0)
  }, [events.length, activeIndex])

  // Every event produces the same row keys in the same order, so the
  // labels only need to come from one of them; each event's own values
  // are looked up by index below rather than re-running buildRows per cell.
  const rowsByEvent = events.map((ev) => buildRows(ev))
  const rowMeta = rowsByEvent[0] || []

  return (
    <>
      <Header title="活動比較" subtitle={events.length > 0 ? `已選 ${events.length}/${MAX_COMPARE} 場活動` : '尚未選擇活動'} active="profile" avatarLink={false} />

      <main className="content">
        {events.length === 0 ? (
          <p className="empty-state">
            還沒有選擇要比較的活動。到<Link to="/explore" className="link-btn">探索活動</Link>頁面點活動卡片上的比較圖示即可加入。
          </p>
        ) : (
          <>
            <div className="compare-toolbar">
              <button type="button" className="link-btn" onClick={clearCompare}>清除全部</button>
            </div>

            {/* Desktop / tablet: a real comparison table, first column = field
                names, one column per event. Hidden below the table breakpoint
                in compare.css so it never has to squeeze 3 columns onto a
                320px screen. */}
            <div className="compare-table-wrap">
              <table className="compare-table">
                <thead>
                  <tr>
                    <th scope="col"><span className="sr-only">項目</span></th>
                    {events.map((ev) => (
                      <th key={ev.id} scope="col">
                        <div className="compare-col-head">
                          <button
                            type="button"
                            className="icon-btn sm ghost"
                            aria-label={`從比較移除${ev.title}`}
                            onClick={() => removeCompare(ev.id)}
                          >
                            <Icon id="i-close" size={14} />
                          </button>
                          <Link to={`/event/${ev.id}`} state={linkState} className="compare-col-title">{ev.title}</Link>
                          <button
                            type="button"
                            className={`icon-btn sm ghost${isFavorite(ev.id) ? ' active-fav' : ''}`}
                            aria-label={isFavorite(ev.id) ? '取消收藏' : '收藏'}
                            aria-pressed={isFavorite(ev.id)}
                            onClick={() => toggleFavorite(ev.id)}
                          >
                            <Icon id="i-heart" size={14} />
                          </button>
                        </div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {rowMeta.map((meta, rowIndex) => {
                    // A row where the events genuinely disagree is worth a
                    // second look — a faint highlight, never a different
                    // solid colour per column (that would just be noise).
                    const values = rowsByEvent.map((rows) => rows[rowIndex].value)
                    const differs = events.length > 1 && new Set(values).size > 1
                    return (
                      <tr key={meta.key} className={differs ? 'differs' : undefined}>
                        <th scope="row">{meta.label}</th>
                        {events.map((ev, colIndex) => (
                          <td key={ev.id}>{rowsByEvent[colIndex][rowIndex].value}</td>
                        ))}
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>

            {/* Mobile: event-switching tabs instead of a cramped 3-column
                table — one event's full field list at a time, still fully
                keyboard/screen-reader reachable via real buttons + a field
                list (no data hidden behind hover/gesture-only affordances). */}
            <div className="compare-mobile">
              <div className="compare-tabs" role="tablist" aria-label="選擇要檢視的活動">
                {events.map((ev, i) => (
                  <button
                    key={ev.id}
                    type="button"
                    role="tab"
                    id={`compare-tab-${ev.id}`}
                    aria-selected={i === activeIndex}
                    aria-controls={`compare-panel-${ev.id}`}
                    className={`compare-tab${i === activeIndex ? ' active' : ''}`}
                    onClick={() => setActiveIndex(i)}
                  >
                    {ev.title}
                  </button>
                ))}
              </div>
              {events.map((ev, i) => (i !== activeIndex ? null : (
                <div key={ev.id} role="tabpanel" id={`compare-panel-${ev.id}`} aria-labelledby={`compare-tab-${ev.id}`} className="compare-panel">
                  <div className="compare-panel-head">
                    <Link to={`/event/${ev.id}`} state={linkState} className="compare-col-title">{ev.title}</Link>
                    <div className="card-actions">
                      <button
                        type="button"
                        className={`icon-btn sm ghost${isFavorite(ev.id) ? ' active-fav' : ''}`}
                        aria-label={isFavorite(ev.id) ? '取消收藏' : '收藏'}
                        aria-pressed={isFavorite(ev.id)}
                        onClick={() => toggleFavorite(ev.id)}
                      >
                        <Icon id="i-heart" size={14} />
                      </button>
                      <button
                        type="button"
                        className="icon-btn sm ghost"
                        aria-label={`從比較移除${ev.title}`}
                        onClick={() => removeCompare(ev.id)}
                      >
                        <Icon id="i-close" size={14} />
                      </button>
                    </div>
                  </div>
                  <dl className="compare-field-list">
                    {rowsByEvent[i].map((row) => (
                      <div key={row.key} className="compare-field-row">
                        <dt>{row.label}</dt>
                        <dd>{row.value}</dd>
                      </div>
                    ))}
                  </dl>
                </div>
              )))}
            </div>
          </>
        )}
      </main>

      <SiteFooter />
      <BottomTabs active="profile" />
    </>
  )
}
