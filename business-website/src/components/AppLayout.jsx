import { Outlet, useLocation } from 'react-router-dom'
import Footer from './Footer'
import Navbar from './Navbar'

export default function AppLayout() {
  const location = useLocation()
  const isAdmin = location.pathname.startsWith('/admin')
  return (
    <>
      {!isAdmin && <Navbar />}
      <main className="app-main" id="main-content"><Outlet /></main>
      {!isAdmin && <Footer />}
    </>
  )
}
