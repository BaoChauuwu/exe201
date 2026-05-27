import { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import Navbar from '../components/layout/Navbar';
import { MapPin, Star, Globe2, Search, ArrowRight } from 'lucide-react';

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
        <div style={{ minHeight: '100vh', background: 'var(--color-bg)', fontFamily: "'Inter', sans-serif", color: 'var(--color-text)' }}>
            <Navbar />
            
            <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '3rem 1.5rem' }}>
                <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
                    <h1 style={{ fontSize: '2.5rem', fontWeight: 800, margin: '0 0 1rem', background: 'var(--gradient-primary)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                        Tìm Local Buddy Của Bạn
                    </h1>
                    <p style={{ color: 'var(--color-text-muted)', fontSize: '1.1rem', maxWidth: '600px', margin: '0 auto' }}>
                        Khám phá thành phố qua góc nhìn của người bản địa. Chọn một Buddy phù hợp để đồng hành cùng bạn.
                    </p>
                </div>

                {loading ? (
                    <div style={{ textAlign: 'center', padding: '5rem', color: 'var(--color-text-faint)' }}>
                        <div style={{ width: '40px', height: '40px', border: '3px solid rgba(14,165,233,0.1)', borderTopColor: 'var(--color-primary)', borderRadius: '50%', animation: 'spin 1s linear infinite', margin: '0 auto 1rem' }} />
                        Đang tải danh sách Buddy...
                    </div>
                ) : buddies.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '5rem', color: 'var(--color-text-faint)', background: 'var(--color-surface)', borderRadius: '24px', border: '1px solid var(--color-border)' }}>
                        <Search size={48} style={{ opacity: 0.5, margin: '0 auto 1rem', display: 'block', color: 'var(--color-text-faint)' }} />
                        <p style={{ fontSize: '1.2rem' }}>Chưa có Buddy nào đăng ký hồ sơ.</p>
                    </div>
                ) : (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1.5rem' }}>
                        {buddies.map(profile => {
                            const user = profile.userId || {};
                            return (
                                <Link key={profile._id} to={`/buddies/${profile._id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                                    <div style={{
                                        background: 'var(--color-surface)', border: '1px solid var(--color-border)',
                                        borderRadius: '24px', padding: '1.5rem', transition: 'all 0.3s',
                                        position: 'relative', overflow: 'hidden'
                                    }}
                                        onMouseEnter={e => {
                                            (e.currentTarget as HTMLElement).style.transform = 'translateY(-5px)';
                                            (e.currentTarget as HTMLElement).style.borderColor = 'rgba(14, 165, 233, 0.4)';
                                            (e.currentTarget as HTMLElement).style.boxShadow = 'var(--shadow-md)';
                                        }}
                                        onMouseLeave={e => {
                                            (e.currentTarget as HTMLElement).style.transform = 'translateY(0)';
                                            (e.currentTarget as HTMLElement).style.borderColor = 'var(--color-border)';
                                            (e.currentTarget as HTMLElement).style.boxShadow = 'none';
                                        }}
                                    >
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', marginBottom: '1.25rem' }}>
                                            <div style={{ width: '70px', height: '70px', borderRadius: '50%', background: 'var(--gradient-primary)', padding: '3px', flexShrink: 0 }}>
                                                <div style={{ width: '100%', height: '100%', background: '#fff', borderRadius: '50%', overflow: 'hidden' }}>
                                                    <img src={user.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name || 'B')}&background=random`} alt={user.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                                </div>
                                            </div>
                                            <div>
                                                <h2 style={{ margin: '0 0 0.25rem', fontSize: '1.25rem', fontWeight: 700, color: 'var(--color-text)' }}>{user.name || 'Unknown Buddy'}</h2>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--color-text-muted)', fontSize: '0.85rem' }}>
                                                    <MapPin size={14} color="var(--color-primary)" /> {profile.city || user.location || 'Vietnam'}
                                                </div>
                                            </div>
                                        </div>

                                        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '1.5rem' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '4px', background: 'rgba(245,158,11,0.15)', color: '#d97706', padding: '4px 10px', borderRadius: '999px', fontSize: '0.75rem', fontWeight: 600 }}>
                                                <Star size={12} fill="currentColor" /> {profile.rating > 0 ? profile.rating.toFixed(1) : 'Chưa có'}
                                            </div>
                                            {profile.languages && profile.languages.slice(0, 2).map((lang: string) => (
                                                <div key={lang} style={{ display: 'flex', alignItems: 'center', gap: '4px', background: 'rgba(14,165,233,0.1)', color: 'var(--color-primary-dark)', padding: '4px 10px', borderRadius: '999px', fontSize: '0.75rem', fontWeight: 500 }}>
                                                    <Globe2 size={12} /> {lang}
                                                </div>
                                            ))}
                                            {profile.languages && profile.languages.length > 2 && (
                                                <div style={{ display: 'flex', alignItems: 'center', background: 'rgba(14,165,233,0.05)', color: 'var(--color-text-muted)', padding: '4px 8px', borderRadius: '999px', fontSize: '0.75rem' }}>
                                                    +{profile.languages.length - 2}
                                                </div>
                                            )}
                                        </div>

                                        <p style={{ color: 'var(--color-text-muted)', fontSize: '0.9rem', lineHeight: 1.5, marginBottom: '1.5rem', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                                            {profile.bio || 'Chào mừng bạn đến với chuyến đi của tôi! Tôi rất mong được đồng hành cùng bạn khám phá những điều thú vị.'}
                                        </p>

                                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTop: '1px solid var(--color-border)', paddingTop: '1rem' }}>
                                            <span style={{ color: 'var(--color-primary)', fontWeight: 600, fontSize: '0.9rem' }}>Xem các tour trải nghiệm</span>
                                            <ArrowRight size={18} style={{ color: 'var(--color-text-faint)' }} />
                                        </div>
                                    </div>
                                </Link>
                            );
                        })}
                    </div>
                )}
            </div>
            <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
        </div>
    );
};
