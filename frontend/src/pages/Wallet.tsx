import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Navbar from '../components/layout/Navbar';
import { Landmark, CreditCard, ArrowRight, CheckCircle } from 'lucide-react';
import { useAuthStore } from '../store/authStore';

export const Wallet = () => {
    const { user, accessToken } = useAuthStore();
    const buddyId = user?._id;

    const [walletBalance, setWalletBalance] = useState(0);
    const [amount, setAmount] = useState('');
    const [bankCode, setBankCode] = useState('VCB');
    const [accountNumber, setAccountNumber] = useState('');
    const [accountName, setAccountName] = useState('');
    const [status, setStatus] = useState<'idle' | 'success' | 'error' | 'loading'>('idle');
    const [statusMsg, setStatusMsg] = useState('');

    useEffect(() => {
        if (buddyId && accessToken && user?.role === 'buddy') {
            axios.get('http://localhost:3000/buddy-profile/me', {
                headers: { Authorization: `Bearer ${accessToken}` }
            })
            .then(res => {
                if (res.data.data) {
                    setWalletBalance(res.data.data.walletBalance || 0);
                    if (res.data.data.payoutMethod) {
                        setBankCode(res.data.data.payoutMethod.bankCode || 'VCB');
                        setAccountNumber(res.data.data.payoutMethod.accountNumber || '');
                        setAccountName(res.data.data.payoutMethod.accountName || '');
                    }
                }
            })
            .catch(console.error);
        }
    }, [buddyId, accessToken, user]);

    const handleWithdraw = (e: React.FormEvent) => {
        e.preventDefault();
        const withdrawAmount = Number(amount);
        if (withdrawAmount <= 0 || withdrawAmount > walletBalance) {
            setStatus('error');
            setStatusMsg(withdrawAmount <= 0 ? 'Số tiền phải lớn hơn 0' : 'Số dư không đủ!');
            return;
        }
        setStatus('loading');
        axios.post('http://localhost:3000/payouts/request', { buddyId, amount: withdrawAmount, bankCode, accountNumber, accountName }, {
            headers: { Authorization: `Bearer ${accessToken}` }
        })
            .then(() => {
                setStatus('success');
                setStatusMsg('Yêu cầu rút tiền đã được gửi thành công!');
                setWalletBalance(prev => prev - withdrawAmount);
                setAmount('');
            })
            .catch(() => {
                setStatus('error');
                setStatusMsg('Giao dịch thất bại. MongoDB Transaction đã rollback.');
            });
    };

    const inputStyle: React.CSSProperties = {
        width: '100%', boxSizing: 'border-box',
        background: 'rgba(255,255,255,0.06)',
        border: '1px solid rgba(255,255,255,0.1)',
        borderRadius: '12px', padding: '0.875rem 0.875rem 0.875rem 2.5rem',
        color: 'white', fontSize: '0.9rem', outline: 'none', fontFamily: 'inherit',
    };

    const labelStyle: React.CSSProperties = {
        display: 'block', color: 'rgba(255,255,255,0.5)',
        fontSize: '0.72rem', fontWeight: 700,
        textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.5rem',
    };

    return (
        <div style={{ minHeight: '100vh', background: 'linear-gradient(180deg, #0f0c29 0%, #1a1040 60%, #0d1117 100%)', fontFamily: "'Inter', -apple-system, sans-serif" }}>
            <Navbar />
            <div style={{ maxWidth: '900px', margin: '0 auto', padding: '2.5rem 1.5rem' }}>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.4fr', gap: '2rem', alignItems: 'start' }}>

                    {/* Left: Credit Card */}
                    <div>
                        <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'white', marginBottom: '1.5rem', letterSpacing: '-0.02em' }}>Ví của tôi</h2>

                        {/* Premium card */}
                        <div style={{
                            background: 'linear-gradient(135deg, #1e1b4b 0%, #312e81 40%, #4c1d95 100%)',
                            borderRadius: '24px', padding: '2rem', aspectRatio: '1.58',
                            position: 'relative', overflow: 'hidden',
                            boxShadow: '0 20px 60px rgba(139,92,246,0.4)',
                            border: '1px solid rgba(255,255,255,0.1)',
                            transition: 'transform 0.3s',
                            cursor: 'default',
                            display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
                        }}
                            onMouseEnter={e => (e.currentTarget.style.transform = 'translateY(-6px) rotateX(2deg)')}
                            onMouseLeave={e => (e.currentTarget.style.transform = 'translateY(0) rotateX(0)')}
                        >
                            {/* Decorative circles */}
                            <div style={{ position: 'absolute', top: '-3rem', right: '-3rem', width: '12rem', height: '12rem', background: 'rgba(255,255,255,0.06)', borderRadius: '50%' }} />
                            <div style={{ position: 'absolute', bottom: '-4rem', left: '-2rem', width: '10rem', height: '10rem', background: 'rgba(167,139,250,0.1)', borderRadius: '50%' }} />

                            <div style={{ position: 'relative', zIndex: 1 }}>
                                <span style={{ fontFamily: 'monospace', fontWeight: 700, fontSize: '1rem', color: 'rgba(255,255,255,0.6)', letterSpacing: '0.1em' }}>UNITRAVEL</span>
                            </div>

                            <div style={{ position: 'relative', zIndex: 1 }}>
                                <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.7rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '0.4rem' }}>Số dư khả dụng</p>
                                <h3 style={{ fontSize: '2.25rem', fontWeight: 800, color: 'white', margin: 0, textShadow: '0 2px 8px rgba(0,0,0,0.3)' }}>
                                    {walletBalance.toLocaleString('vi-VN')} ₫
                                </h3>
                            </div>

                            <div style={{ display: 'flex', justifyContent: 'space-between', position: 'relative', zIndex: 1 }}>
                                <div>
                                    <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.6rem', textTransform: 'uppercase', fontWeight: 600, letterSpacing: '0.08em' }}>Card Holder</p>
                                    <p style={{ color: 'white', fontSize: '0.8rem', fontWeight: 600, fontFamily: 'monospace', marginTop: '0.2rem' }}>BUDDY MEMBER</p>
                                </div>
                                <div style={{ textAlign: 'right' }}>
                                    <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.6rem', textTransform: 'uppercase', fontWeight: 600, letterSpacing: '0.08em' }}>Valid Thru</p>
                                    <p style={{ color: 'white', fontSize: '0.8rem', fontWeight: 600, fontFamily: 'monospace', marginTop: '0.2rem' }}>12/30</p>
                                </div>
                            </div>
                        </div>

                        {/* Summary card */}
                        <div style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '16px', padding: '1.25rem', marginTop: '1.25rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                            <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: 'rgba(16,185,129,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                <ArrowRight size={18} style={{ color: '#34d399' }} />
                            </div>
                            <div style={{ flex: 1 }}>
                                <p style={{ fontSize: '0.8rem', fontWeight: 600, color: 'rgba(255,255,255,0.7)', margin: 0 }}>Thu nhập tháng này</p>
                                <p style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.3)', margin: '0.15rem 0 0' }}>Từ 5 tour thành công</p>
                            </div>
                            <span style={{ color: '#34d399', fontWeight: 700, fontSize: '0.9rem' }}>+850,000 ₫</span>
                        </div>
                    </div>

                    {/* Right: Form */}
                    <div style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '24px', padding: '2rem' }}>
                        <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'white', margin: '0 0 0.375rem' }}>Rút tiền</h3>
                        <p style={{ color: 'rgba(255,255,255,0.35)', fontSize: '0.85rem', marginBottom: '1.75rem' }}>Chuyển thu nhập về tài khoản ngân hàng của bạn</p>

                        <form onSubmit={handleWithdraw} style={{ display: 'flex', flexDirection: 'column', gap: '1.1rem' }}>
                            {/* Bank */}
                            <div>
                                <label style={labelStyle}>Ngân hàng</label>
                                <div style={{ position: 'relative' }}>
                                    <Landmark size={16} style={{ position: 'absolute', left: '0.875rem', top: '50%', transform: 'translateY(-50%)', color: 'rgba(255,255,255,0.3)' }} />
                                    <select value={bankCode} onChange={e => setBankCode(e.target.value)}
                                        style={{ ...inputStyle, appearance: 'none' }}>
                                        <option value='VCB'>Vietcombank</option>
                                        <option value='TCB'>Techcombank</option>
                                        <option value='MB'>MB Bank</option>
                                        <option value='MOMO'>MoMo Wallet</option>
                                    </select>
                                </div>
                            </div>

                            {/* Account number & name */}
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.875rem' }}>
                                <div>
                                    <label style={labelStyle}>Số tài khoản</label>
                                    <div style={{ position: 'relative' }}>
                                        <CreditCard size={15} style={{ position: 'absolute', left: '0.875rem', top: '50%', transform: 'translateY(-50%)', color: 'rgba(255,255,255,0.3)' }} />
                                        <input required type='text' value={accountNumber} onChange={e => setAccountNumber(e.target.value)} placeholder='0123456789' style={{ ...inputStyle, fontFamily: 'monospace' }} />
                                    </div>
                                </div>
                                <div>
                                    <label style={labelStyle}>Tên tài khoản</label>
                                    <div style={{ position: 'relative' }}>
                                        <span style={{ position: 'absolute', left: '0.875rem', top: '50%', transform: 'translateY(-50%)', color: 'rgba(255,255,255,0.3)', fontSize: '0.8rem' }}>👤</span>
                                        <input required type='text' value={accountName} onChange={e => setAccountName(e.target.value)} placeholder='NGUYEN VAN A' style={{ ...inputStyle, textTransform: 'uppercase' }} />
                                    </div>
                                </div>
                            </div>

                            {/* Amount */}
                            <div>
                                <label style={labelStyle}>Số tiền rút (VND)</label>
                                <div style={{ position: 'relative' }}>
                                    <span style={{ position: 'absolute', left: '0.875rem', top: '50%', transform: 'translateY(-50%)', color: '#a78bfa', fontWeight: 700, fontSize: '1.1rem' }}>₫</span>
                                    <input required type='number' value={amount} onChange={e => setAmount(e.target.value)} placeholder='500000'
                                        style={{ ...inputStyle, padding: '1rem 0.875rem 1rem 2.5rem', fontSize: '1.25rem', fontWeight: 700 }} />
                                </div>
                            </div>

                            {/* Status */}
                            {status === 'success' && (
                                <div style={{ background: 'rgba(16,185,129,0.15)', border: '1px solid rgba(16,185,129,0.3)', borderRadius: '10px', padding: '0.875rem', display: 'flex', alignItems: 'center', gap: '0.6rem', color: '#6ee7b7', fontSize: '0.875rem' }}>
                                    <CheckCircle size={16} /> {statusMsg}
                                </div>
                            )}
                            {status === 'error' && (
                                <div style={{ background: 'rgba(239,68,68,0.15)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: '10px', padding: '0.875rem', color: '#fca5a5', fontSize: '0.875rem' }}>
                                    {statusMsg}
                                </div>
                            )}

                            <button type='submit' disabled={status === 'loading'}
                                style={{ width: '100%', background: 'linear-gradient(135deg, #1e1b4b, #312e81)', border: '1px solid rgba(139,92,246,0.3)', borderRadius: '12px', padding: '1rem', color: 'white', fontWeight: 700, fontSize: '0.95rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', boxShadow: '0 4px 20px rgba(0,0,0,0.3)', fontFamily: 'inherit', opacity: status === 'loading' ? 0.7 : 1 }}>
                                {status === 'loading' ? (
                                    <><div style={{ width: '16px', height: '16px', border: '2px solid rgba(255,255,255,0.3)', borderTopColor: 'white', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} /> Đang xử lý...</>
                                ) : 'Xác nhận rút tiền'}
                            </button>

                            <p style={{ textAlign: 'center', color: 'rgba(255,255,255,0.2)', fontSize: '0.72rem', margin: 0 }}>
                                🔒 Bảo vệ bởi MongoDB Transactions
                            </p>
                        </form>
                    </div>
                </div>
            </div>
            <style>{`@keyframes spin { to { transform: rotate(360deg) } } select option { background: #1e1b4b; }`}</style>
        </div>
    );
};
