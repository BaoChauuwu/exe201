import { Link } from 'react-router-dom'
import { useAuthStore } from '../store/authStore'
import Navbar from '../components/layout/Navbar'
import {
  Plane, Map, Users, TrendingUp, Star, Compass,
  ArrowRight, Heart, Bell, Calendar, Award
} from 'lucide-react'

export default function DashboardPage() {
  const { user } = useAuthStore()

  const displayName = user?.name || user?.username || 'Traveler'
  const isBuddy = user?.role === 'buddy'
  const hour = new Date().getHours()
  const greeting = hour < 12 ? 'Chào buổi sáng' : hour < 18 ? 'Chào buổi chiều' : 'Chào buổi tối'

  // Dynamic content based on user role
  const stats = isBuddy
    ? [
        { icon: <Map size={20} />, iconClass: 'feature-icon-blue', value: '0', label: 'Chuyến đã dẫn', id: 'stat-trips' },
        { icon: <Star size={20} />, iconClass: 'feature-icon-amber', value: '5.0', label: 'Đánh giá', id: 'stat-rating' },
        { icon: <TrendingUp size={20} />, iconClass: 'feature-icon-green', value: '0 đ', label: 'Doanh thu', id: 'stat-revenue' },
        { icon: <Bell size={20} />, iconClass: 'feature-icon-purple', value: '0', label: 'Yêu cầu mới', id: 'stat-requests' }
      ]
    : [
        { icon: <Map size={20} />, iconClass: 'feature-icon-blue', value: '0', label: 'Chuyến đi của tôi', id: 'stat-trips' },
        { icon: <Users size={20} />, iconClass: 'feature-icon-purple', value: '0', label: 'Buddy đã thuê', id: 'stat-buddies' },
        { icon: <Heart size={20} />, iconClass: 'feature-icon-pink', value: '0', label: 'Buddy yêu thích', id: 'stat-saved' },
        { icon: <Star size={20} />, iconClass: 'feature-icon-amber', value: '0', label: 'Đánh giá đã viết', id: 'stat-reviews' }
      ]

  const quickActions = isBuddy
    ? [
        { icon: <Calendar size={24} />, label: 'Quản lý lịch rảnh', desc: 'Thiết lập thời gian có thể dẫn tour', color: 'var(--color-primary)', actionId: 'action-schedule' },
        { icon: <Bell size={24} />, label: 'Đơn đặt lịch', desc: 'Xem & xác nhận yêu cầu thuê từ khách', color: '#818cf8', actionId: 'action-bookings' },
        { icon: <TrendingUp size={24} />, label: 'Thống kê thu nhập', desc: 'Theo dõi doanh thu & rút tiền', color: '#10b981', actionId: 'action-wallet' },
        { icon: <Users size={24} />, label: 'Hồ sơ Buddy', desc: 'Cập nhật giới thiệu, ngôn ngữ, chuyên môn', color: '#f59e0b', actionId: 'action-profile' }
      ]
    : [
        { icon: <Compass size={24} />, label: 'Tìm Local Buddy', desc: 'Tìm kiếm hướng dẫn viên bản địa phù hợp', color: 'var(--color-primary)', actionId: 'action-find-buddy' },
        { icon: <Map size={24} />, label: 'Lịch trình của tôi', desc: 'Quản lý và theo dõi các chuyến đi sắp tới', color: '#818cf8', actionId: 'action-my-trips' },
        { icon: <Users size={24} />, label: 'Cộng đồng du lịch', desc: 'Kết nối với du khách & Local Buddy khác', color: '#f59e0b', actionId: 'action-community' },
        { icon: <Star size={24} />, label: 'Đánh giá Local Buddy', desc: 'Chia sẻ nhận xét sau mỗi chuyến đi', color: '#10b981', actionId: 'action-review' }
      ]

  return (
    <div className='dashboard-page'>
      <Navbar />

      <div className='container'>
        {/* Header */}
        <div className='dashboard-header animate-fade-in-up'>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
            <div>
              <p style={{ color: 'var(--color-text-muted)', fontSize: '0.875rem', marginBottom: '0.25rem' }}>
                {greeting} 👋 Bạn tham gia với vai trò <strong style={{ color: isBuddy ? '#8b5cf6' : 'var(--color-primary)' }}>{isBuddy ? 'Local Buddy' : 'Khách du lịch'}</strong>
              </p>
              <h1 className='dashboard-greeting'>
                {greeting}, <span className='gradient-text'>{displayName}!</span>
              </h1>
              <p className='dashboard-subtitle'>
                {isBuddy ? 'Hôm nay bạn sẵn sàng đón khách chứ?' : 'Bạn muốn cùng Local Buddy khám phá thành phố nào hôm nay?'}
              </p>
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
                id={a.actionId}
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

        {/* Dynamic banner */}
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
          {isBuddy ? (
            <>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '0.5rem' }}>
                  <Award size={18} style={{ color: '#8b5cf6' }} />
                  <span style={{ color: '#8b5cf6', fontSize: '0.8rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    Chương trình eKYC & Xác thực
                  </span>
                </div>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 800, marginBottom: '0.5rem' }}>
                  🔒 Xác thực danh tính Local Buddy ngay!
                </h3>
                <p style={{ color: 'var(--color-text-muted)', fontSize: '0.875rem' }}>
                  Tải lên CCCD & ảnh chân dung để được duyệt hồ sơ, tăng độ tin cậy và nhận nhiều đơn đặt lịch hơn.
                </p>
              </div>
              <button className='btn btn-primary' style={{ background: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)', border: 'none' }} id='dashboard-ekyc-btn'>
                Bắt đầu eKYC <ArrowRight size={16} />
              </button>
            </>
          ) : (
            <>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '0.5rem' }}>
                  <TrendingUp size={18} style={{ color: 'var(--color-primary)' }} />
                  <span style={{ color: 'var(--color-primary)', fontSize: '0.8rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    Gợi ý Local Buddy hôm nay
                  </span>
                </div>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 800, marginBottom: '0.5rem' }}>
                  ✈️ Lan Anh – Local Buddy chuyên tour ẩm thực Hà Nội
                </h3>
                <p style={{ color: 'var(--color-text-muted)', fontSize: '0.875rem' }}>
                  Khám phá các ngóc ngách phố cổ và ẩm thực đường phố độc đáo chỉ từ 250K/giờ.
                </p>
              </div>
              <button className='btn btn-primary' id='dashboard-explore-btn'>
                Tìm hiểu thêm <ArrowRight size={16} />
              </button>
            </>
          )}
        </div>

        {/* Dynamic upcoming trips/schedules */}
        <div className='animate-fade-in-up animate-delay-4' style={{ marginBottom: '3rem' }}>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '1.5rem' }}>
            {isBuddy ? 'Lịch trình dẫn khách sắp tới' : 'Chuyến đi sắp tới'}
          </h2>
          <div style={{
            background: 'var(--color-surface)',
            border: '1px dashed var(--color-border)',
            borderRadius: '1.5rem',
            padding: '3rem',
            textAlign: 'center'
          }}>
            {isBuddy ? (
              <>
                <Calendar size={40} style={{ color: 'var(--color-text-faint)', marginBottom: '1rem' }} />
                <p style={{ color: 'var(--color-text-muted)', marginBottom: '1rem' }}>
                  Bạn chưa nhận lịch dẫn đường nào sắp tới
                </p>
                <button className='btn btn-primary btn-sm' style={{ background: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)', border: 'none' }} id='dashboard-buddy-schedule'>
                  <Calendar size={16} /> Mở lịch rảnh ngay
                </button>
              </>
            ) : (
              <>
                <Plane size={40} style={{ color: 'var(--color-text-faint)', marginBottom: '1rem' }} />
                <p style={{ color: 'var(--color-text-muted)', marginBottom: '1rem' }}>
                  Bạn chưa có chuyến đi nào được lên lịch với Local Buddy
                </p>
                <button className='btn btn-primary btn-sm' id='dashboard-plan-trip'>
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
