import { useEffect, useMemo, useState } from 'react'
import { CURRENCIES } from '../config/store'
import { CartContext } from './cartContextValue'

const CART_KEY = 'northstar-cart'
const CURRENCY_KEY = 'northstar-currency'

function readCart() {
  try {
    const saved = JSON.parse(localStorage.getItem(CART_KEY) || '[]')
    if (!Array.isArray(saved)) return []
    return saved.filter((item) =>
      (item.catalogType === 'service' || item.catalogType === 'product')
      && typeof item.id === 'string'
      && Number.isInteger(item.quantity)
      && item.quantity > 0
      && item.quantity <= 10,
    )
  } catch {
    return []
  }
}

function readCurrency() {
  const saved = localStorage.getItem(CURRENCY_KEY)
  return CURRENCIES.includes(saved) ? saved : 'USD'
}

export function CartProvider({ children }) {
  const [items, setItems] = useState(readCart)
  const [currency, setCurrencyState] = useState(readCurrency)

  useEffect(() => {
    localStorage.setItem(CART_KEY, JSON.stringify(items))
  }, [items])

  useEffect(() => {
    localStorage.setItem(CURRENCY_KEY, currency)
  }, [currency])

  function addItem(catalogType, id) {
    const normalizedId = String(id)
    setItems((current) => {
      const existing = current.find((item) => item.catalogType === catalogType && item.id === normalizedId)
      if (existing) {
        return current.map((item) =>
          item === existing ? { ...item, quantity: Math.min(item.quantity + 1, 10) } : item,
        )
      }
      return [...current, { catalogType, id: normalizedId, quantity: 1 }]
    })
  }

  function setQuantity(catalogType, id, quantity) {
    if (!Number.isInteger(quantity) || quantity < 1 || quantity > 10) return
    setItems((current) => current.map((item) =>
      item.catalogType === catalogType && item.id === String(id)
        ? { ...item, quantity }
        : item,
    ))
  }

  function removeItem(catalogType, id) {
    setItems((current) => current.filter((item) =>
      !(item.catalogType === catalogType && item.id === String(id)),
    ))
  }

  function setCurrency(nextCurrency) {
    if (CURRENCIES.includes(nextCurrency)) setCurrencyState(nextCurrency)
  }

  const value = useMemo(() => ({
    items,
    currency,
    addItem,
    setQuantity,
    removeItem,
    setCurrency,
    clearCart: () => setItems([]),
  }), [items, currency])

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>
}
