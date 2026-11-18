import { useCallback, useEffect, useState } from 'react'
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom'
import client from '../api/client'
import { ErrorMessage, Loading } from '../components/Feedback'
import { useAuth } from '../hooks/useAuth'
import { useTheme } from '../hooks/useTheme'
import AdminCatalog from './AdminCatalog'
import AdminOrders from './AdminOrders'

const emptyPrices = { USD: '', EUR: '', GBP: '', OMR: '' }
const emptyService = { title: '', category: '', description: '', icon: '✳', price: '', prices: emptyPrices, featured: false }
const emptyProduct = { title: '', category: '', description: '', icon: '✳', type: 'physical', prices: emptyPrices }
const emptyBlog = { title: '', category: '', excerpt: '', content: '', author: 'Northstar Team', date: new Date().toISOString().slice(0, 10), readTime: '5 min read' }
const sections = [
  { path: '/admin', label: 'Overview' },
  { path: '/admin/services', label: 'Services' },
  { path: '/admin/products', label: 'Products' },
  { path: '/admin/orders', label: 'Orders' },
  { path: '/admin/blog', label: 'Blog posts' },
  { path: '/admin/messages', label: 'Messages' },
  { path: '/admin/users', label: 'Users' },
]

async function fetchAdminData() {
  const [serviceResponse, productResponse, blogResponse, messageResponse, userResponse, orderResponse] = await Promise.all([
    client.get('/services'), client.get('/products'), client.get('/blogs'), client.get('/messages'), client.get('/users'), client.get('/orders'),
  ])
  return {
    services: serviceResponse.data,
    products: productResponse.data,
    blogs: blogResponse.data,
    messages: messageResponse.data,
    users: userResponse.data,
    orders: orderResponse.data,
  }
}

export default function Admin() {
  const { user, logout } = useAuth()
  const { theme, toggleTheme } = useTheme()
  const location = useLocation()
  const navigate = useNavigate()
  const [services, setServices] = useState([])
  const [products, setProducts] = useState([])
  const [blogs, setBlogs] = useState([])
  const [messages, setMessages] = useState([])
  const [users, setUsers] = useState([])
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState(emptyService)

  const section = sections.find((item) => item.path === location.pathname) || sections[0]

  function handleLogout() {
    logout()
    navigate('/login', { replace: true })
  }

  const loadData = useCallback(async () => {
    setError('')
    try {
      const data = await fetchAdminData()
      setServices(data.services)
      setProducts(data.products)
      setBlogs(data.blogs)
      setMessages(data.messages)
      setUsers(data.users)
      setOrders(data.orders)
    } catch (requestError) {
      setError(requestError.message || 'Could not load admin data.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    let active = true
    fetchAdminData()
      .then((data) => {
        if (!active) return
        setServices(data.services)
        setProducts(data.products)
        setBlogs(data.blogs)
        setMessages(data.messages)
        setUsers(data.users)
        setOrders(data.orders)
      })
      .catch((requestError) => {
        if (active) setError(requestError.message || 'Could not load admin data.')
      })
      .finally(() => { if (active) setLoading(false) })
    return () => { active = false }
  }, [])

  function startCreate() {
    setEditing('new')
    setForm(location.pathname === '/admin/blog' ? emptyBlog : location.pathname === '/admin/products' ? emptyProduct : emptyService)
    setNotice('')
  }

  function startEdit(item) {
    setEditing(item.id)
    const empty = location.pathname === '/admin/blog' ? emptyBlog : location.pathname === '/admin/products' ? emptyProduct : emptyService
    setForm({ ...empty, ...item, prices: { ...emptyPrices, ...item.prices } })
    setNotice('')
  }

  async function saveItem(event) {
    event.preventDefault()
    const resource = location.pathname === '/admin/blog' ? 'blogs' : location.pathname === '/admin/products' ? 'products' : 'services'
    try {
      if (editing === 'new') await client.post(`/${resource}`, { ...form, id: crypto.randomUUID() })
      else await client.put(`/${resource}/${encodeURIComponent(editing)}`, form)
      setEditing(null)
      setNotice(resource === 'blogs' ? 'Blog post saved.' : resource === 'products' ? 'Product saved.' : 'Service saved.')
      await loadData()
    } catch (requestError) {
      setError(requestError.response?.data?.message || requestError.message || 'The item could not be saved.')
    }
  }

  async function deleteItem(resource, item) {
    if (!window.confirm(`Delete "${item.title}"? This cannot be undone.`)) return
    try {
      await client.delete(`/${resource}/${encodeURIComponent(item.id)}`)
      setNotice(`${resource === 'blogs' ? 'Blog post' : resource === 'products' ? 'Product' : 'Service'} deleted.`)
      await loadData()
    } catch (requestError) {
      setError(requestError.message || 'The item could not be deleted.')
    }
  }

  async function toggleRead(message) {
    try {
      await client.patch(`/messages/${encodeURIComponent(message.id)}`, { read: !message.read })
      await loadData()
    } catch (requestError) {
      setError(requestError.message || 'The message could not be updated.')
    }
  }

  async function saveReply(event, message) {
    event.preventDefault()
    const reply = new FormData(event.currentTarget).get('reply').toString().trim()
    try {
      await client.patch(`/messages/${encodeURIComponent(message.id)}`, { reply, repliedAt: new Date().toISOString(), read: true })
      setNotice(`Reply saved for ${message.email}. The demo saved it to the message history; it did not send email.`)
      await loadData()
    } catch (requestError) {
      setError(requestError.message || 'Your reply could not be saved.')
    }
  }

  async function toggleUser(userItem) {
    try {
      await client.patch(`/users/${encodeURIComponent(userItem.id)}`, { active: userItem.active === false })
      setNotice(`${userItem.email} ${userItem.active === false ? 'reactivated' : 'deactivated'}.`)
      await loadData()
    } catch (requestError) {
      setError(requestError.message || 'The user status could not be changed.')
    }
  }

  const isContentSection = ['/admin/services', '/admin/products', '/admin/blog'].includes(location.pathname)
  const isBlogSection = location.pathname === '/admin/blog'
  const isProductSection = location.pathname === '/admin/products'
  const items = isBlogSection ? blogs : isProductSection ? products : services

  if (location.pathname === '/admin/services' || isProductSection) {
    return <AdminCatalog
      loadError={error}
      items={isProductSection ? products : services}
      onLogout={handleLogout}
      onReload={loadData}
      resource={isProductSection ? 'products' : 'services'}
      user={user}
    />
  }
  if (location.pathname === '/admin/orders') {
    return <AdminOrders loadError={error} onLogout={handleLogout} orders={orders} user={user} />
  }

  return (
    <div className="admin-shell">
      <aside className="admin-sidebar"><Link className="brand admin-brand" to="/"><span className="brand-mark">N<span>.</span></span><span>northstar<span className="brand-light"> admin</span></span></Link><p className="admin-label">WORKSPACE</p><nav aria-label="Admin navigation" className="admin-nav">{sections.map((item) => <NavLink end={item.path === '/admin'} key={item.path} to={item.path}><span>{item.path === '/admin' ? '◫' : item.path.endsWith('services') ? '✳' : item.path.endsWith('blog') ? '▤' : item.path.endsWith('messages') ? '✉' : '◎'}</span>{item.label}{item.path.endsWith('messages') && messages.filter((message) => !message.read).length > 0 && <b>{messages.filter((message) => !message.read).length}</b>}</NavLink>)}</nav><div className="admin-sidebar-bottom"><span>Signed in as</span><strong>{user.name}</strong><Link to="/">← Back to website</Link></div></aside>
      <section className="admin-main"><header className="admin-topbar"><div><span className="eyebrow">NORTHSTAR WORKSPACE</span><h1>{section.label}</h1></div><div className="admin-topbar-actions"><span className="demo-badge">LOCAL DEMO</span><button aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`} className="theme-toggle" onClick={toggleTheme} title={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`} type="button"><span aria-hidden="true">{theme === 'light' ? '◐' : '☀'}</span></button><button className="admin-logout" onClick={handleLogout} type="button">Sign out</button></div></header>
        {notice && <p className="admin-notice" role="status">{notice}<button aria-label="Dismiss" onClick={() => setNotice('')} type="button">×</button></p>}
        {error && <ErrorMessage error={error} onRetry={() => { setError(''); loadData() }} />}
        {loading ? <Loading label="Loading workspace…" /> : location.pathname === '/admin' ? <><div className="admin-stats"><article><span>SERVICES</span><strong>{services.length}</strong></article><article><span>BLOG POSTS</span><strong>{blogs.length}</strong></article><article><span>CONTACT MESSAGES</span><strong>{messages.length}</strong></article><article><span>ACTIVE USERS</span><strong>{users.filter((item) => item.active !== false).length}</strong></article></div><div className="admin-panel"><div className="admin-panel-heading"><div><p className="eyebrow">LATEST ACTIVITY</p><h2>Recent inquiries</h2></div><Link to="/admin/messages">All messages →</Link></div>{messages.length ? messages.slice(0, 5).reverse().map((message) => <div className="admin-message-row" key={message.id}><span className={`message-indicator ${message.read ? '' : 'unread'}`} /><div><strong>{message.name}</strong><span>{message.email}</span></div><p>{message.message}</p><span>{new Date(message.createdAt).toLocaleDateString()}</span></div>) : <div className="empty-state compact"><p>No inquiries yet. New contact form messages will show up here.</p><Link to="/contact">Preview the contact page →</Link></div>}</div><p className="demo-warning">This local JSON Server demo has no real authentication. Do not expose it to the internet or use it for real customer data.</p></>
        : isContentSection ? <div className="admin-panel"><div className="admin-panel-heading"><div><p className="eyebrow">CONTENT MANAGEMENT</p><h2>{isBlogSection ? 'Blog posts' : 'Services'}</h2></div><button className="button button-dark button-small" onClick={startCreate} type="button">+ Add {isBlogSection ? 'post' : 'service'}</button></div>{editing !== null && <form className="admin-edit-form" onSubmit={saveItem}><h3>{editing === 'new' ? `Create ${isBlogSection ? 'blog post' : 'service'}` : `Edit ${isBlogSection ? 'blog post' : 'service'}`}</h3><label>Title<input maxLength="160" onChange={(event) => setForm({ ...form, title: event.target.value })} required value={form.title} /></label><label>Category<input onChange={(event) => setForm({ ...form, category: event.target.value })} required value={form.category} /></label>{!isBlogSection && <div className="form-row"><label>Icon<input maxLength="8" onChange={(event) => setForm({ ...form, icon: event.target.value })} value={form.icon} /></label><label>Price<input onChange={(event) => setForm({ ...form, price: event.target.value })} value={form.price} /></label></div>}{isBlogSection && <label>Excerpt<textarea maxLength="300" onChange={(event) => setForm({ ...form, excerpt: event.target.value })} required rows="2" value={form.excerpt} /></label>}<label>Description<input onChange={(event) => setForm({ ...form, description: event.target.value })} required={!isBlogSection} value={form.description || ''} /></label>{isBlogSection && <label>Article content<textarea onChange={(event) => setForm({ ...form, content: event.target.value })} required rows="5" value={form.content} /></label>}<div className="edit-actions"><button className="button button-dark button-small" type="submit">Save changes</button><button className="button button-light button-small" onClick={() => setEditing(null)} type="button">Cancel</button></div></form>}{items.length ? items.map((item) => <div className="admin-content-row" key={item.id}><span className="row-icon">{item.icon || '▤'}</span><div><strong>{item.title}</strong><span>{item.category || 'Uncategorized'} · {item.description || item.excerpt}</span></div><button onClick={() => startEdit(item)} type="button">Edit</button><button className="danger-link" onClick={() => deleteItem(isBlogSection ? 'blogs' : 'services', item)} type="button">Delete</button></div>) : <div className="empty-state compact"><p>No content yet.</p></div>}</div>
        : location.pathname === '/admin/messages' ? <div className="admin-panel"><div className="admin-panel-heading"><div><p className="eyebrow">INBOX</p><h2>{messages.length} {messages.length === 1 ? 'message' : 'messages'}</h2></div></div>{messages.length ? [...messages].reverse().map((message) => <article className={`inbox-message ${message.read ? '' : 'unread-message'}`} key={message.id}><div className="inbox-heading"><div><span className={`message-indicator ${message.read ? '' : 'unread'}`} /><strong>{message.name}</strong><a href={`mailto:${encodeURIComponent(message.email)}`}>{message.email}</a></div><span>{message.createdAt ? new Date(message.createdAt).toLocaleString() : ''}</span></div><p>{message.message}</p>{message.reply && <p className="reply-note"><strong>Saved reply:</strong> {message.reply}</p>}<form className="reply-form" onSubmit={(event) => saveReply(event, message)}><label className="sr-only" htmlFor={`reply-${message.id}`}>Reply to {message.name}</label><textarea defaultValue={message.reply || ''} id={`reply-${message.id}`} maxLength="3000" name="reply" placeholder="Write a reply to save in this message history…" required rows="2" /><button className="button button-dark button-small" type="submit">Save reply</button><button className="button button-light button-small" onClick={() => toggleRead(message)} type="button">Mark as {message.read ? 'unread' : 'read'}</button></form></article>) : <div className="empty-state compact"><p>Your inbox is empty. Contact form submissions will appear here.</p></div>}</div>
        : <div className="admin-panel"><div className="admin-panel-heading"><div><p className="eyebrow">ACCOUNT MANAGEMENT</p><h2>{users.length} accounts</h2></div></div>{users.map((userItem) => <div className="admin-content-row" key={userItem.id}><span className="row-icon">◎</span><div><strong>{userItem.name}</strong><span>{userItem.email} · {userItem.role}</span></div><span className={`status-pill ${userItem.active === false ? 'inactive' : ''}`}>{userItem.active === false ? 'Inactive' : 'Active'}</span>{userItem.role !== 'admin' && <button className={userItem.active === false ? '' : 'danger-link'} onClick={() => toggleUser(userItem)} type="button">{userItem.active === false ? 'Reactivate' : 'Deactivate'}</button>}</div>)}<p className="demo-warning">User management is only simulated in this local demo. It does not enforce access control.</p></div>}
      </section>
    </div>
  )
}
