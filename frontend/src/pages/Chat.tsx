import { useEffect, useState } from 'react';
import axios from 'axios';
import { socket } from '../socket';
import Navbar from '../components/layout/Navbar';
import { Send, Phone, Video, MoreHorizontal, Image as ImageIcon } from 'lucide-react';
import { useRef } from 'react';
import { useParams } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';

export const Chat = () => {
    const [messages, setMessages] = useState<any[]>([]);
    const [newMessage, setNewMessage] = useState('');
    const [receiverInfo, setReceiverInfo] = useState<any>(null);
    const [isOnline, setIsOnline] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const { receiverId } = useParams();
    const { user, accessToken } = useAuthStore();
    const userId = user?._id;

    const scrollToBottom = () => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });

    useEffect(() => {
        if (!userId || !receiverId || !accessToken) return;

        // Fetch receiver info
        axios.get(`http://localhost:3000/users/${receiverId}`)
            .then(res => setReceiverInfo(res.data.result))
            .catch(console.error);

        axios.get(`http://localhost:3000/messages/user/${receiverId}`, {
            headers: { Authorization: `Bearer ${accessToken}` }
        })
            .then(res => { setMessages(res.data.data || []); setTimeout(scrollToBottom, 100); })
            .catch(console.error);

        socket.connect();
        socket.emit('register_user', userId);
        
        // Check initial online status
        socket.emit('check_online', receiverId);
        socket.on('online_status', (data) => { if (data.userId === receiverId) setIsOnline(data.isOnline); });
        socket.on('user_online', (id) => { if (id === receiverId) setIsOnline(true); });
        socket.on('user_offline', (id) => { if (id === receiverId) setIsOnline(false); });

        socket.on('receive_message', (msg) => {
            setMessages(prev => [...prev, msg]);
            setTimeout(scrollToBottom, 100);
        });
        
        return () => { 
            socket.off('receive_message'); 
            socket.off('online_status');
            socket.off('user_online');
            socket.off('user_offline');
            socket.disconnect(); 
        };
    }, [userId, receiverId, accessToken]);

    const sendMessage = () => {
        if (!newMessage.trim() || !userId || !receiverId) return;
        
        axios.post(`http://localhost:3000/messages/user/${receiverId}`, { content: newMessage }, {
            headers: { Authorization: `Bearer ${accessToken}` }
        })
            .then(res => {
                const savedMsg = res.data.data;
                socket.emit('send_message', { receiverId, message: savedMsg });
                setMessages(prev => [...prev, savedMsg]);
                setNewMessage('');
                setTimeout(scrollToBottom, 100);
            })
            .catch(console.error);
    };

    return (
        <div style={{ height: '100vh', background: 'linear-gradient(180deg, #0f0c29 0%, #0d1117 100%)', fontFamily: "'Inter', -apple-system, sans-serif", display: 'flex', flexDirection: 'column' }}>
            <Navbar />
            <div style={{ flex: 1, display: 'flex', alignItems: 'stretch', maxWidth: '900px', width: '100%', margin: '0 auto', padding: '1.5rem', gap: '0', overflow: 'hidden' }}>
                <div style={{ flex: 1, background: 'rgba(255,255,255,0.04)', backdropFilter: 'blur(20px)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '24px', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>

                    {/* Chat Header */}
                    <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid rgba(255,255,255,0.07)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0, background: 'rgba(255,255,255,0.02)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.875rem' }}>
                            <div style={{ position: 'relative' }}>
                                <div style={{ width: '44px', height: '44px', borderRadius: '50%', background: 'linear-gradient(135deg, #8b5cf6, #6366f1)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, color: 'white', fontSize: '1rem', overflow: 'hidden' }}>
                                    {receiverInfo?.avatar ? <img src={receiverInfo.avatar} alt="avatar" style={{width: '100%', height: '100%', objectFit: 'cover'}}/> : receiverInfo?.name?.substring(0, 2).toUpperCase() || 'U'}
                                </div>
                                <div style={{ position: 'absolute', bottom: 0, right: 0, width: '12px', height: '12px', background: '#10b981', borderRadius: '50%', border: '2px solid #0f0c29' }} />
                            </div>
                            <div>
                                <h3 style={{ margin: 0, fontWeight: 700, color: 'white', fontSize: '0.95rem' }}>{receiverInfo?.name || 'Loading...'}</h3>
                                <p style={{ margin: 0, color: isOnline ? '#34d399' : 'rgba(255,255,255,0.4)', fontSize: '0.75rem', fontWeight: 500 }}>
                                    {isOnline ? '● Online' : '○ Offline'}
                                </p>
                            </div>
                        </div>
                        <div style={{ display: 'flex', gap: '0.75rem' }}>
                            {[Phone, Video, MoreHorizontal].map((Icon, i) => (
                                <button key={i} style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.08)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'rgba(255,255,255,0.4)', transition: 'all 0.2s' }}
                                    onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(139,92,246,0.2)'; (e.currentTarget as HTMLElement).style.color = '#a78bfa'; }}
                                    onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.06)'; (e.currentTarget as HTMLElement).style.color = 'rgba(255,255,255,0.4)'; }}>
                                    <Icon size={17} />
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Messages */}
                    <div style={{ flex: 1, overflowY: 'auto', padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                        {messages.length === 0 && (
                            <div style={{ margin: 'auto', textAlign: 'center' }}>
                                <div style={{ fontSize: '3rem', marginBottom: '0.75rem' }}>👋</div>
                                <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: '0.875rem' }}>Gửi tin nhắn để bắt đầu cuộc trò chuyện</p>
                            </div>
                        )}
                        {messages.map((msg, idx) => {
                            const isMe = String(msg.senderId) === String(userId) || (msg.senderId?._id && String(msg.senderId._id) === String(userId));
                            
                            const messageTime = new Date(msg.created_at || Date.now()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

                            if (isMe) {
                                return (
                                    <div key={idx} style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', marginBottom: '0.5rem' }}>
                                        <div style={{
                                            maxWidth: '72%',
                                            padding: '0.6rem 1rem',
                                            borderRadius: '18px 18px 4px 18px',
                                            background: '#0084ff',
                                            color: 'white',
                                            fontSize: '0.95rem',
                                            lineHeight: 1.4,
                                            wordBreak: 'break-word',
                                        }}>
                                            {msg.content}
                                        </div>
                                        <span style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.4)', marginTop: '4px', padding: '0 4px' }}>
                                            Đã gửi lúc {messageTime}
                                        </span>
                                    </div>
                                );
                            } else {
                                return (
                                    <div key={idx} style={{ display: 'flex', alignItems: 'flex-end', gap: '0.5rem', marginBottom: '0.5rem' }}>
                                        <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: '#444', overflow: 'hidden', flexShrink: 0 }}>
                                            {receiverInfo?.avatar ? <img src={receiverInfo.avatar} alt="avatar" style={{width: '100%', height: '100%', objectFit: 'cover'}}/> : <div style={{width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: '0.7rem', fontWeight: 'bold'}}>{receiverInfo?.name?.substring(0, 2).toUpperCase() || 'U'}</div>}
                                        </div>
                                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', maxWidth: '72%' }}>
                                            <span style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.5)', marginBottom: '4px', marginLeft: '6px' }}>
                                                {receiverInfo?.name || 'User'}
                                            </span>
                                            <div style={{
                                                padding: '0.6rem 1rem',
                                                borderRadius: '18px 18px 18px 4px',
                                                background: '#3e4042',
                                                color: '#e4e6eb',
                                                fontSize: '0.95rem',
                                                lineHeight: 1.4,
                                                wordBreak: 'break-word',
                                            }}>
                                                {msg.content}
                                            </div>
                                            <span style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.3)', marginTop: '4px', marginLeft: '6px' }}>
                                                {messageTime}
                                            </span>
                                        </div>
                                    </div>
                                );
                            }
                        })}
                        <div ref={messagesEndRef} />
                    </div>

                    {/* Input */}
                    <div style={{ padding: '1rem 1.25rem', borderTop: '1px solid rgba(255,255,255,0.07)', display: 'flex', alignItems: 'center', gap: '0.75rem', flexShrink: 0 }}>
                        <button style={{ width: '38px', height: '38px', borderRadius: '10px', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.08)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'rgba(255,255,255,0.4)', flexShrink: 0 }}>
                            <ImageIcon size={17} />
                        </button>
                        <div style={{ flex: 1, background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '50px', display: 'flex', alignItems: 'center', padding: '0 0.5rem 0 1rem', transition: 'border-color 0.2s' }}>
                            <input
                                type='text'
                                value={newMessage}
                                onChange={e => setNewMessage(e.target.value)}
                                onKeyDown={e => e.key === 'Enter' && sendMessage()}
                                placeholder='Nhập tin nhắn...'
                                style={{ flex: 1, background: 'none', border: 'none', outline: 'none', color: 'white', fontSize: '0.9rem', padding: '0.75rem 0', fontFamily: 'inherit' }}
                            />
                            <button
                                onClick={sendMessage}
                                disabled={!newMessage.trim()}
                                style={{ width: '36px', height: '36px', borderRadius: '50%', background: newMessage.trim() ? 'linear-gradient(135deg, #6366f1, #8b5cf6)' : 'rgba(255,255,255,0.06)', border: 'none', cursor: newMessage.trim() ? 'pointer' : 'default', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, transition: 'all 0.2s', boxShadow: newMessage.trim() ? '0 2px 8px rgba(99,102,241,0.4)' : 'none' }}
                            >
                                <Send size={15} style={{ color: newMessage.trim() ? 'white' : 'rgba(255,255,255,0.3)', marginLeft: '2px' }} />
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
