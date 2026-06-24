import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Link, useNavigate } from 'react-router-dom'
import { useState } from 'react'
import { Mail, Lock, Eye, EyeOff, User, Calendar, Plane, Users } from 'lucide-react'
import { authApi } from '../api/auth.api'
import { useAuthStore } from '../store/authStore'
import GoogleButton from '../components/ui/GoogleButton'
import toast from 'react-hot-toast'

const registerSchema = z.object({
  name: z.string().min(2, 'Tên tối thiểu 2 ký tự'),
  email: z.string().email('Email không hợp lệ'),
  date_of_birth: z.string().min(1, 'Vui lòng chọn ngày sinh'),
  password: z.string().min(8, 'Mật khẩu tối thiểu 8 ký tự')
    .regex(/[A-Z]/, 'Cần ít nhất 1 chữ hoa')
    .regex(/[0-9]/, 'Cần ít nhất 1 chữ số'),
  confirm_password: z.string(),
  role: z.enum(['tourist', 'buddy'])
}).refine((d) => d.password === d.confirm_password, {
  message: 'Mật khẩu xác nhận không khớp',
  path: ['confirm_password']
})

type RegisterForm = z.infer<typeof registerSchema>

export default function RegisterPage() {
  const [showPass, setShowPass] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const { setTokens, fetchMe } = useAuthStore()
  const navigate = useNavigate()

  const { register, handleSubmit, formState: { errors, isSubmitting }, setValue, watch } = useForm<RegisterForm>({
    resolver: zodResolver(registerSchema),
    defaultValues: { role: 'tourist' }
  })

  const selectedRole = watch('role')

  const onSubmit = async (data: RegisterForm) => {
    try {
      const res = await authApi.register(data)
      setTokens(res.data.result.access_token, res.data.result.refresh_token)
      await fetchMe()
      toast.success('Đăng ký thành công! Đang chuyển hướng...')
      setTimeout(() => navigate('/dashboard'), 1500)
    } catch (err: any) {
      const data = err.response?.data
      if (data?.errors) {
        const fieldErrors = Object.values(data.errors) as any[]
        const firstMsg = fieldErrors[0]?.msg
        toast.error(typeof firstMsg === 'string' ? firstMsg : (data.message || 'Đăng ký thất bại.'))
      } else {
        toast.error(data?.message || 'Đăng ký thất bại. Vui lòng thử lại.')
      }
    }
  }

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      fontFamily: "'Inter', -apple-system, sans-serif"
    }}>
      {/* Nửa trái: Background Image & Branding */}
      <div className="auth-image-side" style={{
        flex: 1.2,
        position: 'relative',
        background: 'url("https://images.unsplash.com/photo-1488085061387-422e29b40080?q=80&w=2000&auto=format&fit=crop") center/cover no-repeat',
      }}>
        <div style={{
          position: 'absolute',
          inset: 0,
          background: 'linear-gradient(135deg, rgba(2, 132, 199, 0.4) 0%, rgba(15, 23, 42, 0.7) 100%)'
        }} />
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

      {/* Nửa phải: Form đăng ký */}
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

        <div style={{ width: '100%', maxWidth: '500px', position: 'relative', zIndex: 1 }}>
          {/* Logo */}
          <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
            <Link to='/' style={{ display: 'inline-flex', flexDirection: 'column', alignItems: 'center', gap: '1rem', textDecoration: 'none' }}>
              <div style={{ width: '64px', height: '64px', borderRadius: '20px', background: 'var(--gradient-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: 'var(--shadow-glow)', fontSize: '28px' }}>✈️</div>
              <div>
                <h1 style={{ fontSize: '1.875rem', fontWeight: 800, color: 'var(--color-text)', margin: 0 }}>Tạo tài khoản mới</h1>
                <p style={{ color: 'var(--color-text-muted)', fontSize: '0.9rem', margin: '0.25rem 0 0' }}>Tham gia cộng đồng UniTravel ngay hôm nay</p>
              </div>
            </Link>
          </div>

          {/* Card */}
          <div style={{ background: '#ffffff', borderRadius: '24px', padding: '2rem', boxShadow: '0 10px 40px rgba(14, 165, 233, 0.08)', border: '1px solid var(--color-border)' }}>
            <div style={{ marginBottom: '1.5rem' }}>
              <GoogleButton onClick={() => authApi.loginWithGoogle()} label='Đăng ký với Google' />
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
              <div style={{ flex: 1, height: '1px', background: 'var(--color-border)' }} />
              <span style={{ color: 'var(--color-text-muted)', fontSize: '0.8rem', fontWeight: 500 }}>hoặc đăng ký bằng email</span>
              <div style={{ flex: 1, height: '1px', background: 'var(--color-border)' }} />
            </div>

            <form onSubmit={handleSubmit(onSubmit)} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>

              {/* Role Selector */}
              <div>
                <label style={{ display: 'block', color: 'var(--color-text-muted)', fontSize: '0.8rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.75rem' }}>Bạn tham gia với vai trò</label>
                <div className="responsive-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                  <div
                    id='role-tourist-btn'
                    onClick={() => setValue('role', 'tourist')}
                    className={`role-btn ${selectedRole === 'tourist' ? 'active tourist' : ''}`}
                  >
                    <Plane size={24} style={{ color: selectedRole === 'tourist' ? '#0ea5e9' : 'var(--color-text-faint)', marginBottom: '0.5rem' }} />
                    <div style={{ fontWeight: 700, fontSize: '0.875rem', color: selectedRole === 'tourist' ? 'var(--color-text)' : 'var(--color-text-muted)' }}>Khách du lịch</div>
                    <div style={{ fontSize: '0.7rem', color: selectedRole === 'tourist' ? 'var(--color-text-muted)' : 'var(--color-text-faint)', marginTop: '0.25rem', lineHeight: 1.3 }}>Tìm & thuê hướng dẫn viên</div>
                  </div>
                  <div
                    id='role-buddy-btn'
                    onClick={() => setValue('role', 'buddy')}
                    className={`role-btn ${selectedRole === 'buddy' ? 'active buddy' : ''}`}
                  >
                    <Users size={24} style={{ color: selectedRole === 'buddy' ? '#8b5cf6' : 'var(--color-text-faint)', marginBottom: '0.5rem' }} />
                    <div style={{ fontWeight: 700, fontSize: '0.875rem', color: selectedRole === 'buddy' ? 'var(--color-text)' : 'var(--color-text-muted)' }}>Local Buddy</div>
                    <div style={{ fontSize: '0.7rem', color: selectedRole === 'buddy' ? 'var(--color-text-muted)' : 'var(--color-text-faint)', marginTop: '0.25rem', lineHeight: 1.3 }}>Dẫn tour & chia sẻ văn hóa</div>
                  </div>
                </div>
              </div>

              {/* Name + DOB grid */}
              <div className="responsive-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label className="input-label">Họ và tên</label>
                  <div style={{ position: 'relative' }}>
                    <User size={16} className="input-icon" />
                    <input id='reg-name' type='text' placeholder='Nguyễn Văn A' {...register('name')} className={`auth-input ${errors.name ? 'error' : ''}`} />
                  </div>
                  {errors.name && <span className="error-text">{errors.name.message}</span>}
                </div>
                <div>
                  <label className="input-label">Ngày sinh</label>
                  <div style={{ position: 'relative' }}>
                    <Calendar size={16} className="input-icon" />
                    <input id='reg-dob' type='date' {...register('date_of_birth')} className={`auth-input ${errors.date_of_birth ? 'error' : ''}`} style={{ paddingRight: '1rem' }} />
                  </div>
                  {errors.date_of_birth && <span className="error-text">{errors.date_of_birth.message}</span>}
                </div>
              </div>

              {/* Email */}
              <div>
                <label className="input-label">Email</label>
                <div style={{ position: 'relative' }}>
                  <Mail size={16} className="input-icon" />
                  <input id='reg-email' type='email' placeholder='your@email.com' {...register('email')} className={`auth-input ${errors.email ? 'error' : ''}`} />
                </div>
                {errors.email && <span className="error-text">{errors.email.message}</span>}
              </div>

              {/* Password + Confirm */}
              <div className="responsive-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label className="input-label">Mật khẩu</label>
                  <div style={{ position: 'relative' }}>
                    <Lock size={16} className="input-icon" />
                    <input id='reg-password' type={showPass ? 'text' : 'password'} placeholder='Tối thiểu 8 ký tự' {...register('password')} className={`auth-input ${errors.password ? 'error' : ''}`} style={{ paddingRight: '2.5rem' }} />
                    <button type='button' onClick={() => setShowPass(!showPass)} className="pass-toggle-btn">
                      {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                  {errors.password && <span className="error-text">{errors.password.message}</span>}
                </div>
                <div>
                  <label className="input-label">Xác nhận</label>
                  <div style={{ position: 'relative' }}>
                    <Lock size={16} className="input-icon" />
                    <input id='reg-confirm' type={showConfirm ? 'text' : 'password'} placeholder='Nhập lại' {...register('confirm_password')} className={`auth-input ${errors.confirm_password ? 'error' : ''}`} style={{ paddingRight: '2.5rem' }} />
                    <button type='button' onClick={() => setShowConfirm(!showConfirm)} className="pass-toggle-btn">
                      {showConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                  {errors.confirm_password && <span className="error-text">{errors.confirm_password.message}</span>}
                </div>
              </div>

              <button
                id='btn-register-submit'
                type='submit'
                disabled={isSubmitting}
                style={{ width: '100%', background: 'var(--gradient-primary)', border: 'none', borderRadius: '12px', padding: '1rem', color: 'white', fontWeight: 700, fontSize: '1rem', cursor: 'pointer', boxShadow: '0 8px 20px rgba(14,165,233,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', opacity: isSubmitting ? 0.7 : 1, marginTop: '0.5rem', transition: 'all 0.2s' }}
              >
                {isSubmitting ? (
                  <><div style={{ width: '18px', height: '18px', border: '2px solid rgba(255,255,255,0.3)', borderTopColor: 'white', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} /> Đang tạo tài khoản...</>
                ) : 'Tạo tài khoản'}
              </button>
            </form>

            <p style={{ textAlign: 'center', color: 'var(--color-text-muted)', fontSize: '0.9rem', marginTop: '1.5rem', marginBottom: 0 }}>
              Đã có tài khoản?{' '}
              <Link to='/login' style={{ color: 'var(--color-primary)', fontWeight: 600, textDecoration: 'none' }}>Đăng nhập</Link>
            </p>
          </div>
        </div>
      </div>
      <style>{`
        @keyframes spin { to { transform: rotate(360deg) } }
        
        .input-label {
          display: block; 
          color: var(--color-text-muted); 
          font-size: 0.8rem; 
          font-weight: 600; 
          text-transform: uppercase; 
          letter-spacing: 0.05em; 
          margin-bottom: 0.5rem;
        }
        
        .input-icon {
          position: absolute; 
          left: 1rem; 
          top: 50%; 
          transform: translateY(-50%); 
          color: var(--color-text-faint);
        }

        .auth-input {
          width: 100%; 
          box-sizing: border-box;
          background: var(--color-bg); 
          border: 1px solid var(--color-border);
          border-radius: 12px; 
          padding: 0.875rem 1rem 0.875rem 2.75rem;
          color: var(--color-text); 
          font-size: 0.95rem; 
          outline: none;
          transition: all 0.2s;
        }
        .auth-input:focus {
          border-color: var(--color-primary);
          box-shadow: 0 0 0 3px rgba(14, 165, 233, 0.1);
        }
        .auth-input.error {
          border-color: var(--color-error);
        }
        
        .error-text {
          color: var(--color-error); 
          font-size: 0.75rem; 
          margin-top: 0.35rem; 
          display: block;
        }

        .pass-toggle-btn {
          position: absolute; 
          right: 1rem; 
          top: 50%; 
          transform: translateY(-50%); 
          background: none; 
          border: none; 
          cursor: pointer; 
          color: var(--color-text-faint); 
          padding: 0;
        }
        .pass-toggle-btn:hover {
          color: var(--color-primary);
        }

        .role-btn {
          background: var(--color-bg);
          border: 1px solid var(--color-border);
          border-radius: 16px; 
          padding: 1.25rem 0.75rem; 
          cursor: pointer;
          text-align: center; 
          transition: all 0.25s;
        }
        .role-btn:hover {
          border-color: var(--color-primary);
        }
        .role-btn.active.tourist {
          background: rgba(14, 165, 233, 0.05);
          border-color: var(--color-primary);
          box-shadow: 0 0 0 1px var(--color-primary);
        }
        .role-btn.active.buddy {
          background: rgba(139, 92, 246, 0.05);
          border-color: #8b5cf6;
          box-shadow: 0 0 0 1px #8b5cf6;
        }
        
        @media (max-width: 900px) {
          .auth-image-side {
            display: none !important;
          }
        }
      `}</style>
    </div>
  )
}
