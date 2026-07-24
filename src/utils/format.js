// Single source of truth for how money is displayed. Free stays "免費";
// anything else goes through Intl.NumberFormat rather than a raw template
// string, and nothing here ever implies a real charge was captured —
// callers show a price, not a payment status.
const nt = new Intl.NumberFormat('zh-TW')

export function formatPrice(price, free) {
  if (free || price === 0) return '免費'
  return `NT$${nt.format(price)}`
}
