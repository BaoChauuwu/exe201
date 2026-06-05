import { useEffect, useState } from 'react';
import axios from 'axios';
import Navbar from '../components/layout/Navbar';
import { MapPin, Activity, ShieldAlert } from 'lucide-react';
import { useParams } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import toast from 'react-hot-toast';
import { socket } from '../socket';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

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

const buddyIcon = createMarkerIcon('#10b981', 'Bạn (Buddy)');
const touristIcon = createMarkerIcon('#0ea5e9', 'Tourist');

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

export const LiveTracking = () => {
    const [status, setStatus] = useState('Đang khởi tạo...');
    const [buddyLocation, setBuddyLocation] = useState<{ lat: number; lng: number } | null>(null);
    const [touristLocation, setTouristLocation] = useState<{ lat: number; lng: number } | null>(null);
    const [sosTriggered, setSosTriggered] = useState(false);
    const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

    const { bookingId } = useParams();
    const { user } = useAuthStore();
    const buddyId = user?._id;

    // 1. Kết nối socket lắng nghe vị trí của Tourist cập nhật
    useEffect(() => {
        if (!bookingId) return;
        
        socket.connect();

        socket.on(`location_updated_${bookingId}`, (data: { lat: number, lng: number, role?: string }) => {
            if (data.role === 'tourist') {
                setTouristLocation({ lat: data.lat, lng: data.lng });
                setLastUpdated(new Date());
            }
        });

        return () => {
            socket.off(`location_updated_${bookingId}`);
        };
    }, [bookingId]);

    // 2. Định vị GPS của Buddy và gửi định vị lên backend
    useEffect(() => {
        if (!navigator.geolocation) {
            setStatus('Trình duyệt không hỗ trợ định vị GPS');
            return;
        }
        setStatus('Đang định vị...');
        const watchId = navigator.geolocation.watchPosition(
            ({ coords }) => {
                const newLoc = { lat: coords.latitude, lng: coords.longitude };
                setBuddyLocation(newLoc);
                setStatus('Đang theo dõi');
                if (bookingId && buddyId) {
                    axios.post((import.meta.env.VITE_API_URL || 'http://localhost:3000') + '/safety/tracking', { 
                        bookingId, 
                        buddyId, 
                        lat: coords.latitude, 
                        lng: coords.longitude,
                        role: 'buddy'
                    }).catch(console.error);
                }
            },
            err => setStatus('Lỗi: ' + err.message),
            { enableHighAccuracy: true, maximumAge: 10000, timeout: 5000 }
        );
        return () => navigator.geolocation.clearWatch(watchId);
    }, [bookingId, buddyId]);

    const handleSOS = () => {
        if (!bookingId || !buddyId) return;
        if (window.confirm('⚠️ BẠN CÓ CHẮC MUỐN KÊU CỨU KHẨN CẤP? Admin sẽ được thông báo ngay lập tức!')) {
            axios.post((import.meta.env.VITE_API_URL || 'http://localhost:3000') + '/safety/sos', { bookingId, userId: buddyId, message: 'KHẨN CẤP: Người dùng nhấn SOS trong tour.' })
                .then(() => { setSosTriggered(true); toast.success('Tín hiệu SOS đã được gửi! Hỗ trợ đang trên đường đến.'); })
                .catch(() => toast.error('Gửi SOS thất bại. Vui lòng gọi 113 ngay!'));
        }
    };

    return (
        <div style={{ height: '100vh', display: 'flex', flexDirection: 'column', background: '#0a0a0f', color: 'white', fontFamily: "'Inter', sans-serif" }}>
            <Navbar />

            {/* Header info */}
            <div style={{ background: 'linear-gradient(90deg, #1e1b4b, #312e81)', padding: '1rem 2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(139,92,246,0.3)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <div style={{ background: 'rgba(52,211,153,0.2)', padding: '0.5rem', borderRadius: '50%' }}>
                        <Activity size={20} style={{ color: '#34d399' }} />
                    </div>
                    <div>
                        <h2 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 800 }}>Chia sẻ vị trí & SOS (Buddy)</h2>
                        <p style={{ margin: 0, fontSize: '0.8rem', color: 'rgba(255,255,255,0.6)' }}>Tour ID: <code style={{ color: '#a5b4fc' }}>{bookingId}</code></p>
                    </div>
                </div>
                
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', background: 'rgba(0,0,0,0.3)', padding: '0.5rem 1rem', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.1)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: buddyLocation ? '#10b981' : '#f59e0b', boxShadow: `0 0 8px ${buddyLocation ? '#10b981' : '#f59e0b'}`, animation: 'ping 1.5s infinite' }} />
                        <span style={{ fontSize: '0.85rem', fontWeight: 600, color: buddyLocation ? '#34d399' : '#fbbf24' }}>
                            GPS: {status}
                        </span>
                    </div>
                    {lastUpdated && (
                        <div style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.4)' }}>
                            Tourist cập nhật: {lastUpdated.toLocaleTimeString()}
                        </div>
                    )}
                </div>
            </div>

            {/* Map Area taking up the entire remaining viewport height */}
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
                        
                        {/* Marker cho Buddy (Bạn) */}
                        {buddyLocation && (
                            <Marker position={[buddyLocation.lat, buddyLocation.lng]} icon={buddyIcon}>
                                <Popup>
                                    <div style={{ color: '#1f2937', fontSize: '0.8rem', textAlign: 'center' }}>
                                        <strong>Bạn (Buddy)</strong><br/>
                                        Đang định vị trực tiếp.
                                    </div>
                                </Popup>
                            </Marker>
                        )}

                        {/* Marker cho Tourist */}
                        {touristLocation && (
                            <Marker position={[touristLocation.lat, touristLocation.lng]} icon={touristIcon}>
                                <Popup>
                                    <div style={{ color: '#1f2937', fontSize: '0.8rem', textAlign: 'center' }}>
                                        <strong>Khách du lịch (Tourist)</strong><br/>
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
                            Vui lòng cấp quyền định vị GPS để hiển thị bản đồ hành trình.
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
                            Chỉ nhấn nút này trong trường hợp khẩn cấp để gọi cứu hộ.
                        </p>
                    </div>
                    
                    <div style={{ position: 'relative' }}>
                        {/* Pulsing SOS rings */}
                        {!sosTriggered && (
                            <>
                                <div style={{ position: 'absolute', inset: '-8px', borderRadius: '50%', border: '2px solid rgba(239,68,68,0.4)', animation: 'ping-sos 1.5s ease-in-out infinite' }} />
                                <div style={{ position: 'absolute', inset: '-4px', borderRadius: '50%', border: '1px solid rgba(239,68,68,0.5)', animation: 'ping-sos 1.5s ease-in-out infinite', animationDelay: '0.5s' }} />
                            </>
                        )}
                        
                        <button
                            onClick={handleSOS}
                            style={{
                                width: '64px',
                                height: '64px',
                                borderRadius: '50%',
                                background: sosTriggered ? 'linear-gradient(135deg, #16a34a, #15803d)' : 'linear-gradient(135deg, #dc2626, #991b1b)',
                                border: `2px solid ${sosTriggered ? 'rgba(74,222,128,0.6)' : 'rgba(252,165,165,0.4)'}`,
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                boxShadow: sosTriggered ? '0 0 20px rgba(22,163,74,0.5)' : '0 0 25px rgba(220,38,38,0.6), 0 0 50px rgba(220,38,38,0.2)',
                                transition: 'all 0.3s',
                                color: 'white',
                                fontWeight: 900,
                                fontSize: '0.95rem',
                                outline: 'none'
                            }}
                        >
                            {sosTriggered ? '✓ SENT' : 'SOS'}
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

export default LiveTracking;
