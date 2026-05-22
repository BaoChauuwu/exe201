import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Link, useNavigate } from 'react-router-dom'
import { useState } from 'react'
import { Mail, Lock, Eye, EyeOff, Plane, AlertCircle } from 'lucide-react'
import { authApi } from '../api/auth.api'
import { useAuthStore } from '../store/authStore'
import GoogleButton from '../components/ui/GoogleButton'

const loginSchema = z.object({
  email: z.string().email('Email không hợp lệ'),
  password: z.string().min(6, 'Mật khẩu tối thiểu 6 ký tự')
})

type LoginForm = z.infer<typeof loginSchema>

export default function LoginPage() {
  const [showPass, setShowPass] = useState(false)
  const [apiError, setApiError] = useState('')
  const { setTokens, fetchMe } = useAuthStore()
  const navigate = useNavigate()

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema)
  })

  const onSubmit = async (data: LoginForm) => {
    try {
      setApiError('')
      const res = await authApi.login(data)
      setTokens(res.data.result.access_token, res.data.result.refresh_token)
      await fetchMe()
      navigate('/dashboard')
    } catch (err: any) {
      setApiError(err.response?.data?.message || 'Đăng nhập thất bại. Vui lòng thử lại.')
    }
  }

  return (
    <div className='auth-page'>
      <div className='auth-bg-orb auth-bg-orb-1' />
      <div className='auth-bg-orb auth-bg-orb-2' />

      <div className='auth-container animate-fade-in-up'>
        {/* Logo */}
        <div className='auth-logo'>
          <Link to='/'>
            <div className='auth-logo-icon'>
              <Plane size={28} color='#fff' />
            </div>
          </Link>
          <h1 className='auth-title'>Chào mừng trở lại</h1>
          <p className='auth-subtitle'>Đăng nhập vào tài khoản UniTravel của bạn</p>
        </div>

        <div className='card card-glow'>
          {/* Google Button */}
          <div style={{ marginBottom: '1.5rem' }}>
            <GoogleButton onClick={() => authApi.loginWithGoogle()} />
          </div>

          <div className='auth-divider'>hoặc</div>

          {/* Error */}
          {apiError && (
            <div className='alert alert-error' style={{ marginTop: '1rem' }}>
              <AlertCircle size={16} />
              {apiError}
            </div>
          )}

          {/* Form */}
          <form className='auth-form' onSubmit={handleSubmit(onSubmit)} style={{ marginTop: '1.5rem' }}>
            {/* Email */}
            <div className='input-group'>
              <label className='input-label' htmlFor='login-email'>Email</label>
              <div className='input-wrapper'>
                <Mail size={16} className='input-icon' />
                <input
                  id='login-email'
                  type='email'
                  placeholder='your@email.com'
                  className={`input-field with-icon ${errors.email ? 'error' : ''}`}
                  {...register('email')}
                />
              </div>
              {errors.email && (
                <span className='input-error'><AlertCircle size={12} />{errors.email.message}</span>
              )}
            </div>

            {/* Password */}
            <div className='input-group'>
              <label className='input-label' htmlFor='login-password'>Mật khẩu</label>
              <div className='input-wrapper'>
                <Lock size={16} className='input-icon' />
                <input
                  id='login-password'
                  type={showPass ? 'text' : 'password'}
                  placeholder='••••••••'
                  className={`input-field with-icon with-toggle ${errors.password ? 'error' : ''}`}
                  {...register('password')}
                />
                <button type='button' className='input-toggle' onClick={() => setShowPass(!showPass)}>
                  {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {errors.password && (
                <span className='input-error'><AlertCircle size={12} />{errors.password.message}</span>
              )}
            </div>

            {/* Forgot password */}
            <div style={{ textAlign: 'right', marginTop: '-0.5rem' }}>
              <Link to='/forgot-password' style={{ color: 'var(--color-primary)', fontSize: '0.875rem' }}>
                Quên mật khẩu?
              </Link>
            </div>

            <button
              id='btn-login-submit'
              type='submit'
              className='btn btn-primary btn-full btn-lg'
              disabled={isSubmitting}
            >
              {isSubmitting ? <span className='loading-spinner' /> : null}
              {isSubmitting ? 'Đang đăng nhập...' : 'Đăng nhập'}
            </button>
          </form>

          <div className='auth-footer' style={{ marginTop: '1.5rem' }}>
            Chưa có tài khoản? <Link to='/register'>Đăng ký ngay</Link>
          </div>
        </div>
      </div>
    </div>
  )
}
