import { Link, Navigate } from 'react-router-dom'
import { useAuthStore } from '../store/authStore'
import Navbar from '../components/layout/Navbar'
import {
  Map, Users, TrendingUp, Star, Compass,
  ArrowRight, Heart, Bell, Calendar, Award, Wallet, Plus, Navigation
} from 'lucide-react'

export default function DashboardPage() {
  const { user } = useAuthStore()

  if (user?.role === 'admin') {
    return <Navigate to="/admin" replace />
  }

  const displayName = user?.name || user?.username || 'Traveler'
  const isBuddy = user?.role === 'buddy'
  const hour = new Date().getHours()
  const greeting = hour < 12 ? 'Chào buổi sáng' : hour < 18 ? 'Chào buổi chiều' : 'Chào buổi tối'

  const stats = isBuddy
    ? [
        { icon: <Map size={22} />, color: '#0284c7', bg: 'rgba(2,132,199,0.1)', value: '0', label: 'Chuyến đã dẫn', id: 'stat-trips' },
        { icon: <Star size={22} />, color: '#f59e0b', bg: 'rgba(245,158,11,0.1)', value: '5.0', label: 'Đánh giá', id: 'stat-rating' },
        { icon: <TrendingUp size={22} />, color: '#10b981', bg: 'rgba(16,185,129,0.1)', value: '0 ₫', label: 'Doanh thu', id: 'stat-revenue' },
        { icon: <Bell size={22} />, color: '#0ea5e9', bg: 'rgba(14,165,233,0.1)', value: '0', label: 'Yêu cầu mới', id: 'stat-requests' }
      ]
    : [
        { icon: <Map size={22} />, color: '#0284c7', bg: 'rgba(2,132,199,0.1)', value: '0', label: 'Chuyến đi', id: 'stat-trips' },
        { icon: <Users size={22} />, color: '#0ea5e9', bg: 'rgba(14,165,233,0.1)', value: '0', label: 'Buddy đã thuê', id: 'stat-buddies' },
        { icon: <Heart size={22} />, color: '#ef4444', bg: 'rgba(239,68,68,0.1)', value: '0', label: 'Yêu thích', id: 'stat-saved' },
        { icon: <Star size={22} />, color: '#f59e0b', bg: 'rgba(245,158,11,0.1)', value: '0', label: 'Đánh giá', id: 'stat-reviews' }
      ]

  const quickActions = isBuddy
    ? [
        { icon: <Plus size={22} />, label: 'Tạo chuyến đi (Tour)', desc: 'Tạo bài đăng trải nghiệm bản địa', color: '#10b981', to: '/experiences/create', actionId: 'action-create-experience' },
        { icon: <Bell size={22} />, label: 'Bảng yêu cầu (Nhận kèo)', desc: 'Xem yêu cầu tìm Buddy từ khách', color: '#8b5cf6', to: '/trip-requests/open', actionId: 'action-bidding' },
        { icon: <Map size={22} />, label: 'Tour của tôi', desc: 'Quản lý bài đăng & trạng thái duyệt', color: '#0284c7', to: '/experiences/my', actionId: 'action-my-experiences' },
        { icon: <Calendar size={22} />, label: 'Quản lý lịch rảnh', desc: 'Thiết lập thời gian dẫn tour', color: '#0ea5e9', to: '/buddy-profile', actionId: 'action-schedule' },
        { icon: <Wallet size={22} />, label: 'Ví & Rút tiền', desc: 'Theo dõi doanh thu & rút tiền', color: '#10b981', to: '/wallet', actionId: 'action-wallet' },
        { icon: <Users size={22} />, label: 'Hồ sơ Buddy', desc: 'Cập nhật giới thiệu, mức giá', color: '#fbbf24', to: '/buddy-profile', actionId: 'action-profile' }
      ]
    : [
        { icon: <Plus size={22} />, label: 'Tạo Yêu cầu chuyến đi', desc: 'Đăng nhu cầu tìm Buddy', color: '#10b981', to: '/trip-requests/new', actionId: 'action-create-req' },
        { icon: <Map size={22} />, label: 'Yêu cầu của tôi', desc: 'Quản lý yêu cầu & duyệt báo giá', color: '#0284c7', to: '/my-requests', actionId: 'action-my-reqs' },
        { icon: <Compass size={22} />, label: 'Tìm Local Buddy', desc: 'Tìm hướng dẫn viên bản địa', color: '#8b5cf6', to: '/buddies', actionId: 'action-find-buddy' },
        { icon: <Users size={22} />, label: 'Cộng đồng du lịch', desc: 'Kết nối với du khách khác', color: '#fbbf24', to: '/chat', actionId: 'action-community' }
      ]

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(180deg, #f0f9ff 0%, #f8fafc 40%, #ffffff 100%)', fontFamily: "'Inter', -apple-system, sans-serif" }}>
      <Navbar />

      {/* Hero welcome banner */}
      <div style={{
        background: 'linear-gradient(135deg, rgba(14, 165, 233, 0.08) 0%, rgba(2, 132, 199, 0.04) 100%)',
        borderBottom: '1px solid rgba(14, 165, 233, 0.15)',
        padding: '3rem 2rem'
      }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1.5rem' }}>
          <div>
            <p style={{ color: 'var(--color-text-muted)', fontSize: '0.875rem', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ background: isBuddy ? 'rgba(2, 132, 199, 0.1)' : 'rgba(14, 165, 233, 0.1)', color: isBuddy ? 'var(--color-primary-dark)' : 'var(--color-primary)', padding: '2px 10px', borderRadius: '999px', fontSize: '0.75rem', fontWeight: 600, border: `1px solid ${isBuddy ? 'rgba(2, 132, 199, 0.3)' : 'rgba(14, 165, 233, 0.3)'}` }}>
                {isBuddy ? '🌟 Local Buddy' : '✈️ Khách du lịch'}
              </span>
            </p>
            <h1 style={{ fontSize: '2.25rem', fontWeight: 800, color: 'var(--color-text)', margin: 0, letterSpacing: '-0.025em' }}>
              {greeting}, <span style={{ background: 'var(--gradient-text)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>{displayName}!</span> 👋
            </h1>
            <p style={{ color: 'var(--color-text-muted)', marginTop: '0.5rem', fontSize: '1rem' }}>
              {isBuddy ? 'Hôm nay bạn sẵn sàng đón khách chứ?' : 'Bạn muốn khám phá thành phố nào hôm nay?'}
            </p>
          </div>
                <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
                  <button id='dashboard-plan-trip' style={{ background: 'rgba(99,102,241,0.2)', border: '1px solid rgba(99,102,241,0.4)', borderRadius: '12px', padding: '0.75rem 1.5rem', color: '#a5b4fc', fontWeight: 600, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem' }}>
                    <Compass size={16} /> Thuê Local Buddy ngay
                  </button>
                  <Link to='/live-tracking/demo-booking-123' style={{ textDecoration: 'none' }}>
                    <button style={{ background: 'linear-gradient(135deg, #10b981, #059669)', border: 'none', borderRadius: '12px', padding: '0.75rem 1.5rem', color: 'white', fontWeight: 600, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem', boxShadow: '0 8px 20px rgba(16,185,129,0.3)' }}>
                      <Navigation size={16} /> Test Live Tracking
                    </button>
                  </Link>
                  <Link to='/tourist/live/demo-booking-123' style={{ textDecoration: 'none' }}>
                    <button style={{ background: 'linear-gradient(135deg, #3b82f6, #2563eb)', border: 'none', borderRadius: '12px', padding: '0.75rem 1.5rem', color: 'white', fontWeight: 600, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem', boxShadow: '0 8px 20px rgba(59,130,246,0.3)' }}>
                      <Map size={16} /> Tourist Map
                    </button>
                  </Link>
                </div>
        </div>
      </div>

      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '2.5rem 2rem' }}>

        {/* Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.25rem', marginBottom: '2.5rem' }}>
          {stats.map((s) => (
            <div key={s.id} id={s.id} style={{
              background: '#ffffff', border: '1px solid rgba(14, 165, 233, 0.12)',
              borderRadius: '20px', padding: '1.75rem 1.5rem',
              display: 'flex', alignItems: 'center', gap: '1.25rem',
              boxShadow: '0 10px 25px rgba(14, 165, 233, 0.03)', transition: 'transform 0.2s, box-shadow 0.2s'
            }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.transform = 'translateY(-3px)'; (e.currentTarget as HTMLElement).style.boxShadow = `0 12px 30px rgba(14, 165, 233, 0.08)`; (e.currentTarget as HTMLElement).style.borderColor = 'rgba(14, 165, 233, 0.3)' }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.transform = 'translateY(0)'; (e.currentTarget as HTMLElement).style.boxShadow = 'none'; (e.currentTarget as HTMLElement).style.borderColor = 'rgba(14, 165, 233, 0.12)' }}
            >
              <div style={{ width: '48px', height: '48px', borderRadius: '14px', background: s.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', color: s.color, flexShrink: 0 }}>
                {s.icon}
              </div>
              <div>
                <div style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--color-text)', lineHeight: 1 }}>{s.value}</div>
                <div style={{ color: 'var(--color-text-muted)', fontSize: '0.8rem', marginTop: '0.3rem' }}>{s.label}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Quick Actions */}
        <div style={{ marginBottom: '2.5rem' }}>
          <h2 style={{ fontSize: '1.125rem', fontWeight: 700, color: 'var(--color-text)', marginBottom: '1.25rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Hành động nhanh</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}>
            {quickActions.map((a) => (
              <Link to={a.to} key={a.actionId} style={{ textDecoration: 'none' }}>
                <div
                  id={a.actionId}
                  style={{
                    background: '#ffffff', border: '1px solid rgba(14, 165, 233, 0.12)',
                    borderRadius: '20px', padding: '1.5rem', cursor: 'pointer',
                    textAlign: 'left', transition: 'all 0.25s', height: '100%', boxSizing: 'border-box'
                  }}
                  onMouseEnter={e => { const el = e.currentTarget as HTMLElement; el.style.borderColor = `${a.color}80`; el.style.transform = 'translateY(-4px)'; el.style.boxShadow = `0 12px 30px ${a.color}15`; el.style.background = `${a.color}05` }}
                  onMouseLeave={e => { const el = e.currentTarget as HTMLElement; el.style.borderColor = 'rgba(14, 165, 233, 0.12)'; el.style.transform = 'translateY(0)'; el.style.boxShadow = 'none'; el.style.background = '#ffffff' }}
                >
                  <div style={{ width: '44px', height: '44px', borderRadius: '12px', background: `${a.color}10`, color: a.color, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1rem' }}>
                    {a.icon}
                  </div>
                  <div style={{ fontWeight: 700, color: 'var(--color-text)', marginBottom: '0.35rem', fontSize: '0.95rem' }}>{a.label}</div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>{a.desc}</div>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* Banner */}
        <div style={{
          background: 'linear-gradient(135deg, rgba(14, 165, 233, 0.08) 0%, rgba(2, 132, 199, 0.04) 100%)',
          border: '1px solid rgba(14, 165, 233, 0.25)',
          borderRadius: '24px', padding: '2rem',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          flexWrap: 'wrap', gap: '1.5rem', marginBottom: '2rem'
        }}>
          {isBuddy ? (
            <>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '0.5rem' }}>
                  <Award size={16} style={{ color: 'var(--color-primary)' }} />
                  <span style={{ color: 'var(--color-primary-dark)', fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Chương trình eKYC</span>
                </div>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--color-text)', marginBottom: '0.4rem' }}>🔒 Xác thực danh tính Buddy ngay!</h3>
                <p style={{ color: 'var(--color-text-muted)', fontSize: '0.875rem' }}>Tải lên CCCD & ảnh chân dung để tăng độ tin cậy và nhận nhiều đơn hơn.</p>
              </div>
              <Link to='/ekyc'>
                <button id='dashboard-ekyc-btn' style={{ background: 'var(--gradient-primary)', border: 'none', borderRadius: '12px', padding: '0.875rem 1.5rem', color: 'white', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem', boxShadow: '0 8px 20px rgba(14, 165, 233, 0.25)', whiteSpace: 'nowrap' }}>
                  Bắt đầu eKYC <ArrowRight size={16} />
                </button>
              </Link>
            </>
          ) : (
            <>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '0.5rem' }}>
                  <TrendingUp size={16} style={{ color: 'var(--color-primary)' }} />
                  <span style={{ color: 'var(--color-primary-dark)', fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Gợi ý Buddy hôm nay</span>
                </div>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--color-text)', marginBottom: '0.4rem' }}>✈️ Lan Anh – Tour ẩm thực Hà Nội</h3>
                <p style={{ color: 'var(--color-text-muted)', fontSize: '0.875rem' }}>Khám phá phố cổ và ẩm thực đường phố độc đáo chỉ từ 250K/giờ.</p>
              </div>
              <button id='dashboard-explore-btn' style={{ background: 'var(--gradient-primary)', border: 'none', borderRadius: '12px', padding: '0.875rem 1.5rem', color: 'white', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem', boxShadow: '0 8px 20px rgba(14, 165, 233, 0.25)', whiteSpace: 'nowrap' }}>
                Tìm hiểu thêm <ArrowRight size={16} />
              </button>
            </>
          )}
        </div>

        {/* Upcoming trips/schedule - empty state */}
        <div>
          <h2 style={{ fontSize: '1.125rem', fontWeight: 700, color: 'var(--color-text)', marginBottom: '1.25rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            {isBuddy ? 'Lịch trình dẫn khách sắp tới' : 'Chuyến đi sắp tới'}
          </h2>
          <div style={{
            background: '#ffffff', border: '1px dashed rgba(14, 165, 233, 0.3)',
            borderRadius: '24px', padding: '4rem 2rem', textAlign: 'center'
          }}>
            {isBuddy ? (
              <>
                <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📅</div>
                <p style={{ color: 'var(--color-text-muted)', marginBottom: '1.25rem', fontSize: '0.9rem' }}>Bạn chưa nhận lịch dẫn đường nào sắp tới</p>
                <Link to='/buddy-profile'>
                  <button id='dashboard-buddy-schedule' style={{ background: 'rgba(14, 165, 233, 0.1)', border: '1px solid rgba(14, 165, 233, 0.3)', borderRadius: '12px', padding: '0.75rem 1.5rem', color: 'var(--color-primary-dark)', fontWeight: 600, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem' }}>
                    <Calendar size={16} /> Mở lịch rảnh ngay
                  </button>
                </Link>
              </>
            ) : (
              <>
                <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>✈️</div>
                <p style={{ color: 'var(--color-text-muted)', marginBottom: '1.25rem', fontSize: '0.9rem' }}>Bạn chưa có yêu cầu chuyến đi nào đang mở</p>
                <Link to='/trip-requests/new'>
                  <button id='dashboard-plan-trip' style={{ background: 'rgba(14, 165, 233, 0.1)', border: '1px solid rgba(14, 165, 233, 0.3)', borderRadius: '12px', padding: '0.75rem 1.5rem', color: 'var(--color-primary-dark)', fontWeight: 600, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem' }}>
                    <Plus size={16} /> Tạo Yêu Cầu Tìm Buddy Ngay
                  </button>
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
