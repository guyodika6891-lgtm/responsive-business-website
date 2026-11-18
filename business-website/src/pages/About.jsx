import { Link } from 'react-router-dom'
import { ArrowIcon } from '../components/Icons'

export default function About() {
  return (
    <section className="page-width page-section">
      <div className="page-intro"><p className="eyebrow">A LITTLE ABOUT US</p><h1>Business is personal.<br /><span>We think it should feel that way.</span></h1><p>Good work comes from good relationships. We take the time to understand your business and the people behind it.</p></div>
      <div className="about-story"><div className="story-art"><div className="about-orbit"><div className="orbit-one" /><div className="orbit-two" /><span>Better<br />together<span className="lime-dot">.</span></span><i>YOUR PEOPLE</i></div></div><div className="story-copy"><p className="eyebrow">THOUGHTFUL THINKERS. HANDS-ON DOERS.</p><h2>Good work starts with a good conversation.</h2><p>We&apos;re a close-knit team of curious thinkers and thoughtful doers. We listen first, get to the heart of the problem, and build a path forward that feels right for your business.</p><p>No mystery process or one-size-fits-all playbook. Just people who care about your goals, thoughtful decisions, and useful work that keeps moving.</p><Link className="button button-dark" to="/contact">Get to know us <ArrowIcon /></Link></div></div>
      <div className="values-grid"><article><span>01</span><h3>Listen before we leap.</h3><p>Understanding your people and your priorities comes before proposing solutions.</p></article><article><span>02</span><h3>Make the complex clear.</h3><p>Useful strategy feels practical, understandable, and built for real life.</p></article><article><span>03</span><h3>Make progress together.</h3><p>The best results come from good collaboration and an honest conversation.</p></article></div>
    </section>
  )
}
