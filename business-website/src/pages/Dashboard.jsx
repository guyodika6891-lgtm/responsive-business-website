import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import client from '../api/client'
import { ErrorMessage, Loading } from '../components/Feedback'
import { useAuth } from '../hooks/useAuth'
import { formatPrice } from '../config/store'

const FAVORITES_KEY = 'northstar-favorites'

function readFavorites() {
  try { return JSON.parse(localStorage.getItem(FAVORITES_KEY) || '[]') } catch { return [] }
}

export default function Dashboard() {
  const { user } = useAuth()
  const [messages, setMessages] = useState([])
  const [services, setServices] = useState([])
  const [orders, setOrders] = useState([])
  const [favorites, setFavorites] = useState(readFavorites)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let active = true
    Promise.all([
      client.get('/messages', { params: { email: user.email } }),
      client.get('/services'),
      client.get('/orders', { params: { email: user.email } }),
    ]).then(([messageResponse, serviceResponse, orderResponse]) => {
      if (active) {
        setMessages(messageResponse.data)
        setServices(serviceResponse.data)
        setOrders(orderResponse.data)
      }
    }).catch((requestError) => {
      if (active) setError(requestError.message || 'Could not load your dashboard.')
    }).finally(() => { if (active) setLoading(false) })
    return () => { active = false }
  }, [user.email])

  function toggleFavorite(id) {
    const next = favorites.includes(String(id)) ? favorites.filter((item) => item !== String(id)) : [...favorites, String(id)]
    localStorage.setItem(FAVORITES_KEY, JSON.stringify(next))
    setFavorites(next)
  }

  const savedServices = services.filter((item) => favorites.includes(String(item.id)))

  return (
    <section className="page-width page-section dashboard-page">
      <p className="eyebrow">YOUR NORTHSTAR ACCOUNT</p>
      <h1>Good to see you, <span>{user.name.split(' ')[0]}.</span></h1>
      <p className="dashboard-intro">Keep up with the conversations you&apos;ve started and the services you&apos;ve saved.</p>
      {loading ? <Loading label="Loading your dashboard…" /> : error ? <ErrorMessage error={error} /> : <>
        <div className="dashboard-stats">
          <article><span>INQUIRIES SENT</span><strong>{messages.length}</strong></article>
          <article><span>SAVED SERVICES</span><strong>{savedServices.length}</strong></article>
          <article><span>ACCOUNT</span><strong className="account-role">Customer</strong></article>
        </div>
        <div className="dashboard-columns">
          <section className="dashboard-panel">
            <div className="panel-heading"><h2>Your inquiries</h2><Link className="text-button" to="/contact">Start a conversation ↗</Link></div>
            {messages.length ? <div className="history-list">{messages.map((message) => (
              <article className="history-item" key={message.id}>
                <div><strong>{message.createdAt ? new Date(message.createdAt).toLocaleDateString() : 'Recently'}</strong><span>{message.email}</span></div>
                <p>{message.message}</p>
                <span className={`status-pill ${message.reply ? 'answered' : ''}`}>{message.reply ? 'Reply received' : 'Received'}</span>
                {message.reply && <p className="reply-note"><strong>Our reply:</strong> {message.reply}</p>}
              </article>
            ))}</div> : <div className="empty-state compact"><p>You haven&apos;t sent an inquiry yet.</p><Link to="/contact">Tell us what you&apos;re working on →</Link></div>}
          </section>
          <section className="dashboard-panel">
            <div className="panel-heading"><h2>Saved services</h2><Link className="text-button" to="/services">Browse services ↗</Link></div>
            {services.length ? <div className="saved-list">{services.map((service) => (
              <article className="saved-item" key={service.id}>
                <span className="saved-icon">{service.icon || '✳'}</span>
                <div><Link to={`/services/${service.id}`}><strong>{service.title}</strong></Link><span>{service.category}</span></div>
                <button aria-label={`${favorites.includes(String(service.id)) ? 'Remove' : 'Save'} ${service.title}`} className={favorites.includes(String(service.id)) ? 'favorite-button is-favorite' : 'favorite-button'} onClick={() => toggleFavorite(service.id)} type="button">{favorites.includes(String(service.id)) ? '♥' : '♡'}</button>
              </article>
            ))}</div> : <p>There are no services to show.</p>}
          </section>
          <section className="dashboard-panel">
            <div className="panel-heading"><h2>Your orders</h2><Link className="text-button" to="/shop">Visit the shop ↗</Link></div>
            {orders.length ? <div className="history-list">{[...orders].reverse().map((order) => (
              <article className="history-item" key={order.id}>
                <div><strong>{order.createdAt ? new Date(order.createdAt).toLocaleDateString() : 'Recently'}</strong><span>{order.currency} · {formatPrice({ [order.currency]: order.total }, order.currency)}</span></div>
                <p>{order.items?.map((item) => `${item.title} × ${item.quantity}`).join(', ')}</p>
                <span className="status-pill">{order.status === 'demo-only-no-payment' ? 'Demo only · not paid' : order.status}</span>
              </article>
            ))}</div> : <div className="empty-state compact"><p>No orders yet.</p><Link to="/shop">Browse the shop →</Link></div>}
          </section>
        </div>
      </>}
    </section>
  )
}
