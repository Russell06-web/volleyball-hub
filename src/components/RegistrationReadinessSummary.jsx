import { Icon } from './Icons'
import { getGenderLabel, getLevelLabel } from '../constants/taxonomy'
import {
  COURT_SURFACE_UNSPECIFIED, getCourtSurfaceLabel, getNetHeightLabel, getVolleyballFormatLabel,
  NET_HEIGHT_UNSPECIFIED,
} from '../constants/volleyballTaxonomy'
import { getPositionShortageSummary } from '../utils/positionShortage'
import { getRemainingSlots } from '../utils/eventStatus'
import { getEventInformationQuality } from '../utils/informationQuality'
import { formatPrice } from '../utils/format'

const STATE_LABEL = { ok: '已明確', check: '請確認', unknown: '資訊未提供' }

// Every row states its own confidence explicitly in words (已明確／請確認／
// 資訊未提供) — the icon/colour is a reinforcement, never the only signal,
// so this reads the same with or without colour vision.
function computeReadinessItems(event) {
  const remaining = getRemainingSlots(event)
  const shortage = getPositionShortageSummary(event)
  const infoQuality = getEventInformationQuality(event)
  const netHeightKnown = Boolean(event.netHeight) && event.netHeight !== NET_HEIGHT_UNSPECIFIED
  const courtSurfaceKnown = Boolean(event.courtSurface) && event.courtSurface !== COURT_SURFACE_UNSPECIFIED

  return [
    { key: 'level', label: '程度限制', state: 'ok', value: getLevelLabel(event.level) },
    { key: 'gender', label: '性別限制', state: 'ok', value: getGenderLabel(event.gender) },
    { key: 'netHeight', label: '網高', state: netHeightKnown ? 'ok' : 'unknown', value: getNetHeightLabel(event.netHeight) },
    { key: 'format', label: '球制', state: 'ok', value: getVolleyballFormatLabel(event.volleyballFormat) },
    { key: 'courtSurface', label: '場地材質', state: courtSurfaceKnown ? 'ok' : 'unknown', value: getCourtSurfaceLabel(event.courtSurface) },
    { key: 'rotation', label: '是否需要輪轉', state: 'ok', value: event.rotationRequired ? '是' : '否' },
    {
      key: 'soloJoin',
      label: '報名方式',
      state: event.soloJoinAllowed ? 'ok' : 'check',
      value: event.soloJoinAllowed ? '可個人報名' : '僅接受完整隊伍報名，請先組好隊伍再報名',
    },
    {
      key: 'positions',
      label: '位置需求',
      state: shortage ? 'check' : 'ok',
      value: shortage ? shortage.text : '目前沒有主辦方回報的缺人狀況',
    },
    {
      key: 'slots',
      label: '剩餘名額',
      state: remaining <= 0 ? 'check' : (remaining <= 3 ? 'check' : 'ok'),
      value: remaining <= 0 ? '已額滿，可加入候補' : `尚有 ${remaining} 位`,
    },
    { key: 'price', label: '費用', state: 'ok', value: formatPrice(event.price) },
    {
      key: 'paymentMethod',
      label: '付款方式',
      state: event.paymentMethod ? 'ok' : 'unknown',
      value: event.paymentMethod || '主辦方尚未說明付款方式',
    },
    {
      key: 'info',
      label: '資訊完整度',
      state: infoQuality.state === 'complete' ? 'ok' : (infoQuality.state === 'needsInfo' ? 'check' : 'unknown'),
      value: infoQuality.label,
    },
    {
      key: 'rules',
      label: '重要規則',
      state: event.rules ? 'ok' : 'unknown',
      value: event.rules || '主辦方尚未提供活動須知',
    },
  ]
}

// Shown before the confirmation step (EventDetail, above its CTA in
// reading order; QuickJoinConfirmDialog/RegisterModal can render it too)
// so nothing important is buried behind a nested "詳情" expansion.
export default function RegistrationReadinessSummary({ event }) {
  const items = computeReadinessItems(event)
  return (
    <section className="readiness-summary" aria-label="報名前重點資訊">
      <h2>報名前重點資訊</h2>
      <ul className="readiness-list">
        {items.map((item) => (
          <li key={item.key} className={`readiness-item ${item.state}`}>
            <Icon id={item.state === 'ok' ? 'i-check' : 'i-info'} size={16} className={item.state} />
            <div>
              <b>{item.label}</b>
              <span><span className="readiness-state">{STATE_LABEL[item.state]}</span>　{item.value}</span>
            </div>
          </li>
        ))}
      </ul>
    </section>
  )
}
