import { Link } from 'react-router-dom'
import { ArrowIcon } from '../components/Icons'

export default function NotFound() {
  return <section className="page-width not-found"><p className="eyebrow">404 · WRONG TURN?</p><h1>This page<br /><span>isn&apos;t here.</span></h1><Link className="button button-dark" to="/">Back to the home page <ArrowIcon /></Link></section>
}
