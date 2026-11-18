import { Link } from 'react-router-dom'
import { ArrowIcon } from './Icons'
import { formatPrice } from '../config/store'
import { useCart } from '../hooks/useCart'

export default function ServiceCard({ service }) {
  const { currency, addItem } = useCart()

  return (
    <article className="service-card">
      <div className="service-card-top">
        <span className="service-icon">{service.icon || '✳'}</span>
        <span className="service-category">{service.category || 'Digital services'}</span>
      </div>
      <h3>{service.title}</h3>
      <p>{service.description}</p>
      <div className="service-card-bottom">
        <span>{service.prices ? formatPrice(service.prices, currency) : service.price || 'Let’s talk'}</span>
        <button aria-label={`Add ${service.title} to cart`} className="service-add-button" onClick={() => addItem('service', service.id)} type="button">Add</button>
        <Link aria-label={`Learn more about ${service.title}`} to={`/services/${service.id}`}><ArrowIcon diagonal /></Link>
      </div>
    </article>
  )
}
