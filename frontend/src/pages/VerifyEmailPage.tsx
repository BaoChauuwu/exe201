import { useEffect, useState } from 'react'
import { useSearchParams, Link } from 'react-router-dom'
import { Plane, CheckCircle, XCircle, Mail, Loader } from 'lucide-react'
import { authApi } from '../api/auth.api'
import { useAuthStore } from '../store/authStore'

type Status = 'loading' | 'success' | 'already' | 'error'

export default function VerifyEmailPage() {
  const [searchParams] = useSearchParams()
  const [status, setStatus] = useState<Status>('loading')
  const [message, setMessage] = useState('')
  const [resending, setResending] = useState(false)
  const [resendSuccess, setResendSuccess] = useState(false)
  const { setTokens } = useAuthStore()

  useEffect(() => {
    const token = searchParams.get('token')
    if (!token) {
      setStatus('error')
      setMessage('Không tìm thấy token xác thực.')
      return
    }

    authApi.verifyEmail(token)
      .then((res) => {
        const msg = res.data.message
        if (msg.includes('already')) {
          setStatus('already')
          setMessage('Email của bạn đã được xác thực trước đó.')
        } else {
          setStatus('success')
          setMessage('Email xác thực thành công!')
          if (res.data.result) {
            setTokens(res.data.result.access_token, res.data.result.refresh_token)
          }
        }
      })
      .catch(() => {
        setStatus('error')
        setMessage('Token không hợp lệ hoặc đã hết hạn.')
      })
  }, [])

  const handleResend = async () => {
    try {
      setResending(true)
      await authApi.resendEmailVerify()
      setResendSuccess(true)
    } catch {
      // ignore
    } finally {
      setResending(false)
    }
  }

  const configs = {
    loading: {
      icon: <Loader size={36} className='animate-spin' style={{ animation: 'spin 1s linear infinite' }} />,
      iconClass: 'verify-icon-loading',
      title: 'Đang xác thực...',
      desc: 'Vui lòng chờ trong giây lát'
    },
    success: {
      icon: <CheckCircle size={36} />,
      iconClass: 'verify-icon-success',
      title: 'Xác thực thành công! 🎉',
      desc: 'Email của bạn đã được xác thực. Bạn có thể bắt đầu sử dụng UniTravel.'
    },
    already: {
      icon: <CheckCircle size={36} />,
      iconClass: 'verify-icon-success',
      title: 'Đã xác thực',
      desc: message
    },
    error: {
      icon: <XCircle size={36} />,
      iconClass: 'verify-icon-error',
      title: 'Xác thực thất bại',
      desc: message
    }
  }

  const cfg = configs[status]

  return (
    <div className='verify-page'>
      <div className='auth-bg-orb auth-bg-orb-1' />
      <div className='auth-bg-orb auth-bg-orb-2' />

      <div className='auth-container animate-fade-in-up'>
        <div className='auth-logo'>
          <Link to='/'>
            <div className='auth-logo-icon'>
              <Plane size={28} color='#fff' />
            </div>
          </Link>
        </div>

        <div className='card card-glow' style={{ textAlign: 'center' }}>
          <div className={`verify-icon ${cfg.iconClass}`}>{cfg.icon}</div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: '0.75rem' }}>{cfg.title}</h2>
          <p style={{ color: 'var(--color-text-muted)', marginBottom: '2rem' }}>{cfg.desc}</p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {(status === 'success' || status === 'already') && (
              <Link to='/dashboard'>
                <button className='btn btn-primary btn-full btn-lg' id='verify-goto-dashboard'>
                  Vào Dashboard
                </button>
              </Link>
            )}

            {status === 'error' && (
              <>
                {resendSuccess ? (
                  <div className='alert alert-success'>
                    <Mail size={16} />Email xác thực đã được gửi lại!
                  </div>
                ) : (
                  <button
                    className='btn btn-secondary btn-full'
                    onClick={handleResend}
                    disabled={resending}
                    id='btn-resend-verify'
                  >
                    {resending ? <span className='loading-spinner' /> : <Mail size={16} />}
                    {resending ? 'Đang gửi...' : 'Gửi lại email xác thực'}
                  </button>
                )}
                <Link to='/login'>
                  <button className='btn btn-ghost btn-full'>Quay lại đăng nhập</button>
                </Link>
              </>
            )}

            {status === 'loading' && (
              <p style={{ color: 'var(--color-text-faint)', fontSize: '0.875rem' }}>
                Đang kết nối với máy chủ...
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
