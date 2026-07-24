// Seed data for EventsContext — this is what a real API would return on
// first load. After that, EventsContext (backed by localStorage) is the
// live source of truth: registrations increment/decrement `registered`,
// and events created through the "建立活動" wizard get appended to it.
import { futureDate } from '../utils/date'

const DEFAULT_DESC = '這是一個專為排球愛好者設計的精彩活動！無論你是初學者還是經驗豐富的球員，都能在這裡找到屬於自己的樂趣。活動將由專業教練帶領，提供友善的競賽環境，讓大家在運動中交流學習。'

export const SEED_EVENTS = [
  { id: 'e1', title: '週末排球大戰', section: 'featured', tone: 'featured', badgeLabel: '熱門', level: '中階', type: '室內排球', gender: '不限', city: '台北', loc: '台北市立體育館', date: futureDate(5), time: '19:00', endTime: '21:00', capacity: 20, registered: 18, price: 280, rating: 4.8, org: '台北排球俱樂部', phone: '0912-345-678' },
  { id: 'e2', title: '高手對決之夜', section: 'featured', tone: 'featured', badgeLabel: '熱門', level: '高階', type: '室內排球', gender: '不限', city: '新北', loc: '新北運動中心', date: futureDate(7), time: '20:00', endTime: '22:00', capacity: 16, registered: 14, price: 320, rating: 4.6, org: '新北排球聯盟', phone: '0922-456-789' },
  { id: 'e3', title: '台北女子室內專場', section: 'featured', tone: 'female', badgeLabel: '女生', level: '中階', type: '室內排球', gender: '女生', city: '台北', loc: '大安運動中心', date: futureDate(10), time: '18:00', endTime: '20:00', capacity: 16, registered: 12, price: 250, rating: 4.7, org: '大安女子排球會', phone: '0933-111-222' },
  { id: 'e4', title: '還缺 3 人！', section: 'urgent', tone: 'live', badgeLabel: '今晚缺打', level: '不限', type: '室內排球', gender: '不限', city: '台北', loc: '中正運動中心', date: '今晚', time: '20:00', endTime: '22:00', capacity: 8, registered: 5, price: 150, rating: 4.3, org: '中正臨打揪團', phone: '0955-333-444' },
  { id: 'e5', title: '臨打湊團中', section: 'urgent', tone: 'live', badgeLabel: '下午場', level: '不限', type: '室內排球', gender: '不限', city: '台北', loc: '松山運動中心', date: '今天', time: '15:00', endTime: '17:00', capacity: 10, registered: 6, price: 120, rating: 4.2, org: '松山臨打社', phone: '0966-555-666' },
  { id: 'e6', title: '板橋男子室內賽', section: 'more', tone: 'male', badgeLabel: '男生', level: '不限', type: '室內排球', gender: '男生', city: '新北', loc: '板橋體育館', date: futureDate(9), time: '19:00', endTime: '21:00', capacity: 12, registered: 8, price: 260, rating: 4.4, org: '板橋男子聯盟', phone: '0911-222-333' },
  { id: 'e7', title: '新北混合室內聯賽', section: 'more', tone: 'mixed', badgeLabel: '混合', level: '不限', type: '室內排球', gender: '混合', city: '新北', loc: '新北運動中心', date: futureDate(12), time: '19:00', endTime: '21:00', capacity: 18, registered: 16, price: 280, rating: 4.5, org: '新北排球聯盟', phone: '0922-456-789' },
  { id: 'e8', title: '新北男子沙灘賽', section: 'more', tone: 'male', badgeLabel: '男生', level: '不限', type: '沙灘排球', gender: '男生', city: '新北', loc: '福隆沙灘', date: futureDate(13), time: '14:00', endTime: '16:00', capacity: 10, registered: 10, price: 220, rating: 4.6, org: '福隆沙灘排球社', phone: '0977-888-999' },
  { id: 'e9', title: '三重女子室內賽', section: 'more', tone: 'female', badgeLabel: '女生', level: '不限', type: '室內排球', gender: '女生', city: '新北', loc: '三重體育館', date: futureDate(11), time: '19:00', endTime: '21:00', capacity: 10, registered: 6, price: 250, rating: 4.3, org: '三重女子排球隊', phone: '0933-222-111' },
  { id: 'e10', title: '桃園混合沙灘賽', section: 'more', tone: 'mixed', badgeLabel: '混合', level: '不限', type: '沙灘排球', gender: '混合', city: '桃園', loc: '桃園沙灘場', date: futureDate(13), time: '14:00', endTime: '16:00', capacity: 12, registered: 8, price: 200, rating: 4.1, org: '桃園沙灘排球會', phone: '0988-777-666' },
  { id: 'e11', title: '親子排球同樂會', section: 'more', tone: '', badgeLabel: '親子', level: '不限', type: '親子・體驗', gender: '不限', city: '台北', loc: '大安森林公園', date: futureDate(16), time: '09:00', endTime: '12:00', capacity: 30, registered: 15, price: 0, free: true, rating: 4.9, org: '親子運動推廣協會', phone: '0900-123-456' },
  { id: 'e12', title: '桃園草地排球嘉年華', section: 'more', tone: '', badgeLabel: '體驗', level: '初階', type: '草地排球', gender: '不限', city: '桃園', loc: '青埔運動公園', date: futureDate(18), time: '10:00', endTime: '13:00', capacity: 24, registered: 9, price: 180, rating: 4.4, org: '桃園草地排球推廣會', phone: '0922-000-111' },

  // "我主辦的活動" — same schema as every other event (so they behave
  // identically in Explore/EventDetail), just flagged ownedByMe so
  // Manage.jsx can filter to "events this demo user organises".
  { id: 'e13', title: '65Player 週五夜晚男排', section: 'more', tone: 'male', badgeLabel: '男生', level: '中階', type: '室內排球', gender: '男生', city: '台北', loc: '台北市立體育館', date: futureDate(6), time: '19:00', endTime: '22:00', capacity: 18, registered: 18, price: 260, rating: 4.5, org: 'Russell', phone: '0912-345-678', ownedByMe: true },
  { id: 'e14', title: '週末混打友誼賽', section: 'more', tone: 'mixed', badgeLabel: '混合', level: '初階', type: '室內排球', gender: '混合', city: '台北', loc: '大安運動中心', date: futureDate(8), time: '14:00', endTime: '17:00', capacity: 16, registered: 12, price: 200, rating: 4.2, org: 'Russell', phone: '0912-345-678', ownedByMe: true },
  { id: 'e15', title: '高階對抗賽', section: 'more', tone: '', badgeLabel: '', level: '高階', type: '室內排球', gender: '不限', city: '台北', loc: '中正運動中心', date: futureDate(9), time: '20:00', endTime: '22:00', capacity: 12, registered: 10, price: 300, rating: 4.3, org: 'Russell', phone: '0912-345-678', ownedByMe: true },
]

SEED_EVENTS.forEach((ev) => { if (!ev.description) ev.description = DEFAULT_DESC })

export function isFull(ev) {
  return ev.registered >= ev.capacity
}
