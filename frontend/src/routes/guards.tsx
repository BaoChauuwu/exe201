import { Navigate, Outlet } from 'react-router-dom'
import { useAuthStore } from '../store/authStore'

export const ProtectedRoute = () => {
  const { isAuthenticated } = useAuthStore()
  return isAuthenticated ? <Outlet /> : <Navigate to='/login' replace />
}

export const GuestRoute = () => {
  const { isAuthenticated, user } = useAuthStore()
  if (!isAuthenticated) return <Outlet />
  return <Navigate to={user?.role === 'admin' ? '/admin' : '/dashboard'} replace />
}
