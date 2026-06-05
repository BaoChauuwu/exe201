import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import axios from 'axios';
import { socket } from '../socket';
import Navbar from '../components/layout/Navbar';
import { useAuthStore } from '../store/authStore';
import { ShieldCheck, MapPin, Navigation } from 'lucide-react';

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
                axios.post((import.meta.env.VITE_API_URL || 'http://localhost:3000') + '/safety/tracking', {
                    bookingId,
                    buddyId: user._id, // Truyền user._id làm payload
                    lat: coords.latitude,
                    lng: coords.longitude,
                    role: 'tourist'
                }).catch(err => console.error('Error reporting tourist location:', err));
            },
            err => console.error('Tourist GPS error:', err.message),
            { enableHighAccuracy: true, maximumAge: 10000, timeout: 5000 }
        );

        return () => navigator.geolocation.clearWatch(watchId);
    }, [bookingId, user]);

    // 2. Kết nối socket lắng nghe vị trí Buddy cập nhật
    useEffect(() => {
        if (!bookingId) return;

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
                        <h2 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 800 }}>Theo dõi hành trình (Tourist)</h2>
                        <p style={{ margin: 0, fontSize: '0.8rem', color: 'rgba(255,255,255,0.6)' }}>Tour ID: <code style={{ color: '#a5b4fc' }}>{bookingId}</code></p>
                    </div>
                </div>
                
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', background: 'rgba(0,0,0,0.3)', padding: '0.5rem 1rem', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.1)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: buddyLocation ? '#10b981' : '#f59e0b', boxShadow: `0 0 8px ${buddyLocation ? '#10b981' : '#f59e0b'}`, animation: 'ping 1.5s infinite' }} />
                        <span style={{ fontSize: '0.85rem', fontWeight: 600, color: buddyLocation ? '#34d399' : '#fbbf24' }}>
                            {buddyLocation ? 'Đang nhận vị trí Buddy' : 'Đang chờ Buddy bật GPS...'}
                        </span>
                    </div>
                    {lastUpdated && (
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
            </div>

            <style>{`
                @keyframes pulse-ring {
                    0% { transform: scale(1); opacity: 0.6; }
                    100% { transform: scale(2.2); opacity: 0; }
                }
                @keyframes ping { 0%, 100% { opacity: 0.5; transform: scale(1) } 50% { opacity: 1; transform: scale(1.2) } }
                @keyframes bounce { 0%, 100% { transform: translateY(0) } 50% { transform: translateY(-10px) } }
                .leaflet-popup-content-wrapper { border-radius: 12px; box-shadow: 0 10px 25px rgba(0,0,0,0.2); }
                .leaflet-popup-content { margin: 12px; }
            `}</style>
        </div>
    );
};

export default TouristLiveMap;
