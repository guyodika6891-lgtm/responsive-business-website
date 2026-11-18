import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import client from '../api/client'
import { ErrorMessage, Loading } from '../components/Feedback'
import { formatPrice } from '../config/store'
import { useCart } from '../hooks/useCart'

export default function ProductDetail() {
  const { id } = useParams()
  const { currency, addItem } = useCart()
  const [product, setProduct] = useState(null)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let active = true
    client.get(`/products/${encodeURIComponent(id)}`)
      .then(({ data }) => { if (active) setProduct(data) })
      .catch((requestError) => { if (active) setError(requestError.response?.status === 404 ? 'That product could not be found.' : requestError.message) })
      .finally(() => { if (active) setLoading(false) })
    return () => { active = false }
  }, [id])

  if (loading) return <section className="page-width page-section"><Loading label="Loading product…" /></section>
  if (error) return <section className="page-width page-section"><ErrorMessage error={error} /></section>

  return (
    <section className="page-width page-section">
      <Link className="back-link" to="/shop">← Back to shop</Link>
      <div className="detail-layout product-detail-layout">
        <div>
          <p className="eyebrow">{product.type === 'physical' ? 'PHYSICAL GOOD' : 'DIGITAL DOWNLOAD'} · {product.category}</p>
          <div aria-hidden="true" className="detail-icon">{product.icon || '✳'}</div>
          <h1>{product.title}</h1>
          <p className="detail-description">{product.description}</p>
          <p className="price-label">{formatPrice(product.prices, currency)}</p>
          {product.type === 'physical' && <p className="store-note">Shipping address is collected during checkout. Demo orders are not fulfilled.</p>}
          {product.type === 'digital' && <p className="store-note">Digital product delivery is not automated in this demo.</p>}
          <button className="button button-dark" onClick={() => addItem('product', product.id)} type="button">Add to cart</button>
        </div>
        <aside className="product-detail-art" aria-hidden="true">{product.icon || '✳'}</aside>
      </div>
    </section>
  )
}
