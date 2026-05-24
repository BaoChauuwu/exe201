import { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import Navbar from '../components/layout/Navbar';
import { MapPin, Star, Globe2, Clock, CheckCircle2, UserCheck, Calendar, ArrowLeft } from 'lucide-react';

export const BuddyPublicProfilePage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [profile, setProfile] = useState<any>(null);
    const [experiences, setExperiences] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        Promise.all([
            axios.get(`http://localhost:3000/buddy-profile/${id}`),
            axios.get(`http://localhost:3000/experiences`)
        ])
            .then(([profileRes, expRes]) => {
                const buddyProfile = profileRes.data.data;
                setProfile(buddyProfile);
                
                const allExp = expRes.data.result || [];
                // Filter experiences belonging to this buddy
                const buddyUserId = buddyProfile.userId?._id || buddyProfile.userId;
                const buddyExp = allExp.filter((exp: any) => {
                    const expBuddyId = exp.buddyId?._id || exp.buddyId;
                    return String(expBuddyId) === String(buddyUserId);
                });
                setExperiences(buddyExp);
                
                setLoading(false);
            })
            .catch(err => {
                console.error(err);
                setLoading(false);
            });
    }, [id]);

    if (loading) {
        return (
            <div style={{ minHeight: '100vh', background: 'linear-gradient(180deg, #0f0c29 0%, #1a1040 60%, #0d1117 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white' }}>
                <div style={{ width: '40px', height: '40px', border: '3px solid rgba(255,255,255,0.1)', borderTopColor: '#818cf8', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
                <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
            </div>
        );
    }

    if (!profile) {
        return (
            <div style={{ minHeight: '100vh', background: 'linear-gradient(180deg, #0f0c29 0%, #1a1040 60%, #0d1117 100%)', color: 'white' }}>
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
        <div style={{ minHeight: '100vh', background: 'linear-gradient(180deg, #0f0c29 0%, #0d1117 100%)', fontFamily: "'Inter', -apple-system, sans-serif", color: 'white', paddingBottom: '5rem' }}>
            <Navbar />
            
            {/* Header Banner */}
            <div style={{ height: '280px', background: 'linear-gradient(135deg, #1e1b4b, #4c1d95, #000000)', position: 'relative', overflow: 'hidden' }}>
                <div style={{ position: 'absolute', inset: 0, backgroundImage: 'url("https://images.unsplash.com/photo-1506929562872-bb421503ef21?q=80&w=2000&auto=format&fit=crop")', backgroundSize: 'cover', backgroundPosition: 'center', opacity: 0.15 }} />
                <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: '100px', background: 'linear-gradient(to top, #0d1117, transparent)' }} />
            </div>

            <div style={{ maxWidth: '1000px', margin: '-100px auto 0', padding: '0 1.5rem', position: 'relative', zIndex: 10 }}>
                <button onClick={() => navigate('/buddies')} style={{ background: 'rgba(0,0,0,0.5)', border: '1px solid rgba(255,255,255,0.1)', color: 'white', padding: '0.5rem 1rem', borderRadius: '999px', display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', marginBottom: '1.5rem', backdropFilter: 'blur(10px)', transition: 'background 0.2s' }}
                    onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.1)'}
                    onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = 'rgba(0,0,0,0.5)'}>
                    <ArrowLeft size={16} /> Danh sách Buddy
                </button>

                <div style={{ display: 'flex', gap: '2rem', alignItems: 'flex-end', marginBottom: '2.5rem', flexWrap: 'wrap' }}>
                    <div style={{ width: '160px', height: '160px', borderRadius: '50%', background: 'linear-gradient(135deg, #6366f1, #a855f7)', padding: '5px', flexShrink: 0, boxShadow: '0 15px 35px rgba(0,0,0,0.5)' }}>
                        <div style={{ width: '100%', height: '100%', background: '#111', borderRadius: '50%', overflow: 'hidden' }}>
                            <img src={user.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name || 'B')}&background=random&size=300`} alt={user.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        </div>
                    </div>
                    <div style={{ paddingBottom: '1rem', flex: 1 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '0.5rem', flexWrap: 'wrap' }}>
                            <h1 style={{ margin: 0, fontSize: '2.5rem', fontWeight: 800 }}>{user.name || 'Unknown Buddy'}</h1>
                            {user.isVerified || user.verify === 1 ? (
                                <span style={{ display: 'flex', alignItems: 'center', gap: '4px', background: 'rgba(16,185,129,0.15)', color: '#34d399', padding: '4px 12px', borderRadius: '999px', fontSize: '0.75rem', fontWeight: 700, border: '1px solid rgba(16,185,129,0.3)' }}>
                                    <CheckCircle2 size={14} /> Verified ID
                                </span>
                            ) : null}
                        </div>
                        <p style={{ margin: 0, color: 'rgba(255,255,255,0.6)', fontSize: '1.1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <MapPin size={18} /> {profile.city || user.location || 'Vietnam'}
                        </p>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', minWidth: '220px', paddingBottom: '1rem' }}>
                        <button onClick={() => navigate(`/chat/${user._id}`)} style={{ width: '100%', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', padding: '1rem', borderRadius: '12px', color: 'white', fontWeight: 600, fontSize: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', cursor: 'pointer', transition: 'all 0.2s' }}
                            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.1)'; (e.currentTarget as HTMLElement).style.transform = 'translateY(-2px)' }}
                            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.05)'; (e.currentTarget as HTMLElement).style.transform = 'translateY(0)' }}>
                            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M7.9 20A9 9 0 1 0 4 16.1L2 22Z"/></svg> Nhắn tin ngay
                        </button>
                        <button style={{ width: '100%', background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', border: 'none', padding: '1rem', borderRadius: '12px', color: 'white', fontWeight: 700, fontSize: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', cursor: 'pointer', boxShadow: '0 8px 25px rgba(99,102,241,0.4)', transition: 'transform 0.2s' }}
                            onMouseEnter={e => (e.currentTarget as HTMLElement).style.transform = 'translateY(-2px)'}
                            onMouseLeave={e => (e.currentTarget as HTMLElement).style.transform = 'translateY(0)'}>
                            <Calendar size={18} /> Đặt lịch Buddy
                        </button>
                    </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 2fr) minmax(0, 1fr)', gap: '2rem', alignItems: 'start' }}>
                    {/* Left Column */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                        <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '24px', padding: '2rem' }}>
                            <h3 style={{ margin: '0 0 1rem', fontSize: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <UserCheck size={20} style={{ color: '#a78bfa' }} /> Về tôi
                            </h3>
                            <p style={{ margin: 0, color: 'rgba(255,255,255,0.7)', lineHeight: 1.7, fontSize: '1rem' }}>
                                {profile.bio || 'Xin chào! Tôi rất đam mê du lịch và khám phá những vùng đất mới. Với tư cách là một Local Buddy, tôi mong muốn mang đến cho bạn trải nghiệm chân thực nhất về văn hóa, ẩm thực và những góc phố ít người biết đến tại thành phố của tôi.'}
                            </p>
                        </div>

                        <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '24px', padding: '2rem' }}>
                            <h3 style={{ margin: '0 0 1.25rem', fontSize: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <Clock size={20} style={{ color: '#34d399' }} /> Lịch rảnh (Giờ làm việc)
                            </h3>
                            {profile.availability && profile.availability.length > 0 ? (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                                    {profile.availability.map((time: string, i: number) => (
                                        <div key={i} style={{ background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.2)', padding: '1rem', borderRadius: '12px', color: '#6ee7b7', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                            <div style={{ width: '8px', height: '8px', background: '#10b981', borderRadius: '50%' }} />
                                            {time}
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p style={{ margin: 0, color: 'rgba(255,255,255,0.4)', fontStyle: 'italic' }}>Buddy này chưa cập nhật lịch rảnh chi tiết.</p>
                            )}
                        </div>
                    </div>

                    {/* Right Column */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                        <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '24px', padding: '1.5rem' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
                                <span style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 700 }}>Đánh giá</span>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '4px', background: 'rgba(245,158,11,0.15)', color: '#fbbf24', padding: '4px 10px', borderRadius: '999px', fontSize: '1rem', fontWeight: 800 }}>
                                    <Star size={16} fill="currentColor" /> {profile.rating > 0 ? profile.rating.toFixed(1) : 'Mới'}
                                </div>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <span style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 700 }}>Chuyến đi</span>
                                <span style={{ color: 'white', fontWeight: 700, fontSize: '1.1rem' }}>{profile.totalCompletedTours || 0}</span>
                            </div>
                        </div>

                        <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '24px', padding: '1.5rem' }}>
                            <h3 style={{ margin: '0 0 1rem', fontSize: '1rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'rgba(255,255,255,0.5)', fontWeight: 700 }}>Ngôn ngữ</h3>
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                                {profile.languages && profile.languages.length > 0 ? profile.languages.map((lang: string) => (
                                    <span key={lang} style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.1)', padding: '0.5rem 1rem', borderRadius: '999px', fontSize: '0.85rem', fontWeight: 500, display: 'flex', alignItems: 'center', gap: '6px' }}>
                                        <Globe2 size={14} style={{ color: '#a78bfa' }} /> {lang}
                                    </span>
                                )) : (
                                    <span style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.9rem' }}>Chưa cập nhật</span>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Experiences Section */}
                <div style={{ marginTop: '3rem' }}>
                    <h2 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        Tours trải nghiệm của {user.name}
                    </h2>
                    
                    {experiences.length === 0 ? (
                        <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '24px', padding: '3rem', textAlign: 'center', color: 'rgba(255,255,255,0.5)' }}>
                            Buddy này chưa đăng tour trải nghiệm nào.
                        </div>
                    ) : (
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.5rem' }}>
                            {experiences.map(exp => (
                                <div key={exp._id} style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '20px', overflow: 'hidden', transition: 'all 0.3s', cursor: 'pointer' }}
                                    onClick={() => navigate(`/experiences/${exp._id}`)}
                                    onMouseEnter={e => { (e.currentTarget as HTMLElement).style.transform = 'translateY(-5px)'; (e.currentTarget as HTMLElement).style.borderColor = 'rgba(99,102,241,0.4)'; }}
                                    onMouseLeave={e => { (e.currentTarget as HTMLElement).style.transform = 'translateY(0)'; (e.currentTarget as HTMLElement).style.borderColor = 'rgba(255,255,255,0.08)'; }}>
                                    <div style={{ height: '180px', background: 'rgba(0,0,0,0.2)', position: 'relative' }}>
                                        <img src={exp.images?.[0] || 'https://images.unsplash.com/photo-1559508551-44bff1de756b?auto=format&fit=crop&q=80&w=800'} alt={exp.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                        <div style={{ position: 'absolute', top: '12px', right: '12px', background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)', padding: '4px 10px', borderRadius: '999px', fontSize: '0.75rem', fontWeight: 600, color: 'white', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                            <Clock size={12} /> {exp.minHours}h
                                        </div>
                                    </div>
                                    <div style={{ padding: '1.25rem' }}>
                                        <h3 style={{ margin: '0 0 0.5rem', fontSize: '1.1rem', fontWeight: 700, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{exp.title}</h3>
                                        <p style={{ margin: '0 0 1rem', color: 'rgba(255,255,255,0.6)', fontSize: '0.85rem', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{exp.description}</p>
                                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: '1rem' }}>
                                            <div style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.5)' }}>Chi phí</div>
                                            <div style={{ display: 'flex', alignItems: 'baseline', gap: '4px' }}>
                                                <span style={{ fontSize: '1.1rem', fontWeight: 800, color: '#34d399' }}>
                                                    {(exp.price || 0).toLocaleString()}
                                                </span>
                                                <span style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.5)', fontWeight: 600 }}>
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
            </div>
        </div>
    );
};
