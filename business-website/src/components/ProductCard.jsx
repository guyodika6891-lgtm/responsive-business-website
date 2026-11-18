import { Link } from 'react-router-dom'
import { formatPrice } from '../config/store'
import { useCart } from '../hooks/useCart'

export default function ProductCard({ product }) {
  const { currency, addItem } = useCart()

  return (
    <article className="product-card">
      <Link aria-label={`View ${product.title}`} className="product-art" to={`/shop/${encodeURIComponent(product.id)}`}>
        <span aria-hidden="true">{product.icon || '✳'}</span>
      </Link>
      <div className="product-card-copy">
        <p className="product-kicker">{product.type === 'physical' ? 'PHYSICAL GOOD' : 'DIGITAL DOWNLOAD'} · {product.category}</p>
        <h2><Link to={`/shop/${encodeURIComponent(product.id)}`}>{product.title}</Link></h2>
        <p>{product.description}</p>
        <div className="product-card-bottom">
          <strong>{formatPrice(product.prices, currency)}</strong>
          <button className="button button-dark button-small" onClick={() => addItem('product', product.id)} type="button">Add to cart</button>
        </div>
      </div>
    </article>
  )
}
