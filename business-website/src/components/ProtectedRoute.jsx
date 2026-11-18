import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'

export default function ProtectedRoute({ children, role }) {
  const { user } = useAuth()
  const location = useLocation()
  if (!user) return <Navigate replace state={{ from: location.pathname }} to="/login" />
  if (role && user.role !== role) return <Navigate replace to="/" />
  return children
}
