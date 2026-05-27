import { useState, useEffect } from 'react';
import Navbar from '../components/layout/Navbar';
import { bookingApi, type IBooking } from '../api/booking.api';
import { useAuthStore } from '../store/authStore';
import { 
  ChevronLeft, ChevronRight, Calendar, Clock, 
  MessageSquare, MapPin, Navigation, ArrowRight, X, Sparkles
} from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';
import toast from 'react-hot-toast';

import { MapContainer, TileLayer, Marker } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';
import iconRetina from 'leaflet/dist/images/marker-icon-2x.png';

let DefaultIcon = L.icon({
    iconUrl: icon,
    iconRetinaUrl: iconRetina,
    shadowUrl: iconShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    tooltipAnchor: [16, -28],
});
L.Marker.prototype.options.icon = DefaultIcon;

export const CalendarPage = () => {
    const { accessToken, user } = useAuthStore();
    const navigate = useNavigate();

    const [bookings, setBookings] = useState<IBooking[]>([]);
    const [loading, setLoading] = useState(true);
    const [currentDate, setCurrentDate] = useState<Date>(new Date());
    const [selectedDate, setSelectedDate] = useState<Date | null>(new Date());
    const [selectedBooking, setSelectedBooking] = useState<IBooking | null>(null);
    const [filterStatus, setFilterStatus] = useState<'all' | 'paid' | 'unpaid'>('all');

    const isBuddy = user?.role === 'buddy';

    // Fetch all bookings of the user
    useEffect(() => {
        if (accessToken) {
            setLoading(true);
            bookingApi.getMyBookings()
                .then(res => {
                    setBookings(res.data.result || []);
                })
                .catch(err => {
                    toast.error(err.response?.data?.message || 'Không thể tải lịch trình.');
                })
                .finally(() => {
                    setLoading(false);
                });
        } else {
            setLoading(false);
        }
    }, [accessToken]);

    // Calendar utility functions
    const getDaysInMonth = (year: number, month: number) => {
        return new Date(year, month + 1, 0).getDate();
    };

    const getCalendarCells = (year: number, month: number) => {
        const cells = [];
        
        // First day of current month (0 = Sunday, 1 = Monday, etc.)
        const firstDayIndexRaw = new Date(year, month, 1).getDay();
        // Convert to 0 = Monday, ..., 6 = Sunday index
        const firstDayIndex = firstDayIndexRaw === 0 ? 6 : firstDayIndexRaw - 1;
        
        // Days in current month
        const daysInCurrentMonth = getDaysInMonth(year, month);
        // Days in previous month
        const daysInPrevMonth = month === 0 ? getDaysInMonth(year - 1, 11) : getDaysInMonth(year, month - 1);
        
        // Prepend previous month days
        for (let i = firstDayIndex - 1; i >= 0; i--) {
            const prevDay = daysInPrevMonth - i;
            const prevDate = new Date(month === 0 ? year - 1 : year, month === 0 ? 11 : month - 1, prevDay);
            cells.push({
                dayNum: prevDay,
                date: prevDate,
                isCurrentMonth: false,
            });
        }
        
        // Current month days
        for (let i = 1; i <= daysInCurrentMonth; i++) {
            const currDate = new Date(year, month, i);
            cells.push({
                dayNum: i,
                date: currDate,
                isCurrentMonth: true,
            });
        }
        
        // Append next month days to make grid complete (multiple of 7, usually 35 or 42 cells)
        const totalCells = cells.length > 35 ? 42 : 35;
        const remaining = totalCells - cells.length;
        for (let i = 1; i <= remaining; i++) {
            const nextDate = new Date(month === 11 ? year + 1 : year, month === 11 ? 0 : month + 1, i);
            cells.push({
                dayNum: i,
                date: nextDate,
                isCurrentMonth: false,
            });
        }
        
        return cells;
    };

    const isSameDay = (d1: Date, d2: Date) => {
        return d1.getFullYear() === d2.getFullYear() &&
               d1.getMonth() === d2.getMonth() &&
               d1.getDate() === d2.getDate();
    };

    const isToday = (d: Date) => {
        return isSameDay(d, new Date());
    };

    // Filter bookings for a specific day
    const getBookingsForDay = (date: Date) => {
        return bookings.filter(b => isSameDay(new Date(b.scheduledDate), date));
    };

    // Navigation handlers
    const handlePrevMonth = () => {
        setCurrentDate(prev => new Date(prev.getFullYear(), prev.getMonth() - 1, 1));
    };

    const handleNextMonth = () => {
        setCurrentDate(prev => new Date(prev.getFullYear(), prev.getMonth() + 1, 1));
    };

    const handleGoToToday = () => {
        const today = new Date();
        setCurrentDate(today);
        setSelectedDate(today);
    };

    // Agenda categorization logic
    const getSortedAgendaBookings = () => {
        const now = new Date();
        now.setHours(0, 0, 0, 0);

        const tomorrow = new Date(now);
        tomorrow.setDate(now.getDate() + 1);

        const endOfWeek = new Date(now);
        endOfWeek.setDate(now.getDate() + (7 - now.getDay())); // End of current week (Sunday)

        const filtered = bookings.filter(b => {
            if (filterStatus === 'paid') return b.paymentStatus === 'paid' && b.status !== 'cancelled';
            if (filterStatus === 'unpaid') return b.paymentStatus === 'unpaid' && b.status !== 'cancelled';
            return true;
        });

        // Sort chronologically
        filtered.sort((a, b) => {
            const dateA = new Date(a.scheduledDate);
            const [ha, ma] = a.startTime.split(':').map(Number);
            dateA.setHours(ha, ma, 0, 0);

            const dateB = new Date(b.scheduledDate);
            const [hb, mb] = b.startTime.split(':').map(Number);
            dateB.setHours(hb, mb, 0, 0);

            return dateA.getTime() - dateB.getTime();
        });

        const todayItems: IBooking[] = [];
        const tomorrowItems: IBooking[] = [];
        const weekItems: IBooking[] = [];
        const upcomingItems: IBooking[] = [];

        filtered.forEach(b => {
            const bDate = new Date(b.scheduledDate);
            bDate.setHours(0,0,0,0);

            if (isSameDay(bDate, now)) {
                todayItems.push(b);
            } else if (isSameDay(bDate, tomorrow)) {
                tomorrowItems.push(b);
            } else if (bDate > tomorrow && bDate <= endOfWeek) {
                weekItems.push(b);
            } else if (bDate > tomorrow) {
                upcomingItems.push(b);
            }
        });

        return { todayItems, tomorrowItems, weekItems, upcomingItems };
    };

    // Event colors based on status
    const getStatusColor = (status: string, paymentStatus: string) => {
        if (status === 'cancelled') {
            return {
                bg: '#f1f5f9',
                border: '#cbd5e1',
                text: '#64748b',
                label: 'Đã hủy'
            };
        }
        if (status === 'completed') {
            return {
                bg: '#f8fafc',
                border: '#e2e8f0',
                text: '#64748b',
                label: 'Đã hoàn thành'
            };
        }
        if (paymentStatus === 'unpaid') {
            return {
                bg: 'rgba(245, 158, 11, 0.08)',
                border: 'rgba(245, 158, 11, 0.3)',
                text: '#d97706',
                label: 'Chờ thanh toán'
            };
        }
        return {
            bg: 'rgba(16, 185, 129, 0.08)',
            border: 'rgba(16, 185, 129, 0.3)',
            text: '#059669',
            label: 'Đã thanh toán'
        };
    };

    const handleChatRedirect = (partnerId: string) => {
        if (!accessToken) return;
        toast.loading('Đang mở hộp thoại chat...');
        // Redirect to conversation page. Frontend will auto-select or trigger conversation.
        setTimeout(() => {
            toast.dismiss();
            navigate(`/conversations?partnerId=${partnerId}`);
        }, 600);
    };

    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const calendarCells = getCalendarCells(year, month);

    const monthNames = [
        'Tháng Một', 'Tháng Hai', 'Tháng Ba', 'Tháng Tư', 'Tháng Năm', 'Tháng Sáu',
        'Tháng Bảy', 'Tháng Tám', 'Tháng Chín', 'Tháng Mười', 'Tháng Mười Một', 'Tháng Mười Hai'
    ];

    const { todayItems, tomorrowItems, weekItems, upcomingItems } = getSortedAgendaBookings();

    return (
        <div style={{ minHeight: '100vh', background: 'var(--color-bg)', fontFamily: "'Inter', -apple-system, sans-serif", color: 'var(--color-text)' }}>
            <Navbar />
            <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '7.5rem 1.5rem 3.5rem' }}>
                
                {/* Header Welcome banner */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
                    <div>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'rgba(14, 165, 233, 0.08)', border: '1px solid rgba(14, 165, 233, 0.25)', color: 'var(--color-primary)', padding: '4px 12px', borderRadius: '999px', fontSize: '0.78rem', fontWeight: 700, width: 'fit-content', marginBottom: '0.5rem' }}>
                            <Sparkles size={12} /> {isBuddy ? 'Chế độ Hướng dẫn viên' : 'Chế độ Du khách'}
                        </span>
                        <h1 style={{ fontSize: '2rem', fontWeight: 900, letterSpacing: '-0.025em', margin: 0 }}>Lịch Trình Chi Tiết</h1>
                        <p style={{ color: 'var(--color-text-muted)', fontSize: '0.9rem', margin: '4px 0 0' }}>
                            {isBuddy ? 'Theo dõi các booking dẫn khách và sắp xếp thời gian biểu cá nhân' : 'Theo dõi toàn bộ chặng đường khám phá và booking đã đặt của bạn'}
                        </p>
                    </div>
                    <button onClick={handleGoToToday} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: '#ffffff', border: '1px solid rgba(14,165,233,0.2)', padding: '0.6rem 1.25rem', borderRadius: '12px', color: 'var(--color-primary)', fontWeight: 700, fontSize: '0.88rem', cursor: 'pointer', transition: 'all 0.2s', boxShadow: '0 4px 12px rgba(14,165,233,0.02)' }}
                        onMouseEnter={e => { e.currentTarget.style.background = 'rgba(14,165,233,0.05)'; e.currentTarget.style.borderColor = 'rgba(14,165,233,0.4)'; }}
                        onMouseLeave={e => { e.currentTarget.style.background = '#ffffff'; e.currentTarget.style.borderColor = 'rgba(14,165,233,0.2)'; }}
                    >
                        <Calendar size={16} /> Lịch hôm nay
                    </button>
                </div>

                {/* Main 2-Column Grid */}
                <div style={{ display: 'grid', gridTemplateColumns: '2fr 1.1fr', gap: '2rem', alignItems: 'start' }}>
                    
                    {/* Left: Monthly Calendar Component */}
                    <div style={{ background: '#ffffff', border: '1px solid rgba(14, 165, 233, 0.12)', borderRadius: '24px', padding: '1.75rem', boxShadow: '0 8px 30px rgba(14,165,233,0.02)' }}>
                        
                        {/* Month Selector header */}
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                            <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--color-text)', margin: 0 }}>
                                {monthNames[month]} {year}
                            </h2>
                            <div style={{ display: 'flex', gap: '0.5rem' }}>
                                <button onClick={handlePrevMonth} style={{ background: '#ffffff', border: '1px solid #cbd5e1', borderRadius: '10px', width: '36px', height: '36px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#64748b', transition: 'all 0.15s' }}
                                    onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--color-primary)'}
                                    onMouseLeave={e => e.currentTarget.style.borderColor = '#cbd5e1'}
                                >
                                    <ChevronLeft size={18} />
                                </button>
                                <button onClick={handleNextMonth} style={{ background: '#ffffff', border: '1px solid #cbd5e1', borderRadius: '10px', width: '36px', height: '36px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#64748b', transition: 'all 0.15s' }}
                                    onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--color-primary)'}
                                    onMouseLeave={e => e.currentTarget.style.borderColor = '#cbd5e1'}
                                >
                                    <ChevronRight size={18} />
                                </button>
                            </div>
                        </div>

                        {/* Weekday headers */}
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '6px', textAlign: 'center', borderBottom: '1px solid rgba(14,165,233,0.08)', paddingBottom: '0.75rem', marginBottom: '0.5rem' }}>
                            {['Th 2', 'Th 3', 'Th 4', 'Th 5', 'Th 6', 'Th 7', 'CN'].map((w, idx) => (
                                <span key={idx} style={{ fontSize: '0.75rem', fontWeight: 700, color: idx === 6 ? '#ef4444' : 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em', paddingBottom: '0.5rem' }}>
                                    {w}
                                </span>
                            ))}
                        </div>

                        {/* Loading Overlay or Calendar Cells */}
                        {loading ? (
                            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '380px', gap: '1rem' }}>
                                <div style={{ width: '40px', height: '40px', border: '3px solid rgba(14,165,233,0.15)', borderTopColor: 'var(--color-primary)', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
                                <span style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>Đang tải lịch trình...</span>
                            </div>
                        ) : (
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '6px' }}>
                                {calendarCells.map((cell, idx) => {
                                    const dayBookings = getBookingsForDay(cell.date);
                                    const isSel = selectedDate && isSameDay(cell.date, selectedDate);
                                    const isTodayCell = isToday(cell.date);

                                    return (
                                        <div key={idx} 
                                            onClick={() => setSelectedDate(cell.date)}
                                            style={{
                                                minHeight: '85px', background: cell.isCurrentMonth ? '#ffffff' : '#f8fafc',
                                                border: `1px solid ${isSel ? 'var(--color-primary)' : 'rgba(14, 165, 233, 0.08)'}`,
                                                borderRadius: '12px', padding: '6px', cursor: 'pointer',
                                                transition: 'all 0.2s', position: 'relative',
                                                display: 'flex', flexDirection: 'column', gap: '4px',
                                                boxShadow: isSel ? '0 0 0 3px rgba(14, 165, 233, 0.15)' : 'none'
                                            }}
                                            onMouseEnter={e => {
                                                if (!isSel) {
                                                    e.currentTarget.style.borderColor = 'rgba(14, 165, 233, 0.3)';
                                                    e.currentTarget.style.background = '#f0f9ff40';
                                                }
                                            }}
                                            onMouseLeave={e => {
                                                if (!isSel) {
                                                    e.currentTarget.style.borderColor = 'rgba(14, 165, 233, 0.08)';
                                                    e.currentTarget.style.background = cell.isCurrentMonth ? '#ffffff' : '#f8fafc';
                                                }
                                            }}
                                        >
                                            {/* Day Number and Indicators */}
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                <span style={{
                                                    fontSize: '0.85rem', fontWeight: isTodayCell || isSel ? 800 : 500,
                                                    color: isTodayCell ? 'white' : cell.isCurrentMonth ? 'var(--color-text)' : '#94a3b8',
                                                    background: isTodayCell ? 'var(--color-primary)' : 'transparent',
                                                    width: '24px', height: '24px', borderRadius: '50%',
                                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                    boxShadow: isTodayCell ? '0 2px 6px rgba(2,132,199,0.3)' : 'none'
                                                }}>
                                                    {cell.dayNum}
                                                </span>
                                                {dayBookings.length > 0 && (
                                                    <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'var(--color-primary)', display: 'inline-block' }} />
                                                )}
                                            </div>

                                            {/* Day Bookings mini pills list */}
                                            <div style={{ display: 'flex', flexDirection: 'column', gap: '3px', overflow: 'hidden', flex: 1 }}>
                                                {dayBookings.slice(0, 2).map(b => {
                                                    const statusCfg = getStatusColor(b.status, b.paymentStatus);
                                                    const partnerName = isBuddy ? b.touristId?.name : b.buddyId?.name;
                                                    const title = isBuddy 
                                                        ? `${b.startTime} - ${partnerName || 'Khách'}` 
                                                        : `${b.startTime} - ${b.experienceId?.title || 'Tour'}`;

                                                    return (
                                                        <div key={b._id} 
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                setSelectedBooking(b);
                                                            }}
                                                            style={{
                                                                fontSize: '0.68rem', fontWeight: 700, padding: '2px 6px',
                                                                borderRadius: '6px', background: statusCfg.bg,
                                                                border: `1px solid ${statusCfg.border}`, color: statusCfg.text,
                                                                whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden',
                                                                cursor: 'pointer', transition: 'transform 0.15s'
                                                            }}
                                                            onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.03)'}
                                                            onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
                                                        >
                                                            {title}
                                                        </div>
                                                    );
                                                })}
                                                {dayBookings.length > 2 && (
                                                    <span style={{ fontSize: '0.6rem', color: 'var(--color-text-muted)', fontWeight: 600, paddingLeft: '4px' }}>
                                                        +{dayBookings.length - 2} lịch khác
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>

                    {/* Right Column: Sidebar Agenda timeline list */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                        
                        {/* Selected day summary details */}
                        <div style={{ background: '#ffffff', border: '1px solid rgba(14, 165, 233, 0.12)', borderRadius: '24px', padding: '1.5rem', boxShadow: '0 8px 30px rgba(14,165,233,0.02)' }}>
                            <h3 style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--color-text)', margin: '0 0 1rem', display: 'flex', alignItems: 'center', gap: '0.5rem', borderBottom: '1px solid rgba(14,165,233,0.06)', paddingBottom: '0.75rem' }}>
                                📅 Ngày {selectedDate?.toLocaleDateString('vi-VN')}
                            </h3>

                            {selectedDate && getBookingsForDay(selectedDate).length === 0 ? (
                                <div style={{ textAlign: 'center', padding: '1.5rem 1rem' }}>
                                    <div style={{ fontSize: '1.75rem', marginBottom: '0.5rem' }}>🕊️</div>
                                    <p style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', margin: 0 }}>
                                        Không có lịch trình bận nào vào ngày này. Hãy thảnh thơi tận hưởng nhé!
                                    </p>
                                </div>
                            ) : (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                                    {selectedDate && getBookingsForDay(selectedDate).map(b => {
                                        const statusCfg = getStatusColor(b.status, b.paymentStatus);
                                        const partnerName = isBuddy ? b.touristId?.name : b.buddyId?.name;

                                        return (
                                            <div key={b._id} 
                                                onClick={() => setSelectedBooking(b)}
                                                style={{
                                                    display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.75rem',
                                                    border: '1px solid rgba(14,165,233,0.1)', borderRadius: '14px',
                                                    cursor: 'pointer', transition: 'all 0.2s', background: '#f8fafc'
                                                }}
                                                onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--color-primary)'; e.currentTarget.style.background = '#ffffff'; }}
                                                onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(14,165,233,0.1)'; e.currentTarget.style.background = '#f8fafc'; }}
                                            >
                                                <div style={{
                                                    background: statusCfg.bg, border: `1px solid ${statusCfg.border}`,
                                                    color: statusCfg.text, borderRadius: '10px', padding: '0.4rem 0.6rem',
                                                    display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                                                    fontSize: '0.75rem', fontWeight: 800, minWidth: '55px'
                                                }}>
                                                    <span>{b.startTime}</span>
                                                    <span style={{ fontSize: '0.62rem', fontWeight: 500 }}>({b.hours}h)</span>
                                                </div>
                                                <div style={{ flex: 1, minWidth: 0 }}>
                                                    <p style={{ margin: 0, fontSize: '0.85rem', fontWeight: 700, color: 'var(--color-text)', whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }}>
                                                        {b.experienceId?.title || 'Trải nghiệm'}
                                                    </p>
                                                    <p style={{ margin: '2px 0 0', fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>
                                                        {isBuddy ? 'Khách:' : 'Buddy:'} <strong>{partnerName || 'Chưa cập nhật'}</strong>
                                                    </p>
                                                </div>
                                                <ArrowRight size={14} style={{ color: '#94a3b8' }} />
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>

                        {/* Quick filter & Timeline */}
                        <div style={{ background: '#ffffff', border: '1px solid rgba(14, 165, 233, 0.12)', borderRadius: '24px', padding: '1.5rem', boxShadow: '0 8px 30px rgba(14,165,233,0.02)', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(14,165,233,0.06)', paddingBottom: '0.75rem' }}>
                                <h3 style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--color-text)', margin: 0 }}>
                                    Trình tự thời gian
                                </h3>
                                <select value={filterStatus} onChange={e => setFilterStatus(e.target.value as any)}
                                    style={{
                                        border: '1px solid #cbd5e1', borderRadius: '8px', padding: '0.3rem 0.5rem',
                                        fontSize: '0.78rem', fontWeight: 600, color: '#475569', outline: 'none', background: 'white'
                                    }}
                                >
                                    <option value='all'>Tất cả trạng thái</option>
                                    <option value='paid'>Đã thanh toán</option>
                                    <option value='unpaid'>Chờ thanh toán</option>
                                </select>
                            </div>

                            {/* Timeline Content */}
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', maxHeight: '420px', overflowY: 'auto', paddingRight: '4px' }}>
                                {[
                                    { title: 'Hôm nay', items: todayItems },
                                    { title: 'Ngày mai', items: tomorrowItems },
                                    { title: 'Trong tuần này', items: weekItems },
                                    { title: 'Lịch trình sắp tới', items: upcomingItems }
                                ].map((group, idx) => {
                                    if (group.items.length === 0) return null;

                                    return (
                                        <div key={idx}>
                                            <h4 style={{ fontSize: '0.78rem', fontWeight: 800, color: 'var(--color-primary)', textTransform: 'uppercase', letterSpacing: '0.05em', margin: '0 0 0.6rem' }}>
                                                {group.title} ({group.items.length})
                                            </h4>
                                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem', borderLeft: '2px solid rgba(14,165,233,0.1)', paddingLeft: '0.85rem', marginLeft: '0.4rem' }}>
                                                {group.items.map(b => {
                                                    const statusCfg = getStatusColor(b.status, b.paymentStatus);
                                                    const partnerName = isBuddy ? b.touristId?.name : b.buddyId?.name;

                                                    return (
                                                        <div key={b._id} 
                                                            onClick={() => setSelectedBooking(b)}
                                                            style={{
                                                                background: '#f8fafc', padding: '0.75rem', borderRadius: '12px',
                                                                cursor: 'pointer', transition: 'all 0.15s'
                                                            }}
                                                            onMouseEnter={e => { e.currentTarget.style.background = '#f0f9ff50'; e.currentTarget.style.transform = 'translateX(2px)'; }}
                                                            onMouseLeave={e => { e.currentTarget.style.background = '#f8fafc'; e.currentTarget.style.transform = 'translateX(0)'; }}
                                                        >
                                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.25rem' }}>
                                                                <span style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--color-text-muted)' }}>
                                                                    {new Date(b.scheduledDate).toLocaleDateString('vi-VN')}
                                                                </span>
                                                                <span style={{ fontSize: '0.65rem', fontWeight: 800, background: statusCfg.bg, color: statusCfg.text, padding: '1px 6px', borderRadius: '4px' }}>
                                                                    {statusCfg.label}
                                                                </span>
                                                            </div>
                                                            <p style={{ margin: 0, fontSize: '0.82rem', fontWeight: 700, color: 'var(--color-text)', whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }}>
                                                                {b.experienceId?.title || 'Tour trải nghiệm'}
                                                            </p>
                                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '4px', fontSize: '0.72rem', color: 'var(--color-text-faint)' }}>
                                                                <span>⏰ {b.startTime} ({b.hours}h)</span>
                                                                <span style={{ color: 'var(--color-text-muted)' }}>{partnerName}</span>
                                                            </div>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    );
                                })}

                                {todayItems.length === 0 && tomorrowItems.length === 0 && weekItems.length === 0 && upcomingItems.length === 0 && (
                                    <div style={{ textAlign: 'center', padding: '2rem 1rem' }}>
                                        <div style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>🧭</div>
                                        <p style={{ fontSize: '0.82rem', color: 'var(--color-text-muted)', margin: 0 }}>
                                            Bạn chưa có hoạt động nào trong lịch trình. Hãy khám phá và đặt tour ngay hôm nay!
                                        </p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Event Detail Modal (Glassmorphism drawer dialog) */}
            {selectedBooking && (
                <div style={{
                    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                    background: 'rgba(15, 23, 42, 0.45)', backdropFilter: 'blur(10px)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    zIndex: 9999, padding: '1.5rem', boxSizing: 'border-box'
                }}>
                    <div style={{
                        background: '#ffffff', border: '1px solid rgba(14, 165, 233, 0.2)',
                        borderRadius: '28px', maxWidth: '520px', width: '100%',
                        boxShadow: '0 25px 50px -12px rgba(15, 23, 42, 0.25)',
                        overflow: 'hidden', position: 'relative',
                        animation: 'fadeIn 0.3s cubic-bezier(0.16, 1, 0.3, 1)'
                    }}>
                        
                        {/* Header Banner */}
                        <div style={{
                            background: 'linear-gradient(135deg, rgba(14, 165, 233, 0.08) 0%, rgba(2, 132, 199, 0.04) 100%)',
                            borderBottom: '1px solid rgba(14, 165, 233, 0.15)',
                            padding: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'start'
                        }}>
                            <div>
                                <span style={{ fontSize: '0.68rem', fontWeight: 800, background: 'var(--gradient-primary)', color: 'white', padding: '2px 8px', borderRadius: '999px', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                                    Mã: {selectedBooking.bookingCode}
                                </span>
                                <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--color-text)', margin: '0.5rem 0 0' }}>
                                    Chi Tiết Lịch Trình Chuyến Đi
                                </h3>
                            </div>
                            <button onClick={() => setSelectedBooking(null)}
                                style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '50%', width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#64748b', transition: 'all 0.15s' }}
                                onMouseEnter={e => e.currentTarget.style.color = '#ef4444'}
                                onMouseLeave={e => e.currentTarget.style.color = '#64748b'}
                            >
                                <X size={16} />
                            </button>
                        </div>

                        {/* Modal Body */}
                        <div style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.25rem', maxHeight: '480px', overflowY: 'auto' }}>
                            
                            {/* Experience Info */}
                            <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', background: '#f8fafc', padding: '0.85rem', borderRadius: '16px' }}>
                                <div style={{ width: '70px', height: '70px', borderRadius: '12px', background: 'var(--gradient-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: '1.5rem', flexShrink: 0 }}>
                                    ✈️
                                </div>
                                <div style={{ flex: 1, minWidth: 0 }}>
                                    <h4 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 800, color: 'var(--color-text)', display: 'block', whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }}>
                                        {selectedBooking.experienceId?.title || 'Chuyến đi trải nghiệm'}
                                    </h4>
                                    <p style={{ margin: '4px 0 0', fontSize: '0.82rem', fontWeight: 700, color: 'var(--color-primary)' }}>
                                        {selectedBooking.totalPrice.toLocaleString('vi-VN')} ₫
                                    </p>
                                </div>
                            </div>

                            {/* Schedule info block */}
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                <div style={{ background: '#f8fafc', padding: '0.85rem', borderRadius: '14px', border: '1px solid rgba(14,165,233,0.06)' }}>
                                    <span style={{ fontSize: '0.65rem', fontWeight: 700, color: 'var(--color-text-faint)', textTransform: 'uppercase', display: 'block', marginBottom: '4px' }}>Khởi hành</span>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.82rem', fontWeight: 700, color: 'var(--color-text)' }}>
                                        <Calendar size={14} style={{ color: 'var(--color-primary)' }} />
                                        <span>{new Date(selectedBooking.scheduledDate).toLocaleDateString('vi-VN')}</span>
                                    </div>
                                </div>
                                <div style={{ background: '#f8fafc', padding: '0.85rem', borderRadius: '14px', border: '1px solid rgba(14,165,233,0.06)' }}>
                                    <span style={{ fontSize: '0.65rem', fontWeight: 700, color: 'var(--color-text-faint)', textTransform: 'uppercase', display: 'block', marginBottom: '4px' }}>Khung giờ</span>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.82rem', fontWeight: 700, color: 'var(--color-text)' }}>
                                        <Clock size={14} style={{ color: 'var(--color-primary)' }} />
                                        <span>{selectedBooking.startTime} ({selectedBooking.hours} giờ)</span>
                                    </div>
                                </div>
                            </div>

                            {/* Partner Info Profile block */}
                            <div style={{ border: '1px solid rgba(14,165,233,0.1)', borderRadius: '18px', padding: '1rem' }}>
                                <h5 style={{ margin: '0 0 0.75rem', fontSize: '0.75rem', fontWeight: 800, color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                                    {isBuddy ? 'Thông tin Khách du lịch (Tourist)' : 'Thông tin Hướng dẫn viên (Buddy)'}
                                </h5>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
                                    <div style={{ width: '46px', height: '46px', borderRadius: '50%', background: 'var(--gradient-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 700, fontSize: '1rem', overflow: 'hidden' }}>
                                        {isBuddy ? (selectedBooking.touristId?.name?.charAt(0) || 'T') : (selectedBooking.buddyId?.name?.charAt(0) || 'B')}
                                    </div>
                                    <div style={{ flex: 1 }}>
                                        <h6 style={{ margin: 0, fontSize: '0.88rem', fontWeight: 800, color: 'var(--color-text)' }}>
                                            {isBuddy ? selectedBooking.touristId?.name : selectedBooking.buddyId?.name}
                                        </h6>
                                        <p style={{ margin: '2px 0 0', fontSize: '0.72rem', color: 'var(--color-text-muted)' }}>
                                            📬 {isBuddy ? selectedBooking.touristId?.email : selectedBooking.buddyId?.email}
                                        </p>
                                    </div>
                                    <button 
                                        onClick={() => handleChatRedirect(isBuddy ? selectedBooking.touristId?._id : selectedBooking.buddyId?._id)}
                                        style={{ background: 'var(--gradient-primary)', border: 'none', borderRadius: '10px', padding: '0.5rem 0.85rem', color: 'white', fontWeight: 700, fontSize: '0.78rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px', boxShadow: '0 4px 12px rgba(2,132,199,0.2)' }}
                                    >
                                        <MessageSquare size={13} /> Chat ngay
                                    </button>
                                </div>
                            </div>

                            {/* Meeting point map */}
                            {selectedBooking.meetingPoint && (
                                <div style={{ background: '#f8fafc', padding: '0.85rem', borderRadius: '16px', border: '1px solid rgba(14,165,233,0.06)' }}>
                                    <span style={{ fontSize: '0.65rem', fontWeight: 700, color: 'var(--color-text-faint)', textTransform: 'uppercase', display: 'block', marginBottom: '6px' }}>Điểm hẹn đón khách</span>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.82rem', color: 'var(--color-text)', fontWeight: 600, marginBottom: '0.75rem' }}>
                                        <MapPin size={15} style={{ color: '#ef4444', flexShrink: 0 }} />
                                        <span style={{ wordBreak: 'break-all' }}>
                                            Tọa độ: [{selectedBooking.meetingPoint.coordinates.join(', ')}]
                                        </span>
                                    </div>
                                    <div style={{ height: '220px', width: '100%', borderRadius: '12px', overflow: 'hidden', border: '1px solid rgba(14, 165, 233, 0.2)', position: 'relative', zIndex: 0 }}>
                                        <MapContainer 
                                            center={[selectedBooking.meetingPoint.coordinates[1], selectedBooking.meetingPoint.coordinates[0]]} 
                                            zoom={14} 
                                            scrollWheelZoom={false}
                                            style={{ height: '100%', width: '100%', zIndex: 1 }}
                                        >
                                            <TileLayer
                                                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                                                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                                            />
                                            <Marker position={[selectedBooking.meetingPoint.coordinates[1], selectedBooking.meetingPoint.coordinates[0]]} />
                                        </MapContainer>
                                    </div>
                                </div>
                            )}

                        </div>

                        {/* Modal Footer Controls */}
                        <div style={{
                            background: '#f8fafc', borderTop: '1px solid rgba(14,165,233,0.1)',
                            padding: '1.25rem 1.5rem', display: 'flex', gap: '0.75rem', justifyContent: 'end'
                        }}>
                            {selectedBooking.status === 'ongoing' && (
                                <Link to={isBuddy ? `/live-tracking/${selectedBooking._id}` : `/tourist/live/${selectedBooking._id}`} style={{ textDecoration: 'none', flex: 1 }}>
                                    <button style={{ width: '100%', background: 'linear-gradient(135deg, #10b981, #059669)', border: 'none', borderRadius: '10px', padding: '0.65rem 1rem', color: 'white', fontWeight: 700, fontSize: '0.85rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px', boxShadow: '0 4px 12px rgba(16,185,129,0.25)' }}>
                                        <Navigation size={14} /> Theo dõi Live Map
                                    </button>
                                </Link>
                            )}
                            <Link to="/my-bookings" style={{ textDecoration: 'none', flex: selectedBooking.status === 'ongoing' ? 1 : 'none' }}>
                                <button style={{ width: '100%', background: '#ffffff', border: '1px solid rgba(14,165,233,0.25)', borderRadius: '10px', padding: '0.65rem 1.25rem', color: 'var(--color-primary)', fontWeight: 700, fontSize: '0.85rem', cursor: 'pointer', transition: 'all 0.15s' }}
                                    onMouseEnter={e => { e.currentTarget.style.background = 'rgba(14,165,233,0.04)'; }}
                                    onMouseLeave={e => { e.currentTarget.style.background = '#ffffff'; }}
                                >
                                    Quản lý đặt lịch
                                </button>
                            </Link>
                        </div>

                    </div>
                </div>
            )}

            <style>{`
                @keyframes spin { to { transform: rotate(360deg) } }
                @keyframes fadeIn { from { opacity: 0; transform: scale(0.97); } to { opacity: 1; transform: scale(1); } }
                select { background: white; }
            `}</style>
        </div>
    );
};
