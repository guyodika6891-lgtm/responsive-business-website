import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import client from '../api/client'
import { ErrorMessage, Loading } from '../components/Feedback'
import { ArrowIcon } from '../components/Icons'
import ServiceCard from '../components/ServiceCard'

async function fetchHomeContent() {
  const [serviceResponse, testimonialResponse, blogResponse] = await Promise.all([
    client.get('/services'),
    client.get('/testimonials'),
    client.get('/blogs'),
  ])
  return {
    services: serviceResponse.data.slice(0, 3),
    testimonials: testimonialResponse.data.slice(0, 2),
    articles: blogResponse.data.slice(0, 2),
  }
}

export default function Home() {
  const [services, setServices] = useState([])
  const [testimonials, setTestimonials] = useState([])
  const [articles, setArticles] = useState([])
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)

  async function loadContent() {
    try {
      const content = await fetchHomeContent()
      setServices(content.services)
      setTestimonials(content.testimonials)
      setArticles(content.articles)
    } catch (requestError) {
      setError(requestError.message || 'Could not load content from the API.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    let active = true
    fetchHomeContent()
      .then((content) => {
        if (!active) return
        setServices(content.services)
        setTestimonials(content.testimonials)
        setArticles(content.articles)
      })
      .catch((requestError) => {
        if (active) setError(requestError.message || 'Could not load content from the API.')
      })
      .finally(() => {
        if (active) setLoading(false)
      })
    return () => { active = false }
  }, [])
  function retryContent() {
    setLoading(true)
    setError('')
    loadContent()
  }

  return (
    <>
      <section className="hero page-width">
        <div className="hero-copy">
          <p className="eyebrow"><span className="eyebrow-dot" /> A BETTER KIND OF BUSINESS PARTNER</p>
          <h1>Good work.<br />Clear direction.<br /><span>Real progress.</span></h1>
          <p className="hero-description">We help ambitious businesses find their next step — and make it happen, together.</p>
          <div className="hero-actions">
            <Link className="button button-dark" to="/contact">Tell us what you&apos;re working on <ArrowIcon /></Link>
            <Link className="quiet-link" to="/services">Explore our services</Link>
          </div>
          <div className="hero-proof">
            <div aria-hidden="true" className="avatar-stack"><span>J</span><span>M</span><span>A</span><span>+</span></div>
            <p><strong>Good people, good outcomes.</strong><br />A small team that gets invested.</p>
          </div>
        </div>
        <div aria-label="Illustration of steady business growth" className="hero-art" role="img">
          <div className="art-topline"><span>THE BIG PICTURE</span><span className="live-dot">● &nbsp;IN MOTION</span></div>
          <div className="art-heading"><span>Progress,</span><span>by design.</span></div>
          <div className="chart-area">
            <div className="chart-labels"><span>THEN</span><span>NOW</span></div>
            <svg aria-hidden="true" viewBox="0 0 480 190">
              <defs><linearGradient id="chartFill" x1="0" x2="0" y1="0" y2="1"><stop offset="0%" stopColor="#c5ef86" stopOpacity=".32" /><stop offset="100%" stopColor="#c5ef86" stopOpacity="0" /></linearGradient></defs>
              <path d="M0 166 C48 150 70 159 105 126 S162 145 195 102 S248 122 283 75 S334 104 363 56 S423 63 480 8 V190 H0Z" fill="url(#chartFill)" />
              <path d="M0 166 C48 150 70 159 105 126 S162 145 195 102 S248 122 283 75 S334 104 363 56 S423 63 480 8" fill="none" stroke="#c5ef86" strokeWidth="3" />
              <circle cx="363" cy="56" fill="#c5ef86" r="5" /><circle cx="480" cy="8" fill="#c5ef86" r="6" />
            </svg>
          </div>
          <div className="art-bottom"><span>01 &nbsp; Start with what matters</span><span className="art-stamp">GOOD<br />THINGS<br />AHEAD ↗</span></div>
          <div className="floating-note"><span>✳</span> Clarity looks<br />good on you.</div>
        </div>
      </section>

      <section aria-label="Our approach" className="trust-strip">
        <div className="page-width trust-inner">
          <p>LESS NOISE. MORE MOMENTUM.</p><span>Strategy with sleeves rolled up</span><span className="trust-separator">✳</span><span>People-first, always</span><span className="trust-separator">✳</span><span>Built for the long run</span>
        </div>
      </section>

      <section className="page-width section-block">
        <div className="section-heading"><div><p className="eyebrow">HOW WE CAN HELP</p><h2>The right kind of help<br />for what&apos;s next.</h2></div><p className="section-copy">Big-picture thinking and practical hands-on help for the next chapter of your business.</p></div>
        {loading ? <Loading label="Loading services from the API…" /> : error ? <ErrorMessage error={error} onRetry={retryContent} /> : <div className="service-grid">{services.map((service) => <ServiceCard key={service.id} service={service} />)}</div>}
        <Link className="text-button section-link" to="/services">Explore all services <ArrowIcon /></Link>
      </section>

      <section className="about-band">
        <div className="page-width about-band-inner"><div className="about-orbit"><div className="orbit-one" /><div className="orbit-two" /><span>Better<br />together<span className="lime-dot">.</span></span><i>YOUR PEOPLE</i></div><div><p className="eyebrow">BUSINESS IS PERSONAL</p><h2>Good things happen<br />when we build <span>together.</span></h2><p className="section-copy">A close-knit team of curious thinkers and thoughtful doers. We listen first and make a plan that feels right for your business.</p><Link className="text-button" to="/about">Get to know us <ArrowIcon /></Link></div></div>
      </section>

      <section className="page-width section-block">
        <div className="section-heading"><div><p className="eyebrow">KIND WORDS, GOOD WORK</p><h2>Better, together.</h2></div><p className="section-copy">The best part of the work is seeing good people grow into what&apos;s next.</p></div>
        {loading ? <Loading label="Loading client stories…" /> : error ? <ErrorMessage error={error} onRetry={retryContent} /> : <div className="testimonial-grid">{testimonials.map((item) => <article className="testimonial-card" key={item.id}><p className="stars" aria-label={`${item.rating} out of 5 stars`}>{'★'.repeat(item.rating || 5)}</p><blockquote>“{item.message}”</blockquote><strong>{item.name}</strong><span>{item.role}</span></article>)}</div>}
      </section>

      <section className="page-width section-block insights-preview">
        <div className="section-heading"><div><p className="eyebrow">THOUGHTS FOR THE JOURNEY</p><h2>Notes for what&apos;s next.</h2></div><Link className="text-button" to="/blog">More insights <ArrowIcon /></Link></div>
        {loading ? <Loading label="Loading insights…" /> : error ? <ErrorMessage error={error} onRetry={retryContent} /> : <div className="article-grid">{articles.map((article, index) => <Link className="article-card" key={article.id} to={`/blog/${article.id}`}><div aria-hidden="true" className={`article-art article-art-${index % 3}`}><span>{article.category || 'INSIGHTS'}</span><b>{index === 0 ? '✳' : '↗'}</b></div><p className="article-meta">{article.category || 'INSIGHTS'} <span>{article.readTime || '5 min read'}</span></p><h3>{article.title}</h3><p className="article-excerpt">{article.excerpt}</p></Link>)}</div>}
      </section>
    </>
  )
}
