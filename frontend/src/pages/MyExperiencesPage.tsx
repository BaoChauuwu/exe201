import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Plus, Edit, CheckCircle, Clock, Eye, EyeOff, MapPin, Compass, AlertCircle } from 'lucide-react'
import Navbar from '../components/layout/Navbar'
import { experienceApi } from '../api/experience.api'
import type { IExperience } from '../api/experience.api'

export const MyExperiencesPage = () => {
  const navigate = useNavigate()
  const [experiences, setExperiences] = useState<IExperience[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')

  const fetchMyExperiences = async () => {
    setIsLoading(true)
    setError('')
    try {
      const res = await experienceApi.getMyExperiences()
      setExperiences(res.data.result || [])
    } catch (err: any) {
      console.error(err)
      setError('Không thể lấy danh sách tour của bạn. Vui lòng thử lại.')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchMyExperiences()
  }, [])

  const getCategoryLabel = (cat: string) => {
    switch (cat) {
      case 'food': return '🍴 Ẩm thực'
      case 'adventure': return '🧗 Phiêu lưu'
      case 'culture': return '🏛️ Văn hóa'
      case 'nightlife': return '💃 Giải trí đêm'
      default: return '🗺️ Khác'
    }
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(180deg, #f0f9ff 0%, #f8fafc 40%, #ffffff 100%)',
      fontFamily: "'Inter', -apple-system, sans-serif",
      color: '#0f172a',
    }}>
      <Navbar />

      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '2.5rem 2rem 5rem' }}>
        
        {/* Header section */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '1.5rem',
          marginBottom: '3rem',
        }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
              <Compass size={18} style={{ color: '#0284c7' }} />
              <span style={{ color: '#0ea5e9', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                Quản lý hoạt động
              </span>
            </div>
            <h1 style={{ margin: 0, fontSize: '2.25rem', fontWeight: 800, background: 'linear-gradient(135deg, #0369a1, #0ea5e9)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text', letterSpacing: '-0.02em' }}>
              Trải nghiệm của tôi
            </h1>
            <p style={{ margin: '0.5rem 0 0', color: '#475569', fontSize: '0.95rem' }}>
              Quản lý các tour trải nghiệm bạn đã đăng ký và theo dõi trạng thái kiểm duyệt.
            </p>
          </div>

          <Link to='/experiences/create' style={{ textDecoration: 'none' }}>
            <button
              id='create-experience-btn'
              style={{
                background: 'linear-gradient(135deg, #0284c7 0%, #0ea5e9 100%)',
                border: 'none',
                borderRadius: '12px',
                padding: '0.85rem 1.6rem',
                color: 'white',
                fontWeight: 700,
                fontSize: '0.9rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.625rem',
                boxShadow: '0 8px 25px rgba(14,165,233,0.25)',
                transition: 'all 0.25s ease',
              }}
              onMouseEnter={e => {
                const btn = e.currentTarget as HTMLElement
                btn.style.transform = 'translateY(-2px)'
                btn.style.boxShadow = '0 12px 30px rgba(14,165,233,0.4)'
              }}
              onMouseLeave={e => {
                const btn = e.currentTarget as HTMLElement
                btn.style.transform = 'translateY(0)'
                btn.style.boxShadow = '0 8px 25px rgba(14,165,233,0.25)'
              }}
            >
              <Plus size={18} color='#fff' /> Đăng tour mới
            </button>
          </Link>
        </div>

        {/* Error Alert */}
        {error && (
          <div style={{
            background: 'rgba(239,68,68,0.06)',
            border: '1px solid rgba(239,68,68,0.25)',
            borderRadius: '16px',
            padding: '1rem 1.25rem',
            color: '#ef4444',
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
            marginBottom: '2rem',
            fontSize: '0.9rem',
          }}>
            <AlertCircle size={20} />
            {error}
          </div>
        )}

        {/* Loading State */}
        {isLoading ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '2rem' }}>
            {[1, 2, 3].map(i => (
              <div key={i} style={{
                background: '#ffffff',
                border: '1px solid rgba(14, 165, 233, 0.12)',
                borderRadius: '24px',
                height: '380px',
                position: 'relative',
                overflow: 'hidden',
                boxShadow: '0 10px 30px rgba(14, 165, 233, 0.02)',
              }}>
                <div style={{ height: '180px', background: '#f1f5f9' }} />
                <div style={{ padding: '1.5rem' }}>
                  <div style={{ width: '40%', height: '14px', background: '#e2e8f0', borderRadius: '4px', marginBottom: '1rem' }} />
                  <div style={{ width: '85%', height: '22px', background: '#e2e8f0', borderRadius: '6px', marginBottom: '0.75rem' }} />
                  <div style={{ width: '60%', height: '14px', background: '#e2e8f0', borderRadius: '4px', marginBottom: '1.5rem' }} />
                  <div style={{ width: '100%', height: '40px', background: '#f1f5f9', borderRadius: '10px' }} />
                </div>
                {/* Skeleton shimmer effect */}
                <div style={{
                  position: 'absolute', inset: 0,
                  background: 'linear-gradient(90deg, transparent, rgba(14,165,233,0.03), transparent)',
                  transform: 'translateX(-100%)',
                  animation: 'shimmer 1.8s infinite',
                }} />
              </div>
            ))}
          </div>
        ) : experiences.length === 0 ? (
          /* Empty State */
          <div style={{
            background: '#ffffff',
            border: '1px dashed rgba(14, 165, 233, 0.3)',
            borderRadius: '30px',
            padding: '5rem 2rem',
            textAlign: 'center',
            boxShadow: '0 10px 30px rgba(14, 165, 233, 0.02)',
          }}>
            <div style={{ fontSize: '4rem', marginBottom: '1.5rem' }}>🗺️</div>
            <h3 style={{ fontSize: '1.5rem', fontWeight: 700, margin: '0 0 0.5rem', color: '#0f172a' }}>Chưa có tour trải nghiệm nào</h3>
            <p style={{ color: '#475569', maxWidth: '420px', margin: '0 auto 2rem', fontSize: '0.95rem', lineHeight: 1.5 }}>
              Bạn chưa tạo bài đăng trải nghiệm nào. Hãy bắt đầu chia sẻ hành trình bản địa hấp dẫn để thu hút khách du lịch ngay hôm nay!
            </p>
            <Link to='/experiences/create' style={{ textDecoration: 'none' }}>
              <button style={{
                background: 'rgba(14, 165, 233, 0.08)',
                border: '1px solid rgba(14, 165, 233, 0.35)',
                borderRadius: '12px',
                padding: '0.8rem 1.6rem',
                color: '#0284c7',
                fontWeight: 600,
                fontSize: '0.9rem',
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.5rem',
                transition: 'all 0.2s',
              }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(14, 165, 233, 0.15)' }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(14, 165, 233, 0.08)' }}
              >
                <Plus size={16} /> Đăng ký tour đầu tiên
              </button>
            </Link>
          </div>
        ) : (
          /* Experiences Grid */
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '2rem' }}>
            {experiences.map(exp => (
              <div
                key={exp._id}
                style={{
                  background: '#ffffff',
                  border: '1px solid rgba(14, 165, 233, 0.12)',
                  borderRadius: '24px',
                  overflow: 'hidden',
                  display: 'flex',
                  flexDirection: 'column',
                  transition: 'all 0.3s ease',
                  boxShadow: '0 10px 30px rgba(14, 165, 233, 0.04)',
                }}
                onMouseEnter={e => {
                  const card = e.currentTarget as HTMLElement
                  card.style.transform = 'translateY(-6px)'
                  card.style.borderColor = 'rgba(14, 165, 233, 0.35)'
                  card.style.boxShadow = '0 15px 35px rgba(14, 165, 233, 0.08)'
                }}
                onMouseLeave={e => {
                  const card = e.currentTarget as HTMLElement
                  card.style.transform = 'translateY(0)'
                  card.style.borderColor = 'rgba(14, 165, 233, 0.12)'
                  card.style.boxShadow = '0 10px 30px rgba(14, 165, 233, 0.04)'
                }}
              >
                {/* Tour Image */}
                <div style={{ height: '200px', width: '100%', position: 'relative', overflow: 'hidden', background: '#f1f5f9' }}>
                  {exp.images && exp.images.length > 0 ? (
                    <img
                      src={exp.images[0]}
                      alt={exp.title}
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                  ) : (
                    <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-text-faint)' }}>
                      🗺️ Chưa có ảnh
                    </div>
                  )}

                  {/* Category overlay */}
                  <div style={{
                    position: 'absolute', top: '1rem', left: '1rem',
                    background: 'rgba(15, 12, 41, 0.75)',
                    backdropFilter: 'blur(10px)',
                    border: '1px solid rgba(255,255,255,0.15)',
                    borderRadius: '8px', padding: '4px 10px',
                    fontSize: '0.72rem', fontWeight: 700,
                    color: 'white',
                  }}>
                    {getCategoryLabel(exp.category)}
                  </div>

                  {/* Active status indicator overlay */}
                  <div style={{
                    position: 'absolute', top: '1rem', right: '1rem',
                    background: exp.isActive ? 'rgba(16,185,129,0.12)' : 'rgba(239,68,68,0.12)',
                    backdropFilter: 'blur(10px)',
                    border: exp.isActive ? '1px solid rgba(16,185,129,0.35)' : '1px solid rgba(239,68,68,0.35)',
                    borderRadius: '8px', padding: '4px 10px',
                    fontSize: '0.72rem', fontWeight: 700,
                    color: exp.isActive ? '#10b981' : '#ef4444',
                    display: 'flex', alignItems: 'center', gap: '4px',
                  }}>
                    {exp.isActive ? <Eye size={12} /> : <EyeOff size={12} />}
                    {exp.isActive ? 'Đang hoạt động' : 'Tạm ẩn'}
                  </div>
                </div>

                {/* Tour Info */}
                <div style={{ padding: '1.5rem', flex: 1, display: 'flex', flexDirection: 'column' }}>
                  <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', marginBottom: '0.75rem', fontSize: '0.8rem', color: '#475569' }}>
                    <MapPin size={12} style={{ color: '#0284c7' }} />
                    <span>{exp.city || 'Đà Nẵng'}</span>
                    <span style={{ margin: '0 4px', color: '#94a3b8' }}>•</span>
                    <Clock size={12} style={{ color: '#0284c7' }} />
                    <span>{exp.minHours}h tối thiểu</span>
                  </div>

                  <h3 style={{ fontSize: '1.15rem', fontWeight: 800, margin: '0 0 0.5rem', lineHeight: 1.4, color: '#0f172a' }}>
                    {exp.title}
                  </h3>

                  <p style={{
                    fontSize: '0.82rem',
                    color: '#475569',
                    margin: '0 0 1.25rem',
                    lineHeight: 1.5,
                    display: '-webkit-box',
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: 'vertical',
                    overflow: 'hidden',
                  }}>
                    {exp.description}
                  </p>

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 'auto', paddingTop: '1.25rem', borderTop: '1px solid rgba(14, 165, 233, 0.1)' }}>
                    {/* Price */}
                    <div>
                      <div style={{ fontSize: '0.7rem', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Mức giá</div>
                      <div style={{ display: 'flex', alignItems: 'baseline', gap: '3px' }}>
                        <span style={{ fontSize: '1.3rem', fontWeight: 800, color: '#0284c7' }}>{exp.price?.toLocaleString()}</span>
                        <span style={{ fontSize: '0.8rem', color: '#475569', fontWeight: 600 }}>{exp.currency || 'VND'}/giờ</span>
                      </div>
                    </div>

                    {/* Approval Status Badge */}
                    <div style={{
                      background: exp.isApproved ? 'rgba(16,185,129,0.08)' : 'rgba(245,158,11,0.08)',
                      border: exp.isApproved ? '1px solid rgba(16,185,129,0.3)' : '1px solid rgba(245,158,11,0.3)',
                      borderRadius: '10px',
                      padding: '6px 12px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      fontSize: '0.78rem',
                      fontWeight: 700,
                      color: exp.isApproved ? '#10b981' : '#d97706',
                    }}>
                      {exp.isApproved ? (
                        <>
                          <CheckCircle size={14} />
                          <span>Đã duyệt</span>
                        </>
                      ) : (
                        <>
                          <Clock size={14} />
                          <span>Chờ duyệt</span>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Actions buttons */}
                  <div style={{ marginTop: '1.25rem', display: 'flex', gap: '0.75rem' }}>
                    <button
                      onClick={() => navigate(`/experiences/${exp._id}/edit`)}
                      style={{
                        flex: 1,
                        background: '#f8fafc',
                        border: '1px solid rgba(14, 165, 233, 0.2)',
                        borderRadius: '12px',
                        padding: '0.7rem',
                        color: '#0f172a',
                        fontWeight: 600,
                        fontSize: '0.8rem',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '0.4rem',
                        transition: 'all 0.2s',
                      }}
                      onMouseEnter={e => {
                        const btn = e.currentTarget as HTMLElement
                        btn.style.background = '#f1f5f9'
                        btn.style.borderColor = 'rgba(14, 165, 233, 0.4)'
                      }}
                      onMouseLeave={e => {
                        const btn = e.currentTarget as HTMLElement
                        btn.style.background = '#f8fafc'
                        btn.style.borderColor = 'rgba(14, 165, 233, 0.2)'
                      }}
                    >
                      <Edit size={14} /> Chỉnh sửa
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Shimmer CSS for Loading Skeleton */}
      <style>{`
        @keyframes shimmer {
          100% {
            transform: translateX(100%);
          }
        }
      `}</style>
    </div>
  )
}
