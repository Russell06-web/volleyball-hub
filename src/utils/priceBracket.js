// Shared price-bracket matching so the hard filter (FilterPanel) and the
// recommendation reasoning (recommend.js) can never disagree about what
// "NT$300–500" means. Boundaries are inclusive on both sides on purpose —
// an event priced exactly NT$300 counts under both "300 以下" and
// "300–500", same for NT$500 — so nothing sits in a dead zone between
// brackets.
export function matchesPriceBracket(price, bracket) {
  switch (bracket) {
    case 'NT$ 300 以下': return price <= 300
    case 'NT$ 300–500': return price >= 300 && price <= 500
    case 'NT$ 500 以上': return price >= 500
    default: return true // '全部'
  }
}
