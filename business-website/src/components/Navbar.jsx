import { useState } from 'react'
import { Link, NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { useTheme } from '../hooks/useTheme'
import { useCart } from '../hooks/useCart'

export default function Navbar() {
  const [open, setOpen] = useState(false)
  const { user, logout } = useAuth()
  const { theme, toggleTheme } = useTheme()
  const { items } = useCart()
  const navigate = useNavigate()
  const links = [
    { to: '/', label: 'Home' },
    { to: '/shop', label: 'Shop' },
    { to: '/services', label: 'Services' },
    { to: '/blog', label: 'Blog' },
    { to: '/about', label: 'About' },
    { to: '/contact', label: 'Contact' },
  ]
  const cartCount = items.reduce((count, item) => count + item.quantity, 0)

  const handleLogout = () => {
    logout()
    setOpen(false)
    navigate('/', { replace: true })
  }

  return (
    <header className="site-header">
      <Link aria-label="Northstar Digital home" className="brand" to="/">
        <span aria-hidden="true" className="brand-mark">N<span>.</span></span>
        <span>northstar<span className="brand-light"> digital</span></span>
      </Link>
      <button
        aria-controls="primary-navigation"
        aria-expanded={open}
        aria-label={open ? 'Close navigation menu' : 'Open navigation menu'}
        className="menu-toggle"
        onClick={() => setOpen((current) => !current)}
        type="button"
      >
        <span />
        <span />
      </button>
      <nav
        aria-label="Primary navigation"
        className={`main-nav${open ? ' is-open' : ''}`}
        id="primary-navigation"
      >
        {links.map((link) => (
          <NavLink end={link.to === '/'} key={link.to} onClick={() => setOpen(false)} to={link.to}>
            {link.label}
          </NavLink>
        ))}
        <NavLink className="nav-cart" onClick={() => setOpen(false)} to="/cart">
          Cart <span aria-label={`${cartCount} items`}>{cartCount}</span>
        </NavLink>
        {user ? (
          <>
            {user.role === 'admin' && (
              <NavLink className="nav-secondary" onClick={() => setOpen(false)} to="/admin">
                Admin
              </NavLink>
            )}
            <NavLink className="nav-secondary" onClick={() => setOpen(false)} to="/dashboard">
              Dashboard
            </NavLink>
            <button className="nav-logout" onClick={handleLogout} type="button">
              Sign out
            </button>
          </>
        ) : (
          <>
            <NavLink className="nav-login" onClick={() => setOpen(false)} to="/login">
              Sign in
            </NavLink>
            <Link className="nav-cta" onClick={() => setOpen(false)} to="/contact">
              Let&apos;s talk <span aria-hidden="true">↗</span>
            </Link>
          </>
        )}
        <button
          aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
          className="theme-toggle"
          onClick={toggleTheme}
          title={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
          type="button"
        >
          <span aria-hidden="true">{theme === 'light' ? '◐' : '☀'}</span>
        </button>
      </nav>
    </header>
  )
}