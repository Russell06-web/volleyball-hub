// Seed data for EventsContext — this is what a real API would return on
// first load. After that, EventsContext (backed by localStorage) is the
// live source of truth. Dates are generated relative to "today" (Taipei)
// so the demo never ships with events that already happened, and then
// persisted as plain strings — see EventsContext, which only re-reads
// this seed when vh-events is empty, so a page refresh never pushes
// these dates further into the future.
import { futureDate } from '../utils/date'
import { CURRENT_USER_ID, EVENT_STATUS } from '../constants/taxonomy'

// A neutral fallback — never claims a coach, insurance, or "skill
// improvement" that most seed events don't actually have. Individual
// events below get their own description; this only backstops one that
// doesn't set its own.
const DEFAULT_DESC = '這是一場排球活動，歡迎喜歡排球的朋友一起參加。詳細內容請參考下方活動資訊與規則說明。'
const DEFAULT_RULES = '請提前 10 分鐘到場報到，穿著運動服裝及室內排球鞋，自備飲水及毛巾。'

// Every organiser name and phone number here is an obviously-fake demo
// identity — see docs/PRODUCT_LIMITATIONS.md. Real club names paired with
// real-looking phone numbers would read as actual personal data to
// anyone skimming the seed data.
function demoContact(n) {
  return `0900-000-${String(n).padStart(3, '0')}`
}

function makeEvent(overrides) {
  const price = overrides.price ?? 0
  return {
    ownerId: null,
    description: DEFAULT_DESC,
    rules: DEFAULT_RULES,
    timezone: 'Asia/Taipei',
    waitlistCount: 0,
    paymentMethod: price === 0 ? '無需付款' : '現場付款',
    isFeatured: false,
    isUrgent: false,
    hasInsurance: false,
    hasCoach: false,
    playStyle: '',
    features: [],
    status: EVENT_STATUS.PUBLISHED,
    // Volleyball-specific defaults — every event below overrides at least
    // some of these with something that actually matches its own type/
    // level/description, rather than every event looking identical.
    volleyballFormat: 'sixPlayer',
    netHeight: 'unspecified',
    courtSurface: 'unspecified',
    rotationRequired: false,
    liberoAllowed: false,
    soloJoinAllowed: true,
    equipmentProvided: [],
    positionsNeeded: [],
    skillNotes: '',
    createdAt: Date.now(),
    updatedAt: Date.now(),
    ...overrides,
    price,
  }
}

export const SEED_EVENTS = [
  makeEvent({
    id: 'e1', title: '週末排球大戰', type: 'indoor', level: 'intermediate', gender: 'open',
    city: 'taipei', venueName: '台北市立體育館', address: '台北市松山區南京東路四段10號',
    date: futureDate(5), startTime: '19:00', endTime: '21:00',
    capacity: 20, registeredCount: 18, price: 280,
    description: '中階程度的週末例行賽，現場有教練協助分隊與講解基本戰術，並含活動期間保險。適合想固定運動、認識球友的人參加。',
    organizerName: '台北排球俱樂部（示範）', organizerContact: demoContact(1),
    isFeatured: true, hasInsurance: true, hasCoach: true, playStyle: 'competitive',
    features: ['提供飲水機', '更衣室'],
    volleyballFormat: 'sixPlayer', netHeight: 'mixed', courtSurface: 'wood',
    rotationRequired: true, liberoAllowed: true, soloJoinAllowed: true,
    equipmentProvided: ['volleyball', 'net', 'water', 'locker'],
    positionsNeeded: [{ position: 'opposite', count: 1 }, { position: 'libero', count: 1 }],
    skillNotes: '建議有基礎輪轉與接發球經驗，新手可先旁觀熟悉節奏。',
  }),
  makeEvent({
    id: 'e2', title: '高手對決之夜', type: 'indoor', level: 'advanced', gender: 'open',
    city: 'newTaipei', venueName: '新北運動中心', address: '新北市板橋區縣民大道二段7號',
    date: futureDate(7), startTime: '20:00', endTime: '22:00',
    capacity: 16, registeredCount: 14, price: 320,
    description: '高階程度的對抗賽，節奏較快、對抗性較強，建議有一定比賽經驗再報名。含活動期間保險，僅接受組隊報名，不開放單人加入。',
    organizerName: '新北排球聯盟（示範）', organizerContact: demoContact(2),
    isFeatured: true, hasInsurance: true, playStyle: 'competitive',
    volleyballFormat: 'sixPlayer', netHeight: 'mixed', courtSurface: 'pu',
    rotationRequired: true, liberoAllowed: true, soloJoinAllowed: false,
    equipmentProvided: ['volleyball', 'net', 'water', 'locker', 'shower'],
    positionsNeeded: [{ position: 'middle', count: 1 }, { position: 'opposite', count: 1 }],
    skillNotes: '需具備正式比賽經驗，熟悉基本輪轉與戰術跑位。',
  }),
  makeEvent({
    id: 'e3', title: '台北女子室內專場', type: 'indoor', level: 'intermediate', gender: 'female',
    city: 'taipei', venueName: '大安運動中心', address: '台北市大安區',
    date: futureDate(10), startTime: '18:00', endTime: '20:00',
    capacity: 16, registeredCount: 12, price: 250,
    description: '限女生參加的中階場次，現場有教練帶暖身與基本動作複習，氣氛friendly，適合想找同性球友的人。',
    organizerName: '大安女子排球會（示範）', organizerContact: demoContact(3),
    isFeatured: true, hasCoach: true, features: ['更衣室', '飲水機'],
    volleyballFormat: 'sixPlayer', netHeight: 'women', courtSurface: 'wood',
    rotationRequired: true, liberoAllowed: true, soloJoinAllowed: true,
    equipmentProvided: ['volleyball', 'net', 'water', 'locker'],
    positionsNeeded: [{ position: 'setter', count: 1 }, { position: 'universal', count: 3 }],
    skillNotes: '建議熟悉基本傳接動作，教練會協助複習輪轉。',
  }),
  makeEvent({
    id: 'e4', title: '中正今晚室內臨打', type: 'indoor', level: 'open', gender: 'open',
    city: 'taipei', venueName: '中正運動中心', address: '台北市中正區信義路一段1號',
    date: futureDate(0), startTime: '20:00', endTime: '22:00',
    capacity: 8, registeredCount: 5, price: 150,
    description: '今晚臨時揪的休閒場，不限程度，來練球、動一動即可，現場依人數自然分隊。主辦方尚未提供網高安排。',
    organizerName: '中正臨打揪團（示範）', organizerContact: demoContact(4),
    isUrgent: true, playStyle: 'casual',
    volleyballFormat: 'recreational', netHeight: 'unspecified', courtSurface: 'wood',
    rotationRequired: false, liberoAllowed: false, soloJoinAllowed: true,
    equipmentProvided: ['volleyball', 'water'],
    positionsNeeded: [{ position: 'setter', count: 1 }, { position: 'middle', count: 1 }, { position: 'universal', count: 1 }],
    skillNotes: '休閒臨打，不限程度，新手也歡迎。',
  }),
  makeEvent({
    id: 'e5', title: '松山下午休閒臨打', type: 'indoor', level: 'open', gender: 'open',
    city: 'taipei', venueName: '松山運動中心', address: '台北市松山區',
    date: futureDate(0), startTime: '15:00', endTime: '17:00',
    capacity: 10, registeredCount: 6, price: 120,
    description: '平日下午的休閒臨打場次，步調輕鬆，適合想利用空檔運動的人。主辦方尚未說明場地材質。',
    organizerName: '松山臨打社（示範）', organizerContact: demoContact(5),
    isUrgent: true, playStyle: 'casual',
    volleyballFormat: 'recreational', netHeight: 'unspecified', courtSurface: 'unspecified',
    rotationRequired: false, liberoAllowed: false, soloJoinAllowed: true,
    equipmentProvided: ['volleyball'],
    positionsNeeded: [{ position: 'universal', count: 4 }],
    skillNotes: '不限位置與程度，來就能打。',
  }),
  makeEvent({
    id: 'e6', title: '板橋男子室內賽', type: 'indoor', level: 'open', gender: 'male',
    city: 'newTaipei', venueName: '板橋體育館', address: '新北市板橋區',
    date: futureDate(9), startTime: '19:00', endTime: '21:00',
    capacity: 12, registeredCount: 8, price: 260,
    description: '限男生參加的室內場次，不限程度，適合喜歡對抗性球風的球友。',
    organizerName: '板橋男子聯盟（示範）', organizerContact: demoContact(6),
    volleyballFormat: 'sixPlayer', netHeight: 'men', courtSurface: 'wood',
    rotationRequired: true, liberoAllowed: false, soloJoinAllowed: true,
    equipmentProvided: ['volleyball', 'net', 'parking'],
    positionsNeeded: [{ position: 'outside', count: 2 }, { position: 'universal', count: 2 }],
    skillNotes: '不限程度，現場依球風自然分隊。',
  }),
  makeEvent({
    id: 'e7', title: '新北混合室內聯賽', type: 'indoor', level: 'open', gender: 'mixed',
    city: 'newTaipei', venueName: '新北運動中心', address: '新北市板橋區縣民大道二段7號',
    date: futureDate(12), startTime: '19:00', endTime: '21:00',
    capacity: 18, registeredCount: 16, price: 280,
    description: '男女混合組隊的例行聯賽場次，含活動期間保險，適合想跟不同球友配合的人。',
    organizerName: '新北排球聯盟（示範）', organizerContact: demoContact(7),
    hasInsurance: true,
    volleyballFormat: 'sixPlayer', netHeight: 'mixed', courtSurface: 'pu',
    rotationRequired: true, liberoAllowed: true, soloJoinAllowed: true,
    equipmentProvided: ['volleyball', 'net', 'water', 'locker', 'shower'],
    positionsNeeded: [{ position: 'setter', count: 1 }, { position: 'libero', count: 1 }],
    skillNotes: '男女混合上場，建議熟悉基本輪轉規則。',
  }),
  makeEvent({
    id: 'e8', title: '新北男子沙灘賽', type: 'beach', level: 'open', gender: 'male',
    city: 'newTaipei', venueName: '福隆沙灘', address: '新北市貢寮區福隆',
    date: futureDate(13), startTime: '14:00', endTime: '16:00',
    capacity: 10, registeredCount: 10, price: 220,
    description: '戶外沙灘場地的男子組對抗賽，注意防曬與補水，沙地移動較耗體力。',
    organizerName: '福隆沙灘排球社（示範）', organizerContact: demoContact(8),
    playStyle: 'beachCompetitive',
    volleyballFormat: 'beachTwoPlayer', netHeight: 'men', courtSurface: 'sand',
    rotationRequired: false, liberoAllowed: false, soloJoinAllowed: false,
    equipmentProvided: ['volleyball', 'net', 'water'],
    positionsNeeded: [],
    skillNotes: '沙灘雙人制，僅接受兩人一組報名，請自行組隊。',
  }),
  makeEvent({
    id: 'e9', title: '三重女子室內賽', type: 'indoor', level: 'open', gender: 'female',
    city: 'newTaipei', venueName: '三重體育館', address: '新北市三重區',
    date: futureDate(11), startTime: '19:00', endTime: '21:00',
    capacity: 10, registeredCount: 6, price: 250,
    description: '限女生參加的室內場次，不限程度，現場氣氛以交流為主。',
    organizerName: '三重女子排球隊（示範）', organizerContact: demoContact(9),
    volleyballFormat: 'sixPlayer', netHeight: 'women', courtSurface: 'wood',
    rotationRequired: false, liberoAllowed: true, soloJoinAllowed: true,
    equipmentProvided: ['volleyball', 'net', 'locker'],
    positionsNeeded: [{ position: 'universal', count: 4 }],
    skillNotes: '不限程度，以交流為主，新手友善。',
  }),
  makeEvent({
    id: 'e10', title: '桃園混合沙灘賽', type: 'beach', level: 'open', gender: 'mixed',
    city: 'taoyuan', venueName: '桃園沙灘場', address: '桃園市',
    date: futureDate(13), startTime: '14:00', endTime: '16:00',
    capacity: 12, registeredCount: 8, price: 200,
    description: '男女混合組隊的沙灘場次，戶外進行，請自備防曬用品。',
    organizerName: '桃園沙灘排球會（示範）', organizerContact: demoContact(10),
    playStyle: 'beachCompetitive',
    volleyballFormat: 'beachTwoPlayer', netHeight: 'mixed', courtSurface: 'sand',
    rotationRequired: false, liberoAllowed: false, soloJoinAllowed: true,
    equipmentProvided: ['volleyball', 'net', 'water', 'parking'],
    positionsNeeded: [],
    skillNotes: '沙灘雙人制，可單人報名，現場協助配對。',
  }),
  makeEvent({
    id: 'e11', title: '親子排球同樂會', type: 'family', level: 'open', gender: 'open',
    city: 'taipei', venueName: '大安森林公園', address: '台北市大安區新生南路二段1號',
    date: futureDate(16), startTime: '09:00', endTime: '12:00',
    capacity: 30, registeredCount: 15, price: 0,
    description: '適合親子共同參加的體驗場次，現場有教練帶簡易遊戲式練習，不強調競賽性。',
    organizerName: '親子運動推廣協會（示範）', organizerContact: demoContact(11),
    hasCoach: true, features: ['提供器材', '親子友善場地'],
    volleyballFormat: 'recreational', netHeight: 'unspecified', courtSurface: 'grass',
    rotationRequired: false, liberoAllowed: false, soloJoinAllowed: true,
    equipmentProvided: ['volleyball', 'water'],
    positionsNeeded: [],
    skillNotes: '體驗性質，不需要任何排球基礎，全家大小皆可參加。',
  }),
  makeEvent({
    id: 'e12', title: '桃園草地排球嘉年華', type: 'grass', level: 'beginner', gender: 'open',
    city: 'taoyuan', venueName: '青埔運動公園', address: '桃園市中壢區青埔',
    date: futureDate(18), startTime: '10:00', endTime: '13:00',
    capacity: 24, registeredCount: 9, price: 180,
    description: '適合初階新手的草地體驗場次，現場有教練簡單講解規則與基本動作。',
    organizerName: '桃園草地排球推廣會（示範）', organizerContact: demoContact(12),
    hasCoach: true, playStyle: 'experience',
    volleyballFormat: 'recreational', netHeight: 'unspecified', courtSurface: 'grass',
    rotationRequired: false, liberoAllowed: false, soloJoinAllowed: true,
    equipmentProvided: ['volleyball', 'water', 'parking'],
    positionsNeeded: [],
    skillNotes: '初階新手適合，教練會現場講解基本規則。',
  }),

  // "我主辦的活動" — same schema as every other event (so they behave
  // identically in Explore/EventDetail), just flagged with ownerId so
  // Manage.jsx can filter to "events this demo organiser runs". The
  // organiser identity here is deliberately generic ("示範主辦者") rather
  // than a person's name, since there's no real account behind it.
  makeEvent({
    id: 'e13', title: '65Player 週五夜晚男排', type: 'indoor', level: 'intermediate', gender: 'male',
    city: 'taipei', venueName: '台北市立體育館', address: '台北市松山區南京東路四段10號',
    date: futureDate(6), startTime: '19:00', endTime: '22:00',
    capacity: 18, registeredCount: 18, price: 260,
    description: '固定班底的男子夜間場次，偶爾開放外部球友報名遞補空缺名額。',
    organizerName: '示範主辦者', organizerContact: demoContact(13), ownerId: CURRENT_USER_ID,
    volleyballFormat: 'sixPlayer', netHeight: 'men', courtSurface: 'wood',
    rotationRequired: true, liberoAllowed: true, soloJoinAllowed: true,
    equipmentProvided: ['volleyball', 'net', 'locker'],
    positionsNeeded: [], // full — nothing left to recruit for
    skillNotes: '固定班底為主，需有基本輪轉與比賽經驗。',
  }),
  makeEvent({
    id: 'e14', title: '週末混打友誼賽', type: 'indoor', level: 'beginner', gender: 'mixed',
    city: 'taipei', venueName: '大安運動中心', address: '台北市大安區',
    date: futureDate(8), startTime: '14:00', endTime: '17:00',
    capacity: 16, registeredCount: 12, price: 200,
    description: '初階程度的混合友誼賽，步調輕鬆，適合剛開始接觸排球的人。',
    organizerName: '示範主辦者', organizerContact: demoContact(14), ownerId: CURRENT_USER_ID,
    volleyballFormat: 'sixPlayer', netHeight: 'mixed', courtSurface: 'wood',
    rotationRequired: false, liberoAllowed: false, soloJoinAllowed: true,
    equipmentProvided: ['volleyball', 'net', 'water'],
    positionsNeeded: [{ position: 'universal', count: 4 }],
    skillNotes: '初階友誼賽，不要求任何比賽經驗。',
  }),
  makeEvent({
    id: 'e15', title: '高階對抗賽', type: 'indoor', level: 'advanced', gender: 'open',
    city: 'taipei', venueName: '中正運動中心', address: '台北市中正區信義路一段1號',
    date: futureDate(9), startTime: '20:00', endTime: '22:00',
    capacity: 12, registeredCount: 10, price: 300,
    description: '高階程度的對抗場次，節奏較快，建議有比賽經驗者再報名。',
    organizerName: '示範主辦者', organizerContact: demoContact(15), ownerId: CURRENT_USER_ID,
    volleyballFormat: 'sixPlayer', netHeight: 'mixed', courtSurface: 'wood',
    rotationRequired: true, liberoAllowed: true, soloJoinAllowed: true,
    equipmentProvided: ['volleyball', 'net'],
    positionsNeeded: [{ position: 'opposite', count: 1 }, { position: 'libero', count: 1 }],
    skillNotes: '需具備比賽經驗，熟悉基本輪轉。',
  }),
]

export function isFull(ev) {
  return ev.registeredCount >= ev.capacity
}
