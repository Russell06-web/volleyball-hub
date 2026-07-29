import { FILTER_ALL } from '../constants/taxonomy'

// Shared price-bracket matching so the hard filter (FilterPanel) and the
// match-state reasoning (matchState.js) can never disagree about what
// "underOrEqual300" means. Brackets are mutually exclusive: NT$300 only
// ever matches underOrEqual300, NT$500 only ever matches
// between301And500 — nothing sits in two brackets, and free (price 0)
// is its own bracket rather than the bottom of the cheapest paid one.
export function matchesPriceBracket(price, bracket) {
  switch (bracket) {
    case 'free': return price === 0
    case 'underOrEqual300': return price >= 1 && price <= 300
    case 'between301And500': return price >= 301 && price <= 500
    case 'over500': return price >= 501
    default: return true // FILTER_ALL / unknown bracket
  }
}

export { FILTER_ALL }
