import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { socket } from '../socket';
import Navbar from '../components/layout/Navbar';
import { ShieldCheck, MapPin, Navigation } from 'lucide-react';

// Custom Marker Icons
import buddyIconImg from 'leaflet/dist/images/marker-icon.png';
import buddyShadowImg from 'leaflet/dist/images/marker-shadow.png';

const buddyIcon = new L.Icon({
    iconUrl: buddyIconImg,
    shadowUrl: buddyShadowImg,
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
});

// Component to auto-center map when location updates
const RecenterMap = ({ lat, lng }: { lat: number, lng: number }) => {
    const map = useMap();
    useEffect(() => {
        map.flyTo([lat, lng], map.getZoom());
    }, [lat, lng, map]);
    return null;
};

export const TouristLiveMap = () => {
    const { bookingId } = useParams();
    const [buddyLocation, setBuddyLocation] = useState<{ lat: number, lng: number } | null>(null);
    const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

    useEffect(() => {
        if (!bookingId) return;

        // Listen for location updates from the backend socket
        socket.on(`location_updated_${bookingId}`, (data: { lat: number, lng: number }) => {
            setBuddyLocation({ lat: data.lat, lng: data.lng });
            setLastUpdated(new Date());
        });

        // Cleanup
        return () => {
            socket.off(`location_updated_${bookingId}`);
        };
    }, [bookingId]);

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
                            {buddyLocation ? 'Đang nhận tín hiệu' : 'Đang chờ Buddy bật GPS...'}
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
                {buddyLocation ? (
                    <MapContainer 
                        center={[buddyLocation.lat, buddyLocation.lng]} 
                        zoom={16} 
                        style={{ height: '100%', width: '100%', zIndex: 1 }}
                    >
                        <TileLayer
                            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                        />
                        <Marker position={[buddyLocation.lat, buddyLocation.lng]} icon={buddyIcon}>
                            <Popup>
                                <div style={{ textAlign: 'center', minWidth: '120px' }}>
                                    <ShieldCheck size={24} style={{ color: '#10b981', margin: '0 auto 0.25rem' }} />
                                    <strong style={{ color: '#1f2937', fontSize: '0.9rem' }}>Buddy đang ở đây!</strong>
                                    <p style={{ margin: '4px 0 0', fontSize: '0.75rem', color: '#6b7280' }}>
                                        Lat: {buddyLocation.lat.toFixed(5)}<br/>
                                        Lng: {buddyLocation.lng.toFixed(5)}
                                    </p>
                                </div>
                            </Popup>
                        </Marker>
                        <RecenterMap lat={buddyLocation.lat} lng={buddyLocation.lng} />
                    </MapContainer>
                ) : (
                    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.5)' }}>
                        <MapPin size={48} style={{ color: 'rgba(255,255,255,0.2)', marginBottom: '1rem', animation: 'bounce 2s infinite' }} />
                        <h3 style={{ margin: 0, color: 'rgba(255,255,255,0.5)' }}>Chưa có tín hiệu GPS từ Buddy</h3>
                        <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: '0.9rem', maxWidth: '400px', textAlign: 'center', marginTop: '0.5rem' }}>
                            Bản đồ sẽ tự động hiển thị ngay khi Buddy bắt đầu chia sẻ vị trí của họ trong chuyến đi.
                        </p>
                    </div>
                )}
            </div>

            <style>{`
                @keyframes ping { 0%, 100% { opacity: 0.5; transform: scale(1) } 50% { opacity: 1; transform: scale(1.2) } }
                @keyframes bounce { 0%, 100% { transform: translateY(0) } 50% { transform: translateY(-10px) } }
                /* Tweak leaflet popup styles */
                .leaflet-popup-content-wrapper { border-radius: 12px; box-shadow: 0 10px 25px rgba(0,0,0,0.2); }
                .leaflet-popup-content { margin: 12px; }
            `}</style>
        </div>
    );
};
