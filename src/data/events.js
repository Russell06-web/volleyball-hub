// Central mock event data shared by the explore list and event detail page.
// No backend — this stands in for what a real API would return.

const DEFAULT_DESC = '這是一個專為排球愛好者設計的精彩活動！無論你是初學者還是經驗豐富的球員，都能在這裡找到屬於自己的樂趣。活動將由專業教練帶領，提供友善的競賽環境，讓大家在運動中交流學習。'

export const EVENTS = [
  { id: 'e1', title: '週末排球大戰', section: 'featured', tone: 'featured', badgeLabel: '推薦', level: '中階', type: '室內排球', loc: '台北市立體育館', date: '2025-12-12', time: '19:00', endTime: '21:00', capacity: 20, registered: 18, price: 280, rating: 4.8, org: '台北排球俱樂部', phone: '0912-345-678' },
  { id: 'e2', title: '高手對決之夜', section: 'featured', tone: 'featured', badgeLabel: '推薦', level: '高階', type: '室內排球', loc: '新北運動中心', date: '2025-12-14', time: '20:00', endTime: '22:00', capacity: 16, registered: 14, price: 320, rating: 4.6, org: '新北排球聯盟', phone: '0922-456-789' },
  { id: 'e3', title: '台北女子室內專場', section: 'featured', tone: 'female', badgeLabel: '女生', level: '中階', type: '室內排球', loc: '大安運動中心', date: '2025-12-17', time: '18:00', endTime: '20:00', capacity: 16, registered: 12, price: 250, rating: 4.7, org: '大安女子排球會', phone: '0933-111-222' },
  { id: 'e4', title: '還缺 3 人！', section: 'urgent', tone: 'live', badgeLabel: '今晚缺打', level: '不限', type: '室內排球', loc: '中正運動中心', date: '今晚', time: '20:00', endTime: '22:00', capacity: 8, registered: 5, price: 150, rating: 4.3, org: '中正臨打揪團', phone: '0955-333-444' },
  { id: 'e5', title: '臨打湊團中', section: 'urgent', tone: 'live', badgeLabel: '下午場', level: '不限', type: '室內排球', loc: '松山運動中心', date: '今天', time: '15:00', endTime: '17:00', capacity: 10, registered: 6, price: 120, rating: 4.2, org: '松山臨打社', phone: '0966-555-666' },
  { id: 'e6', title: '板橋男子室內賽', section: 'more', tone: 'male', badgeLabel: '男生', level: '不限', type: '室內排球', loc: '板橋體育館', date: '2025-12-16', time: '19:00', endTime: '21:00', capacity: 12, registered: 8, price: 260, rating: 4.4, org: '板橋男子聯盟', phone: '0911-222-333' },
  { id: 'e7', title: '新北混合室內聯賽', section: 'more', tone: 'mixed', badgeLabel: '混合', level: '不限', type: '室內排球', loc: '新北運動中心', date: '2025-12-19', time: '19:00', endTime: '21:00', capacity: 18, registered: 16, price: 280, rating: 4.5, org: '新北排球聯盟', phone: '0922-456-789' },
  { id: 'e8', title: '新北男子沙灘賽', section: 'more', tone: 'male', badgeLabel: '男生', level: '不限', type: '沙灘排球', loc: '福隆沙灘', date: '2025-12-20', time: '14:00', endTime: '16:00', capacity: 10, registered: 10, price: 220, rating: 4.6, org: '福隆沙灘排球社', phone: '0977-888-999' },
  { id: 'e9', title: '三重女子室內賽', section: 'more', tone: 'female', badgeLabel: '女生', level: '不限', type: '室內排球', loc: '三重體育館', date: '2025-12-18', time: '19:00', endTime: '21:00', capacity: 10, registered: 6, price: 250, rating: 4.3, org: '三重女子排球隊', phone: '0933-222-111' },
  { id: 'e10', title: '桃園混合沙灘賽', section: 'more', tone: 'mixed', badgeLabel: '混合', level: '不限', type: '沙灘排球', loc: '桃園沙灘場', date: '2025-12-20', time: '14:00', endTime: '16:00', capacity: 12, registered: 8, price: 200, rating: 4.1, org: '桃園沙灘排球會', phone: '0988-777-666' },
  { id: 'e11', title: '親子排球同樂會', section: 'more', tone: '', badgeLabel: '親子', level: '不限', type: '排球', loc: '大安森林公園', date: '2025-12-23', time: '09:00', endTime: '12:00', capacity: 30, registered: 15, price: 0, free: true, rating: 4.9, org: '親子運動推廣協會', phone: '0900-123-456' },
]

EVENTS.forEach((ev) => { if (!ev.description) ev.description = DEFAULT_DESC })

export function getEventById(id) {
  return EVENTS.find((e) => e.id === id)
}

export function isFull(ev) {
  return ev.registered >= ev.capacity
}
