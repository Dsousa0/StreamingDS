import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

export default function AdminRoute() {
  const { isAuthenticated, role } = useAuth()
  if (!isAuthenticated) return <Navigate to="/" replace />
  if (role !== 'admin') return <Navigate to="/dashboard" replace />
  return <Outlet />
}
