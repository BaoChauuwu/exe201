import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Link, useNavigate } from 'react-router-dom'
import { useState } from 'react'
import { Mail, Lock, Eye, EyeOff, User, Plane, Calendar, AlertCircle, CheckCircle, Users } from 'lucide-react'
import { authApi } from '../api/auth.api'
import { useAuthStore } from '../store/authStore'
import GoogleButton from '../components/ui/GoogleButton'

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
  const [apiError, setApiError] = useState('')
  const [success, setSuccess] = useState(false)
  const { setTokens, fetchMe } = useAuthStore()
  const navigate = useNavigate()

  const { register, handleSubmit, formState: { errors, isSubmitting }, setValue, watch } = useForm<RegisterForm>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      role: 'tourist'
    }
  })

  const selectedRole = watch('role')

  const onSubmit = async (data: RegisterForm) => {
    try {
      setApiError('')
      const res = await authApi.register(data)
      setTokens(res.data.result.access_token, res.data.result.refresh_token)
      await fetchMe() // Fetch profile right away so dashboard loads immediately
      setSuccess(true)
      setTimeout(() => navigate('/dashboard'), 1500)
    } catch (err: any) {
      setApiError(err.response?.data?.message || 'Đăng ký thất bại. Vui lòng thử lại.')
    }
  }

  return (
    <div className='auth-page'>
      <div className='auth-bg-orb auth-bg-orb-1' />
      <div className='auth-bg-orb auth-bg-orb-2' />

      <div className='auth-container animate-fade-in-up' style={{ maxWidth: 500 }}>
        <div className='auth-logo'>
          <Link to='/'>
            <div className='auth-logo-icon'>
              <Plane size={28} color='#fff' />
            </div>
          </Link>
          <h1 className='auth-title'>Tạo tài khoản mới</h1>
          <p className='auth-subtitle'>Tham gia cộng đồng UniTravel ngay hôm nay</p>
        </div>

        <div className='card card-glow'>
          <div style={{ marginBottom: '1.5rem' }}>
            <GoogleButton onClick={() => authApi.loginWithGoogle()} label='Đăng ký với Google' />
          </div>

          <div className='auth-divider'>hoặc đăng ký bằng email</div>

          {apiError && (
            <div className='alert alert-error' style={{ marginTop: '1rem' }}>
              <AlertCircle size={16} />{apiError}
            </div>
          )}
          {success && (
            <div className='alert alert-success' style={{ marginTop: '1rem' }}>
              <CheckCircle size={16} />Đăng ký thành công! Đang chuyển hướng...
            </div>
          )}

          <form className='auth-form' onSubmit={handleSubmit(onSubmit)} style={{ marginTop: '1.5rem' }}>
            {/* Role Selector */}
            <div className='input-group' style={{ marginBottom: '1.5rem' }}>
              <label className='input-label'>Bạn tham gia với vai trò</label>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginTop: '0.5rem' }}>
                <div
                  id='role-tourist-btn'
                  onClick={() => setValue('role', 'tourist')}
                  style={{
                    background: selectedRole === 'tourist' ? 'rgba(14, 165, 233, 0.12)' : 'rgba(255, 255, 255, 0.03)',
                    border: selectedRole === 'tourist' ? '2px solid var(--color-primary)' : '1px solid var(--color-border)',
                    borderRadius: '0.75rem',
                    padding: '1rem 0.5rem',
                    cursor: 'pointer',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.5rem',
                    transition: 'all 0.25s ease',
                    boxShadow: selectedRole === 'tourist' ? '0 0 15px rgba(14, 165, 233, 0.25)' : 'none',
                    textAlign: 'center'
                  }}
                >
                  <Plane size={24} color={selectedRole === 'tourist' ? 'var(--color-primary)' : 'var(--color-text-muted)'} />
                  <div style={{ fontWeight: 700, fontSize: '0.875rem', color: selectedRole === 'tourist' ? 'var(--color-text)' : 'var(--color-text-muted)' }}>Khách du lịch</div>
                  <div style={{ fontSize: '0.7rem', color: 'var(--color-text-muted)', lineHeight: '1.2' }}>Tìm & thuê hướng dẫn viên bản địa</div>
                </div>

                <div
                  id='role-buddy-btn'
                  onClick={() => setValue('role', 'buddy')}
                  style={{
                    background: selectedRole === 'buddy' ? 'rgba(139, 92, 246, 0.12)' : 'rgba(255, 255, 255, 0.03)',
                    border: selectedRole === 'buddy' ? '2px solid #8b5cf6' : '1px solid var(--color-border)',
                    borderRadius: '0.75rem',
                    padding: '1rem 0.5rem',
                    cursor: 'pointer',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.5rem',
                    transition: 'all 0.25s ease',
                    boxShadow: selectedRole === 'buddy' ? '0 0 15px rgba(139, 92, 246, 0.25)' : 'none',
                    textAlign: 'center'
                  }}
                >
                  <Users size={24} color={selectedRole === 'buddy' ? '#8b5cf6' : 'var(--color-text-muted)'} />
                  <div style={{ fontWeight: 700, fontSize: '0.875rem', color: selectedRole === 'buddy' ? 'var(--color-text)' : 'var(--color-text-muted)' }}>Local Buddy</div>
                  <div style={{ fontSize: '0.7rem', color: 'var(--color-text-muted)', lineHeight: '1.2' }}>Dẫn tour & chia sẻ văn hóa</div>
                </div>
              </div>
            </div>

            {/* Name */}
            <div className='input-group'>
              <label className='input-label' htmlFor='reg-name'>Họ và tên</label>
              <div className='input-wrapper'>
                <User size={16} className='input-icon' />
                <input
                  id='reg-name'
                  type='text'
                  placeholder='Nguyễn Văn A'
                  className={`input-field with-icon ${errors.name ? 'error' : ''}`}
                  {...register('name')}
                />
              </div>
              {errors.name && <span className='input-error'><AlertCircle size={12} />{errors.name.message}</span>}
            </div>

            {/* Email */}
            <div className='input-group'>
              <label className='input-label' htmlFor='reg-email'>Email</label>
              <div className='input-wrapper'>
                <Mail size={16} className='input-icon' />
                <input
                  id='reg-email'
                  type='email'
                  placeholder='your@email.com'
                  className={`input-field with-icon ${errors.email ? 'error' : ''}`}
                  {...register('email')}
                />
              </div>
              {errors.email && <span className='input-error'><AlertCircle size={12} />{errors.email.message}</span>}
            </div>

            {/* Date of Birth */}
            <div className='input-group'>
              <label className='input-label' htmlFor='reg-dob'>Ngày sinh</label>
              <div className='input-wrapper'>
                <Calendar size={16} className='input-icon' />
                <input
                  id='reg-dob'
                  type='date'
                  className={`input-field with-icon ${errors.date_of_birth ? 'error' : ''}`}
                  style={{ colorScheme: 'dark' }}
                  {...register('date_of_birth')}
                />
              </div>
              {errors.date_of_birth && <span className='input-error'><AlertCircle size={12} />{errors.date_of_birth.message}</span>}
            </div>

            {/* Password */}
            <div className='input-group'>
              <label className='input-label' htmlFor='reg-password'>Mật khẩu</label>
              <div className='input-wrapper'>
                <Lock size={16} className='input-icon' />
                <input
                  id='reg-password'
                  type={showPass ? 'text' : 'password'}
                  placeholder='Tối thiểu 8 ký tự'
                  className={`input-field with-icon with-toggle ${errors.password ? 'error' : ''}`}
                  {...register('password')}
                />
                <button type='button' className='input-toggle' onClick={() => setShowPass(!showPass)}>
                  {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {errors.password && <span className='input-error'><AlertCircle size={12} />{errors.password.message}</span>}
            </div>

            {/* Confirm Password */}
            <div className='input-group'>
              <label className='input-label' htmlFor='reg-confirm'>Xác nhận mật khẩu</label>
              <div className='input-wrapper'>
                <Lock size={16} className='input-icon' />
                <input
                  id='reg-confirm'
                  type={showConfirm ? 'text' : 'password'}
                  placeholder='Nhập lại mật khẩu'
                  className={`input-field with-icon with-toggle ${errors.confirm_password ? 'error' : ''}`}
                  {...register('confirm_password')}
                />
                <button type='button' className='input-toggle' onClick={() => setShowConfirm(!showConfirm)}>
                  {showConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {errors.confirm_password && <span className='input-error'><AlertCircle size={12} />{errors.confirm_password.message}</span>}
            </div>

            <button
              id='btn-register-submit'
              type='submit'
              className='btn btn-primary btn-full btn-lg'
              disabled={isSubmitting}
            >
              {isSubmitting ? <span className='loading-spinner' /> : null}
              {isSubmitting ? 'Đang đăng ký...' : 'Tạo tài khoản'}
            </button>
          </form>

          <div className='auth-footer' style={{ marginTop: '1.5rem' }}>
            Đã có tài khoản? <Link to='/login'>Đăng nhập</Link>
          </div>
        </div>
      </div>
    </div>
  )
}
