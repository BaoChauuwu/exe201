import { useState, useEffect } from 'react';
import Navbar from '../components/layout/Navbar';
import { bookingApi, type IBooking } from '../api/booking.api';
import { useAuthStore } from '../store/authStore';
import axios from 'axios';
import { 
  Calendar, Clock, Users, CheckCircle2, 
  ChevronDown, ChevronUp, MessageCircle, 
  AlertTriangle, Shield, CreditCard, Landmark, X 
} from 'lucide-react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';

export const MyBookingsPage = () => {
  const { accessToken, user } = useAuthStore();

  const [bookings, setBookings] = useState<IBooking[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'upcoming' | 'completed' | 'cancelled'>('upcoming');
  const [expandedId, setExpandedId] = useState<string | null>(null);

  // States cho modal thanh toán lại
  const [isPayModalOpen, setIsPayModalOpen] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState<IBooking | null>(null);
  const [paymentMethod, setPaymentMethod] = useState('VNPay');
  const [paymentLoading, setPaymentLoading] = useState(false);
  const [touristWalletBalance, setTouristWalletBalance] = useState(0);

  useEffect(() => {
    if (isPayModalOpen && accessToken) {
      axios.get('http://localhost:3000/users/me', {
        headers: { Authorization: `Bearer ${accessToken}` }
      })
      .then(res => {
        if (res.data.result) {
          setTouristWalletBalance(res.data.result.walletBalance || 0);
        }
      })
      .catch(console.error);
    }
  }, [isPayModalOpen, accessToken]);

  const checkIsTourCompleted = (booking: IBooking) => {
    const tourEndTime = new Date(booking.scheduledDate);
    const [startHour, startMin] = booking.startTime.split(':').map(Number);
    tourEndTime.setHours(startHour, startMin, 0, 0);
    tourEndTime.setHours(tourEndTime.getHours() + booking.hours);
    return new Date() >= tourEndTime;
  };

  const getTourEndTimeFormatted = (booking: IBooking) => {
    const tourEndTime = new Date(booking.scheduledDate);
    const [startHour, startMin] = booking.startTime.split(':').map(Number);
    tourEndTime.setHours(startHour, startMin, 0, 0);
    tourEndTime.setHours(tourEndTime.getHours() + booking.hours);
    return tourEndTime.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }) + ' ngày ' + tourEndTime.toLocaleDateString('vi-VN');
  };

  // States cho modal hủy lịch
  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
  const [cancelBookingItem, setCancelBookingItem] = useState<IBooking | null>(null);
  const [cancelReason, setCancelReason] = useState('');
  const [cancelLoading, setCancelLoading] = useState(false);

  const fetchBookings = async () => {
    try {
      const res = await bookingApi.getMyBookings();
      setBookings(res.data.result || []);
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Không thể tải danh sách đặt lịch.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (accessToken) {
      fetchBookings();
    } else {
      setLoading(false);
    }
  }, [accessToken]);

  // Bộ lọc theo tab
  const filteredBookings = bookings.filter(b => {
    if (activeTab === 'upcoming') {
      return ['pending', 'confirmed', 'ongoing'].includes(b.status);
    } else if (activeTab === 'completed') {
      return b.status === 'completed';
    } else {
      return b.status === 'cancelled';
    }
  });

  // Xác nhận hoàn thành (Buddy giải ngân)
  const handleComplete = async (bookingId: string) => {
    if (!window.confirm('Bạn có chắc chắn muốn xác nhận hoàn thành chuyến đi này không? Hệ thống sẽ giải ngân thu nhập trực tiếp vào Ví khả dụng của bạn.')) return;
    
    try {
      await bookingApi.complete(bookingId);
      toast.success('Đã xác nhận hoàn thành chuyến đi thành công! Thu nhập khả dụng đã được cộng vào Ví của bạn.');
      fetchBookings();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Thao tác thất bại.');
    }
  };

  // Mở modal thanh toán lại
  const openPayModal = (booking: IBooking) => {
    setSelectedBooking(booking);
    setIsPayModalOpen(true);
  };

  // Tiến hành thanh toán lại
  const handleProcessPayment = async () => {
    if (!selectedBooking) return;
    setPaymentLoading(true);
    try {
      if (paymentMethod === 'Wallet') {
        await bookingApi.payWithWallet(selectedBooking._id);
      } else {
        await bookingApi.pay(selectedBooking._id, paymentMethod);
      }
      toast.success('Thanh toán thành công! Chuyến đi đã sẵn sàng khởi hành 🎉');
      setIsPayModalOpen(false);
      fetchBookings();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Thanh toán thất bại.');
    } finally {
      setPaymentLoading(false);
    }
  };

  // Mở modal hủy tour
  const openCancelModal = (booking: IBooking) => {
    setCancelBookingItem(booking);
    setCancelReason('');
    setIsCancelModalOpen(true);
  };

  // Tiến hành hủy tour
  const handleProcessCancel = async () => {
    if (!cancelBookingItem) return;
    if (!cancelReason.trim()) {
      toast.error('Vui lòng nhập lý do hủy chuyến đi.');
      return;
    }

    setCancelLoading(true);
    try {
      await bookingApi.cancel(cancelBookingItem._id, cancelReason);
      toast.success('Đã hủy chuyến đi thành công.');
      setIsCancelModalOpen(false);
      fetchBookings();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Không thể hủy chuyến đi.');
    } finally {
      setCancelLoading(false);
    }
  };

  const getStatusConfig = (status: string, paymentStatus: string) => {
    if (status === 'cancelled') {
      return { bg: '#fee2e2', color: '#dc2626', label: 'Đã hủy' };
    }
    if (status === 'completed') {
      return { bg: '#f3f4f6', color: '#4b5563', label: 'Hoàn thành' };
    }
    if (status === 'ongoing') {
      return { bg: '#fef3c7', color: '#d97706', label: 'Đang diễn ra' };
    }
    if (paymentStatus === 'unpaid') {
      return { bg: '#ffedd5', color: '#ea580c', label: 'Chờ thanh toán' };
    }
    return { bg: '#d1fae5', color: '#059669', label: 'Đã thanh toán (Sắp đi)' };
  };

  // Trợ giúp xem thông tin đối tác
  const isBuddy = user?.role === 'buddy';

  return (
    <div style={{ minHeight: '100vh', background: 'var(--color-bg)', fontFamily: "'Inter', -apple-system, sans-serif", color: 'var(--color-text)' }}>
      <Navbar />

      <div style={{ maxWidth: '900px', margin: '0 auto', padding: '3.5rem 1.5rem' }}>
        
        {/* Title & Stats */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2.5rem' }}>
          <div>
            <h1 style={{ fontSize: '2rem', fontWeight: 900, margin: 0, letterSpacing: '-0.025em' }}>Lịch Trình Đặt Tour</h1>
            <p style={{ color: 'var(--color-text-muted)', fontSize: '0.9rem', margin: '4px 0 0' }}>
              {isBuddy ? 'Quản lý lịch dẫn khách và xác nhận thu nhập' : 'Theo dõi trạng thái và lịch trình khám phá của bạn'}
            </p>
          </div>
        </div>

        {/* Tabs Control */}
        <div style={{ display: 'flex', borderBottom: '1px solid var(--color-border)', marginBottom: '2rem', gap: '1.5rem' }}>
          {[
            { id: 'upcoming', label: 'Sắp diễn ra' },
            { id: 'completed', label: 'Đã hoàn thành' },
            { id: 'cancelled', label: 'Đã hủy' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => { setActiveTab(tab.id as any); setExpandedId(null); }}
              style={{
                background: 'transparent', border: 'none', padding: '0.75rem 0.5rem',
                fontSize: '0.95rem', fontWeight: activeTab === tab.id ? 800 : 500,
                color: activeTab === tab.id ? 'var(--color-primary)' : 'var(--color-text-muted)',
                borderBottom: `3px solid ${activeTab === tab.id ? 'var(--color-primary)' : 'transparent'}`,
                cursor: 'pointer', transition: 'all 0.2s', marginBottom: '-2px'
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Main List */}
        {loading ? (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '200px', flexDirection: 'column', gap: '1rem' }}>
            <div style={{ width: '40px', height: '40px', border: '3px solid rgba(14,165,233,0.15)', borderTopColor: 'var(--color-primary)', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
            <span style={{ fontSize: '0.88rem', color: 'var(--color-text-muted)' }}>Đang tải lịch trình...</span>
          </div>
        ) : filteredBookings.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '5rem 2rem', background: '#ffffff', borderRadius: '24px', border: '1px solid var(--color-border)', boxShadow: '0 4px 12px rgba(0,0,0,0.02)' }}>
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🗺️</div>
            <p style={{ fontSize: '1.05rem', color: 'var(--color-text-muted)', margin: '0 0 1.5rem' }}>
              Bạn không có chuyến đi nào trong danh mục này.
            </p>
            {!isBuddy && activeTab === 'upcoming' && (
              <Link to="/" style={{ padding: '0.75rem 1.5rem', background: 'var(--gradient-primary)', color: 'white', borderRadius: '12px', textDecoration: 'none', fontWeight: 700, boxShadow: '0 4px 15px rgba(2,132,199,0.2)' }}>
                Khám phá các Tour ngay
              </Link>
            )}
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            {filteredBookings.map(booking => {
              const statusCfg = getStatusConfig(booking.status, booking.paymentStatus);
              const isExpanded = expandedId === booking._id;
              
              // Đối tác liên kết (Tourist thấy Buddy, Buddy thấy Tourist)
              const partner = isBuddy ? booking.touristId : booking.buddyId;
              const experience = booking.experienceId;
              const hasPaid = booking.paymentStatus === 'paid';

              return (
                <div key={booking._id} style={{ background: '#ffffff', border: '1px solid var(--color-border)', borderRadius: '24px', overflow: 'hidden', boxShadow: '0 4px 16px rgba(14,165,233,0.02)' }}>
                  
                  {/* Card Header (Click to expand details) */}
                  <div 
                    onClick={() => setExpandedId(isExpanded ? null : booking._id)}
                    style={{ padding: '1.5rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem', flexWrap: 'wrap' }}
                  >
                    <div style={{ flex: 1, minWidth: '260px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.6rem', flexWrap: 'wrap' }}>
                        <span style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--color-text-faint)', background: '#f1f5f9', padding: '3px 8px', borderRadius: '6px', fontFamily: 'monospace' }}>
                          {booking.bookingCode}
                        </span>
                        <span style={{ background: statusCfg.bg, color: statusCfg.color, padding: '3px 10px', borderRadius: '999px', fontSize: '0.75rem', fontWeight: 800 }}>
                          {statusCfg.label}
                        </span>
                      </div>
                      
                      <h3 style={{ margin: '0 0 0.75rem', fontSize: '1.15rem', fontWeight: 800, color: 'var(--color-text)' }}>
                        {experience?.title || 'Tour Trải Nghiệm Bản Địa'}
                      </h3>

                      <div style={{ display: 'flex', gap: '1.25rem', color: 'var(--color-text-muted)', fontSize: '0.85rem', flexWrap: 'wrap' }}>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><Calendar size={14} style={{ color: 'var(--color-primary)' }} /> {new Date(booking.scheduledDate).toLocaleDateString('vi-VN')}</span>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><Clock size={14} style={{ color: '#8b5cf6' }} /> {booking.startTime} ({booking.hours}h)</span>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><Users size={14} style={{ color: '#ec4899' }} /> {booking.groupSize} người</span>
                      </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
                      <div style={{ textAlign: 'right' }}>
                        <div style={{ fontSize: '0.7rem', color: 'var(--color-text-faint)', textTransform: 'uppercase', fontWeight: 700, letterSpacing: '0.05em' }}>
                          {isBuddy ? 'Thu nhập của bạn' : 'Tổng chi phí'}
                        </div>
                        <div style={{ fontSize: '1.2rem', fontWeight: 900, color: isBuddy ? '#059669' : 'var(--color-primary)' }}>
                          {(isBuddy ? booking.buddyEarning : booking.totalPrice).toLocaleString()} ₫
                        </div>
                      </div>
                      <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: '#f8fafc', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-text-muted)' }}>
                        {isExpanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                      </div>
                    </div>
                  </div>

                  {/* Expanded Detail Panel */}
                  {isExpanded && (
                    <div style={{ borderTop: '1px solid var(--color-border)', background: '#fafbfc', padding: '1.5rem' }}>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', alignItems: 'start', flexWrap: 'wrap', width: '100%' }}>
                        
                        {/* Cột 1: Thông tin đối tác & Điểm hẹn */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                          
                          {/* Đối tác */}
                          <div>
                            <h4 style={{ margin: '0 0 0.75rem', fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--color-text-faint)', letterSpacing: '0.07em', fontWeight: 700 }}>
                              {isBuddy ? 'Khách du lịch (Tourist)' : 'Local Buddy hướng dẫn'}
                            </h4>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                              <div style={{ width: '48px', height: '48px', borderRadius: '50%', overflow: 'hidden', border: '1.5px solid rgba(14,165,233,0.15)' }}>
                                <img src={partner?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(partner?.name || 'U')}&background=0ea5e9&color=fff`} alt="avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                              </div>
                              <div>
                                <div style={{ fontWeight: 800, fontSize: '0.92rem' }}>{partner?.name || 'Thành viên UniTravel'}</div>
                                <div style={{ fontSize: '0.78rem', color: 'var(--color-text-muted)' }}>{partner?.email}</div>
                              </div>
                            </div>
                          </div>

                          {/* Meeting point map */}
                          {booking.meetingPoint?.coordinates?.length === 2 && (() => {
                            const lon = booking.meetingPoint.coordinates[0];
                            const lat = booking.meetingPoint.coordinates[1];
                            const delta = 0.002;
                            const osmUrl = `https://www.openstreetmap.org/export/embed.html?bbox=${lon - delta},${lat - delta},${lon + delta},${lat + delta}&layer=mapnik&marker=${lat},${lon}`;
                            return (
                              <div>
                                <h4 style={{ margin: '0 0 0.5rem', fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--color-text-faint)', letterSpacing: '0.07em', fontWeight: 700 }}>Điểm hẹn gặp mặt</h4>
                                <div style={{ height: '140px', borderRadius: '12px', overflow: 'hidden', border: '1px solid var(--color-border)' }}>
                                  <iframe title="booking-map" width="100%" height="100%" style={{ border: 0 }} src={osmUrl} />
                                </div>
                              </div>
                            );
                          })()}

                        </div>

                        {/* Cột 2: Tài chính & Nút hành động */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', height: '100%', justifyContent: 'space-between' }}>
                          
                          {/* Bảng chi tiết dòng tiền */}
                          <div>
                            <h4 style={{ margin: '0 0 0.75rem', fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--color-text-faint)', letterSpacing: '0.07em', fontWeight: 700 }}>Thông tin giao dịch</h4>
                            <div style={{ background: '#ffffff', border: '1px solid var(--color-border)', borderRadius: '14px', padding: '0.85rem 1rem', fontSize: '0.8rem', display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                <span style={{ color: 'var(--color-text-muted)' }}>Mức giá đặt chỗ:</span>
                                <span>{booking.pricePerHourSnapshot.toLocaleString()} ₫/giờ</span>
                              </div>
                              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                <span style={{ color: 'var(--color-text-muted)' }}>Thời gian đặt:</span>
                                <span>{booking.hours} giờ</span>
                              </div>
                              {isBuddy ? (
                                <>
                                  <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px dashed var(--color-border)', paddingTop: '0.4rem', marginTop: '0.2rem' }}>
                                    <span style={{ color: 'var(--color-text-muted)' }}>Tổng khách trả:</span>
                                    <span>{booking.totalPrice.toLocaleString()} ₫</span>
                                  </div>
                                  <div style={{ display: 'flex', justifyContent: 'space-between', color: '#ef4444' }}>
                                    <span>Phí hoa hồng OTA (15%):</span>
                                    <span>-{booking.commissionAmount.toLocaleString()} ₫</span>
                                  </div>
                                  <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 800, fontSize: '0.9rem', color: '#059669' }}>
                                    <span>Thu nhập thực nhận:</span>
                                    <span>{booking.buddyEarning.toLocaleString()} ₫</span>
                                  </div>
                                </>
                              ) : (
                                <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 800, fontSize: '0.9rem', borderTop: '1px dashed var(--color-border)', paddingTop: '0.4rem', marginTop: '0.2rem', color: 'var(--color-primary)' }}>
                                  <span>Tổng tiền đã trả:</span>
                                  <span>{booking.totalPrice.toLocaleString()} ₫</span>
                                </div>
                              )}
                              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--color-text-faint)', marginTop: '0.2rem' }}>
                                <span>Thanh toán qua:</span>
                                <span>{booking.paymentMethod || 'Chưa thanh toán'}</span>
                              </div>
                            </div>
                          </div>

                          {/* Nhóm Nút Hành động */}
                          <div style={{ display: 'flex', gap: '0.6rem', justifyContent: 'flex-end', flexWrap: 'wrap' }}>
                            
                            {/* Nút Chat */}
                            {partner && (
                              <Link to={`/chat/${partner._id}`} style={{ textDecoration: 'none' }}>
                                <button style={{ padding: '0.55rem 1rem', background: '#f1f5f9', border: '1px solid var(--color-border)', borderRadius: '10px', fontSize: '0.8rem', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px', color: 'var(--color-text)' }}>
                                  <MessageCircle size={14} /> Nhắn tin
                                </button>
                              </Link>
                            )}

                            {/* [TOURIST ONLY] - Thanh toán lại nếu unpaid */}
                            {!isBuddy && !hasPaid && booking.status === 'pending' && (
                              <button 
                                onClick={() => openPayModal(booking)}
                                style={{ padding: '0.55rem 1rem', background: 'var(--gradient-primary)', border: 'none', borderRadius: '10px', fontSize: '0.8rem', fontWeight: 700, color: 'white', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px', boxShadow: '0 4px 12px rgba(2,132,199,0.2)' }}
                              >
                                <CreditCard size={14} /> Thanh toán ngay
                              </button>
                            )}

                            {/* [BUDDY ONLY] - Hoàn thành chuyến đi */}
                            {isBuddy && hasPaid && ['confirmed', 'ongoing'].includes(booking.status) && (() => {
                              const ended = checkIsTourCompleted(booking);
                              return (
                                <button 
                                  onClick={() => ended ? handleComplete(booking._id) : toast.error(`Chuyến đi chưa kết thúc. Chỉ có thể xác nhận hoàn thành sau ${getTourEndTimeFormatted(booking)}`)}
                                  disabled={!ended}
                                  style={{ 
                                    padding: '0.55rem 1.25rem', 
                                    background: ended ? 'linear-gradient(135deg, #10b981, #059669)' : '#e2e8f0', 
                                    border: 'none', 
                                    borderRadius: '10px', 
                                    fontSize: '0.8rem', 
                                    fontWeight: 700, 
                                    color: ended ? 'white' : '#94a3b8', 
                                    cursor: ended ? 'pointer' : 'not-allowed', 
                                    display: 'flex', 
                                    alignItems: 'center', 
                                    gap: '4px', 
                                    boxShadow: ended ? '0 4px 12px rgba(16,185,129,0.2)' : 'none' 
                                  }}
                                  title={ended ? 'Xác nhận hoàn thành chuyến đi' : `Chỉ có thể xác nhận sau ${getTourEndTimeFormatted(booking)}`}
                                >
                                  <CheckCircle2 size={14} /> {ended ? 'Xác nhận Hoàn thành' : 'Chưa kết thúc'}
                                </button>
                              );
                            })()}

                            {/* Nút Hủy tour (Tourist hoặc Buddy hủy nếu tour chưa khởi hành) */}
                            {['pending', 'confirmed'].includes(booking.status) && (
                              <button 
                                onClick={() => openCancelModal(booking)}
                                style={{ padding: '0.55rem 1rem', background: 'transparent', border: '1px solid rgba(239, 68, 68, 0.4)', borderRadius: '10px', fontSize: '0.8rem', fontWeight: 700, color: '#ef4444', cursor: 'pointer', transition: 'all 0.2s' }}
                                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(239,68,68,0.05)' }}
                                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'transparent' }}
                              >
                                Hủy chuyến đi
                              </button>
                            )}

                          </div>

                        </div>

                      </div>
                    </div>
                  )}

                </div>
              );
            })}
          </div>
        )}

      </div>

      {/* ── MODAL THANH TOÁN LẠI (VNPAY/MOMO) ── */}
      {isPayModalOpen && selectedBooking && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(15, 23, 42, 0.75)', backdropFilter: 'blur(8px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          zIndex: 9999, padding: '1rem', boxSizing: 'border-box'
        }}>
          <div style={{
            background: '#ffffff', borderRadius: '24px', width: '100%', maxWidth: '440px',
            padding: '2rem', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
            border: '1px solid rgba(14, 165, 233, 0.15)', position: 'relative', boxSizing: 'border-box'
          }}>
            
            <button 
              onClick={() => setIsPayModalOpen(false)}
              style={{ position: 'absolute', top: '1.25rem', right: '1.25rem', background: 'rgba(0,0,0,0.05)', border: 'none', borderRadius: '50%', width: '30px', height: '30px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
            >
              <X size={15} />
            </button>

            <div style={{ textAlign: 'center', marginBottom: '1.25rem' }}>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 800, margin: 0 }}>Thanh Toán Đặt Lịch</h3>
              <p style={{ color: 'var(--color-text-muted)', fontSize: '0.8rem', margin: '4px 0 0' }}>Mã thanh toán: {selectedBooking.bookingCode}</p>
            </div>

            <div style={{ background: '#f8fafc', borderRadius: '16px', padding: '1rem', border: '1px solid var(--color-border)', marginBottom: '1.25rem', fontSize: '0.85rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 800, fontSize: '0.95rem' }}>
                <span>Tổng tiền thanh toán:</span>
                <span style={{ color: 'var(--color-primary)' }}>{selectedBooking.totalPrice.toLocaleString()} ₫</span>
              </div>
            </div>

            <div style={{ marginBottom: '1.25rem' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.75rem', borderRadius: '10px', border: `1.5px solid ${paymentMethod === 'VNPay' ? 'var(--color-primary)' : 'var(--color-border)'}`, background: paymentMethod === 'VNPay' ? 'rgba(14, 165, 233, 0.03)' : 'white', cursor: 'pointer' }}>
                  <input type='radio' checked={paymentMethod === 'VNPay'} onChange={() => setPaymentMethod('VNPay')} style={{ display: 'none' }} />
                  <Landmark size={16} style={{ color: '#0ea5e9' }} />
                  <span style={{ fontSize: '0.85rem', fontWeight: 700 }}>Thẻ nội địa / Ví VNPay</span>
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.75rem', borderRadius: '10px', border: `1.5px solid ${paymentMethod === 'MoMo' ? '#a21caf' : 'var(--color-border)'}`, background: paymentMethod === 'MoMo' ? 'rgba(162, 28, 175, 0.03)' : 'white', cursor: 'pointer' }}>
                  <input type='radio' checked={paymentMethod === 'MoMo'} onChange={() => setPaymentMethod('MoMo')} style={{ display: 'none' }} />
                  <CreditCard size={16} style={{ color: '#a21caf' }} />
                  <span style={{ fontSize: '0.85rem', fontWeight: 700 }}>Ví Điện Tử MoMo</span>
                </label>
                <label style={{ 
                  display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.75rem', borderRadius: '10px', 
                  border: `1.5px solid ${paymentMethod === 'Wallet' ? 'var(--color-primary)' : 'var(--color-border)'}`, 
                  background: paymentMethod === 'Wallet' ? 'rgba(14, 165, 233, 0.03)' : 'white', 
                  cursor: touristWalletBalance < selectedBooking.totalPrice ? 'not-allowed' : 'pointer',
                  opacity: touristWalletBalance < selectedBooking.totalPrice ? 0.6 : 1
                }}>
                  <input type='radio' checked={paymentMethod === 'Wallet'} disabled={touristWalletBalance < selectedBooking.totalPrice} onChange={() => setPaymentMethod('Wallet')} style={{ display: 'none' }} />
                  <span style={{ fontSize: '1rem' }}>💼</span>
                  <span style={{ fontSize: '0.85rem', fontWeight: 700, flex: 1 }}>Ví điện tử UniTravel (Số dư: {touristWalletBalance.toLocaleString()} ₫)</span>
                </label>
              </div>
            </div>

            <button
              onClick={handleProcessPayment}
              disabled={paymentLoading}
              style={{ width: '100%', padding: '0.85rem', background: 'var(--gradient-primary)', border: 'none', borderRadius: '12px', color: 'white', fontWeight: 800, fontSize: '0.95rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}
            >
              {paymentLoading ? 'Đang kết nối...' : 'Xác nhận Thanh toán'}
            </button>

          </div>
        </div>
      )}

      {/* ── MODAL HỦY CHUYẾN ĐI (Strict 24h Warning) ── */}
      {isCancelModalOpen && cancelBookingItem && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(15, 23, 42, 0.75)', backdropFilter: 'blur(8px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          zIndex: 9999, padding: '1rem', boxSizing: 'border-box'
        }}>
          <div style={{
            background: '#ffffff', borderRadius: '24px', width: '100%', maxWidth: '460px',
            padding: '2rem', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
            border: '1px solid rgba(239, 68, 68, 0.2)', position: 'relative', boxSizing: 'border-box'
          }}>
            
            <button 
              onClick={() => setIsCancelModalOpen(false)}
              style={{ position: 'absolute', top: '1.25rem', right: '1.25rem', background: 'rgba(0,0,0,0.05)', border: 'none', borderRadius: '50%', width: '30px', height: '30px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
            >
              <X size={15} />
            </button>

            <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
              <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: 'rgba(239, 68, 68, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#ef4444', margin: '0 auto 0.75rem' }}>
                <AlertTriangle size={24} />
              </div>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 800, margin: 0, color: '#ef4444' }}>Chính Sách Hủy Đặt Lịch</h3>
              <p style={{ color: 'var(--color-text-muted)', fontSize: '0.8rem', margin: '4px 0 0' }}>Mã đặt: {cancelBookingItem.bookingCode}</p>
            </div>

            {/* Điều khoản cảnh báo */}
            {(() => {
              const tourStart = new Date(cancelBookingItem.scheduledDate);
              const [h, m] = cancelBookingItem.startTime.split(':').map(Number);
              tourStart.setHours(h, m, 0, 0);
              const diff = (tourStart.getTime() - Date.now()) / (1000 * 60 * 60);
              const isPaid = cancelBookingItem.paymentStatus === 'paid';

              return (
                <div style={{ background: '#fffbeb', border: '1px solid #fef3c7', borderRadius: '16px', padding: '1rem', marginBottom: '1.25rem', fontSize: '0.85rem' }}>
                  <div style={{ fontWeight: 800, color: '#d97706', display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '0.5rem' }}>
                    <Shield size={16} /> Lưu ý quan trọng
                  </div>
                  {isPaid ? (
                    isBuddy ? (
                      diff >= 24 ? (
                        <div style={{ color: '#92400e', lineHeight: 1.5 }}>
                          Thời gian đến giờ tour còn **{diff.toFixed(1)} giờ** (lớn hơn 24h). Bạn tự ý hủy chuyến đi lúc này sẽ bị hệ thống:
                          <ul style={{ margin: '0.25rem 0 0', paddingLeft: '1.25rem' }}>
                            <li>Hoàn trả 100% tiền cọc cho khách du lịch.</li>
                            <li><strong>Phạt tài chính 10%</strong> tổng tiền tour (trừ trực tiếp vào ví của bạn).</li>
                            <li>Khóa slot lịch khung giờ này, không thể nhận tour khác.</li>
                            <li>Tự động đăng review 1-sao cảnh cáo trên hồ sơ cá nhân.</li>
                          </ul>
                        </div>
                      ) : (
                        <div style={{ color: '#b91c1c', lineHeight: 1.5, fontWeight: 700 }}>
                          CẢNH BÁO PHẠT NẶNG: Thời gian chỉ còn **{diff.toFixed(1)} giờ** (dưới 24h). Tự ý hủy sát giờ lúc này sẽ bị:
                          <ul style={{ margin: '0.25rem 0 0', paddingLeft: '1.25rem', fontWeight: 600 }}>
                            <li>Hoàn trả 100% tiền cọc cho khách du lịch.</li>
                            <li><strong>Phạt tài chính nặng 30%</strong> tổng tiền tour (trừ trực tiếp vào ví của bạn).</li>
                            <li>Khóa slot lịch khung giờ này, không thể nhận tour khác.</li>
                            <li>Tự động đăng review 1-sao cảnh cáo trên hồ sơ cá nhân.</li>
                          </ul>
                        </div>
                      )
                    ) : (
                      diff >= 24 ? (
                        <p style={{ margin: 0, color: '#92400e', lineHeight: 1.5 }}>
                          Thời gian đến giờ tour còn **{diff.toFixed(1)} giờ** (lớn hơn 24h). Bạn được phép hủy và **hoàn tiền 100%** vào ví.
                        </p>
                      ) : (
                        <p style={{ margin: 0, color: '#b91c1c', lineHeight: 1.5, fontWeight: 700 }}>
                          CẢNH BÁO: Thời gian đến giờ khởi hành chỉ còn **{diff.toFixed(1)} giờ** (dưới 24h). Hủy lịch bận lúc này sẽ **KHÔNG ĐƯỢC HOÀN TIỀN**. Số tiền đặt cọc sẽ được chuyển thẳng đến Buddy làm phí đền bù bận lịch!
                        </p>
                      )
                    )
                  ) : (
                    <p style={{ margin: 0, color: '#92400e', lineHeight: 1.5 }}>
                      Đặt lịch này chưa được thanh toán, bạn có thể tự do hủy mà không phải chịu bất kỳ khoản phạt nào.
                    </p>
                  )}
                </div>
              );
            })()}

            {/* Nhập lý do */}
            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: 'var(--color-text-faint)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.5rem' }}>Nhập lý do hủy chuyến</label>
              <textarea
                required
                value={cancelReason}
                onChange={e => setCancelReason(e.target.value)}
                placeholder='Nhập lý do chi tiết để hệ thống ghi nhận...'
                rows={3}
                style={{ width: '100%', border: '1px solid var(--color-border)', borderRadius: '12px', padding: '0.75rem', fontSize: '0.88rem', fontFamily: 'inherit', outline: 'none', background: 'white', boxSizing: 'border-box', resize: 'vertical' }}
              />
            </div>

            {/* Nút hủy */}
            <button
              onClick={handleProcessCancel}
              disabled={cancelLoading}
              style={{ width: '100%', padding: '0.9rem', background: '#ef4444', border: 'none', borderRadius: '12px', color: 'white', fontWeight: 800, fontSize: '0.95rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px', boxShadow: '0 4px 15px rgba(239,68,68,0.2)' }}
            >
              {cancelLoading ? 'Đang hủy...' : 'Xác nhận hủy đặt lịch'}
            </button>

          </div>
        </div>
      )}

      <style>{`
        @keyframes spin { to { transform: rotate(360deg) } }
      `}</style>

    </div>
  );
};

export default MyBookingsPage;
