import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useState } from 'react'
import { User, Mail, MapPin, Globe, FileText, AtSign, AlertCircle, CheckCircle, Camera } from 'lucide-react'
import { useAuthStore } from '../store/authStore'
import Navbar from '../components/layout/Navbar'

const profileSchema = z.object({
  name: z.string().min(2, 'Tên tối thiểu 2 ký tự'),
  bio: z.string().max(200, 'Bio tối đa 200 ký tự').optional(),
  location: z.string().optional(),
  website: z.string().url('URL không hợp lệ').or(z.literal('')).optional(),
  username: z.string().min(3, 'Username tối thiểu 3 ký tự').optional()
})

type ProfileForm = z.infer<typeof profileSchema>

export default function ProfilePage() {
  const { user } = useAuthStore()
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

  const onSubmit = async (_data: ProfileForm) => {
    try {
      setSaveError('')
      // TODO: Khi có API update profile thì call ở đây
      // await userApi.updateProfile(data)
      setSaveSuccess(true)
      setTimeout(() => setSaveSuccess(false), 3000)
    } catch (err: any) {
      setSaveError(err.response?.data?.message || 'Cập nhật thất bại.')
    }
  }

  return (
    <div className='profile-page'>
      <Navbar />

      <div className='container' style={{ maxWidth: 800 }}>
        {/* Cover Photo */}
        <div className='profile-cover animate-fade-in' />

        {/* Profile Header */}
        <div style={{ padding: '0 1.5rem 1.5rem', background: 'var(--color-surface)', borderRadius: '1.5rem', marginTop: '-20px', border: '1px solid var(--color-border)' }}>
          <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem', paddingTop: '1rem' }}>
            {/* Avatar */}
            <div style={{ position: 'relative' }}>
              <div className='profile-avatar'>
                {user?.avatar ? (
                  <img src={user.avatar} alt={displayName} />
                ) : initials}
              </div>
              <button style={{
                position: 'absolute', bottom: 4, right: 4,
                width: 28, height: 28, borderRadius: '50%',
                background: 'var(--gradient-primary)',
                border: 'none', cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center'
              }} title='Đổi ảnh'>
                <Camera size={14} color='#fff' />
              </button>
            </div>

            {/* Name */}
            <div className='profile-info' style={{ flex: 1, minWidth: 200, marginTop: 0 }}>
              <h1 className='profile-name'>{displayName}</h1>
              {user?.username && <p className='profile-username'>@{user.username}</p>}
              {user?.email && (
                <p style={{ color: 'var(--color-text-muted)', fontSize: '0.875rem', marginTop: '0.25rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Mail size={14} /> {user.email}
                </p>
              )}
            </div>

            {/* Verify badge */}
            <div style={{
              background: user?.verify === 1 ? 'rgba(16,185,129,0.1)' : 'rgba(245,158,11,0.1)',
              border: `1px solid ${user?.verify === 1 ? 'rgba(16,185,129,0.3)' : 'rgba(245,158,11,0.3)'}`,
              color: user?.verify === 1 ? '#10b981' : '#f59e0b',
              padding: '0.35rem 1rem',
              borderRadius: '999px',
              fontSize: '0.75rem',
              fontWeight: 600,
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}>
              {user?.verify === 1 ? <><CheckCircle size={14} /> Đã xác thực</> : <><AlertCircle size={14} /> Chưa xác thực</>}
            </div>
          </div>

          {user?.bio && <p className='profile-bio' style={{ marginTop: '1rem' }}>{user.bio}</p>}

          {/* Meta info */}
          <div style={{ display: 'flex', gap: '1.5rem', marginTop: '1rem', flexWrap: 'wrap' }}>
            {user?.location && (
              <span style={{ color: 'var(--color-text-muted)', fontSize: '0.875rem', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <MapPin size={14} />{user.location}
              </span>
            )}
            {user?.website && (
              <a href={user.website} target='_blank' rel='noreferrer' style={{ color: 'var(--color-primary)', fontSize: '0.875rem', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <Globe size={14} />{user.website}
              </a>
            )}
          </div>
        </div>

        {/* Edit Form */}
        <div className='card animate-fade-in-up animate-delay-1' style={{ marginTop: '1.5rem' }}>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '1.5rem' }}>Chỉnh sửa hồ sơ</h2>

          {saveSuccess && (
            <div className='alert alert-success' style={{ marginBottom: '1.5rem' }}>
              <CheckCircle size={16} />Cập nhật hồ sơ thành công!
            </div>
          )}
          {saveError && (
            <div className='alert alert-error' style={{ marginBottom: '1.5rem' }}>
              <AlertCircle size={16} />{saveError}
            </div>
          )}

          <form className='profile-form' onSubmit={handleSubmit(onSubmit)}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              {/* Name */}
              <div className='input-group'>
                <label className='input-label' htmlFor='profile-name'>Họ và tên</label>
                <div className='input-wrapper'>
                  <User size={16} className='input-icon' />
                  <input
                    id='profile-name'
                    type='text'
                    className={`input-field with-icon ${errors.name ? 'error' : ''}`}
                    {...register('name')}
                  />
                </div>
                {errors.name && <span className='input-error'><AlertCircle size={12} />{errors.name.message}</span>}
              </div>

              {/* Username */}
              <div className='input-group'>
                <label className='input-label' htmlFor='profile-username'>Username</label>
                <div className='input-wrapper'>
                  <AtSign size={16} className='input-icon' />
                  <input
                    id='profile-username'
                    type='text'
                    className={`input-field with-icon ${errors.username ? 'error' : ''}`}
                    {...register('username')}
                  />
                </div>
                {errors.username && <span className='input-error'><AlertCircle size={12} />{errors.username.message}</span>}
              </div>
            </div>

            {/* Bio */}
            <div className='input-group'>
              <label className='input-label' htmlFor='profile-bio'>Bio</label>
              <div className='input-wrapper'>
                <FileText size={16} className='input-icon' style={{ top: '0.85rem' }} />
                <textarea
                  id='profile-bio'
                  rows={3}
                  placeholder='Viết vài điều về bản thân...'
                  className={`input-field with-icon ${errors.bio ? 'error' : ''}`}
                  style={{ resize: 'none', paddingTop: '0.75rem' }}
                  {...register('bio')}
                />
              </div>
              {errors.bio && <span className='input-error'><AlertCircle size={12} />{errors.bio.message}</span>}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              {/* Location */}
              <div className='input-group'>
                <label className='input-label' htmlFor='profile-location'>Địa điểm</label>
                <div className='input-wrapper'>
                  <MapPin size={16} className='input-icon' />
                  <input
                    id='profile-location'
                    type='text'
                    placeholder='Hà Nội, Việt Nam'
                    className={`input-field with-icon ${errors.location ? 'error' : ''}`}
                    {...register('location')}
                  />
                </div>
              </div>

              {/* Website */}
              <div className='input-group'>
                <label className='input-label' htmlFor='profile-website'>Website</label>
                <div className='input-wrapper'>
                  <Globe size={16} className='input-icon' />
                  <input
                    id='profile-website'
                    type='url'
                    placeholder='https://yourwebsite.com'
                    className={`input-field with-icon ${errors.website ? 'error' : ''}`}
                    {...register('website')}
                  />
                </div>
                {errors.website && <span className='input-error'><AlertCircle size={12} />{errors.website.message}</span>}
              </div>
            </div>

            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
              <button type='button' className='btn btn-secondary' onClick={() => window.history.back()}>
                Hủy
              </button>
              <button
                id='btn-profile-save'
                type='submit'
                className='btn btn-primary'
                disabled={isSubmitting}
              >
                {isSubmitting ? <span className='loading-spinner' /> : null}
                {isSubmitting ? 'Đang lưu...' : 'Lưu thay đổi'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
