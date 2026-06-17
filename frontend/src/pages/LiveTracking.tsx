import { useEffect, useState, useRef } from 'react';
import axios from 'axios';
import Navbar from '../components/layout/Navbar';
import { MapPin, Activity, ShieldAlert, Phone } from 'lucide-react';
import { useParams } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import toast from 'react-hot-toast';
import { socket } from '../socket';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Custom Colored DivIcons
const createMarkerIcon = (color: string, label: string) => {
    return L.divIcon({
        html: `<div style="display: flex; flex-direction: column; align-items: center; justify-content: center; width: 80px;">
                 <div style="width: 16px; height: 16px; background-color: ${color}; border: 3px solid #ffffff; border-radius: 50%; box-shadow: 0 0 10px ${color}, 0 4px 6px rgba(0,0,0,0.3); position: relative; z-index: 10;">
                   <div style="position: absolute; top: -3px; left: -3px; width: 16px; height: 16px; border-radius: 50%; background-color: ${color}; opacity: 0.4; transform: scale(1.8); animation: pulse-ring 2s infinite;"></div>
                 </div>
                 <div style="margin-top: 6px; padding: 3px 8px; background-color: rgba(15, 23, 42, 0.9); border: 1px solid rgba(255, 255, 255, 0.15); border-radius: 6px; color: #ffffff; font-family: 'Inter', sans-serif; font-size: 10px; font-weight: 700; text-align: center; white-space: nowrap; box-shadow: 0 4px 10px rgba(0,0,0,0.25); text-transform: uppercase; letter-spacing: 0.03em;">
                   ${label}
                 </div>
               </div>`,
        className: 'custom-map-marker',
        iconSize: [80, 42],
        iconAnchor: [40, 21]
    });
};

const buddyIcon = createMarkerIcon('#10b981', 'Bạn (Buddy)');
const touristIcon = createMarkerIcon('#0ea5e9', 'Tourist');

const AutoFitBounds = ({ buddyLoc, touristLoc }: { buddyLoc: { lat: number, lng: number } | null, touristLoc: { lat: number, lng: number } | null }) => {
    const map = useMap();
    useEffect(() => {
        const points: L.LatLngExpression[] = [];
        if (buddyLoc) points.push([buddyLoc.lat, buddyLoc.lng]);
        if (touristLoc) points.push([touristLoc.lat, touristLoc.lng]);
        
        if (points.length === 2) {
            const bounds = L.latLngBounds(points);
            map.fitBounds(bounds, { padding: [60, 60], maxZoom: 16 });
        } else if (points.length === 1) {
            map.flyTo(points[0], 16);
        }
    }, [buddyLoc, touristLoc, map]);
    return null;
};

export const LiveTracking = () => {
    const [status, setStatus] = useState('Đang kiểm tra thời gian chuyến đi...');
    const [buddyLocation, setBuddyLocation] = useState<{ lat: number; lng: number } | null>(null);
    const [touristLocation, setTouristLocation] = useState<{ lat: number; lng: number } | null>(null);
    const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
    const [isTrackingAllowed, setIsTrackingAllowed] = useState(false);

    // SOS states
    const [sosActive, setSosActive] = useState(false); // true = SOS đã gửi và đang chờ xử lý
    const [sosResolved, setSosResolved] = useState(false); // true = Admin đã xử lý xong
    const [showSosConfirm, setShowSosConfirm] = useState(false);
    const [sosSending, setSosSending] = useState(false);
    const [holdProgress, setHoldProgress] = useState(0);
    const holdTimerRef = useRef<number | null>(null);
    const holdStartTimeRef = useRef<number | null>(null);

    const { bookingId } = useParams();
    const { user } = useAuthStore();
    const userId = user?._id;
    const isTourist = user?.role === 'tourist';
    const myRole = isTourist ? 'tourist' : 'buddy';
    const partnerRole = isTourist ? 'buddy' : 'tourist';

    // 0. Kiểm tra khung giờ hợp lệ
    useEffect(() => {
        if (!bookingId) return;

        if (bookingId === 'general') {
            setIsTrackingAllowed(true);
            setStatus('Chế độ bản đồ tự do');
            return;
        }

        const checkTime = async () => {
            try {
                const res = await axios.get((import.meta.env.VITE_API_URL || 'http://localhost:3000') + `/bookings/${bookingId}`, {
                    headers: { Authorization: `Bearer ${localStorage.getItem('access_token')}` }
                });
                const b = res.data.result;
                if (!b) throw new Error('Không tìm thấy chuyến đi');

                const scheduledDate = new Date(b.scheduledDate);
                const [hoursStr, minutesStr] = b.startTime.split(':');
                scheduledDate.setHours(parseInt(hoursStr, 10), parseInt(minutesStr, 10), 0, 0);

                const trackingStartTime = new Date(scheduledDate.getTime() - 30 * 60 * 1000);
                const trackingEndTime = new Date(scheduledDate.getTime() + b.hours * 60 * 60 * 1000 + 30 * 60 * 1000);

                const now = new Date();
                if (now >= trackingStartTime && now <= trackingEndTime) {
                    setIsTrackingAllowed(true);
                    setStatus('Đang khởi tạo...');
                } else {
                    setIsTrackingAllowed(false);
                    if (now < trackingStartTime) {
                        setStatus(`Theo dõi mở lúc ${trackingStartTime.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}`);
                    } else {
                        setStatus('Chuyến đi đã kết thúc.');
                    }
                }
            } catch (err: any) {
                setStatus('Lỗi: ' + (err.response?.data?.message || err.message));
            }
        };
        
        checkTime();
    }, [bookingId]);

    // 1. Socket: nhận vị trí đối tác + lắng nghe SOS events
    useEffect(() => {
        if (!bookingId || !isTrackingAllowed || bookingId === 'general') return;
        
        socket.connect();

        // Nhận vị trí đối tác
        socket.on(`location_updated_${bookingId}`, (data: { lat: number, lng: number, role?: string }) => {
            if (data.role === partnerRole) {
                if (isTourist) setBuddyLocation({ lat: data.lat, lng: data.lng });
                else setTouristLocation({ lat: data.lat, lng: data.lng });
                setLastUpdated(new Date());
            }
        });

        // [QUAN TRỌNG] Nhận SOS từ đối tác hoặc chính mình (broadcast toàn booking)
        socket.on(`sos_triggered_${bookingId}`, (data: { userId: string, message: string }) => {
            setSosActive(true);
            setSosResolved(false);
            // Nếu SOS đến từ đối tác → thông báo cho mình biết
            if (data.userId !== userId) {
                toast.error(
                    `🚨 ${isTourist ? 'Buddy' : 'Tourist'} đã bấm SOS! Hãy liên lạc ngay!`,
                    { duration: 10000, icon: '🆘' }
                );
            }
        });

        // [QUAN TRỌNG] Admin đã xử lý xong SOS
        socket.on(`sos_resolved_${bookingId}`, (data: { resolvedBy?: string, note?: string }) => {
            setSosActive(false);
            setSosResolved(true);
            toast.success(
                `✅ Admin đã xử lý xong sự cố SOS. ${data.note ? `Ghi chú: ${data.note}` : 'Chuyến đi có thể tiếp tục.'}`,
                { duration: 8000 }
            );
        });

        return () => {
            socket.off(`location_updated_${bookingId}`);
            socket.off(`sos_triggered_${bookingId}`);
            socket.off(`sos_resolved_${bookingId}`);
        };
    }, [bookingId, isTrackingAllowed, partnerRole, isTourist, userId]);

    // 2. GPS của bản thân → gửi lên backend
    useEffect(() => {
        if (!bookingId || !userId || !isTrackingAllowed) return;

        if (!navigator.geolocation) {
            setStatus('Trình duyệt không hỗ trợ GPS');
            return;
        }
        setStatus('Đang định vị...');
        const watchId = navigator.geolocation.watchPosition(
            ({ coords }) => {
                const newLoc = { lat: coords.latitude, lng: coords.longitude };
                if (isTourist) setTouristLocation(newLoc);
                else setBuddyLocation(newLoc);
                setStatus('Đang cập nhật trực tiếp');

                if (bookingId !== 'general') {
                    axios.post((import.meta.env.VITE_API_URL || 'http://localhost:3000') + '/safety/tracking', { 
                        bookingId, 
                        userId, 
                        lat: coords.latitude, 
                        lng: coords.longitude,
                        role: myRole
                    }).catch(console.error);
                }
            },
            err => setStatus('Lỗi GPS: ' + err.message),
            { enableHighAccuracy: true, maximumAge: 10000, timeout: 5000 }
        );
        return () => navigator.geolocation.clearWatch(watchId);
    }, [bookingId, userId, isTrackingAllowed, isTourist, myRole]);

    // SOS Hold handlers
    const startHold = () => {
        if (sosActive || sosResolved || sosSending || !isTrackingAllowed) return;
        holdStartTimeRef.current = Date.now();
        holdTimerRef.current = window.setInterval(() => {
            const elapsed = Date.now() - (holdStartTimeRef.current || 0);
            const progress = Math.min((elapsed / 3000) * 100, 100);
            setHoldProgress(progress);
            if (progress >= 100) {
                stopHold();
                executeSOS();
            }
        }, 50);
    };

    const stopHold = () => {
        if (holdTimerRef.current) {
            clearInterval(holdTimerRef.current);
            holdTimerRef.current = null;
        }
        setHoldProgress(0);
    };

    // Click thường → confirm modal
    const handleSosClick = () => {
        if (sosActive || sosSending) return;
        if (!isTrackingAllowed || bookingId === 'general') {
            toast.error('SOS chỉ khả dụng trong khung giờ chuyến đi.');
            return;
        }
        setShowSosConfirm(true);
    };

    const executeSOS = async () => {
        if (!bookingId || !userId) return;
        setSosSending(true);
        setShowSosConfirm(false);
        
        const loc = isTourist ? touristLocation : buddyLocation;
        const locationData = loc ? { lat: loc.lat, lng: loc.lng, timestamp: new Date() } : null;

        try {
            await axios.post((import.meta.env.VITE_API_URL || 'http://localhost:3000') + '/safety/sos', { 
                bookingId, 
                userId,
                role: myRole,
                message: `KHẨN CẤP: ${isTourist ? 'Tourist' : 'Buddy'} nhấn SOS trong tour.`,
                location: locationData
            });
            setSosActive(true);
            toast.success('🚨 SOS đã được gửi! Admin và đối tác đã được thông báo.', { duration: 8000 });
        } catch {
            toast.error('Gửi SOS thất bại! Hãy gọi ngay 113 hoặc 115.');
        } finally {
            setSosSending(false);
        }
    };

    // Màu & text SOS button
    const sosButtonBg = sosActive
        ? 'linear-gradient(135deg, #f59e0b, #d97706)'   // Đang chờ xử lý - vàng
        : sosResolved
            ? 'linear-gradient(135deg, #16a34a, #15803d)'  // Đã xử lý - xanh lá
            : sosSending
                ? 'linear-gradient(135deg, #6366f1, #4f46e5)' // Đang gửi - tím
                : holdProgress > 0
                    ? `conic-gradient(#ef4444 ${holdProgress}%, #7f1d1d 0)` // Đang giữ
                    : 'linear-gradient(135deg, #dc2626, #991b1b)'; // Mặc định - đỏ

    const sosButtonLabel = sosActive
        ? '⚠️'
        : sosResolved
            ? '✓'
            : sosSending
                ? '...'
                : holdProgress > 0
                    ? `${Math.round(holdProgress)}%`
                    : 'SOS';

    return (
        <div style={{ height: '100vh', display: 'flex', flexDirection: 'column', background: '#0a0a0f', color: 'white', fontFamily: "'Inter', sans-serif" }}>
            <Navbar />

            {/* Header */}
            <div style={{ background: 'linear-gradient(90deg, #1e1b4b, #312e81)', padding: '1rem 2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(139,92,246,0.3)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <div style={{ background: 'rgba(52,211,153,0.2)', padding: '0.5rem', borderRadius: '50%' }}>
                        <Activity size={20} style={{ color: '#34d399' }} />
                    </div>
                    <div>
                        <h2 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 800 }}>
                            {bookingId === 'general' ? 'Bản đồ tự do' : 'Chia sẻ vị trí & SOS (Buddy)'}
                        </h2>
                        <p style={{ margin: 0, fontSize: '0.8rem', color: 'rgba(255,255,255,0.6)' }}>
                            Buddy ID: <code style={{ color: '#34d399' }}>{user?._id || 'N/A'}</code>
                        </p>
                    </div>
                </div>
                
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', background: 'rgba(0,0,0,0.3)', padding: '0.5rem 1rem', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.1)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: buddyLocation ? '#10b981' : '#f59e0b', boxShadow: `0 0 8px ${buddyLocation ? '#10b981' : '#f59e0b'}`, animation: 'ping 1.5s infinite' }} />
                        <span style={{ fontSize: '0.85rem', fontWeight: 600, color: buddyLocation ? '#34d399' : '#fbbf24' }}>
                            GPS: {status}
                        </span>
                    </div>
                    {lastUpdated && bookingId !== 'general' && (
                        <div style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.4)' }}>
                            Tourist cập nhật: {lastUpdated.toLocaleTimeString()}
                        </div>
                    )}
                </div>
            </div>

            {/* Map Area */}
            <div style={{ flex: 1, position: 'relative', width: '100%', height: '100%' }}>
                {buddyLocation || touristLocation ? (
                    <MapContainer
                        center={buddyLocation ? [buddyLocation.lat, buddyLocation.lng] : [10.762622, 106.660172]}
                        zoom={16}
                        style={{ height: '100%', width: '100%', zIndex: 1 }}
                    >
                        <TileLayer
                            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                        />
                        
                        {buddyLocation && (
                            <Marker position={[buddyLocation.lat, buddyLocation.lng]} icon={buddyIcon}>
                                <Popup>
                                    <div style={{ color: '#1f2937', fontSize: '0.8rem', textAlign: 'center' }}>
                                        <strong>Bạn (Buddy)</strong><br />
                                        Đang định vị trực tiếp.
                                    </div>
                                </Popup>
                            </Marker>
                        )}

                        {touristLocation && (
                            <Marker position={[touristLocation.lat, touristLocation.lng]} icon={touristIcon}>
                                <Popup>
                                    <div style={{ color: '#1f2937', fontSize: '0.8rem', textAlign: 'center' }}>
                                        <strong>Khách du lịch (Tourist)</strong><br />
                                        Vị trí thời gian thực.
                                    </div>
                                </Popup>
                            </Marker>
                        )}
                        
                        <AutoFitBounds buddyLoc={buddyLocation} touristLoc={touristLocation} />
                    </MapContainer>
                ) : (
                    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.5)' }}>
                        <MapPin size={48} style={{ color: 'rgba(255,255,255,0.2)', marginBottom: '1rem', animation: 'bounce 2s infinite' }} />
                        <h3 style={{ margin: 0, color: 'rgba(255,255,255,0.5)', fontSize: '1.1rem' }}>Đang xác định GPS...</h3>
                        <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: '0.9rem', marginTop: '0.5rem', textAlign: 'center', padding: '0 1rem' }}>
                            Vui lòng cấp quyền định vị GPS để hiển thị bản đồ.
                        </p>
                    </div>
                )}

                {/* ── SOS Banner khi SOS đang active ── */}
                {sosActive && (
                    <div style={{
                        position: 'absolute', top: '16px', left: '50%', transform: 'translateX(-50%)',
                        zIndex: 9001, background: 'rgba(220,38,38,0.95)', backdropFilter: 'blur(8px)',
                        border: '1px solid rgba(252,165,165,0.4)', borderRadius: '16px',
                        padding: '0.75rem 1.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem',
                        boxShadow: '0 8px 30px rgba(220,38,38,0.5)', animation: 'pulse-banner 1.5s ease-in-out infinite',
                        maxWidth: '90%'
                    }}>
                        <ShieldAlert size={20} style={{ color: 'white', flexShrink: 0 }} />
                        <div>
                            <div style={{ fontWeight: 900, fontSize: '0.9rem', color: 'white' }}>🆘 SOS ĐANG HOẠT ĐỘNG</div>
                            <div style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.8)' }}>Đang chờ Admin phản hồi...</div>
                        </div>
                    </div>
                )}

                {/* ── SOS Panel (zIndex 9000) ── */}
                <div style={{
                    position: 'absolute',
                    bottom: '24px',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    zIndex: 9000,
                    background: sosActive ? 'rgba(127,29,29,0.95)' : 'rgba(15, 23, 42, 0.90)',
                    backdropFilter: 'blur(12px)',
                    border: `1px solid ${sosActive ? 'rgba(239,68,68,0.5)' : 'rgba(255,255,255,0.14)'}`,
                    borderRadius: '24px',
                    padding: '1rem 2rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '1.5rem',
                    boxShadow: sosActive ? '0 20px 45px rgba(239,68,68,0.5)' : '0 20px 45px rgba(0,0,0,0.6)',
                    width: '90%',
                    maxWidth: '420px',
                    boxSizing: 'border-box',
                    pointerEvents: 'all',
                    transition: 'all 0.3s'
                }}>
                    <div style={{ flex: 1 }}>
                        <h4 style={{ margin: 0, fontSize: '0.9rem', fontWeight: 800, color: '#ffffff', display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <ShieldAlert size={16} style={{ color: sosActive ? '#fca5a5' : '#ef4444' }} />
                            {sosActive ? 'SOS đang hoạt động!' : sosResolved ? 'SOS đã xử lý ✓' : 'Hỗ trợ khẩn cấp'}
                        </h4>
                        <p style={{ margin: '3px 0 0', fontSize: '0.72rem', color: 'rgba(255,255,255,0.55)', lineHeight: 1.4 }}>
                            {sosActive
                                ? 'Đang chờ Admin xử lý. Giữ bình tĩnh, trợ giúp đang đến!'
                                : sosResolved
                                    ? 'Admin đã xử lý xong sự cố.'
                                    : 'Nhấn SOS để xác nhận, hoặc giữ 3 giây gửi ngay.'}
                        </p>
                    </div>
                    
                    <div style={{ position: 'relative', flexShrink: 0 }}>
                        {/* Pulsing rings */}
                        {!sosActive && !sosResolved && holdProgress === 0 && !sosSending && (
                            <>
                                <div style={{ position: 'absolute', inset: '-8px', borderRadius: '50%', border: '2px solid rgba(239,68,68,0.4)', animation: 'ping-sos 1.5s ease-in-out infinite' }} />
                                <div style={{ position: 'absolute', inset: '-4px', borderRadius: '50%', border: '1px solid rgba(239,68,68,0.5)', animation: 'ping-sos 1.5s ease-in-out infinite', animationDelay: '0.5s' }} />
                            </>
                        )}
                        {sosActive && (
                            <>
                                <div style={{ position: 'absolute', inset: '-10px', borderRadius: '50%', border: '2px solid rgba(239,68,68,0.6)', animation: 'ping-sos 1s ease-in-out infinite' }} />
                                <div style={{ position: 'absolute', inset: '-5px', borderRadius: '50%', border: '2px solid rgba(239,68,68,0.8)', animation: 'ping-sos 1s ease-in-out infinite', animationDelay: '0.3s' }} />
                            </>
                        )}
                        
                        <button
                            onClick={handleSosClick}
                            onMouseDown={startHold}
                            onMouseUp={stopHold}
                            onMouseLeave={stopHold}
                            onTouchStart={(e) => { e.preventDefault(); startHold(); }}
                            onTouchEnd={(e) => { e.preventDefault(); stopHold(); }}
                            disabled={sosSending || sosResolved}
                            style={{
                                width: '68px',
                                height: '68px',
                                borderRadius: '50%',
                                background: sosButtonBg,
                                border: `2px solid ${sosActive ? 'rgba(252,165,165,0.7)' : sosResolved ? 'rgba(74,222,128,0.6)' : 'rgba(252,165,165,0.5)'}`,
                                cursor: sosResolved ? 'default' : 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                flexDirection: 'column',
                                gap: '2px',
                                boxShadow: sosActive
                                    ? '0 0 30px rgba(239,68,68,0.8), 0 0 60px rgba(239,68,68,0.4)'
                                    : sosResolved
                                        ? '0 0 20px rgba(22,163,74,0.5)'
                                        : '0 0 25px rgba(220,38,38,0.6)',
                                transition: holdProgress > 0 ? 'none' : 'all 0.3s',
                                color: 'white',
                                fontWeight: 900,
                                fontSize: sosActive ? '1.3rem' : '1rem',
                                outline: 'none',
                                userSelect: 'none',
                                WebkitUserSelect: 'none',
                                touchAction: 'none'
                            }}
                        >
                            {sosButtonLabel}
                            {!sosActive && !sosResolved && !sosSending && holdProgress === 0 && (
                                <span style={{ fontSize: '0.5rem', fontWeight: 600, opacity: 0.7, letterSpacing: '0.05em' }}>BẤM</span>
                            )}
                        </button>
                    </div>
                </div>
            </div>

            {/* ── SOS Confirm Modal ── */}
            {showSosConfirm && (
                <div style={{
                    position: 'fixed', inset: 0, zIndex: 99999,
                    background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(8px)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem'
                }}>
                    <div style={{
                        background: '#0f172a', border: '1px solid rgba(239,68,68,0.4)',
                        borderRadius: '24px', padding: '2rem', maxWidth: '360px', width: '100%',
                        textAlign: 'center', boxShadow: '0 25px 60px rgba(239,68,68,0.3)'
                    }}>
                        <div style={{ width: '72px', height: '72px', borderRadius: '50%', background: 'rgba(239,68,68,0.15)', border: '2px solid rgba(239,68,68,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.25rem' }}>
                            <ShieldAlert size={32} style={{ color: '#ef4444' }} />
                        </div>
                        <h3 style={{ margin: '0 0 0.5rem', fontSize: '1.25rem', fontWeight: 900, color: '#fff' }}>
                            Xác nhận báo SOS?
                        </h3>
                        <p style={{ margin: '0 0 1.5rem', fontSize: '0.85rem', color: 'rgba(255,255,255,0.55)', lineHeight: 1.6 }}>
                            Tín hiệu SOS sẽ gửi ngay đến <strong style={{ color: '#fca5a5' }}>Admin & {isTourist ? 'Buddy' : 'Tourist'}</strong>.<br />
                            Chỉ dùng khi có tình huống <strong style={{ color: '#ef4444' }}>thực sự khẩn cấp</strong>.
                        </p>
                        <div style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: '12px', padding: '0.75rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
                            <Phone size={16} style={{ color: '#ef4444' }} />
                            <span style={{ fontSize: '0.82rem', color: 'rgba(255,255,255,0.7)' }}>Hoặc gọi ngay:</span>
                            <a href="tel:113" style={{ color: '#fca5a5', fontWeight: 900, fontSize: '1rem', textDecoration: 'none' }}>113</a>
                            <span style={{ color: 'rgba(255,255,255,0.4)' }}>|</span>
                            <a href="tel:115" style={{ color: '#fca5a5', fontWeight: 900, fontSize: '1rem', textDecoration: 'none' }}>115</a>
                        </div>
                        <div style={{ display: 'flex', gap: '0.75rem' }}>
                            <button
                                onClick={() => setShowSosConfirm(false)}
                                style={{ flex: 1, padding: '0.85rem', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: '12px', color: 'rgba(255,255,255,0.7)', fontWeight: 700, fontSize: '0.9rem', cursor: 'pointer' }}
                            >
                                Hủy
                            </button>
                            <button
                                onClick={executeSOS}
                                style={{ flex: 2, padding: '0.85rem', background: 'linear-gradient(135deg, #dc2626, #b91c1c)', border: 'none', borderRadius: '12px', color: 'white', fontWeight: 900, fontSize: '0.95rem', cursor: 'pointer', boxShadow: '0 8px 20px rgba(220,38,38,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
                            >
                                <ShieldAlert size={16} /> Gửi SOS ngay!
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <style>{`
                @keyframes pulse-ring {
                    0% { transform: scale(1); opacity: 0.6; }
                    100% { transform: scale(2.2); opacity: 0; }
                }
                @keyframes ping-sos { 0%, 100% { opacity: 0.4; transform: scale(1) } 50% { opacity: 1; transform: scale(1.1) } }
                @keyframes ping { 0%, 100% { opacity: 0.5; transform: scale(1) } 50% { opacity: 1; transform: scale(1.2) } }
                @keyframes bounce { 0%, 100% { transform: translateY(0) } 50% { transform: translateY(-10px) } }
                @keyframes pulse-banner { 0%, 100% { opacity: 1; transform: translateX(-50%) scale(1) } 50% { opacity: 0.85; transform: translateX(-50%) scale(1.02) } }
                .leaflet-popup-content-wrapper { border-radius: 12px; box-shadow: 0 10px 25px rgba(0,0,0,0.2); }
                .leaflet-popup-content { margin: 12px; }
            `}</style>
        </div>
    );
};

export default LiveTracking;
