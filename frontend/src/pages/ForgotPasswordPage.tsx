import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Link } from 'react-router-dom'
import { useState } from 'react'
import { Mail, Plane, AlertCircle, CheckCircle, ArrowLeft } from 'lucide-react'
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
    <div className='auth-page'>
      <div className='auth-bg-orb auth-bg-orb-1' />
      <div className='auth-bg-orb auth-bg-orb-2' />

      <div className='auth-container animate-fade-in-up'>
        <div className='auth-logo'>
          <Link to='/'>
            <div className='auth-logo-icon'>
              <Plane size={28} color='#fff' />
            </div>
          </Link>
          <h1 className='auth-title'>Quên mật khẩu?</h1>
          <p className='auth-subtitle'>Nhập email để nhận link đặt lại mật khẩu</p>
        </div>

        <div className='card card-glow'>
          {!sent ? (
            <>
              {apiError && (
                <div className='alert alert-error' style={{ marginBottom: '1.5rem' }}>
                  <AlertCircle size={16} />{apiError}
                </div>
              )}

              <form className='auth-form' onSubmit={handleSubmit(onSubmit)}>
                <div className='input-group'>
                  <label className='input-label' htmlFor='forgot-email'>Email đăng ký</label>
                  <div className='input-wrapper'>
                    <Mail size={16} className='input-icon' />
                    <input
                      id='forgot-email'
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

                <button
                  id='btn-forgot-submit'
                  type='submit'
                  className='btn btn-primary btn-full btn-lg'
                  disabled={isSubmitting}
                >
                  {isSubmitting ? <span className='loading-spinner' /> : <Mail size={18} />}
                  {isSubmitting ? 'Đang gửi...' : 'Gửi link đặt lại mật khẩu'}
                </button>
              </form>
            </>
          ) : (
            <div style={{ textAlign: 'center' }}>
              <div className='verify-icon verify-icon-success' style={{ margin: '0 auto 1.5rem' }}>
                <CheckCircle size={36} />
              </div>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '0.75rem' }}>
                Email đã được gửi!
              </h3>
              <p style={{ color: 'var(--color-text-muted)', marginBottom: '2rem', fontSize: '0.875rem' }}>
                Chúng tôi đã gửi link đặt lại mật khẩu tới <strong style={{ color: 'var(--color-text)' }}>{getValues('email')}</strong>.
                Vui lòng kiểm tra hộp thư (và thư mục spam).
              </p>
              <button
                className='btn btn-secondary btn-full'
                onClick={() => setSent(false)}
              >
                Gửi lại
              </button>
            </div>
          )}

          <div className='auth-footer' style={{ marginTop: '1.5rem' }}>
            <Link to='/login' style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', color: 'var(--color-primary)' }}>
              <ArrowLeft size={16} /> Quay lại đăng nhập
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
