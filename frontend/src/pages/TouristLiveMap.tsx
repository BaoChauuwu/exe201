import { useEffect, useState, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import axios from 'axios';
import { socket } from '../socket';
import Navbar from '../components/layout/Navbar';
import { useAuthStore } from '../store/authStore';
import { ShieldCheck, MapPin, Navigation, ShieldAlert, Phone } from 'lucide-react';
import toast from 'react-hot-toast';

// Custom Colored DivIcons with pulsing animations for professional visual aesthetics
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

const buddyIcon = createMarkerIcon('#10b981', 'Buddy');
const touristIcon = createMarkerIcon('#0ea5e9', 'Bạn (Tourist)');

// Component to dynamically fit bounds of the map to display both markers
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

export const TouristLiveMap = () => {
    const { bookingId } = useParams();
    const { user } = useAuthStore();
    
    const [buddyLocation, setBuddyLocation] = useState<{ lat: number, lng: number } | null>(null);
    const [touristLocation, setTouristLocation] = useState<{ lat: number, lng: number } | null>(null);
    const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

    // 1. Theo dõi vị trí của Tourist và gửi lên backend qua role: 'tourist'
    useEffect(() => {
        if (!navigator.geolocation || !bookingId || !user?._id) return;
        
        const watchId = navigator.geolocation.watchPosition(
            ({ coords }) => {
                const newLoc = { lat: coords.latitude, lng: coords.longitude };
                setTouristLocation(newLoc);
                
                if (bookingId !== 'general') {
                    axios.post((import.meta.env.VITE_API_URL || 'http://localhost:3000') + '/safety/tracking', {
                        bookingId,
                        userId: user._id,
                        lat: coords.latitude,
                        lng: coords.longitude,
                        role: 'tourist'
                    }).catch(err => console.error('Error reporting tourist location:', err));
                }
            },
            err => console.error('Tourist GPS error:', err.message),
            { enableHighAccuracy: true, maximumAge: 10000, timeout: 5000 }
        );

        return () => navigator.geolocation.clearWatch(watchId);
    }, [bookingId, user]);

    // 2. Kết nối socket lắng nghe vị trí Buddy cập nhật
    useEffect(() => {
        if (!bookingId || bookingId === 'general') return;

        socket.connect();

        socket.on(`location_updated_${bookingId}`, (data: { lat: number, lng: number, role?: string, senderId?: string }) => {
            if (!data.role || data.role === 'buddy') {
                setBuddyLocation({ lat: data.lat, lng: data.lng });
                setLastUpdated(new Date());
            } else if (data.role === 'tourist' && data.senderId !== user?._id) {
                setTouristLocation({ lat: data.lat, lng: data.lng });
            }
        });

        return () => {
            socket.off(`location_updated_${bookingId}`);
        };
    }, [bookingId, user]);

    // SOS states
    const [holdProgress, setHoldProgress] = useState(0);
    const [sosTriggered, setSosTriggered] = useState(false);
    const [showSosConfirm, setShowSosConfirm] = useState(false);
    const [sosSending, setSosSending] = useState(false);
    const holdTimerRef = useRef<number | null>(null);
    const holdStartTimeRef = useRef<number | null>(null);

    const startHold = () => {
        if (sosTriggered || sosSending) return;
        holdStartTimeRef.current = Date.now();
        holdTimerRef.current = window.setInterval(() => {
            const elapsed = Date.now() - (holdStartTimeRef.current || 0);
            const progress = Math.min((elapsed / 3000) * 100, 100);
            setHoldProgress(progress);
            
            if (progress >= 100) {
                stopHold();
                executeSOS(); // Giữ đủ 3s → kích hoạt trực tiếp không cần confirm
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

    // Click thường (không giữ) → mở modal confirm
    const handleSosClick = () => {
        if (sosTriggered || sosSending) return;
        if (bookingId === 'general') {
            toast.error('Chức năng SOS chỉ khả dụng khi bạn đang trong một chuyến đi.');
            return;
        }
        setShowSosConfirm(true);
    };

    const executeSOS = async () => {
        if (!bookingId || !user?._id) return;
        if (bookingId === 'general') {
            toast.error('Chức năng SOS chỉ khả dụng khi bạn đang trong một chuyến đi.');
            return;
        }
        setSosSending(true);
        setShowSosConfirm(false);
        const loc = touristLocation;
        const locationData = loc ? { lat: loc.lat, lng: loc.lng, timestamp: new Date() } : null;

        try {
            await axios.post((import.meta.env.VITE_API_URL || 'http://localhost:3000') + '/safety/sos', { 
                bookingId, 
                userId: user._id, 
                message: 'KHẨN CẤP: Người dùng nhấn SOS trong tour.',
                location: locationData
            });
            setSosTriggered(true);
            toast.success('🚨 Tín hiệu SOS đã được gửi! Hỗ trợ đang trên đường đến.');
        } catch {
            toast.error('Gửi SOS thất bại. Vui lòng gọi 113 ngay!');
        } finally {
            setSosSending(false);
        }
    };

    return (
        <div style={{ height: '100vh', display: 'flex', flexDirection: 'column', background: '#0a0a0f', color: 'white', fontFamily: "'Inter', sans-serif" }}>
            <Navbar />
            
            {/* Header info */}
            <div style={{ background: 'linear-gradient(90deg, #1e1b4b, #312e81)', padding: '1rem 2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(139,92,246,0.3)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <div style={{ background: 'rgba(52,211,153,0.2)', padding: '0.5rem', borderRadius: '50%' }}>
                        <Navigation size={20} style={{ color: '#34d399' }} />
                    </div>
                    <div>
                        <h2 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 800 }}>{bookingId === 'general' ? 'Bản đồ tự do' : 'Theo dõi hành trình (Tourist)'}</h2>
                        <p style={{ margin: 0, fontSize: '0.8rem', color: 'rgba(255,255,255,0.6)' }}>
                            Tourist ID: <code style={{ color: '#34d399' }}>{user?._id || 'N/A'}</code>
                        </p>
                    </div>
                </div>
                
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', background: 'rgba(0,0,0,0.3)', padding: '0.5rem 1rem', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.1)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: buddyLocation ? '#10b981' : (bookingId === 'general' ? '#3b82f6' : '#f59e0b'), boxShadow: `0 0 8px ${buddyLocation ? '#10b981' : (bookingId === 'general' ? '#3b82f6' : '#f59e0b')}`, animation: 'ping 1.5s infinite' }} />
                        <span style={{ fontSize: '0.85rem', fontWeight: 600, color: buddyLocation ? '#34d399' : (bookingId === 'general' ? '#60a5fa' : '#fbbf24') }}>
                            {bookingId === 'general' ? 'Chế độ xem tự do' : (buddyLocation ? 'Đang nhận vị trí Buddy' : 'Đang chờ Buddy bật GPS...')}
                        </span>
                    </div>
                    {lastUpdated && bookingId !== 'general' && (
                        <div style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.4)' }}>
                            Cập nhật lúc: {lastUpdated.toLocaleTimeString()}
                        </div>
                    )}
                </div>
            </div>

            {/* Map Area */}
            <div style={{ flex: 1, position: 'relative' }}>
                {buddyLocation || touristLocation ? (
                    <MapContainer 
                        center={touristLocation ? [touristLocation.lat, touristLocation.lng] : (buddyLocation ? [buddyLocation.lat, buddyLocation.lng] : [10.762622, 106.660172])} 
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
                                    <div style={{ textAlign: 'center', minWidth: '120px' }}>
                                        <ShieldCheck size={24} style={{ color: '#10b981', margin: '0 auto 0.25rem' }} />
                                        <strong style={{ color: '#1f2937', fontSize: '0.9rem' }}>Buddy đang ở đây!</strong>
                                        <p style={{ margin: '4px 0 0', fontSize: '0.75rem', color: '#6b7280' }}>
                                            Vị trí cập nhật thời gian thực.
                                        </p>
                                    </div>
                                </Popup>
                            </Marker>
                        )}

                        {touristLocation && (
                            <Marker position={[touristLocation.lat, touristLocation.lng]} icon={touristIcon}>
                                <Popup>
                                    <div style={{ textAlign: 'center', minWidth: '120px' }}>
                                        <MapPin size={24} style={{ color: '#0ea5e9', margin: '0 auto 0.25rem' }} />
                                        <strong style={{ color: '#1f2937', fontSize: '0.9rem' }}>Vị trí của bạn</strong>
                                        <p style={{ margin: '4px 0 0', fontSize: '0.75rem', color: '#6b7280' }}>
                                            Đang chia sẻ với Buddy.
                                        </p>
                                    </div>
                                </Popup>
                            </Marker>
                        )}
                        
                        <AutoFitBounds buddyLoc={buddyLocation} touristLoc={touristLocation} />
                    </MapContainer>
                ) : (
                    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.5)' }}>
                        <MapPin size={48} style={{ color: 'rgba(255,255,255,0.2)', marginBottom: '1rem', animation: 'bounce 2s infinite' }} />
                        <h3 style={{ margin: 0, color: 'rgba(255,255,255,0.5)' }}>Đang xác định GPS...</h3>
                        <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: '0.9rem', maxWidth: '400px', textAlign: 'center', marginTop: '0.5rem' }}>
                            Vui lòng cấp quyền truy cập định vị trên trình duyệt để hiển thị bản đồ.
                        </p>
                    </div>
                )}

                {/* ── SOS Panel ── zIndex 9000 để luôn nằm trên Leaflet map (Leaflet dùng tối đa ~1000) */}
                <div style={{
                    position: 'absolute',
                    bottom: '24px',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    zIndex: 9000,
                    background: 'rgba(15, 23, 42, 0.90)',
                    backdropFilter: 'blur(12px)',
                    border: '1px solid rgba(255, 255, 255, 0.14)',
                    borderRadius: '24px',
                    padding: '1rem 2rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '1.5rem',
                    boxShadow: '0 20px 45px rgba(0, 0, 0, 0.6)',
                    width: '90%',
                    maxWidth: '420px',
                    boxSizing: 'border-box',
                    pointerEvents: 'all'
                }}>
                    <div style={{ flex: 1 }}>
                        <h4 style={{ margin: 0, fontSize: '0.9rem', fontWeight: 800, color: '#ffffff', display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <ShieldAlert size={16} style={{ color: '#ef4444' }} /> Hỗ trợ khẩn cấp
                        </h4>
                        <p style={{ margin: '3px 0 0', fontSize: '0.72rem', color: 'rgba(255,255,255,0.5)', lineHeight: 1.4 }}>
                            Nhấn <strong style={{ color: '#fca5a5' }}>SOS</strong> → xác nhận, hoặc giữ 3 giây để gửi ngay.
                        </p>
                    </div>
                    
                    <div style={{ position: 'relative', flexShrink: 0 }}>
                        {/* Pulsing rings */}
                        {!sosTriggered && holdProgress === 0 && !sosSending && (
                            <>
                                <div style={{ position: 'absolute', inset: '-8px', borderRadius: '50%', border: '2px solid rgba(239,68,68,0.4)', animation: 'ping-sos 1.5s ease-in-out infinite' }} />
                                <div style={{ position: 'absolute', inset: '-4px', borderRadius: '50%', border: '1px solid rgba(239,68,68,0.5)', animation: 'ping-sos 1.5s ease-in-out infinite', animationDelay: '0.5s' }} />
                            </>
                        )}
                        
                        <button
                            onClick={handleSosClick}
                            onMouseDown={startHold}
                            onMouseUp={stopHold}
                            onMouseLeave={stopHold}
                            onTouchStart={(e) => { e.preventDefault(); startHold(); }}
                            onTouchEnd={(e) => { e.preventDefault(); stopHold(); }}
                            disabled={sosSending || sosTriggered}
                            style={{
                                width: '68px',
                                height: '68px',
                                borderRadius: '50%',
                                background: sosTriggered 
                                    ? 'linear-gradient(135deg, #16a34a, #15803d)' 
                                    : sosSending
                                        ? 'linear-gradient(135deg, #f59e0b, #d97706)'
                                        : holdProgress > 0 
                                            ? `conic-gradient(#ef4444 ${holdProgress}%, #7f1d1d 0)` 
                                            : 'linear-gradient(135deg, #dc2626, #991b1b)',
                                border: `2px solid ${sosTriggered ? 'rgba(74,222,128,0.6)' : 'rgba(252,165,165,0.5)'}`,
                                cursor: sosTriggered || sosSending ? 'default' : 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                flexDirection: 'column',
                                gap: '2px',
                                boxShadow: sosTriggered ? '0 0 20px rgba(22,163,74,0.5)' : '0 0 25px rgba(220,38,38,0.6), 0 0 50px rgba(220,38,38,0.2)',
                                transition: holdProgress > 0 ? 'none' : 'all 0.2s',
                                color: 'white',
                                fontWeight: 900,
                                fontSize: '1rem',
                                outline: 'none',
                                userSelect: 'none',
                                WebkitUserSelect: 'none',
                                touchAction: 'none'
                            }}
                        >
                            {sosTriggered 
                                ? '✓' 
                                : sosSending 
                                    ? '...' 
                                    : holdProgress > 0 && holdProgress < 100 
                                        ? `${Math.round(holdProgress)}%` 
                                        : 'SOS'}
                            {!sosTriggered && !sosSending && holdProgress === 0 && (
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
                    background: 'rgba(0,0,0,0.82)', backdropFilter: 'blur(8px)',
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
                            Tín hiệu SOS sẽ được gửi tức thì đến <strong style={{ color: '#fca5a5' }}>Admin & Buddy</strong> của bạn.<br />
                            Chỉ dùng khi có tình huống <strong style={{ color: '#ef4444' }}>thực sự khẩn cấp</strong>.
                        </p>

                        <div style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: '12px', padding: '0.75rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
                            <Phone size={16} style={{ color: '#ef4444' }} />
                            <span style={{ fontSize: '0.82rem', color: 'rgba(255,255,255,0.7)' }}>Hoặc gọi ngay:</span>
                            <a href="tel:113" style={{ color: '#fca5a5', fontWeight: 900, fontSize: '1rem', textDecoration: 'none' }}>113</a>
                            <span style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.75rem' }}>|</span>
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
                .leaflet-popup-content-wrapper { border-radius: 12px; box-shadow: 0 10px 25px rgba(0,0,0,0.2); }
                .leaflet-popup-content { margin: 12px; }
            `}</style>
        </div>
    );
};

export default TouristLiveMap;
