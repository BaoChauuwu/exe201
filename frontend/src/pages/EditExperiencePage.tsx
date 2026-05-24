import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { AlertCircle, CheckCircle, ArrowLeft, Loader2 } from 'lucide-react'
import Navbar from '../components/layout/Navbar'
import { ExperienceForm } from './_components/ExperienceForm'
import { experienceApi } from '../api/experience.api'
import type { ExperienceFormValues, IExperience } from '../api/experience.api'

export const EditExperiencePage = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()

  const [experience, setExperience] = useState<IExperience | null>(null)
  const [fetchLoading, setFetchLoading] = useState(true)
  const [fetchError, setFetchError] = useState('')

  const [isLoading, setIsLoading] = useState(false)
  const [successMsg, setSuccessMsg] = useState('')
  const [errorMsg, setErrorMsg] = useState('')

  // Load experience data
  useEffect(() => {
    if (!id) return
    setFetchLoading(true)
    setFetchError('')
    experienceApi
      .getById(id)
      .then((res) => setExperience(res.data.result))
      .catch((err: unknown) => {
        const e = err as { response?: { data?: { message?: string } }; message?: string }
        setFetchError(e.response?.data?.message ?? e.message ?? 'Không thể tải thông tin tour.')
      })
      .finally(() => setFetchLoading(false))
  }, [id])

  const handleSubmit = async (data: ExperienceFormValues) => {
    if (!id) return
    setIsLoading(true)
    setErrorMsg('')
    setSuccessMsg('')
    try {
      await experienceApi.update(id, data)
      setSuccessMsg('Cập nhật tour thành công!')
      setTimeout(() => navigate('/experiences/my'), 2000)
    } catch (err: unknown) {
      const e = err as { response?: { data?: { message?: string } }; message?: string }
      setErrorMsg(e.response?.data?.message ?? e.message ?? 'Cập nhật thất bại. Vui lòng thử lại.')
    } finally {
      setIsLoading(false)
    }
  }

  // ── Map IExperience → defaultValues cho form ──
  const defaultValues: Partial<ExperienceFormValues> | undefined = experience
    ? {
        title: experience.title,
        description: experience.description,
        category: experience.category,
        city: experience.city,
        minHours: experience.minHours,
        maxGroupSize: experience.maxGroupSize,
        includedItems: experience.includedItems,
        images: experience.images, // Cloudinary URLs (string[])
        meetingPoint: {
          longitude: experience.meetingPoint.coordinates[0],
          latitude: experience.meetingPoint.coordinates[1],
        },
      }
    : undefined

  // ── Styles ──
  const pageStyle: React.CSSProperties = {
    minHeight: '100vh',
    background: 'linear-gradient(180deg, #0f0c29 0%, #1a1040 60%, #0d1117 100%)',
    fontFamily: "'Inter', -apple-system, sans-serif",
  }

  const containerStyle: React.CSSProperties = {
    maxWidth: '720px',
    margin: '0 auto',
    padding: '2.5rem 1.5rem 5rem',
  }

  return (
    <div style={pageStyle}>
      <Navbar />

      <div style={containerStyle}>
        {/* ── Back button ── */}
        <button
          onClick={() => navigate(-1)}
          style={{
            display: 'flex', alignItems: 'center', gap: '0.5rem',
            background: 'none', border: 'none', cursor: 'pointer',
            color: 'rgba(255,255,255,0.5)', fontSize: '0.875rem', fontWeight: 600,
            fontFamily: 'inherit', marginBottom: '1.5rem', padding: 0,
          }}
        >
          <ArrowLeft size={16} /> Quay lại
        </button>

        {/* ── Hero header ── */}
        <div style={{
          position: 'relative', borderRadius: '24px', overflow: 'hidden', marginBottom: '2rem',
          background: 'linear-gradient(135deg, #064e3b 0%, #065f46 50%, #047857 100%)',
          padding: '2.25rem 2rem',
        }}>
          <div style={{ position: 'absolute', top: '-3rem', right: '-3rem', width: '12rem', height: '12rem', background: 'rgba(255,255,255,0.04)', borderRadius: '50%' }} />
          <div style={{ position: 'absolute', bottom: '-3rem', left: '-2rem', width: '9rem', height: '9rem', background: 'rgba(16,185,129,0.08)', borderRadius: '50%' }} />

          <div style={{ position: 'relative', zIndex: 1, display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
            <div style={{
              width: '64px', height: '64px', borderRadius: '18px',
              background: 'rgba(255,255,255,0.1)', backdropFilter: 'blur(10px)',
              border: '1px solid rgba(255,255,255,0.2)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2rem', flexShrink: 0,
            }}>✏️</div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                <span style={{ color: '#6ee7b7', fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                  Chỉnh sửa tour
                </span>
              </div>
              <h1 style={{ margin: '0 0 0.35rem', fontSize: '1.6rem', fontWeight: 800, color: 'white', letterSpacing: '-0.02em' }}>
                {fetchLoading ? 'Đang tải...' : experience?.title ?? 'Cập nhật trải nghiệm'}
              </h1>
              <p style={{ margin: 0, color: 'rgba(255,255,255,0.5)', fontSize: '0.875rem' }}>
                Cập nhật thông tin tour của bạn
              </p>
            </div>
          </div>
        </div>

        {/* ── Loading state ── */}
        {fetchLoading && (
          <div style={{ textAlign: 'center', padding: '4rem 0', color: 'rgba(255,255,255,0.4)' }}>
            <Loader2 size={36} style={{ animation: 'spin 0.8s linear infinite', marginBottom: '1rem' }} />
            <p style={{ margin: 0 }}>Đang tải thông tin tour...</p>
          </div>
        )}

        {/* ── Fetch error ── */}
        {fetchError && !fetchLoading && (
          <div style={{
            background: 'rgba(239,68,68,0.12)', border: '1px solid rgba(239,68,68,0.3)',
            borderRadius: '12px', padding: '1rem 1.25rem',
            display: 'flex', alignItems: 'center', gap: '0.75rem',
            color: '#fca5a5', fontSize: '0.875rem',
          }}>
            <AlertCircle size={18} style={{ flexShrink: 0 }} />
            {fetchError}
          </div>
        )}

        {/* ── Form (chỉ hiện khi đã load xong) ── */}
        {!fetchLoading && !fetchError && defaultValues && (
          <>
            {/* Success / Error alerts */}
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

            <ExperienceForm
              defaultValues={defaultValues}
              onSubmit={handleSubmit}
              isLoading={isLoading}
              submitLabel='Lưu thay đổi'
            />
          </>
        )}

        <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
      </div>
    </div>
  )
}
