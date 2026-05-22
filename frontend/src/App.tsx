import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { ProtectedRoute, GuestRoute } from './routes/guards'
import { useEffect, useState } from 'react'
import { useAuthStore } from './store/authStore'

import HomePage from './pages/HomePage'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import VerifyEmailPage from './pages/VerifyEmailPage'
import ForgotPasswordPage from './pages/ForgotPasswordPage'
import ResetPasswordPage from './pages/ResetPasswordPage'
import OAuthSuccessPage from './pages/OAuthSuccessPage'
import DashboardPage from './pages/DashboardPage'
import ProfilePage from './pages/ProfilePage'

function App() {
  const { isAuthenticated, user, fetchMe } = useAuthStore()
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const initAuth = async () => {
      if (isAuthenticated && !user) {
        await fetchMe()
      }
      setLoading(false)
    }
    initAuth()
  }, [isAuthenticated, user, fetchMe])

  if (loading) {
    return (
      <div className='loading-page'>
        <div style={{ textAlign: 'center' }}>
          <div className='loading-large' style={{ margin: '0 auto 1rem' }} />
          <p style={{ color: 'var(--color-text-muted)' }}>Đang tải cấu hình...</p>
        </div>
      </div>
    )
  }

  return (
    <BrowserRouter>
      <Routes>
        {/* Public */}
        <Route path='/' element={<HomePage />} />
        <Route path='/verify-email' element={<VerifyEmailPage />} />
        <Route path='/reset-password' element={<ResetPasswordPage />} />
        <Route path='/oauth-success' element={<OAuthSuccessPage />} />

        {/* Guest only (redirect to /dashboard if logged in) */}
        <Route element={<GuestRoute />}>
          <Route path='/login' element={<LoginPage />} />
          <Route path='/register' element={<RegisterPage />} />
          <Route path='/forgot-password' element={<ForgotPasswordPage />} />
        </Route>

        {/* Protected (redirect to /login if not logged in) */}
        <Route element={<ProtectedRoute />}>
          <Route path='/dashboard' element={<DashboardPage />} />
          <Route path='/profile' element={<ProfilePage />} />
        </Route>

        {/* 404 */}
        <Route path='*' element={
          <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--color-bg)', flexDirection: 'column', gap: '1rem' }}>
            <span style={{ fontSize: '4rem' }}>✈️</span>
            <h1 style={{ fontSize: '2rem', fontWeight: 800 }}>404 — Không tìm thấy trang</h1>
            <a href='/' style={{ color: 'var(--color-primary)' }}>Về trang chủ</a>
          </div>
        } />
      </Routes>
    </BrowserRouter>
  )
}

export default App
