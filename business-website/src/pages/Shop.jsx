import { useEffect, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import client from '../api/client'
import { ErrorMessage, Loading } from '../components/Feedback'
import ProductCard from '../components/ProductCard'

export default function Shop() {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [query, setQuery] = useState('')
  const [params, setParams] = useSearchParams()
  const type = params.get('type') || 'all'

  useEffect(() => {
    let active = true
    client.get('/products')
      .then(({ data }) => { if (active) setProducts(data) })
      .catch((requestError) => { if (active) setError(requestError.message || 'Could not load products.') })
      .finally(() => { if (active) setLoading(false) })
    return () => { active = false }
  }, [])

  const filtered = products.filter((product) => {
    const matchesText = `${product.title} ${product.description} ${product.category}`.toLowerCase().includes(query.toLowerCase())
    return matchesText && (type === 'all' || product.type === type)
  })

  return (
    <section className="page-width page-section">
      <div className="page-intro">
        <p className="eyebrow">THE NORTHSTAR SHOP</p>
        <h1>Useful things<br /><span>for the journey.</span></h1>
        <p>Thoughtful studio goods, practical downloads, and services to help your business move forward.</p>
      </div>
      <div className="filter-bar">
        <label className="search-field"><span aria-hidden="true">⌕</span><input aria-label="Search products" onChange={(event) => setQuery(event.target.value)} placeholder="Search the shop…" value={query} /></label>
        <label className="category-select-label">Show<select aria-label="Filter products by type" onChange={(event) => setParams(event.target.value === 'all' ? {} : { type: event.target.value })} value={type}><option value="all">Everything</option><option value="physical">Physical goods</option><option value="digital">Digital products</option></select></label>
      </div>
      {loading ? <Loading label="Loading the shop…" /> : error ? <ErrorMessage error={error} /> : filtered.length ? <div className="product-grid">{filtered.map((product) => <ProductCard key={product.id} product={product} />)}</div> : <div className="empty-state"><h2>No products found</h2><p>Try a different search or category.</p></div>}
      <div className="page-cta"><p>Looking for hands-on support?</p><Link className="button button-dark" to="/services">Explore our services →</Link></div>
    </section>
  )
}
