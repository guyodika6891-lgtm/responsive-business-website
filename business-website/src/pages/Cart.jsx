import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import client from '../api/client'
import { ErrorMessage, Loading } from '../components/Feedback'
import { CURRENCIES, formatPrice } from '../config/store'
import { useCart } from '../hooks/useCart'

export default function Cart() {
  const { items, currency, setCurrency, setQuantity, removeItem } = useCart()
  const [catalog, setCatalog] = useState({ services: [], products: [] })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let active = true
    Promise.all([client.get('/services'), client.get('/products')])
      .then(([servicesResponse, productsResponse]) => {
        if (active) setCatalog({ services: servicesResponse.data, products: productsResponse.data })
      })
      .catch((requestError) => { if (active) setError(requestError.message || 'Could not load your cart.') })
      .finally(() => { if (active) setLoading(false) })
    return () => { active = false }
  }, [])

  const cartItems = useMemo(() => items.map((item) => {
    const collection = item.catalogType === 'service' ? catalog.services : catalog.products
    const product = collection.find((entry) => String(entry.id) === item.id)
    const price = Number(product?.prices?.[currency])
    return { ...item, product, price, unavailable: !product || !Number.isFinite(price) || price <= 0 }
  }), [items, catalog, currency])
  const total = cartItems.reduce((sum, item) => sum + (item.unavailable ? 0 : item.price * item.quantity), 0)
  const hasUnavailableItems = cartItems.some((item) => item.unavailable)

  return (
    <section className="page-width page-section">
      <div className="page-intro"><p className="eyebrow">YOUR CART</p><h1>A good place<br /><span>to start.</span></h1><p>Review your items and choose your checkout currency.</p></div>
      {loading ? <Loading label="Loading your cart…" /> : error ? <ErrorMessage error={error} /> : !cartItems.length ? (
        <div className="empty-state"><h2>Your cart is empty</h2><p>Browse services and products to find a good next step.</p><Link className="button button-dark" to="/shop">Explore the shop</Link></div>
      ) : (
        <div className="cart-layout">
          <div className="cart-list">
            {cartItems.map((item) => (
              <article className="cart-item" key={`${item.catalogType}-${item.id}`}>
                <span aria-hidden="true" className="cart-item-icon">{item.product?.icon || '✳'}</span>
                <div className="cart-item-info">
                  <strong>{item.product?.title || 'Unavailable item'}</strong>
                  <span>{item.catalogType === 'service' ? 'Service' : item.product?.type === 'physical' ? 'Physical good' : 'Digital product'}</span>
                  {item.unavailable && <span className="cart-error">This item or its price is no longer available.</span>}
                </div>
                <label className="quantity-label">Qty<input aria-label={`Quantity of ${item.product?.title || 'item'}`} max="10" min="1" onChange={(event) => setQuantity(item.catalogType, item.id, Number(event.target.value))} type="number" value={item.quantity} /></label>
                <strong className="cart-item-price">{item.unavailable ? '—' : formatPrice({ [currency]: item.price * item.quantity }, currency)}</strong>
                <button aria-label={`Remove ${item.product?.title || 'item'}`} className="remove-item" onClick={() => removeItem(item.catalogType, item.id)} type="button">Remove</button>
              </article>
            ))}
          </div>
          <aside className="cart-summary">
            <label className="currency-select">Currency<select onChange={(event) => setCurrency(event.target.value)} value={currency}>{CURRENCIES.map((code) => <option key={code}>{code}</option>)}</select></label>
            <div className="cart-total"><span>Subtotal</span><strong>{formatPrice({ [currency]: total }, currency)}</strong></div>
            <p>Shipping and any applicable taxes are not included.</p>
            {hasUnavailableItems && <p className="cart-error">Remove unavailable items before checkout.</p>}
            <Link aria-disabled={hasUnavailableItems} className={`button button-dark${hasUnavailableItems ? ' is-disabled' : ''}`} onClick={(event) => { if (hasUnavailableItems) event.preventDefault() }} to="/checkout">Continue to checkout</Link>
            <Link className="cart-continue" to="/shop">Continue shopping</Link>
          </aside>
        </div>
      )}
    </section>
  )
}
