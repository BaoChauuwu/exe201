import { useEffect, useState } from 'react'
import { useSearchParams, Link } from 'react-router-dom'
import { CheckCircle, XCircle, Mail, Loader } from 'lucide-react'
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
          if (res.data.result) setTokens(res.data.result.access_token, res.data.result.refresh_token)
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
    } catch { } finally { setResending(false) }
  }

  const configs = {
    loading: { icon: '⌛', color: '#6366f1', bg: 'rgba(99,102,241,0.15)', border: 'rgba(99,102,241,0.3)', title: 'Đang xác thực...', desc: 'Vui lòng chờ trong giây lát' },
    success: { icon: '✅', color: '#10b981', bg: 'rgba(16,185,129,0.15)', border: 'rgba(16,185,129,0.3)', title: 'Xác thực thành công! 🎉', desc: 'Email của bạn đã được xác thực. Bạn có thể bắt đầu sử dụng UniTravel.' },
    already: { icon: '✅', color: '#10b981', bg: 'rgba(16,185,129,0.15)', border: 'rgba(16,185,129,0.3)', title: 'Đã xác thực', desc: message },
    error: { icon: '❌', color: '#ef4444', bg: 'rgba(239,68,68,0.15)', border: 'rgba(239,68,68,0.3)', title: 'Xác thực thất bại', desc: message },
  }
  const cfg = configs[status]

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #0f0c29 0%, #302b63 50%, #24243e 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1.5rem', fontFamily: "'Inter', -apple-system, sans-serif", position: 'relative', overflow: 'hidden' }}>
      <div style={{ position: 'absolute', top: '-10rem', right: '-10rem', width: '40rem', height: '40rem', background: 'radial-gradient(circle, rgba(139,92,246,0.2) 0%, transparent 70%)', borderRadius: '50%', pointerEvents: 'none' }} />
      <div style={{ position: 'absolute', bottom: '-10rem', left: '-10rem', width: '35rem', height: '35rem', background: 'radial-gradient(circle, rgba(59,130,246,0.15) 0%, transparent 70%)', borderRadius: '50%', pointerEvents: 'none' }} />

      <div style={{ width: '100%', maxWidth: '420px', position: 'relative', zIndex: 1 }}>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <Link to='/' style={{ textDecoration: 'none' }}>
            <div style={{ width: '64px', height: '64px', borderRadius: '20px', background: 'linear-gradient(135deg, #8b5cf6, #6366f1)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 8px 32px rgba(139,92,246,0.4)', fontSize: '28px', margin: '0 auto 1rem' }}>✈️</div>
          </Link>
          <h1 style={{ fontSize: '1.875rem', fontWeight: 800, color: 'white', margin: 0 }}>Xác thực Email</h1>
        </div>

        <div style={{ background: 'rgba(255,255,255,0.05)', backdropFilter: 'blur(20px)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '24px', padding: '2.5rem 2rem', boxShadow: '0 25px 50px rgba(0,0,0,0.5)', textAlign: 'center' }}>

          <div style={{ width: '80px', height: '80px', borderRadius: '50%', background: cfg.bg, border: `2px solid ${cfg.border}`, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem', fontSize: '2.5rem' }}>
            {status === 'loading' ? <Loader size={36} style={{ color: cfg.color, animation: 'spin 1s linear infinite' }} /> : cfg.icon}
          </div>

          <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'white', marginBottom: '0.75rem' }}>{cfg.title}</h2>
          <p style={{ color: 'rgba(255,255,255,0.5)', marginBottom: '2rem', fontSize: '0.9rem', lineHeight: 1.6 }}>{cfg.desc}</p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {(status === 'success' || status === 'already') && (
              <Link to='/dashboard' style={{ textDecoration: 'none' }}>
                <button id='verify-goto-dashboard' style={{ width: '100%', background: 'linear-gradient(135deg, #8b5cf6, #6366f1)', border: 'none', borderRadius: '12px', padding: '1rem', color: 'white', fontWeight: 700, fontSize: '0.95rem', cursor: 'pointer', boxShadow: '0 8px 20px rgba(139,92,246,0.4)' }}>
                  Vào Dashboard 🚀
                </button>
              </Link>
            )}
            {status === 'error' && (
              <>
                {resendSuccess ? (
                  <div style={{ background: 'rgba(16,185,129,0.15)', border: '1px solid rgba(16,185,129,0.3)', borderRadius: '12px', padding: '0.875rem 1rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.75rem', color: '#6ee7b7', fontSize: '0.875rem' }}>
                    <Mail size={16} /> Email xác thực đã được gửi lại!
                  </div>
                ) : (
                  <button id='btn-resend-verify' onClick={handleResend} disabled={resending} style={{ width: '100%', background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '12px', padding: '1rem', color: 'rgba(255,255,255,0.8)', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
                    <Mail size={16} /> {resending ? 'Đang gửi...' : 'Gửi lại email xác thực'}
                  </button>
                )}
                <Link to='/login' style={{ textDecoration: 'none' }}>
                  <button style={{ width: '100%', background: 'none', border: 'none', color: '#a78bfa', fontSize: '0.875rem', cursor: 'pointer', padding: '0.5rem' }}>Quay lại đăng nhập</button>
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
      <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
    </div>
  )
}
