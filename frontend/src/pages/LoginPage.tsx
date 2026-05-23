import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Link, useNavigate } from 'react-router-dom'
import { useState } from 'react'
import { Mail, Lock, Eye, EyeOff, AlertCircle } from 'lucide-react'
import { authApi } from '../api/auth.api'
import { useAuthStore } from '../store/authStore'
import GoogleButton from '../components/ui/GoogleButton'
import toast from 'react-hot-toast'

const loginSchema = z.object({
  email: z.string().email('Email không hợp lệ'),
  password: z.string().min(6, 'Mật khẩu tối thiểu 6 ký tự')
})

type LoginForm = z.infer<typeof loginSchema>

export default function LoginPage() {
  const [showPass, setShowPass] = useState(false)
  const { setTokens, fetchMe } = useAuthStore()
  const navigate = useNavigate()

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema)
  })

  const onSubmit = async (data: LoginForm) => {
    try {
      const res = await authApi.login(data)
      setTokens(res.data.result.access_token, res.data.result.refresh_token)
      await fetchMe()
      const userState = useAuthStore.getState().user
      toast.success('Đăng nhập thành công!')
      navigate(userState?.role === 'admin' ? '/admin' : '/dashboard')
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Đăng nhập thất bại. Vui lòng thử lại.')
    }
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #0f0c29 0%, #302b63 50%, #24243e 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '1.5rem',
      fontFamily: "'Inter', -apple-system, sans-serif",
      position: 'relative',
      overflow: 'hidden'
    }}>
      {/* Decorative orbs */}
      <div style={{ position: 'absolute', top: '-10rem', right: '-10rem', width: '40rem', height: '40rem', background: 'radial-gradient(circle, rgba(139,92,246,0.2) 0%, transparent 70%)', borderRadius: '50%', pointerEvents: 'none' }} />
      <div style={{ position: 'absolute', bottom: '-10rem', left: '-10rem', width: '35rem', height: '35rem', background: 'radial-gradient(circle, rgba(59,130,246,0.15) 0%, transparent 70%)', borderRadius: '50%', pointerEvents: 'none' }} />

      <div style={{ width: '100%', maxWidth: '420px', position: 'relative', zIndex: 1 }}>
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <Link to='/' style={{ display: 'inline-flex', flexDirection: 'column', alignItems: 'center', gap: '1rem', textDecoration: 'none' }}>
            <div style={{
              width: '64px', height: '64px', borderRadius: '20px',
              background: 'linear-gradient(135deg, #8b5cf6, #6366f1)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: '0 8px 32px rgba(139,92,246,0.4)',
              fontSize: '28px'
            }}>✈️</div>
            <div>
              <h1 style={{ fontSize: '1.875rem', fontWeight: 800, color: 'white', margin: 0, letterSpacing: '-0.025em' }}>
                Chào mừng trở lại
              </h1>
              <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.9rem', margin: '0.25rem 0 0' }}>
                Đăng nhập vào tài khoản UniTravel
              </p>
            </div>
          </Link>
        </div>

        {/* Card */}
        <div style={{
          background: 'rgba(255,255,255,0.05)',
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(255,255,255,0.1)',
          borderRadius: '24px',
          padding: '2rem',
          boxShadow: '0 25px 50px rgba(0,0,0,0.5)'
        }}>
          <div style={{ marginBottom: '1.5rem' }}>
            <GoogleButton onClick={() => authApi.loginWithGoogle()} />
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
            <div style={{ flex: 1, height: '1px', background: 'rgba(255,255,255,0.1)' }} />
            <span style={{ color: 'rgba(255,255,255,0.35)', fontSize: '0.8rem', fontWeight: 500 }}>hoặc đăng nhập bằng email</span>
            <div style={{ flex: 1, height: '1px', background: 'rgba(255,255,255,0.1)' }} />
          </div>



          <form onSubmit={handleSubmit(onSubmit)} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            {/* Email */}
            <div>
              <label style={{ display: 'block', color: 'rgba(255,255,255,0.7)', fontSize: '0.8rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.5rem' }}>
                Email
              </label>
              <div style={{ position: 'relative' }}>
                <Mail size={16} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'rgba(255,255,255,0.3)' }} />
                <input
                  id='login-email'
                  type='email'
                  placeholder='your@email.com'
                  {...register('email')}
                  style={{
                    width: '100%', boxSizing: 'border-box',
                    background: 'rgba(255,255,255,0.06)', border: `1px solid ${errors.email ? 'rgba(239,68,68,0.5)' : 'rgba(255,255,255,0.1)'}`,
                    borderRadius: '12px', padding: '0.875rem 1rem 0.875rem 2.75rem',
                    color: 'white', fontSize: '0.9rem', outline: 'none',
                    transition: 'border-color 0.2s'
                  }}
                />
              </div>
              {errors.email && <span style={{ color: '#fca5a5', fontSize: '0.78rem', marginTop: '0.35rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}><AlertCircle size={12} />{errors.email.message}</span>}
            </div>

            {/* Password */}
            <div>
              <label style={{ display: 'block', color: 'rgba(255,255,255,0.7)', fontSize: '0.8rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.5rem' }}>
                Mật khẩu
              </label>
              <div style={{ position: 'relative' }}>
                <Lock size={16} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'rgba(255,255,255,0.3)' }} />
                <input
                  id='login-password'
                  type={showPass ? 'text' : 'password'}
                  placeholder='••••••••'
                  {...register('password')}
                  style={{
                    width: '100%', boxSizing: 'border-box',
                    background: 'rgba(255,255,255,0.06)', border: `1px solid ${errors.password ? 'rgba(239,68,68,0.5)' : 'rgba(255,255,255,0.1)'}`,
                    borderRadius: '12px', padding: '0.875rem 3rem 0.875rem 2.75rem',
                    color: 'white', fontSize: '0.9rem', outline: 'none'
                  }}
                />
                <button type='button' onClick={() => setShowPass(!showPass)} style={{ position: 'absolute', right: '1rem', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(255,255,255,0.3)', padding: 0 }}>
                  {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {errors.password && <span style={{ color: '#fca5a5', fontSize: '0.78rem', marginTop: '0.35rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}><AlertCircle size={12} />{errors.password.message}</span>}
            </div>

            <div style={{ textAlign: 'right', marginTop: '-0.5rem' }}>
              <Link to='/forgot-password' style={{ color: '#a78bfa', fontSize: '0.85rem', textDecoration: 'none' }}>Quên mật khẩu?</Link>
            </div>

            <button
              id='btn-login-submit'
              type='submit'
              disabled={isSubmitting}
              style={{
                width: '100%', background: 'linear-gradient(135deg, #8b5cf6, #6366f1)',
                border: 'none', borderRadius: '12px', padding: '1rem',
                color: 'white', fontWeight: 700, fontSize: '0.95rem', cursor: 'pointer',
                boxShadow: '0 8px 20px rgba(139,92,246,0.4)', transition: 'all 0.2s',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
                opacity: isSubmitting ? 0.7 : 1
              }}
            >
              {isSubmitting ? (
                <><div style={{ width: '18px', height: '18px', border: '2px solid rgba(255,255,255,0.3)', borderTopColor: 'white', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} /> Đang đăng nhập...</>
              ) : 'Đăng nhập'}
            </button>
          </form>

          <p style={{ textAlign: 'center', color: 'rgba(255,255,255,0.4)', fontSize: '0.875rem', marginTop: '1.5rem' }}>
            Chưa có tài khoản?{' '}
            <Link to='/register' style={{ color: '#a78bfa', fontWeight: 600, textDecoration: 'none' }}>Đăng ký ngay</Link>
          </p>
        </div>
      </div>
      <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
    </div>
  )
}
