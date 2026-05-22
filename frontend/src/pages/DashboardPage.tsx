import { Link, Navigate } from 'react-router-dom'
import { useAuthStore } from '../store/authStore'
import Navbar from '../components/layout/Navbar'
import {
  Plane, Map, Users, TrendingUp, Star, Compass,
  ArrowRight, Heart, Bell, Calendar, Award, Wallet
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
        { icon: <Map size={22} />, color: '#6366f1', bg: 'rgba(99,102,241,0.15)', value: '0', label: 'Chuyến đã dẫn', id: 'stat-trips' },
        { icon: <Star size={22} />, color: '#f59e0b', bg: 'rgba(245,158,11,0.15)', value: '5.0', label: 'Đánh giá', id: 'stat-rating' },
        { icon: <TrendingUp size={22} />, color: '#10b981', bg: 'rgba(16,185,129,0.15)', value: '0 ₫', label: 'Doanh thu', id: 'stat-revenue' },
        { icon: <Bell size={22} />, color: '#8b5cf6', bg: 'rgba(139,92,246,0.15)', value: '0', label: 'Yêu cầu mới', id: 'stat-requests' }
      ]
    : [
        { icon: <Map size={22} />, color: '#6366f1', bg: 'rgba(99,102,241,0.15)', value: '0', label: 'Chuyến đi', id: 'stat-trips' },
        { icon: <Users size={22} />, color: '#8b5cf6', bg: 'rgba(139,92,246,0.15)', value: '0', label: 'Buddy đã thuê', id: 'stat-buddies' },
        { icon: <Heart size={22} />, color: '#ec4899', bg: 'rgba(236,72,153,0.15)', value: '0', label: 'Yêu thích', id: 'stat-saved' },
        { icon: <Star size={22} />, color: '#f59e0b', bg: 'rgba(245,158,11,0.15)', value: '0', label: 'Đánh giá', id: 'stat-reviews' }
      ]

  const quickActions = isBuddy
    ? [
        { icon: <Calendar size={22} />, label: 'Quản lý lịch rảnh', desc: 'Thiết lập thời gian dẫn tour', color: '#6366f1', to: '/buddy-profile', actionId: 'action-schedule' },
        { icon: <Bell size={22} />, label: 'Đơn đặt lịch', desc: 'Xem & xác nhận yêu cầu thuê', color: '#8b5cf6', to: '/dashboard', actionId: 'action-bookings' },
        { icon: <Wallet size={22} />, label: 'Ví & Rút tiền', desc: 'Theo dõi doanh thu & rút tiền', color: '#10b981', to: '/wallet', actionId: 'action-wallet' },
        { icon: <Users size={22} />, label: 'Hồ sơ Buddy', desc: 'Cập nhật giới thiệu, ngôn ngữ', color: '#f59e0b', to: '/buddy-profile', actionId: 'action-profile' }
      ]
    : [
        { icon: <Compass size={22} />, label: 'Tìm Local Buddy', desc: 'Tìm hướng dẫn viên bản địa', color: '#6366f1', to: '/dashboard', actionId: 'action-find-buddy' },
        { icon: <Map size={22} />, label: 'Lịch trình của tôi', desc: 'Quản lý các chuyến đi sắp tới', color: '#8b5cf6', to: '/dashboard', actionId: 'action-my-trips' },
        { icon: <Users size={22} />, label: 'Cộng đồng du lịch', desc: 'Kết nối với du khách khác', color: '#f59e0b', to: '/chat', actionId: 'action-community' },
        { icon: <Star size={22} />, label: 'Đánh giá Buddy', desc: 'Chia sẻ nhận xét sau chuyến đi', color: '#10b981', to: '/dashboard', actionId: 'action-review' }
      ]

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(180deg, #0f0c29 0%, #1a1040 60%, #0d1117 100%)', fontFamily: "'Inter', -apple-system, sans-serif" }}>
      <Navbar />

      {/* Hero welcome banner */}
      <div style={{
        background: 'linear-gradient(135deg, rgba(99,102,241,0.2) 0%, rgba(139,92,246,0.1) 100%)',
        borderBottom: '1px solid rgba(255,255,255,0.05)',
        padding: '3rem 2rem'
      }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1.5rem' }}>
          <div>
            <p style={{ color: 'rgba(255,255,255,0.45)', fontSize: '0.875rem', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ background: isBuddy ? 'rgba(139,92,246,0.2)' : 'rgba(99,102,241,0.2)', color: isBuddy ? '#c4b5fd' : '#a5b4fc', padding: '2px 10px', borderRadius: '999px', fontSize: '0.75rem', fontWeight: 600, border: `1px solid ${isBuddy ? 'rgba(139,92,246,0.4)' : 'rgba(99,102,241,0.4)'}` }}>
                {isBuddy ? '🌟 Local Buddy' : '✈️ Khách du lịch'}
              </span>
            </p>
            <h1 style={{ fontSize: '2.25rem', fontWeight: 800, color: 'white', margin: 0, letterSpacing: '-0.025em' }}>
              {greeting}, <span style={{ background: 'linear-gradient(90deg, #a78bfa, #818cf8)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>{displayName}!</span> 👋
            </h1>
            <p style={{ color: 'rgba(255,255,255,0.45)', marginTop: '0.5rem', fontSize: '1rem' }}>
              {isBuddy ? 'Hôm nay bạn sẵn sàng đón khách chứ?' : 'Bạn muốn khám phá thành phố nào hôm nay?'}
            </p>
          </div>
          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <button style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '10px', padding: '0.6rem 1.2rem', color: 'rgba(255,255,255,0.7)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.875rem' }}>
              <Bell size={16} /> Thông báo
            </button>
            <Link to='/profile'>
              <button style={{ background: 'linear-gradient(135deg, #8b5cf6, #6366f1)', border: 'none', borderRadius: '10px', padding: '0.6rem 1.2rem', color: 'white', cursor: 'pointer', fontWeight: 600, fontSize: '0.875rem' }}>
                Hồ sơ của tôi
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
              background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)',
              borderRadius: '20px', padding: '1.75rem 1.5rem',
              display: 'flex', alignItems: 'center', gap: '1.25rem',
              backdropFilter: 'blur(10px)', transition: 'transform 0.2s, box-shadow 0.2s'
            }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.transform = 'translateY(-3px)'; (e.currentTarget as HTMLElement).style.boxShadow = `0 12px 30px ${s.color}20` }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.transform = 'translateY(0)'; (e.currentTarget as HTMLElement).style.boxShadow = 'none' }}
            >
              <div style={{ width: '48px', height: '48px', borderRadius: '14px', background: s.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', color: s.color, flexShrink: 0 }}>
                {s.icon}
              </div>
              <div>
                <div style={{ fontSize: '1.75rem', fontWeight: 800, color: 'white', lineHeight: 1 }}>{s.value}</div>
                <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.8rem', marginTop: '0.3rem' }}>{s.label}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Quick Actions */}
        <div style={{ marginBottom: '2.5rem' }}>
          <h2 style={{ fontSize: '1.125rem', fontWeight: 700, color: 'rgba(255,255,255,0.8)', marginBottom: '1.25rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Hành động nhanh</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}>
            {quickActions.map((a) => (
              <Link to={a.to} key={a.actionId} style={{ textDecoration: 'none' }}>
                <div
                  id={a.actionId}
                  style={{
                    background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)',
                    borderRadius: '20px', padding: '1.5rem', cursor: 'pointer',
                    textAlign: 'left', transition: 'all 0.25s', height: '100%', boxSizing: 'border-box'
                  }}
                  onMouseEnter={e => { const el = e.currentTarget as HTMLElement; el.style.borderColor = `${a.color}60`; el.style.transform = 'translateY(-4px)'; el.style.boxShadow = `0 12px 30px ${a.color}20`; el.style.background = `${a.color}0a` }}
                  onMouseLeave={e => { const el = e.currentTarget as HTMLElement; el.style.borderColor = 'rgba(255,255,255,0.07)'; el.style.transform = 'translateY(0)'; el.style.boxShadow = 'none'; el.style.background = 'rgba(255,255,255,0.04)' }}
                >
                  <div style={{ width: '44px', height: '44px', borderRadius: '12px', background: `${a.color}18`, color: a.color, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1rem' }}>
                    {a.icon}
                  </div>
                  <div style={{ fontWeight: 700, color: 'white', marginBottom: '0.35rem', fontSize: '0.95rem' }}>{a.label}</div>
                  <div style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.35)' }}>{a.desc}</div>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* Banner */}
        <div style={{
          background: isBuddy
            ? 'linear-gradient(135deg, rgba(139,92,246,0.2) 0%, rgba(99,102,241,0.15) 100%)'
            : 'linear-gradient(135deg, rgba(99,102,241,0.2) 0%, rgba(59,130,246,0.1) 100%)',
          border: `1px solid ${isBuddy ? 'rgba(139,92,246,0.3)' : 'rgba(99,102,241,0.3)'}`,
          borderRadius: '24px', padding: '2rem',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          flexWrap: 'wrap', gap: '1.5rem', marginBottom: '2rem',
          backdropFilter: 'blur(10px)'
        }}>
          {isBuddy ? (
            <>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '0.5rem' }}>
                  <Award size={16} style={{ color: '#c4b5fd' }} />
                  <span style={{ color: '#c4b5fd', fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Chương trình eKYC</span>
                </div>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'white', marginBottom: '0.4rem' }}>🔒 Xác thực danh tính Buddy ngay!</h3>
                <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.875rem' }}>Tải lên CCCD & ảnh chân dung để tăng độ tin cậy và nhận nhiều đơn hơn.</p>
              </div>
              <Link to='/ekyc'>
                <button id='dashboard-ekyc-btn' style={{ background: 'linear-gradient(135deg, #8b5cf6, #7c3aed)', border: 'none', borderRadius: '12px', padding: '0.875rem 1.5rem', color: 'white', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem', boxShadow: '0 8px 20px rgba(139,92,246,0.35)', whiteSpace: 'nowrap' }}>
                  Bắt đầu eKYC <ArrowRight size={16} />
                </button>
              </Link>
            </>
          ) : (
            <>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '0.5rem' }}>
                  <TrendingUp size={16} style={{ color: '#a5b4fc' }} />
                  <span style={{ color: '#a5b4fc', fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Gợi ý Buddy hôm nay</span>
                </div>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'white', marginBottom: '0.4rem' }}>✈️ Lan Anh – Tour ẩm thực Hà Nội</h3>
                <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.875rem' }}>Khám phá phố cổ và ẩm thực đường phố độc đáo chỉ từ 250K/giờ.</p>
              </div>
              <button id='dashboard-explore-btn' style={{ background: 'linear-gradient(135deg, #6366f1, #4f46e5)', border: 'none', borderRadius: '12px', padding: '0.875rem 1.5rem', color: 'white', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem', boxShadow: '0 8px 20px rgba(99,102,241,0.35)', whiteSpace: 'nowrap' }}>
                Tìm hiểu thêm <ArrowRight size={16} />
              </button>
            </>
          )}
        </div>

        {/* Upcoming trips/schedule - empty state */}
        <div>
          <h2 style={{ fontSize: '1.125rem', fontWeight: 700, color: 'rgba(255,255,255,0.8)', marginBottom: '1.25rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            {isBuddy ? 'Lịch trình dẫn khách sắp tới' : 'Chuyến đi sắp tới'}
          </h2>
          <div style={{
            background: 'rgba(255,255,255,0.03)', border: '1px dashed rgba(255,255,255,0.1)',
            borderRadius: '24px', padding: '4rem 2rem', textAlign: 'center'
          }}>
            {isBuddy ? (
              <>
                <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📅</div>
                <p style={{ color: 'rgba(255,255,255,0.35)', marginBottom: '1.25rem', fontSize: '0.9rem' }}>Bạn chưa nhận lịch dẫn đường nào sắp tới</p>
                <Link to='/buddy-profile'>
                  <button id='dashboard-buddy-schedule' style={{ background: 'rgba(139,92,246,0.2)', border: '1px solid rgba(139,92,246,0.4)', borderRadius: '12px', padding: '0.75rem 1.5rem', color: '#c4b5fd', fontWeight: 600, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem' }}>
                    <Calendar size={16} /> Mở lịch rảnh ngay
                  </button>
                </Link>
              </>
            ) : (
              <>
                <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>✈️</div>
                <p style={{ color: 'rgba(255,255,255,0.35)', marginBottom: '1.25rem', fontSize: '0.9rem' }}>Bạn chưa có chuyến đi nào được lên lịch</p>
                <button id='dashboard-plan-trip' style={{ background: 'rgba(99,102,241,0.2)', border: '1px solid rgba(99,102,241,0.4)', borderRadius: '12px', padding: '0.75rem 1.5rem', color: '#a5b4fc', fontWeight: 600, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem' }}>
                  <Compass size={16} /> Thuê Local Buddy ngay
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
