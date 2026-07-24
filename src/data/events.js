// Seed data for EventsContext — this is what a real API would return on
// first load. After that, EventsContext (backed by localStorage) is the
// live source of truth. Dates are generated relative to "today" the
// moment this module first runs (so the demo never ships with events
// that already happened) and then persisted as plain strings — see
// EventsContext, which only re-reads this seed when vh-events is empty,
// so a page refresh never pushes these dates further into the future.
import { futureDate } from '../utils/date'
import { CURRENT_USER_ID, EVENT_STATUS } from '../constants/taxonomy'

const DEFAULT_DESC = '這是一個專為排球愛好者設計的精彩活動！無論你是初學者還是經驗豐富的球員，都能在這裡找到屬於自己的樂趣。活動將由專業教練帶領，提供友善的競賽環境，讓大家在運動中交流學習。'
const DEFAULT_RULES = '請提前 10 分鐘到場報到，穿著運動服裝及室內排球鞋，自備飲水及毛巾。'

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
    organizerName: '台北排球俱樂部', organizerContact: '0912-345-678',
    isFeatured: true, hasInsurance: true, hasCoach: true, playStyle: '競技對抗',
    features: ['提供飲水機', '更衣室'],
  }),
  makeEvent({
    id: 'e2', title: '高手對決之夜', type: 'indoor', level: 'advanced', gender: 'open',
    city: 'newTaipei', venueName: '新北運動中心', address: '新北市板橋區縣民大道二段7號',
    date: futureDate(7), startTime: '20:00', endTime: '22:00',
    capacity: 16, registeredCount: 14, price: 320,
    organizerName: '新北排球聯盟', organizerContact: '0922-456-789',
    isFeatured: true, hasInsurance: true, playStyle: '競技對抗',
  }),
  makeEvent({
    id: 'e3', title: '台北女子室內專場', type: 'indoor', level: 'intermediate', gender: 'female',
    city: 'taipei', venueName: '大安運動中心', address: '台北市大安區',
    date: futureDate(10), startTime: '18:00', endTime: '20:00',
    capacity: 16, registeredCount: 12, price: 250,
    organizerName: '大安女子排球會', organizerContact: '0933-111-222',
    isFeatured: true, hasCoach: true, features: ['更衣室', '飲水機'],
  }),
  makeEvent({
    id: 'e4', title: '還缺 3 人！', type: 'indoor', level: 'open', gender: 'open',
    city: 'taipei', venueName: '中正運動中心', address: '台北市中正區信義路一段1號',
    date: futureDate(0), startTime: '20:00', endTime: '22:00',
    capacity: 8, registeredCount: 5, price: 150,
    organizerName: '中正臨打揪團', organizerContact: '0955-333-444',
    isUrgent: true, playStyle: '休閒臨打',
  }),
  makeEvent({
    id: 'e5', title: '臨打湊團中', type: 'indoor', level: 'open', gender: 'open',
    city: 'taipei', venueName: '松山運動中心', address: '台北市松山區',
    date: futureDate(0), startTime: '15:00', endTime: '17:00',
    capacity: 10, registeredCount: 6, price: 120,
    organizerName: '松山臨打社', organizerContact: '0966-555-666',
    isUrgent: true, playStyle: '休閒臨打',
  }),
  makeEvent({
    id: 'e6', title: '板橋男子室內賽', type: 'indoor', level: 'open', gender: 'male',
    city: 'newTaipei', venueName: '板橋體育館', address: '新北市板橋區',
    date: futureDate(9), startTime: '19:00', endTime: '21:00',
    capacity: 12, registeredCount: 8, price: 260,
    organizerName: '板橋男子聯盟', organizerContact: '0911-222-333',
  }),
  makeEvent({
    id: 'e7', title: '新北混合室內聯賽', type: 'indoor', level: 'open', gender: 'mixed',
    city: 'newTaipei', venueName: '新北運動中心', address: '新北市板橋區縣民大道二段7號',
    date: futureDate(12), startTime: '19:00', endTime: '21:00',
    capacity: 18, registeredCount: 16, price: 280,
    organizerName: '新北排球聯盟', organizerContact: '0922-456-789',
    hasInsurance: true,
  }),
  makeEvent({
    id: 'e8', title: '新北男子沙灘賽', type: 'beach', level: 'open', gender: 'male',
    city: 'newTaipei', venueName: '福隆沙灘', address: '新北市貢寮區福隆',
    date: futureDate(13), startTime: '14:00', endTime: '16:00',
    capacity: 10, registeredCount: 10, price: 220,
    organizerName: '福隆沙灘排球社', organizerContact: '0977-888-999',
    playStyle: '沙灘競技',
  }),
  makeEvent({
    id: 'e9', title: '三重女子室內賽', type: 'indoor', level: 'open', gender: 'female',
    city: 'newTaipei', venueName: '三重體育館', address: '新北市三重區',
    date: futureDate(11), startTime: '19:00', endTime: '21:00',
    capacity: 10, registeredCount: 6, price: 250,
    organizerName: '三重女子排球隊', organizerContact: '0933-222-111',
  }),
  makeEvent({
    id: 'e10', title: '桃園混合沙灘賽', type: 'beach', level: 'open', gender: 'mixed',
    city: 'taoyuan', venueName: '桃園沙灘場', address: '桃園市',
    date: futureDate(13), startTime: '14:00', endTime: '16:00',
    capacity: 12, registeredCount: 8, price: 200,
    organizerName: '桃園沙灘排球會', organizerContact: '0988-777-666',
    playStyle: '沙灘競技',
  }),
  makeEvent({
    id: 'e11', title: '親子排球同樂會', type: 'family', level: 'open', gender: 'open',
    city: 'taipei', venueName: '大安森林公園', address: '台北市大安區新生南路二段1號',
    date: futureDate(16), startTime: '09:00', endTime: '12:00',
    capacity: 30, registeredCount: 15, price: 0,
    organizerName: '親子運動推廣協會', organizerContact: '0900-123-456',
    hasCoach: true, features: ['提供器材', '親子友善場地'],
  }),
  makeEvent({
    id: 'e12', title: '桃園草地排球嘉年華', type: 'grass', level: 'beginner', gender: 'open',
    city: 'taoyuan', venueName: '青埔運動公園', address: '桃園市中壢區青埔',
    date: futureDate(18), startTime: '10:00', endTime: '13:00',
    capacity: 24, registeredCount: 9, price: 180,
    organizerName: '桃園草地排球推廣會', organizerContact: '0922-000-111',
    hasCoach: true, playStyle: '休閒體驗',
  }),

  // "我主辦的活動" — same schema as every other event (so they behave
  // identically in Explore/EventDetail), just flagged with ownerId so
  // Manage.jsx can filter to "events this demo organiser runs".
  makeEvent({
    id: 'e13', title: '65Player 週五夜晚男排', type: 'indoor', level: 'intermediate', gender: 'male',
    city: 'taipei', venueName: '台北市立體育館', address: '台北市松山區南京東路四段10號',
    date: futureDate(6), startTime: '19:00', endTime: '22:00',
    capacity: 18, registeredCount: 18, price: 260,
    organizerName: 'Russell', organizerContact: '0912-345-678', ownerId: CURRENT_USER_ID,
  }),
  makeEvent({
    id: 'e14', title: '週末混打友誼賽', type: 'indoor', level: 'beginner', gender: 'mixed',
    city: 'taipei', venueName: '大安運動中心', address: '台北市大安區',
    date: futureDate(8), startTime: '14:00', endTime: '17:00',
    capacity: 16, registeredCount: 12, price: 200,
    organizerName: 'Russell', organizerContact: '0912-345-678', ownerId: CURRENT_USER_ID,
  }),
  makeEvent({
    id: 'e15', title: '高階對抗賽', type: 'indoor', level: 'advanced', gender: 'open',
    city: 'taipei', venueName: '中正運動中心', address: '台北市中正區信義路一段1號',
    date: futureDate(9), startTime: '20:00', endTime: '22:00',
    capacity: 12, registeredCount: 10, price: 300,
    organizerName: 'Russell', organizerContact: '0912-345-678', ownerId: CURRENT_USER_ID,
  }),
]

export function isFull(ev) {
  return ev.registeredCount >= ev.capacity
}
