import { Navigate, Outlet } from 'react-router-dom'
import { useAuthStore } from '../store/authStore'

interface ProtectedRouteProps {
  allowedRoles?: string[]
}

export const ProtectedRoute = ({ allowedRoles }: ProtectedRouteProps) => {
  const { isAuthenticated, user } = useAuthStore()

  if (!isAuthenticated) {
    return <Navigate to='/login' replace />
  }

  if (allowedRoles && user && !allowedRoles.includes(user.role as string)) {
    return <Navigate to='/unauthorized' replace />
  }

  return <Outlet />
}

export const GuestRoute = () => {
  const { isAuthenticated, user } = useAuthStore()
  if (!isAuthenticated) return <Outlet />
  return <Navigate to={user?.role === 'admin' ? '/admin' : '/dashboard'} replace />
}
