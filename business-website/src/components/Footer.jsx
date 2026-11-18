import { Link } from 'react-router-dom'

const currentYear = new Date().getFullYear()

export default function Footer() {
  return (
    <footer className="site-footer">
      <div className="page-width footer-main">
        <Link aria-label="Northstar Digital home" className="brand footer-brand" to="/">
          <span aria-hidden="true" className="brand-mark">N<span>.</span></span>
          <span>northstar<span className="brand-light"> digital</span></span>
        </Link>
        <p>Good work, moving forward.</p>
        <Link className="back-top" to="/contact">Have a project? Let&apos;s talk ↗</Link>
      </div>
      <div className="page-width footer-bottom">
        <span>© {currentYear} Northstar Digital</span>
        <span>Made for people building good things.</span>
      </div>
    </footer>
  )
}
