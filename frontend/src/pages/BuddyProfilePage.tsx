import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Navbar from '../components/layout/Navbar';
import { useAuthStore } from '../store/authStore';
import { Clock, Globe2, Building2, Save } from 'lucide-react';
import toast from 'react-hot-toast';

export const BuddyProfilePage = () => {
    const [availability, setAvailability] = useState('');
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
                setAvailability(d.availability?.join(', ') || '');
                setLanguages(d.languages?.join(', ') || '');
                setBankCode(d.payoutMethod?.bankCode || 'VCB');
                setAccountNumber(d.payoutMethod?.accountNumber || '');
                setAccountName(d.payoutMethod?.accountName || '');
            })
            .catch(() => { });
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setStatus('loading');
        try {
            await axios.post('http://localhost:3000/buddy-profile/update', {
                availability: availability.split(',').map(s => s.trim()).filter(Boolean),
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
                                <label style={labelStyle}><Clock size={12} style={{ display: 'inline', marginRight: '4px', verticalAlign: 'middle' }} />Giờ làm việc</label>
                                <div style={{ position: 'relative' }}>
                                    <Clock size={15} style={{ position: 'absolute', left: '0.875rem', top: '50%', transform: 'translateY(-50%)', color: 'rgba(255,255,255,0.3)' }} />
                                    <input type='text' value={availability} onChange={e => setAvailability(e.target.value)}
                                        placeholder='vd: Mon-Fri 9AM-5PM, Sat 10AM-2PM' style={inputStyle} />
                                </div>
                                <p style={{ margin: '0.4rem 0 0', color: 'rgba(255,255,255,0.25)', fontSize: '0.72rem' }}>Phân tách nhiều khung giờ bằng dấu phẩy</p>
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
