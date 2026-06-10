import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useState, useRef } from 'react'
import { User, Mail, MapPin, Globe, FileText, AlertCircle, CheckCircle, Camera, Edit3 } from 'lucide-react'
import { useAuthStore } from '../store/authStore'
import Navbar from '../components/layout/Navbar'
import toast from 'react-hot-toast'

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
  background: 'var(--color-bg-2)',
  border: `1px solid ${hasError ? '#ef4444' : 'var(--color-border)'}`,
  borderRadius: '16px', padding: '1rem 1rem 1rem 3rem',
  color: 'var(--color-text)', fontSize: '0.95rem', outline: 'none',
  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)', fontFamily: 'inherit'
})

export default function ProfilePage() {
  const { user, updateProfile } = useAuthStore()
  const [isUploading, setIsUploading] = useState(false)
  const [saveSuccess, setSaveSuccess] = useState(false)
  const [saveError, setSaveError] = useState('')
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleAvatarClick = () => {
    fileInputRef.current?.click()
  }

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (file.size > 5 * 1024 * 1024) {
      toast.error('Kích thước ảnh không được vượt quá 5MB')
      return
    }

    try {
      setIsUploading(true)

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
      toast.success('Cập nhật ảnh đại diện thành công!')
    } catch (err: any) {
      toast.error(err.message || 'Tải ảnh thất bại.')
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
      setSaveSuccess(false)
      setSaveError('')
      await updateProfile(data)
      setSaveSuccess(true)
      toast.success('Cập nhật hồ sơ thành công!')
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Cập nhật thất bại.'
      setSaveError(msg)
      toast.error(msg)
    }
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--color-bg)', fontFamily: "'Inter', -apple-system, sans-serif", paddingBottom: '5rem', color: 'var(--color-text)' }}>
      <Navbar />

      <div style={{ maxWidth: '900px', margin: '0 auto', padding: '3rem 1.5rem' }}>

        {/* Cover photo & Info area */}
        <div style={{ borderRadius: '28px', overflow: 'hidden', background: 'var(--color-surface)', border: '1px solid var(--color-border)', boxShadow: '0 20px 40px rgba(0,0,0,0.04)' }} className='profile-card'>
          
          {/* Beautiful Cover */}
          <div style={{ 
            height: '220px', 
            backgroundImage: 'url("https://images.unsplash.com/photo-1506929562872-bb421503ef21?auto=format&fit=crop&q=80&w=1200")',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            position: 'relative' 
          }}>
            <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, transparent 0%, rgba(0,0,0,0.5) 100%)' }} />
          </div>

          {/* Profile header */}
          <div style={{ padding: '0 2.5rem 2.5rem', position: 'relative' }}>
            <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1.5rem', marginTop: '-60px' }}>
              
              {/* Avatar */}
              <div style={{ position: 'relative', flexShrink: 0, zIndex: 10 }}>
                <div style={{
                  width: '120px', height: '120px', borderRadius: '50%',
                  background: 'linear-gradient(135deg, #0ea5e9, #3b82f6)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '2.5rem', fontWeight: 800, color: 'white',
                  border: '6px solid var(--color-surface)',
                  boxShadow: '0 10px 25px rgba(0,0,0,0.1)',
                  overflow: 'hidden',
                  position: 'relative'
                }}>
                  {user?.avatar ? <img src={user.avatar} alt={displayName} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : initials}
                  {isUploading && (
                    <div style={{
                      position: 'absolute', inset: 0,
                      background: 'rgba(0,0,0,0.5)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>
                      <div style={{
                        width: '30px', height: '30px',
                        border: '3px solid rgba(255,255,255,0.3)',
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
                    position: 'absolute', bottom: '4px', right: '4px',
                    width: '36px', height: '36px', borderRadius: '50%',
                    background: 'var(--color-primary)',
                    border: '3px solid var(--color-surface)',
                    cursor: isUploading ? 'not-allowed' : 'pointer',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    opacity: isUploading ? 0.7 : 1,
                    boxShadow: '0 4px 12px rgba(14, 165, 233, 0.4)',
                    transition: 'all 0.2s',
                    color: 'white'
                  }}
                  onMouseEnter={e => { if (!isUploading) e.currentTarget.style.transform = 'scale(1.1)' }}
                  onMouseLeave={e => { if (!isUploading) e.currentTarget.style.transform = 'scale(1)' }}
                >
                  <Camera size={16} />
                </button>
              </div>

              {/* Verify badge */}
              <div style={{
                background: user?.verify === 1 ? 'rgba(16,185,129,0.1)' : 'rgba(245,158,11,0.1)',
                border: `1px solid ${user?.verify === 1 ? 'rgba(16,185,129,0.2)' : 'rgba(245,158,11,0.2)'}`,
                color: user?.verify === 1 ? '#10b981' : '#f59e0b',
                padding: '0.5rem 1.25rem', borderRadius: '999px',
                fontSize: '0.85rem', fontWeight: 700,
                display: 'flex', alignItems: 'center', gap: '8px',
                marginBottom: '1rem'
              }}>
                {user?.verify === 1 ? <><CheckCircle size={16} /> Đã xác thực ID</> : <><AlertCircle size={16} /> Chưa xác thực</>}
              </div>
            </div>

            {/* Info */}
            <div style={{ marginTop: '1.5rem' }}>
              <h1 style={{ fontSize: '1.8rem', fontWeight: 800, margin: '0 0 0.25rem', letterSpacing: '-0.02em', color: 'var(--color-text)' }}>{displayName}</h1>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap', marginBottom: '1rem' }}>
                {user?.username && <p style={{ color: 'var(--color-primary)', fontSize: '1rem', margin: 0, fontWeight: 700 }}>@{user.username}</p>}
                {user?.email && <p style={{ color: 'var(--color-text-muted)', fontSize: '0.9rem', margin: 0, display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 500 }}><Mail size={14} />{user.email}</p>}
              </div>

              {user?.bio && <p style={{ color: 'var(--color-text)', fontSize: '1rem', marginTop: '1.25rem', lineHeight: 1.6, padding: '1.25rem', background: 'var(--color-bg-2)', borderRadius: '16px', border: '1px solid var(--color-border)' }}>{user.bio}</p>}

              <div style={{ display: 'flex', gap: '1.5rem', marginTop: '1.5rem', flexWrap: 'wrap' }}>
                {user?.location && <span style={{ color: 'var(--color-text-muted)', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 600 }}><MapPin size={16} style={{ color: 'var(--color-primary)' }} />{user.location}</span>}
                {user?.website && <a href={user.website} target='_blank' rel='noreferrer' style={{ color: 'var(--color-text-muted)', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '6px', textDecoration: 'none', fontWeight: 600, transition: 'color 0.2s' }} onMouseEnter={e => e.currentTarget.style.color = 'var(--color-primary)'} onMouseLeave={e => e.currentTarget.style.color = 'var(--color-text-muted)'}><Globe size={16} style={{ color: 'var(--color-primary)' }} />{user.website}</a>}
              </div>
            </div>
          </div>
        </div>

        {/* Edit form */}
        <div style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: '28px', padding: '2.5rem', marginTop: '2rem', boxShadow: '0 20px 40px rgba(0,0,0,0.04)' }} className='profile-card'>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--color-text)', marginBottom: '2rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Edit3 size={20} style={{ color: 'var(--color-primary)' }} /> Chỉnh sửa hồ sơ
          </h2>

          {saveSuccess && (
            <div style={{ background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.2)', borderRadius: '16px', padding: '1rem 1.25rem', display: 'flex', alignItems: 'center', gap: '0.75rem', color: '#10b981', fontSize: '0.95rem', marginBottom: '2rem', fontWeight: 600 }}>
              <CheckCircle size={18} />Cập nhật hồ sơ thành công!
            </div>
          )}
          {saveError && (
            <div style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: '16px', padding: '1rem 1.25rem', display: 'flex', alignItems: 'center', gap: '0.75rem', color: '#ef4444', fontSize: '0.95rem', marginBottom: '2rem', fontWeight: 600 }}>
              <AlertCircle size={18} />{saveError}
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '1.5rem' }}>
              {/* Name */}
              <div>
                <label style={{ display: 'block', color: 'var(--color-text-muted)', fontSize: '0.8rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.75rem' }}>Họ và tên</label>
                <div style={{ position: 'relative' }}>
                  <User size={18} style={{ position: 'absolute', left: '1.25rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-faint)' }} />
                  <input id='profile-name' type='text' {...register('name')} style={fieldStyle(!!errors.name)} className='profile-input' />
                </div>
                {errors.name && <span style={{ color: '#ef4444', fontSize: '0.8rem', marginTop: '0.5rem', display: 'block', fontWeight: 500 }}>{errors.name.message}</span>}
              </div>
            </div>

            {/* Bio */}
            <div>
              <label style={{ display: 'block', color: 'var(--color-text-muted)', fontSize: '0.8rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.75rem' }}>Tiểu sử (Bio)</label>
              <div style={{ position: 'relative' }}>
                <FileText size={18} style={{ position: 'absolute', left: '1.25rem', top: '1.25rem', color: 'var(--color-text-faint)' }} />
                <textarea
                  id='profile-bio'
                  rows={4}
                  placeholder='Viết vài điều thú vị về bản thân...'
                  {...register('bio')}
                  style={{ ...fieldStyle(!!errors.bio), paddingTop: '1.25rem', resize: 'none' }}
                  className='profile-input'
                />
              </div>
              {errors.bio && <span style={{ color: '#ef4444', fontSize: '0.8rem', marginTop: '0.5rem', display: 'block', fontWeight: 500 }}>{errors.bio.message}</span>}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem' }}>
              {/* Location */}
              <div>
                <label style={{ display: 'block', color: 'var(--color-text-muted)', fontSize: '0.8rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.75rem' }}>Địa điểm</label>
                <div style={{ position: 'relative' }}>
                  <MapPin size={18} style={{ position: 'absolute', left: '1.25rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-faint)' }} />
                  <input id='profile-location' type='text' placeholder='Hà Nội, Việt Nam' {...register('location')} style={fieldStyle(false)} className='profile-input' />
                </div>
              </div>

              {/* Website */}
              <div>
                <label style={{ display: 'block', color: 'var(--color-text-muted)', fontSize: '0.8rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.75rem' }}>Website / Mạng xã hội</label>
                <div style={{ position: 'relative' }}>
                  <Globe size={18} style={{ position: 'absolute', left: '1.25rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-faint)' }} />
                  <input id='profile-website' type='url' placeholder='https://yourwebsite.com' {...register('website')} style={fieldStyle(!!errors.website)} className='profile-input' />
                </div>
                {errors.website && <span style={{ color: '#ef4444', fontSize: '0.8rem', marginTop: '0.5rem', display: 'block', fontWeight: 500 }}>{errors.website.message}</span>}
              </div>
            </div>

            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end', paddingTop: '1.5rem', borderTop: '1px solid var(--color-border)', marginTop: '1rem' }}>
              <button type='button' onClick={() => window.history.back()} style={{ background: 'var(--color-bg-2)', border: '1px solid var(--color-border)', borderRadius: '12px', padding: '0.875rem 1.75rem', color: 'var(--color-text)', fontWeight: 700, cursor: 'pointer', fontSize: '1rem' }} className='profile-cancel-btn'>
                Hủy bỏ
              </button>
              <button
                id='btn-profile-save'
                type='submit'
                disabled={isSubmitting}
                style={{ background: 'var(--color-primary)', border: 'none', borderRadius: '12px', padding: '0.875rem 2rem', color: 'white', fontWeight: 800, cursor: 'pointer', fontSize: '1rem', display: 'flex', alignItems: 'center', gap: '0.75rem', boxShadow: '0 8px 25px rgba(14,165,233,0.3)', opacity: isSubmitting ? 0.7 : 1 }}
                className='profile-save-btn'
              >
                {isSubmitting ? (
                  <><div style={{ width: '18px', height: '18px', border: '2px solid rgba(255,255,255,0.3)', borderTopColor: 'white', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} /> Đang xử lý...</>
                ) : 'Cập nhật hồ sơ'}
              </button>
            </div>
          </form>
        </div>
      </div>
      <style>{`
        @keyframes spin { to { transform: rotate(360deg) } }
        .profile-input {
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1) !important;
        }
        .profile-input:focus {
          background: var(--color-surface) !important;
          border-color: var(--color-primary) !important;
          box-shadow: 0 0 0 4px rgba(14, 165, 233, 0.15) !important;
        }
        .profile-card {
          transition: transform 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275), box-shadow 0.4s ease !important;
        }
        .profile-card:hover {
          transform: translateY(-4px) !important;
          box-shadow: 0 25px 50px rgba(0, 0, 0, 0.08) !important;
        }
        .profile-save-btn {
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1) !important;
        }
        .profile-save-btn:hover:not(:disabled) {
          transform: translateY(-2px) !important;
          box-shadow: 0 12px 30px rgba(14, 165, 233, 0.4) !important;
          filter: brightness(1.1);
        }
        .profile-save-btn:active:not(:disabled) {
          transform: translateY(0) !important;
        }
        .profile-cancel-btn {
          transition: all 0.2s ease-in-out !important;
        }
        .profile-cancel-btn:hover {
          background: var(--color-border) !important;
        }
      `}</style>
    </div>
  )
}
