import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { useState } from 'react'
import { Lock, Eye, EyeOff, AlertCircle, KeyRound } from 'lucide-react'
import { authApi } from '../api/auth.api'
import toast from 'react-hot-toast'

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

const pageStyle: React.CSSProperties = {
  minHeight: '100vh',
  background: 'linear-gradient(135deg, #0f0c29 0%, #302b63 50%, #24243e 100%)',
  display: 'flex', alignItems: 'center', justifyContent: 'center',
  padding: '1.5rem', fontFamily: "'Inter', -apple-system, sans-serif",
  position: 'relative', overflow: 'hidden'
}

export default function ResetPasswordPage() {
  const [searchParams] = useSearchParams()
  const [showPass, setShowPass] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const navigate = useNavigate()
  const token = searchParams.get('token') || ''

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema)
  })

  const onSubmit = async (data: FormData) => {
    try {
      await authApi.resetPassword({ forgot_password_token: token, password: data.password, confirm_password: data.confirm_password })
      toast.success('Đặt lại mật khẩu thành công!')
      navigate('/login')
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Đặt lại mật khẩu thất bại.')
    }
  }

  return (
    <div style={pageStyle}>
      <div style={{ position: 'absolute', top: '-10rem', right: '-10rem', width: '40rem', height: '40rem', background: 'radial-gradient(circle, rgba(139,92,246,0.2) 0%, transparent 70%)', borderRadius: '50%', pointerEvents: 'none' }} />
      <div style={{ position: 'absolute', bottom: '-10rem', left: '-10rem', width: '35rem', height: '35rem', background: 'radial-gradient(circle, rgba(59,130,246,0.15) 0%, transparent 70%)', borderRadius: '50%', pointerEvents: 'none' }} />

      <div style={{ width: '100%', maxWidth: '420px', position: 'relative', zIndex: 1 }}>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <Link to='/' style={{ textDecoration: 'none', display: 'inline-flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
            <div style={{ width: '64px', height: '64px', borderRadius: '20px', background: 'linear-gradient(135deg, #8b5cf6, #6366f1)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 8px 32px rgba(139,92,246,0.4)', fontSize: '28px' }}>✈️</div>
            <div>
              <h1 style={{ fontSize: '1.875rem', fontWeight: 800, color: 'white', margin: 0 }}>Đặt lại mật khẩu</h1>
              <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.9rem', margin: '0.25rem 0 0' }}>Tạo mật khẩu mới cho tài khoản của bạn</p>
            </div>
          </Link>
        </div>

        <div style={{ background: 'rgba(255,255,255,0.05)', backdropFilter: 'blur(20px)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '24px', padding: '2rem', boxShadow: '0 25px 50px rgba(0,0,0,0.5)' }}>

          {!token && (
            <div style={{ background: 'rgba(239,68,68,0.15)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: '12px', padding: '0.875rem 1rem', display: 'flex', alignItems: 'center', gap: '0.75rem', color: '#fca5a5', fontSize: '0.875rem', marginBottom: '1.5rem' }}>
              <AlertCircle size={16} />Link không hợp lệ hoặc đã hết hạn.
            </div>
          )}

              <form onSubmit={handleSubmit(onSubmit)} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                {[
                  { id: 'reset-password', label: 'Mật khẩu mới', name: 'password', show: showPass, setShow: setShowPass, error: errors.password },
                  { id: 'reset-confirm', label: 'Xác nhận mật khẩu', name: 'confirm_password', show: showConfirm, setShow: setShowConfirm, error: errors.confirm_password }
                ].map(field => (
                  <div key={field.id}>
                    <label style={{ display: 'block', color: 'rgba(255,255,255,0.7)', fontSize: '0.8rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.5rem' }}>{field.label}</label>
                    <div style={{ position: 'relative' }}>
                      <Lock size={16} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'rgba(255,255,255,0.3)' }} />
                      <input
                         id={field.id}
                        type={field.show ? 'text' : 'password'}
                        placeholder='••••••••'
                        {...register(field.name as any)}
                        style={{ width: '100%', boxSizing: 'border-box', background: 'rgba(255,255,255,0.06)', border: `1px solid ${field.error ? 'rgba(239,68,68,0.5)' : 'rgba(255,255,255,0.1)'}`, borderRadius: '12px', padding: '0.875rem 3rem 0.875rem 2.75rem', color: 'white', fontSize: '0.9rem', outline: 'none' }}
                      />
                      <button type='button' onClick={() => field.setShow(!field.show)} style={{ position: 'absolute', right: '1rem', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(255,255,255,0.3)', padding: 0 }}>
                        {field.show ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>
                    {field.error && <span style={{ color: '#fca5a5', fontSize: '0.75rem', marginTop: '0.3rem', display: 'block' }}>{field.error.message}</span>}
                  </div>
                ))}

                <button
                  id='btn-reset-submit'
                  type='submit'
                  disabled={isSubmitting || !token}
                  style={{ width: '100%', background: 'linear-gradient(135deg, #8b5cf6, #6366f1)', border: 'none', borderRadius: '12px', padding: '1rem', color: 'white', fontWeight: 700, fontSize: '0.95rem', cursor: 'pointer', boxShadow: '0 8px 20px rgba(139,92,246,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', opacity: isSubmitting || !token ? 0.6 : 1 }}
                >
                  <KeyRound size={18} />
                  {isSubmitting ? 'Đang cập nhật...' : 'Đặt lại mật khẩu'}
                </button>
              </form>

          <p style={{ textAlign: 'center', marginTop: '1.5rem' }}>
            <Link to='/login' style={{ color: '#a78bfa', fontSize: '0.875rem', textDecoration: 'none' }}>Quay lại đăng nhập</Link>
          </p>
        </div>
      </div>
      <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
    </div>
  )
}
