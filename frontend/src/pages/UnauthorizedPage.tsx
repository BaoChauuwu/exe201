import { useNavigate } from 'react-router-dom'
import { ShieldAlert, ArrowLeft, Home } from 'lucide-react'
import { useAuthStore } from '../store/authStore'

export default function UnauthorizedPage() {
  const navigate = useNavigate()
  const { user } = useAuthStore()

  const handleGoHome = () => {
    if (user?.role === 'admin') {
      navigate('/admin')
    } else {
      navigate('/dashboard')
    }
  }

  return (
    <div className='auth-page'>
      <div className='auth-bg-orb auth-bg-orb-1' />
      <div className='auth-bg-orb auth-bg-orb-2' />

      <div className='auth-container' style={{ maxWidth: '500px' }}>
        <div className='card card-glow glass' style={{ textAlign: 'center', padding: '3rem 2rem' }}>
          <div 
            className='auth-logo-icon' 
            style={{ 
              background: 'rgba(239, 68, 68, 0.1)', 
              border: '1px solid rgba(239, 68, 68, 0.2)',
              boxShadow: '0 0 30px rgba(239, 68, 68, 0.2)',
              color: '#ef4444'
            }}
          >
            <ShieldAlert size={32} />
          </div>

          <h1 className='auth-title' style={{ color: '#ef4444', fontSize: '2.5rem', marginBottom: '0.5rem' }}>
            403
          </h1>
          <h2 className='auth-title' style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>
            Quyền truy cập bị từ chối
          </h2>
          
          <p style={{ color: 'var(--color-text-muted)', marginBottom: '2.5rem', fontSize: '0.95rem' }}>
            Tài khoản của bạn không có quyền truy cập vào tài nguyên này. Vui lòng quay lại hoặc liên hệ quản trị viên nếu bạn tin rằng đây là một sự nhầm lẫn.
          </p>

          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
            <button 
              className='btn btn-secondary' 
              onClick={() => navigate(-1)}
              style={{ flex: 1 }}
            >
              <ArrowLeft size={18} />
              Quay lại
            </button>
            <button 
              className='btn btn-primary' 
              onClick={handleGoHome}
              style={{ flex: 1, boxShadow: '0 4px 20px rgba(14, 165, 233, 0.2)' }}
            >
              <Home size={18} />
              Trang chủ
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
