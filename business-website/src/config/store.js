export const CURRENCIES = ['USD', 'EUR', 'GBP', 'OMR']

export function formatPrice(prices, currency) {
  const amount = Number(prices?.[currency])
  if (!Number.isFinite(amount)) return 'Price unavailable'

  return new Intl.NumberFormat(undefined, {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount)
}
