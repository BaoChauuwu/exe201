import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { useState } from 'react'
import { Lock, Eye, EyeOff, Plane, AlertCircle, CheckCircle } from 'lucide-react'
import { authApi } from '../api/auth.api'

const schema = z.object({
  password: z.string().min(8, 'Mật khẩu tối thiểu 8 ký tự')
    .regex(/[A-Z]/, 'Cần ít nhất 1 chữ hoa')
    .regex(/[0-9]/, 'Cần ít nhất 1 chữ số'),
  confirm_password: z.string()
}).refine(d => d.password === d.confirm_password, {
  message: 'Mật khẩu xác nhận không khớp',
  path: ['confirm_password']
})

type FormData = z.infer<typeof schema>

export default function ResetPasswordPage() {
  const [searchParams] = useSearchParams()
  const [showPass, setShowPass] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [apiError, setApiError] = useState('')
  const [success, setSuccess] = useState(false)
  const navigate = useNavigate()

  const token = searchParams.get('token') || ''

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema)
  })

  const onSubmit = async (data: FormData) => {
    try {
      setApiError('')
      await authApi.resetPassword({
        forgot_password_token: token,
        password: data.password,
        confirm_password: data.confirm_password
      })
      setSuccess(true)
      setTimeout(() => navigate('/login'), 2000)
    } catch (err: any) {
      setApiError(err.response?.data?.message || 'Đặt lại mật khẩu thất bại.')
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
          <h1 className='auth-title'>Đặt lại mật khẩu</h1>
          <p className='auth-subtitle'>Tạo mật khẩu mới cho tài khoản của bạn</p>
        </div>

        <div className='card card-glow'>
          {!token && (
            <div className='alert alert-error' style={{ marginBottom: '1.5rem' }}>
              <AlertCircle size={16} />Link đặt lại mật khẩu không hợp lệ hoặc đã hết hạn.
            </div>
          )}

          {success ? (
            <div style={{ textAlign: 'center' }}>
              <div className='verify-icon verify-icon-success' style={{ margin: '0 auto 1.5rem' }}>
                <CheckCircle size={36} />
              </div>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '0.75rem' }}>
                Đặt lại thành công!
              </h3>
              <p style={{ color: 'var(--color-text-muted)', marginBottom: '2rem' }}>
                Đang chuyển hướng về trang đăng nhập...
              </p>
            </div>
          ) : (
            <>
              {apiError && (
                <div className='alert alert-error' style={{ marginBottom: '1.5rem' }}>
                  <AlertCircle size={16} />{apiError}
                </div>
              )}

              <form className='auth-form' onSubmit={handleSubmit(onSubmit)}>
                <div className='input-group'>
                  <label className='input-label' htmlFor='reset-password'>Mật khẩu mới</label>
                  <div className='input-wrapper'>
                    <Lock size={16} className='input-icon' />
                    <input
                      id='reset-password'
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

                <div className='input-group'>
                  <label className='input-label' htmlFor='reset-confirm'>Xác nhận mật khẩu mới</label>
                  <div className='input-wrapper'>
                    <Lock size={16} className='input-icon' />
                    <input
                      id='reset-confirm'
                      type={showConfirm ? 'text' : 'password'}
                      placeholder='Nhập lại mật khẩu mới'
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
                  id='btn-reset-submit'
                  type='submit'
                  className='btn btn-primary btn-full btn-lg'
                  disabled={isSubmitting || !token}
                >
                  {isSubmitting ? <span className='loading-spinner' /> : null}
                  {isSubmitting ? 'Đang cập nhật...' : 'Đặt lại mật khẩu'}
                </button>
              </form>
            </>
          )}

          <div className='auth-footer' style={{ marginTop: '1.5rem' }}>
            <Link to='/login' style={{ color: 'var(--color-primary)' }}>Quay lại đăng nhập</Link>
          </div>
        </div>
      </div>
    </div>
  )
}
