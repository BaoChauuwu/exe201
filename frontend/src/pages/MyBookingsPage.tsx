import { useState, useEffect } from 'react';
import Navbar from '../components/layout/Navbar';
import { bookingApi, type IBooking } from '../api/booking.api';
import { vnpayApi } from '../api/vnpay.api';
import { useAuthStore } from '../store/authStore';
import axios from 'axios';
import { 
  Calendar, Clock, Users, CheckCircle2, 
  ChevronDown, ChevronUp, MessageCircle, 
  AlertTriangle, Shield, CreditCard, Landmark, X, Star, ShieldCheck, PlusCircle
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { socket } from '../socket';
import { reviewApi, type IReview } from '../api/review.api';

export const MyBookingsPage = () => {
  const { accessToken, user } = useAuthStore();
  const navigate = useNavigate();

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

  // States cho modal vé & Check-in
  const [isTicketModalOpen, setIsTicketModalOpen] = useState(false);
  const [ticketBooking, setTicketBooking] = useState<IBooking | null>(null);
  const [checkInCode, setCheckInCode] = useState('');
  const [checkInLoading, setCheckInLoading] = useState(false);

  // States cho modal Đánh giá (Reviews)
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [reviewBooking, setReviewBooking] = useState<IBooking | null>(null);
  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState<number | null>(null);
  const [comment, setComment] = useState('');
  const [reviewLoading, setReviewLoading] = useState(false);
  const [bookingReviews, setBookingReviews] = useState<Record<string, IReview[]>>({});

  useEffect(() => {
    if (isPayModalOpen && accessToken) {
      axios.get((import.meta.env.VITE_API_URL || 'http://localhost:3000') + '/users/me', {
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

  // States cho modal Khiếu nại (Dispute)
  const [isDisputeModalOpen, setIsDisputeModalOpen] = useState(false);
  const [disputeBooking, setDisputeBooking] = useState<IBooking | null>(null);
  const [disputeReason, setDisputeReason] = useState('');
  const [disputeLoading, setDisputeLoading] = useState(false);

  // States cho modal Giải trình (Buddy Defense)
  const [isDefenseModalOpen, setIsDefenseModalOpen] = useState(false);
  const [defenseBooking, setDefenseBooking] = useState<IBooking | null>(null);
  const [defenseReason, setDefenseReason] = useState('');
  const [defenseLoading, setDefenseLoading] = useState(false);

  // States cho modal Gia hạn chuyến đi (Extension)
  const [isExtendModalOpen, setIsExtendModalOpen] = useState(false);
  const [extendBookingItem, setExtendBookingItem] = useState<IBooking | null>(null);
  const [extendHours, setExtendHours] = useState<number>(1);
  const [extendReason, setExtendReason] = useState<string>('');
  const [extendLoading, setExtendLoading] = useState(false);
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);

  const handleRaiseDispute = async () => {
    if (!disputeBooking) return;
    if (!disputeReason.trim() || disputeReason.trim().length < 10) {
      toast.error('Vui lòng mô tả lý do khiếu nại chi tiết hơn (tối thiểu 10 ký tự).');
      return;
    }
    setDisputeLoading(true);
    try {
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';
      await axios.post(`${API_URL}/bookings/${disputeBooking._id}/dispute`, { disputeReason }, {
        headers: { Authorization: `Bearer ${accessToken}` }
      });
      toast.success('✅ Khiếu nại đã được ghi nhận! Admin sẽ xử lý trong vòng 24 giờ.');
      setIsDisputeModalOpen(false);
      setDisputeBooking(null);
      setDisputeReason('');
      fetchBookings();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Không thể gửi khiếu nại.');
    } finally {
      setDisputeLoading(false);
    }
  };

  const handleSubmitDefense = async () => {
    if (!defenseBooking) return;
    if (!defenseReason.trim() || defenseReason.trim().length < 10) {
      toast.error('Vui lòng nhập lời giải trình chi tiết hơn (tối thiểu 10 ký tự).');
      return;
    }
    setDefenseLoading(true);
    try {
      await bookingApi.submitBuddyDefense(defenseBooking._id, defenseReason);
      toast.success('✅ Đã gửi lời giải trình thành công! Admin sẽ xem xét lại vụ việc.');
      setIsDefenseModalOpen(false);
      setDefenseBooking(null);
      setDefenseReason('');
      fetchBookings();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Không thể gửi giải trình.');
    } finally {
      setDefenseLoading(false);
    }
  };

  // const handleShareTracking = (booking: IBooking) => {
  //   const token = (booking as any).shareTrackingToken;
  //   if (!token) {
  //     toast.error('Chưa có token chia sẻ. Buddy cần bắt đầu chuyến đi trước.');
  //     return;
  //   }
  //   const link = `${window.location.origin}/track/public?token=${token}`;
  //   navigator.clipboard.writeText(link).then(() => {
  //     toast.success('✅ Đã sao chép link chia sẻ hành trình! Gửi cho người thân theo dõi nhé.');
  //   }).catch(() => {
  //     toast.error('Không thể sao chép. Link: ' + link);
  //   });
  // };

  const fetchReviewsForCompletedBookings = async (completedList: IBooking[]) => {
    const reviewsMap: Record<string, IReview[]> = {};
    await Promise.all(
      completedList.map(async (booking) => {
        try {
          const res = await reviewApi.getBookingReviews(booking._id);
          reviewsMap[booking._id] = res.data.result || [];
        } catch (err) {
          console.error('Failed to fetch reviews for booking:', booking._id, err);
        }
      })
    );
    setBookingReviews(prev => ({ ...prev, ...reviewsMap }));
  };

  const fetchBookings = async () => {
    try {
      const res = await bookingApi.getMyBookings();
      const list = res.data.result || [];
      setBookings(list);

      const completedList = list.filter(b => b.status === 'completed');
      if (completedList.length > 0) {
        fetchReviewsForCompletedBookings(completedList);
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Không thể tải danh sách đặt lịch.');
    } finally {
      setLoading(false);
    }
  };

  const handleSendReview = async () => {
    if (!reviewBooking) return;
    setReviewLoading(true);
    try {
      await reviewApi.createReview({
        bookingId: reviewBooking._id,
        rating,
        comment
      });
      toast.success('Gửi đánh giá thành công! Cảm ơn phản hồi của bạn 🎉');
      setIsReviewModalOpen(false);
      setReviewBooking(null);
      setComment('');
      setRating(5);
      fetchBookings();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Gửi đánh giá thất bại.');
    } finally {
      setReviewLoading(false);
    }
  };

  const handleStartTour = async (id: string) => {
    setCheckInLoading(true);
    try {
      await bookingApi.startTour(id);
      toast.success('Bắt đầu chuyến đi thành công! Chúc bạn có một hành trình vui vẻ 🎉');
      setIsTicketModalOpen(false);
      setTicketBooking(null);
      fetchBookings();
      navigate(`/live-tracking/${id}`);
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Check-in thất bại.');
    } finally {
      setCheckInLoading(false);
    }
  };

  const handleTouristCompleteTour = async (id: string) => {
    if (!window.confirm('Bạn có chắc chắn muốn xác nhận hoàn thành chuyến đi này và giải ngân tiền cho Buddy không?')) return;
    try {
      await bookingApi.touristCompleteTour(id);
      toast.success('Xác nhận hoàn thành chuyến đi thành công! Tiền đã được giải ngân cho Buddy.');
      fetchBookings();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Xác nhận hoàn thành thất bại.');
    }
  };

  const handleRequestExtension = async () => {
    if (!extendBookingItem) return;
    if (!extendHours || extendHours <= 0) {
      toast.error('Số giờ gia hạn phải lớn hơn 0');
      return;
    }
    setExtendLoading(true);
    try {
      await bookingApi.requestExtension(extendBookingItem._id, extendHours, extendReason);
      toast.success(`Đã gửi yêu cầu gia hạn +${extendHours} giờ tới Buddy! Vui lòng chờ xác nhận.`);
      setIsExtendModalOpen(false);
      setExtendBookingItem(null);
      setExtendHours(1);
      setExtendReason('');
      fetchBookings();
    } catch (err: any) {
      const errorMsg = err.response?.data?.message || 'Gửi yêu cầu gia hạn thất bại.';
      toast.error(errorMsg);
      if (errorMsg.toLowerCase().includes('số dư ví')) {
        if (window.confirm(`${errorMsg}\n\nBạn có muốn đi đến trang Ví UniTravel để nạp tiền ngay bây giờ không?`)) {
          setIsExtendModalOpen(false);
          navigate('/wallet');
        }
      }
    } finally {
      setExtendLoading(false);
    }
  };

  const handleAcceptExtension = async (bookingId: string, requestId?: string) => {
    if (!window.confirm('Bạn có chắc chắn đồng ý gia hạn chuyến đi này không? Hệ thống sẽ tự động cập nhật giờ và thanh toán phí phát sinh.')) return;
    setActionLoadingId(bookingId + '_accept');
    try {
      await bookingApi.acceptExtension(bookingId, requestId);
      toast.success('Đã đồng ý gia hạn chuyến đi thành công!');
      fetchBookings();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Đồng ý gia hạn thất bại.');
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleRejectExtension = async (bookingId: string, requestId?: string) => {
    const reason = window.prompt('Nhập lý do từ chối (tùy chọn):') || '';
    setActionLoadingId(bookingId + '_reject');
    try {
      await bookingApi.rejectExtension(bookingId, requestId, reason);
      toast.success('Đã từ chối yêu cầu gia hạn chuyến đi.');
      fetchBookings();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Từ chối gia hạn thất bại.');
    } finally {
      setActionLoadingId(null);
    }
  };

  useEffect(() => {
    if (accessToken) {
      fetchBookings();
      socket.connect();
      return () => {
        socket.disconnect();
      };
    } else {
      setLoading(false);
    }
  }, [accessToken]);

  // Listen for real-time status updates via Socket.io
  useEffect(() => {
    if (!bookings.length) return;
    
    bookings.forEach(booking => {
      const eventName = `booking_status_updated_${booking._id}`;
      socket.on(eventName, () => {
        fetchBookings();
      });
      const extEventName = `booking_extension_updated_${booking._id}`;
      socket.on(extEventName, () => {
        fetchBookings();
      });
    });
    
    return () => {
      bookings.forEach(booking => {
        const eventName = `booking_status_updated_${booking._id}`;
        socket.off(eventName);
        const extEventName = `booking_extension_updated_${booking._id}`;
        socket.off(extEventName);
      });
    };
  }, [bookings]);

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
        // Thanh toán bằng ví nội bộ UniTravel
        await bookingApi.payWithWallet(selectedBooking._id);
        toast.success('Thanh toán thành công! Chuyến đi đã sẵn sàng khởi hành 🎉');
        setIsPayModalOpen(false);
        fetchBookings();
      } else if (paymentMethod === 'VNPay') {
        // Thanh toán qua cổng VNPAY — redirect sang trang VNPAY
        const res = await vnpayApi.createPaymentUrl({
          bookingId: selectedBooking._id,
          orderDescription: `Thanh toán tour ${selectedBooking.bookingCode}`
        });
        const paymentUrl = res.data?.data?.paymentUrl;
        if (paymentUrl) {
          // Redirect toàn bộ trình duyệt sang cổng VNPAY
          window.location.href = paymentUrl;
        } else {
          toast.error('Không tạo được link thanh toán. Vui lòng thử lại.');
          setPaymentLoading(false);
        }
      } else {
        // Các phương thức khác (MoMo giả lập, v.v.)
        await bookingApi.pay(selectedBooking._id, paymentMethod);
        toast.success('Thanh toán thành công! Chuyến đi đã sẵn sàng khởi hành 🎉');
        setIsPayModalOpen(false);
        fetchBookings();
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Thanh toán thất bại.');
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

                          {/* Banner Yêu cầu Gia hạn (nếu có request pending) */}
                          {booking.extensionRequests && booking.extensionRequests.some(r => r.status === 'pending') && (() => {
                            const pendingReq = booking.extensionRequests!.find(r => r.status === 'pending')!;
                            return (
                              <div style={{
                                background: isBuddy ? '#fef3c7' : '#eff6ff',
                                border: `1.5px solid ${isBuddy ? '#f59e0b' : '#60a5fa'}`,
                                borderRadius: '14px',
                                padding: '0.85rem 1rem',
                                fontSize: '0.82rem',
                                display: 'flex',
                                flexDirection: 'column',
                                gap: '0.6rem',
                                marginTop: '0.5rem'
                              }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 800, color: isBuddy ? '#b45309' : '#1d4ed8' }}>
                                  <Clock size={16} />
                                  <span>{isBuddy ? '🔔 Yêu cầu gia hạn chuyến đi từ Tourist' : '⏳ Đang chờ Buddy phản hồi yêu cầu gia hạn'}</span>
                                </div>
                                <div style={{ color: '#334155', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                  <div>
                                    • Đi thêm: <strong style={{ color: '#0f172a' }}>+{pendingReq.additionalHours} giờ</strong>
                                    {' '}(Phí phát sinh: <strong style={{ color: '#ef4444' }}>+{pendingReq.additionalPrice.toLocaleString()} ₫</strong>)
                                  </div>
                                  {isBuddy && (
                                    <div>
                                      • Bạn thực nhận thêm: <strong style={{ color: '#059669' }}>+{pendingReq.additionalBuddyEarning.toLocaleString()} ₫</strong>
                                    </div>
                                  )}
                                  {pendingReq.reason && (
                                    <div style={{ fontStyle: 'italic', color: '#64748b' }}>
                                      📝 Lý do/Ghi chú: "{pendingReq.reason}"
                                    </div>
                                  )}
                                </div>
                                {isBuddy && (
                                  <div style={{ display: 'flex', gap: '0.5rem', marginTop: '4px' }}>
                                    <button
                                      onClick={() => handleAcceptExtension(booking._id, pendingReq._id)}
                                      disabled={actionLoadingId === booking._id + '_accept'}
                                      style={{ padding: '0.5rem 1rem', background: 'linear-gradient(135deg, #10b981, #059669)', border: 'none', borderRadius: '8px', color: 'white', fontWeight: 700, fontSize: '0.78rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px', boxShadow: '0 2px 8px rgba(16,185,129,0.25)' }}
                                    >
                                      ✅ {actionLoadingId === booking._id + '_accept' ? 'Đang xử lý...' : 'Đồng ý gia hạn (+Giờ)'}
                                    </button>
                                    <button
                                      onClick={() => handleRejectExtension(booking._id, pendingReq._id)}
                                      disabled={actionLoadingId === booking._id + '_reject'}
                                      style={{ padding: '0.5rem 1rem', background: '#fef2f2', border: '1px solid #fca5a5', borderRadius: '8px', color: '#dc2626', fontWeight: 700, fontSize: '0.78rem', cursor: 'pointer' }}
                                    >
                                      ❌ Từ chối
                                    </button>
                                  </div>
                                )}
                              </div>
                            );
                          })()}

                          {/* Nhóm Nút Hành động */}
                          <div style={{ display: 'flex', gap: '0.6rem', justifyContent: 'flex-end', flexWrap: 'wrap', width: '100%', marginTop: '0.5rem' }}>
                            
                            {/* Nút Chat */}
                            {partner && (
                              <Link to={`/chat/${partner._id}`} style={{ textDecoration: 'none' }}>
                                <button style={{ padding: '0.55rem 1rem', background: '#f1f5f9', border: '1px solid var(--color-border)', borderRadius: '10px', fontSize: '0.8rem', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px', color: 'var(--color-text)' }}>
                                  <MessageCircle size={14} /> Nhắn tin
                                </button>
                              </Link>
                            )}

                            {/* [ALL ROLES] - Đánh giá chuyến đi khi trạng thái completed */}
                            {booking.status === 'completed' && (() => {
                              const reviews = bookingReviews[booking._id] || [];
                              const myReview = reviews.find(r => r.reviewerId._id === user?._id);
                              const partnerReview = reviews.find(r => r.reviewerId._id !== user?._id);

                              return (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem', width: '100%', alignItems: 'flex-end', marginTop: '0.5rem' }}>
                                  
                                  {/* Hiển thị Đánh giá của mình */}
                                  {myReview ? (
                                    <div style={{ fontSize: '0.82rem', color: 'var(--color-text-muted)', background: '#f8fafc', padding: '0.6rem 1rem', borderRadius: '10px', border: '1px solid var(--color-border)', width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center', boxSizing: 'border-box' }}>
                                      <span style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: '6px' }}>
                                        <strong>Bạn đã đánh giá:</strong>
                                        <span style={{ color: '#f59e0b', fontWeight: 800, display: 'flex', gap: '2px' }}>
                                          {Array.from({ length: myReview.rating }).map((_, i) => <Star key={i} size={14} fill="#f59e0b" color="#f59e0b" />)}
                                        </span>
                                        {myReview.comment && <span style={{ color: 'var(--color-text-faint)', fontStyle: 'italic', marginLeft: '4px' }}>"{myReview.comment}"</span>}
                                      </span>
                                      <span style={{ fontSize: '0.7rem', color: 'var(--color-text-faint)', whiteSpace: 'nowrap' }}>Đã gửi</span>
                                    </div>
                                  ) : (
                                    <button 
                                      onClick={() => {
                                        setReviewBooking(booking);
                                        setRating(5);
                                        setComment('');
                                        setIsReviewModalOpen(true);
                                      }}
                                      style={{ padding: '0.55rem 1.25rem', background: 'linear-gradient(135deg, #f59e0b, #d97706)', border: 'none', borderRadius: '10px', fontSize: '0.8rem', fontWeight: 700, color: 'white', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px', boxShadow: '0 4px 12px rgba(245,158,11,0.2)' }}
                                    >
                                      ⭐ {isBuddy ? 'Đánh giá du khách' : 'Đánh giá chuyến đi'}
                                    </button>
                                  )}

                                  {/* Hiển thị Đánh giá từ đối tác */}
                                  {partnerReview && (
                                    <div style={{ fontSize: '0.82rem', color: '#059669', background: '#f0fdf4', padding: '0.6rem 1rem', borderRadius: '10px', border: '1px solid #bbf7d0', width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center', boxSizing: 'border-box' }}>
                                      <span style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: '6px' }}>
                                        <strong>{isBuddy ? 'Tourist' : 'Buddy'} đã đánh giá:</strong>
                                        <span style={{ color: '#f59e0b', fontWeight: 800, display: 'flex', gap: '2px' }}>
                                          {Array.from({ length: partnerReview.rating }).map((_, i) => <Star key={i} size={14} fill="#f59e0b" color="#f59e0b" />)}
                                        </span>
                                        {partnerReview.comment && <span style={{ color: '#059669', fontStyle: 'italic', marginLeft: '4px' }}>"{partnerReview.comment}"</span>}
                                      </span>
                                      <span style={{ fontSize: '0.7rem', color: '#059669', fontWeight: 700, textTransform: 'uppercase', whiteSpace: 'nowrap' }}>Tin cậy</span>
                                    </div>
                                  )}

                                </div>
                              );
                            })()}

                            {/* [TOURIST ONLY] - Thanh toán lại nếu unpaid */}
                            {!isBuddy && !hasPaid && booking.status === 'pending' && (
                              <button 
                                onClick={() => openPayModal(booking)}
                                style={{ padding: '0.55rem 1rem', background: 'var(--gradient-primary)', border: 'none', borderRadius: '10px', fontSize: '0.8rem', fontWeight: 700, color: 'white', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px', boxShadow: '0 4px 12px rgba(2,132,199,0.2)' }}
                              >
                                <CreditCard size={14} /> Thanh toán ngay
                              </button>
                            )}

                            {/* [TOURIST ONLY] - Vé của tôi (Confirmed & Paid) */}
                            {!isBuddy && hasPaid && booking.status === 'confirmed' && (
                              <button 
                                onClick={() => {
                                  setTicketBooking(booking);
                                  setIsTicketModalOpen(true);
                                }}
                                style={{ padding: '0.55rem 1.25rem', background: 'linear-gradient(135deg, #0ea5e9, #0284c7)', border: 'none', borderRadius: '10px', fontSize: '0.8rem', fontWeight: 700, color: 'white', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px', boxShadow: '0 4px 12px rgba(14,165,233,0.2)' }}
                              >
                                🎟️ Vé của tôi
                              </button>
                            )}

                            {/* [BUDDY ONLY] - Bắt đầu chuyến đi / Check-in (Confirmed & Paid) */}
                            {isBuddy && hasPaid && booking.status === 'confirmed' && (
                              <button 
                                onClick={() => {
                                  setTicketBooking(booking);
                                  setCheckInCode('');
                                  setIsTicketModalOpen(true);
                                }}
                                style={{ padding: '0.55rem 1.25rem', background: 'linear-gradient(135deg, #f59e0b, #d97706)', border: 'none', borderRadius: '10px', fontSize: '0.8rem', fontWeight: 700, color: 'white', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px', boxShadow: '0 4px 12px rgba(245,158,11,0.2)' }}
                              >
                                ⚡ Bắt đầu (Check-in)
                              </button>
                            )}

                            {/* [TOURIST ONLY] - Xin gia hạn chuyến đi (+Giờ) */}
                            {!isBuddy && ['confirmed', 'ongoing'].includes(booking.status) && (!booking.extensionRequests || !booking.extensionRequests.some(r => r.status === 'pending')) && (
                              <button
                                onClick={() => {
                                  setExtendBookingItem(booking);
                                  setExtendHours(1);
                                  setExtendReason('');
                                  setIsExtendModalOpen(true);
                                }}
                                style={{ padding: '0.55rem 1.1rem', background: 'linear-gradient(135deg, #3b82f6, #2563eb)', border: 'none', borderRadius: '10px', fontSize: '0.8rem', fontWeight: 700, color: 'white', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px', boxShadow: '0 4px 12px rgba(59,130,246,0.2)' }}
                              >
                                <PlusCircle size={14} /> ⏱️ Xin gia hạn (+Giờ)
                              </button>
                            )}

                            {/* [TOURIST ONLY] - ongoing state: Xem vị trí Buddy & Xác nhận hoàn thành */}
                            {!isBuddy && booking.status === 'ongoing' && (
                              <>
                                <Link to={`/tourist/live/${booking._id}`} style={{ textDecoration: 'none' }}>
                                  <button style={{ padding: '0.55rem 1.25rem', background: 'linear-gradient(135deg, #8b5cf6, #7c3aed)', border: 'none', borderRadius: '10px', fontSize: '0.8rem', fontWeight: 700, color: 'white', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px', boxShadow: '0 4px 12px rgba(139,92,246,0.2)' }}>
                                    🗺️ Xem vị trí Buddy
                                  </button>
                                </Link>
                                <button 
                                  onClick={() => handleTouristCompleteTour(booking._id)}
                                  style={{ padding: '0.55rem 1.25rem', background: 'linear-gradient(135deg, #10b981, #059669)', border: 'none', borderRadius: '10px', fontSize: '0.8rem', fontWeight: 700, color: 'white', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px', boxShadow: '0 4px 12px rgba(16,185,129,0.2)' }}
                                >
                                  🏆 Xác nhận hoàn thành
                                </button>
                              </>
                            )}

                            {/* [BUDDY ONLY] - ongoing state: Chia sẻ GPS & SOS */}
                            {isBuddy && booking.status === 'ongoing' && (
                              <Link to={`/live-tracking/${booking._id}`} style={{ textDecoration: 'none' }}>
                                <button style={{ padding: '0.55rem 1.25rem', background: 'linear-gradient(135deg, #ef4444, #dc2626)', border: 'none', borderRadius: '10px', fontSize: '0.8rem', fontWeight: 700, color: 'white', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px', boxShadow: '0 4px 12px rgba(239,68,68,0.2)' }}>
                                  📡 Chia sẻ GPS & SOS
                                </button>
                              </Link>
                            )}

                            {/* [ALL] - Raise Dispute */}
                            {['confirmed', 'ongoing', 'completed'].includes(booking.status) && booking.disputeStatus !== 'pending' && booking.escrowStatus !== 'released' && (
                              <button 
                                onClick={() => { setDisputeBooking(booking); setIsDisputeModalOpen(true); }}
                                style={{ padding: '0.55rem 1rem', background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '10px', fontSize: '0.8rem', fontWeight: 700, color: '#b91c1c', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}
                              >
                                🚩 Khiếu nại
                              </button>
                            )}

                            {/* [BUDDY ONLY] - Hoàn thành chuyến đi (Fallback/Admin complete) */}
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
                                  <CheckCircle2 size={14} /> {ended ? 'Xác nhận Hoàn thành (Dành cho Buddy)' : 'Chưa kết thúc'}
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

                          {/* DISPUTE STATUS BANNER */}
                          {booking.isDisputed && (
                            <div style={{ marginTop: '1.5rem', background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '12px', overflow: 'hidden' }}>
                              <div style={{ padding: '0.75rem 1.25rem', background: '#fee2e2', borderBottom: '1px solid #fecaca', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#b91c1c', fontWeight: 800, fontSize: '0.9rem' }}>
                                  <AlertTriangle size={16} /> 
                                  {booking.disputeStatus === 'pending' ? 'Khiếu nại đang chờ xử lý' : 'Khiếu nại đã được giải quyết'}
                                </div>
                                {booking.disputeStatus === 'pending' && isBuddy && !booking.buddyDefenseReason && (
                                  <button
                                    onClick={() => { setDefenseBooking(booking); setIsDefenseModalOpen(true); }}
                                    style={{ padding: '0.4rem 0.85rem', background: '#ef4444', color: 'white', border: 'none', borderRadius: '8px', fontSize: '0.75rem', fontWeight: 700, cursor: 'pointer', boxShadow: '0 2px 8px rgba(239,68,68,0.3)' }}
                                  >
                                    Nộp giải trình
                                  </button>
                                )}
                              </div>
                              <div style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '1rem', fontSize: '0.85rem' }}>
                                <div>
                                  <strong style={{ color: '#991b1b' }}>Lý do từ Tourist:</strong>
                                  <div style={{ marginTop: '4px', color: '#475569', background: 'rgba(255,255,255,0.7)', padding: '0.75rem', borderRadius: '8px', borderLeft: '3px solid #ef4444' }}>
                                    {booking.disputeReason}
                                  </div>
                                </div>

                                {booking.buddyDefenseReason && (
                                  <div>
                                    <strong style={{ color: '#0369a1' }}>Giải trình từ Buddy:</strong>
                                    <div style={{ marginTop: '4px', color: '#475569', background: 'rgba(255,255,255,0.7)', padding: '0.75rem', borderRadius: '8px', borderLeft: '3px solid #0ea5e9' }}>
                                      {booking.buddyDefenseReason}
                                    </div>
                                  </div>
                                )}

                                {['resolved_refunded', 'resolved_paid', 'resolved_partial'].includes(booking.disputeStatus || '') && booking.disputeResolutionNote && (
                                  <div>
                                    <strong style={{ color: '#059669' }}>Phán quyết của Admin ({booking.disputeRefundPercentage}% Hoàn Tourist / {100 - (booking.disputeRefundPercentage || 0)}% Giải ngân Buddy):</strong>
                                    <div style={{ marginTop: '4px', color: '#064e3b', background: '#d1fae5', padding: '0.75rem', borderRadius: '8px', borderLeft: '3px solid #10b981' }}>
                                      {booking.disputeResolutionNote}
                                    </div>
                                  </div>
                                )}
                              </div>
                            </div>
                          )}

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

      {/* ── MODAL VÉ CHI TIẾT & CHECK-IN (QR / CODE) ── */}
      {isTicketModalOpen && ticketBooking && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(15, 23, 42, 0.75)', backdropFilter: 'blur(8px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          zIndex: 9999, padding: '1rem', boxSizing: 'border-box'
        }}>
          <div style={{
            background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)',
            borderRadius: '24px', width: '100%', maxWidth: '440px',
            padding: '2rem', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
            border: '1px solid rgba(14, 165, 233, 0.3)', position: 'relative',
            boxSizing: 'border-box', color: '#f8fafc'
          }}>
            
            <button 
              onClick={() => {
                setIsTicketModalOpen(false);
                setTicketBooking(null);
              }}
              style={{ position: 'absolute', top: '1.25rem', right: '1.25rem', background: 'rgba(255,255,255,0.05)', border: 'none', borderRadius: '50%', width: '30px', height: '30px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#94a3b8' }}
            >
              <X size={15} />
            </button>

            {/* Content for Tourist: Vé của tôi */}
            {!isBuddy && (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
                <div style={{ background: 'rgba(14, 165, 233, 0.15)', padding: '0.6rem 1.2rem', borderRadius: '999px', fontSize: '0.8rem', fontWeight: 800, color: '#38bdf8', border: '1px solid rgba(56, 189, 248, 0.3)', marginBottom: '1.5rem' }}>
                  🎫 VÉ TOUR ĐIỆN TỬ
                </div>
                
                <h3 style={{ fontSize: '1.25rem', fontWeight: 900, margin: '0 0 0.5rem', color: '#ffffff' }}>
                  {ticketBooking.experienceId?.title || 'Tour Trải Nghiệm'}
                </h3>
                
                <p style={{ color: '#94a3b8', fontSize: '0.85rem', margin: '0 0 1.5rem' }}>
                  Hãy cung cấp mã vé dưới đây cho Buddy để làm thủ tục check-in bắt đầu chuyến đi.
                </p>

                {/* Plain Text Code Display */}
                <div style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', padding: '0.75rem 2rem', fontFamily: 'monospace', fontSize: '1.25rem', fontWeight: 800, letterSpacing: '0.1em', color: '#38bdf8', cursor: 'pointer', marginBottom: '1.5rem' }} onClick={() => {
                  navigator.clipboard.writeText(ticketBooking.bookingCode);
                  toast.success('Đã sao chép mã vé!');
                }} title="Bấm để sao chép">
                  {ticketBooking.bookingCode}
                </div>
                <span style={{ fontSize: '0.7rem', color: '#64748b', marginTop: '0.4rem' }}>Nhấp vào mã để sao chép</span>

                {/* Details snapshot */}
                <div style={{ width: '100%', borderTop: '1px solid rgba(255,255,255,0.1)', marginTop: '1.5rem', paddingTop: '1rem', display: 'flex', justifyContent: 'space-around', fontSize: '0.8rem', color: '#94a3b8' }}>
                  <div>
                    <div style={{ fontSize: '0.7rem', color: '#64748b', textTransform: 'uppercase' }}>Ngày đi</div>
                    <div style={{ fontWeight: 700, color: '#f8fafc', marginTop: '2px' }}>{new Date(ticketBooking.scheduledDate).toLocaleDateString('vi-VN')}</div>
                  </div>
                  <div style={{ borderLeft: '1px solid rgba(255,255,255,0.1)', height: '24px' }} />
                  <div>
                    <div style={{ fontSize: '0.7rem', color: '#64748b', textTransform: 'uppercase' }}>Giờ xuất phát</div>
                    <div style={{ fontWeight: 700, color: '#f8fafc', marginTop: '2px' }}>{ticketBooking.startTime}</div>
                  </div>
                  <div style={{ borderLeft: '1px solid rgba(255,255,255,0.1)', height: '24px' }} />
                  <div>
                    <div style={{ fontSize: '0.7rem', color: '#64748b', textTransform: 'uppercase' }}>Khách hàng</div>
                    <div style={{ fontWeight: 700, color: '#f8fafc', marginTop: '2px' }}>{user?.name}</div>
                  </div>
                </div>

              </div>
            )}

            {/* Content for Buddy: Thực hiện Check-in */}
            {isBuddy && (
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
                  <div style={{ display: 'inline-block', background: 'rgba(245, 158, 11, 0.15)', padding: '0.6rem 1.2rem', borderRadius: '999px', fontSize: '0.8rem', fontWeight: 800, color: '#fbbf24', border: '1px solid rgba(245, 158, 11, 0.3)', marginBottom: '1rem' }}>
                    ⚡ CHECK-IN KHÁCH HÀNG
                  </div>
                  <h3 style={{ fontSize: '1.25rem', fontWeight: 900, margin: '0 0 0.5rem', color: '#ffffff' }}>Khởi hành Chuyến đi</h3>
                  <p style={{ color: '#94a3b8', fontSize: '0.85rem', margin: 0 }}>
                    Yêu cầu Tourist cung cấp mã vé trên ứng dụng của họ để tiến hành làm thủ tục xuất phát.
                  </p>
                </div>

                <div style={{ background: 'rgba(255, 255, 255, 0.03)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '16px', padding: '1rem', marginBottom: '1.5rem', fontSize: '0.85rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.3rem' }}>
                    <span style={{ color: '#94a3b8' }}>Khách hàng:</span>
                    <span style={{ fontWeight: 700 }}>{ticketBooking.touristId?.name}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.3rem' }}>
                    <span style={{ color: '#94a3b8' }}>Liên hệ:</span>
                    <span style={{ fontWeight: 700 }}>{ticketBooking.touristId?.phone || 'Chưa cung cấp SĐT'}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: '#94a3b8' }}>Điểm hẹn:</span>
                    <span style={{ fontWeight: 700, color: '#38bdf8' }}>{ticketBooking.meetingPoint?.coordinates?.length === 2 ? 'Xem bản đồ bên dưới' : 'Tại điểm hẹn'}</span>
                  </div>
                </div>

                <div style={{ marginBottom: '1.5rem' }}>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.5rem' }}>
                    Nhập mã vé Tourist (Booking Code)
                  </label>
                  <input
                    type='text'
                    required
                    value={checkInCode}
                    onChange={e => setCheckInCode(e.target.value.toUpperCase())}
                    placeholder='BK-XXXXXXXX'
                    style={{ width: '100%', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', padding: '0.85rem 1rem', fontSize: '1.1rem', fontFamily: 'monospace', outline: 'none', background: 'rgba(0,0,0,0.2)', color: '#ffffff', boxSizing: 'border-box', textAlign: 'center', letterSpacing: '0.05em' }}
                  />
                </div>

                <button
                  onClick={() => {
                    const cleanInput = checkInCode.trim();
                    const cleanCode = ticketBooking.bookingCode.trim();
                    if (!cleanInput) {
                      toast.error('Vui lòng nhập mã vé.');
                      return;
                    }
                    if (cleanInput !== cleanCode) {
                      toast.error('Mã vé không chính xác! Vui lòng kiểm tra lại.');
                      return;
                    }
                    handleStartTour(ticketBooking._id);
                  }}
                  disabled={checkInLoading}
                  style={{ width: '100%', padding: '0.9rem', background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)', border: 'none', borderRadius: '12px', color: 'white', fontWeight: 800, fontSize: '0.95rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px', boxShadow: '0 4px 15px rgba(245,158,11,0.3)' }}
                >
                  {checkInLoading ? 'Đang thực hiện...' : 'Xác nhận Check-in & Xuất phát'}
                </button>
              </div>
            )}

          </div>
        </div>
      )}

      {/* ── MODAL ĐÁNH GIÁ CHUYẾN ĐI (POST-TRIP REVIEWS) ── */}
      {isReviewModalOpen && reviewBooking && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(15, 23, 42, 0.75)', backdropFilter: 'blur(8px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          zIndex: 9999, padding: '1rem', boxSizing: 'border-box'
        }}>
          <div style={{
            background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)',
            borderRadius: '24px', width: '100%', maxWidth: '440px',
            padding: '2rem', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
            border: '1px solid rgba(245, 158, 11, 0.3)', position: 'relative',
            boxSizing: 'border-box', color: '#f8fafc'
          }}>
            
            <button 
              onClick={() => {
                setIsReviewModalOpen(false);
                setReviewBooking(null);
                setComment('');
                setRating(5);
              }}
              style={{ position: 'absolute', top: '1.25rem', right: '1.25rem', background: 'rgba(255,255,255,0.05)', border: 'none', borderRadius: '50%', width: '30px', height: '30px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#94a3b8' }}
            >
              <X size={15} />
            </button>

            <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
              <div style={{ display: 'inline-block', background: 'rgba(245, 158, 11, 0.15)', padding: '0.6rem 1.2rem', borderRadius: '999px', fontSize: '0.8rem', fontWeight: 800, color: '#fbbf24', border: '1px solid rgba(245, 158, 11, 0.3)', marginBottom: '1rem' }}>
                ⭐ ĐÁNH GIÁ TRẢI NGHIỆM
              </div>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 900, margin: '0 0 0.5rem', color: '#ffffff' }}>
                {isBuddy ? 'Đánh giá du khách' : 'Đánh giá Local Buddy'}
              </h3>
              <p style={{ color: '#94a3b8', fontSize: '0.85rem', margin: 0 }}>
                {isBuddy 
                  ? `Hãy đánh giá thái độ và sự hợp tác của du khách ${reviewBooking.touristId?.name}.`
                  : `Hãy chia sẻ cảm nhận của bạn về hướng dẫn viên ${reviewBooking.buddyId?.name} và tour của bạn.`
                }
              </p>
            </div>

            {/* Interactive Star Rating */}
            <div style={{ display: 'flex', justifyContent: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
              {[1, 2, 3, 4, 5].map((starValue) => {
                const isHighlighted = hoverRating !== null ? starValue <= hoverRating : starValue <= rating;
                return (
                  <button
                    key={starValue}
                    type="button"
                    onClick={() => setRating(starValue)}
                    onMouseEnter={() => setHoverRating(starValue)}
                    onMouseLeave={() => setHoverRating(null)}
                    style={{
                      background: 'transparent',
                      border: 'none',
                      cursor: 'pointer',
                      padding: 0,
                      transition: 'transform 0.15s ease',
                      outline: 'none'
                    }}
                  >
                    <Star
                      size={36}
                      fill={isHighlighted ? '#fbbf24' : 'transparent'}
                      color={isHighlighted ? '#fbbf24' : '#4b5563'}
                      style={{ transition: 'color 0.2s, fill 0.2s' }}
                    />
                  </button>
                );
              })}
            </div>

            {/* Quick Tags Selection */}
            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.5rem' }}>
                Chọn nhanh đánh giá
              </label>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                {(isBuddy 
                  ? ['Thân thiện', 'Vui vẻ', 'Đúng giờ', 'Hợp tác tốt', 'Tôn trọng']
                  : ['Nhiệt tình', 'Chu đáo', 'Đúng giờ', 'Kể chuyện hay', 'Am hiểu', 'Vui tính']
                ).map(tag => (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => {
                      setComment(prev => {
                        const trimmed = prev.trim();
                        if (!trimmed) return tag;
                        if (trimmed.includes(tag)) return prev; // Avoid duplicate tags
                        return `${trimmed}, ${tag.toLowerCase()}`;
                      });
                    }}
                    style={{
                      padding: '4px 10px',
                      background: 'rgba(255,255,255,0.05)',
                      border: '1px solid rgba(255,255,255,0.1)',
                      borderRadius: '8px',
                      color: '#94a3b8',
                      fontSize: '0.75rem',
                      fontWeight: 600,
                      cursor: 'pointer',
                      transition: 'all 0.2s'
                    }}
                  >
                    + {tag}
                  </button>
                ))}
              </div>
            </div>

            {/* Comment Textarea */}
            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.5rem' }}>
                Bình luận chi tiết
              </label>
              <textarea
                value={comment}
                onChange={e => setComment(e.target.value)}
                placeholder={isBuddy 
                  ? 'Nhập nhận xét về du khách tại đây...' 
                  : 'Hãy chia sẻ những trải nghiệm thú vị trong chuyến đi cùng Buddy...'
                }
                rows={4}
                style={{
                  width: '100%',
                  border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: '12px',
                  padding: '0.75rem',
                  fontSize: '0.88rem',
                  fontFamily: 'inherit',
                  outline: 'none',
                  background: 'rgba(0,0,0,0.2)',
                  color: '#ffffff',
                  boxSizing: 'border-box',
                  resize: 'vertical'
                }}
              />
            </div>

            {/* Submit Button */}
            <button
              onClick={handleSendReview}
              disabled={reviewLoading}
              style={{
                width: '100%',
                padding: '0.9rem',
                background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
                border: 'none',
                borderRadius: '12px',
                color: 'white',
                fontWeight: 800,
                fontSize: '0.95rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '4px',
                boxShadow: '0 4px 15px rgba(245,158,11,0.3)'
              }}
            >
              {reviewLoading ? 'Đang gửi...' : 'Gửi Đánh Giá Ngay'}
            </button>

          </div>
        </div>
      )}

      <style>{`
        @keyframes spin { to { transform: rotate(360deg) } }
        @keyframes scan {
          0% { top: 0%; }
          50% { top: 100%; }
          100% { top: 0%; }
        }
      `}</style>

      {/* ── MODAL KHIẾU NẠI (DISPUTE) ── */}
      {isDisputeModalOpen && disputeBooking && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(15, 23, 42, 0.75)', backdropFilter: 'blur(8px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          zIndex: 9999, padding: '1rem', boxSizing: 'border-box'
        }}>
          <div style={{
            background: '#ffffff', borderRadius: '24px', width: '100%', maxWidth: '480px',
            padding: '2rem', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)',
            border: '1px solid rgba(239,68,68,0.15)', position: 'relative', boxSizing: 'border-box'
          }}>
            <button
              onClick={() => { setIsDisputeModalOpen(false); setDisputeReason(''); }}
              style={{ position: 'absolute', top: '1.25rem', right: '1.25rem', background: 'rgba(0,0,0,0.05)', border: 'none', borderRadius: '50%', width: '30px', height: '30px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
            >
              <X size={15} />
            </button>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.25rem' }}>
              <div style={{ width: '44px', height: '44px', borderRadius: '12px', background: 'rgba(239,68,68,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <AlertTriangle size={22} style={{ color: '#ef4444' }} />
              </div>
              <div>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 800, margin: 0, color: '#1e293b' }}>Gửi Khiếu Nại Chuyến Đi</h3>
                <p style={{ color: 'var(--color-text-muted)', fontSize: '0.78rem', margin: '2px 0 0' }}>Mã booking: {disputeBooking.bookingCode}</p>
              </div>
            </div>

            <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '12px', padding: '0.75rem 1rem', fontSize: '0.8rem', color: '#b91c1c', marginBottom: '1.25rem', lineHeight: 1.5 }}>
              ⚠️ <strong>Lưu ý:</strong> Sau khi gửi khiếu nại, khoản tiền thanh toán sẽ bị đóng băng và không được giải ngân cho Buddy cho đến khi Admin xử lý xong. Chỉ khiếu nại khi bạn thực sự gặp vấn đề nghiêm trọng.
            </div>

            <div style={{ marginBottom: '1.25rem' }}>
              <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#374151', marginBottom: '0.5rem' }}>
                Mô tả vấn đề bạn gặp phải *
              </label>
              <textarea
                value={disputeReason}
                onChange={e => setDisputeReason(e.target.value)}
                placeholder="Ví dụ: Buddy không đến đúng giờ, không dẫn đúng lịch trình đã hứa, có hành vi không phù hợp... (tối thiểu 10 ký tự)"
                rows={5}
                style={{
                  width: '100%', padding: '0.85rem', borderRadius: '12px',
                  border: '1.5px solid #fca5a5', outline: 'none',
                  fontSize: '0.85rem', lineHeight: 1.6, resize: 'vertical',
                  fontFamily: 'inherit', boxSizing: 'border-box', background: '#fff'
                }}
              />
              <div style={{ fontSize: '0.72rem', color: disputeReason.length < 10 ? '#ef4444' : '#10b981', marginTop: '4px', textAlign: 'right' }}>
                {disputeReason.length}/10 ký tự tối thiểu
              </div>
            </div>

            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <button
                onClick={() => { setIsDisputeModalOpen(false); setDisputeReason(''); }}
                style={{ flex: 1, padding: '0.85rem', background: '#f8fafc', border: '1px solid var(--color-border)', borderRadius: '12px', fontWeight: 700, fontSize: '0.9rem', cursor: 'pointer', color: 'var(--color-text)' }}
              >
                Hủy bỏ
              </button>
              <button
                onClick={handleRaiseDispute}
                disabled={disputeLoading || disputeReason.trim().length < 10}
                style={{
                  flex: 2, padding: '0.85rem',
                  background: disputeReason.trim().length >= 10 ? 'linear-gradient(135deg, #ef4444, #dc2626)' : '#e2e8f0',
                  border: 'none', borderRadius: '12px', fontWeight: 800, fontSize: '0.9rem',
                  color: disputeReason.trim().length >= 10 ? 'white' : '#94a3b8',
                  cursor: disputeReason.trim().length >= 10 ? 'pointer' : 'not-allowed',
                  boxShadow: disputeReason.trim().length >= 10 ? '0 4px 15px rgba(239,68,68,0.3)' : 'none'
                }}
              >
                {disputeLoading ? 'Đang gửi...' : '🚩 Gửi Khiếu Nại'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── MODAL GIẢI TRÌNH (DEFENSE) ── */}
      {isDefenseModalOpen && defenseBooking && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(15, 23, 42, 0.75)', backdropFilter: 'blur(8px)',
          zIndex: 10000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem'
        }}>
          <div style={{
            background: 'white', borderRadius: '24px', padding: '2rem', width: '100%', maxWidth: '500px',
            border: '1px solid rgba(14,165,233,0.15)', position: 'relative', boxSizing: 'border-box'
          }}>
            <button
              onClick={() => { setIsDefenseModalOpen(false); setDefenseReason(''); }}
              style={{ position: 'absolute', top: '1.25rem', right: '1.25rem', background: 'rgba(0,0,0,0.05)', border: 'none', borderRadius: '50%', width: '30px', height: '30px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
            >
              <X size={15} />
            </button>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.25rem' }}>
              <div style={{ width: '44px', height: '44px', borderRadius: '12px', background: 'rgba(14,165,233,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <ShieldCheck size={22} style={{ color: '#0ea5e9' }} />
              </div>
              <div>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 800, margin: 0, color: '#1e293b' }}>Gửi Giải Trình</h3>
                <p style={{ color: 'var(--color-text-muted)', fontSize: '0.78rem', margin: '2px 0 0' }}>Mã booking: {defenseBooking.bookingCode}</p>
              </div>
            </div>

            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: '#475569', marginBottom: '8px' }}>
                Lời giải thích của bạn *
              </label>
              <textarea
                value={defenseReason}
                onChange={e => setDefenseReason(e.target.value)}
                placeholder="Vui lòng cung cấp sự việc theo góc nhìn của bạn để Admin có cái nhìn khách quan nhất... (tối thiểu 10 ký tự)"
                rows={5}
                style={{
                  width: '100%', padding: '0.85rem', borderRadius: '12px',
                  border: '1.5px solid #bae6fd', outline: 'none',
                  fontSize: '0.85rem', lineHeight: 1.6, resize: 'vertical',
                  fontFamily: 'inherit', boxSizing: 'border-box', background: '#f0f9ff'
                }}
              />
              <div style={{ fontSize: '0.72rem', color: defenseReason.length < 10 ? '#ef4444' : '#10b981', marginTop: '4px', textAlign: 'right' }}>
                {defenseReason.length}/10 ký tự tối thiểu
              </div>
            </div>

            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <button
                onClick={() => { setIsDefenseModalOpen(false); setDefenseReason(''); }}
                style={{ flex: 1, padding: '0.85rem', background: '#f8fafc', border: '1px solid var(--color-border)', borderRadius: '12px', fontWeight: 700, fontSize: '0.9rem', cursor: 'pointer', color: 'var(--color-text)' }}
              >
                Hủy bỏ
              </button>
              <button
                onClick={handleSubmitDefense}
                disabled={defenseLoading || defenseReason.trim().length < 10}
                style={{
                  flex: 2, padding: '0.85rem',
                  background: defenseReason.trim().length >= 10 ? 'linear-gradient(135deg, #0ea5e9, #0284c7)' : '#e2e8f0',
                  border: 'none', borderRadius: '12px', fontWeight: 800, fontSize: '0.9rem',
                  color: defenseReason.trim().length >= 10 ? 'white' : '#94a3b8',
                  cursor: defenseReason.trim().length >= 10 ? 'pointer' : 'not-allowed',
                  boxShadow: defenseReason.trim().length >= 10 ? '0 4px 15px rgba(14,165,233,0.3)' : 'none'
                }}
              >
                {defenseLoading ? 'Đang gửi...' : 'Gửi Giải Trình'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── MODAL XIN GIA HẠN CHUYẾN ĐI (+GIỜ) ── */}
      {isExtendModalOpen && extendBookingItem && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(15, 23, 42, 0.75)', backdropFilter: 'blur(8px)',
          zIndex: 10000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem'
        }}>
          <div style={{
            background: 'white', borderRadius: '24px', padding: '2rem', width: '100%', maxWidth: '480px',
            border: '1px solid rgba(59,130,246,0.15)', position: 'relative', boxSizing: 'border-box'
          }}>
            <button
              onClick={() => { setIsExtendModalOpen(false); setExtendBookingItem(null); setExtendHours(1); setExtendReason(''); }}
              style={{ position: 'absolute', top: '1.25rem', right: '1.25rem', background: 'rgba(0,0,0,0.05)', border: 'none', borderRadius: '50%', width: '30px', height: '30px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
            >
              <X size={15} />
            </button>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.25rem' }}>
              <div style={{ width: '44px', height: '44px', borderRadius: '12px', background: 'rgba(59,130,246,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <PlusCircle size={22} style={{ color: '#3b82f6' }} />
              </div>
              <div>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 800, margin: 0, color: '#1e293b' }}>Xin Gia Hạn Chuyến Đi</h3>
                <p style={{ color: 'var(--color-text-muted)', fontSize: '0.78rem', margin: '2px 0 0' }}>Mã booking: {extendBookingItem.bookingCode}</p>
              </div>
            </div>

            <div style={{ marginBottom: '1.25rem' }}>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: '#475569', marginBottom: '8px' }}>
                Số giờ muốn đi thêm (+Giờ) *
              </label>
              <div style={{ display: 'flex', gap: '8px', marginBottom: '10px' }}>
                {[1, 2, 3, 4].map(h => (
                  <button
                    key={h}
                    type="button"
                    onClick={() => setExtendHours(h)}
                    style={{
                      flex: 1, padding: '0.65rem 0', borderRadius: '10px',
                      border: extendHours === h ? '2px solid #3b82f6' : '1px solid var(--color-border)',
                      background: extendHours === h ? '#eff6ff' : '#f8fafc',
                      color: extendHours === h ? '#2563eb' : 'var(--color-text)',
                      fontWeight: 800, cursor: 'pointer', fontSize: '0.9rem'
                    }}
                  >
                    +{h}h
                  </button>
                ))}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '0.82rem', color: '#64748b' }}>Hoặc nhập số giờ tùy chỉnh:</span>
                <input
                  type="number"
                  min="0.5"
                  step="0.5"
                  value={extendHours}
                  onChange={e => setExtendHours(Math.max(0.5, Number(e.target.value)))}
                  style={{ width: '80px', padding: '0.4rem 0.6rem', borderRadius: '8px', border: '1px solid #cbd5e1', fontWeight: 700, fontSize: '0.85rem', textAlign: 'center' }}
                />
              </div>
            </div>

            <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '14px', padding: '1rem', marginBottom: '1.25rem', fontSize: '0.82rem', display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#64748b' }}>Đơn giá theo giờ:</span>
                <span style={{ fontWeight: 600 }}>{extendBookingItem.pricePerHourSnapshot.toLocaleString()} ₫/h</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#64748b' }}>Thời gian gia hạn thêm:</span>
                <span style={{ fontWeight: 700, color: '#3b82f6' }}>+{extendHours} giờ</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px dashed #cbd5e1', paddingTop: '0.4rem', marginTop: '0.2rem', fontWeight: 800, fontSize: '0.95rem', color: '#ef4444' }}>
                <span>Phí gia hạn phát sinh:</span>
                <span>{(extendBookingItem.pricePerHourSnapshot * extendHours).toLocaleString()} ₫</span>
              </div>
              <div style={{ fontSize: '0.72rem', color: '#64748b', fontStyle: 'italic', marginTop: '4px' }}>
                💡 Nếu tour đã thanh toán, hệ thống sẽ tự động khấu trừ số dư ví UniTravel ngay sau khi Buddy đồng ý gia hạn.
              </div>
              {extendBookingItem.paymentStatus === 'paid' && user?.walletBalance !== undefined && user.walletBalance < (extendBookingItem.pricePerHourSnapshot * extendHours) && (
                <div style={{
                  background: 'rgba(239, 68, 68, 0.08)',
                  border: '1px solid rgba(239, 68, 68, 0.3)',
                  borderRadius: '12px', padding: '0.75rem', marginTop: '0.75rem',
                  display: 'flex', flexDirection: 'column', gap: '6px'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#ef4444', fontWeight: 700, fontSize: '0.82rem' }}>
                    <span>⚠️ Số dư ví không đủ để gia hạn tự động!</span>
                  </div>
                  <div style={{ fontSize: '0.78rem', color: '#475569', display: 'flex', justifyContent: 'space-between' }}>
                    <span>Ví hiện có:</span>
                    <span style={{ fontWeight: 700 }}>{(user.walletBalance || 0).toLocaleString()} ₫</span>
                  </div>
                  <div style={{ fontSize: '0.78rem', color: '#ef4444', display: 'flex', justifyContent: 'space-between' }}>
                    <span>Còn thiếu:</span>
                    <span style={{ fontWeight: 800 }}>{((extendBookingItem.pricePerHourSnapshot * extendHours) - (user.walletBalance || 0)).toLocaleString()} ₫</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setIsExtendModalOpen(false);
                      navigate('/wallet');
                    }}
                    style={{
                      marginTop: '4px', padding: '6px 12px', background: '#ef4444', color: 'white',
                      border: 'none', borderRadius: '8px', fontWeight: 700, fontSize: '0.78rem', cursor: 'pointer',
                      textAlign: 'center'
                    }}
                  >
                    + Nạp thêm tiền vào ví ngay
                  </button>
                </div>
              )}
            </div>

            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: '#475569', marginBottom: '8px' }}>
                Ghi chú cho Buddy (Tùy chọn)
              </label>
              <textarea
                value={extendReason}
                onChange={e => setExtendReason(e.target.value)}
                placeholder="Ví dụ: Mình muốn ghé thêm quán ăn bên cạnh, bạn đi cùng thêm 2 tiếng nhé..."
                rows={3}
                style={{
                  width: '100%', padding: '0.75rem', borderRadius: '12px',
                  border: '1px solid #cbd5e1', outline: 'none',
                  fontSize: '0.85rem', lineHeight: 1.5, resize: 'vertical',
                  fontFamily: 'inherit', boxSizing: 'border-box'
                }}
              />
            </div>

            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <button
                onClick={() => { setIsExtendModalOpen(false); setExtendBookingItem(null); setExtendHours(1); setExtendReason(''); }}
                style={{ flex: 1, padding: '0.85rem', background: '#f8fafc', border: '1px solid var(--color-border)', borderRadius: '12px', fontWeight: 700, fontSize: '0.9rem', cursor: 'pointer', color: 'var(--color-text)' }}
              >
                Hủy bỏ
              </button>
              <button
                onClick={handleRequestExtension}
                disabled={extendLoading || !extendHours || extendHours <= 0}
                style={{
                  flex: 2, padding: '0.85rem',
                  background: 'linear-gradient(135deg, #3b82f6, #2563eb)',
                  border: 'none', borderRadius: '12px', fontWeight: 800, fontSize: '0.9rem',
                  color: 'white', cursor: extendLoading ? 'not-allowed' : 'pointer',
                  boxShadow: '0 4px 15px rgba(59,130,246,0.3)'
                }}
              >
                {extendLoading ? 'Đang gửi yêu cầu...' : 'Gửi Yêu Cầu Gia Hạn'}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default MyBookingsPage;
