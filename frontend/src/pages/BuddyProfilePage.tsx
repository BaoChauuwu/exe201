import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Navbar from '../components/layout/Navbar';
import { useAuthStore } from '../store/authStore';
import { Clock, Globe2, Building2, Save } from 'lucide-react';

export const BuddyProfilePage = () => {
    const [availability, setAvailability] = useState('');
    const [languages, setLanguages] = useState('');
    const [bankCode, setBankCode] = useState('VCB');
    const [accountNumber, setAccountNumber] = useState('');
    const [accountName, setAccountName] = useState('');
    const [status, setStatus] = useState<'idle' | 'success' | 'error' | 'loading'>('idle');
    const [statusMsg, setStatusMsg] = useState('');

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
            setStatusMsg('Hồ sơ của bạn đã được cập nhật thành công!');
        } catch (err: any) {
            setStatus('error');
            setStatusMsg(err.response?.data?.message || err.message || 'Cập nhật thất bại. Vui lòng thử lại.');
        }
        setTimeout(() => setStatus('idle'), 3000);
    };

    const inputStyle: React.CSSProperties = {
        width: '100%', boxSizing: 'border-box',
        background: '#f8fafc', border: '1px solid rgba(14, 165, 233, 0.18)',
        borderRadius: '12px', padding: '0.875rem 0.875rem 0.875rem 2.5rem',
        color: '#0f172a', fontSize: '0.9rem', outline: 'none', fontFamily: 'inherit',
        transition: 'all 0.2s',
    };

    const labelStyle: React.CSSProperties = {
        display: 'block', color: '#475569',
        fontSize: '0.72rem', fontWeight: 700,
        textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.5rem',
    };

    const sectionStyle: React.CSSProperties = {
        background: '#ffffff', border: '1px solid rgba(14, 165, 233, 0.12)',
        borderRadius: '20px', padding: '1.75rem', marginBottom: '1.25rem',
        boxShadow: '0 10px 30px rgba(14, 165, 233, 0.03)',
    };

    return (
        <div style={{ minHeight: '100vh', background: 'linear-gradient(180deg, #f0f9ff 0%, #f8fafc 40%, #ffffff 100%)', fontFamily: "'Inter', -apple-system, sans-serif" }}>
            <Navbar />

            <div style={{ maxWidth: '680px', margin: '0 auto', padding: '2.5rem 1.5rem' }}>

                {/* Hero header */}
                <div style={{ position: 'relative', borderRadius: '24px', overflow: 'hidden', marginBottom: '1.75rem', boxShadow: '0 10px 30px rgba(14, 165, 233, 0.15)' }}>
                    <div style={{ background: 'linear-gradient(135deg, #0284c7 0%, #0ea5e9 100%)', padding: '2.25rem 2rem', position: 'relative' }}>
                        <div style={{ position: 'absolute', top: '-3rem', right: '-3rem', width: '12rem', height: '12rem', background: 'rgba(255,255,255,0.1)', borderRadius: '50%' }} />
                        <div style={{ position: 'absolute', bottom: '-3rem', left: '-2rem', width: '9rem', height: '9rem', background: 'rgba(255,255,255,0.15)', borderRadius: '50%' }} />
                        <div style={{ position: 'relative', zIndex: 1, display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
                            <div style={{ width: '64px', height: '64px', borderRadius: '18px', background: 'rgba(255,255,255,0.2)', backdropFilter: 'blur(10px)', border: '1px solid rgba(255,255,255,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2rem', flexShrink: 0 }}>🌟</div>
                            <div>
                                <h1 style={{ margin: '0 0 0.35rem', fontSize: '1.5rem', fontWeight: 800, color: 'white', letterSpacing: '-0.02em' }}>Cài đặt hồ sơ Buddy</h1>
                                <p style={{ margin: 0, color: 'rgba(255,255,255,0.85)', fontSize: '0.875rem' }}>Cấu hình lịch làm việc, ngôn ngữ và thông tin nhận thanh toán.</p>
                            </div>
                        </div>
                    </div>
                </div>

                <form onSubmit={handleSubmit}>
                    {/* Professional Info */}
                    <div style={sectionStyle} className='buddy-card'>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
                            <div style={{ width: '34px', height: '34px', borderRadius: '10px', background: 'rgba(14,165,233,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <Globe2 size={18} style={{ color: '#0284c7' }} />
                            </div>
                            <h2 style={{ margin: 0, fontSize: '1rem', fontWeight: 700, color: '#0f172a' }}>Thông tin nghề nghiệp</h2>
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.1rem' }}>
                            <div>
                                <label style={labelStyle}><Clock size={12} style={{ display: 'inline', marginRight: '4px', verticalAlign: 'middle' }} />Giờ làm việc rảnh</label>
                                <div style={{ position: 'relative' }}>
                                    <Clock size={15} style={{ position: 'absolute', left: '0.875rem', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                                    <input type='text' value={availability} onChange={e => setAvailability(e.target.value)}
                                        placeholder='vd: Mon-Fri 9AM-5PM, Sat 10AM-2PM' style={inputStyle} className='buddy-input' />
                                </div>
                                <p style={{ margin: '0.4rem 0 0', color: '#94a3b8', fontSize: '0.72rem' }}>Phân tách nhiều khung giờ bằng dấu phẩy</p>
                            </div>

                            <div>
                                <label style={labelStyle}>Ngôn ngữ</label>
                                <div style={{ position: 'relative' }}>
                                    <Globe2 size={15} style={{ position: 'absolute', left: '0.875rem', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                                    <input type='text' value={languages} onChange={e => setLanguages(e.target.value)}
                                        placeholder='vd: Tiếng Việt, English, 한국어' style={inputStyle} className='buddy-input' />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Payout Info */}
                    <div style={sectionStyle} className='buddy-card'>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
                            <div style={{ width: '34px', height: '34px', borderRadius: '10px', background: 'rgba(16,185,129,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <Building2 size={18} style={{ color: '#10b981' }} />
                            </div>
                            <h2 style={{ margin: 0, fontSize: '1rem', fontWeight: 700, color: '#0f172a' }}>Thông tin ngân hàng nhận tiền</h2>
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.1rem' }}>
                            <div>
                                <label style={labelStyle}>Ngân hàng</label>
                                <div style={{ position: 'relative' }}>
                                    <Building2 size={15} style={{ position: 'absolute', left: '0.875rem', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                                    <select value={bankCode} onChange={e => setBankCode(e.target.value)}
                                        style={{ ...inputStyle, appearance: 'none' as any, paddingRight: '2.5rem' }} className='buddy-input'>
                                        <option value='VCB'>Vietcombank</option>
                                        <option value='TCB'>Techcombank</option>
                                        <option value='MB'>MB Bank</option>
                                        <option value='MOMO'>MoMo Wallet</option>
                                    </select>
                                    <div style={{ position: 'absolute', right: '1rem', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', color: '#0284c7', display: 'flex', alignItems: 'center' }}>
                                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6"/></svg>
                                    </div>
                                </div>
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                <div>
                                    <label style={labelStyle}>Số tài khoản</label>
                                    <input type='text' value={accountNumber} onChange={e => setAccountNumber(e.target.value)}
                                        placeholder='0123456789' style={{ ...inputStyle, padding: '0.875rem', fontFamily: 'monospace' }} className='buddy-input' />
                                </div>
                                <div>
                                    <label style={labelStyle}>Tên tài khoản</label>
                                    <input type='text' value={accountName} onChange={e => setAccountName(e.target.value)}
                                        placeholder='NGUYEN VAN A' style={{ ...inputStyle, padding: '0.875rem', textTransform: 'uppercase' }} className='buddy-input' />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Status messages */}
                    {status === 'success' && (
                        <div style={{ background: 'rgba(16,185,129,0.05)', border: '1px solid rgba(16,185,129,0.25)', borderRadius: '12px', padding: '0.875rem 1rem', color: '#10b981', fontSize: '0.875rem', marginBottom: '1rem' }}>✅ {statusMsg}</div>
                    )}
                    {status === 'error' && (
                        <div style={{ background: 'rgba(239,68,68,0.05)', border: '1px solid rgba(239,68,68,0.25)', borderRadius: '12px', padding: '0.875rem 1rem', color: '#ef4444', fontSize: '0.875rem', marginBottom: '1rem' }}>❌ {statusMsg}</div>
                    )}

                    {/* Submit button */}
                    <button type='submit' disabled={status === 'loading'}
                        style={{ width: '100%', background: 'linear-gradient(135deg, #0284c7, #0ea5e9)', border: 'none', borderRadius: '14px', padding: '1.1rem', color: 'white', fontWeight: 700, fontSize: '1rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', boxShadow: '0 8px 24px rgba(14,165,233,0.25)', fontFamily: 'inherit', opacity: status === 'loading' ? 0.7 : 1, transition: 'all 0.2s' }}
                        className='buddy-btn'>
                        {status === 'loading' ? (
                            <><div style={{ width: '18px', height: '18px', border: '2px solid rgba(255,255,255,0.3)', borderTopColor: 'white', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} /> Đang lưu...</>
                        ) : (
                            <><Save size={18} /> Lưu cấu hình Profile</>
                        )}
                    </button>
                </form>
            </div>
            <style>{`
                @keyframes spin { to { transform: rotate(360deg) } }
                select option { background: #ffffff; color: #0f172a; }
                .buddy-input {
                    transition: all 0.22s cubic-bezier(0.4, 0, 0.2, 1) !important;
                }
                .buddy-input:focus {
                    background: #ffffff !important;
                    border-color: #0284c7 !important;
                    box-shadow: 0 0 0 4px rgba(2, 132, 199, 0.12) !important;
                }
                .buddy-btn {
                    transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1) !important;
                }
                .buddy-btn:hover:not(:disabled) {
                    transform: translateY(-2px) !important;
                    box-shadow: 0 12px 30px rgba(14, 165, 233, 0.35) !important;
                    background: linear-gradient(135deg, #0274af, #0d96d4) !important;
                }
                .buddy-btn:active:not(:disabled) {
                    transform: translateY(0) !important;
                }
                .buddy-card {
                    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1) !important;
                }
                .buddy-card:hover {
                    transform: translateY(-3px) !important;
                    box-shadow: 0 16px 40px rgba(14, 165, 233, 0.07) !important;
                    border-color: rgba(14, 165, 233, 0.22) !important;
                }
            `}</style>
        </div>
    );
};
