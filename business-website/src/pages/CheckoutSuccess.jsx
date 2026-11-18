import { useEffect, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import axios from 'axios'
import client from '../api/client'
import { Loading } from '../components/Feedback'
import { formatPrice } from '../config/store'

const backendClient = axios.create({
  baseURL: import.meta.env.VITE_BACKEND_API_URL || 'http://localhost:8000/api',
  timeout: 15000,
})

export default function CheckoutSuccess() {
  const [params] = useSearchParams()
  const demoOrderId = params.get('demoOrder')
  const sessionId = params.get('session_id')
  const [order, setOrder] = useState(null)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(Boolean(demoOrderId || sessionId))

  useEffect(() => {
    let active = true
    const request = demoOrderId
      ? client.get(`/orders/${encodeURIComponent(demoOrderId)}`)
      : sessionId
        ? backendClient.get(`/checkout/sessions/${encodeURIComponent(sessionId)}`)
        : Promise.resolve({ data: null })
    request.then(({ data }) => { if (active) setOrder(data) })
      .catch((requestError) => { if (active) setError(requestError.response?.data?.detail || requestError.message || 'Order details could not be loaded.') })
      .finally(() => { if (active) setLoading(false) })
    return () => { active = false }
  }, [demoOrderId, sessionId])

  return (
    <section className="page-width page-section">
      <div className="checkout-success">
        <p className="eyebrow">ORDER UPDATE</p>
        <h1>{demoOrderId ? 'Demo order saved.' : 'Thank you.'}</h1>
        {loading ? <Loading label="Loading order details…" /> : error ? <p className="form-feedback form-error">{error}</p> : demoOrderId ? <><p>Your demo order is recorded, but no payment was taken and nothing will be shipped or delivered.</p>{order && <p className="success-order-total">Order total: {formatPrice({ [order.currency]: order.total }, order.currency)}</p>}</> : sessionId ? <><p>Your browser returned from Stripe. Payment is confirmed only after the backend receives and verifies Stripe&apos;s webhook.</p><p className="success-order-total">Current payment status: {order?.status || 'pending confirmation'}</p></> : <p>No order reference was provided.</p>}
        <Link className="button button-dark" to="/shop">Continue shopping</Link>
      </div>
    </section>
  )
}
