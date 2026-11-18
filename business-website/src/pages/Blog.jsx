import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import client from '../api/client'
import { ErrorMessage, Loading } from '../components/Feedback'

async function fetchPosts() {
  const { data } = await client.get('/blogs')
  return data
}

export default function Blog() {
  const [posts, setPosts] = useState([])
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)
  const [category, setCategory] = useState('All topics')

  async function loadPosts() {
    try {
      setPosts(await fetchPosts())
    } catch (requestError) {
      setError(requestError.message || 'Could not load insights.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    let active = true
    fetchPosts()
      .then((data) => { if (active) setPosts(data) })
      .catch((requestError) => { if (active) setError(requestError.message || 'Could not load insights.') })
      .finally(() => { if (active) setLoading(false) })
    return () => { active = false }
  }, [])
  function retryPosts() {
    setLoading(true)
    setError('')
    loadPosts()
  }
  const categories = ['All topics', ...new Set(posts.map((item) => item.category).filter(Boolean))]
  const visiblePosts = category === 'All topics' ? posts : posts.filter((item) => item.category === category)

  return (
    <section className="page-width page-section">
      <div className="page-intro"><p className="eyebrow">NOTES FOR THE JOURNEY</p><h1>A few things<br /><span>we&apos;ve been thinking about.</span></h1><p>Useful ideas and perspectives for people building something that matters.</p></div>
      <div className="filter-bar"><p className="filter-caption">Browse by topic</p><div className="filter-chips">{categories.map((item) => <button aria-pressed={category === item} className={category === item ? 'filter-chip active' : 'filter-chip'} key={item} onClick={() => setCategory(item)} type="button">{item}</button>)}</div></div>
      {loading ? <Loading label="Loading articles…" /> : error ? <ErrorMessage error={error} onRetry={retryPosts} /> : visiblePosts.length ? <div className="article-grid blog-grid">{visiblePosts.map((item, index) => <Link className="article-card" key={item.id} to={`/blog/${item.id}`}><div aria-hidden="true" className={`article-art article-art-${index % 3}`}><span>{item.category || 'INSIGHTS'}</span><b>{index === 1 ? '↗' : '✳'}</b></div><p className="article-meta">{item.category || 'INSIGHTS'} <span>{item.readTime || '5 min read'}</span></p><h2>{item.title}</h2><p className="article-excerpt">{item.excerpt}</p><span className="article-byline">{item.author} · {item.date}</span></Link>)}</div> : <div className="empty-state"><h2>No articles in this topic yet</h2></div>}
    </section>
  )
}
