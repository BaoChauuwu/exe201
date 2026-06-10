import { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import Navbar from '../components/layout/Navbar';
import { MapPin, Star, Globe2, Search, ArrowRight, Compass } from 'lucide-react';

export const FindBuddyPage = () => {
    const [buddies, setBuddies] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        axios.get((import.meta.env.VITE_API_URL || 'http://localhost:3000') + '/buddy-profile')
            .then(res => {
                setBuddies(res.data.data || []);
                setLoading(false);
            })
            .catch(err => {
                console.error(err);
                setLoading(false);
            });
    }, []);

    return (
        <div style={{ minHeight: '100vh', background: 'var(--color-bg)', fontFamily: "'Inter', sans-serif", color: 'var(--color-text)', paddingBottom: '5rem' }}>
            <Navbar />
            
            {/* Premium Hero Section */}
            <div style={{ 
                position: 'relative',
                padding: '8rem 1.5rem', 
                textAlign: 'center',
                color: 'white',
                marginBottom: '5rem',
                overflow: 'hidden',
                borderRadius: '0 0 40px 40px',
                boxShadow: '0 20px 40px rgba(0,0,0,0.1)',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'center',
                minHeight: '500px'
            }}>
                {/* Background Image with Parallax effect feeling */}
                <div style={{
                    position: 'absolute', top: 0, left: 0, width: '100%', height: '100%',
                    backgroundImage: 'url("https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?auto=format&fit=crop&q=80&w=2000")',
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    zIndex: 0
                }} />
                {/* Dark Overlay for readability */}
                <div style={{
                    position: 'absolute', top: 0, left: 0, width: '100%', height: '100%',
                    background: 'linear-gradient(to bottom, rgba(15,23,42,0.3) 0%, rgba(15,23,42,0.85) 100%)',
                    zIndex: 1
                }} />

                <div style={{ position: 'relative', zIndex: 2, maxWidth: '800px', margin: '0 auto', animation: 'fadeInUp 0.8s ease-out' }}>
                    <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: 'rgba(255,255,255,0.15)', border: '1px solid rgba(255,255,255,0.3)', backdropFilter: 'blur(12px)', padding: '8px 20px', borderRadius: '999px', fontSize: '0.9rem', fontWeight: 700, marginBottom: '2rem', textTransform: 'uppercase', letterSpacing: '1px' }}>
                        <Compass size={16} /> Tìm kiếm người đồng hành
                    </div>
                    <h1 style={{ fontSize: 'clamp(2.5rem, 6vw, 4.5rem)', fontWeight: 900, marginBottom: '1.5rem', letterSpacing: '-0.03em', textShadow: '0 8px 30px rgba(0,0,0,0.3)', lineHeight: 1.1 }}>
                        Khám Phá Thành Phố <br /> <span style={{ color: '#38bdf8' }}>Cùng Local Buddy</span>
                    </h1>
                    <p style={{ fontSize: '1.2rem', opacity: 0.95, lineHeight: 1.6, maxWidth: '650px', margin: '0 auto', fontWeight: 400, textShadow: '0 2px 10px rgba(0,0,0,0.2)' }}>
                        Trải nghiệm vẻ đẹp chân thực của địa phương qua lăng kính của những người bạn bản địa đầy nhiệt huyết và giàu kinh nghiệm.
                    </p>
                </div>
            </div>

            <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 1.5rem' }}>
                {loading ? (
                    <div style={{ textAlign: 'center', padding: '5rem', color: 'var(--color-text-faint)' }}>
                        <div style={{ width: '50px', height: '50px', border: '4px solid rgba(56, 189, 248, 0.2)', borderTopColor: '#38bdf8', borderRadius: '50%', animation: 'spin 1s linear infinite', margin: '0 auto 1.5rem' }} />
                        <p style={{ fontSize: '1.1rem', fontWeight: 500 }}>Đang tìm kiếm Buddy tài năng...</p>
                    </div>
                ) : buddies.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '6rem 2rem', color: 'var(--color-text-faint)', background: 'var(--color-surface)', borderRadius: '32px', border: '1px solid var(--color-border)', boxShadow: '0 10px 40px rgba(0,0,0,0.03)' }}>
                        <div style={{ width: '80px', height: '80px', background: 'rgba(56, 189, 248, 0.1)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem' }}>
                            <Search size={36} style={{ color: '#38bdf8' }} />
                        </div>
                        <h3 style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--color-text)', marginBottom: '0.5rem' }}>Chưa có Buddy nào</h3>
                        <p style={{ fontSize: '1.1rem', maxWidth: '400px', margin: '0 auto' }}>Hệ thống đang cập nhật hồ sơ các Buddy. Xin vui lòng quay lại sau nhé!</p>
                    </div>
                ) : (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '2.5rem' }}>
                        {buddies.map((profile, index) => {
                            const user = profile.userId || {};
                            
                            // Sử dụng các ảnh cover phong cảnh đẹp mắt thay vì gradient trơn
                            const coverImages = [
                                'https://images.unsplash.com/photo-1506929562872-bb421503ef21?auto=format&fit=crop&q=80&w=800',
                                'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?auto=format&fit=crop&q=80&w=800',
                                'https://images.unsplash.com/photo-1454496522488-7a8e488e8606?auto=format&fit=crop&q=80&w=800',
                                'https://images.unsplash.com/photo-1433838552652-f9a46b332c40?auto=format&fit=crop&q=80&w=800',
                                'https://images.unsplash.com/photo-1501785888041-af3ef285b470?auto=format&fit=crop&q=80&w=800'
                            ];
                            const coverImg = coverImages[index % coverImages.length];

                            return (
                                <Link key={profile._id} to={`/buddies/${profile._id}`} style={{ textDecoration: 'none', color: 'inherit', display: 'block' }}>
                                    <div className="buddy-card" style={{
                                        background: 'var(--color-surface)', 
                                        border: '1px solid var(--color-border)',
                                        borderRadius: '24px', 
                                        transition: 'all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
                                        position: 'relative', 
                                        overflow: 'hidden',
                                        boxShadow: '0 4px 20px rgba(0,0,0,0.04)',
                                        display: 'flex',
                                        flexDirection: 'column',
                                        height: '100%'
                                    }}>
                                        {/* Cover Image */}
                                        <div style={{ 
                                            height: '140px', 
                                            backgroundImage: `url(${coverImg})`,
                                            backgroundSize: 'cover',
                                            backgroundPosition: 'center',
                                            position: 'relative'
                                        }}>
                                            <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', background: 'linear-gradient(to bottom, rgba(0,0,0,0.1), rgba(0,0,0,0.4))' }} />
                                            
                                            {/* Rating floating badge */}
                                            <div style={{
                                                position: 'absolute',
                                                top: '16px',
                                                right: '16px',
                                                background: 'rgba(255,255,255,0.95)',
                                                backdropFilter: 'blur(8px)',
                                                padding: '6px 12px',
                                                borderRadius: '20px',
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '6px',
                                                fontSize: '0.85rem',
                                                fontWeight: 800,
                                                color: '#f59e0b',
                                                boxShadow: '0 4px 15px rgba(0,0,0,0.1)'
                                            }}>
                                                <Star size={14} fill="currentColor" /> {profile.rating > 0 ? profile.rating.toFixed(1) : 'Mới'}
                                            </div>
                                        </div>

                                        {/* Avatar overlapping with white border */}
                                        <div style={{ 
                                            position: 'absolute', 
                                            top: '90px', 
                                            left: '24px', 
                                            width: '90px', 
                                            height: '90px', 
                                            borderRadius: '50%', 
                                            background: 'var(--color-surface)', 
                                            padding: '4px',
                                            boxShadow: '0 8px 25px rgba(0,0,0,0.15)',
                                            zIndex: 2
                                        }}>
                                            <div style={{ width: '100%', height: '100%', borderRadius: '50%', overflow: 'hidden', background: '#f8fafc' }}>
                                                <img src={user.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name || 'B')}&background=random&color=0f172a&bold=true`} alt={user.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                            </div>
                                        </div>

                                        {/* Card Content */}
                                        <div style={{ padding: '56px 24px 28px', display: 'flex', flexDirection: 'column', flex: 1 }}>
                                            <h2 style={{ margin: '0 0 0.5rem', fontSize: '1.4rem', fontWeight: 800, color: 'var(--color-text)', letterSpacing: '-0.01em' }}>{user.name || 'Unknown Buddy'}</h2>
                                            
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#64748b', fontSize: '0.95rem', marginBottom: '1.25rem', fontWeight: 600 }}>
                                                <MapPin size={16} color="#38bdf8" style={{ flexShrink: 0 }} /> 
                                                <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{profile.city || user.location || 'Vietnam'}</span>
                                            </div>

                                            <p style={{ color: 'var(--color-text-muted)', fontSize: '1rem', lineHeight: 1.6, marginBottom: '1.5rem', flex: 1, display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                                                {profile.bio || 'Tôi là một Local Buddy đam mê du lịch và khám phá. Rất vui được đồng hành cùng bạn trên những chuyến hành trình tuyệt vời sắp tới!'}
                                            </p>

                                            {/* Languages & CTA */}
                                            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', marginTop: 'auto' }}>
                                                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                                                    {profile.languages && profile.languages.slice(0, 3).map((lang: string) => (
                                                        <div key={lang} style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'var(--color-bg-2)', color: 'var(--color-text)', padding: '6px 14px', borderRadius: '999px', fontSize: '0.85rem', fontWeight: 600 }}>
                                                            <Globe2 size={14} style={{ color: '#38bdf8' }} /> {lang}
                                                        </div>
                                                    ))}
                                                    {profile.languages && profile.languages.length > 3 && (
                                                        <div style={{ display: 'flex', alignItems: 'center', background: 'var(--color-bg-2)', color: 'var(--color-text-muted)', padding: '6px 12px', borderRadius: '999px', fontSize: '0.85rem', fontWeight: 700 }}>
                                                            +{profile.languages.length - 3}
                                                        </div>
                                                    )}
                                                </div>

                                                <div className="view-tour-btn" style={{ 
                                                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                                                    background: '#0f172a', color: 'white', 
                                                    padding: '14px', borderRadius: '16px', fontWeight: 700, fontSize: '1rem',
                                                    transition: 'all 0.3s ease', border: 'none', boxShadow: '0 4px 15px rgba(15, 23, 42, 0.2)'
                                                }}>
                                                    Xem chi tiết hồ sơ <ArrowRight size={18} />
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </Link>
                            );
                        })}
                    </div>
                )}
            </div>
            
            <style>{`
                @keyframes spin { to { transform: rotate(360deg) } }
                @keyframes fadeInUp { from { opacity: 0; transform: translateY(20px) } to { opacity: 1; transform: translateY(0) } }
                
                .buddy-card:hover {
                    transform: translateY(-8px) !important;
                    box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.15) !important;
                }
                
                .buddy-card:hover .view-tour-btn {
                    background: #38bdf8 !important;
                    box-shadow: 0 8px 25px -8px rgba(56, 189, 248, 0.6) !important;
                    transform: scale(1.02);
                }
            `}</style>
        </div>
    );
};

