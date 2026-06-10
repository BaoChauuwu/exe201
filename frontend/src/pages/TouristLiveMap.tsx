import { useEffect, useState, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import axios from 'axios';
import { socket } from '../socket';
import Navbar from '../components/layout/Navbar';
import { useAuthStore } from '../store/authStore';
import { ShieldCheck, MapPin, Navigation, ShieldAlert } from 'lucide-react';
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
                
                // Gửi tọa độ lên để Buddy cũng có thể nhìn thấy Tourist trên bản đồ của họ
                if (bookingId !== 'general') {
                    axios.post((import.meta.env.VITE_API_URL || 'http://localhost:3000') + '/safety/tracking', {
                        bookingId,
                        userId: user._id, // Truyền user._id làm payload
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

        // Listen for location updates from the backend socket
        socket.on(`location_updated_${bookingId}`, (data: { lat: number, lng: number, role?: string, senderId?: string }) => {
            if (!data.role || data.role === 'buddy') {
                setBuddyLocation({ lat: data.lat, lng: data.lng });
                setLastUpdated(new Date());
            } else if (data.role === 'tourist' && data.senderId !== user?._id) {
                // Đồng bộ vị trí tourist từ socket nếu có thay đổi từ thiết bị khác
                setTouristLocation({ lat: data.lat, lng: data.lng });
            }
        });

        // Cleanup
        return () => {
            socket.off(`location_updated_${bookingId}`);
        };
    }, [bookingId, user]);

    const [holdProgress, setHoldProgress] = useState(0);
    const [sosTriggered, setSosTriggered] = useState(false);
    const holdTimerRef = useRef<number | null>(null);
    const holdStartTimeRef = useRef<number | null>(null);

    const startHold = () => {
        if (sosTriggered) return;
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

    const executeSOS = () => {
        if (!bookingId || !user?._id) return;
        if (bookingId === 'general') {
            toast.error('Chức năng SOS chỉ khả dụng khi bạn đang trong một chuyến đi.');
            return;
        }
        const loc = touristLocation;
        const locationData = loc ? { lat: loc.lat, lng: loc.lng, timestamp: new Date() } : null;

        axios.post((import.meta.env.VITE_API_URL || 'http://localhost:3000') + '/safety/sos', { 
            bookingId, 
            userId: user._id, 
            message: 'KHẨN CẤP: Người dùng nhấn SOS trong tour.',
            location: locationData
        })
            .then(() => { setSosTriggered(true); toast.success('Tín hiệu SOS đã được gửi! Hỗ trợ đang trên đường đến.'); })
            .catch(() => toast.error('Gửi SOS thất bại. Vui lòng gọi 113 ngay!'));
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
                        
                        {/* Marker cho Buddy */}
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

                        {/* Marker cho Tourist (Chính bạn) */}
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

                {/* Floating Glassmorphic SOS Panel overlaid on bottom-center of the map */}
                <div style={{
                    position: 'absolute',
                    bottom: '24px',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    zIndex: 1000,
                    background: 'rgba(15, 23, 42, 0.85)',
                    backdropFilter: 'blur(12px)',
                    border: '1px solid rgba(255, 255, 255, 0.12)',
                    borderRadius: '24px',
                    padding: '1rem 2rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '1.5rem',
                    boxShadow: '0 20px 45px rgba(0, 0, 0, 0.6)',
                    width: '90%',
                    maxWidth: '400px',
                    boxSizing: 'border-box'
                }}>
                    <div style={{ flex: 1 }}>
                        <h4 style={{ margin: 0, fontSize: '0.9rem', fontWeight: 800, color: '#ffffff', display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <ShieldAlert size={16} style={{ color: '#ef4444' }} /> Cảnh báo SOS
                        </h4>
                        <p style={{ margin: '3px 0 0', fontSize: '0.75rem', color: 'rgba(255,255,255,0.5)', lineHeight: 1.3 }}>
                            Nhấn và giữ nút SOS 3 giây trong trường hợp khẩn cấp để gọi cứu hộ.
                        </p>
                    </div>
                    
                    <div style={{ position: 'relative' }}>
                        {/* Pulsing SOS rings */}
                        {!sosTriggered && holdProgress === 0 && (
                            <>
                                <div style={{ position: 'absolute', inset: '-8px', borderRadius: '50%', border: '2px solid rgba(239,68,68,0.4)', animation: 'ping-sos 1.5s ease-in-out infinite' }} />
                                <div style={{ position: 'absolute', inset: '-4px', borderRadius: '50%', border: '1px solid rgba(239,68,68,0.5)', animation: 'ping-sos 1.5s ease-in-out infinite', animationDelay: '0.5s' }} />
                            </>
                        )}
                        
                        <button
                            onMouseDown={startHold}
                            onMouseUp={stopHold}
                            onMouseLeave={stopHold}
                            onTouchStart={startHold}
                            onTouchEnd={stopHold}
                            style={{
                                width: '64px',
                                height: '64px',
                                borderRadius: '50%',
                                background: sosTriggered 
                                    ? 'linear-gradient(135deg, #16a34a, #15803d)' 
                                    : holdProgress > 0 
                                        ? `conic-gradient(#ef4444 ${holdProgress}%, #7f1d1d 0)` 
                                        : 'linear-gradient(135deg, #dc2626, #991b1b)',
                                border: `2px solid ${sosTriggered ? 'rgba(74,222,128,0.6)' : 'rgba(252,165,165,0.4)'}`,
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                boxShadow: sosTriggered ? '0 0 20px rgba(22,163,74,0.5)' : '0 0 25px rgba(220,38,38,0.6), 0 0 50px rgba(220,38,38,0.2)',
                                transition: holdProgress > 0 ? 'none' : 'all 0.3s',
                                color: 'white',
                                fontWeight: 900,
                                fontSize: '0.95rem',
                                outline: 'none',
                                userSelect: 'none',
                                WebkitUserSelect: 'none'
                            }}
                        >
                            {sosTriggered ? '✓ SENT' : (holdProgress > 0 && holdProgress < 100) ? `${Math.round(holdProgress)}%` : 'SOS'}
                        </button>
                    </div>
                </div>
            </div>

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
