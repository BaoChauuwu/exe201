import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Navbar from '../components/layout/Navbar';
import { Navigation, MapPin, Activity, ShieldAlert } from 'lucide-react';
import { useParams } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';

export const LiveTracking = () => {
    const [status, setStatus] = useState('Đang khởi tạo...');
    const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null);
    const [sosTriggered, setSosTriggered] = useState(false);

    const { bookingId } = useParams();
    const { user } = useAuthStore();
    const buddyId = user?._id;

    useEffect(() => {
        if (!navigator.geolocation) {
            setStatus('Trình duyệt không hỗ trợ định vị GPS');
            return;
        }
        setStatus('Đang định vị...');
        const watchId = navigator.geolocation.watchPosition(
            ({ coords }) => {
                setLocation({ lat: coords.latitude, lng: coords.longitude });
                setStatus('Đang theo dõi');
                if (bookingId && buddyId) {
                    axios.post('http://localhost:3000/safety/tracking', { bookingId, buddyId, lat: coords.latitude, lng: coords.longitude }).catch(console.error);
                }
            },
            err => setStatus('Lỗi: ' + err.message),
            { enableHighAccuracy: true, maximumAge: 10000, timeout: 5000 }
        );
        return () => navigator.geolocation.clearWatch(watchId);
    }, []);

    const handleSOS = () => {
        if (!bookingId || !buddyId) return;
        if (window.confirm('⚠️ BẠN CÓ CHẮC MUỐN KÊU CỨU KHẨN CẤP? Admin sẽ được thông báo ngay lập tức!')) {
            axios.post('http://localhost:3000/safety/sos', { bookingId, userId: buddyId, message: 'KHẨN CẤP: Người dùng nhấn SOS trong tour.' })
                .then(() => { setSosTriggered(true); alert('✅ Tín hiệu SOS đã được gửi! Hỗ trợ đang trên đường đến.'); })
                .catch(() => alert('❌ Gửi SOS thất bại. Vui lòng gọi 113 ngay!'));
        }
    };

    return (
        <div style={{ minHeight: '100vh', background: 'linear-gradient(180deg, #0a0a0f 0%, #0d1117 100%)', fontFamily: "'Inter', -apple-system, sans-serif", color: 'white' }}>
            <Navbar />
            <div style={{ maxWidth: '480px', margin: '0 auto', padding: '2rem 1.5rem' }}>

                {/* Card */}
                <div style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '28px', overflow: 'hidden', boxShadow: '0 25px 60px rgba(0,0,0,0.6)' }}>

                    {/* Status bar */}
                    <div style={{ background: 'rgba(0,0,0,0.3)', padding: '1rem 1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <Activity size={16} style={{ color: '#34d399' }} />
                            <span style={{ fontWeight: 600, color: 'rgba(255,255,255,0.7)', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Live Tour</span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#10b981', boxShadow: '0 0 8px rgba(16,185,129,0.8)', animation: 'ping 1.5s ease-in-out infinite' }} />
                            <span style={{ color: '#34d399', fontSize: '0.75rem', fontFamily: 'monospace', fontWeight: 600 }}>{status}</span>
                        </div>
                    </div>

                    {/* Radar display */}
                    <div style={{ position: 'relative', height: '260px', background: 'radial-gradient(circle, rgba(16,185,129,0.05) 0%, rgba(0,0,0,0) 70%)', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
                        {/* Concentric rings */}
                        {[100, 70, 40].map((size, i) => (
                            <div key={i} style={{ position: 'absolute', width: `${size}%`, height: `${size}%`, borderRadius: '50%', border: '1px solid rgba(16,185,129,0.12)' }} />
                        ))}
                        {/* Crosshairs */}
                        <div style={{ position: 'absolute', width: '100%', height: '1px', background: 'rgba(16,185,129,0.08)' }} />
                        <div style={{ position: 'absolute', width: '1px', height: '100%', background: 'rgba(16,185,129,0.08)' }} />
                        {/* Sweep */}
                        <div style={{ position: 'absolute', width: '100%', height: '100%', background: 'conic-gradient(from 0deg, transparent 0%, rgba(16,185,129,0.15) 10%, transparent 15%)', animation: 'sweep 3s linear infinite', transformOrigin: 'center' }} />

                        {location ? (
                            <div style={{ position: 'relative', zIndex: 2, textAlign: 'center' }}>
                                <div style={{ width: '52px', height: '52px', borderRadius: '50%', background: 'rgba(16,185,129,0.15)', border: '2px solid rgba(16,185,129,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto', boxShadow: '0 0 20px rgba(16,185,129,0.4)', animation: 'glow 2s ease-in-out infinite' }}>
                                    <Navigation size={24} style={{ color: '#34d399', transform: 'rotate(45deg)' }} />
                                </div>
                                <div style={{ marginTop: '0.875rem', background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(10px)', border: '1px solid rgba(16,185,129,0.2)', borderRadius: '10px', padding: '0.5rem 1rem', fontFamily: 'monospace', fontSize: '0.75rem', color: '#34d399' }}>
                                    <p style={{ margin: '0 0 2px' }}>LAT: {location.lat.toFixed(6)}</p>
                                    <p style={{ margin: 0 }}>LNG: {location.lng.toFixed(6)}</p>
                                </div>
                            </div>
                        ) : (
                            <div style={{ textAlign: 'center', color: 'rgba(255,255,255,0.3)', animation: 'pulse 2s ease-in-out infinite' }}>
                                <MapPin size={32} style={{ marginBottom: '0.5rem' }} />
                                <p style={{ margin: 0, fontSize: '0.8rem', fontFamily: 'monospace' }}>ACQUIRING SIGNAL...</p>
                            </div>
                        )}
                    </div>

                    {/* SOS Section */}
                    <div style={{ padding: '2rem', textAlign: 'center', borderTop: '1px solid rgba(255,255,255,0.06)', background: 'rgba(0,0,0,0.2)' }}>
                        <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'rgba(255,255,255,0.8)', margin: '0 0 0.5rem' }}>Cấp cứu khẩn cấp</h3>
                        <p style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.3)', margin: '0 0 2rem', lineHeight: 1.5 }}>Chỉ nhấn khi bạn đang trong nguy hiểm thực sự. Mọi Admin sẽ được cảnh báo ngay lập tức.</p>

                        <div style={{ position: 'relative', display: 'inline-block' }}>
                            {/* Outer pulse rings */}
                            <div style={{ position: 'absolute', inset: '-16px', borderRadius: '50%', border: '2px solid rgba(239,68,68,0.3)', animation: 'ping 1.5s ease-in-out infinite' }} />
                            <div style={{ position: 'absolute', inset: '-8px', borderRadius: '50%', border: '1px solid rgba(239,68,68,0.4)', animation: 'ping 1.5s ease-in-out infinite', animationDelay: '0.5s' }} />

                            <button
                                onClick={handleSOS}
                                style={{
                                    width: '140px', height: '140px', borderRadius: '50%',
                                    background: sosTriggered
                                        ? 'linear-gradient(135deg, #16a34a, #15803d)'
                                        : 'linear-gradient(135deg, #dc2626, #991b1b)',
                                    border: `3px solid ${sosTriggered ? 'rgba(74,222,128,0.5)' : 'rgba(252,165,165,0.3)'}`,
                                    cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '0.35rem',
                                    boxShadow: sosTriggered ? '0 0 40px rgba(22,163,74,0.6)' : '0 0 50px rgba(220,38,38,0.6), 0 0 100px rgba(220,38,38,0.2)',
                                    transition: 'all 0.3s',
                                    animation: sosTriggered ? 'none' : 'heartbeat 1.5s ease-in-out infinite',
                                }}
                                onMouseEnter={e => !sosTriggered && ((e.currentTarget as HTMLElement).style.transform = 'scale(1.05)')}
                                onMouseLeave={e => (e.currentTarget as HTMLElement).style.transform = 'scale(1)'}
                            >
                                <ShieldAlert size={40} color='white' />
                                <span style={{ color: 'white', fontWeight: 900, fontSize: '1.5rem', letterSpacing: '0.1em', textShadow: '0 2px 8px rgba(0,0,0,0.5)' }}>
                                    {sosTriggered ? '✓ SENT' : 'SOS'}
                                </span>
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <style>{`
                @keyframes sweep { to { transform: rotate(360deg) } }
                @keyframes ping { 0%, 100% { opacity: 0.4; transform: scale(1) } 50% { opacity: 1; transform: scale(1.05) } }
                @keyframes pulse { 0%, 100% { opacity: 0.5 } 50% { opacity: 1 } }
                @keyframes glow { 0%, 100% { box-shadow: 0 0 20px rgba(16,185,129,0.4) } 50% { box-shadow: 0 0 40px rgba(16,185,129,0.7) } }
                @keyframes heartbeat { 0%, 100% { transform: scale(1) } 14% { transform: scale(1.04) } 28% { transform: scale(1) } 42% { transform: scale(1.04) } 70% { transform: scale(1) } }
            `}</style>
        </div>
    );
};
