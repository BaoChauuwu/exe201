import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Link } from 'react-router-dom'
import { useState } from 'react'
import { Mail, AlertCircle, CheckCircle, ArrowLeft } from 'lucide-react'
import { authApi } from '../api/auth.api'

const schema = z.object({
  email: z.string().email('Email không hợp lệ')
})
type FormData = z.infer<typeof schema>

export default function ForgotPasswordPage() {
  const [sent, setSent] = useState(false)
  const [apiError, setApiError] = useState('')

  const { register, handleSubmit, getValues, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema)
  })

  const onSubmit = async (data: FormData) => {
    try {
      setApiError('')
      await authApi.forgotPassword(data)
      setSent(true)
    } catch (err: any) {
      setApiError(err.response?.data?.message || 'Gửi email thất bại. Vui lòng thử lại.')
    }
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #0f0c29 0%, #302b63 50%, #24243e 100%)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: '1.5rem', fontFamily: "'Inter', -apple-system, sans-serif",
      position: 'relative', overflow: 'hidden'
    }}>
      <div style={{ position: 'absolute', top: '-10rem', right: '-10rem', width: '40rem', height: '40rem', background: 'radial-gradient(circle, rgba(139,92,246,0.2) 0%, transparent 70%)', borderRadius: '50%', pointerEvents: 'none' }} />
      <div style={{ position: 'absolute', bottom: '-10rem', left: '-10rem', width: '35rem', height: '35rem', background: 'radial-gradient(circle, rgba(59,130,246,0.15) 0%, transparent 70%)', borderRadius: '50%', pointerEvents: 'none' }} />

      <div style={{ width: '100%', maxWidth: '420px', position: 'relative', zIndex: 1 }}>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <Link to='/' style={{ display: 'inline-flex', flexDirection: 'column', alignItems: 'center', gap: '1rem', textDecoration: 'none' }}>
            <div style={{ width: '64px', height: '64px', borderRadius: '20px', background: 'linear-gradient(135deg, #8b5cf6, #6366f1)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 8px 32px rgba(139,92,246,0.4)', fontSize: '28px' }}>✈️</div>
            <div>
              <h1 style={{ fontSize: '1.875rem', fontWeight: 800, color: 'white', margin: 0 }}>Quên mật khẩu?</h1>
              <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.9rem', margin: '0.25rem 0 0' }}>Nhập email để nhận link đặt lại mật khẩu</p>
            </div>
          </Link>
        </div>

        <div style={{
          background: 'rgba(255,255,255,0.05)', backdropFilter: 'blur(20px)',
          border: '1px solid rgba(255,255,255,0.1)', borderRadius: '24px',
          padding: '2rem', boxShadow: '0 25px 50px rgba(0,0,0,0.5)'
        }}>
          {!sent ? (
            <>
              {apiError && (
                <div style={{ background: 'rgba(239,68,68,0.15)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: '12px', padding: '0.875rem 1rem', display: 'flex', alignItems: 'center', gap: '0.75rem', color: '#fca5a5', fontSize: '0.875rem', marginBottom: '1.5rem' }}>
                  <AlertCircle size={16} />{apiError}
                </div>
              )}
              <form onSubmit={handleSubmit(onSubmit)} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                <div>
                  <label style={{ display: 'block', color: 'rgba(255,255,255,0.7)', fontSize: '0.8rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.5rem' }}>Email đăng ký</label>
                  <div style={{ position: 'relative' }}>
                    <Mail size={16} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'rgba(255,255,255,0.3)' }} />
                    <input
                      id='forgot-email'
                      type='email'
                      placeholder='your@email.com'
                      {...register('email')}
                      style={{ width: '100%', boxSizing: 'border-box', background: 'rgba(255,255,255,0.06)', border: `1px solid ${errors.email ? 'rgba(239,68,68,0.5)' : 'rgba(255,255,255,0.1)'}`, borderRadius: '12px', padding: '0.875rem 1rem 0.875rem 2.75rem', color: 'white', fontSize: '0.9rem', outline: 'none' }}
                    />
                  </div>
                  {errors.email && <span style={{ color: '#fca5a5', fontSize: '0.78rem', marginTop: '0.35rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}><AlertCircle size={12} />{errors.email.message}</span>}
                </div>
                <button
                  id='btn-forgot-submit'
                  type='submit'
                  disabled={isSubmitting}
                  style={{ width: '100%', background: 'linear-gradient(135deg, #8b5cf6, #6366f1)', border: 'none', borderRadius: '12px', padding: '1rem', color: 'white', fontWeight: 700, fontSize: '0.95rem', cursor: 'pointer', boxShadow: '0 8px 20px rgba(139,92,246,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', opacity: isSubmitting ? 0.7 : 1 }}
                >
                  {isSubmitting ? 'Đang gửi...' : <><Mail size={18} /> Gửi link đặt lại mật khẩu</>}
                </button>
              </form>
            </>
          ) : (
            <div style={{ textAlign: 'center', padding: '1rem 0' }}>
              <div style={{ width: '72px', height: '72px', borderRadius: '50%', background: 'rgba(16,185,129,0.15)', border: '2px solid rgba(16,185,129,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem', color: '#34d399' }}>
                <CheckCircle size={36} />
              </div>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'white', marginBottom: '0.75rem' }}>Email đã được gửi!</h3>
              <p style={{ color: 'rgba(255,255,255,0.5)', marginBottom: '2rem', fontSize: '0.875rem', lineHeight: 1.6 }}>
                Chúng tôi đã gửi link đặt lại mật khẩu tới <strong style={{ color: '#a78bfa' }}>{getValues('email')}</strong>. Vui lòng kiểm tra hộp thư.
              </p>
              <button onClick={() => setSent(false)} style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '12px', padding: '0.875rem 2rem', color: 'white', fontWeight: 600, cursor: 'pointer', width: '100%' }}>
                Gửi lại
              </button>
            </div>
          )}

          <div style={{ marginTop: '1.5rem', textAlign: 'center' }}>
            <Link to='/login' style={{ color: '#a78bfa', fontSize: '0.875rem', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
              <ArrowLeft size={16} /> Quay lại đăng nhập
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
