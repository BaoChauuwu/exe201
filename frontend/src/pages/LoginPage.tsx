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
      const data = err.response?.data
      // Backend trả 422 với errors object chi tiết từng field
      if (data?.errors) {
        const fieldErrors = Object.values(data.errors) as any[]
        const firstMsg = fieldErrors[0]?.msg
        toast.error(typeof firstMsg === 'string' ? firstMsg : (data.message || 'Đăng nhập thất bại.'))
      } else {
        toast.error(data?.message || 'Đăng nhập thất bại. Vui lòng thử lại.')
      }
    }
  }

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'row-reverse',
      fontFamily: "'Inter', -apple-system, sans-serif"
    }}>
      {/* Nửa trái: Form đăng nhập (chùng nền với giao diện hiện tại) */}
      <div style={{
        flex: 1,
        background: 'var(--gradient-hero)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '2rem',
        position: 'relative',
        overflow: 'hidden'
      }}>
        {/* Decorative orbs */}
        <div className="auth-bg-orb auth-bg-orb-1" />
        <div className="auth-bg-orb auth-bg-orb-2" />
        
        <div style={{ width: '100%', maxWidth: '420px', position: 'relative', zIndex: 1 }}>
          {/* Logo */}
          <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
            <Link to='/' style={{ display: 'inline-flex', flexDirection: 'column', alignItems: 'center', gap: '1rem', textDecoration: 'none' }}>
              <div style={{
                width: '64px', height: '64px', borderRadius: '20px',
                background: 'var(--gradient-primary)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                boxShadow: 'var(--shadow-glow)',
                fontSize: '28px'
              }}>✈️</div>
              <div>
                <h1 style={{ fontSize: '1.875rem', fontWeight: 800, color: 'var(--color-text)', margin: 0, letterSpacing: '-0.025em' }}>
                  Chào mừng trở lại
                </h1>
                <p style={{ color: 'var(--color-text-muted)', fontSize: '0.95rem', margin: '0.25rem 0 0' }}>
                  Đăng nhập vào tài khoản UniTravel
                </p>
              </div>
            </Link>
          </div>

          {/* Form Card */}
          <div style={{
            background: '#ffffff',
            borderRadius: '24px',
            padding: '2.5rem 2rem',
            boxShadow: '0 10px 40px rgba(14, 165, 233, 0.08)',
            border: '1px solid var(--color-border)'
          }}>
            <div style={{ marginBottom: '1.5rem' }}>
              <GoogleButton onClick={() => authApi.loginWithGoogle()} />
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
              <div style={{ flex: 1, height: '1px', background: 'var(--color-border)' }} />
              <span style={{ color: 'var(--color-text-muted)', fontSize: '0.8rem', fontWeight: 500 }}>hoặc đăng nhập bằng email</span>
              <div style={{ flex: 1, height: '1px', background: 'var(--color-border)' }} />
            </div>

            <form onSubmit={handleSubmit(onSubmit)} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              {/* Email */}
              <div>
                <label style={{ display: 'block', color: 'var(--color-text-muted)', fontSize: '0.8rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.5rem' }}>
                  Email
                </label>
                <div style={{ position: 'relative' }}>
                  <Mail size={16} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-faint)' }} />
                  <input
                    id='login-email'
                    type='email'
                    placeholder='your@email.com'
                    {...register('email')}
                    style={{
                      width: '100%', boxSizing: 'border-box',
                      background: 'var(--color-bg)', border: `1px solid ${errors.email ? 'var(--color-error)' : 'var(--color-border)'}`,
                      borderRadius: '12px', padding: '0.875rem 1rem 0.875rem 2.75rem',
                      color: 'var(--color-text)', fontSize: '0.95rem', outline: 'none',
                      transition: 'all 0.2s'
                    }}
                    onFocus={(e) => { e.target.style.borderColor = 'var(--color-primary)'; e.target.style.boxShadow = '0 0 0 3px rgba(14, 165, 233, 0.1)'; }}
                    onBlur={(e) => { e.target.style.borderColor = errors.email ? 'var(--color-error)' : 'var(--color-border)'; e.target.style.boxShadow = 'none'; }}
                  />
                </div>
                {errors.email && <span style={{ color: 'var(--color-error)', fontSize: '0.8rem', marginTop: '0.35rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}><AlertCircle size={12} />{errors.email.message}</span>}
              </div>

              {/* Password */}
              <div>
                <label style={{ display: 'block', color: 'var(--color-text-muted)', fontSize: '0.8rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.5rem' }}>
                  Mật khẩu
                </label>
                <div style={{ position: 'relative' }}>
                  <Lock size={16} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-faint)' }} />
                  <input
                    id='login-password'
                    type={showPass ? 'text' : 'password'}
                    placeholder='••••••••'
                    {...register('password')}
                    style={{
                      width: '100%', boxSizing: 'border-box',
                      background: 'var(--color-bg)', border: `1px solid ${errors.password ? 'var(--color-error)' : 'var(--color-border)'}`,
                      borderRadius: '12px', padding: '0.875rem 3rem 0.875rem 2.75rem',
                      color: 'var(--color-text)', fontSize: '0.95rem', outline: 'none',
                      transition: 'all 0.2s'
                    }}
                    onFocus={(e) => { e.target.style.borderColor = 'var(--color-primary)'; e.target.style.boxShadow = '0 0 0 3px rgba(14, 165, 233, 0.1)'; }}
                    onBlur={(e) => { e.target.style.borderColor = errors.password ? 'var(--color-error)' : 'var(--color-border)'; e.target.style.boxShadow = 'none'; }}
                  />
                  <button type='button' onClick={() => setShowPass(!showPass)} style={{ position: 'absolute', right: '1rem', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-text-faint)', padding: 0 }}>
                    {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
                {errors.password && <span style={{ color: 'var(--color-error)', fontSize: '0.8rem', marginTop: '0.35rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}><AlertCircle size={12} />{errors.password.message}</span>}
              </div>

              <div style={{ textAlign: 'right', marginTop: '-0.5rem' }}>
                <Link to='/forgot-password' style={{ color: 'var(--color-primary)', fontSize: '0.85rem', fontWeight: 600, textDecoration: 'none' }}>Quên mật khẩu?</Link>
              </div>

              <button
                id='btn-login-submit'
                type='submit'
                disabled={isSubmitting}
                style={{
                  width: '100%', background: 'var(--gradient-primary)',
                  border: 'none', borderRadius: '12px', padding: '1rem',
                  color: 'white', fontWeight: 700, fontSize: '1rem', cursor: 'pointer',
                  boxShadow: '0 8px 20px rgba(14,165,233,0.3)', transition: 'all 0.2s',
                  display: 'flex', alignItems: 'center', justifyItems: 'center', justifyContent: 'center', gap: '0.5rem',
                  opacity: isSubmitting ? 0.7 : 1,
                  marginTop: '0.5rem'
                }}
              >
                {isSubmitting ? (
                  <><div style={{ width: '18px', height: '18px', border: '2px solid rgba(255,255,255,0.3)', borderTopColor: 'white', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} /> Đang đăng nhập...</>
                ) : 'Đăng nhập'}
              </button>
            </form>

            <p style={{ textAlign: 'center', color: 'var(--color-text-muted)', fontSize: '0.9rem', marginTop: '1.5rem', marginBottom: 0 }}>
              Chưa có tài khoản?{' '}
              <Link to='/register' style={{ color: 'var(--color-primary)', fontWeight: 600, textDecoration: 'none' }}>Đăng ký ngay</Link>
            </p>
          </div>
        </div>
      </div>

      {/* Nửa phải: Background Image & Branding */}
      <div className="login-image-side" style={{
        flex: 1.2,
        position: 'relative',
        background: 'url("https://images.unsplash.com/photo-1488085061387-422e29b40080?q=80&w=2000&auto=format&fit=crop") center/cover no-repeat',
      }}>
        {/* Lớp phủ gradient để ảnh tối đi một chút giúp text nổi bật */}
        <div style={{
          position: 'absolute',
          inset: 0,
          background: 'linear-gradient(135deg, rgba(2, 132, 199, 0.4) 0%, rgba(15, 23, 42, 0.7) 100%)'
        }} />
        
        {/* Content: Team Nexus & UniTravel */}
        <div style={{
          position: 'absolute',
          inset: 0,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'white',
          padding: '2rem',
          textAlign: 'center'
        }}>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 600, letterSpacing: '0.2em', textTransform: 'uppercase', marginBottom: '1rem', color: 'rgba(255,255,255,0.8)' }}>
            Team Nexus
          </h2>
          <h1 style={{ fontSize: '4rem', fontWeight: 900, letterSpacing: '-0.03em', margin: 0, textShadow: '0 10px 30px rgba(0,0,0,0.3)' }}>
            UniTravel
          </h1>
          <p style={{ fontSize: '1.25rem', marginTop: '1.5rem', maxWidth: '400px', lineHeight: 1.6, color: 'rgba(255,255,255,0.9)' }}>
            Khám phá thế giới qua góc nhìn của người bản địa. Trải nghiệm du lịch chân thực, an toàn và độc đáo.
          </p>
        </div>
      </div>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg) } }
        
        /* Ẩn nửa phải trên màn hình nhỏ */
        @media (max-width: 900px) {
          .login-image-side {
            display: none !important;
          }
        }
      `}</style>
    </div>
  )
}

