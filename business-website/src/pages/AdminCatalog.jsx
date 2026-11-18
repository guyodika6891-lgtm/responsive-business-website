import { useState } from 'react'
import { Link } from 'react-router-dom'
import client from '../api/client'
import { CURRENCIES } from '../config/store'

function emptyPrices() {
  return Object.fromEntries(CURRENCIES.map((currency) => [currency, '']))
}

function emptyItem(resource) {
  return {
    title: '',
    category: '',
    description: '',
    icon: '✳',
    prices: emptyPrices(),
    ...(resource === 'products' ? { type: 'physical' } : { price: '' }),
  }
}

export default function AdminCatalog({ resource, items, onReload, user, onLogout, loadError }) {
  const isProducts = resource === 'products'
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState(() => emptyItem(resource))
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')
  const [saving, setSaving] = useState(false)

  function startCreate() {
    setEditing('new')
    setForm(emptyItem(resource))
    setError('')
    setNotice('')
  }

  function startEdit(item) {
    setEditing(String(item.id))
    setForm({ ...emptyItem(resource), ...item, prices: { ...emptyPrices(), ...item.prices } })
    setError('')
    setNotice('')
  }

  async function saveItem(event) {
    event.preventDefault()
    setError('')
    setSaving(true)
    try {
      const payload = {
        ...form,
        title: form.title.trim(),
        category: form.category.trim(),
        description: form.description.trim(),
        prices: Object.fromEntries(CURRENCIES.map((currency) => [currency, String(form.prices[currency]).trim()])),
      }
      if (editing === 'new') {
        await client.post(`/${resource}`, { ...payload, id: crypto.randomUUID() })
      } else {
        await client.put(`/${resource}/${encodeURIComponent(editing)}`, payload)
      }
      setEditing(null)
      setNotice(isProducts ? 'Product saved.' : 'Service saved.')
      await onReload()
    } catch (requestError) {
      setError(requestError.response?.data?.message || requestError.message || 'The item could not be saved.')
    } finally {
      setSaving(false)
    }
  }

  async function deleteItem(item) {
    if (!window.confirm(`Delete "${item.title}"? This cannot be undone.`)) return
    setError('')
    try {
      await client.delete(`/${resource}/${encodeURIComponent(item.id)}`)
      setNotice(`${isProducts ? 'Product' : 'Service'} deleted.`)
      await onReload()
    } catch (requestError) {
      setError(requestError.message || 'The item could not be deleted.')
    }
  }

  return (
    <div className="admin-catalog">
      <header className="admin-catalog-header">
        <div><p className="eyebrow">CATALOG MANAGEMENT</p><h2>{isProducts ? 'Products' : 'Services'}</h2></div>
        <div className="admin-catalog-actions"><span>Signed in as {user.name}</span><button className="button button-light button-small" onClick={onLogout} type="button">Sign out</button></div>
      </header>
      <nav aria-label="Admin catalog navigation" className="admin-catalog-nav">
        <Link to="/admin">Overview</Link><Link to="/admin/services">Services</Link><Link to="/admin/products">Products</Link><Link to="/">Back to website</Link>
      </nav>
      {notice && <p className="admin-notice" role="status">{notice}</p>}
      {error && <p className="form-feedback form-error" role="alert">{error}</p>}
      {loadError && <p className="form-feedback form-error" role="alert">{loadError}</p>}
      <div className="admin-panel">
        <div className="admin-panel-heading">
          <div><p className="eyebrow">STORE CATALOG</p><h2>{items.length} {isProducts ? 'products' : 'services'}</h2></div>
          <button className="button button-dark button-small" onClick={startCreate} type="button">+ Add {isProducts ? 'product' : 'service'}</button>
        </div>
        {editing !== null && <form className="admin-edit-form catalog-edit-form" onSubmit={saveItem}>
          <h3>{editing === 'new' ? `Create ${isProducts ? 'product' : 'service'}` : `Edit ${isProducts ? 'product' : 'service'}`}</h3>
          <label>Title<input maxLength="160" onChange={(event) => setForm({ ...form, title: event.target.value })} required value={form.title} /></label>
          <label>Category<input maxLength="80" onChange={(event) => setForm({ ...form, category: event.target.value })} required value={form.category} /></label>
          <label>Description<textarea maxLength="1000" onChange={(event) => setForm({ ...form, description: event.target.value })} required rows="3" value={form.description} /></label>
          <label>Icon<input maxLength="8" onChange={(event) => setForm({ ...form, icon: event.target.value })} value={form.icon} /></label>
          {isProducts ? <label>Product type<select onChange={(event) => setForm({ ...form, type: event.target.value })} value={form.type}><option value="physical">Physical product</option><option value="digital">Digital product</option></select></label> : <label>Display price (optional)<input maxLength="80" onChange={(event) => setForm({ ...form, price: event.target.value })} placeholder="Example: From $999" value={form.price} /></label>}
          <fieldset className="currency-price-fields"><legend>Price in each currency</legend>{CURRENCIES.map((currency) => <label key={currency}>{currency}<input inputMode="decimal" min="0.01" onChange={(event) => setForm({ ...form, prices: { ...form.prices, [currency]: event.target.value } })} required step="0.01" type="number" value={form.prices[currency]} /></label>)}</fieldset>
          <div className="edit-actions"><button className="button button-dark button-small" disabled={saving} type="submit">{saving ? 'Saving…' : 'Save changes'}</button><button className="button button-light button-small" onClick={() => setEditing(null)} type="button">Cancel</button></div>
        </form>}
        {items.length ? items.map((item) => <div className="admin-content-row" key={item.id}>
          <span className="row-icon">{item.icon || '✳'}</span>
          <div><strong>{item.title}</strong><span>{item.category} · {isProducts ? item.type : item.description}</span></div>
          <button onClick={() => startEdit(item)} type="button">Edit</button>
          <button className="danger-link" onClick={() => deleteItem(item)} type="button">Delete</button>
        </div>) : <div className="empty-state compact"><p>No {isProducts ? 'products' : 'services'} yet.</p></div>}
      </div>
      <p className="demo-warning">This local catalog uses JSON Server and is not protected by production-grade authentication.</p>
    </div>
  )
}
