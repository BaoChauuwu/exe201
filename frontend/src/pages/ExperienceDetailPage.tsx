import { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import axios from 'axios'
import {
  MapPin, Clock, Users, Star, CheckCircle2, ArrowLeft,
  Calendar, MessageCircle, UserCircle2, ChevronLeft, ChevronRight,
  Tag, Package, Shield
} from 'lucide-react'
import Navbar from '../components/layout/Navbar'
import { experienceApi, type IExperience } from '../api/experience.api'
import { useAuthStore } from '../store/authStore'

export const ExperienceDetailPage = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { isAuthenticated, user } = useAuthStore()

  const [experience, setExperience] = useState<IExperience | null>(null)
  const [buddyProfile, setBuddyProfile] = useState<any>(null)
  const [categories, setCategories] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [imgIndex, setImgIndex] = useState(0)

  useEffect(() => {
    if (!id) return
    setLoading(true)

    // Load categories động
    experienceApi.getCategories()
      .then(res => setCategories(res.data.result || []))
      .catch(() => null)

    experienceApi.getById(id)
      .then(async (res) => {
        const exp = res.data.result
        setExperience(exp)

        // Fetch buddy profile by buddyId (userId)
        try {
          const profileRes = await axios.get(`http://localhost:3000/buddy-profile/${exp.buddyId}`)
          setBuddyProfile(profileRes.data.data)
        } catch {
          // Buddy profile optional, not fatal
        }
      })
      .catch(() => setError('Không tìm thấy tour này.'))
      .finally(() => setLoading(false))
  }, [id])

  const getCategoryLabel = (cat: string) => {
    const found = categories.find(c => c.slug === cat)
    if (found) {
      return {
        label: `${found.icon} ${found.name}`,
        color: found.color
      }
    }
    return { label: '🗺️ Khác', color: '#64748b' }
  }

  const buddyUser = buddyProfile?.userId || {}
  const images = experience?.images?.length ? experience.images : []
  const totalImages = images.length

  const prevImg = () => setImgIndex(i => (i - 1 + totalImages) % totalImages)
  const nextImg = () => setImgIndex(i => (i + 1) % totalImages)

  // ── Handlers for action buttons ──
  const handleBook = () => {
    if (!isAuthenticated) return navigate('/register')
    if (user?.role !== 'tourist') return
    navigate('/trip-requests/new')
  }

  const handleChat = () => {
    if (!isAuthenticated) return navigate('/register')
    const targetUserId = buddyUser._id || experience?.buddyId
    navigate(`/chat/${targetUserId}`)
  }

  // ── Loading ──
  if (loading) return (
    <div style={{ minHeight: '100vh', background: 'var(--color-bg)', display: 'flex', flexDirection: 'column' }}>
      <Navbar />
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: '1rem' }}>
        <div style={{ width: '48px', height: '48px', border: '3px solid rgba(14,165,233,0.15)', borderTopColor: 'var(--color-primary)', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
        <p style={{ color: 'var(--color-text-muted)', fontSize: '0.9rem' }}>Đang tải thông tin tour...</p>
        <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
      </div>
    </div>
  )

  // ── Error ──
  if (error || !experience) return (
    <div style={{ minHeight: '100vh', background: 'var(--color-bg)', display: 'flex', flexDirection: 'column' }}>
      <Navbar />
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: '1.5rem', textAlign: 'center', padding: '2rem' }}>
        <div style={{ fontSize: '4rem' }}>🗺️</div>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 800, margin: 0 }}>Không tìm thấy tour</h2>
        <p style={{ color: 'var(--color-text-muted)', margin: 0 }}>{error}</p>
        <button onClick={() => navigate(-1)} style={{ background: 'var(--gradient-primary)', color: 'white', border: 'none', borderRadius: '12px', padding: '0.75rem 1.5rem', fontWeight: 700, cursor: 'pointer' }}>
          Quay lại
        </button>
      </div>
    </div>
  )

  const { label: catLabel, color: catColor } = getCategoryLabel(experience.category)

  return (
    <div style={{ minHeight: '100vh', background: 'var(--color-bg)', fontFamily: "'Inter', -apple-system, sans-serif", color: 'var(--color-text)' }}>
      <Navbar />

      <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '2rem 1.5rem 5rem' }}>

        {/* ── Back button ── */}
        <button
          onClick={() => navigate(-1)}
          style={{
            display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
            background: 'transparent', border: '1px solid var(--color-border)',
            borderRadius: '999px', padding: '0.5rem 1rem', cursor: 'pointer',
            color: 'var(--color-text-muted)', fontWeight: 600, fontSize: '0.85rem',
            marginBottom: '1.75rem', transition: 'all 0.2s',
          }}
          onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = 'var(--color-primary)'; (e.currentTarget as HTMLElement).style.color = 'var(--color-primary)' }}
          onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = 'var(--color-border)'; (e.currentTarget as HTMLElement).style.color = 'var(--color-text-muted)' }}
        >
          <ArrowLeft size={16} /> Quay lại
        </button>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: '2rem', alignItems: 'start' }}>

          {/* ══════════════════════════════════ LEFT COLUMN ══════════════════════════════════ */}
          <div>

            {/* ── Image gallery ── */}
            <div style={{ borderRadius: '24px', overflow: 'hidden', background: '#f1f5f9', marginBottom: '2rem', position: 'relative', aspectRatio: '16/9', maxHeight: '420px' }}>
              {totalImages > 0 ? (
                <>
                  <img
                    src={images[imgIndex]}
                    alt={experience.title}
                    style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block', transition: 'opacity 0.3s' }}
                  />
                  {totalImages > 1 && (
                    <>
                      <button onClick={prevImg} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', background: 'rgba(0,0,0,0.5)', border: 'none', borderRadius: '50%', width: '40px', height: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: 'white', backdropFilter: 'blur(4px)' }}>
                        <ChevronLeft size={20} />
                      </button>
                      <button onClick={nextImg} style={{ position: 'absolute', right: '1rem', top: '50%', transform: 'translateY(-50%)', background: 'rgba(0,0,0,0.5)', border: 'none', borderRadius: '50%', width: '40px', height: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: 'white', backdropFilter: 'blur(4px)' }}>
                        <ChevronRight size={20} />
                      </button>
                      <div style={{ position: 'absolute', bottom: '1rem', left: '50%', transform: 'translateX(-50%)', display: 'flex', gap: '6px' }}>
                        {images.map((_, i) => (
                          <button key={i} onClick={() => setImgIndex(i)} style={{ width: i === imgIndex ? '20px' : '8px', height: '8px', borderRadius: '999px', border: 'none', background: i === imgIndex ? 'white' : 'rgba(255,255,255,0.5)', cursor: 'pointer', transition: 'all 0.3s', padding: 0 }} />
                        ))}
                      </div>
                      <div style={{ position: 'absolute', top: '1rem', right: '1rem', background: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(6px)', color: 'white', fontSize: '0.75rem', fontWeight: 700, padding: '4px 10px', borderRadius: '999px' }}>
                        {imgIndex + 1}/{totalImages}
                      </div>
                    </>
                  )}
                </>
              ) : (
                <div style={{ width: '100%', height: '100%', minHeight: '280px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: '0.5rem', color: 'var(--color-text-faint)', fontSize: '1rem' }}>
                  <span style={{ fontSize: '3rem' }}>🗺️</span>
                  Chưa có ảnh cho tour này
                </div>
              )}
              {/* Category badge */}
              <div style={{ position: 'absolute', top: '1rem', left: '1rem', background: 'rgba(15,12,41,0.75)', backdropFilter: 'blur(10px)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '8px', padding: '4px 12px', fontSize: '0.75rem', fontWeight: 700, color: '#fff' }}>
                {catLabel}
              </div>
            </div>

            {/* ── Title & Meta ── */}
            <div style={{ marginBottom: '2rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.75rem', flexWrap: 'wrap' }}>
                <span style={{ background: `${catColor}18`, color: catColor, border: `1px solid ${catColor}40`, borderRadius: '999px', padding: '3px 12px', fontSize: '0.78rem', fontWeight: 700 }}>
                  {catLabel}
                </span>
                <span style={{ display: 'flex', alignItems: 'center', gap: '4px', color: 'var(--color-text-muted)', fontSize: '0.82rem' }}>
                  <MapPin size={13} style={{ color: 'var(--color-primary)' }} />
                  {experience.city || 'Đà Nẵng'}
                </span>
              </div>

              <h1 style={{ fontSize: '1.85rem', fontWeight: 900, margin: '0 0 1rem', lineHeight: 1.3, letterSpacing: '-0.01em' }}>
                {experience.title}
              </h1>

              <p style={{ fontSize: '1rem', color: 'var(--color-text-muted)', lineHeight: 1.7, margin: 0 }}>
                {experience.description}
              </p>
            </div>

            {/* ── Stats row ── */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem', marginBottom: '2rem' }}>
              {[
                { icon: <Clock size={18} style={{ color: 'var(--color-primary)' }} />, label: 'Thời gian tối thiểu', value: `${experience.minHours} giờ` },
                { icon: <Users size={18} style={{ color: '#8b5cf6' }} />, label: 'Nhóm tối đa', value: `${experience.maxGroupSize} người` },
                { icon: <Tag size={18} style={{ color: '#f59e0b' }} />, label: 'Chi phí', value: `${(experience.price || 0).toLocaleString()} ${experience.currency || 'VND'}/h` },
              ].map((stat, i) => (
                <div key={i} style={{ background: '#ffffff', border: '1px solid var(--color-border)', borderRadius: '16px', padding: '1.1rem 1rem', display: 'flex', flexDirection: 'column', gap: '0.4rem', boxShadow: '0 2px 8px rgba(14,165,233,0.04)' }}>
                  {stat.icon}
                  <div style={{ fontSize: '0.72rem', color: 'var(--color-text-faint)', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 600 }}>{stat.label}</div>
                  <div style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--color-text)' }}>{stat.value}</div>
                </div>
              ))}
            </div>

            {/* ── Included items ── */}
            {experience.includedItems && experience.includedItems.length > 0 && (
              <div style={{ background: '#ffffff', border: '1px solid var(--color-border)', borderRadius: '20px', padding: '1.5rem', marginBottom: '2rem', boxShadow: '0 2px 8px rgba(14,165,233,0.04)' }}>
                <h3 style={{ margin: '0 0 1rem', fontSize: '1rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Package size={18} style={{ color: 'var(--color-primary)' }} />
                  Bao gồm trong tour
                </h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                  {experience.includedItems.map((item, i) => (
                    <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '0.9rem', color: 'var(--color-text-muted)' }}>
                      <CheckCircle2 size={16} style={{ color: '#10b981', flexShrink: 0 }} />
                      {item}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* ── Meeting point ── */}
            {experience.meetingPoint?.coordinates?.length === 2 && (() => {
              const lon = experience.meetingPoint.coordinates[0]
              const lat = experience.meetingPoint.coordinates[1]
              const delta = 0.003
              const bbox = `${lon - delta},${lat - delta},${lon + delta},${lat + delta}`
              const osmUrl = `https://www.openstreetmap.org/export/embed.html?bbox=${bbox}&layer=mapnik&marker=${lat},${lon}`
              const googleMapsUrl = `https://www.google.com/maps?q=${lat},${lon}`

              return (
                <div style={{ background: '#ffffff', border: '1px solid var(--color-border)', borderRadius: '20px', padding: '1.5rem', boxShadow: '0 2px 8px rgba(14,165,233,0.04)' }}>
                  <h3 style={{ margin: '0 0 1rem', fontSize: '1rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <MapPin size={18} style={{ color: '#ef4444' }} />
                    Điểm hẹn gặp mặt
                  </h3>
                  
                  <div style={{ borderRadius: '16px', overflow: 'hidden', border: '1px solid var(--color-border)', background: '#f8fafc', position: 'relative', marginBottom: '1rem', boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.02)' }}>
                    <iframe
                      title="Bản đồ điểm hẹn"
                      width="100%"
                      height="250"
                      style={{ border: 0, display: 'block' }}
                      src={osmUrl}
                    />
                  </div>

                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem', alignItems: 'center', justifyContent: 'space-between', background: 'rgba(14,165,233,0.04)', padding: '0.75rem 1rem', borderRadius: '12px', border: '1px dashed rgba(14,165,233,0.2)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <MapPin size={14} style={{ color: 'var(--color-primary)' }} />
                      <span style={{ fontSize: '0.82rem', color: 'var(--color-primary)', fontWeight: 600 }}>
                        Tọa độ: {lat.toFixed(5)}, {lon.toFixed(5)}
                      </span>
                    </div>
                    <a
                      href={googleMapsUrl}
                      target='_blank'
                      rel='noopener noreferrer'
                      style={{ textDecoration: 'none', fontSize: '0.82rem', color: 'var(--color-primary)', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '4px', transition: 'opacity 0.2s' }}
                      onMouseEnter={e => { (e.currentTarget as HTMLElement).style.opacity = '0.8' }}
                      onMouseLeave={e => { (e.currentTarget as HTMLElement).style.opacity = '1' }}
                    >
                      Mở bằng Google Maps →
                    </a>
                  </div>
                </div>
              )
            })()}
          </div>

          {/* ══════════════════════════════════ RIGHT COLUMN (sticky) ══════════════════════════════════ */}
          <div style={{ position: 'sticky', top: '5.5rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>

            {/* ── Price card ── */}
            <div style={{ background: '#ffffff', border: '1px solid rgba(14,165,233,0.2)', borderRadius: '24px', padding: '1.75rem', boxShadow: '0 8px 30px rgba(14,165,233,0.08)' }}>
              <div style={{ fontSize: '0.7rem', color: 'var(--color-text-faint)', textTransform: 'uppercase', letterSpacing: '0.07em', fontWeight: 700, marginBottom: '0.4rem' }}>Chi phí mỗi giờ</div>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: '4px', marginBottom: '1.5rem' }}>
                <span style={{ fontSize: '2.2rem', fontWeight: 900, background: 'var(--gradient-primary)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text', letterSpacing: '-0.02em' }}>
                  {(experience.price || 0).toLocaleString()}
                </span>
                <span style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)', fontWeight: 600 }}>{experience.currency || 'VND'}/h</span>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem', marginBottom: '1.5rem', paddingBottom: '1.5rem', borderBottom: '1px solid var(--color-border)' }}>
                {[
                  { icon: <Clock size={14} />, text: `Tối thiểu ${experience.minHours} giờ` },
                  { icon: <Users size={14} />, text: `Tối đa ${experience.maxGroupSize} người` },
                ].map((item, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>
                    <span style={{ color: 'var(--color-primary)' }}>{item.icon}</span>
                    {item.text}
                  </div>
                ))}
              </div>

              {/* Action buttons */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {/* Book button — tourist only */}
                {user?.role === 'tourist' || !isAuthenticated ? (
                  <button
                    id='btn-book-tour'
                    onClick={handleBook}
                    style={{
                      width: '100%', padding: '0.9rem',
                      background: 'var(--gradient-primary)', border: 'none',
                      borderRadius: '14px', color: 'white', fontWeight: 800,
                      fontSize: '0.95rem', cursor: 'pointer',
                      display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
                      boxShadow: '0 6px 20px rgba(2,132,199,0.3)',
                      transition: 'transform 0.2s, box-shadow 0.2s',
                    }}
                    onMouseEnter={e => { (e.currentTarget as HTMLElement).style.transform = 'translateY(-2px)'; (e.currentTarget as HTMLElement).style.boxShadow = '0 10px 28px rgba(2,132,199,0.4)' }}
                    onMouseLeave={e => { (e.currentTarget as HTMLElement).style.transform = 'translateY(0)'; (e.currentTarget as HTMLElement).style.boxShadow = '0 6px 20px rgba(2,132,199,0.3)' }}
                  >
                    <Calendar size={18} />
                    {isAuthenticated ? 'Đặt lịch ngay' : 'Đăng ký để đặt lịch'}
                  </button>
                ) : null}

                {/* Chat button */}
                <button
                  id='btn-chat-buddy'
                  onClick={handleChat}
                  style={{
                    width: '100%', padding: '0.85rem',
                    background: 'rgba(14,165,233,0.07)',
                    border: '1.5px solid rgba(14,165,233,0.3)',
                    borderRadius: '14px', color: 'var(--color-primary)', fontWeight: 700,
                    fontSize: '0.9rem', cursor: 'pointer',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
                    transition: 'all 0.2s',
                  }}
                  onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(14,165,233,0.13)'; (e.currentTarget as HTMLElement).style.borderColor = 'rgba(14,165,233,0.5)' }}
                  onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(14,165,233,0.07)'; (e.currentTarget as HTMLElement).style.borderColor = 'rgba(14,165,233,0.3)' }}
                >
                  <MessageCircle size={17} />
                  {isAuthenticated ? 'Nhắn tin với Buddy' : 'Đăng nhập để nhắn tin'}
                </button>

                {/* View buddy profile button */}
                <Link to={`/buddies/${experience.buddyId}`} style={{ textDecoration: 'none' }}>
                  <button
                    id='btn-view-buddy'
                    style={{
                      width: '100%', padding: '0.75rem',
                      background: 'transparent',
                      border: '1px solid var(--color-border)',
                      borderRadius: '14px', color: 'var(--color-text-muted)', fontWeight: 600,
                      fontSize: '0.85rem', cursor: 'pointer',
                      display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
                      transition: 'all 0.2s',
                    }}
                    onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = 'rgba(14,165,233,0.4)'; (e.currentTarget as HTMLElement).style.color = 'var(--color-primary)' }}
                    onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = 'var(--color-border)'; (e.currentTarget as HTMLElement).style.color = 'var(--color-text-muted)' }}
                  >
                    <UserCircle2 size={16} />
                    Xem hồ sơ đầy đủ của Buddy
                  </button>
                </Link>
              </div>

              {/* Note */}
              {!isAuthenticated && (
                <p style={{ marginTop: '1rem', textAlign: 'center', fontSize: '0.75rem', color: 'var(--color-text-faint)', lineHeight: 1.5 }}>
                  Bạn cần{' '}
                  <Link to='/register' style={{ color: 'var(--color-primary)', fontWeight: 700 }}>đăng ký</Link>
                  {' '}hoặc{' '}
                  <Link to='/login' style={{ color: 'var(--color-primary)', fontWeight: 700 }}>đăng nhập</Link>
                  {' '}để đặt lịch
                </p>
              )}
            </div>

            {/* ── Buddy card ── */}
            {buddyProfile && (
              <div style={{ background: '#ffffff', border: '1px solid var(--color-border)', borderRadius: '20px', padding: '1.5rem', boxShadow: '0 4px 16px rgba(14,165,233,0.05)' }}>
                <h4 style={{ margin: '0 0 1rem', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.07em', color: 'var(--color-text-faint)', fontWeight: 700 }}>Local Buddy dẫn tour</h4>

                <div style={{ display: 'flex', alignItems: 'center', gap: '0.875rem', marginBottom: '1rem' }}>
                  <div style={{ width: '52px', height: '52px', borderRadius: '50%', overflow: 'hidden', border: '2px solid rgba(14,165,233,0.2)', flexShrink: 0 }}>
                    <img
                      src={buddyUser.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(buddyUser.name || 'B')}&background=0ea5e9&color=fff&size=100`}
                      alt={buddyUser.name}
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '2px' }}>
                      <span style={{ fontWeight: 800, fontSize: '0.95rem', color: 'var(--color-text)' }}>{buddyUser.name || 'Local Buddy'}</span>
                      {(buddyUser.verify === 1) && (
                        <Shield size={13} style={{ color: '#10b981', flexShrink: 0 }} />
                      )}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.78rem', color: 'var(--color-text-muted)' }}>
                      <Star size={12} fill='#f59e0b' style={{ color: '#f59e0b' }} />
                      <span style={{ fontWeight: 700, color: '#f59e0b' }}>{buddyProfile.rating > 0 ? buddyProfile.rating.toFixed(1) : 'Mới'}</span>
                      <span>• {buddyProfile.totalCompletedTours || 0} chuyến</span>
                    </div>
                  </div>
                </div>

                {buddyProfile.bio && (
                  <p style={{ margin: '0 0 1rem', fontSize: '0.82rem', color: 'var(--color-text-muted)', lineHeight: 1.6, display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                    {buddyProfile.bio}
                  </p>
                )}

                {buddyProfile.languages?.length > 0 && (
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
                    {buddyProfile.languages.map((lang: string) => (
                      <span key={lang} style={{ background: 'rgba(14,165,233,0.07)', border: '1px solid rgba(14,165,233,0.18)', borderRadius: '999px', padding: '2px 10px', fontSize: '0.73rem', color: 'var(--color-primary)', fontWeight: 600 }}>
                        {lang}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* ── Safety note ── */}
            <div style={{ background: 'rgba(16,185,129,0.05)', border: '1px solid rgba(16,185,129,0.2)', borderRadius: '16px', padding: '1rem 1.1rem', display: 'flex', alignItems: 'flex-start', gap: '0.75rem' }}>
              <Shield size={16} style={{ color: '#10b981', flexShrink: 0, marginTop: '2px' }} />
              <p style={{ margin: 0, fontSize: '0.78rem', color: '#047857', lineHeight: 1.55 }}>
                Tất cả Local Buddy trên UniTravel đều được xác thực danh tính qua eKYC để đảm bảo an toàn cho bạn.
              </p>
            </div>

          </div>
        </div>
      </div>
    </div>
  )
}

export default ExperienceDetailPage
