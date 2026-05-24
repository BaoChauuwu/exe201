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

const inputStyle = (hasError: boolean): React.CSSProperties => ({
  width: '100%', boxSizing: 'border-box' as any,
  background: 'rgba(255,255,255,0.06)',
  border: `1px solid ${hasError ? 'rgba(239,68,68,0.5)' : 'rgba(255,255,255,0.1)'}`,
  borderRadius: '12px', padding: '0.875rem 1rem 0.875rem 2.75rem',
  color: 'white', fontSize: '0.9rem', outline: 'none', transition: 'border-color 0.2s',
  colorScheme: 'dark' as any
})

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
      // Backend trả 422 với errors object chi tiết từng field
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
      background: 'linear-gradient(135deg, #0f0c29 0%, #302b63 50%, #24243e 100%)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: '2rem 1.5rem', fontFamily: "'Inter', -apple-system, sans-serif",
      position: 'relative', overflow: 'hidden'
    }}>
      <div style={{ position: 'absolute', top: '-10rem', right: '-10rem', width: '40rem', height: '40rem', background: 'radial-gradient(circle, rgba(139,92,246,0.2) 0%, transparent 70%)', borderRadius: '50%', pointerEvents: 'none' }} />
      <div style={{ position: 'absolute', bottom: '-10rem', left: '-10rem', width: '35rem', height: '35rem', background: 'radial-gradient(circle, rgba(99,102,241,0.15) 0%, transparent 70%)', borderRadius: '50%', pointerEvents: 'none' }} />

      <div style={{ width: '100%', maxWidth: '500px', position: 'relative', zIndex: 1 }}>
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <Link to='/' style={{ display: 'inline-flex', flexDirection: 'column', alignItems: 'center', gap: '1rem', textDecoration: 'none' }}>
            <div style={{ width: '64px', height: '64px', borderRadius: '20px', background: 'linear-gradient(135deg, #8b5cf6, #6366f1)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 8px 32px rgba(139,92,246,0.4)', fontSize: '28px' }}>✈️</div>
            <div>
              <h1 style={{ fontSize: '1.875rem', fontWeight: 800, color: 'white', margin: 0 }}>Tạo tài khoản mới</h1>
              <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.9rem', margin: '0.25rem 0 0' }}>Tham gia cộng đồng UniTravel ngay hôm nay</p>
            </div>
          </Link>
        </div>

        {/* Card */}
        <div style={{ background: 'rgba(255,255,255,0.05)', backdropFilter: 'blur(20px)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '24px', padding: '2rem', boxShadow: '0 25px 50px rgba(0,0,0,0.5)' }}>
          <div style={{ marginBottom: '1.5rem' }}>
            <GoogleButton onClick={() => authApi.loginWithGoogle()} label='Đăng ký với Google' />
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
            <div style={{ flex: 1, height: '1px', background: 'rgba(255,255,255,0.1)' }} />
            <span style={{ color: 'rgba(255,255,255,0.35)', fontSize: '0.8rem' }}>hoặc đăng ký bằng email</span>
            <div style={{ flex: 1, height: '1px', background: 'rgba(255,255,255,0.1)' }} />
          </div>



          <form onSubmit={handleSubmit(onSubmit)} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>

            {/* Role Selector */}
            <div>
              <label style={{ display: 'block', color: 'rgba(255,255,255,0.7)', fontSize: '0.8rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.75rem' }}>Bạn tham gia với vai trò</label>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                <div
                  id='role-tourist-btn'
                  onClick={() => setValue('role', 'tourist')}
                  style={{
                    background: selectedRole === 'tourist' ? 'rgba(99,102,241,0.2)' : 'rgba(255,255,255,0.04)',
                    border: `2px solid ${selectedRole === 'tourist' ? '#6366f1' : 'rgba(255,255,255,0.1)'}`,
                    borderRadius: '16px', padding: '1.25rem 0.75rem', cursor: 'pointer',
                    textAlign: 'center', transition: 'all 0.25s',
                    boxShadow: selectedRole === 'tourist' ? '0 0 20px rgba(99,102,241,0.3)' : 'none'
                  }}
                >
                  <Plane size={24} style={{ color: selectedRole === 'tourist' ? '#818cf8' : 'rgba(255,255,255,0.3)', marginBottom: '0.5rem' }} />
                  <div style={{ fontWeight: 700, fontSize: '0.875rem', color: selectedRole === 'tourist' ? 'white' : 'rgba(255,255,255,0.4)' }}>Khách du lịch</div>
                  <div style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.3)', marginTop: '0.25rem', lineHeight: 1.3 }}>Tìm & thuê hướng dẫn viên</div>
                </div>
                <div
                  id='role-buddy-btn'
                  onClick={() => setValue('role', 'buddy')}
                  style={{
                    background: selectedRole === 'buddy' ? 'rgba(139,92,246,0.2)' : 'rgba(255,255,255,0.04)',
                    border: `2px solid ${selectedRole === 'buddy' ? '#8b5cf6' : 'rgba(255,255,255,0.1)'}`,
                    borderRadius: '16px', padding: '1.25rem 0.75rem', cursor: 'pointer',
                    textAlign: 'center', transition: 'all 0.25s',
                    boxShadow: selectedRole === 'buddy' ? '0 0 20px rgba(139,92,246,0.3)' : 'none'
                  }}
                >
                  <Users size={24} style={{ color: selectedRole === 'buddy' ? '#c4b5fd' : 'rgba(255,255,255,0.3)', marginBottom: '0.5rem' }} />
                  <div style={{ fontWeight: 700, fontSize: '0.875rem', color: selectedRole === 'buddy' ? 'white' : 'rgba(255,255,255,0.4)' }}>Local Buddy</div>
                  <div style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.3)', marginTop: '0.25rem', lineHeight: 1.3 }}>Dẫn tour & chia sẻ văn hóa</div>
                </div>
              </div>
            </div>

            {/* Name + DOB grid */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', color: 'rgba(255,255,255,0.7)', fontSize: '0.8rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.5rem' }}>Họ và tên</label>
                <div style={{ position: 'relative' }}>
                  <User size={16} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'rgba(255,255,255,0.3)' }} />
                  <input id='reg-name' type='text' placeholder='Nguyễn Văn A' {...register('name')} style={inputStyle(!!errors.name)} />
                </div>
                {errors.name && <span style={{ color: '#fca5a5', fontSize: '0.75rem', marginTop: '0.3rem', display: 'block' }}>{errors.name.message}</span>}
              </div>
              <div>
                <label style={{ display: 'block', color: 'rgba(255,255,255,0.7)', fontSize: '0.8rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.5rem' }}>Ngày sinh</label>
                <div style={{ position: 'relative' }}>
                  <Calendar size={16} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'rgba(255,255,255,0.3)' }} />
                  <input id='reg-dob' type='date' {...register('date_of_birth')} style={inputStyle(!!errors.date_of_birth)} />
                </div>
                {errors.date_of_birth && <span style={{ color: '#fca5a5', fontSize: '0.75rem', marginTop: '0.3rem', display: 'block' }}>{errors.date_of_birth.message}</span>}
              </div>
            </div>

            {/* Email */}
            <div>
              <label style={{ display: 'block', color: 'rgba(255,255,255,0.7)', fontSize: '0.8rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.5rem' }}>Email</label>
              <div style={{ position: 'relative' }}>
                <Mail size={16} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'rgba(255,255,255,0.3)' }} />
                <input id='reg-email' type='email' placeholder='your@email.com' {...register('email')} style={inputStyle(!!errors.email)} />
              </div>
              {errors.email && <span style={{ color: '#fca5a5', fontSize: '0.75rem', marginTop: '0.3rem', display: 'block' }}>{errors.email.message}</span>}
            </div>

            {/* Password + Confirm */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', color: 'rgba(255,255,255,0.7)', fontSize: '0.8rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.5rem' }}>Mật khẩu</label>
                <div style={{ position: 'relative' }}>
                  <Lock size={16} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'rgba(255,255,255,0.3)' }} />
                  <input id='reg-password' type={showPass ? 'text' : 'password'} placeholder='Tối thiểu 8 ký tự' {...register('password')} style={{ ...inputStyle(!!errors.password), paddingRight: '3rem' }} />
                  <button type='button' onClick={() => setShowPass(!showPass)} style={{ position: 'absolute', right: '1rem', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(255,255,255,0.3)', padding: 0 }}>
                    {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
                {errors.password && <span style={{ color: '#fca5a5', fontSize: '0.75rem', marginTop: '0.3rem', display: 'block' }}>{errors.password.message}</span>}
              </div>
              <div>
                <label style={{ display: 'block', color: 'rgba(255,255,255,0.7)', fontSize: '0.8rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.5rem' }}>Xác nhận</label>
                <div style={{ position: 'relative' }}>
                  <Lock size={16} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'rgba(255,255,255,0.3)' }} />
                  <input id='reg-confirm' type={showConfirm ? 'text' : 'password'} placeholder='Nhập lại' {...register('confirm_password')} style={{ ...inputStyle(!!errors.confirm_password), paddingRight: '3rem' }} />
                  <button type='button' onClick={() => setShowConfirm(!showConfirm)} style={{ position: 'absolute', right: '1rem', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(255,255,255,0.3)', padding: 0 }}>
                    {showConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
                {errors.confirm_password && <span style={{ color: '#fca5a5', fontSize: '0.75rem', marginTop: '0.3rem', display: 'block' }}>{errors.confirm_password.message}</span>}
              </div>
            </div>

            <button
              id='btn-register-submit'
              type='submit'
              disabled={isSubmitting}
              style={{ width: '100%', background: 'linear-gradient(135deg, #8b5cf6, #6366f1)', border: 'none', borderRadius: '12px', padding: '1rem', color: 'white', fontWeight: 700, fontSize: '0.95rem', cursor: 'pointer', boxShadow: '0 8px 20px rgba(139,92,246,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', opacity: isSubmitting ? 0.7 : 1 }}
            >
              {isSubmitting ? (
                <><div style={{ width: '18px', height: '18px', border: '2px solid rgba(255,255,255,0.3)', borderTopColor: 'white', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} /> Đang tạo tài khoản...</>
              ) : 'Tạo tài khoản'}
            </button>
          </form>

          <p style={{ textAlign: 'center', color: 'rgba(255,255,255,0.4)', fontSize: '0.875rem', marginTop: '1.5rem' }}>
            Đã có tài khoản?{' '}
            <Link to='/login' style={{ color: '#a78bfa', fontWeight: 600, textDecoration: 'none' }}>Đăng nhập</Link>
          </p>
        </div>
      </div>
      <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
    </div>
  )
}
