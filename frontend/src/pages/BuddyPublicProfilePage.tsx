import { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import Navbar from '../components/layout/Navbar';
import { MapPin, Star, Globe2, Clock, CheckCircle2, UserCheck, Calendar, ArrowLeft, Shield, TrendingUp } from 'lucide-react';

export const BuddyPublicProfilePage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [profile, setProfile] = useState<any>(null);
    const [experiences, setExperiences] = useState<any[]>([]);
    const [reviews, setReviews] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        axios.get(`${import.meta.env.VITE_API_URL || 'http://localhost:3000'}/buddy-profile/${id}`)
            .then(profileRes => {
                const buddyProfile = profileRes.data.data;
                setProfile(buddyProfile);
                const buddyUserId = buddyProfile.userId?._id || buddyProfile.userId;
                
                Promise.all([
                    axios.get(`${import.meta.env.VITE_API_URL || 'http://localhost:3000'}/experiences/buddy/${id || buddyUserId}`).catch(() => ({ data: { result: [] } })),
                    axios.get(`${import.meta.env.VITE_API_URL || 'http://localhost:3000'}/reviews/target/${buddyUserId}`).catch(() => ({ data: { result: [] } }))
                ]).then(([expRes, reviewRes]) => {
                    const buddyExp = expRes.data.result || [];
                    setExperiences(buddyExp);
                    setReviews(reviewRes.data.result || []);
                    setLoading(false);
                }).catch(err => {
                    console.error(err);
                    setLoading(false);
                });
            })
            .catch(err => {
                console.error(err);
                setLoading(false);
            });
    }, [id]);

    if (loading) {
        return (
            <div style={{ minHeight: '100vh', background: 'var(--color-bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-text)' }}>
                <div style={{ width: '40px', height: '40px', border: '3px solid rgba(99,102,241,0.1)', borderTopColor: '#818cf8', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
                <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
            </div>
        );
    }

    if (!profile) {
        return (
            <div style={{ minHeight: '100vh', background: 'var(--color-bg)', color: 'var(--color-text)' }}>
                <Navbar />
                <div style={{ padding: '5rem', textAlign: 'center' }}>
                    <h1>Không tìm thấy Buddy này.</h1>
                    <button onClick={() => navigate('/buddies')} style={{ background: '#6366f1', border: 'none', padding: '0.8rem 1.5rem', borderRadius: '8px', color: 'white', marginTop: '1rem', cursor: 'pointer' }}>
                        Quay lại danh sách
                    </button>
                </div>
            </div>
        );
    }

    const user = profile.userId || {};

    return (
        <div style={{ minHeight: '100vh', background: 'var(--color-bg)', fontFamily: "'Inter', -apple-system, sans-serif", color: 'var(--color-text)', paddingBottom: '5rem' }}>
            <Navbar />
            
            {/* Header Banner */}
            <div style={{ height: '280px', background: 'linear-gradient(135deg, #1e1b4b, #4c1d95, #000000)', position: 'relative', overflow: 'hidden' }}>
                <div style={{ position: 'absolute', inset: 0, backgroundImage: 'url("https://images.unsplash.com/photo-1506929562872-bb421503ef21?q=80&w=2000&auto=format&fit=crop")', backgroundSize: 'cover', backgroundPosition: 'center', opacity: 0.25 }} />
                <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: '100px', background: 'linear-gradient(to top, var(--color-bg), transparent)' }} />
            </div>

            <div style={{ maxWidth: '1000px', margin: '-100px auto 0', padding: '0 1.5rem', position: 'relative', zIndex: 10 }}>
                <button onClick={() => navigate('/buddies')} style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)', color: 'var(--color-text)', padding: '0.5rem 1rem', borderRadius: '999px', display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', marginBottom: '1.5rem', backdropFilter: 'blur(10px)', transition: 'background 0.2s', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}
                    onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = 'var(--color-bg-2)'}
                    onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = 'var(--color-surface)'}>
                    <ArrowLeft size={16} /> Danh sách Buddy
                </button>

                <div style={{ display: 'flex', gap: '2rem', alignItems: 'flex-end', marginBottom: '2.5rem', flexWrap: 'wrap' }}>
                    <div style={{ width: '160px', height: '160px', borderRadius: '50%', background: 'linear-gradient(135deg, #6366f1, #a855f7)', padding: '5px', flexShrink: 0, boxShadow: '0 15px 35px rgba(0,0,0,0.15)' }}>
                        <div style={{ width: '100%', height: '100%', background: 'var(--color-surface)', borderRadius: '50%', overflow: 'hidden' }}>
                            <img src={user.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name || 'B')}&background=random&size=300`} alt={user.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        </div>
                    </div>
                    <div style={{ paddingBottom: '1rem', flex: 1 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '0.5rem', flexWrap: 'wrap' }}>
                            <h1 style={{ margin: 0, fontSize: '2.5rem', fontWeight: 800, color: 'var(--color-text)' }}>{user.name || 'Unknown Buddy'}</h1>
                            {user.isVerified || user.verify === 1 ? (
                                <span style={{ display: 'flex', alignItems: 'center', gap: '4px', background: 'rgba(16,185,129,0.15)', color: '#10b981', padding: '4px 12px', borderRadius: '999px', fontSize: '0.75rem', fontWeight: 700, border: '1px solid rgba(16,185,129,0.3)' }}>
                                    <CheckCircle2 size={14} /> Verified ID
                                </span>
                            ) : null}
                        </div>
                        <p style={{ margin: 0, color: 'var(--color-text-muted)', fontSize: '1.1rem', display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 500 }}>
                            <MapPin size={18} /> {profile.city || user.location || 'Vietnam'}
                        </p>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', minWidth: '220px', paddingBottom: '1rem' }}>
                        <button onClick={() => navigate(`/chat/${user._id}`)} style={{ width: '100%', background: 'var(--color-surface)', border: '1px solid var(--color-border)', padding: '1rem', borderRadius: '12px', color: 'var(--color-text)', fontWeight: 600, fontSize: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', cursor: 'pointer', transition: 'all 0.2s', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}
                            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'var(--color-bg-2)'; (e.currentTarget as HTMLElement).style.transform = 'translateY(-2px)' }}
                            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'var(--color-surface)'; (e.currentTarget as HTMLElement).style.transform = 'translateY(0)' }}>
                            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M7.9 20A9 9 0 1 0 4 16.1L2 22Z"/></svg> Nhắn tin ngay
                        </button>
                        <button 
                            onClick={() => {
                                const tourSection = document.getElementById('buddy-tours-section');
                                if (tourSection) {
                                    tourSection.scrollIntoView({ behavior: 'smooth' });
                                }
                            }}
                            style={{ width: '100%', background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', border: 'none', padding: '1rem', borderRadius: '12px', color: 'white', fontWeight: 700, fontSize: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', cursor: 'pointer', boxShadow: '0 8px 25px rgba(99,102,241,0.3)', transition: 'transform 0.2s' }}
                            onMouseEnter={e => (e.currentTarget as HTMLElement).style.transform = 'translateY(-2px)'}
                            onMouseLeave={e => (e.currentTarget as HTMLElement).style.transform = 'translateY(0)'}>
                            <Calendar size={18} /> Đặt lịch Buddy
                        </button>
                    </div>
                </div>

                <div className="responsive-grid" style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 2fr) minmax(0, 1fr)', gap: '2rem', alignItems: 'start' }}>
                    {/* Left Column */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                        <div style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: '24px', padding: '2rem', boxShadow: '0 4px 20px rgba(0,0,0,0.03)' }}>
                            <h3 style={{ margin: '0 0 1rem', fontSize: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--color-text)' }}>
                                <UserCheck size={20} style={{ color: '#8b5cf6' }} /> Về tôi
                            </h3>
                            <p style={{ margin: 0, color: 'var(--color-text-muted)', lineHeight: 1.7, fontSize: '1rem' }}>
                                {profile.bio || 'Xin chào! Tôi rất đam mê du lịch và khám phá những vùng đất mới. Với tư cách là một Local Buddy, tôi mong muốn mang đến cho bạn trải nghiệm chân thực nhất về văn hóa, ẩm thực và những góc phố ít người biết đến tại thành phố của tôi.'}
                            </p>
                        </div>

                        <div style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: '24px', padding: '2rem', boxShadow: '0 4px 20px rgba(0,0,0,0.03)' }}>
                            <h3 style={{ margin: '0 0 1.25rem', fontSize: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--color-text)' }}>
                                <Clock size={20} style={{ color: '#10b981' }} /> Lịch rảnh (Giờ làm việc)
                            </h3>
                            {profile.availability && profile.availability.length > 0 ? (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                                    {profile.availability.map((time: string, i: number) => (
                                        <div key={i} style={{ background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.2)', padding: '1rem', borderRadius: '12px', color: '#10b981', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                            <div style={{ width: '8px', height: '8px', background: '#10b981', borderRadius: '50%' }} />
                                            {time}
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p style={{ margin: 0, color: 'var(--color-text-faint)', fontStyle: 'italic' }}>Buddy này chưa cập nhật lịch rảnh chi tiết.</p>
                            )}
                        </div>
                    </div>

                    {/* Right Column */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                        <div style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: '24px', padding: '1.5rem', boxShadow: '0 4px 20px rgba(0,0,0,0.03)' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
                                <span style={{ color: 'var(--color-text-muted)', fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 700 }}>Đánh giá</span>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '4px', background: 'rgba(245,158,11,0.15)', color: '#f59e0b', padding: '4px 10px', borderRadius: '999px', fontSize: '1rem', fontWeight: 800 }}>
                                    <Star size={16} fill="currentColor" /> {profile.rating > 0 ? profile.rating.toFixed(1) : 'Mới'}
                                </div>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                                <span style={{ color: 'var(--color-text-muted)', fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 700 }}>Chuyến đi</span>
                                <span style={{ color: 'var(--color-text)', fontWeight: 800, fontSize: '1.2rem' }}>{profile.totalCompletedTours || 0}</span>
                            </div>
                            {/* Reliability Rate Badge - Tỷ lệ Hoàn thành Chuyến đi */}
                            {(() => {
                                const rate = profile.reliabilityRate ?? 100
                                const total = profile.totalBookingsCount || 0
                                const color = rate >= 90 ? '#10b981' : rate >= 70 ? '#f59e0b' : '#ef4444'
                                const bgColor = rate >= 90 ? 'rgba(16,185,129,0.1)' : rate >= 70 ? 'rgba(245,158,11,0.1)' : 'rgba(239,68,68,0.1)'
                                const borderColor = rate >= 90 ? 'rgba(16,185,129,0.25)' : rate >= 70 ? 'rgba(245,158,11,0.25)' : 'rgba(239,68,68,0.25)'
                                const label = rate >= 90 ? 'Xuất sắc' : rate >= 70 ? 'Trung bình' : 'Cần cải thiện'
                                return total > 0 ? (
                                    <div style={{ borderTop: '1px solid var(--color-border)', paddingTop: '1rem' }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--color-text-muted)', fontSize: '0.8rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                                                <Shield size={14} /> Tỷ lệ Hoàn thành
                                            </div>
                                            <span style={{ background: bgColor, color, border: `1px solid ${borderColor}`, padding: '2px 10px', borderRadius: '999px', fontSize: '0.8rem', fontWeight: 800 }}>
                                                {label}
                                            </span>
                                        </div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                            <div style={{ flex: 1, height: '8px', background: 'var(--color-border)', borderRadius: '999px', overflow: 'hidden' }}>
                                                <div style={{ height: '100%', width: `${rate}%`, background: color, borderRadius: '999px', transition: 'width 0.8s ease' }} />
                                            </div>
                                            <span style={{ color, fontWeight: 900, fontSize: '1.1rem', minWidth: '48px', textAlign: 'right' }}>{rate}%</span>
                                        </div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginTop: '0.5rem', color: 'var(--color-text-muted)', fontSize: '0.75rem' }}>
                                            <TrendingUp size={12} />
                                            Dựa trên {total} booking đã nhận
                                        </div>
                                    </div>
                                ) : (
                                    <div style={{ borderTop: '1px solid var(--color-border)', paddingTop: '1rem', display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--color-text-muted)', fontSize: '0.8rem' }}>
                                        <Shield size={13} /> Chưa có dữ liệu hoàn thành chuyến
                                    </div>
                                )
                            })()}
                        </div>

                        <div style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: '24px', padding: '1.5rem', boxShadow: '0 4px 20px rgba(0,0,0,0.03)' }}>
                            <h3 style={{ margin: '0 0 1rem', fontSize: '1rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--color-text-muted)', fontWeight: 700 }}>Ngôn ngữ</h3>
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                                {profile.languages && profile.languages.length > 0 ? profile.languages.map((lang: string) => (
                                    <span key={lang} style={{ background: 'var(--color-bg-2)', border: '1px solid var(--color-border)', color: 'var(--color-text)', padding: '0.5rem 1rem', borderRadius: '999px', fontSize: '0.85rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '6px' }}>
                                        <Globe2 size={14} style={{ color: '#8b5cf6' }} /> {lang}
                                    </span>
                                )) : (
                                    <span style={{ color: 'var(--color-text-faint)', fontSize: '0.9rem' }}>Chưa cập nhật</span>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Experiences Section */}
                <div id="buddy-tours-section" style={{ marginTop: '3rem', scrollMarginTop: '100px' }}>
                    <h2 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--color-text)' }}>
                        Tours trải nghiệm của {user.name}
                    </h2>
                    
                    {experiences.length === 0 ? (
                        <div style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: '24px', padding: '4rem', textAlign: 'center', color: 'var(--color-text-muted)', boxShadow: '0 4px 20px rgba(0,0,0,0.03)' }}>
                            Buddy này chưa đăng tour trải nghiệm nào.
                        </div>
                    ) : (
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.5rem' }}>
                            {experiences.map(exp => (
                                <div key={exp._id} style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: '20px', overflow: 'hidden', transition: 'all 0.3s', cursor: 'pointer', boxShadow: '0 4px 15px rgba(0,0,0,0.03)' }}
                                    onClick={() => navigate(`/experiences/${exp._id}`)}
                                    onMouseEnter={e => { (e.currentTarget as HTMLElement).style.transform = 'translateY(-5px)'; (e.currentTarget as HTMLElement).style.borderColor = '#8b5cf6'; }}
                                    onMouseLeave={e => { (e.currentTarget as HTMLElement).style.transform = 'translateY(0)'; (e.currentTarget as HTMLElement).style.borderColor = 'var(--color-border)'; }}>
                                    <div style={{ height: '180px', background: 'var(--color-bg-2)', position: 'relative' }}>
                                        <img src={exp.images?.[0] || 'https://images.unsplash.com/photo-1559508551-44bff1de756b?auto=format&fit=crop&q=80&w=800'} alt={exp.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                        <div style={{ position: 'absolute', top: '12px', right: '12px', background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)', padding: '4px 10px', borderRadius: '999px', fontSize: '0.75rem', fontWeight: 600, color: 'white', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                            <Clock size={12} /> {exp.minHours}h
                                        </div>
                                    </div>
                                    <div style={{ padding: '1.25rem' }}>
                                        <h3 style={{ margin: '0 0 0.5rem', fontSize: '1.1rem', fontWeight: 700, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden', color: 'var(--color-text)' }}>{exp.title}</h3>
                                        <p style={{ margin: '0 0 1rem', color: 'var(--color-text-muted)', fontSize: '0.85rem', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{exp.description}</p>
                                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTop: '1px solid var(--color-border)', paddingTop: '1rem' }}>
                                            <div style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', fontWeight: 500 }}>Chi phí</div>
                                            <div style={{ display: 'flex', alignItems: 'baseline', gap: '4px' }}>
                                                <span style={{ fontSize: '1.1rem', fontWeight: 800, color: '#10b981' }}>
                                                    {(exp.price || 0).toLocaleString()}
                                                </span>
                                                <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', fontWeight: 600 }}>
                                                    {exp.currency || 'VND'}/h
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                </div>

                {/* Reviews Section */}
                <div style={{ marginTop: '3rem', scrollMarginTop: '100px', marginBottom: '3rem' }}>
                    <h2 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--color-text)' }}>
                        Đánh giá từ Du khách ({reviews.length})
                    </h2>
                    
                    {reviews.length === 0 ? (
                        <div style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: '24px', padding: '4rem', textAlign: 'center', color: 'var(--color-text-muted)', boxShadow: '0 4px 20px rgba(0,0,0,0.03)' }}>
                            Buddy này chưa có đánh giá nào từ du khách.
                        </div>
                    ) : (
                        <div style={{ display: 'grid', gap: '1rem' }}>
                            {reviews.map((rev: any) => (
                                <div key={rev._id} style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: '16px', padding: '1.25rem', display: 'flex', gap: '1rem' }}>
                                    <img src={rev.reviewerId?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(rev.reviewerId?.name || 'U')}&background=random`} style={{ width: 48, height: 48, borderRadius: '50%', objectFit: 'cover' }} alt="reviewer" />
                                    <div style={{ flex: 1 }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.25rem' }}>
                                            <div style={{ fontWeight: 700, color: 'var(--color-text)' }}>{rev.reviewerId?.name || 'Du khách'}</div>
                                            <div style={{ color: 'var(--color-text-muted)', fontSize: '0.8rem' }}>{new Date(rev.created_at).toLocaleDateString('vi-VN')}</div>
                                        </div>
                                        <div style={{ color: '#f59e0b', fontSize: '0.8rem', display: 'flex', gap: '2px', marginBottom: '0.5rem' }}>
                                            {Array.from({ length: rev.rating }).map((_, i) => <Star key={i} size={14} fill="#f59e0b" color="#f59e0b" />)}
                                        </div>
                                        <div style={{ fontSize: '0.95rem', color: 'var(--color-text)', lineHeight: 1.5 }}>
                                            {rev.comment ? `"${rev.comment}"` : <span style={{ color: 'var(--color-text-muted)', fontStyle: 'italic' }}>(Không có nhận xét chi tiết)</span>}
                                        </div>
                                        {rev.experienceId && (
                                            <div style={{ fontSize: '0.8rem', color: 'var(--color-primary)', marginTop: '0.5rem', fontWeight: 600 }}>
                                                Tour: {rev.experienceId.title}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
