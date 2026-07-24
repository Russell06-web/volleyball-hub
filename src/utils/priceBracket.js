import { FILTER_ALL } from '../constants/taxonomy'

// Shared price-bracket matching so the hard filter (FilterPanel) and the
// match-state reasoning (matchState.js) can never disagree about what
// "300to500" means. Boundaries are inclusive on both sides on purpose —
// an event priced exactly NT$300 counts under both "under300" and
// "300to500", same for NT$500 — so nothing sits in a dead zone between
// brackets.
export function matchesPriceBracket(price, bracket) {
  switch (bracket) {
    case 'under300': return price <= 300
    case '300to500': return price >= 300 && price <= 500
    case 'over500': return price >= 500
    default: return true // FILTER_ALL / unknown bracket
  }
}

export { FILTER_ALL }
