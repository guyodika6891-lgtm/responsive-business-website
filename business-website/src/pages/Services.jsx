import { useEffect, useMemo, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import client from '../api/client'
import { ErrorMessage, Loading } from '../components/Feedback'
import { ArrowIcon } from '../components/Icons'
import ServiceCard from '../components/ServiceCard'

async function fetchServices() {
  const { data } = await client.get('/services')
  return data
}

export default function Services() {
  const [services, setServices] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [query, setQuery] = useState('')
  const [params, setParams] = useSearchParams()
  const category = params.get('category') || 'All services'

  async function loadServices() {
    try {
      setServices(await fetchServices())
    } catch (requestError) {
      setError(requestError.message || 'Could not load services.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    let active = true
    fetchServices()
      .then((data) => { if (active) setServices(data) })
      .catch((requestError) => { if (active) setError(requestError.message || 'Could not load services.') })
      .finally(() => { if (active) setLoading(false) })
    return () => { active = false }
  }, [])
  function retryServices() {
    setLoading(true)
    setError('')
    loadServices()
  }
  const categories = useMemo(() => ['All services', ...new Set(services.map((item) => item.category).filter(Boolean))], [services])
  const filtered = services.filter((item) => {
    const matchesText = `${item.title} ${item.description} ${item.category}`.toLowerCase().includes(query.toLowerCase())
    return matchesText && (category === 'All services' || item.category === category)
  })

  return (
    <section className="page-width page-section">
      <div className="page-intro"><p className="eyebrow">WHAT WE DO</p><h1>Good help for<br /><span>what&apos;s next.</span></h1><p>From a new idea to your next stage of growth, we bring the right people and the right thinking to the work.</p></div>
      <div className="filter-bar">
        <label className="search-field"><span aria-hidden="true">⌕</span><input aria-label="Search services" onChange={(event) => setQuery(event.target.value)} placeholder="Search services…" value={query} /></label>
        <label className="category-select-label">Filter by category<select aria-label="Filter by category" onChange={(event) => setParams(event.target.value === 'All services' ? {} : { category: event.target.value })} value={category}><option>All services</option>{categories.slice(1).map((item) => <option key={item}>{item}</option>)}</select></label>
      </div>
      {loading ? <Loading label="Loading services…" /> : error ? <ErrorMessage error={error} onRetry={retryServices} /> : filtered.length ? <div className="service-grid">{filtered.map((item) => <ServiceCard key={item.id} service={item} />)}</div> : <div className="empty-state"><h2>No services found</h2><p>Try a different search or category.</p></div>}
      <div className="page-cta"><p>Not sure where to start?</p><Link className="button button-dark" to="/contact">Tell us what you need <ArrowIcon /></Link></div>
    </section>
  )
}
