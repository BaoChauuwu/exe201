import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Navbar from '../components/layout/Navbar';
import { useAuthStore } from '../store/authStore';
import { ShieldCheck, DollarSign, UserCheck, Search, Check, X, FileText, Activity, Users, Trash2, Map, BarChart2, CalendarClock } from 'lucide-react';
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
    const [bookings, setBookings] = useState<any[]>([]);
    const [bookingStatusFilter, setBookingStatusFilter] = useState('all');
    const [activeTab, setActiveTab] = useState<'overview' | 'ekyc' | 'payouts' | 'users' | 'trips'>('overview');
    const [searchQuery, setSearchQuery] = useState('');
    const [roleFilter, setRoleFilter] = useState('all');
    const [toast, setToast] = useState('');
    const [previewImage, setPreviewImage] = useState<string | null>(null);

    // Pagination state per tab
    const [ekycPage, setEkycPage] = useState(1);
    const [payoutsPage, setPayoutsPage] = useState(1);
    const [usersPage, setUsersPage] = useState(1);
    const [toursPage, setToursPage] = useState(1);
    const [tripsPage, setTripsPage] = useState(1);
    const CARD_PAGE_SIZE = 6;
    const LIST_PAGE_SIZE = 10;

    const { accessToken } = useAuthStore();
    const cfg = { headers: { Authorization: `Bearer ${accessToken}` } };

    const fetchAll = () => {
        axios.get((import.meta.env.VITE_API_URL || 'http://localhost:3000') + '/admin/ekyc/pending', cfg).then(r => setEkycs(r.data.data || [])).catch(console.error);
        axios.get((import.meta.env.VITE_API_URL || 'http://localhost:3000') + '/admin/payouts/pending', cfg).then(r => setPayouts(r.data.data || [])).catch(console.error);
        axios.get((import.meta.env.VITE_API_URL || 'http://localhost:3000') + '/admin/users', cfg).then(r => setUsers(r.data.data || [])).catch(console.error);
        experienceApi.getPending(cfg).then(r => setExperiences(r.data.data || [])).catch(console.error);
        axios.get((import.meta.env.VITE_API_URL || 'http://localhost:3000') + '/admin/bookings', cfg).then(r => setBookings(r.data.data || [])).catch(console.error);
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

    const Pagination = ({ page, total, pageSize, onPage }: { page: number; total: number; pageSize: number; onPage: (p: number) => void }) => {
        const totalPages = Math.ceil(total / pageSize);
        if (totalPages <= 1) return null;
        const pages = Array.from({ length: totalPages }, (_, i) => i + 1);
        const btnBase: React.CSSProperties = { height: '34px', minWidth: '34px', borderRadius: '8px', fontWeight: 700, fontSize: '0.82rem', cursor: 'pointer', border: '1px solid var(--color-border)', fontFamily: 'inherit', transition: 'all 0.15s', padding: '0 0.6rem' };
        return (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1rem 1.75rem', borderTop: '1px solid var(--color-border)', background: 'var(--color-bg-2)' }}>
                <span style={{ fontSize: '0.78rem', color: 'var(--color-text-faint)' }}>
                    Hiển thị {Math.min((page - 1) * pageSize + 1, total)}–{Math.min(page * pageSize, total)} / <b>{total}</b> bản ghi
                </span>
                <div style={{ display: 'flex', gap: '0.35rem', alignItems: 'center' }}>
                    <button disabled={page === 1} onClick={() => onPage(page - 1)}
                        style={{ ...btnBase, background: page === 1 ? 'var(--color-bg)' : '#fff', color: page === 1 ? 'var(--color-text-faint)' : 'var(--color-primary)', cursor: page === 1 ? 'not-allowed' : 'pointer' }}>← Trước</button>
                    {pages.map(p => (
                        <button key={p} onClick={() => onPage(p)} style={{ ...btnBase, background: p === page ? 'var(--gradient-primary)' : '#fff', color: p === page ? '#fff' : 'var(--color-text)', border: p === page ? 'none' : '1px solid var(--color-border)', boxShadow: p === page ? '0 4px 12px rgba(14,165,233,0.3)' : 'none' }}>{p}</button>
                    ))}
                    <button disabled={page === totalPages} onClick={() => onPage(page + 1)}
                        style={{ ...btnBase, background: page === totalPages ? 'var(--color-bg)' : '#fff', color: page === totalPages ? 'var(--color-text-faint)' : 'var(--color-primary)', cursor: page === totalPages ? 'not-allowed' : 'pointer' }}>Sau →</button>
                </div>
            </div>
        );
    };

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
                        <button onClick={() => { setActiveTab('overview'); setSearchQuery(''); }} style={tabBtn(activeTab === 'overview', '#f59e0b')}>
                            <BarChart2 size={16} /> Overview
                        </button>
                        <button onClick={() => { setActiveTab('ekyc'); setSearchQuery(''); setEkycPage(1); }} style={tabBtn(activeTab === 'ekyc', '#6366f1')}>
                            <UserCheck size={16} /> eKYC
                            <span style={{ background: 'rgba(0,0,0,0.25)', borderRadius: '999px', padding: '1px 8px', fontSize: '0.7rem' }}>{ekycs.length}</span>
                        </button>
                        <button onClick={() => { setActiveTab('payouts'); setSearchQuery(''); setPayoutsPage(1); }} style={tabBtn(activeTab === 'payouts', '#10b981')}>
                            <DollarSign size={16} /> Payouts
                            <span style={{ background: 'rgba(0,0,0,0.25)', borderRadius: '999px', padding: '1px 8px', fontSize: '0.7rem' }}>{payouts.length}</span>
                        </button>
                        <button onClick={() => { setActiveTab('users'); setSearchQuery(''); setUsersPage(1); }} style={tabBtn(activeTab === 'users', '#3b82f6')}>
                            <Users size={16} /> Users
                            <span style={{ background: 'rgba(0,0,0,0.25)', borderRadius: '999px', padding: '1px 8px', fontSize: '0.7rem' }}>{users.length}</span>
                        </button>
                        <button onClick={() => { setActiveTab('trips'); setSearchQuery(''); setTripsPage(1); }} style={tabBtn(activeTab === 'trips', '#f97316')}>
                            <CalendarClock size={16} /> Tours
                            <span style={{ background: 'rgba(0,0,0,0.25)', borderRadius: '999px', padding: '1px 8px', fontSize: '0.7rem' }}>{bookings.length}</span>
                        </button>
                    </div>
                </div>

                {/* Content card */}
                <div style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: '24px', overflow: 'hidden', minHeight: '400px', boxShadow: 'var(--shadow-md)' }}>

                    {/* Search bar */}
                    {activeTab !== 'overview' && (
                    <div style={{ padding: '1.25rem 1.75rem', borderBottom: '1px solid var(--color-border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem', flexWrap: 'wrap' }}>
                        <h2 style={{ margin: 0, fontSize: '1rem', fontWeight: 700, color: 'var(--color-primary-dark)' }}>
                            {activeTab === 'ekyc' ? 'Pending Verifications' : activeTab === 'payouts' ? 'Pending Payouts' : activeTab === 'trips' ? 'Quản lý chuyến đi' : 'User Management'}
                        </h2>
                        
                        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                            {activeTab === 'users' && (
                                <select value={roleFilter} onChange={e => { setRoleFilter(e.target.value); setUsersPage(1); }} style={{ background: 'var(--color-bg-2)', border: '1px solid var(--color-border)', borderRadius: '10px', padding: '0.5rem 1rem', color: 'var(--color-text)', fontSize: '0.8rem', outline: 'none', fontFamily: 'inherit', cursor: 'pointer' }}>
                                    <option value="all">Tất cả</option>
                                    <option value="tourist">Tourist</option>
                                    <option value="buddy">Buddy</option>
                                    <option value="admin">Admin</option>
                                </select>
                            )}
                            {activeTab === 'trips' && (
                                <select value={bookingStatusFilter} onChange={e => { setBookingStatusFilter(e.target.value); setTripsPage(1); }} style={{ background: 'var(--color-bg-2)', border: '1px solid var(--color-border)', borderRadius: '10px', padding: '0.5rem 1rem', color: 'var(--color-text)', fontSize: '0.8rem', outline: 'none', fontFamily: 'inherit', cursor: 'pointer' }}>
                                    <option value="all">Tất cả trạng thái</option>
                                    <option value="pending">Chờ xác nhận</option>
                                    <option value="confirmed">Đã xác nhận</option>
                                    <option value="ongoing">Đang diễn ra</option>
                                    <option value="completed">Hoàn thành</option>
                                    <option value="cancelled">Đã hủy</option>
                                </select>
                            )}
                            <div style={{ position: 'relative' }}>
                                <Search size={15} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-faint)' }} />
                                <input type='text' value={searchQuery} onChange={e => { setSearchQuery(e.target.value); setEkycPage(1); setPayoutsPage(1); setUsersPage(1); setToursPage(1); setTripsPage(1); }} placeholder='Search...' style={{ background: 'var(--color-bg-2)', border: '1px solid var(--color-border)', borderRadius: '10px', padding: '0.5rem 0.875rem 0.5rem 2.25rem', color: 'var(--color-text)', fontSize: '0.8rem', outline: 'none', width: '200px', fontFamily: 'inherit' }} />
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
                    {activeTab === 'ekyc' && (() => {
                        const filtered = ekycs.filter(e => !searchQuery || (e.userId || '').toLowerCase().includes(searchQuery.toLowerCase()));
                        const paged = filtered.slice((ekycPage - 1) * CARD_PAGE_SIZE, ekycPage * CARD_PAGE_SIZE);
                        return filtered.length === 0 ? (
                            <div style={{ padding: '5rem', textAlign: 'center', color: 'var(--color-text-muted)' }}>
                                <ShieldCheck size={48} style={{ marginBottom: '1rem', opacity: 0.3, color: 'var(--color-primary)' }} />
                                <p>Không có yêu cầu eKYC nào đang chờ duyệt</p>
                            </div>
                        ) : (
                            <>
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(380px, 1fr))', gap: '1.25rem', padding: '1.5rem' }}>
                                    {paged.map(ekyc => (
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
                                <Pagination page={ekycPage} total={filtered.length} pageSize={CARD_PAGE_SIZE} onPage={setEkycPage} />
                            </>
                        );
                    })()}

                    {/* Payouts tab */}
                    {activeTab === 'payouts' && (() => {
                        const paged = payouts.slice((payoutsPage - 1) * LIST_PAGE_SIZE, payoutsPage * LIST_PAGE_SIZE);
                        return payouts.length === 0 ? (
                            <div style={{ padding: '5rem', textAlign: 'center', color: 'var(--color-text-muted)' }}>
                                <DollarSign size={48} style={{ marginBottom: '1rem', opacity: 0.3, color: 'var(--color-primary)' }} />
                                <p>Không có yêu cầu rút tiền nào đang chờ xử lý</p>
                            </div>
                        ) : (
                            <>
                                <div>
                                    {paged.map(payout => (
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
                                <Pagination page={payoutsPage} total={payouts.length} pageSize={LIST_PAGE_SIZE} onPage={setPayoutsPage} />
                            </>
                        );
                    })()}

                    {/* Users tab */}
                    {activeTab === 'users' && (() => {
                        const filteredUsers = users.filter(u => {
                            if (roleFilter !== 'all' && (u.role || '').toLowerCase() !== roleFilter.toLowerCase()) return false;
                            if (searchQuery) {
                                const q = searchQuery.toLowerCase();
                                if (!(u.name || '').toLowerCase().includes(q) && !(u.email || '').toLowerCase().includes(q)) return false;
                            }
                            return true;
                        });
                        const paged = filteredUsers.slice((usersPage - 1) * LIST_PAGE_SIZE, usersPage * LIST_PAGE_SIZE);
                        return filteredUsers.length === 0 ? (
                            <div style={{ padding: '5rem', textAlign: 'center', color: 'var(--color-text-muted)' }}>
                                <Users size={48} style={{ marginBottom: '1rem', opacity: 0.3, color: 'var(--color-primary)' }} />
                                <p>Không tìm thấy user nào</p>
                            </div>
                        ) : (
                            <>
                                <div>
                                    {paged.map(user => (
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
                                <Pagination page={usersPage} total={filteredUsers.length} pageSize={LIST_PAGE_SIZE} onPage={setUsersPage} />
                            </>
                        );
                    })()}


                    {/* Trips / Bookings tab */}
                    {activeTab === 'trips' && (() => {
                        const statusColors: Record<string, string> = {
                            pending: '#f59e0b',
                            confirmed: '#3b82f6',
                            ongoing: '#8b5cf6',
                            completed: '#10b981',
                            cancelled: '#ef4444',
                        };
                        const statusLabels: Record<string, string> = {
                            pending: 'Chờ xác nhận',
                            confirmed: 'Đã xác nhận',
                            ongoing: 'Đang diễn ra',
                            completed: 'Hoàn thành',
                            cancelled: 'Đã hủy',
                        };

                        const filtered = bookings.filter(b => {
                            if (bookingStatusFilter !== 'all' && b.status !== bookingStatusFilter) return false;
                            if (searchQuery) {
                                const q = searchQuery.toLowerCase();
                                const code = (b.bookingCode || '').toLowerCase();
                                const tourist = (b.touristId?.name || '').toLowerCase();
                                const buddy = (b.buddyId?.name || '').toLowerCase();
                                const tour = (b.experienceId?.title || '').toLowerCase();
                                if (!code.includes(q) && !tourist.includes(q) && !buddy.includes(q) && !tour.includes(q)) return false;
                            }
                            return true;
                        });

                        return filtered.length === 0 ? (
                            <div style={{ padding: '5rem', textAlign: 'center', color: 'var(--color-text-muted)' }}>
                                <CalendarClock size={48} style={{ marginBottom: '1rem', opacity: 0.3, color: '#f97316' }} />
                                <p>Không tìm thấy chuyến đi nào</p>
                            </div>
                        ) : (
                            <div style={{ overflowX: 'auto' }}>
                                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.82rem' }}>
                                    <thead>
                                        <tr style={{ background: 'var(--color-bg-2)', borderBottom: '2px solid var(--color-border)' }}>
                                            {['Mã vé', 'Tour', 'Tourist', 'Buddy', 'Ngày đi', 'Giờ', 'Số giờ', 'Tổng tiền', 'Thanh toán', 'Trạng thái'].map(h => (
                                            <th key={h} style={{ padding: '0.75rem 1rem', textAlign: 'left', fontWeight: 700, color: 'var(--color-text-muted)', fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.05em', whiteSpace: 'nowrap' }}>{h}</th>
                                            ))}
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {filtered.slice((tripsPage - 1) * LIST_PAGE_SIZE, tripsPage * LIST_PAGE_SIZE).map((b, idx) => (
                                            <tr key={b._id} style={{ borderBottom: '1px solid var(--color-border)', background: idx % 2 === 0 ? 'transparent' : 'rgba(14,165,233,0.015)', transition: 'background 0.15s' }}
                                                onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = 'var(--color-surface-hover)'}
                                                onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = idx % 2 === 0 ? 'transparent' : 'rgba(14,165,233,0.015)'}
                                            >
                                                <td style={{ padding: '0.875rem 1rem', whiteSpace: 'nowrap' }}>
                                                    <code style={{ background: 'var(--color-bg-2)', border: '1px solid var(--color-border)', padding: '2px 8px', borderRadius: '6px', fontSize: '0.75rem', color: 'var(--color-primary-dark)', fontWeight: 700 }}>{b.bookingCode}</code>
                                                </td>
                                                <td style={{ padding: '0.875rem 1rem', maxWidth: '160px' }}>
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                                        {b.experienceId?.images?.[0] && <img src={b.experienceId.images[0]} alt='' style={{ width: 32, height: 32, borderRadius: '8px', objectFit: 'cover', flexShrink: 0 }} />}
                                                        <span style={{ fontWeight: 600, color: 'var(--color-text)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{b.experienceId?.title || '—'}</span>
                                                    </div>
                                                </td>
                                                <td style={{ padding: '0.875rem 1rem', whiteSpace: 'nowrap' }}>
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                                        <img src={b.touristId?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(b.touristId?.name || 'T')}&size=32`} alt='' style={{ width: 28, height: 28, borderRadius: '50%', objectFit: 'cover' }} />
                                                        <div>
                                                            <div style={{ fontWeight: 600 }}>{b.touristId?.name || '—'}</div>
                                                            <div style={{ fontSize: '0.7rem', color: 'var(--color-text-faint)' }}>{b.touristId?.email || ''}</div>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td style={{ padding: '0.875rem 1rem', whiteSpace: 'nowrap' }}>
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                                        <img src={b.buddyId?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(b.buddyId?.name || 'B')}&size=32`} alt='' style={{ width: 28, height: 28, borderRadius: '50%', objectFit: 'cover' }} />
                                                        <div>
                                                            <div style={{ fontWeight: 600 }}>{b.buddyId?.name || '—'}</div>
                                                            <div style={{ fontSize: '0.7rem', color: 'var(--color-text-faint)' }}>{b.buddyId?.email || ''}</div>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td style={{ padding: '0.875rem 1rem', whiteSpace: 'nowrap', color: 'var(--color-text-muted)' }}>
                                                    {b.scheduledDate ? new Date(b.scheduledDate).toLocaleDateString('vi-VN') : '—'}
                                                </td>
                                                <td style={{ padding: '0.875rem 1rem', whiteSpace: 'nowrap', color: 'var(--color-text-muted)' }}>
                                                    {b.startTime || '—'}
                                                </td>
                                                <td style={{ padding: '0.875rem 1rem', whiteSpace: 'nowrap', textAlign: 'center', fontWeight: 700 }}>
                                                    {b.hours}h
                                                </td>
                                                <td style={{ padding: '0.875rem 1rem', whiteSpace: 'nowrap', fontWeight: 800, color: 'var(--color-primary-dark)' }}>
                                                    {b.totalPrice?.toLocaleString('vi-VN')} ₫
                                                </td>
                                                <td style={{ padding: '0.875rem 1rem', whiteSpace: 'nowrap' }}>
                                                    <span style={badgeStyle(b.paymentStatus === 'paid' ? '#10b981' : '#f59e0b')}>
                                                        {b.paymentStatus === 'paid' ? '✓ Đã TT' : '⏳ Chưa TT'}
                                                    </span>
                                                </td>
                                                <td style={{ padding: '0.875rem 1rem', whiteSpace: 'nowrap' }}>
                                                    <span style={badgeStyle(statusColors[b.status] || '#94a3b8')}>
                                                        {statusLabels[b.status] || b.status}
                                                    </span>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                                <Pagination page={tripsPage} total={filtered.length} pageSize={LIST_PAGE_SIZE} onPage={setTripsPage} />
                            </div>
                        );
                    })()}
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
