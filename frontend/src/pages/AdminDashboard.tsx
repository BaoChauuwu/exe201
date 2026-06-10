import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Navbar from '../components/layout/Navbar';
import { useAuthStore } from '../store/authStore';
import { ShieldCheck, DollarSign, UserCheck, Search, Check, X, FileText, Activity, Users, Trash2, Map, BarChart2 } from 'lucide-react';
import { experienceApi } from '../api/experience.api';
import { socket } from '../socket';
import { toast as hotToast } from 'react-hot-toast';
// Tạm thời bỏ Recharts do lỗi tương thích React 19: 
// import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend, ResponsiveContainer } from 'recharts';

export const AdminDashboard = () => {
    const [ekycs, setEkycs] = useState<any[]>([]);
    const [payouts, setPayouts] = useState<any[]>([]);
    const [users, setUsers] = useState<any[]>([]);
    const [experiences, setExperiences] = useState<any[]>([]);
    const [activeTab, setActiveTab] = useState<'overview' | 'ekyc' | 'payouts' | 'users' | 'tours'>('overview');
    const [searchQuery, setSearchQuery] = useState('');
    
    const [roleFilter, setRoleFilter] = useState('all');
    const [toast, setToast] = useState('');
    const [previewImage, setPreviewImage] = useState<string | null>(null);

    const { accessToken } = useAuthStore();
    const cfg = { headers: { Authorization: `Bearer ${accessToken}` } };

    const fetchAll = () => {
        axios.get((import.meta.env.VITE_API_URL || 'http://localhost:3000') + '/admin/ekyc/pending', cfg).then(r => setEkycs(r.data.data || [])).catch(console.error);
        axios.get((import.meta.env.VITE_API_URL || 'http://localhost:3000') + '/admin/payouts/pending', cfg).then(r => setPayouts(r.data.data || [])).catch(console.error);
        axios.get((import.meta.env.VITE_API_URL || 'http://localhost:3000') + '/admin/users', cfg).then(r => setUsers(r.data.data || [])).catch(console.error);
        experienceApi.getPending(cfg).then(r => setExperiences(r.data.data || [])).catch(console.error);
    };

    useEffect(() => { 
        fetchAll(); 
        
        // Connect socket for Admin SOS Alerts
        if (!socket.connected) {
            socket.connect();
        }
        socket.emit('join_admin');

        const playSiren = () => {
            try {
                const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
                const oscillator = audioCtx.createOscillator();
                const gainNode = audioCtx.createGain();

                oscillator.connect(gainNode);
                gainNode.connect(audioCtx.destination);

                oscillator.type = 'sine'; 

                const now = audioCtx.currentTime;
                const duration = 6; 
                
                // Siren frequency modulation (wii-uu-wii-uu)
                for (let i = 0; i < duration * 2; i++) {
                    oscillator.frequency.setValueAtTime(700, now + i * 0.5); 
                    oscillator.frequency.linearRampToValueAtTime(1000, now + i * 0.5 + 0.25);
                    oscillator.frequency.linearRampToValueAtTime(700, now + i * 0.5 + 0.5);
                }

                gainNode.gain.setValueAtTime(0, now);
                gainNode.gain.linearRampToValueAtTime(0.5, now + 0.1);
                gainNode.gain.setValueAtTime(0.5, now + duration - 0.5);
                gainNode.gain.linearRampToValueAtTime(0, now + duration);

                oscillator.start(now);
                oscillator.stop(now + duration);
            } catch (err) {
                console.error('Audio playback failed', err);
            }
        };

        const handleSos = (data: any) => {
            console.log('Admin received SOS:', data);
            playSiren(); // Play the siren sound!
            
            hotToast.error(
                <div>
                    <strong>🚨 BÁO ĐỘNG SOS 🚨</strong><br/>
                    User: {data.name} ({data.role})<br/>
                    ID: {data.userId}<br/>
                    Thời gian: {new Date(data.time).toLocaleTimeString()}<br/>
                    <em>Hãy liên hệ ngay lập tức!</em>
                </div>, 
                { duration: 15000, position: 'top-center' }
            );
        };

        socket.on('receive_sos', handleSos);

        return () => {
            socket.off('receive_sos', handleSos);
        };
    }, []);

    const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(''), 3000); };

    const approveEkyc = async (id: string, status: string) => {
        await axios.post((import.meta.env.VITE_API_URL || 'http://localhost:3000') + '/admin/ekyc/approve', { ekycId: id, status }, cfg).catch(console.error);
        showToast(`eKYC ${status} thành công!`);
        fetchAll();
    };

    const approvePayout = async (id: string, status: string) => {
        await axios.post((import.meta.env.VITE_API_URL || 'http://localhost:3000') + '/admin/payouts/approve', { payoutId: id, status }, cfg).catch(console.error);
        showToast(`Payout ${status} thành công!`);
        fetchAll();
    };

    const approveTour = async (id: string, status: 'approved' | 'rejected') => {
        try {
            await experienceApi.approveExperience(id, status, cfg);
            showToast(`Tour đã được ${status === 'approved' ? 'duyệt' : 'từ chối'} thành công!`);
            fetchAll();
        } catch (error) {
            console.error(error);
            showToast('Lỗi khi duyệt tour');
        }
    };

    const deleteUser = async (id: string) => {
        if (!window.confirm('Bạn có chắc chắn muốn xóa user này không? Hành động này không thể hoàn tác!')) return;
        try {
            await axios.delete(`${import.meta.env.VITE_API_URL || 'http://localhost:3000'}/admin/users/${id}`, cfg);
            showToast('Đã xóa user thành công!');
            fetchAll();
        } catch (error) {
            console.error(error);
            showToast('Lỗi khi xóa user');
        }
    };

    const tabBtn = (active: boolean, color: string): React.CSSProperties => ({
        flex: 1, padding: '0.7rem 1.5rem', borderRadius: '10px', fontWeight: 700, fontSize: '0.875rem',
        cursor: 'pointer', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
        transition: 'all 0.2s', fontFamily: 'inherit',
        background: active ? `linear-gradient(135deg, ${color}, ${color}cc)` : 'white',
        color: active ? 'white' : 'var(--color-text-muted)',
        boxShadow: active ? `0 4px 15px ${color}40` : 'var(--shadow-sm)',
    });

    const badgeStyle = (color: string): React.CSSProperties => ({
        background: `${color}20`, border: `1px solid ${color}50`, color, borderRadius: '999px',
        padding: '2px 10px', fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em',
    });

    const actionBtn = (color: string): React.CSSProperties => ({
        width: '34px', height: '34px', borderRadius: '10px', background: `${color}18`, border: `1px solid ${color}30`,
        cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color,
        transition: 'all 0.2s', flexShrink: 0,
    });

    return (
        <div style={{ minHeight: '100vh', background: 'var(--gradient-hero)', fontFamily: "'Inter', -apple-system, sans-serif", color: 'var(--color-text)' }}>
            <Navbar />

            {/* Toast */}
            {toast && (
                <div style={{ position: 'fixed', top: '5rem', right: '1.5rem', background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: '12px', padding: '0.875rem 1.25rem', color: 'var(--color-text)', fontWeight: 600, fontSize: '0.875rem', zIndex: 1000, display: 'flex', alignItems: 'center', gap: '0.5rem', boxShadow: 'var(--shadow-lg)' }}>
                    <Activity size={16} style={{ color: 'var(--color-primary)' }} /> {toast}
                </div>
            )}

            <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '2.5rem 1.5rem' }}>

                {/* Header */}
                <div style={{ marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: '1rem' }}>
                    <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.35rem' }}>
                            <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'rgba(99,102,241,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <ShieldCheck size={20} style={{ color: '#818cf8' }} />
                            </div>
                            <h1 style={{ margin: 0, fontSize: '1.75rem', fontWeight: 800, letterSpacing: '-0.025em' }}>Admin Portal</h1>
                        </div>
                        <p style={{ margin: 0, color: 'var(--color-text-muted)', fontSize: '0.875rem' }}>Quản lý xác minh danh tính và giao dịch tài chính</p>
                    </div>

                    {/* Tabs */}
                    <div style={{ display: 'flex', background: 'var(--color-bg-2)', border: '1px solid var(--color-border)', borderRadius: '14px', padding: '4px', gap: '4px', minWidth: '400px', boxShadow: 'var(--shadow-sm)', overflowX: 'auto' }}>
                        <button onClick={() => setActiveTab('overview')} style={tabBtn(activeTab === 'overview', '#f59e0b')}>
                            <BarChart2 size={16} /> Overview
                        </button>
                        <button onClick={() => setActiveTab('ekyc')} style={tabBtn(activeTab === 'ekyc', '#6366f1')}>
                            <UserCheck size={16} /> eKYC
                            <span style={{ background: 'rgba(0,0,0,0.25)', borderRadius: '999px', padding: '1px 8px', fontSize: '0.7rem' }}>{ekycs.length}</span>
                        </button>
                        <button onClick={() => setActiveTab('payouts')} style={tabBtn(activeTab === 'payouts', '#10b981')}>
                            <DollarSign size={16} /> Payouts
                            <span style={{ background: 'rgba(0,0,0,0.25)', borderRadius: '999px', padding: '1px 8px', fontSize: '0.7rem' }}>{payouts.length}</span>
                        </button>
                        <button onClick={() => setActiveTab('users')} style={tabBtn(activeTab === 'users', '#3b82f6')}>
                            <Users size={16} /> Users
                            <span style={{ background: 'rgba(0,0,0,0.25)', borderRadius: '999px', padding: '1px 8px', fontSize: '0.7rem' }}>{users.length}</span>
                        </button>
                        <button onClick={() => setActiveTab('tours')} style={tabBtn(activeTab === 'tours', '#8b5cf6')}>
                            <Map size={16} /> Tours
                            <span style={{ background: 'rgba(0,0,0,0.25)', borderRadius: '999px', padding: '1px 8px', fontSize: '0.7rem' }}>{experiences.length}</span>
                        </button>
                    </div>
                </div>

                {/* Content card */}
                <div style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: '24px', overflow: 'hidden', minHeight: '400px', boxShadow: 'var(--shadow-md)' }}>

                    {/* Search bar */}
                    {activeTab !== 'overview' && (
                    <div style={{ padding: '1.25rem 1.75rem', borderBottom: '1px solid var(--color-border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem', flexWrap: 'wrap' }}>
                        <h2 style={{ margin: 0, fontSize: '1rem', fontWeight: 700, color: 'var(--color-primary-dark)' }}>
                            {activeTab === 'ekyc' ? 'Pending Verifications' : activeTab === 'payouts' ? 'Pending Payouts' : activeTab === 'tours' ? 'Pending Tours' : 'User Management'}
                        </h2>
                        
                        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                            {activeTab === 'users' && (
                                <select value={roleFilter} onChange={e => setRoleFilter(e.target.value)} style={{ background: 'var(--color-bg-2)', border: '1px solid var(--color-border)', borderRadius: '10px', padding: '0.5rem 1rem', color: 'var(--color-text)', fontSize: '0.8rem', outline: 'none', fontFamily: 'inherit', cursor: 'pointer' }}>
                                    <option value="all">Tất cả</option>
                                    <option value="tourist">Tourist</option>
                                    <option value="buddy">Buddy</option>
                                    <option value="admin">Admin</option>
                                </select>
                            )}
                            <div style={{ position: 'relative' }}>
                                <Search size={15} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-faint)' }} />
                                <input type='text' value={searchQuery} onChange={e => setSearchQuery(e.target.value)} placeholder='Search...' style={{ background: 'var(--color-bg-2)', border: '1px solid var(--color-border)', borderRadius: '10px', padding: '0.5rem 0.875rem 0.5rem 2.25rem', color: 'var(--color-text)', fontSize: '0.8rem', outline: 'none', width: '200px', fontFamily: 'inherit' }} />
                            </div>
                        </div>
                    </div>
                    )}

                    {/* Overview Tab */}
                    {activeTab === 'overview' && (
                        <div style={{ padding: '2rem' }}>
                            <h2 style={{ margin: '0 0 1.5rem', fontSize: '1.2rem', fontWeight: 800, color: 'var(--color-primary-dark)' }}>System Analytics (Mock)</h2>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '2rem' }}>
                                
                                {/* Revenue Line Chart */}
                                <div style={{ background: 'var(--color-bg-2)', padding: '1.5rem', borderRadius: '16px', border: '1px solid var(--color-border)' }}>
                                    <h3 style={{ margin: '0 0 1rem', fontSize: '1rem', color: 'var(--color-text)' }}>Revenue vs New Users</h3>
                                    <div style={{ height: 300, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--color-bg)', borderRadius: '12px', color: 'var(--color-text-muted)' }}>
                                        <p>[Biểu đồ doanh thu đang bảo trì nâng cấp lên v2]</p>
                                    </div>
                                </div>

                                {/* Role Distribution Bar Chart */}
                                <div style={{ background: 'var(--color-bg-2)', padding: '1.5rem', borderRadius: '16px', border: '1px solid var(--color-border)' }}>
                                    <h3 style={{ margin: '0 0 1rem', fontSize: '1rem', color: 'var(--color-text)' }}>User Role Distribution</h3>
                                    <div style={{ height: 300, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--color-bg)', borderRadius: '12px', color: 'var(--color-text-muted)' }}>
                                        <p>[Biểu đồ phân bổ người dùng đang bảo trì nâng cấp lên v2]</p>
                                    </div>
                                </div>

                            </div>
                        </div>
                    )}

                    {/* eKYC tab */}
                    {activeTab === 'ekyc' && (
                        ekycs.length === 0 ? (
                            <div style={{ padding: '5rem', textAlign: 'center', color: 'var(--color-text-muted)' }}>
                                <ShieldCheck size={48} style={{ marginBottom: '1rem', opacity: 0.3, color: 'var(--color-primary)' }} />
                                <p>Không có yêu cầu eKYC nào đang chờ duyệt</p>
                            </div>
                        ) : (
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(380px, 1fr))', gap: '1.25rem', padding: '1.5rem' }}>
                                {ekycs.map(ekyc => (
                                    <div key={ekyc._id} style={{ background: 'white', border: '1px solid var(--color-border)', borderRadius: '18px', padding: '1.5rem', transition: 'all 0.2s', boxShadow: 'var(--shadow-sm)' }}
                                        onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = 'var(--color-primary)'; (e.currentTarget as HTMLElement).style.boxShadow = 'var(--shadow-md)'; }}
                                        onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = 'var(--color-border)'; (e.currentTarget as HTMLElement).style.boxShadow = 'var(--shadow-sm)'; }}
                                    >
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                                            <div>
                                                <p style={{ color: 'var(--color-text-muted)', fontSize: '0.7rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', margin: '0 0 0.35rem' }}>User ID</p>
                                                <code style={{ color: 'var(--color-primary-dark)', fontSize: '0.75rem', background: 'var(--color-bg)', padding: '2px 8px', borderRadius: '6px', border: '1px solid var(--color-border)' }}>{ekyc.userId}</code>
                                            </div>
                                            <span style={badgeStyle('#f59e0b')}>Reviewing</span>
                                        </div>

                                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.5rem', marginBottom: '1.25rem' }}>
                                            {[['Front ID', ekyc.docFrontUrl], ['Back ID', ekyc.docBackUrl], ['Selfie', ekyc.selfieUrl]].map(([label, url]) => (
                                                <button key={label} onClick={() => setPreviewImage(url)} type='button' style={{ background: 'var(--color-bg)', border: '1px solid var(--color-border)', borderRadius: '10px', padding: '0.75rem 0.5rem', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.4rem', transition: 'all 0.2s', cursor: 'pointer' }}
                                                    onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'var(--color-surface-hover)'; (e.currentTarget as HTMLElement).style.borderColor = 'var(--color-primary)'; }}
                                                    onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'var(--color-bg)'; (e.currentTarget as HTMLElement).style.borderColor = 'var(--color-border)'; }}
                                                >
                                                    <FileText size={18} style={{ color: 'var(--color-primary)' }} />
                                                    <span style={{ color: 'var(--color-text-muted)', fontSize: '0.65rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em' }}>{label}</span>
                                                </button>
                                            ))}
                                        </div>

                                        <div style={{ display: 'flex', gap: '0.75rem' }}>
                                            <button onClick={() => approveEkyc(ekyc._id, 'approved')} style={{ flex: 1, background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.2)', borderRadius: '10px', padding: '0.7rem', color: '#059669', fontWeight: 600, fontSize: '0.875rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem', fontFamily: 'inherit', transition: 'all 0.2s' }}
                                                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(16,185,129,0.2)'; }}
                                                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(16,185,129,0.1)'; }}>
                                                <Check size={15} /> Approve
                                            </button>
                                            <button onClick={() => approveEkyc(ekyc._id, 'rejected')} style={{ flex: 1, background: 'rgba(239,68,68,0.05)', border: '1px solid rgba(239,68,68,0.1)', borderRadius: '10px', padding: '0.7rem', color: '#dc2626', fontWeight: 600, fontSize: '0.875rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem', fontFamily: 'inherit', transition: 'all 0.2s' }}
                                                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(239,68,68,0.15)'; (e.currentTarget as HTMLElement).style.borderColor = 'rgba(239,68,68,0.3)'; }}
                                                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(239,68,68,0.05)'; (e.currentTarget as HTMLElement).style.borderColor = 'rgba(239,68,68,0.1)'; }}>
                                                <X size={15} /> Reject
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )
                    )}

                    {/* Payouts tab */}
                    {activeTab === 'payouts' && (
                        payouts.length === 0 ? (
                            <div style={{ padding: '5rem', textAlign: 'center', color: 'var(--color-text-muted)' }}>
                                <DollarSign size={48} style={{ marginBottom: '1rem', opacity: 0.3, color: 'var(--color-primary)' }} />
                                <p>Không có yêu cầu rút tiền nào đang chờ xử lý</p>
                            </div>
                        ) : (
                            <div>
                                {payouts.map(payout => (
                                    <div key={payout._id} style={{ padding: '1.25rem 1.75rem', borderBottom: '1px solid var(--color-border)', display: 'flex', alignItems: 'center', gap: '1.25rem', transition: 'background 0.15s' }}
                                        onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = 'var(--color-surface-hover)'}
                                        onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = 'transparent'}
                                    >
                                        <div style={{ flex: 1 }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.35rem' }}>
                                                <span style={{ color: 'var(--color-text)', fontWeight: 800, fontSize: '1.1rem' }}>{payout.amount.toLocaleString()} ₫</span>
                                                <span style={badgeStyle('#f59e0b')}>Pending</span>
                                            </div>
                                            <p style={{ margin: 0, color: 'var(--color-text-muted)', fontSize: '0.8rem' }}>
                                                Buddy: <code style={{ color: 'var(--color-primary-dark)' }}>{payout.buddyId}</code>
                                            </p>
                                            {payout.payoutMethod && (
                                                <p style={{ margin: '0.2rem 0 0', color: 'var(--color-text-faint)', fontSize: '0.75rem' }}>
                                                    {payout.payoutMethod.bankCode} · {payout.payoutMethod.accountNumber} · {payout.payoutMethod.accountName}
                                                </p>
                                            )}
                                        </div>
                                        <div style={{ display: 'flex', gap: '0.5rem', flexShrink: 0 }}>
                                            <button onClick={() => approvePayout(payout._id, 'approved')} style={actionBtn('#10b981')}
                                                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(16,185,129,0.3)'; }}
                                                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(16,185,129,0.1)'; }}>
                                                <Check size={16} />
                                            </button>
                                            <button onClick={() => approvePayout(payout._id, 'rejected')} style={actionBtn('#ef4444')}
                                                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(239,68,68,0.3)'; }}
                                                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(239,68,68,0.1)'; }}>
                                                <X size={16} />
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )
                    )}

                    {/* Users tab */}
                    {activeTab === 'users' && (() => {
                        const filteredUsers = users.filter(u => {
                            if (roleFilter !== 'all' && (u.role || '').toLowerCase() !== roleFilter.toLowerCase()) return false;
                            
                            if (searchQuery) {
                                const q = searchQuery.toLowerCase();
                                const nameStr = (u.name || '').toLowerCase();
                                const emailStr = (u.email || '').toLowerCase();
                                if (!nameStr.includes(q) && !emailStr.includes(q)) return false;
                            }
                            return true;
                        });

                        return filteredUsers.length === 0 ? (
                            <div style={{ padding: '5rem', textAlign: 'center', color: 'var(--color-text-muted)' }}>
                                <Users size={48} style={{ marginBottom: '1rem', opacity: 0.3, color: 'var(--color-primary)' }} />
                                <p>Không tìm thấy user nào</p>
                            </div>
                        ) : (
                            <div>
                                {filteredUsers.map(user => (
                                    <div key={user._id} style={{ padding: '1.25rem 1.75rem', borderBottom: '1px solid var(--color-border)', display: 'flex', alignItems: 'center', gap: '1.25rem', transition: 'background 0.15s' }}
                                        onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = 'var(--color-surface-hover)'}
                                        onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = 'transparent'}
                                    >
                                        <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                            <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'var(--color-border)', overflow: 'hidden' }}>
                                                <img src={user.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name || 'U')}`} alt={user.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                            </div>
                                            <div>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.2rem' }}>
                                                    <span style={{ color: 'var(--color-text)', fontWeight: 700, fontSize: '0.95rem' }}>{user.name}</span>
                                                    <span style={badgeStyle(user.role === 'admin' ? '#ef4444' : user.role === 'buddy' ? '#a855f7' : '#3b82f6')}>{user.role || 'tourist'}</span>
                                                    {(user.verify === 1 || user.isVerified) && <span style={badgeStyle('#10b981')}>Verified</span>}
                                                </div>
                                                <p style={{ margin: 0, color: 'var(--color-text-muted)', fontSize: '0.8rem' }}>{user.email}</p>
                                            </div>
                                        </div>
                                        <div style={{ display: 'flex', gap: '0.5rem', flexShrink: 0 }}>
                                            {user.role !== 'admin' && (
                                                <button onClick={() => deleteUser(user._id)} style={actionBtn('#ef4444')} title="Xóa người dùng"
                                                    onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(239,68,68,0.3)'; }}
                                                    onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(239,68,68,0.1)'; }}>
                                                    <Trash2 size={16} />
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        );
                    })()}

                    {/* Tours tab */}
                    {activeTab === 'tours' && (
                        experiences.length === 0 ? (
                            <div style={{ padding: '5rem', textAlign: 'center', color: 'var(--color-text-muted)' }}>
                                <Map size={48} style={{ marginBottom: '1rem', opacity: 0.3, color: 'var(--color-primary)' }} />
                                <p>Không có yêu cầu duyệt tour nào đang chờ xử lý</p>
                            </div>
                        ) : (
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '1.25rem', padding: '1.5rem' }}>
                                {experiences.map(exp => (
                                    <div key={exp._id} style={{ background: 'white', border: '1px solid var(--color-border)', borderRadius: '18px', padding: '1.25rem', transition: 'all 0.2s', boxShadow: 'var(--shadow-sm)', display: 'flex', flexDirection: 'column' }}
                                        onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = 'var(--color-primary)'; (e.currentTarget as HTMLElement).style.boxShadow = 'var(--shadow-md)'; }}
                                        onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = 'var(--color-border)'; (e.currentTarget as HTMLElement).style.boxShadow = 'var(--shadow-sm)'; }}
                                    >
                                        <div style={{ height: '140px', width: '100%', borderRadius: '10px', overflow: 'hidden', background: '#f3f4f6', marginBottom: '1rem', position: 'relative' }}>
                                            {exp.images && exp.images.length > 0 ? (
                                                <img src={exp.images[0]} alt={exp.title} style={{ width: '100%', height: '100%', objectFit: 'cover', cursor: 'pointer' }} onClick={() => setPreviewImage(exp.images[0])} />
                                            ) : (
                                                <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-text-muted)', fontSize: '0.8rem' }}>🗺️ Không có ảnh</div>
                                            )}
                                        </div>
                                        <div style={{ flex: 1 }}>
                                            <div style={{ display: 'flex', gap: '6px', marginBottom: '0.5rem' }}>
                                                <span style={badgeStyle('#8b5cf6')}>{exp.category}</span>
                                                <span style={badgeStyle('#3b82f6')}>{exp.city || 'Đà Nẵng'}</span>
                                            </div>
                                            <h3 style={{ margin: '0 0 0.5rem', fontSize: '1rem', fontWeight: 800, color: 'var(--color-text)' }}>{exp.title}</h3>
                                            <p style={{ margin: '0 0 1rem', color: 'var(--color-text-muted)', fontSize: '0.8rem', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden', lineHeight: 1.4 }}>{exp.description}</p>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', padding: '0.5rem 0', borderTop: '1px solid var(--color-border)' }}>
                                                <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>Mức giá:</span>
                                                <span style={{ fontWeight: 800, color: 'var(--color-primary-dark)', fontSize: '1rem' }}>{exp.price?.toLocaleString()} {exp.currency || 'VND'}/h</span>
                                            </div>
                                        </div>
                                        <div style={{ display: 'flex', gap: '0.75rem' }}>
                                            <button onClick={() => approveTour(exp._id, 'approved')} style={{ flex: 1, background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.2)', borderRadius: '10px', padding: '0.6rem', color: '#059669', fontWeight: 600, fontSize: '0.8rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem', fontFamily: 'inherit', transition: 'all 0.2s' }}
                                                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(16,185,129,0.2)'; }}
                                                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(16,185,129,0.1)'; }}>
                                                <Check size={14} /> Duyệt
                                            </button>
                                            <button onClick={() => approveTour(exp._id, 'rejected')} style={{ flex: 1, background: 'rgba(239,68,68,0.05)', border: '1px solid rgba(239,68,68,0.1)', borderRadius: '10px', padding: '0.6rem', color: '#dc2626', fontWeight: 600, fontSize: '0.8rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem', fontFamily: 'inherit', transition: 'all 0.2s' }}
                                                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(239,68,68,0.15)'; (e.currentTarget as HTMLElement).style.borderColor = 'rgba(239,68,68,0.3)'; }}
                                                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(239,68,68,0.05)'; (e.currentTarget as HTMLElement).style.borderColor = 'rgba(239,68,68,0.1)'; }}>
                                                <X size={14} /> Từ chối
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )
                    )}
                </div>
            </div>

            {/* Image Preview Modal */}
            {previewImage && (
                <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(5px)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem' }} onClick={() => setPreviewImage(null)}>
                    <div style={{ position: 'relative', maxWidth: '900px', width: '100%', maxHeight: '90vh', display: 'flex', flexDirection: 'column' }} onClick={e => e.stopPropagation()}>
                        <button onClick={() => setPreviewImage(null)} style={{ position: 'absolute', top: '-40px', right: '0', background: 'transparent', border: 'none', color: 'white', cursor: 'pointer', padding: '0.5rem' }}>
                            <X size={28} />
                        </button>
                        <img src={previewImage} alt="eKYC Document Preview" style={{ width: '100%', height: 'auto', maxHeight: 'calc(90vh - 40px)', objectFit: 'contain', borderRadius: '12px', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5)' }} />
                    </div>
                </div>
            )}
        </div>
    );
};
