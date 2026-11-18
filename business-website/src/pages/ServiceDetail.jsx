import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import client from '../api/client'
import { ErrorMessage, Loading } from '../components/Feedback'
import { ArrowIcon } from '../components/Icons'
import { formatPrice } from '../config/store'
import { useCart } from '../hooks/useCart'

export default function ServiceDetail() {
  const { id } = useParams()
  const { currency, addItem } = useCart()
  const [service, setService] = useState(null)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let active = true
    client.get(`/services/${encodeURIComponent(id)}`)
      .then(({ data }) => { if (active) setService(data) })
      .catch((requestError) => { if (active) setError(requestError.response?.status === 404 ? 'That service could not be found.' : requestError.message) })
      .finally(() => { if (active) setLoading(false) })
    return () => { active = false }
  }, [id])

  return <section className="page-width page-section">{loading ? <Loading label="Loading service…" /> : error ? <ErrorMessage error={error} /> : <><Link className="back-link" to="/services">← All services</Link><div className="detail-layout"><div><p className="eyebrow">{service.category || 'OUR SERVICES'}</p><div className="detail-icon">{service.icon || '✳'}</div><h1>{service.title}</h1><p className="detail-description">{service.description}</p><p className="price-label">{service.prices ? formatPrice(service.prices, currency) : service.price || 'Get in touch for a quote'}</p><button className="button button-dark" onClick={() => addItem('service', service.id)} type="button">Add service to cart</button><Link className="quiet-link service-contact-link" to="/contact">Ask us a question <ArrowIcon /></Link></div><aside className="detail-aside"><p className="eyebrow">HOW WE WORK</p><h2>Clear steps.<br />Good people.</h2><ol><li>Start with a conversation about what you need.</li><li>Put together a simple plan with practical next steps.</li><li>Work side by side and keep the progress moving.</li></ol></aside></div></>}</section>
}
