import { useState, useEffect } from 'react'
import Navbar from '../components/layout/Navbar'
import { bookingApi, type IBooking } from '../api/booking.api'
import { useAuthStore } from '../store/authStore'
import { 
  Calendar, Clock, Users, MessageCircle, 
  CheckCircle, ArrowRight, Compass 
} from 'lucide-react'
import { Link } from 'react-router-dom'
import toast from 'react-hot-toast'

export const MyTrips = () => {
  const { user, accessToken } = useAuthStore()
  const [trips, setTrips] = useState<IBooking[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchTrips = async () => {
      if (!user?._id) return
      try {
        setLoading(true)
        let res
        if (user.role === 'buddy') {
          res = await bookingApi.getBuddyBookings(user._id)
        } else {
          res = await bookingApi.getTouristBookings(user._id)
        }
        setTrips(res.data.result || [])
      } catch (err: any) {
        toast.error(err.response?.data?.message || 'Không thể tải danh sách chuyến đi.')
      } finally {
        setLoading(false)
      }
    }

    if (accessToken && user) {
      fetchTrips()
    }
  }, [accessToken, user])

  const isBuddy = user?.role === 'buddy'

  return (
    <div
      style={{
        minHeight: '100vh',
        background: 'var(--color-bg)',
        fontFamily: "'Inter', -apple-system, sans-serif",
        color: 'var(--color-text)'
      }}
    >
      <Navbar />

      <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '3.5rem 1.5rem' }}>
        {/* Title Section */}
        <div style={{ marginBottom: '2.5rem' }}>
          <h1 style={{ fontSize: '2.25rem', fontWeight: 900, margin: 0, letterSpacing: '-0.025em' }}>
            ✈️ Chuyến đi của tôi
          </h1>
          <p style={{ color: 'var(--color-text-muted)', fontSize: '0.95rem', marginTop: '6px' }}>
            {isBuddy 
              ? 'Lịch sử và danh sách các tour dẫn khách đã thanh toán thành công.' 
              : 'Theo dõi hành trình khám phá và kết nối của bạn cùng các Buddy.'}
          </p>
        </div>

        {/* Loading state */}
        {loading ? (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '300px', flexDirection: 'column', gap: '1rem' }}>
            <div 
              style={{ 
                width: '44px', 
                height: '44px', 
                border: '3px solid rgba(14,165,233,0.15)', 
                borderTopColor: 'var(--color-primary)', 
                borderRadius: '50%', 
                animation: 'spin 0.8s linear infinite' 
              }} 
            />
            <span style={{ fontSize: '0.9rem', color: 'var(--color-text-muted)' }}>Đang tải danh sách chuyến đi...</span>
          </div>
        ) : trips.length === 0 ? (
          /* Empty state */
          <div 
            style={{ 
              textAlign: 'center', 
              padding: '6rem 2rem', 
              background: '#ffffff', 
              borderRadius: '28px', 
              border: '1px solid var(--color-border)', 
              boxShadow: '0 10px 30px rgba(0,0,0,0.015)' 
            }}
          >
            <div style={{ fontSize: '3.5rem', marginBottom: '1.25rem' }}>🗺️</div>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--color-text)', margin: '0 0 0.5rem' }}>
              Chưa có chuyến đi nào
            </h3>
            <p style={{ fontSize: '0.95rem', color: 'var(--color-text-muted)', margin: '0 0 2rem', maxWidth: '420px', marginInline: 'auto', lineHeight: 1.5 }}>
              {isBuddy 
                ? 'Hiện chưa có khách hàng nào đặt tour của bạn. Hãy cập nhật lịch bận và chia sẻ hồ sơ để thu hút khách nhé!' 
                : 'Bạn chưa có chuyến đi nào đã thanh toán thành công. Hãy khám phá và đặt tour trải nghiệm ngay hôm nay!'}
            </p>
            {!isBuddy && (
              <Link 
                to="/" 
                style={{ 
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '0.8rem 1.75rem', 
                  background: 'var(--gradient-primary)', 
                  color: 'white', 
                  borderRadius: '14px', 
                  textDecoration: 'none', 
                  fontWeight: 700, 
                  boxShadow: '0 4px 15px rgba(2,132,199,0.25)' 
                }}
              >
                Khám phá các Tour <ArrowRight size={16} />
              </Link>
            )}
          </div>
        ) : (
          /* Cards Grid */
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(460px, 1fr))', gap: '1.5rem' }}>
            {trips.map(trip => {
              const partner = isBuddy ? trip.touristId : trip.buddyId
              const experience = trip.experienceId

              return (
                <div 
                  key={trip._id} 
                  style={{ 
                    background: '#ffffff', 
                    border: '1px solid var(--color-border)', 
                    borderRadius: '24px', 
                    overflow: 'hidden', 
                    boxShadow: '0 8px 24px rgba(0, 0, 0, 0.02)',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    transition: 'transform 0.2s, box-shadow 0.2s'
                  }}
                  onMouseEnter={e => {
                    const card = e.currentTarget as HTMLElement
                    card.style.transform = 'translateY(-4px)'
                    card.style.boxShadow = '0 12px 30px rgba(14, 165, 233, 0.05)'
                  }}
                  onMouseLeave={e => {
                    const card = e.currentTarget as HTMLElement
                    card.style.transform = 'translateY(0)'
                    card.style.boxShadow = '0 8px 24px rgba(0, 0, 0, 0.02)'
                  }}
                >
                  <div>
                    {/* Header: Badge & Code */}
                    <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid var(--color-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--color-text-faint)', background: '#f1f5f9', padding: '4px 10px', borderRadius: '8px', fontFamily: 'monospace' }}>
                        {trip.bookingCode}
                      </span>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '4px', background: '#d1fae5', color: '#059669', padding: '4px 12px', borderRadius: '999px', fontSize: '0.72rem', fontWeight: 800 }}>
                        <CheckCircle size={12} /> Đã xác nhận
                      </span>
                    </div>

                    {/* Content Body */}
                    <div style={{ padding: '1.5rem' }}>
                      <h3 style={{ margin: '0 0 1rem', fontSize: '1.2rem', fontWeight: 800, color: 'var(--color-text)', lineHeight: 1.4 }}>
                        {experience?.title || 'Tour Trải Nghiệm Bản Địa'}
                      </h3>

                      {/* Tour Details Grid */}
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>
                          <Calendar size={15} style={{ color: 'var(--color-primary)' }} />
                          <span>{new Date(trip.scheduledDate).toLocaleDateString('vi-VN')}</span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>
                          <Clock size={15} style={{ color: '#8b5cf6' }} />
                          <span>{trip.startTime} ({trip.hours}h)</span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>
                          <Users size={15} style={{ color: '#ec4899' }} />
                          <span>{trip.groupSize} người</span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>
                          <span style={{ fontSize: '1.1rem' }}>💰</span>
                          <span style={{ fontWeight: 700, color: isBuddy ? '#059669' : 'var(--color-primary)' }}>
                            {(isBuddy ? trip.buddyEarning : trip.totalPrice).toLocaleString()} ₫
                          </span>
                        </div>
                      </div>

                      {/* Partner Card */}
                      {partner && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', background: '#f8fafc', padding: '12px 16px', borderRadius: '16px', border: '1px solid var(--color-border)' }}>
                          <div style={{ width: '40px', height: '40px', borderRadius: '50%', overflow: 'hidden', border: '1.5px solid rgba(14, 165, 233, 0.15)', flexShrink: 0 }}>
                            <img 
                              src={partner.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(partner.name || 'U')}&background=0ea5e9&color=fff`} 
                              alt="partner-avatar" 
                              style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                            />
                          </div>
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ fontSize: '0.72rem', color: 'var(--color-text-faint)', textTransform: 'uppercase', fontWeight: 700, letterSpacing: '0.05em' }}>
                              {isBuddy ? 'Khách du lịch' : 'Local Buddy hướng dẫn'}
                            </div>
                            <div style={{ fontSize: '0.88rem', fontWeight: 800, color: 'var(--color-text)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                              {partner.name}
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Actions Footer */}
                  <div style={{ padding: '0 1.5rem 1.5rem', display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
                    {isBuddy ? (
                      /* Buddy actions */
                      <>
                        <Link to={`/chat/${partner?._id}`} style={{ textDecoration: 'none', flex: 1 }}>
                          <button 
                            style={{ 
                              width: '100%',
                              padding: '0.65rem 1rem', 
                              background: 'white', 
                              border: '1px solid var(--color-border)', 
                              borderRadius: '12px', 
                              fontSize: '0.82rem', 
                              fontWeight: 700, 
                              cursor: 'pointer', 
                              display: 'flex', 
                              alignItems: 'center', 
                              justifyContent: 'center',
                              gap: '6px', 
                              color: 'var(--color-text)' 
                            }}
                          >
                            <MessageCircle size={15} style={{ color: 'var(--color-primary)' }} /> Nhắn tin khách
                          </button>
                        </Link>
                        <Link to={`/my-bookings`} style={{ textDecoration: 'none', flex: 1 }}>
                          <button 
                            style={{ 
                              width: '100%',
                              padding: '0.65rem 1rem', 
                              background: 'var(--gradient-primary)', 
                              border: 'none', 
                              borderRadius: '12px', 
                              fontSize: '0.82rem', 
                              fontWeight: 700, 
                              color: 'white', 
                              cursor: 'pointer', 
                              display: 'flex', 
                              alignItems: 'center', 
                              justifyContent: 'center',
                              gap: '4px',
                              boxShadow: '0 4px 12px rgba(2,132,199,0.2)' 
                            }}
                          >
                            Chi tiết lịch đặt <Compass size={15} />
                          </button>
                        </Link>
                      </>
                    ) : (
                      /* Tourist actions */
                      <>
                        <Link to={`/chat/${partner?._id}`} style={{ textDecoration: 'none', flex: 1 }}>
                          <button 
                            style={{ 
                              width: '100%',
                              padding: '0.65rem 1rem', 
                              background: 'white', 
                              border: '1px solid var(--color-border)', 
                              borderRadius: '12px', 
                              fontSize: '0.82rem', 
                              fontWeight: 700, 
                              cursor: 'pointer', 
                              display: 'flex', 
                              alignItems: 'center', 
                              justifyContent: 'center',
                              gap: '6px', 
                              color: 'var(--color-text)' 
                            }}
                          >
                            <MessageCircle size={15} style={{ color: 'var(--color-primary)' }} /> Liên hệ Buddy
                          </button>
                        </Link>
                        <Link to={`/my-bookings`} style={{ textDecoration: 'none', flex: 1 }}>
                          <button 
                            style={{ 
                              width: '100%',
                              padding: '0.65rem 1rem', 
                              background: 'var(--gradient-primary)', 
                              border: 'none', 
                              borderRadius: '12px', 
                              fontSize: '0.82rem', 
                              fontWeight: 700, 
                              color: 'white', 
                              cursor: 'pointer', 
                              display: 'flex', 
                              alignItems: 'center', 
                              justifyContent: 'center',
                              gap: '4px',
                              boxShadow: '0 4px 12px rgba(2,132,199,0.2)' 
                            }}
                          >
                            Chi tiết vé <Compass size={15} />
                          </button>
                        </Link>
                      </>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg) } }
      `}</style>
    </div>
  )
}

export default MyTrips
