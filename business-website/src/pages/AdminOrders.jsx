import { Link } from 'react-router-dom'
import { formatPrice } from '../config/store'

export default function AdminOrders({ orders, user, onLogout, loadError }) {
  const sortedOrders = [...orders].sort((first, second) =>
    new Date(second.createdAt || 0) - new Date(first.createdAt || 0),
  )

  return (
    <div className="admin-catalog">
      <header className="admin-catalog-header">
        <div><p className="eyebrow">ORDER MANAGEMENT · LOCAL DEMO</p><h2>Orders</h2></div>
        <div className="admin-catalog-actions"><span>Signed in as {user.name}</span><button className="button button-light button-small" onClick={onLogout} type="button">Sign out</button></div>
      </header>
      <nav aria-label="Admin order navigation" className="admin-catalog-nav">
        <Link to="/admin">Overview</Link><Link to="/admin/services">Services</Link><Link to="/admin/products">Products</Link><Link to="/admin/orders">Orders</Link><Link to="/">Back to website</Link>
      </nav>
      {loadError && <p className="form-feedback form-error" role="alert">{loadError}</p>}
      <div className="admin-panel">
        <div className="admin-panel-heading"><div><p className="eyebrow">DEMO CHECKOUT RECORDS</p><h2>{orders.length} {orders.length === 1 ? 'order' : 'orders'}</h2></div></div>
        {sortedOrders.length ? sortedOrders.map((order) => (
          <article className="admin-order" key={order.id}>
            <div className="admin-order-heading"><div><strong>{order.name}</strong><span>{order.email}</span></div><span className="status-pill">{order.status === 'demo-only-no-payment' ? 'Demo only · not paid' : order.status}</span></div>
            <p>{order.items?.map((item) => `${item.title} × ${item.quantity}`).join(', ')}</p>
            <div className="admin-order-footer"><span>{order.createdAt ? new Date(order.createdAt).toLocaleString() : 'Date unavailable'}</span><strong>{formatPrice({ [order.currency]: order.total }, order.currency)}</strong></div>
            {order.shippingAddress && <p className="admin-order-shipping">Shipping address: {order.shippingAddress}</p>}
          </article>
        )) : <div className="empty-state compact"><p>No demo orders yet.</p><Link to="/shop">Preview the shop →</Link></div>}
      </div>
      <p className="demo-warning">This list contains JSON Server demo orders only. Stripe test orders are stored in the FastAPI database; live order-management workflows are not configured.</p>
    </div>
  )
}
