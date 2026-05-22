import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Navbar from '../components/layout/Navbar';
import { useAuthStore } from '../store/authStore';
import { Clock, Globe2, Building2, Save } from 'lucide-react';
import toast from 'react-hot-toast';

const DAYS_OF_WEEK = [
    { value: 'Monday', label: 'Thứ 2' },
    { value: 'Tuesday', label: 'Thứ 3' },
    { value: 'Wednesday', label: 'Thứ 4' },
    { value: 'Thursday', label: 'Thứ 5' },
    { value: 'Friday', label: 'Thứ 6' },
    { value: 'Saturday', label: 'Thứ 7' },
    { value: 'Sunday', label: 'Chủ Nhật' },
];

interface AvailabilitySlot {
    day: string;
    start: string;
    end: string;
}

export const BuddyProfilePage = () => {
    const [slots, setSlots] = useState<AvailabilitySlot[]>([]);
    const [languages, setLanguages] = useState('');
    const [bankCode, setBankCode] = useState('VCB');
    const [accountNumber, setAccountNumber] = useState('');
    const [accountName, setAccountName] = useState('');
    const [status, setStatus] = useState<'idle' | 'success' | 'error' | 'loading'>('idle');

    const { accessToken } = useAuthStore();

    useEffect(() => {
        axios.get('http://localhost:3000/buddy-profile/me', { headers: { Authorization: `Bearer ${accessToken}` } })
            .then(res => {
                const d = res.data.data;
                const parsedSlots: AvailabilitySlot[] = [];
                if (d.availability && Array.isArray(d.availability)) {
                    d.availability.forEach((slotStr: string) => {
                        const parts = slotStr.trim().split(' ');
                        if (parts.length >= 3) {
                            const day = parts[0];
                            const start = parts[1];
                            const end = parts[3];
                            parsedSlots.push({ day, start, end });
                        }
                    });
                }
                setSlots(parsedSlots);
                setLanguages(d.languages?.join(', ') || '');
                setBankCode(d.payoutMethod?.bankCode || 'VCB');
                setAccountNumber(d.payoutMethod?.accountNumber || '');
                setAccountName(d.payoutMethod?.accountName || '');
            })
            .catch(() => { });
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        const timeToMinutes = (timeStr: string): number => {
            const [h, m] = timeStr.split(':').map(Number);
            return h * 60 + m;
        };

        for (const slot of slots) {
            if (!slot.start || !slot.end) {
                toast.error('Vui lòng điền đầy đủ giờ bắt đầu và kết thúc.');
                return;
            }
            if (slot.start >= slot.end) {
                toast.error('Giờ bắt đầu phải trước giờ kết thúc.');
                return;
            }
            const startMins = timeToMinutes(slot.start);
            const endMins = timeToMinutes(slot.end);
            if (endMins - startMins < 120) {
                toast.error('Mỗi ca làm việc phải kéo dài ít nhất 2 tiếng.');
                return;
            }
        }

        setStatus('loading');
        try {
            const availabilityArray = slots.map(s => `${s.day} ${s.start} - ${s.end}`);
            await axios.post('http://localhost:3000/buddy-profile/update', {
                availability: availabilityArray,
                languages: languages.split(',').map(s => s.trim()).filter(Boolean),
                bankCode, accountNumber, accountName
            }, { headers: { Authorization: `Bearer ${accessToken}` } });
            setStatus('success');
            toast.success('Cập nhật thành công!');
        } catch (err: any) {
            setStatus('error');
            toast.error(err.response?.data?.message || err.message || 'Cập nhật thất bại.');
        } finally {
            setStatus('idle');
        }
    };

    const addSlot = () => {
        setSlots([...slots, { day: 'Monday', start: '08:00', end: '17:00' }]);
    };

    const removeSlot = (index: number) => {
        setSlots(slots.filter((_, i) => i !== index));
    };

    const updateSlot = (index: number, key: keyof AvailabilitySlot, value: string) => {
        const newSlots = [...slots];
        newSlots[index] = { ...newSlots[index], [key]: value };
        setSlots(newSlots);
    };

    const inputStyle: React.CSSProperties = {
        width: '100%', boxSizing: 'border-box',
        background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)',
        borderRadius: '12px', padding: '0.875rem 0.875rem 0.875rem 2.5rem',
        color: 'white', fontSize: '0.9rem', outline: 'none', fontFamily: 'inherit',
    };

    const labelStyle: React.CSSProperties = {
        display: 'block', color: 'rgba(255,255,255,0.5)',
        fontSize: '0.72rem', fontWeight: 700,
        textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.5rem',
    };

    const sectionStyle: React.CSSProperties = {
        background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)',
        borderRadius: '20px', padding: '1.75rem', marginBottom: '1.25rem',
    };

    return (
        <div style={{ minHeight: '100vh', background: 'linear-gradient(180deg, #0f0c29 0%, #1a1040 60%, #0d1117 100%)', fontFamily: "'Inter', -apple-system, sans-serif" }}>
            <Navbar />

            <div style={{ maxWidth: '680px', margin: '0 auto', padding: '2.5rem 1.5rem' }}>

                {/* Hero header */}
                <div style={{ position: 'relative', borderRadius: '24px', overflow: 'hidden', marginBottom: '1.75rem' }}>
                    <div style={{ background: 'linear-gradient(135deg, #1e1b4b 0%, #312e81 50%, #4c1d95 100%)', padding: '2.25rem 2rem', position: 'relative' }}>
                        <div style={{ position: 'absolute', top: '-3rem', right: '-3rem', width: '12rem', height: '12rem', background: 'rgba(255,255,255,0.05)', borderRadius: '50%' }} />
                        <div style={{ position: 'absolute', bottom: '-3rem', left: '-2rem', width: '9rem', height: '9rem', background: 'rgba(167,139,250,0.1)', borderRadius: '50%' }} />
                        <div style={{ position: 'relative', zIndex: 1, display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
                            <div style={{ width: '64px', height: '64px', borderRadius: '18px', background: 'rgba(255,255,255,0.1)', backdropFilter: 'blur(10px)', border: '1px solid rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2rem', flexShrink: 0 }}>🌟</div>
                            <div>
                                <h1 style={{ margin: '0 0 0.35rem', fontSize: '1.5rem', fontWeight: 800, color: 'white', letterSpacing: '-0.02em' }}>Buddy Settings</h1>
                                <p style={{ margin: 0, color: 'rgba(255,255,255,0.5)', fontSize: '0.875rem' }}>Configure your availability, languages, and payout info.</p>
                            </div>
                        </div>
                    </div>
                </div>

                <form onSubmit={handleSubmit}>
                    {/* Professional Info */}
                    <div style={sectionStyle}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
                            <div style={{ width: '34px', height: '34px', borderRadius: '10px', background: 'rgba(99,102,241,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <Globe2 size={18} style={{ color: '#818cf8' }} />
                            </div>
                            <h2 style={{ margin: 0, fontSize: '1rem', fontWeight: 700, color: 'rgba(255,255,255,0.8)' }}>Thông tin nghề nghiệp</h2>
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.1rem' }}>
                            <div>
                                <label style={labelStyle}><Clock size={12} style={{ display: 'inline', marginRight: '4px', verticalAlign: 'middle' }} />Giờ làm việc (Availability)</label>
                                
                                {slots.length === 0 ? (
                                    <div style={{
                                        padding: '1.25rem',
                                        background: 'rgba(255,255,255,0.02)',
                                        border: '1px dashed rgba(255,255,255,0.1)',
                                        borderRadius: '12px',
                                        textAlign: 'center',
                                        color: 'rgba(255,255,255,0.35)',
                                        fontSize: '0.85rem',
                                        marginBottom: '1rem'
                                    }}>
                                        Chưa có lịch làm việc được thiết lập. Hãy thêm lịch bên dưới.
                                    </div>
                                ) : (
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '1rem' }}>
                                        {slots.map((slot, index) => (
                                            <div key={index} style={{
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '0.75rem',
                                                background: 'rgba(255,255,255,0.03)',
                                                padding: '0.75rem',
                                                borderRadius: '12px',
                                                border: '1px solid rgba(255,255,255,0.06)'
                                            }}>
                                                <select
                                                    value={slot.day}
                                                    onChange={e => updateSlot(index, 'day', e.target.value)}
                                                    style={{
                                                        background: 'rgba(255,255,255,0.06)',
                                                        border: '1px solid rgba(255,255,255,0.1)',
                                                        borderRadius: '8px',
                                                        padding: '0.5rem',
                                                        color: 'white',
                                                        fontSize: '0.85rem',
                                                        outline: 'none',
                                                        cursor: 'pointer',
                                                        flex: 1.5,
                                                        minWidth: '95px'
                                                    }}
                                                >
                                                    {DAYS_OF_WEEK.map(d => (
                                                        <option key={d.value} value={d.value}>{d.label}</option>
                                                    ))}
                                                </select>

                                                <input
                                                    type="time"
                                                    value={slot.start}
                                                    onChange={e => updateSlot(index, 'start', e.target.value)}
                                                    style={{
                                                        background: 'rgba(255,255,255,0.06)',
                                                        border: '1px solid rgba(255,255,255,0.1)',
                                                        borderRadius: '8px',
                                                        padding: '0.5rem',
                                                        color: 'white',
                                                        fontSize: '0.85rem',
                                                        outline: 'none',
                                                        flex: 1,
                                                        textAlign: 'center'
                                                    }}
                                                />

                                                <span style={{ color: 'rgba(255,255,255,0.3)', fontSize: '0.85rem' }}>đến</span>

                                                <input
                                                    type="time"
                                                    value={slot.end}
                                                    onChange={e => updateSlot(index, 'end', e.target.value)}
                                                    style={{
                                                        background: 'rgba(255,255,255,0.06)',
                                                        border: '1px solid rgba(255,255,255,0.1)',
                                                        borderRadius: '8px',
                                                        padding: '0.5rem',
                                                        color: 'white',
                                                        fontSize: '0.85rem',
                                                        outline: 'none',
                                                        flex: 1,
                                                        textAlign: 'center'
                                                    }}
                                                />

                                                <button
                                                    type="button"
                                                    onClick={() => removeSlot(index)}
                                                    style={{
                                                        background: 'rgba(239,68,68,0.15)',
                                                        border: '1px solid rgba(239,68,68,0.3)',
                                                        borderRadius: '8px',
                                                        width: '32px',
                                                        height: '32px',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        justifyContent: 'center',
                                                        color: '#fca5a5',
                                                        cursor: 'pointer',
                                                        flexShrink: 0
                                                    }}
                                                >
                                                    ✕
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                )}

                                <button
                                    type="button"
                                    onClick={addSlot}
                                    style={{
                                        background: 'rgba(99,102,241,0.15)',
                                        border: '1px dashed rgba(99,102,241,0.4)',
                                        borderRadius: '10px',
                                        padding: '0.6rem 1.25rem',
                                        color: '#c7d2fe',
                                        fontSize: '0.8rem',
                                        fontWeight: 600,
                                        cursor: 'pointer',
                                        display: 'inline-flex',
                                        alignItems: 'center',
                                        gap: '6px'
                                    }}
                                >
                                    + Thêm khung giờ
                                </button>
                            </div>

                            <div>
                                <label style={labelStyle}>Ngôn ngữ</label>
                                <div style={{ position: 'relative' }}>
                                    <Globe2 size={15} style={{ position: 'absolute', left: '0.875rem', top: '50%', transform: 'translateY(-50%)', color: 'rgba(255,255,255,0.3)' }} />
                                    <input type='text' value={languages} onChange={e => setLanguages(e.target.value)}
                                        placeholder='vd: Tiếng Việt, English, 한국어' style={inputStyle} />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Payout Info */}
                    <div style={sectionStyle}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
                            <div style={{ width: '34px', height: '34px', borderRadius: '10px', background: 'rgba(16,185,129,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <Building2 size={18} style={{ color: '#34d399' }} />
                            </div>
                            <h2 style={{ margin: 0, fontSize: '1rem', fontWeight: 700, color: 'rgba(255,255,255,0.8)' }}>Thông tin ngân hàng</h2>
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.1rem' }}>
                            <div>
                                <label style={labelStyle}>Ngân hàng</label>
                                <div style={{ position: 'relative' }}>
                                    <Building2 size={15} style={{ position: 'absolute', left: '0.875rem', top: '50%', transform: 'translateY(-50%)', color: 'rgba(255,255,255,0.3)' }} />
                                    <select value={bankCode} onChange={e => setBankCode(e.target.value)}
                                        style={{ ...inputStyle, appearance: 'none' as any }}>
                                        <option value='VCB'>Vietcombank</option>
                                        <option value='TCB'>Techcombank</option>
                                        <option value='MB'>MB Bank</option>
                                        <option value='MOMO'>MoMo Wallet</option>
                                    </select>
                                </div>
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                <div>
                                    <label style={labelStyle}>Số tài khoản</label>
                                    <input type='text' value={accountNumber} onChange={e => setAccountNumber(e.target.value)}
                                        placeholder='0123456789' style={{ ...inputStyle, padding: '0.875rem', fontFamily: 'monospace' }} />
                                </div>
                                <div>
                                    <label style={labelStyle}>Tên tài khoản</label>
                                    <input type='text' value={accountName} onChange={e => setAccountName(e.target.value)}
                                        placeholder='NGUYEN VAN A' style={{ ...inputStyle, padding: '0.875rem', textTransform: 'uppercase' }} />
                                </div>
                            </div>
                        </div>
                    </div>



                    {/* Submit button */}
                    <button type='submit' disabled={status === 'loading'}
                        style={{ width: '100%', background: 'linear-gradient(135deg, #1e1b4b, #312e81)', border: '1px solid rgba(139,92,246,0.3)', borderRadius: '14px', padding: '1.1rem', color: 'white', fontWeight: 700, fontSize: '1rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', boxShadow: '0 4px 20px rgba(0,0,0,0.4)', fontFamily: 'inherit', opacity: status === 'loading' ? 0.7 : 1, transition: 'all 0.2s' }}>
                        {status === 'loading' ? (
                            <><div style={{ width: '18px', height: '18px', border: '2px solid rgba(255,255,255,0.3)', borderTopColor: 'white', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} /> Đang lưu...</>
                        ) : (
                            <><Save size={18} /> Lưu Buddy Profile</>
                        )}
                    </button>
                </form>
            </div>
            <style>{`@keyframes spin { to { transform: rotate(360deg) } } select option { background: #1e1b4b; }`}</style>
        </div>
    );
};
