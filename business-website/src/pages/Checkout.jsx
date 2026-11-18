import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import axios from 'axios'
import client from '../api/client'
import { ErrorMessage, Loading } from '../components/Feedback'
import { formatPrice } from '../config/store'
import { useAuth } from '../hooks/useAuth'
import { useCart } from '../hooks/useCart'

const backendClient = axios.create({
  baseURL: import.meta.env.VITE_BACKEND_API_URL || 'http://localhost:8000/api',
  timeout: 15000,
})

const initialShipping = { line1: '', line2: '', city: '', region: '', postalCode: '', country: '' }

function getErrorMessage(error) {
  return error.response?.data?.detail || error.message || 'Checkout could not be completed.'
}

export default function Checkout() {
  const { user } = useAuth()
  const { items, currency, clearCart } = useCart()
  const navigate = useNavigate()
  const [catalog, setCatalog] = useState({ services: [], products: [] })
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [mode, setMode] = useState('demo')
  const [name, setName] = useState(user?.name || '')
  const [email, setEmail] = useState(user?.email || '')
  const [shipping, setShipping] = useState(initialShipping)

  useEffect(() => {
    let active = true
    Promise.all([client.get('/services'), client.get('/products')])
      .then(([servicesResponse, productsResponse]) => {
        if (active) setCatalog({ services: servicesResponse.data, products: productsResponse.data })
      })
      .catch((requestError) => { if (active) setError(requestError.message || 'Could not load your checkout.') })
      .finally(() => { if (active) setLoading(false) })
    return () => { active = false }
  }, [])

  const lines = useMemo(() => items.map((item) => {
    const collection = item.catalogType === 'service' ? catalog.services : catalog.products
    const product = collection.find((entry) => String(entry.id) === item.id)
    const price = Number(product?.prices?.[currency])
    return { ...item, product, price, unavailable: !product || !Number.isFinite(price) || price <= 0 }
  }), [items, catalog, currency])
  const total = lines.reduce((sum, item) => sum + (item.unavailable ? 0 : item.price * item.quantity), 0)
  const needsShipping = lines.some((item) => item.product?.type === 'physical')
  const hasUnavailableItems = lines.some((item) => item.unavailable)

  async function submitDemoOrder() {
    const shippingAddress = needsShipping
      ? `${shipping.line1}${shipping.line2 ? `, ${shipping.line2}` : ''}, ${shipping.city}, ${shipping.region}, ${shipping.postalCode}, ${shipping.country}`
      : null
    const order = {
      id: crypto.randomUUID(),
      name: name.trim(),
      email: email.trim().toLowerCase(),
      currency,
      total: total.toFixed(2),
      paymentMethod: 'demo',
      status: 'demo-only-no-payment',
      shippingAddress,
      items: lines.map((item) => ({
        catalogType: item.catalogType,
        id: item.id,
        title: item.product.title,
        quantity: item.quantity,
        unitPrice: item.price.toFixed(2),
        type: item.product.type || 'service',
      })),
      createdAt: new Date().toISOString(),
    }
    const { data } = await client.post('/orders', order)
    clearCart()
    navigate(`/checkout/success?demoOrder=${encodeURIComponent(data.id)}`, { replace: true })
  }

  async function submitStripeCheckout() {
    const { data } = await backendClient.post('/checkout/sessions', {
      email: email.trim().toLowerCase(),
      currency,
      items: lines.map(({ catalogType, id, quantity }) => ({ catalogType, id, quantity })),
    })
    if (!data.url) throw new Error('The payment provider did not return a checkout URL.')
    window.location.assign(data.url)
  }

  async function handleSubmit(event) {
    event.preventDefault()
    setError('')
    setSubmitting(true)
    try {
      if (mode === 'demo') await submitDemoOrder()
      else await submitStripeCheckout()
    } catch (requestError) {
      setError(getErrorMessage(requestError))
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) return <section className="page-width page-section"><Loading label="Preparing checkout…" /></section>
  if (!items.length && !error) return <section className="page-width page-section"><div className="empty-state"><h2>Your cart is empty</h2><p>Add an item before checking out.</p><Link to="/shop">Go to the shop →</Link></div></section>

  return (
    <section className="page-width page-section">
      <div className="page-intro"><p className="eyebrow">CHECKOUT</p><h1>One last<br /><span>step.</span></h1><p>Demo checkout saves an example order but does not collect payment or trigger fulfillment.</p></div>
      {error && <ErrorMessage error={error} />}
      <div className="checkout-layout">
        <form className="checkout-form" onSubmit={handleSubmit}>
          <h2>Contact details</h2>
          <label>Full name<input autoComplete="name" maxLength="120" onChange={(event) => setName(event.target.value)} required value={name} /></label>
          <label>Email address<input autoComplete="email" maxLength="254" onChange={(event) => setEmail(event.target.value)} required type="email" value={email} /></label>
          <fieldset className="checkout-methods"><legend>Payment option</legend>
            <label><input checked={mode === 'demo'} name="paymentMode" onChange={() => setMode('demo')} type="radio" value="demo" /> Demo order — no charge</label>
            <label><input checked={mode === 'stripe'} name="paymentMode" onChange={() => setMode('stripe')} type="radio" value="stripe" /> Secure Stripe checkout (test mode)</label>
          </fieldset>
          {needsShipping && (mode === 'demo' ? (
            <fieldset className="shipping-fields"><legend>Shipping address</legend>
              <label>Address line 1<input autoComplete="address-line1" maxLength="160" onChange={(event) => setShipping({ ...shipping, line1: event.target.value })} required value={shipping.line1} /></label>
              <label>Address line 2 (optional)<input autoComplete="address-line2" maxLength="160" onChange={(event) => setShipping({ ...shipping, line2: event.target.value })} value={shipping.line2} /></label>
              <div className="form-row"><label>City<input autoComplete="address-level2" maxLength="100" onChange={(event) => setShipping({ ...shipping, city: event.target.value })} required value={shipping.city} /></label><label>State / region<input autoComplete="address-level1" maxLength="100" onChange={(event) => setShipping({ ...shipping, region: event.target.value })} required value={shipping.region} /></label></div>
              <div className="form-row"><label>Postal code<input autoComplete="postal-code" maxLength="32" onChange={(event) => setShipping({ ...shipping, postalCode: event.target.value })} required value={shipping.postalCode} /></label><label>Country<input autoComplete="country-name" maxLength="80" onChange={(event) => setShipping({ ...shipping, country: event.target.value })} required value={shipping.country} /></label></div>
            </fieldset>
          ) : <p className="store-note">Stripe Checkout collects the shipping address securely before payment. Shipping currently has no added charge.</p>)}
          <p className="store-note">Prices are manually configured by the store administrator. Shipping and taxes are not included.</p>
          {hasUnavailableItems && <p className="cart-error" role="alert">Remove unavailable items from your cart before continuing.</p>}
          <button className="button button-dark" disabled={submitting || hasUnavailableItems} type="submit">{submitting ? 'Preparing checkout…' : mode === 'demo' ? 'Place demo order' : 'Continue to Stripe'}</button>
        </form>
        <aside className="cart-summary checkout-summary"><h2>Your order</h2>{lines.map((item) => <div className="checkout-line" key={`${item.catalogType}-${item.id}`}><span>{item.product?.title || 'Unavailable item'} × {item.quantity}</span><strong>{item.unavailable ? '—' : formatPrice({ [currency]: item.price * item.quantity }, currency)}</strong></div>)}<div className="cart-total"><span>Total · {currency}</span><strong>{formatPrice({ [currency]: total }, currency)}</strong></div><Link className="cart-continue" to="/cart">← Back to cart</Link></aside>
      </div>
    </section>
  )
}
