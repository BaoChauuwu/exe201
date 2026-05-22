import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useState } from 'react'
import { User, Mail, MapPin, Globe, FileText, AtSign, AlertCircle, CheckCircle, Camera } from 'lucide-react'
import { useAuthStore } from '../store/authStore'
import Navbar from '../components/layout/Navbar'
import { Link } from 'react-router-dom'

const profileSchema = z.object({
  name: z.string().min(2, 'Tên tối thiểu 2 ký tự'),
  bio: z.string().max(200, 'Bio tối đa 200 ký tự').optional(),
  location: z.string().optional(),
  website: z.string().url('URL không hợp lệ').or(z.literal('')).optional(),
  username: z.string().min(3, 'Username tối thiểu 3 ký tự').optional()
})

type ProfileForm = z.infer<typeof profileSchema>

const fieldStyle = (hasError: boolean): React.CSSProperties => ({
  width: '100%', boxSizing: 'border-box' as any,
  background: 'rgba(255,255,255,0.05)',
  border: `1px solid ${hasError ? 'rgba(239,68,68,0.5)' : 'rgba(255,255,255,0.1)'}`,
  borderRadius: '12px', padding: '0.875rem 1rem 0.875rem 2.75rem',
  color: 'white', fontSize: '0.9rem', outline: 'none',
  transition: 'border-color 0.2s', fontFamily: 'inherit'
})

export default function ProfilePage() {
  const { user, updateProfile } = useAuthStore()
  const [saveSuccess, setSaveSuccess] = useState(false)
  const [saveError, setSaveError] = useState('')

  const displayName = user?.name || 'Traveler'
  const initials = displayName.split(' ').map((n: string) => n[0]).slice(0, 2).join('').toUpperCase()

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<ProfileForm>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: user?.name || '',
      bio: user?.bio || '',
      location: user?.location || '',
      website: user?.website || '',
      username: user?.username || ''
    }
  })

  const onSubmit = async (data: ProfileForm) => {
    try {
      setSaveError('')
      await updateProfile(data)
      setSaveSuccess(true)
      setTimeout(() => setSaveSuccess(false), 3000)
    } catch (err: any) {
      setSaveError(err.response?.data?.message || 'Cập nhật thất bại.')
    }
  }

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(180deg, #0f0c29 0%, #1a1040 60%, #0d1117 100%)', fontFamily: "'Inter', -apple-system, sans-serif" }}>
      <Navbar />

      <div style={{ maxWidth: '900px', margin: '0 auto', padding: '2.5rem 2rem' }}>

        {/* Cover photo area */}
        <div style={{ borderRadius: '24px', overflow: 'hidden', border: '1px solid rgba(255,255,255,0.06)', marginBottom: '0' }}>
          <div style={{ height: '180px', background: 'linear-gradient(135deg, rgba(99,102,241,0.4) 0%, rgba(139,92,246,0.3) 50%, rgba(59,130,246,0.2) 100%)', position: 'relative' }}>
            <div style={{ position: 'absolute', inset: 0, backgroundImage: 'radial-gradient(circle at 80% 50%, rgba(139,92,246,0.3) 0%, transparent 50%), radial-gradient(circle at 20% 80%, rgba(59,130,246,0.2) 0%, transparent 40%)' }} />
          </div>

          {/* Profile header */}
          <div style={{ background: 'rgba(255,255,255,0.04)', backdropFilter: 'blur(10px)', padding: '0 2rem 2rem', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
            <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem', marginTop: '-40px' }}>
              {/* Avatar */}
              <div style={{ position: 'relative', flexShrink: 0 }}>
                <div style={{
                  width: '88px', height: '88px', borderRadius: '50%',
                  background: 'linear-gradient(135deg, #8b5cf6, #6366f1)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '1.75rem', fontWeight: 700, color: 'white',
                  border: '3px solid rgba(255,255,255,0.1)',
                  boxShadow: '0 8px 32px rgba(139,92,246,0.4)',
                  overflow: 'hidden'
                }}>
                  {user?.avatar ? <img src={user.avatar} alt={displayName} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : initials}
                </div>
                <button style={{
                  position: 'absolute', bottom: 0, right: 0,
                  width: '28px', height: '28px', borderRadius: '50%',
                  background: 'linear-gradient(135deg, #8b5cf6, #6366f1)',
                  border: '2px solid rgba(255,255,255,0.2)',
                  cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center'
                }}>
                  <Camera size={12} color='#fff' />
                </button>
              </div>

              {/* Info */}
              <div style={{ flex: 1, minWidth: 200 }}>
                <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'white', margin: '0 0 0.25rem' }}>{displayName}</h1>
                {user?.username && <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.875rem', margin: '0 0 0.25rem' }}>@{user.username}</p>}
                {user?.email && <p style={{ color: 'rgba(255,255,255,0.35)', fontSize: '0.8rem', margin: 0, display: 'flex', alignItems: 'center', gap: '5px' }}><Mail size={13} />{user.email}</p>}
              </div>

              {/* Verify badge */}
              <div style={{
                background: user?.verify === 1 ? 'rgba(16,185,129,0.15)' : 'rgba(245,158,11,0.15)',
                border: `1px solid ${user?.verify === 1 ? 'rgba(16,185,129,0.35)' : 'rgba(245,158,11,0.35)'}`,
                color: user?.verify === 1 ? '#34d399' : '#fbbf24',
                padding: '0.35rem 1rem', borderRadius: '999px',
                fontSize: '0.75rem', fontWeight: 700,
                display: 'flex', alignItems: 'center', gap: '6px'
              }}>
                {user?.verify === 1 ? <><CheckCircle size={14} /> Đã xác thực</> : <><AlertCircle size={14} /> Chưa xác thực</>}
              </div>
            </div>

            {user?.bio && <p style={{ color: 'rgba(255,255,255,0.45)', fontSize: '0.875rem', marginTop: '1rem', lineHeight: 1.6 }}>{user.bio}</p>}

            <div style={{ display: 'flex', gap: '1.25rem', marginTop: '1rem', flexWrap: 'wrap' }}>
              {user?.location && <span style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '4px' }}><MapPin size={13} />{user.location}</span>}
              {user?.website && <a href={user.website} target='_blank' rel='noreferrer' style={{ color: '#818cf8', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '4px', textDecoration: 'none' }}><Globe size={13} />{user.website}</a>}
            </div>
          </div>
        </div>

        {/* Edit form */}
        <div style={{ background: 'rgba(255,255,255,0.04)', backdropFilter: 'blur(10px)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '24px', padding: '2rem', marginTop: '1.5rem' }}>
          <h2 style={{ fontSize: '1.125rem', fontWeight: 700, color: 'rgba(255,255,255,0.8)', marginBottom: '1.5rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Chỉnh sửa hồ sơ</h2>

          {saveSuccess && (
            <div style={{ background: 'rgba(16,185,129,0.15)', border: '1px solid rgba(16,185,129,0.3)', borderRadius: '12px', padding: '0.875rem 1rem', display: 'flex', alignItems: 'center', gap: '0.75rem', color: '#6ee7b7', fontSize: '0.875rem', marginBottom: '1.5rem' }}>
              <CheckCircle size={16} />Cập nhật hồ sơ thành công!
            </div>
          )}
          {saveError && (
            <div style={{ background: 'rgba(239,68,68,0.15)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: '12px', padding: '0.875rem 1rem', display: 'flex', alignItems: 'center', gap: '0.75rem', color: '#fca5a5', fontSize: '0.875rem', marginBottom: '1.5rem' }}>
              <AlertCircle size={16} />{saveError}
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '1rem' }}>
              {/* Name */}
              <div>
                <label style={{ display: 'block', color: 'rgba(255,255,255,0.6)', fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.5rem' }}>Họ và tên</label>
                <div style={{ position: 'relative' }}>
                  <User size={16} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'rgba(255,255,255,0.3)' }} />
                  <input id='profile-name' type='text' {...register('name')} style={fieldStyle(!!errors.name)} />
                </div>
                {errors.name && <span style={{ color: '#fca5a5', fontSize: '0.75rem', marginTop: '0.3rem', display: 'block' }}>{errors.name.message}</span>}
              </div>
            </div>

            {/* Bio */}
            <div>
              <label style={{ display: 'block', color: 'rgba(255,255,255,0.6)', fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.5rem' }}>Bio</label>
              <div style={{ position: 'relative' }}>
                <FileText size={16} style={{ position: 'absolute', left: '1rem', top: '0.9rem', color: 'rgba(255,255,255,0.3)' }} />
                <textarea
                  id='profile-bio'
                  rows={3}
                  placeholder='Viết vài điều về bản thân...'
                  {...register('bio')}
                  style={{ ...fieldStyle(!!errors.bio), paddingTop: '0.875rem', resize: 'none' }}
                />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              {/* Location */}
              <div>
                <label style={{ display: 'block', color: 'rgba(255,255,255,0.6)', fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.5rem' }}>Địa điểm</label>
                <div style={{ position: 'relative' }}>
                  <MapPin size={16} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'rgba(255,255,255,0.3)' }} />
                  <input id='profile-location' type='text' placeholder='Hà Nội, Việt Nam' {...register('location')} style={fieldStyle(false)} />
                </div>
              </div>

              {/* Website */}
              <div>
                <label style={{ display: 'block', color: 'rgba(255,255,255,0.6)', fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.5rem' }}>Website</label>
                <div style={{ position: 'relative' }}>
                  <Globe size={16} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'rgba(255,255,255,0.3)' }} />
                  <input id='profile-website' type='url' placeholder='https://yourwebsite.com' {...register('website')} style={fieldStyle(!!errors.website)} />
                </div>
                {errors.website && <span style={{ color: '#fca5a5', fontSize: '0.75rem', marginTop: '0.3rem', display: 'block' }}>{errors.website.message}</span>}
              </div>
            </div>

            <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end', paddingTop: '0.5rem' }}>
              <button type='button' onClick={() => window.history.back()} style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: '10px', padding: '0.75rem 1.5rem', color: 'rgba(255,255,255,0.6)', fontWeight: 600, cursor: 'pointer', fontSize: '0.875rem' }}>
                Hủy
              </button>
              <button
                id='btn-profile-save'
                type='submit'
                disabled={isSubmitting}
                style={{ background: 'linear-gradient(135deg, #8b5cf6, #6366f1)', border: 'none', borderRadius: '10px', padding: '0.75rem 1.75rem', color: 'white', fontWeight: 700, cursor: 'pointer', fontSize: '0.875rem', display: 'flex', alignItems: 'center', gap: '0.5rem', boxShadow: '0 4px 15px rgba(139,92,246,0.35)', opacity: isSubmitting ? 0.7 : 1 }}
              >
                {isSubmitting ? (
                  <><div style={{ width: '16px', height: '16px', border: '2px solid rgba(255,255,255,0.3)', borderTopColor: 'white', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} /> Đang lưu...</>
                ) : 'Lưu thay đổi'}
              </button>
            </div>
          </form>
        </div>
      </div>
      <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
    </div>
  )
}
