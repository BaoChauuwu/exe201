import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { AlertCircle, CheckCircle, Sparkles } from 'lucide-react'
import Navbar from '../components/layout/Navbar'
import { ExperienceForm } from './_components/ExperienceForm'
import { experienceApi } from '../api/experience.api'
import type { ExperienceFormValues } from '../api/experience.api'

export const CreateExperiencePage = () => {
  const navigate = useNavigate()
  const [isLoading, setIsLoading] = useState(false)
  const [successMsg, setSuccessMsg] = useState('')
  const [errorMsg, setErrorMsg] = useState('')

  const handleSubmit = async (data: ExperienceFormValues) => {
    setIsLoading(true)
    setErrorMsg('')
    setSuccessMsg('')
    try {
      // 1. Upload ảnh lên Cloudinary từ Frontend nếu có File
      const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME
      const uploadPreset = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET
      
      const uploadedImageUrls: string[] = []
      
      for (const img of data.images) {
        if (img instanceof File) {
          if (!cloudName || !uploadPreset) {
            throw new Error('Chưa cấu hình Cloudinary credentials (VITE_CLOUDINARY_CLOUD_NAME) trong file .env frontend')
          }
          const formData = new FormData()
          formData.append('file', img)
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
          uploadedImageUrls.push(result.secure_url)
        } else if (typeof img === 'string') {
          uploadedImageUrls.push(img)
        }
      }
      
      // 2. Gán lại danh sách URL vừa upload vào data
      data.images = uploadedImageUrls

      await experienceApi.create(data)
      setSuccessMsg('Tour đã được tạo thành công! Đang chờ admin duyệt.')
      setTimeout(() => navigate('/experiences/my'), 2000)
    } catch (err: unknown) {
      const e = err as { response?: { data?: { message?: string } }; message?: string }
      setErrorMsg(e.response?.data?.message ?? e.message ?? 'Tạo tour thất bại. Vui lòng thử lại.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: 'var(--gradient-hero)',
      fontFamily: "'Inter', sans-serif"
    }}>
      <Navbar />

      <div style={{ maxWidth: '800px', margin: '0 auto', padding: '3rem 1.5rem', color: 'var(--color-text)' }}>

        {/* ── Hero header ── */}
        <div style={{
          position: 'relative', borderRadius: '24px', overflow: 'hidden', marginBottom: '2rem',
          background: 'linear-gradient(135deg, #1e1b4b 0%, #312e81 50%, #4c1d95 100%)',
          padding: '2.25rem 2rem',
        }}>
          {/* Decorative circles */}
          <div style={{ position: 'absolute', top: '-3rem', right: '-3rem', width: '12rem', height: '12rem', background: 'rgba(255,255,255,0.04)', borderRadius: '50%' }} />
          <div style={{ position: 'absolute', bottom: '-3rem', left: '-2rem', width: '9rem', height: '9rem', background: 'rgba(167,139,250,0.08)', borderRadius: '50%' }} />

          <div style={{ position: 'relative', zIndex: 1, display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
            <div style={{
              width: '64px', height: '64px', borderRadius: '18px',
              background: 'rgba(255,255,255,0.1)', backdropFilter: 'blur(10px)',
              border: '1px solid rgba(255,255,255,0.2)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2rem', flexShrink: 0,
            }}>🗺️</div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                <Sparkles size={14} style={{ color: '#fbbf24' }} />
                <span style={{ color: '#fbbf24', fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                  Tạo tour mới
                </span>
              </div>
              <h1 style={{ margin: '0 0 0.35rem', fontSize: '1.6rem', fontWeight: 800, color: 'white', letterSpacing: '-0.02em' }}>
                Đăng ký trải nghiệm
              </h1>
              <p style={{ margin: 0, color: 'rgba(255,255,255,0.5)', fontSize: '0.875rem' }}>
                Chia sẻ những điều đặc biệt của Đà Nẵng với du khách
              </p>
            </div>
          </div>
        </div>

        {/* ── Alert messages ── */}
        {successMsg && (
          <div style={{
            background: 'rgba(16,185,129,0.12)', border: '1px solid rgba(16,185,129,0.3)',
            borderRadius: '12px', padding: '0.875rem 1rem',
            display: 'flex', alignItems: 'center', gap: '0.75rem',
            color: '#6ee7b7', fontSize: '0.875rem', marginBottom: '1.25rem',
          }}>
            <CheckCircle size={18} style={{ flexShrink: 0 }} />
            {successMsg}
          </div>
        )}

        {errorMsg && (
          <div style={{
            background: 'rgba(239,68,68,0.12)', border: '1px solid rgba(239,68,68,0.3)',
            borderRadius: '12px', padding: '0.875rem 1rem',
            display: 'flex', alignItems: 'center', gap: '0.75rem',
            color: '#fca5a5', fontSize: '0.875rem', marginBottom: '1.25rem',
          }}>
            <AlertCircle size={18} style={{ flexShrink: 0 }} />
            {errorMsg}
          </div>
        )}

        {/* ── Form ── */}
        <ExperienceForm
          onSubmit={handleSubmit}
          isLoading={isLoading}
          submitLabel='Đăng tour'
        />

        <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
      </div>
    </div>
  )
}
