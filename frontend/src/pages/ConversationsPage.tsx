import { useEffect, useState } from 'react';
import axiosInstance from '../api/axios';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import Navbar from '../components/layout/Navbar';
import { MessageCircle, ArrowRight } from 'lucide-react';

export const ConversationsPage = () => {
    const { user, accessToken } = useAuthStore();
    const navigate = useNavigate();
    const [conversations, setConversations] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!user || !accessToken) return;
        axiosInstance.get('/messages/conversations')
            .then(res => {
                setConversations(res.data.data || []);
                setLoading(false);
            })
            .catch(err => {
                console.error(err);
                setLoading(false);
            });
    }, [user, accessToken]);

    return (
        <div style={{ minHeight: '100vh', background: 'linear-gradient(180deg, #0f0c29 0%, #1a1040 60%, #0d1117 100%)', fontFamily: "'Inter', -apple-system, sans-serif", color: 'white' }}>
            <Navbar />
            
            <div style={{ maxWidth: '800px', margin: '0 auto', padding: '3rem 1.5rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '2rem' }}>
                    <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 8px 20px rgba(99,102,241,0.4)' }}>
                        <MessageCircle size={24} color="white" />
                    </div>
                    <div>
                        <h1 style={{ margin: 0, fontSize: '1.75rem', fontWeight: 800 }}>Tin nhắn của bạn</h1>
                        <p style={{ margin: '0.2rem 0 0', color: 'rgba(255,255,255,0.6)', fontSize: '0.9rem' }}>Quản lý các cuộc trò chuyện và kết nối với mọi người.</p>
                    </div>
                </div>

                <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '24px', overflow: 'hidden' }}>
                    {loading ? (
                        <div style={{ padding: '3rem', textAlign: 'center', color: 'rgba(255,255,255,0.5)' }}>
                            <div style={{ width: '30px', height: '30px', border: '3px solid rgba(255,255,255,0.1)', borderTopColor: '#818cf8', borderRadius: '50%', animation: 'spin 1s linear infinite', margin: '0 auto 1rem' }} />
                            Đang tải tin nhắn...
                        </div>
                    ) : conversations.length === 0 ? (
                        <div style={{ padding: '4rem 2rem', textAlign: 'center' }}>
                            <MessageCircle size={48} style={{ color: 'rgba(255,255,255,0.1)', marginBottom: '1rem' }} />
                            <h3 style={{ margin: '0 0 0.5rem', color: 'rgba(255,255,255,0.8)' }}>Chưa có tin nhắn nào</h3>
                            <p style={{ margin: 0, color: 'rgba(255,255,255,0.4)' }}>Hãy tìm một Buddy và bắt đầu trò chuyện nhé!</p>
                            <button onClick={() => navigate('/buddies')} style={{ marginTop: '1.5rem', background: 'rgba(255,255,255,0.1)', border: 'none', padding: '0.75rem 1.5rem', borderRadius: '12px', color: 'white', cursor: 'pointer', fontWeight: 600 }}>
                                Tìm Buddy ngay
                            </button>
                        </div>
                    ) : (
                        <div style={{ display: 'flex', flexDirection: 'column' }}>
                            {conversations.map((conv) => {
                                const otherUser = conv.participants.find((p: any) => p._id !== user?._id);
                                if (!otherUser) return null;

                                return (
                                    <div 
                                        key={conv._id}
                                        onClick={() => navigate(`/chat/${otherUser._id}`)}
                                        style={{ 
                                            display: 'flex', alignItems: 'center', gap: '1rem', padding: '1.25rem 1.5rem', 
                                            borderBottom: '1px solid rgba(255,255,255,0.05)', cursor: 'pointer',
                                            transition: 'background 0.2s'
                                        }}
                                        onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.05)'}
                                        onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = 'transparent'}
                                    >
                                        <div style={{ width: '56px', height: '56px', borderRadius: '50%', background: '#111', overflow: 'hidden', flexShrink: 0 }}>
                                            <img src={otherUser.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(otherUser.name || 'User')}&background=random`} alt={otherUser.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                        </div>
                                        <div style={{ flex: 1, overflow: 'hidden' }}>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                                                <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 700, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                                    {otherUser.name}
                                                </h3>
                                                <span style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.3)', whiteSpace: 'nowrap' }}>
                                                    {new Date(conv.updated_at || Date.now()).toLocaleDateString('vi-VN')}
                                                </span>
                                            </div>
                                            <p style={{ margin: 0, color: 'rgba(255,255,255,0.5)', fontSize: '0.9rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                                {conv.lastMessage || 'Chưa có tin nhắn nào'}
                                            </p>
                                        </div>
                                        <ArrowRight size={18} style={{ color: 'rgba(255,255,255,0.2)' }} />
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>
            <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
        </div>
    );
};
