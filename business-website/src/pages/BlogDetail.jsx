import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import client from '../api/client'
import { ErrorMessage, Loading } from '../components/Feedback'

export default function BlogDetail() {
  const { id } = useParams()
  const [article, setArticle] = useState(null)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let active = true
    client.get(`/blogs/${encodeURIComponent(id)}`)
      .then(({ data }) => { if (active) setArticle(data) })
      .catch((requestError) => { if (active) setError(requestError.response?.status === 404 ? 'That article could not be found.' : requestError.message) })
      .finally(() => { if (active) setLoading(false) })
    return () => { active = false }
  }, [id])

  return <section className="page-width page-section article-detail">{loading ? <Loading label="Loading article…" /> : error ? <ErrorMessage error={error} /> : <><Link className="back-link" to="/blog">← All insights</Link><p className="eyebrow">{article.category || 'INSIGHTS'} · {article.readTime || '5 min read'}</p><h1>{article.title}</h1><p className="article-byline">{article.author} · {article.date}</p><div className="article-detail-art">✳</div><p className="article-lede">{article.excerpt}</p><div className="article-body">{(article.content || article.excerpt).split(/\n+/).map((paragraph, index) => <p key={index}>{paragraph}</p>)}</div><Link className="text-button" to="/contact">Let&apos;s talk about what&apos;s next ↗</Link></>}</section>
}
