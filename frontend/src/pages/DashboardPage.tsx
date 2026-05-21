import { Link } from 'react-router-dom'
import { useAuthStore } from '../store/authStore'
import Navbar from '../components/layout/Navbar'
import {
  Plane, Map, Users, TrendingUp, Star, Compass,
  ArrowRight, Globe, Heart, Bell
} from 'lucide-react'

const stats = [
  { icon: <Map size={20} />, iconClass: 'feature-icon-blue', value: '0', label: 'Chuyến đi', id: 'stat-trips' },
  { icon: <Globe size={20} />, iconClass: 'feature-icon-purple', value: '0', label: 'Địa điểm đã thăm', id: 'stat-places' },
  { icon: <Users size={20} />, iconClass: 'feature-icon-amber', value: '0', label: 'Bạn đồng hành', id: 'stat-friends' },
  { icon: <Heart size={20} />, iconClass: 'feature-icon-pink', value: '0', label: 'Đã lưu', id: 'stat-saved' }
]

const quickActions = [
  { icon: <Map size={24} />, label: 'Lên lịch trình', desc: 'Tạo kế hoạch cho chuyến đi tiếp theo', color: 'var(--color-primary)' },
  { icon: <Compass size={24} />, label: 'Khám phá', desc: 'Tìm kiếm địa điểm & tour hấp dẫn', color: '#818cf8' },
  { icon: <Users size={24} />, label: 'Cộng đồng', desc: 'Kết nối với những người cùng đam mê', color: '#f59e0b' },
  { icon: <Star size={24} />, label: 'Đánh giá', desc: 'Chia sẻ trải nghiệm của bạn', color: '#10b981' }
]

export default function DashboardPage() {
  const { user } = useAuthStore()

  const displayName = user?.name || user?.username || 'Traveler'
  const hour = new Date().getHours()
  const greeting = hour < 12 ? 'Chào buổi sáng' : hour < 18 ? 'Chào buổi chiều' : 'Chào buổi tối'

  return (
    <div className='dashboard-page'>
      <Navbar />

      <div className='container'>
        {/* Header */}
        <div className='dashboard-header animate-fade-in-up'>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
            <div>
              <p style={{ color: 'var(--color-text-muted)', fontSize: '0.875rem', marginBottom: '0.25rem' }}>
                {greeting} 👋
              </p>
              <h1 className='dashboard-greeting'>
                {greeting}, <span className='gradient-text'>{displayName}!</span>
              </h1>
              <p className='dashboard-subtitle'>Hôm nay bạn muốn khám phá đâu?</p>
            </div>
            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <button className='btn btn-secondary btn-sm'>
                <Bell size={16} /> Thông báo
              </button>
              <Link to='/profile'>
                <button className='btn btn-primary btn-sm'>
                  Hồ sơ của tôi
                </button>
              </Link>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className='stats-grid animate-fade-in-up animate-delay-1'>
          {stats.map((s, i) => (
            <div key={i} className='stat-card' id={s.id}>
              <div className={`stat-icon ${s.iconClass}`}>{s.icon}</div>
              <div className='stat-value'>{s.value}</div>
              <div className='stat-label'>{s.label}</div>
            </div>
          ))}
        </div>

        {/* Quick Actions */}
        <div style={{ marginBottom: '2rem' }} className='animate-fade-in-up animate-delay-2'>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 700 }}>Hành động nhanh</h2>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}>
            {quickActions.map((a, i) => (
              <button
                key={i}
                id={`quick-action-${i}`}
                style={{
                  background: 'var(--color-surface)',
                  border: '1px solid var(--color-border)',
                  borderRadius: '1rem',
                  padding: '1.5rem',
                  cursor: 'pointer',
                  textAlign: 'left',
                  transition: 'all 0.25s ease',
                  color: 'var(--color-text)',
                  fontFamily: 'var(--font-family)'
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.borderColor = a.color
                  e.currentTarget.style.transform = 'translateY(-3px)'
                  e.currentTarget.style.boxShadow = `0 8px 30px ${a.color}20`
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.borderColor = 'var(--color-border)'
                  e.currentTarget.style.transform = 'translateY(0)'
                  e.currentTarget.style.boxShadow = 'none'
                }}
              >
                <div style={{
                  width: 44, height: 44, borderRadius: '0.75rem', marginBottom: '1rem',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  background: `${a.color}18`, color: a.color
                }}>
                  {a.icon}
                </div>
                <div style={{ fontWeight: 700, marginBottom: '0.25rem' }}>{a.label}</div>
                <div style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>{a.desc}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Explore banner */}
        <div className='animate-fade-in-up animate-delay-3' style={{
          background: 'var(--gradient-card)',
          border: '1px solid var(--color-border)',
          borderRadius: '1.5rem',
          padding: '2rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '1.5rem',
          marginBottom: '2rem',
          position: 'relative',
          overflow: 'hidden'
        }}>
          <div style={{
            position: 'absolute', right: -40, top: -40,
            width: 200, height: 200,
            background: 'radial-gradient(circle, rgba(14,165,233,0.1) 0%, transparent 70%)',
            pointerEvents: 'none'
          }} />
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '0.5rem' }}>
              <TrendingUp size={18} style={{ color: 'var(--color-primary)' }} />
              <span style={{ color: 'var(--color-primary)', fontSize: '0.8rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Đề xuất hôm nay
              </span>
            </div>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 800, marginBottom: '0.5rem' }}>
              ✈️ Hội An – Thành phố ánh đèn lồng
            </h3>
            <p style={{ color: 'var(--color-text-muted)', fontSize: '0.875rem' }}>
              Khám phá phố cổ nổi tiếng với tour giá sinh viên từ 450K/người
            </p>
          </div>
          <button className='btn btn-primary' id='dashboard-explore-btn'>
            Khám phá ngay <ArrowRight size={16} />
          </button>
        </div>

        {/* Upcoming trips placeholder */}
        <div className='animate-fade-in-up animate-delay-4' style={{ marginBottom: '3rem' }}>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '1.5rem' }}>Chuyến đi sắp tới</h2>
          <div style={{
            background: 'var(--color-surface)',
            border: '1px dashed var(--color-border)',
            borderRadius: '1.5rem',
            padding: '3rem',
            textAlign: 'center'
          }}>
            <Plane size={40} style={{ color: 'var(--color-text-faint)', marginBottom: '1rem' }} />
            <p style={{ color: 'var(--color-text-muted)', marginBottom: '1rem' }}>
              Bạn chưa có chuyến đi nào được lên lịch
            </p>
            <button className='btn btn-primary btn-sm' id='dashboard-plan-trip'>
              <Map size={16} /> Lên kế hoạch ngay
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
