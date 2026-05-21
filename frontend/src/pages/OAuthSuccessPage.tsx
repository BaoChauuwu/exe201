import { useEffect } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import { useAuthStore } from '../store/authStore'

export default function OAuthSuccessPage() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const { setTokens } = useAuthStore()

  useEffect(() => {
    const access_token = searchParams.get('access_token')
    const refresh_token = searchParams.get('refresh_token')
    const error = searchParams.get('error')

    if (error || !access_token || !refresh_token) {
      navigate('/login?error=oauth_failed')
      return
    }

    setTokens(access_token, refresh_token)
    navigate('/dashboard')
  }, [])

  return (
    <div className='loading-page'>
      <div style={{ textAlign: 'center' }}>
        <div className='loading-large' style={{ margin: '0 auto 1rem' }} />
        <p style={{ color: 'var(--color-text-muted)' }}>Đang đăng nhập với Google...</p>
      </div>
    </div>
  )
}
