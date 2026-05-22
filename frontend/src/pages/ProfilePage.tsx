import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useState, useRef } from 'react'
import { User, Mail, MapPin, Globe, FileText, AlertCircle, CheckCircle, Camera } from 'lucide-react'
import { useAuthStore } from '../store/authStore'
import Navbar from '../components/layout/Navbar'

const profileSchema = z.object({
  name: z.string().min(2, 'Tên tối thiểu 2 ký tự'),
  bio: z.string().max(200, 'Bio tối đa 200 ký tự').optional(),
  location: z.string().optional(),
  website: z.string().url('URL không hợp lệ').or(z.literal('')).optional(),
  username: z.string().min(3, 'Username tối thiểu 3 ký tự').or(z.literal('')).optional()
})

type ProfileForm = z.infer<typeof profileSchema>

const fieldStyle = (hasError: boolean): React.CSSProperties => ({
  width: '100%', boxSizing: 'border-box' as any,
  background: '#f8fafc',
  border: `1px solid ${hasError ? '#ef4444' : 'rgba(14, 165, 233, 0.18)'}`,
  borderRadius: '12px', padding: '0.875rem 1rem 0.875rem 2.75rem',
  color: '#0f172a', fontSize: '0.9rem', outline: 'none',
  transition: 'all 0.22s cubic-bezier(0.4, 0, 0.2, 1)', fontFamily: 'inherit'
})

export default function ProfilePage() {
  const { user, updateProfile } = useAuthStore()
  const [saveSuccess, setSaveSuccess] = useState(false)
  const [saveError, setSaveError] = useState('')
  const [isUploading, setIsUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleAvatarClick = () => {
    fileInputRef.current?.click()
  }

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (file.size > 5 * 1024 * 1024) {
      setSaveError('Kích thước ảnh không được vượt quá 5MB')
      return
    }

    try {
      setIsUploading(true)
      setSaveError('')

      const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME
      const uploadPreset = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET

      if (!cloudName || !uploadPreset) {
        throw new Error('Chưa cấu hình Cloudinary credentials trong file .env')
      }

      const formData = new FormData()
      formData.append('file', file)
      formData.append('upload_preset', uploadPreset)

      const response = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
        method: 'POST',
        body: formData
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error?.message || 'Không thể tải ảnh lên Cloudinary')
      }

      const result = await response.json()
      const secureUrl = result.secure_url

      await updateProfile({ avatar: secureUrl })
      setSaveSuccess(true)
      setTimeout(() => setSaveSuccess(false), 3000)
    } catch (err: any) {
      setSaveError(err.message || 'Tải ảnh thất bại.')
    } finally {
      setIsUploading(false)
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    }
  }

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
    <div style={{ minHeight: '100vh', background: 'linear-gradient(180deg, #f0f9ff 0%, #f8fafc 40%, #ffffff 100%)', fontFamily: "'Inter', -apple-system, sans-serif" }}>
      <Navbar />

      <div style={{ maxWidth: '900px', margin: '0 auto', padding: '2.5rem 2rem' }}>

        {/* Cover photo area */}
        <div style={{ borderRadius: '24px', overflow: 'hidden', border: '1px solid rgba(14, 165, 233, 0.12)', boxShadow: '0 10px 30px rgba(14, 165, 233, 0.04)', marginBottom: '0' }} className='profile-card'>
          <div style={{ height: '180px', background: 'linear-gradient(135deg, rgba(2, 132, 199, 0.4) 0%, rgba(14, 165, 233, 0.3) 50%, rgba(56, 189, 248, 0.2) 100%)', position: 'relative' }}>
            <div style={{ position: 'absolute', inset: 0, backgroundImage: 'radial-gradient(circle at 80% 50%, rgba(14, 165, 233, 0.3) 0%, transparent 50%), radial-gradient(circle at 20% 80%, rgba(56, 189, 248, 0.2) 0%, transparent 40%)' }} />
          </div>

          {/* Profile header */}
          <div style={{ background: '#ffffff', padding: '0 2rem 2rem', borderTop: '1px solid rgba(14, 165, 233, 0.08)' }}>
            <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem', marginTop: '-40px' }}>
              {/* Avatar */}
              <div style={{ position: 'relative', flexShrink: 0 }}>
                <div style={{
                  width: '88px', height: '88px', borderRadius: '50%',
                  background: 'linear-gradient(135deg, #0284c7, #0ea5e9)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '1.75rem', fontWeight: 700, color: 'white',
                  border: '3px solid #ffffff',
                  boxShadow: '0 8px 32px rgba(14, 165, 233, 0.18)',
                  overflow: 'hidden',
                  position: 'relative'
                }}>
                  {user?.avatar ? <img src={user.avatar} alt={displayName} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : initials}
                  {isUploading && (
                    <div style={{
                      position: 'absolute', inset: 0,
                      background: 'rgba(0,0,0,0.6)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>
                      <div style={{
                        width: '24px', height: '24px',
                        border: '2px solid rgba(255,255,255,0.3)',
                        borderTopColor: 'white',
                        borderRadius: '50%',
                        animation: 'spin 0.8s linear infinite'
                      }} />
                    </div>
                  )}
                </div>
                <input
                  type='file'
                  ref={fileInputRef}
                  style={{ display: 'none' }}
                  accept='image/*'
                  onChange={handleFileChange}
                />
                <button
                  type='button'
                  onClick={handleAvatarClick}
                  disabled={isUploading}
                  style={{
                    position: 'absolute', bottom: 0, right: 0,
                    width: '28px', height: '28px', borderRadius: '50%',
                    background: 'linear-gradient(135deg, #0284c7, #0ea5e9)',
                    border: '2px solid #ffffff',
                    cursor: isUploading ? 'not-allowed' : 'pointer',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    opacity: isUploading ? 0.7 : 1,
                    boxShadow: '0 4px 12px rgba(14, 165, 233, 0.25)',
                    transition: 'transform 0.2s'
                  }}
                  onMouseEnter={e => { if (!isUploading) e.currentTarget.style.transform = 'scale(1.1)' }}
                  onMouseLeave={e => { if (!isUploading) e.currentTarget.style.transform = 'scale(1)' }}
                >
                  <Camera size={12} color='#fff' />
                </button>
              </div>

              {/* Info */}
              <div style={{ flex: 1, minWidth: 200 }}>
                <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#0f172a', margin: '0 0 0.25rem', letterSpacing: '-0.02em' }}>{displayName}</h1>
                {user?.username && <p style={{ color: '#64748b', fontSize: '0.875rem', margin: '0 0 0.25rem', fontWeight: 500 }}>@{user.username}</p>}
                {user?.email && <p style={{ color: '#64748b', fontSize: '0.8rem', margin: 0, display: 'flex', alignItems: 'center', gap: '5px' }}><Mail size={13} style={{ color: '#94a3b8' }} />{user.email}</p>}
              </div>

              {/* Verify badge */}
              <div style={{
                background: user?.verify === 1 ? 'rgba(16,185,129,0.08)' : 'rgba(217,119,6,0.08)',
                border: `1px solid ${user?.verify === 1 ? 'rgba(16,185,129,0.25)' : 'rgba(217,119,6,0.25)'}`,
                color: user?.verify === 1 ? '#10b981' : '#d97706',
                padding: '0.35rem 1rem', borderRadius: '999px',
                fontSize: '0.75rem', fontWeight: 700,
                display: 'flex', alignItems: 'center', gap: '6px'
              }}>
                {user?.verify === 1 ? <><CheckCircle size={14} /> Đã xác thực</> : <><AlertCircle size={14} /> Chưa xác thực</>}
              </div>
            </div>

            {user?.bio && <p style={{ color: '#334155', fontSize: '0.875rem', marginTop: '1rem', lineHeight: 1.6 }}>{user.bio}</p>}

            <div style={{ display: 'flex', gap: '1.25rem', marginTop: '1rem', flexWrap: 'wrap' }}>
              {user?.location && <span style={{ color: '#64748b', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '4px' }}><MapPin size={13} style={{ color: '#0284c7' }} />{user.location}</span>}
              {user?.website && <a href={user.website} target='_blank' rel='noreferrer' style={{ color: '#0284c7', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '4px', textDecoration: 'none', fontWeight: 500 }}><Globe size={13} style={{ color: '#0284c7' }} />{user.website}</a>}
            </div>
          </div>
        </div>

        {/* Edit form */}
        <div style={{ background: '#ffffff', border: '1px solid rgba(14, 165, 233, 0.12)', borderRadius: '24px', padding: '2rem', marginTop: '1.5rem', boxShadow: '0 10px 30px rgba(14, 165, 233, 0.03)' }} className='profile-card'>
          <h2 style={{ fontSize: '1.125rem', fontWeight: 700, color: '#0f172a', marginBottom: '1.5rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Chỉnh sửa hồ sơ</h2>

          {saveSuccess && (
            <div style={{ background: 'rgba(16,185,129,0.05)', border: '1px solid rgba(16,185,129,0.25)', borderRadius: '12px', padding: '0.875rem 1rem', display: 'flex', alignItems: 'center', gap: '0.75rem', color: '#10b981', fontSize: '0.875rem', marginBottom: '1.5rem' }}>
              <CheckCircle size={16} />Cập nhật hồ sơ thành công!
            </div>
          )}
          {saveError && (
            <div style={{ background: 'rgba(239,68,68,0.05)', border: '1px solid rgba(239,68,68,0.25)', borderRadius: '12px', padding: '0.875rem 1rem', display: 'flex', alignItems: 'center', gap: '0.75rem', color: '#ef4444', fontSize: '0.875rem', marginBottom: '1.5rem' }}>
              <AlertCircle size={16} />{saveError}
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '1rem' }}>
              {/* Name */}
              <div>
                <label style={{ display: 'block', color: '#475569', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.5rem' }}>Họ và tên</label>
                <div style={{ position: 'relative' }}>
                  <User size={16} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                  <input id='profile-name' type='text' {...register('name')} style={fieldStyle(!!errors.name)} className='profile-input' />
                </div>
                {errors.name && <span style={{ color: '#ef4444', fontSize: '0.75rem', marginTop: '0.3rem', display: 'block' }}>{errors.name.message}</span>}
              </div>
            </div>

            {/* Bio */}
            <div>
              <label style={{ display: 'block', color: '#475569', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.5rem' }}>Bio</label>
              <div style={{ position: 'relative' }}>
                <FileText size={16} style={{ position: 'absolute', left: '1rem', top: '0.9rem', color: '#94a3b8' }} />
                <textarea
                  id='profile-bio'
                  rows={3}
                  placeholder='Viết vài điều về bản thân...'
                  {...register('bio')}
                  style={{ ...fieldStyle(!!errors.bio), paddingTop: '0.875rem', resize: 'none' }}
                  className='profile-input'
                />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              {/* Location */}
              <div>
                <label style={{ display: 'block', color: '#475569', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.5rem' }}>Địa điểm</label>
                <div style={{ position: 'relative' }}>
                  <MapPin size={16} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                  <input id='profile-location' type='text' placeholder='Hà Nội, Việt Nam' {...register('location')} style={fieldStyle(false)} className='profile-input' />
                </div>
              </div>

              {/* Website */}
              <div>
                <label style={{ display: 'block', color: '#475569', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.5rem' }}>Website</label>
                <div style={{ position: 'relative' }}>
                  <Globe size={16} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                  <input id='profile-website' type='url' placeholder='https://yourwebsite.com' {...register('website')} style={fieldStyle(!!errors.website)} className='profile-input' />
                </div>
                {errors.website && <span style={{ color: '#ef4444', fontSize: '0.75rem', marginTop: '0.3rem', display: 'block' }}>{errors.website.message}</span>}
              </div>
            </div>

            <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end', paddingTop: '0.5rem' }}>
              <button type='button' onClick={() => window.history.back()} style={{ background: '#f1f5f9', border: '1px solid #cbd5e1', borderRadius: '10px', padding: '0.75rem 1.5rem', color: '#475569', fontWeight: 600, cursor: 'pointer', fontSize: '0.875rem' }} className='profile-cancel-btn'>
                Hủy
              </button>
              <button
                id='btn-profile-save'
                type='submit'
                disabled={isSubmitting}
                style={{ background: 'linear-gradient(135deg, #0284c7, #0ea5e9)', border: 'none', borderRadius: '10px', padding: '0.75rem 1.75rem', color: 'white', fontWeight: 700, cursor: 'pointer', fontSize: '0.875rem', display: 'flex', alignItems: 'center', gap: '0.5rem', boxShadow: '0 8px 24px rgba(14,165,233,0.2)', opacity: isSubmitting ? 0.7 : 1 }}
                className='profile-save-btn'
              >
                {isSubmitting ? (
                  <><div style={{ width: '16px', height: '16px', border: '2px solid rgba(255,255,255,0.3)', borderTopColor: 'white', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} /> Đang lưu...</>
                ) : 'Lưu thay đổi'}
              </button>
            </div>
          </form>
        </div>
      </div>
      <style>{`
        @keyframes spin { to { transform: rotate(360deg) } }
        .profile-input {
          transition: all 0.22s cubic-bezier(0.4, 0, 0.2, 1) !important;
        }
        .profile-input:focus {
          background: #ffffff !important;
          border-color: #0284c7 !important;
          box-shadow: 0 0 0 4px rgba(2, 132, 199, 0.12) !important;
        }
        .profile-card {
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1) !important;
        }
        .profile-card:hover {
          transform: translateY(-3px) !important;
          box-shadow: 0 16px 40px rgba(14, 165, 233, 0.07) !important;
          border-color: rgba(14, 165, 233, 0.22) !important;
        }
        .profile-save-btn {
          transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1) !important;
        }
        .profile-save-btn:hover:not(:disabled) {
          transform: translateY(-2px) !important;
          box-shadow: 0 12px 28px rgba(14, 165, 233, 0.35) !important;
          background: linear-gradient(135deg, #0274af, #0d96d4) !important;
        }
        .profile-save-btn:active:not(:disabled) {
          transform: translateY(0) !important;
        }
        .profile-cancel-btn {
          transition: all 0.2s ease-in-out !important;
        }
        .profile-cancel-btn:hover {
          background: #e2e8f0 !important;
          color: #1e293b !important;
        }
      `}</style>
    </div>
  )
}
