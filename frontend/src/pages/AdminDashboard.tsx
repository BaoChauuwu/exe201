import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Navbar from '../components/layout/Navbar';
import { useAuthStore } from '../store/authStore';
import { ShieldCheck, DollarSign, UserCheck, Search, Check, X, FileText, Activity, Users, Trash2, BarChart2, CalendarClock, Compass, AlertTriangle, ShieldAlert, MapPin } from 'lucide-react';

import { socket } from '../socket';
import { toast as hotToast } from 'react-hot-toast';

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip as ChartTooltip,
  Legend,
  Filler
} from 'chart.js';
import { Bar, Line } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  ChartTooltip,
  Legend,
  Filler
);

export const AdminDashboard = () => {
    const [ekycs, setEkycs] = useState<any[]>([]);
    const [payouts, setPayouts] = useState<any[]>([]);
    const [users, setUsers] = useState<any[]>([]);
    const [feedbacks, setFeedbacks] = useState<any[]>([]);
    const [experiences, setExperiences] = useState<any[]>([]);

    const [bookings, setBookings] = useState<any[]>([]);
    const [disputes, setDisputes] = useState<any[]>([]);
    const [activeSOS, setActiveSOS] = useState<any[]>([]);
    const [resolvedSOS, setResolvedSOS] = useState<any[]>([]);
    const [bookingStatusFilter, setBookingStatusFilter] = useState('all');
    const [activeTab, setActiveTab] = useState<'overview' | 'ekyc' | 'payouts' | 'users' | 'trips' | 'feedbacks' | 'experiences' | 'disputes' | 'sos'>('overview');
    const [searchQuery, setSearchQuery] = useState('');
    const [roleFilter, setRoleFilter] = useState('all');
    const [toast, setToast] = useState('');
    
    // States for Dispute Resolution
    const [isResolveModalOpen, setIsResolveModalOpen] = useState(false);
    const [resolveBooking, setResolveBooking] = useState<any>(null);
    const [resolveRefundPercentage, setResolveRefundPercentage] = useState<number>(100);
    const [resolveNote, setResolveNote] = useState('');
    const [isResolving, setIsResolving] = useState(false);

    const [previewImage, setPreviewImage] = useState<string | null>(null);
    const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear());

    // Pagination state per tab
    const [ekycPage, setEkycPage] = useState(1);
    const [payoutsPage, setPayoutsPage] = useState(1);
    const [usersPage, setUsersPage] = useState(1);
    const [experiencesPage, setExperiencesPage] = useState(1);

    const [tripsPage, setTripsPage] = useState(1);
    const CARD_PAGE_SIZE = 6;
    const LIST_PAGE_SIZE = 10;

    const { accessToken } = useAuthStore();
    const cfg = { headers: { Authorization: `Bearer ${accessToken}` } };

    const fetchAll = () => {
        axios.get((import.meta.env.VITE_API_URL || 'http://localhost:3000') + '/admin/ekyc/pending', cfg).then(r => setEkycs(r.data.data || [])).catch(console.error);
        axios.get((import.meta.env.VITE_API_URL || 'http://localhost:3000') + '/admin/payouts/pending', cfg).then(r => setPayouts(r.data.data || [])).catch(console.error);
        axios.get((import.meta.env.VITE_API_URL || 'http://localhost:3000') + '/admin/users', cfg).then(r => setUsers(r.data.data || [])).catch(console.error);

        axios.get((import.meta.env.VITE_API_URL || 'http://localhost:3000') + '/admin/bookings', cfg).then(r => setBookings(r.data.data || [])).catch(console.error);
        axios.get((import.meta.env.VITE_API_URL || 'http://localhost:3000') + '/bookings/admin/disputes', cfg).then(r => setDisputes(r.data.result || [])).catch(console.error);
        
        axios.get((import.meta.env.VITE_API_URL || 'http://localhost:3000') + '/feedbacks/admin', cfg).then(r => setFeedbacks(r.data.result || [])).catch(console.error);
        
        axios.get((import.meta.env.VITE_API_URL || 'http://localhost:3000') + '/admin/experiences/pending', cfg).then(r => setExperiences(r.data.data || [])).catch(console.error);

        axios.get((import.meta.env.VITE_API_URL || 'http://localhost:3000') + '/safety/sos/admin', cfg)
            .then(r => {
                setActiveSOS(r.data.activeSOS || []);
                setResolvedSOS(r.data.resolvedSOS || []);
            }).catch(console.error);
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
                    User: {data.name || 'Unknown'} ({data.role || 'Unknown'})<br/>
                    ID: {data.userId || data.bookingId}<br/>
                    Thời gian: {data.time ? new Date(data.time).toLocaleTimeString() : new Date().toLocaleTimeString()}<br/>
                    {data.location && (
                        <span>
                            Vị trí: <a href={`https://www.google.com/maps?q=${data.location.lat},${data.location.lng}`} target="_blank" style={{color: '#fff', textDecoration: 'underline'}}>{data.location.lat.toFixed(5)}, {data.location.lng.toFixed(5)}</a><br/>
                        </span>
                    )}
                    <em>Hãy liên hệ ngay lập tức!</em>
                </div>, 
                { duration: 15000, position: 'top-center' }
            );
        };

        socket.on('receive_sos', handleSos);
        socket.on('sos_alert', (data) => {
            handleSos(data);
            fetchAll(); // Refresh SOS list
        });
        socket.on('sos_resolved_notification', fetchAll); // Refresh SOS list when another admin resolves

        return () => {
            socket.off('receive_sos', handleSos);
            socket.off('sos_alert');
            socket.off('sos_resolved_notification');
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

    const approveExperience = async (id: string, status: string) => {
        await axios.post((import.meta.env.VITE_API_URL || 'http://localhost:3000') + '/admin/experiences/approve', { experienceId: id, status }, cfg).catch(console.error);
        showToast(`Tour ${status === 'approved' ? 'đã duyệt' : 'đã từ chối'} thành công!`);
        fetchAll();
    };

    const handleOpenResolveModal = (dispute: any) => {
        setResolveBooking(dispute);
        setResolveRefundPercentage(100);
        setResolveNote('');
        setIsResolveModalOpen(true);
    };

    const submitResolveDispute = async () => {
        if (!resolveBooking) return;
        if (resolveRefundPercentage < 0 || resolveRefundPercentage > 100) {
            showToast('Lỗi: Tỷ lệ hoàn tiền phải từ 0-100%');
            return;
        }
        if (!resolveNote.trim() || resolveNote.trim().length < 10) {
            showToast('Lỗi: Ghi chú phán quyết phải có ít nhất 10 ký tự');
            return;
        }

        const msg = `Bạn chuẩn bị ra phán quyết:\n- Hoàn ${resolveRefundPercentage}% cho Tourist\n- Giải ngân ${100 - resolveRefundPercentage}% cho Buddy\n\nHành động này không thể hoàn tác. Tiếp tục?`;
        if (!window.confirm(msg)) return;

        setIsResolving(true);
        try {
            await axios.post(
                `${import.meta.env.VITE_API_URL || 'http://localhost:3000'}/bookings/${resolveBooking._id}/resolve-dispute`,
                { refundPercentage: resolveRefundPercentage, resolutionNote: resolveNote },
                cfg
            );
            showToast('✅ Đã giải quyết khiếu nại thành công!');
            setIsResolveModalOpen(false);
            setResolveBooking(null);
            fetchAll();
        } catch (err: any) {
            showToast('Lỗi: ' + (err.response?.data?.message || err.message));
        } finally {
            setIsResolving(false);
        }
    };

    const resolveSOSAlert = async (bookingId: string) => {
        const note = window.prompt('Nhập ghi chú xử lý (tùy chọn):', 'Đã xử lý an toàn');
        if (note === null) return;
        try {
            await axios.post(`${import.meta.env.VITE_API_URL || 'http://localhost:3000'}/safety/sos/${bookingId}/resolve`, { note }, cfg);
            showToast('✅ Đã xử lý SOS thành công!');
            fetchAll();
        } catch (err: any) {
            showToast('Lỗi: ' + (err.response?.data?.message || err.message));
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
                        <button onClick={() => { setActiveTab('experiences'); setSearchQuery(''); setExperiencesPage(1); }} style={tabBtn(activeTab === 'experiences', '#8b5cf6')}>
                            <Compass size={16} /> Duyệt Tour
                            <span style={{ background: 'rgba(0,0,0,0.25)', borderRadius: '999px', padding: '1px 8px', fontSize: '0.7rem' }}>{experiences.length}</span>
                        </button>
                        <button onClick={() => { setActiveTab('users'); setSearchQuery(''); setUsersPage(1); }} style={tabBtn(activeTab === 'users', '#3b82f6')}>
                            <Users size={16} /> Users
                            <span style={{ background: 'rgba(0,0,0,0.25)', borderRadius: '999px', padding: '1px 8px', fontSize: '0.7rem' }}>{users.length}</span>
                        </button>
                        <button onClick={() => { setActiveTab('trips'); setSearchQuery(''); setTripsPage(1); }} style={tabBtn(activeTab === 'trips', '#f97316')}>
                            <CalendarClock size={16} /> Tours
                            <span style={{ background: 'rgba(0,0,0,0.25)', borderRadius: '999px', padding: '1px 8px', fontSize: '0.7rem' }}>{bookings.length}</span>
                        </button>
                        <button onClick={() => { setActiveTab('feedbacks'); setSearchQuery(''); }} style={tabBtn(activeTab === 'feedbacks', '#ec4899')}>
                            <FileText size={16} /> Feedbacks
                            <span style={{ background: 'rgba(0,0,0,0.25)', borderRadius: '999px', padding: '1px 8px', fontSize: '0.7rem' }}>{feedbacks.length}</span>
                        </button>
                        <button onClick={() => { setActiveTab('disputes'); setSearchQuery(''); }} style={tabBtn(activeTab === 'disputes', '#ef4444')}>
                            <AlertTriangle size={16} /> Khiếu nại
                            <span style={{ background: 'rgba(0,0,0,0.25)', borderRadius: '999px', padding: '1px 8px', fontSize: '0.7rem' }}>{disputes.filter(d => d.disputeStatus === 'pending').length}</span>
                        </button>
                        <button onClick={() => { setActiveTab('sos'); setSearchQuery(''); }} style={{ ...tabBtn(activeTab === 'sos', '#dc2626'), animation: activeSOS.length > 0 ? 'pulse 2s infinite' : 'none' }}>
                            <ShieldAlert size={16} /> SOS
                            <span style={{ background: 'rgba(0,0,0,0.25)', borderRadius: '999px', padding: '1px 8px', fontSize: '0.7rem', border: activeSOS.length > 0 ? '1px solid white' : 'none' }}>{activeSOS.length}</span>
                        </button>
                    </div>
                </div>

                {/* Content card */}
                <div style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: '24px', overflow: 'hidden', minHeight: '400px', boxShadow: 'var(--shadow-md)' }}>

                    {/* Search bar */}
                    {activeTab !== 'overview' && (
                    <div style={{ padding: '1.25rem 1.75rem', borderBottom: '1px solid var(--color-border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem', flexWrap: 'wrap' }}>
                        <h2 style={{ margin: 0, fontSize: '1rem', fontWeight: 700, color: 'var(--color-primary-dark)' }}>
                            {activeTab === 'ekyc' ? 'Pending Verifications' : activeTab === 'payouts' ? 'Pending Payouts' : activeTab === 'trips' ? 'Quản lý chuyến đi' : activeTab === 'experiences' ? 'Duyệt Tour Trải Nghiệm' : 'User Management'}
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
                                <input type='text' value={searchQuery} onChange={e => { setSearchQuery(e.target.value); setEkycPage(1); setPayoutsPage(1); setUsersPage(1); setTripsPage(1); }} placeholder='Search...' style={{ background: 'var(--color-bg-2)', border: '1px solid var(--color-border)', borderRadius: '10px', padding: '0.5rem 0.875rem 0.5rem 2.25rem', color: 'var(--color-text)', fontSize: '0.8rem', outline: 'none', width: '200px', fontFamily: 'inherit' }} />
                            </div>
                        </div>
                    </div>
                    )}

                    {/* Overview Tab */}
                    {activeTab === 'overview' && (() => {
                        const totalBookings = bookings.length;
                        const completedBookings = bookings.filter(b => b.status === 'completed').length;
                        const ongoingBookings = bookings.filter(b => ['ongoing', 'confirmed'].includes(b.status)).length;
                        const cancelledBookings = bookings.filter(b => ['cancelled', 'rejected'].includes(b.status)).length;
                        
                        const totalRevenue = bookings
                            .filter(b => ['completed', 'confirmed', 'ongoing'].includes(b.status))
                            .reduce((sum, b) => sum + (b.totalPrice || 0), 0);

                        const totalUsersCount = users.length;
                        const touristsCount = users.filter(u => u.role === 'tourist').length;
                        const buddiesCount = users.filter(u => u.role === 'buddy').length;

                        // Process chart data (12 months of selectedYear)
                        const months = Array.from({ length: 12 }).map((_, i) => {
                            return {
                                label: `T${i + 1}`,
                                month: i,
                                year: selectedYear,
                                deployed: 0,
                                completed: 0,
                                revenue: 0,
                                newTourists: 0,
                                newBuddies: 0,
                                newTotal: 0
                            };
                        });

                        bookings.forEach(b => {
                            let d: Date;
                            if (b.created_at) {
                                d = new Date(b.created_at);
                            } else if (b._id) {
                                d = new Date(parseInt(b._id.substring(0, 8), 16) * 1000);
                            } else {
                                return;
                            }
                            
                            const m = months.find(x => x.month === d.getMonth() && x.year === d.getFullYear());
                            if (m) {
                                if (['confirmed', 'ongoing', 'completed'].includes(b.status)) {
                                    m.deployed += 1;
                                }
                                if (b.status === 'completed') {
                                    m.completed += 1;
                                    m.revenue += (b.totalPrice || 0);
                                }
                            }
                        });

                        users.forEach(u => {
                            let d: Date;
                            if (u.created_at) {
                                d = new Date(u.created_at);
                            } else if (u._id) {
                                d = new Date(parseInt(u._id.substring(0, 8), 16) * 1000);
                            } else {
                                return;
                            }
                            
                            const m = months.find(x => x.month === d.getMonth() && x.year === d.getFullYear());
                            if (m) {
                                m.newTotal += 1;
                                if (u.role === 'tourist') m.newTourists += 1;
                                if (u.role === 'buddy') m.newBuddies += 1;
                            }
                        });

                        const availableYears = [2024, 2025, 2026, 2027];

                        return (
                        <div style={{ padding: '2rem' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                                <h2 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 800, color: 'var(--color-primary-dark)' }}>Tổng quan Hệ thống</h2>
                                <select 
                                    value={selectedYear}
                                    onChange={(e) => setSelectedYear(Number(e.target.value))}
                                    style={{
                                        padding: '0.5rem 1rem',
                                        borderRadius: '8px',
                                        border: '1px solid var(--color-border)',
                                        background: 'var(--color-bg)',
                                        color: 'var(--color-text)',
                                        outline: 'none',
                                        cursor: 'pointer',
                                        fontWeight: 600
                                    }}
                                >
                                    {availableYears.map(y => <option key={y} value={y}>Năm {y}</option>)}
                                </select>
                            </div>
                            
                            {/* Key Metrics Cards */}
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
                                <div style={{ background: 'linear-gradient(135deg, #3b82f6, #2563eb)', color: 'white', padding: '1.5rem', borderRadius: '16px', boxShadow: '0 4px 15px rgba(59, 130, 246, 0.3)' }}>
                                    <div style={{ fontSize: '0.9rem', opacity: 0.9, marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}><CalendarClock size={18}/> Tổng số Tour</div>
                                    <div style={{ fontSize: '2rem', fontWeight: 800 }}>{totalBookings}</div>
                                </div>
                                <div style={{ background: 'linear-gradient(135deg, #10b981, #059669)', color: 'white', padding: '1.5rem', borderRadius: '16px', boxShadow: '0 4px 15px rgba(16, 185, 129, 0.3)' }}>
                                    <div style={{ fontSize: '0.9rem', opacity: 0.9, marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}><Check size={18}/> Tour Hoàn thành</div>
                                    <div style={{ fontSize: '2rem', fontWeight: 800 }}>{completedBookings}</div>
                                </div>
                                <div style={{ background: 'linear-gradient(135deg, #f59e0b, #d97706)', color: 'white', padding: '1.5rem', borderRadius: '16px', boxShadow: '0 4px 15px rgba(245, 158, 11, 0.3)' }}>
                                    <div style={{ fontSize: '0.9rem', opacity: 0.9, marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}><Activity size={18}/> Đang triển khai</div>
                                    <div style={{ fontSize: '2rem', fontWeight: 800 }}>{ongoingBookings}</div>
                                </div>
                                <div style={{ background: 'linear-gradient(135deg, #8b5cf6, #6d28d9)', color: 'white', padding: '1.5rem', borderRadius: '16px', boxShadow: '0 4px 15px rgba(139, 92, 246, 0.3)' }}>
                                    <div style={{ fontSize: '0.9rem', opacity: 0.9, marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}><DollarSign size={18}/> Doanh thu</div>
                                    <div style={{ fontSize: '1.8rem', fontWeight: 800 }}>{totalRevenue.toLocaleString()} ₫</div>
                                </div>
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '2rem' }}>
                                
                                {/* Tour Status Distribution */}
                                <div style={{ background: 'var(--color-bg-2)', padding: '1.5rem', borderRadius: '16px', border: '1px solid var(--color-border)' }}>
                                    <h3 style={{ margin: '0 0 1.5rem', fontSize: '1rem', color: 'var(--color-text)' }}>Phân bổ trạng thái Tour</h3>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                        <div>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem', marginBottom: '0.5rem', color: 'var(--color-text)' }}>
                                                <span>Hoàn thành ({completedBookings})</span>
                                                <span style={{ fontWeight: 600 }}>{totalBookings ? Math.round(completedBookings/totalBookings*100) : 0}%</span>
                                            </div>
                                            <div style={{ height: '8px', background: 'var(--color-bg)', borderRadius: '999px', overflow: 'hidden' }}>
                                                <div style={{ width: `${totalBookings ? (completedBookings/totalBookings*100) : 0}%`, height: '100%', background: '#10b981', borderRadius: '999px', transition: 'width 1s ease' }} />
                                            </div>
                                        </div>
                                        <div>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem', marginBottom: '0.5rem', color: 'var(--color-text)' }}>
                                                <span>Đang triển khai ({ongoingBookings})</span>
                                                <span style={{ fontWeight: 600 }}>{totalBookings ? Math.round(ongoingBookings/totalBookings*100) : 0}%</span>
                                            </div>
                                            <div style={{ height: '8px', background: 'var(--color-bg)', borderRadius: '999px', overflow: 'hidden' }}>
                                                <div style={{ width: `${totalBookings ? (ongoingBookings/totalBookings*100) : 0}%`, height: '100%', background: '#f59e0b', borderRadius: '999px', transition: 'width 1s ease' }} />
                                            </div>
                                        </div>
                                        <div>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem', marginBottom: '0.5rem', color: 'var(--color-text)' }}>
                                                <span>Đã hủy ({cancelledBookings})</span>
                                                <span style={{ fontWeight: 600 }}>{totalBookings ? Math.round(cancelledBookings/totalBookings*100) : 0}%</span>
                                            </div>
                                            <div style={{ height: '8px', background: 'var(--color-bg)', borderRadius: '999px', overflow: 'hidden' }}>
                                                <div style={{ width: `${totalBookings ? (cancelledBookings/totalBookings*100) : 0}%`, height: '100%', background: '#ef4444', borderRadius: '999px', transition: 'width 1s ease' }} />
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* User Role Distribution */}
                                <div style={{ background: 'var(--color-bg-2)', padding: '1.5rem', borderRadius: '16px', border: '1px solid var(--color-border)' }}>
                                    <h3 style={{ margin: '0 0 1.5rem', fontSize: '1rem', color: 'var(--color-text)' }}>Tỉ lệ Người dùng ({totalUsersCount} User)</h3>
                                    <div style={{ display: 'flex', height: '24px', borderRadius: '999px', overflow: 'hidden', marginBottom: '1.5rem' }}>
                                        <div style={{ width: `${totalUsersCount ? (touristsCount/totalUsersCount*100) : 0}%`, background: '#3b82f6', transition: 'width 1s ease' }} title={`Tourist: ${touristsCount}`} />
                                        <div style={{ width: `${totalUsersCount ? (buddiesCount/totalUsersCount*100) : 0}%`, background: '#f97316', transition: 'width 1s ease' }} title={`Buddy: ${buddiesCount}`} />
                                        <div style={{ flex: 1, background: '#64748b' }} title="Other (Admin)" />
                                    </div>
                                    <div style={{ display: 'flex', justifyContent: 'space-around', fontSize: '0.875rem', color: 'var(--color-text-muted)', flexWrap: 'wrap', gap: '1rem' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                            <div style={{ width: 12, height: 12, borderRadius: '50%', background: '#3b82f6' }} /> Tourist ({touristsCount})
                                        </div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                            <div style={{ width: 12, height: 12, borderRadius: '50%', background: '#f97316' }} /> Buddy ({buddiesCount})
                                        </div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                            <div style={{ width: 12, height: 12, borderRadius: '50%', background: '#64748b' }} /> Admin ({totalUsersCount - touristsCount - buddiesCount})
                                        </div>
                                    </div>
                                </div>

                                {/* Charts Section */}
                                <div style={{ gridColumn: '1 / -1', display: 'flex', flexDirection: 'column', gap: '2rem', marginTop: '1rem' }}>
                                    
                                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '2rem' }}>
                                        {/* Bookings Chart */}
                                        <div style={{ background: 'var(--color-bg-2)', padding: '1.5rem', borderRadius: '16px', border: '1px solid var(--color-border)' }}>
                                            <h3 style={{ margin: '0 0 1.5rem', fontSize: '1.1rem', color: 'var(--color-text)' }}>Thống kê Tour (Năm {selectedYear})</h3>
                                            <div style={{ height: 300, width: '100%' }}>
                                                <Bar data={{
                                                    labels: months.map(m => m.label),
                                                    datasets: [
                                                        { label: 'Tour triển khai', data: months.map(m => m.deployed), backgroundColor: '#3b82f6', borderRadius: 4 },
                                                        { label: 'Tour hoàn thành', data: months.map(m => m.completed), backgroundColor: '#10b981', borderRadius: 4 }
                                                    ]
                                                }} options={{ maintainAspectRatio: false, scales: { y: { beginAtZero: true, grid: { color: 'rgba(0,0,0,0.05)' } }, x: { grid: { display: false } } } }} />
                                            </div>
                                        </div>

                                        {/* Revenue Chart */}
                                        <div style={{ background: 'var(--color-bg-2)', padding: '1.5rem', borderRadius: '16px', border: '1px solid var(--color-border)' }}>
                                            <h3 style={{ margin: '0 0 1.5rem', fontSize: '1.1rem', color: 'var(--color-text)' }}>Tăng trưởng Doanh thu</h3>
                                            <div style={{ height: 300, width: '100%' }}>
                                                <Line data={{
                                                    labels: months.map(m => m.label),
                                                    datasets: [
                                                        { label: 'Doanh thu', data: months.map(m => m.revenue), borderColor: '#8b5cf6', backgroundColor: 'rgba(139, 92, 246, 0.5)', borderWidth: 3, tension: 0.3, pointRadius: 4 }
                                                    ]
                                                }} options={{ maintainAspectRatio: false, scales: { y: { beginAtZero: true, grid: { color: 'rgba(0,0,0,0.05)' } }, x: { grid: { display: false } } }, plugins: { tooltip: { callbacks: { label: function(context) { let label = context.dataset.label || ''; if (label) { label += ': '; } if (context.parsed.y !== null) { label += new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(context.parsed.y); } return label; } } } } }} />
                                            </div>
                                        </div>
                                    </div>

                                    {/* Users Chart */}
                                    <div style={{ background: 'var(--color-bg-2)', padding: '1.5rem', borderRadius: '16px', border: '1px solid var(--color-border)' }}>
                                        <h3 style={{ margin: '0 0 1.5rem', fontSize: '1.1rem', color: 'var(--color-text)' }}>Người dùng đăng ký mới</h3>
                                        <div style={{ height: 300, width: '100%' }}>
                                            <Line data={{
                                                labels: months.map(m => m.label),
                                                datasets: [
                                                    { fill: true, label: 'Tourist mới', data: months.map(m => m.newTourists), borderColor: '#3b82f6', backgroundColor: 'rgba(59, 130, 246, 0.3)', tension: 0.3, pointRadius: 0 },
                                                    { fill: true, label: 'Buddy mới', data: months.map(m => m.newBuddies), borderColor: '#f97316', backgroundColor: 'rgba(249, 115, 22, 0.3)', tension: 0.3, pointRadius: 0 }
                                                ]
                                            }} options={{ maintainAspectRatio: false, scales: { y: { beginAtZero: true, grid: { color: 'rgba(0,0,0,0.05)' } }, x: { grid: { display: false } } } }} />
                                        </div>
                                    </div>

                                    {/* Google Analytics Embed */}
                                    <div style={{ background: 'var(--color-bg-2)', padding: '1.5rem', borderRadius: '16px', border: '1px solid var(--color-border)', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                        <h3 style={{ margin: 0, fontSize: '1.1rem', color: 'var(--color-text)' }}>Lưu lượng truy cập (Google Analytics)</h3>
                                        <div style={{ height: 600, width: '100%', borderRadius: '12px', overflow: 'hidden', border: '1px solid var(--color-border)', background: 'var(--color-bg)' }}>
                                            <iframe
                                                width="100%"
                                                height="100%"
                                                src="https://datastudio.google.com/embed/reporting/ba610749-4e1d-4bf8-9e4b-d4bc322925f1/page/GlV1F"
                                                frameBorder="0"
                                                style={{ border: 0 }}
                                                allowFullScreen
                                                sandbox="allow-storage-access-by-user-activation allow-scripts allow-same-origin allow-popups allow-popups-to-escape-sandbox"
                                                title="Google Analytics Dashboard"
                                            ></iframe>
                                        </div>
                                    </div>

                                </div>

                            </div>
                        </div>
                        );
                    })()}

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

                    {/* Experiences tab */}
                    {activeTab === 'experiences' && (() => {
                        const filtered = experiences.filter(exp => {
                            if (!searchQuery) return true;
                            const q = searchQuery.toLowerCase();
                            const titleMatch = (exp.title || '').toLowerCase().includes(q);
                            const buddyNameMatch = (exp.buddyId?.name || '').toLowerCase().includes(q);
                            const buddyEmailMatch = (exp.buddyId?.email || '').toLowerCase().includes(q);
                            return titleMatch || buddyNameMatch || buddyEmailMatch;
                        });
                        const paged = filtered.slice((experiencesPage - 1) * CARD_PAGE_SIZE, experiencesPage * CARD_PAGE_SIZE);

                        return filtered.length === 0 ? (
                            <div style={{ padding: '5rem', textAlign: 'center', color: 'var(--color-text-muted)' }}>
                                <Compass size={48} style={{ marginBottom: '1rem', opacity: 0.3, color: 'var(--color-primary)' }} />
                                <p>Không có tour trải nghiệm nào đang chờ duyệt</p>
                            </div>
                        ) : (
                            <>
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '1.25rem', padding: '1.5rem' }}>
                                    {paged.map(exp => (
                                        <div key={exp._id} style={{ background: 'white', border: '1px solid var(--color-border)', borderRadius: '18px', padding: '1.25rem', transition: 'all 0.2s', boxShadow: 'var(--shadow-sm)', display: 'flex', flexDirection: 'column' }}
                                            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = 'var(--color-primary)'; (e.currentTarget as HTMLElement).style.boxShadow = 'var(--shadow-md)'; }}
                                            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = 'var(--color-border)'; (e.currentTarget as HTMLElement).style.boxShadow = 'var(--shadow-sm)'; }}
                                        >
                                            {/* Tour Image */}
                                            <div style={{ height: '140px', width: '100%', borderRadius: '12px', overflow: 'hidden', background: '#f1f5f9', marginBottom: '1rem', position: 'relative' }}>
                                                {exp.images && exp.images.length > 0 ? (
                                                    <img src={exp.images[0]} alt={exp.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                                ) : (
                                                    <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-text-faint)', fontSize: '0.85rem' }}>🗺️ Chưa có ảnh</div>
                                                )}
                                                <div style={{ position: 'absolute', top: '8px', left: '8px', background: 'rgba(0,0,0,0.6)', color: 'white', padding: '2px 8px', borderRadius: '6px', fontSize: '0.7rem', fontWeight: 700 }}>
                                                    {exp.category === 'food' ? '🍴 Ẩm thực' : exp.category === 'adventure' ? '🧗 Phiêu lưu' : exp.category === 'culture' ? '🏛️ Văn hóa' : exp.category === 'nightlife' ? '💃 Giải trí đêm' : '🗺️ Khác'}
                                                </div>
                                            </div>

                                            {/* Creator Buddy details */}
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem', borderBottom: '1px solid var(--color-border)', paddingBottom: '0.75rem' }}>
                                                <img src={exp.buddyId?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(exp.buddyId?.name || 'U')}&size=32`} style={{ width: 32, height: 32, borderRadius: '50%' }} alt=""/>
                                                <div style={{ overflow: 'hidden' }}>
                                                    <div style={{ fontWeight: 700, fontSize: '0.8rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{exp.buddyId?.name || 'Local Buddy'}</div>
                                                    <div style={{ fontSize: '0.7rem', color: 'var(--color-text-faint)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{exp.buddyId?.email || ''}</div>
                                                </div>
                                            </div>

                                            {/* Tour Details */}
                                            <div style={{ flex: 1 }}>
                                                <h4 style={{ margin: '0 0 0.5rem', fontSize: '1rem', fontWeight: 800, color: 'var(--color-text)', lineHeight: 1.3 }}>{exp.title}</h4>
                                                <p style={{ margin: '0 0 0.75rem', fontSize: '0.78rem', color: 'var(--color-text-muted)', display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden', lineHeight: 1.4 }}>{exp.description}</p>
                                                
                                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '1rem', fontSize: '0.75rem' }}>
                                                    <span style={{ background: '#f0f9ff', color: '#0369a1', padding: '2px 8px', borderRadius: '6px', fontWeight: 600 }}>📍 {exp.city || 'Đà Nẵng'}</span>
                                                    <span style={{ background: '#f0fdf4', color: '#15803d', padding: '2px 8px', borderRadius: '6px', fontWeight: 600 }}>💰 {exp.price?.toLocaleString()} {exp.currency || 'VND'}/h</span>
                                                    <span style={{ background: '#fdf2f8', color: '#9d174d', padding: '2px 8px', borderRadius: '6px', fontWeight: 600 }}>⏳ Tối thiểu {exp.minHours || 1}h</span>
                                                </div>

                                                {exp.includedItems && exp.includedItems.length > 0 && (
                                                    <div style={{ marginBottom: '1.25rem' }}>
                                                        <div style={{ fontSize: '0.7rem', color: 'var(--color-text-faint)', fontWeight: 700, textTransform: 'uppercase', marginBottom: '4px' }}>Bao gồm:</div>
                                                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                                                            {exp.includedItems.map((item: string, idx: number) => (
                                                                <span key={idx} style={{ background: 'var(--color-bg-2)', border: '1px solid var(--color-border)', borderRadius: '4px', padding: '1px 6px', fontSize: '0.68rem', color: 'var(--color-text-muted)' }}>{item}</span>
                                                            ))}
                                                        </div>
                                                    </div>
                                                )}
                                            </div>

                                            {/* Approve / Reject buttons */}
                                            <div style={{ display: 'flex', gap: '0.75rem', marginTop: 'auto' }}>
                                                <button onClick={() => approveExperience(exp._id, 'approved')} style={{ flex: 1, background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.2)', borderRadius: '10px', padding: '0.6rem', color: '#059669', fontWeight: 700, fontSize: '0.8rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem', fontFamily: 'inherit', transition: 'all 0.2s' }}
                                                    onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(16,185,129,0.2)'; }}
                                                    onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(16,185,129,0.1)'; }}>
                                                    <Check size={14} /> Duyệt tour
                                                </button>
                                                <button onClick={() => approveExperience(exp._id, 'rejected')} style={{ flex: 1, background: 'rgba(239,68,68,0.05)', border: '1px solid rgba(239,68,68,0.1)', borderRadius: '10px', padding: '0.6rem', color: '#dc2626', fontWeight: 700, fontSize: '0.8rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem', fontFamily: 'inherit', transition: 'all 0.2s' }}
                                                    onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(239,68,68,0.15)'; (e.currentTarget as HTMLElement).style.borderColor = 'rgba(239,68,68,0.3)'; }}
                                                    onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(239,68,68,0.05)'; (e.currentTarget as HTMLElement).style.borderColor = 'rgba(239,68,68,0.1)'; }}>
                                                    <X size={14} /> Từ chối
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                                <Pagination page={experiencesPage} total={filtered.length} pageSize={CARD_PAGE_SIZE} onPage={setExperiencesPage} />
                            </>
                        );
                    })()}

                    {/* Feedbacks tab */}
                    {activeTab === 'feedbacks' && (() => {
                        const filtered = feedbacks.filter(f => {
                            if (searchQuery) {
                                const q = searchQuery.toLowerCase();
                                const content = (f.content || '').toLowerCase();
                                const user = (f.userId?.name || '').toLowerCase();
                                if (!content.includes(q) && !user.includes(q)) return false;
                            }
                            return true;
                        });

                        return filtered.length === 0 ? (
                            <div style={{ padding: '5rem', textAlign: 'center', color: 'var(--color-text-muted)' }}>
                                <FileText size={48} style={{ marginBottom: '1rem', opacity: 0.3, color: '#ec4899' }} />
                                <p>Không có phản hồi nào</p>
                            </div>
                        ) : (
                            <div style={{ overflowX: 'auto' }}>
                                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
                                    <thead>
                                        <tr style={{ background: 'var(--color-bg-2)', borderBottom: '2px solid var(--color-border)' }}>
                                            <th style={{ padding: '0.75rem 1rem', textAlign: 'left', fontWeight: 700, color: 'var(--color-text-muted)' }}>Người gửi</th>
                                            <th style={{ padding: '0.75rem 1rem', textAlign: 'left', fontWeight: 700, color: 'var(--color-text-muted)' }}>Loại</th>
                                            <th style={{ padding: '0.75rem 1rem', textAlign: 'left', fontWeight: 700, color: 'var(--color-text-muted)' }}>Nội dung</th>
                                            <th style={{ padding: '0.75rem 1rem', textAlign: 'left', fontWeight: 700, color: 'var(--color-text-muted)' }}>Trạng thái</th>
                                            <th style={{ padding: '0.75rem 1rem', textAlign: 'center', fontWeight: 700, color: 'var(--color-text-muted)' }}>Hành động</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {filtered.map((f, idx) => (
                                            <tr key={f._id} style={{ borderBottom: '1px solid var(--color-border)', background: idx % 2 === 0 ? 'transparent' : 'rgba(236,72,153,0.015)' }}>
                                                <td style={{ padding: '0.875rem 1rem' }}>
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                                        <img src={f.userId?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(f.userId?.name || 'U')}&size=32`} style={{ width: 32, height: 32, borderRadius: '50%' }} alt=""/>
                                                        <div>
                                                            <div style={{ fontWeight: 600 }}>{f.userId?.name || 'Người dùng'}</div>
                                                            <div style={{ fontSize: '0.75rem', color: 'var(--color-text-faint)' }}>{f.userId?.email || ''}</div>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td style={{ padding: '0.875rem 1rem' }}>
                                                    {f.type === 'testimonial' ? (
                                                        <span style={badgeStyle('#f59e0b')}>⭐ Testimonial ({f.rating}/5)</span>
                                                    ) : (
                                                        <span style={badgeStyle('#6366f1')}>💡 Feedback</span>
                                                    )}
                                                </td>
                                                <td style={{ padding: '0.875rem 1rem', maxWidth: '300px' }}>
                                                    <div style={{ wordBreak: 'break-word', whiteSpace: 'pre-wrap', lineHeight: 1.4 }}>{f.content}</div>
                                                    <div style={{ fontSize: '0.7rem', color: 'var(--color-text-faint)', marginTop: '4px' }}>{new Date(f.created_at).toLocaleString('vi-VN')}</div>
                                                </td>
                                                <td style={{ padding: '0.875rem 1rem' }}>
                                                    <span style={badgeStyle(f.status === 'approved' ? '#10b981' : f.status === 'rejected' ? '#ef4444' : '#f59e0b')}>
                                                        {f.status === 'approved' ? 'Công khai' : f.status === 'rejected' ? 'Từ chối' : 'Chờ duyệt / Ẩn danh'}
                                                    </span>
                                                </td>
                                                <td style={{ padding: '0.875rem 1rem', textAlign: 'center' }}>
                                                    <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center' }}>
                                                        <button 
                                                            onClick={async () => {
                                                                if (window.confirm('Bạn có chắc muốn xóa phản hồi này?')) {
                                                                    try {
                                                                        await axios.delete(`${import.meta.env.VITE_API_URL || 'http://localhost:3000'}/feedbacks/admin/${f._id}`, cfg);
                                                                        setFeedbacks(feedbacks.filter(x => x._id !== f._id));
                                                                        hotToast.success('Xóa phản hồi thành công');
                                                                    } catch (e) {
                                                                        hotToast.error('Xóa thất bại');
                                                                    }
                                                                }
                                                            }} 
                                                            style={actionBtn('#ef4444')} 
                                                            title="Xóa phản hồi"
                                                        >
                                                            <X size={16}/>
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        );
                    })()}

                    {/* ── TAB: DISPUTES ── */}
                    {activeTab === 'disputes' && (
                        <div style={{ padding: '1.5rem' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
                                <div>
                                    <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                        <AlertTriangle size={18} style={{ color: '#ef4444' }} /> Quản lý Khiếu Nại ({disputes.length})
                                    </h3>
                                    <p style={{ margin: '4px 0 0', fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>
                                        {disputes.filter(d => d.disputeStatus === 'pending').length} khiếu nại đang chờ xử lý
                                    </p>
                                </div>
                            </div>

                            {disputes.length === 0 ? (
                                <div style={{ textAlign: 'center', padding: '4rem 2rem', color: 'var(--color-text-muted)' }}>
                                    <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>✅</div>
                                    <p>Không có khiếu nại nào. Nền tảng đang hoạt động tốt!</p>
                                </div>
                            ) : (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                    {disputes.map((dispute: any) => {
                                        const isPending = dispute.disputeStatus === 'pending';
                                        const statusColor = isPending ? '#f59e0b' : dispute.disputeStatus === 'resolved_refunded' ? '#10b981' : '#6366f1';
                                        const statusLabel = isPending ? 'Đang chờ xử lý' : dispute.disputeStatus === 'resolved_refunded' ? 'Đã hoàn tiền Tourist' : 'Đã giải ngân Buddy';
                                        const tourist = dispute.touristId;
                                        const buddy = dispute.buddyId;
                                        const exp = dispute.experienceId;
                                        return (
                                            <div key={dispute._id} style={{ background: 'var(--color-surface)', border: `1px solid ${isPending ? 'rgba(239,68,68,0.3)' : 'var(--color-border)'}`, borderRadius: '16px', padding: '1.25rem', boxShadow: isPending ? '0 0 0 2px rgba(239,68,68,0.08)' : 'none' }}>
                                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '0.75rem', marginBottom: '0.75rem' }}>
                                                    <div>
                                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                                                            <span style={{ fontFamily: 'monospace', fontSize: '0.75rem', background: '#f1f5f9', padding: '2px 8px', borderRadius: '6px', fontWeight: 700 }}>{dispute.bookingCode}</span>
                                                            <span style={{ ...badgeStyle(statusColor) }}>{statusLabel}</span>
                                                        </div>
                                                        <div style={{ fontWeight: 700, fontSize: '0.95rem' }}>{exp?.title || 'Tour'}</div>
                                                        <div style={{ fontSize: '0.78rem', color: 'var(--color-text-muted)', marginTop: '2px' }}>
                                                            Tourist: <strong>{tourist?.name}</strong> → Buddy: <strong>{buddy?.name}</strong>
                                                        </div>
                                                    </div>
                                                    <div style={{ textAlign: 'right', fontSize: '0.78rem', color: 'var(--color-text-muted)' }}>
                                                        <div>Tổng tiền: <strong style={{ color: 'var(--color-primary)' }}>{(dispute.totalPrice || 0).toLocaleString()} ₫</strong></div>
                                                        <div>Gửi lúc: {dispute.disputeCreatedAt ? new Date(dispute.disputeCreatedAt).toLocaleString('vi-VN') : 'N/A'}</div>
                                                    </div>
                                                </div>

                                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                                                    <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '10px', padding: '0.75rem', fontSize: '0.82rem', lineHeight: 1.6 }}>
                                                        <div style={{ fontWeight: 700, color: '#b91c1c', marginBottom: '6px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                                            <AlertTriangle size={13} /> Lời khai của Tourist:
                                                        </div>
                                                        <div style={{ color: '#7f1d1d' }}>{dispute.disputeReason || 'Không có chi tiết'}</div>
                                                    </div>

                                                    <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '10px', padding: '0.75rem', fontSize: '0.82rem', lineHeight: 1.6 }}>
                                                        <div style={{ fontWeight: 700, color: '#15803d', marginBottom: '6px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                                            <ShieldCheck size={13} /> Lời bào chữa của Buddy:
                                                        </div>
                                                        <div style={{ color: '#166534' }}>
                                                            {dispute.buddyDefenseReason 
                                                                ? dispute.buddyDefenseReason 
                                                                : <span style={{ fontStyle: 'italic', color: '#15803d80' }}>Buddy chưa gửi giải trình.</span>
                                                            }
                                                        </div>
                                                    </div>
                                                </div>

                                                {isPending && (
                                                    <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
                                                        <button
                                                            onClick={() => handleOpenResolveModal(dispute)}
                                                            style={{ padding: '0.65rem 1.5rem', background: 'linear-gradient(135deg, #3b82f6, #2563eb)', border: 'none', borderRadius: '10px', color: 'white', fontWeight: 700, fontSize: '0.85rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', boxShadow: '0 4px 12px rgba(59,130,246,0.3)' }}
                                                        >
                                                            ⚖️ Đưa ra phán quyết
                                                        </button>
                                                    </div>
                                                )}
                                                {!isPending && (
                                                    <div style={{ background: '#f8fafc', border: '1px dashed #cbd5e1', borderRadius: '10px', padding: '0.85rem', marginTop: '0.5rem' }}>
                                                        <div style={{ fontSize: '0.8rem', color: statusColor, fontWeight: 800, marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                                            ✅ Quyết định của Admin ({dispute.disputeRefundPercentage}% Hoàn Tourist / {100 - (dispute.disputeRefundPercentage || 0)}% Giải ngân Buddy):
                                                        </div>
                                                        <div style={{ fontSize: '0.82rem', color: '#334155', fontStyle: 'italic' }}>
                                                            "{dispute.disputeResolutionNote || 'Không có ghi chú'}"
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    )}

                    {/* ── TAB: SOS ALERTS ── */}
                    {activeTab === 'sos' && (
                        <div style={{ padding: '1.5rem' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
                                <div>
                                    <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#dc2626' }}>
                                        <ShieldAlert size={18} /> Cảnh báo Khẩn cấp SOS ({activeSOS.length})
                                    </h3>
                                    <p style={{ margin: '4px 0 0', fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>
                                        Các cuộc gọi khẩn cấp đang cần xử lý ngay lập tức
                                    </p>
                                </div>
                            </div>

                            {activeSOS.length === 0 ? (
                                <div style={{ textAlign: 'center', padding: '4rem 2rem', color: 'var(--color-text-muted)' }}>
                                    <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🛡️</div>
                                    <p>Không có cuộc gọi khẩn cấp nào. Mọi thứ đang an toàn!</p>
                                </div>
                            ) : (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '2rem' }}>
                                    <h4 style={{ margin: 0, color: '#dc2626', fontSize: '0.9rem' }}>ĐANG CHỜ XỬ LÝ:</h4>
                                    {activeSOS.map((sos: any) => (
                                        <div key={sos._id} style={{ background: '#fef2f2', border: '2px solid #fca5a5', borderRadius: '16px', padding: '1.25rem', boxShadow: '0 0 15px rgba(220,38,38,0.2)', position: 'relative', overflow: 'hidden' }}>
                                            <div style={{ position: 'absolute', top: 0, left: 0, bottom: 0, width: '4px', background: '#dc2626' }} />
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
                                                <div>
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                                                        <span style={{ background: '#dc2626', color: 'white', padding: '2px 8px', borderRadius: '6px', fontSize: '0.7rem', fontWeight: 800, animation: 'pulse 1.5s infinite' }}>
                                                            SOS KHẨN CẤP
                                                        </span>
                                                        <span style={{ fontFamily: 'monospace', fontSize: '0.75rem', fontWeight: 700 }}>{sos.bookingCode}</span>
                                                    </div>
                                                    <div style={{ fontWeight: 700, fontSize: '1.05rem', color: '#991b1b', marginBottom: '0.25rem' }}>
                                                        Người gửi: {sos.emergencyRole === 'tourist' ? 'Khách du lịch' : sos.emergencyRole === 'buddy' ? 'Buddy' : 'Không rõ'}
                                                    </div>
                                                    <div style={{ fontSize: '0.85rem', color: '#7f1d1d' }}>
                                                        <div><strong>Tourist:</strong> {sos.touristId?.name} ({sos.touristId?.phone})</div>
                                                        <div><strong>Buddy:</strong> {sos.buddyId?.name} ({sos.buddyId?.phone})</div>
                                                    </div>
                                                </div>
                                                <div style={{ textAlign: 'right', fontSize: '0.8rem', color: '#991b1b' }}>
                                                    <div>Gửi lúc: <strong style={{ color: '#dc2626' }}>{new Date(sos.emergencyTriggeredAt).toLocaleString('vi-VN')}</strong></div>
                                                    {sos.emergencyLocation && (
                                                        <a href={`https://www.google.com/maps?q=${sos.emergencyLocation.lat},${sos.emergencyLocation.lng}`} target="_blank" rel="noopener noreferrer" style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', color: '#2563eb', fontWeight: 700, marginTop: '0.5rem', textDecoration: 'none' }}>
                                                            <MapPin size={14} /> Xem trên Google Maps
                                                        </a>
                                                    )}
                                                </div>
                                            </div>
                                            
                                            <div style={{ marginTop: '1rem', display: 'flex', justifyContent: 'flex-end' }}>
                                                <button
                                                    onClick={() => resolveSOSAlert(sos._id)}
                                                    style={{ padding: '0.75rem 1.5rem', background: 'linear-gradient(135deg, #16a34a, #15803d)', border: 'none', borderRadius: '10px', color: 'white', fontWeight: 800, fontSize: '0.9rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', boxShadow: '0 4px 12px rgba(22,163,74,0.3)' }}
                                                >
                                                    <Check size={16} /> Đã Xử Lý An Toàn
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}

                            {resolvedSOS.length > 0 && (
                                <div>
                                    <h4 style={{ margin: '0 0 1rem', color: '#059669', fontSize: '0.9rem', borderTop: '1px solid var(--color-border)', paddingTop: '1.5rem' }}>LỊCH SỬ ĐÃ XỬ LÝ (GẦN ĐÂY):</h4>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                                        {resolvedSOS.map((sos: any) => (
                                            <div key={sos._id} style={{ background: 'var(--color-surface)', border: '1px solid #a7f3d0', borderRadius: '12px', padding: '1rem', opacity: 0.8 }}>
                                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '1rem' }}>
                                                    <div>
                                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                                                            <span style={{ color: '#059669', fontSize: '0.7rem', fontWeight: 800 }}>✓ ĐÃ XỬ LÝ</span>
                                                            <span style={{ fontFamily: 'monospace', fontSize: '0.75rem' }}>{sos.bookingCode}</span>
                                                        </div>
                                                        <div style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>
                                                            Giải quyết lúc: {new Date(sos.emergencyResolvedAt).toLocaleString('vi-VN')}
                                                        </div>
                                                    </div>
                                                    <div style={{ fontSize: '0.8rem', color: '#059669', fontStyle: 'italic', maxWidth: '300px', textAlign: 'right' }}>
                                                        Ghi chú: {sos.emergencyResolvedNote || 'Không có ghi chú'}
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
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
        {/* ── MODAL PHÁN QUYẾT KHIẾU NẠI ── */}
        {isResolveModalOpen && resolveBooking && (
            <div style={{
                position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                background: 'rgba(15, 23, 42, 0.75)', backdropFilter: 'blur(8px)',
                zIndex: 10000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem'
            }}>
                <div style={{
                    background: 'white', borderRadius: '24px', padding: '2rem', width: '100%', maxWidth: '550px',
                    border: '1px solid rgba(59,130,246,0.15)', position: 'relative', boxSizing: 'border-box'
                }}>
                    <button
                        onClick={() => { setIsResolveModalOpen(false); setResolveBooking(null); }}
                        style={{ position: 'absolute', top: '1.25rem', right: '1.25rem', background: 'rgba(0,0,0,0.05)', border: 'none', borderRadius: '50%', width: '30px', height: '30px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
                    >
                        <X size={15} />
                    </button>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
                        <div style={{ width: '48px', height: '48px', borderRadius: '14px', background: 'rgba(59,130,246,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <AlertTriangle size={24} style={{ color: '#3b82f6' }} />
                        </div>
                        <div>
                            <h3 style={{ fontSize: '1.25rem', fontWeight: 800, margin: 0, color: '#1e293b' }}>Đưa Ra Phán Quyết</h3>
                            <p style={{ color: 'var(--color-text-muted)', fontSize: '0.82rem', margin: '2px 0 0' }}>Mã booking: {resolveBooking.bookingCode}</p>
                        </div>
                    </div>

                    <div style={{ marginBottom: '1.5rem' }}>
                        <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: 700, color: '#475569', marginBottom: '8px' }}>
                            Phân bổ số tiền ({resolveBooking.totalPrice.toLocaleString()} ₫)
                        </label>
                        <div style={{ background: '#f8fafc', padding: '1rem', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '0.85rem', fontWeight: 700 }}>
                                <span style={{ color: '#ef4444' }}>Hoàn Tourist: {resolveRefundPercentage}%</span>
                                <span style={{ color: '#10b981' }}>Giải ngân Buddy: {100 - resolveRefundPercentage}%</span>
                            </div>
                            <input 
                                type="range" 
                                min="0" max="100" step="5"
                                value={resolveRefundPercentage}
                                onChange={(e) => setResolveRefundPercentage(Number(e.target.value))}
                                style={{ width: '100%', cursor: 'pointer' }}
                            />
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '12px', gap: '8px' }}>
                                <button onClick={() => setResolveRefundPercentage(100)} style={{ flex: 1, padding: '0.5rem', background: resolveRefundPercentage === 100 ? '#ef4444' : '#fee2e2', color: resolveRefundPercentage === 100 ? 'white' : '#b91c1c', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 700, fontSize: '0.8rem' }}>100% Tourist</button>
                                <button onClick={() => setResolveRefundPercentage(50)} style={{ flex: 1, padding: '0.5rem', background: resolveRefundPercentage === 50 ? '#3b82f6' : '#dbeafe', color: resolveRefundPercentage === 50 ? 'white' : '#1d4ed8', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 700, fontSize: '0.8rem' }}>50/50 Cưa đôi</button>
                                <button onClick={() => setResolveRefundPercentage(0)} style={{ flex: 1, padding: '0.5rem', background: resolveRefundPercentage === 0 ? '#10b981' : '#d1fae5', color: resolveRefundPercentage === 0 ? 'white' : '#047857', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 700, fontSize: '0.8rem' }}>100% Buddy</button>
                            </div>
                        </div>
                    </div>

                    <div style={{ marginBottom: '1.5rem' }}>
                        <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: 700, color: '#475569', marginBottom: '8px' }}>
                            Ghi chú giải thích phán quyết (Bắt buộc)
                        </label>
                        <textarea
                            value={resolveNote}
                            onChange={e => setResolveNote(e.target.value)}
                            placeholder="Giải thích lý do dẫn đến phán quyết này để cả 2 bên cùng phục..."
                            rows={4}
                            style={{
                                width: '100%', padding: '0.85rem', borderRadius: '12px',
                                border: '1.5px solid #93c5fd', outline: 'none',
                                fontSize: '0.85rem', lineHeight: 1.6, resize: 'vertical',
                                fontFamily: 'inherit', boxSizing: 'border-box'
                            }}
                        />
                    </div>

                    <div style={{ display: 'flex', gap: '0.75rem' }}>
                        <button
                            onClick={() => { setIsResolveModalOpen(false); setResolveBooking(null); }}
                            style={{ flex: 1, padding: '0.85rem', background: '#f8fafc', border: '1px solid var(--color-border)', borderRadius: '12px', fontWeight: 700, fontSize: '0.95rem', cursor: 'pointer', color: 'var(--color-text)' }}
                        >
                            Hủy bỏ
                        </button>
                        <button
                            onClick={submitResolveDispute}
                            disabled={isResolving || resolveNote.trim().length < 10}
                            style={{
                                flex: 2, padding: '0.85rem',
                                background: resolveNote.trim().length >= 10 ? 'linear-gradient(135deg, #3b82f6, #2563eb)' : '#e2e8f0',
                                border: 'none', borderRadius: '12px', fontWeight: 800, fontSize: '0.95rem',
                                color: resolveNote.trim().length >= 10 ? 'white' : '#94a3b8',
                                cursor: resolveNote.trim().length >= 10 ? 'pointer' : 'not-allowed',
                                boxShadow: resolveNote.trim().length >= 10 ? '0 4px 15px rgba(59,130,246,0.3)' : 'none'
                            }}
                        >
                            {isResolving ? 'Đang xử lý...' : 'Xác nhận Phán Quyết'}
                        </button>
                    </div>
                </div>
            </div>
        )}
        </div>
    );
};
