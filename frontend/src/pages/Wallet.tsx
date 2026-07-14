import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Navbar from '../components/layout/Navbar';
import { Landmark, CreditCard, ArrowRight, PlusCircle, Zap, Wallet as WalletIcon } from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import toast from 'react-hot-toast';

export const Wallet = () => {
    const { user, accessToken, fetchMe } = useAuthStore();
    const buddyId = user?._id;

    const [activeTab, setActiveTab] = useState<'withdraw' | 'deposit'>(() => {
        const params = new URLSearchParams(window.location.search);
        return params.get('tab') === 'deposit' || user?.role === 'tourist' ? 'deposit' : 'withdraw';
    });

    const [walletBalance, setWalletBalance] = useState(0);
    const [amount, setAmount] = useState('');
    const [bankCode, setBankCode] = useState('VCB');
    const [customBank, setCustomBank] = useState('');
    const [accountNumber, setAccountNumber] = useState('');
    const [accountName, setAccountName] = useState('');
    const [status, setStatus] = useState<'idle' | 'success' | 'error' | 'loading'>('idle');

    const [depositAmount, setDepositAmount] = useState('');
    const [depositMethod, setDepositMethod] = useState<'VNPAY' | 'BANK' | 'MOMO' | 'INSTANT'>('INSTANT');
    const [depositStatus, setDepositStatus] = useState<'idle' | 'success' | 'error' | 'loading'>('idle');

    useEffect(() => {
        if (buddyId && accessToken) {
            if (user?.role === 'buddy') {
                axios.get((import.meta.env.VITE_API_URL || 'http://localhost:3000') + '/buddy-profile/me', {
                    headers: { Authorization: `Bearer ${accessToken}` }
                })
                .then(res => {
                    if (res.data.data) {
                        setWalletBalance(res.data.data.walletBalance || 0);
                        if (res.data.data.payoutMethod) {
                            const bc = res.data.data.payoutMethod.bankCode || 'VCB';
                            if (!['VCB', 'TCB', 'MB', 'MOMO'].includes(bc)) {
                                setBankCode('OTHER');
                                setCustomBank(bc);
                            } else {
                                setBankCode(bc);
                            }
                            setAccountNumber(res.data.data.payoutMethod.accountNumber || '');
                            setAccountName(res.data.data.payoutMethod.accountName || '');
                        }
                    }
                })
                .catch(console.error);
            } else {
                axios.get((import.meta.env.VITE_API_URL || 'http://localhost:3000') + '/users/me', {
                    headers: { Authorization: `Bearer ${accessToken}` }
                })
                .then(res => {
                    if (res.data.result) {
                        setWalletBalance(res.data.result.walletBalance || 0);
                        if (res.data.result.refundPaymentMethod) {
                            const bc = res.data.result.refundPaymentMethod.bankCode || 'VCB';
                            if (!['VCB', 'TCB', 'MB', 'MOMO'].includes(bc)) {
                                setBankCode('OTHER');
                                setCustomBank(bc);
                            } else {
                                setBankCode(bc);
                            }
                            setAccountNumber(res.data.result.refundPaymentMethod.accountNumber || '');
                            setAccountName(res.data.result.refundPaymentMethod.accountName || '');
                        }
                    }
                })
                .catch(console.error);
            }
        }
    }, [buddyId, accessToken, user]);

    const handleWithdraw = (e: React.FormEvent) => {
        e.preventDefault();
        const withdrawAmount = Number(amount);
        if (withdrawAmount <= 0 || withdrawAmount > walletBalance) {
            setStatus('error');
            toast.error(withdrawAmount <= 0 ? 'Số tiền phải lớn hơn 0' : 'Số dư không đủ!');
            return;
        }
        if (bankCode === 'OTHER' && !customBank.trim()) {
            toast.error('Vui lòng nhập tên ngân hàng!');
            return;
        }
        const finalBankCode = bankCode === 'OTHER' ? customBank : bankCode;
        setStatus('loading');
        axios.post((import.meta.env.VITE_API_URL || 'http://localhost:3000') + '/payouts/request', { buddyId, amount: withdrawAmount, bankCode: finalBankCode, accountNumber, accountName }, {
            headers: { Authorization: `Bearer ${accessToken}` }
        })
            .then(() => {
                setStatus('success');
                toast.success('Yêu cầu rút tiền đã được gửi thành công!');
                setWalletBalance(prev => prev - withdrawAmount);
                setAmount('');
            })
            .catch((err: any) => {
                setStatus('error');
                toast.error(err.response?.data?.message || err.message || 'Giao dịch thất bại. MongoDB Transaction đã rollback.');
            })
            .finally(() => {
                setStatus('idle');
            });
    };

    const handleDeposit = (e: React.FormEvent) => {
        e.preventDefault();
        const depAmount = Number(depositAmount);
        if (depAmount <= 0) {
            toast.error('Số tiền nạp phải lớn hơn 0');
            return;
        }
        setDepositStatus('loading');
        axios.post((import.meta.env.VITE_API_URL || 'http://localhost:3000') + '/payouts/deposit', {
            userId: buddyId,
            amount: depAmount,
            method: depositMethod
        }, {
            headers: { Authorization: `Bearer ${accessToken}` }
        })
            .then(res => {
                setDepositStatus('success');
                toast.success(`🎉 Nạp thành công ${depAmount.toLocaleString('vi-VN')} ₫ vào ví UniTravel!`);
                if (res.data.data?.walletBalance !== undefined) {
                    setWalletBalance(res.data.data.walletBalance);
                } else {
                    setWalletBalance(prev => prev + depAmount);
                }
                fetchMe();
                setDepositAmount('');
            })
            .catch((err: any) => {
                setDepositStatus('error');
                toast.error(err.response?.data?.message || 'Nạp tiền thất bại, vui lòng thử lại');
            })
            .finally(() => {
                setDepositStatus('idle');
            });
    };


    const inputStyle: React.CSSProperties = {
        width: '100%', boxSizing: 'border-box',
        background: '#ffffff',
        border: '1px solid #cbd5e1',
        borderRadius: '12px', padding: '0.875rem 0.875rem 0.875rem 2.5rem',
        color: '#0f172a', fontSize: '0.9rem', outline: 'none', fontFamily: 'inherit',
    };

    const labelStyle: React.CSSProperties = {
        display: 'block', color: '#475569',
        fontSize: '0.72rem', fontWeight: 700,
        textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.5rem',
    };

    return (
        <div style={{ minHeight: '100vh', background: 'var(--color-bg)', fontFamily: "'Inter', -apple-system, sans-serif" }}>
            <Navbar />
            <div style={{ maxWidth: '900px', margin: '0 auto', padding: '7.5rem 1.5rem 3.5rem' }}>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.4fr', gap: '2rem', alignItems: 'start' }}>

                    {/* Left: Credit Card */}
                    <div>
                        <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#0f172a', marginBottom: '1.5rem', letterSpacing: '-0.02em' }}>Ví của tôi</h2>

                        {/* Premium card - White minimalist style */}
                        <div style={{
                            background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
                            borderRadius: '24px', padding: '2rem', aspectRatio: '1.58',
                            position: 'relative', overflow: 'hidden',
                            boxShadow: '0 15px 35px rgba(2, 132, 199, 0.08)',
                            border: '1px solid rgba(14, 165, 233, 0.18)',
                            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                            cursor: 'default',
                            display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
                        }}
                            onMouseEnter={e => {
                                e.currentTarget.style.transform = 'translateY(-6px)';
                                e.currentTarget.style.boxShadow = '0 20px 40px rgba(2, 132, 199, 0.12)';
                                e.currentTarget.style.borderColor = 'rgba(14, 165, 233, 0.3)';
                            }}
                            onMouseLeave={e => {
                                e.currentTarget.style.transform = 'translateY(0)';
                                e.currentTarget.style.boxShadow = '0 15px 35px rgba(2, 132, 199, 0.08)';
                                e.currentTarget.style.borderColor = 'rgba(14, 165, 233, 0.18)';
                            }}
                        >
                            {/* Decorative clean waves */}
                            <div style={{ position: 'absolute', top: '-3rem', right: '-3rem', width: '12rem', height: '12rem', background: 'rgba(14, 165, 233, 0.04)', borderRadius: '50%' }} />
                            <div style={{ position: 'absolute', bottom: '-4rem', left: '-2rem', width: '10rem', height: '10rem', background: 'rgba(14, 165, 233, 0.03)', borderRadius: '50%' }} />

                            {/* Brand and Chip */}
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'relative', zIndex: 1 }}>
                                <span style={{ fontFamily: 'monospace', fontWeight: 800, fontSize: '1rem', color: '#0284c7', letterSpacing: '0.12em' }}>UNITRAVEL</span>
                                {/* Golden/Amber Premium Chip */}
                                <div style={{
                                    width: '38px', height: '28px',
                                    background: 'linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%)',
                                    borderRadius: '6px',
                                    boxShadow: '0 2px 6px rgba(245, 158, 11, 0.2)',
                                    position: 'relative'
                                }}>
                                    <div style={{ position: 'absolute', top: '4px', left: '6px', right: '6px', bottom: '4px', border: '1px solid rgba(255,255,255,0.4)', borderRadius: '3px' }} />
                                </div>
                            </div>

                            <div style={{ position: 'relative', zIndex: 1 }}>
                                <p style={{ color: '#64748b', fontSize: '0.72rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '0.4rem' }}>Số dư khả dụng</p>
                                <h3 style={{ fontSize: '2.25rem', fontWeight: 900, color: '#0f172a', margin: 0, letterSpacing: '-0.02em', display: 'flex', alignItems: 'baseline', gap: '4px' }}>
                                    <span style={{ background: 'var(--gradient-text)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
                                        {walletBalance.toLocaleString('vi-VN')}
                                    </span>
                                    <span style={{ fontSize: '1.25rem', fontWeight: 700, color: '#0284c7' }}>₫</span>
                                </h3>
                            </div>

                            <div style={{ display: 'flex', justifyContent: 'space-between', position: 'relative', zIndex: 1 }}>
                                <div>
                                    <p style={{ color: '#94a3b8', fontSize: '0.6rem', textTransform: 'uppercase', fontWeight: 600, letterSpacing: '0.08em' }}>Chủ thẻ</p>
                                    <p style={{ color: '#334155', fontSize: '0.8rem', fontWeight: 700, fontFamily: 'monospace', marginTop: '0.2rem' }}>
                                        {user?.name?.toUpperCase() || (user?.role === 'buddy' ? 'BUDDY MEMBER' : 'TOURIST MEMBER')}
                                    </p>
                                </div>
                                <div style={{ textAlign: 'right' }}>
                                    <p style={{ color: '#94a3b8', fontSize: '0.6rem', textTransform: 'uppercase', fontWeight: 600, letterSpacing: '0.08em' }}>Hạn dùng</p>
                                    <p style={{ color: '#334155', fontSize: '0.8rem', fontWeight: 700, fontFamily: 'monospace', marginTop: '0.2rem' }}>12/30</p>
                                </div>
                            </div>
                        </div>

                        {/* Summary card */}
                        {user?.role === 'buddy' ? (
                            <div style={{ background: '#ffffff', border: '1px solid rgba(14,165,233,0.12)', borderRadius: '16px', padding: '1.25rem', marginTop: '1.25rem', display: 'flex', alignItems: 'center', gap: '1rem', boxShadow: '0 4px 20px rgba(0,0,0,0.02)' }}>
                                <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: 'rgba(16,185,129,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                    <ArrowRight size={18} style={{ color: '#10b981' }} />
                                </div>
                                <div style={{ flex: 1 }}>
                                    <p style={{ fontSize: '0.8rem', fontWeight: 600, color: '#0f172a', margin: 0 }}>Thu nhập tháng này</p>
                                    <p style={{ fontSize: '0.72rem', color: '#64748b', margin: '0.15rem 0 0' }}>Từ các tour hoàn thành</p>
                                </div>
                                <span style={{ color: '#10b981', fontWeight: 700, fontSize: '0.9rem' }}>+850,000 ₫</span>
                            </div>
                        ) : (
                            <div style={{ background: '#ffffff', border: '1px solid rgba(14,165,233,0.12)', borderRadius: '16px', padding: '1.25rem', marginTop: '1.25rem', display: 'flex', alignItems: 'center', gap: '1rem', boxShadow: '0 4px 20px rgba(0,0,0,0.02)' }}>
                                <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: 'rgba(2,132,199,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                    <ArrowRight size={18} style={{ color: '#0284c7' }} />
                                </div>
                                <div style={{ flex: 1 }}>
                                    <p style={{ fontSize: '0.8rem', fontWeight: 600, color: '#0f172a', margin: 0 }}>Số dư hoàn tiền khả dụng</p>
                                    <p style={{ fontSize: '0.72rem', color: '#64748b', margin: '0.15rem 0 0' }}>Từ chính sách hoàn hủy 100%</p>
                                </div>
                                <span style={{ color: '#0284c7', fontWeight: 700, fontSize: '0.9rem' }}>{walletBalance.toLocaleString('vi-VN')} ₫</span>
                            </div>
                        )}
                    </div>

                    {/* Right: Tabs & Form */}
                    <div style={{ background: '#ffffff', border: '1px solid rgba(14,165,233,0.12)', borderRadius: '24px', padding: '2rem', boxShadow: '0 10px 30px rgba(2,132,199,0.04)' }}>
                        {/* Tab Switcher */}
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', background: '#f1f5f9', padding: '6px', borderRadius: '16px', marginBottom: '1.75rem' }}>
                            <button
                                type="button"
                                onClick={() => setActiveTab('deposit')}
                                style={{
                                    padding: '0.75rem',
                                    borderRadius: '12px',
                                    border: 'none',
                                    background: activeTab === 'deposit' ? 'white' : 'transparent',
                                    color: activeTab === 'deposit' ? '#0284c7' : '#64748b',
                                    fontWeight: 700,
                                    fontSize: '0.9rem',
                                    cursor: 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    gap: '6px',
                                    boxShadow: activeTab === 'deposit' ? '0 4px 12px rgba(2,132,199,0.15)' : 'none',
                                    transition: 'all 0.2s'
                                }}
                            >
                                <PlusCircle size={17} /> Nạp tiền vào ví
                            </button>
                            <button
                                type="button"
                                onClick={() => setActiveTab('withdraw')}
                                style={{
                                    padding: '0.75rem',
                                    borderRadius: '12px',
                                    border: 'none',
                                    background: activeTab === 'withdraw' ? 'white' : 'transparent',
                                    color: activeTab === 'withdraw' ? '#0f172a' : '#64748b',
                                    fontWeight: 700,
                                    fontSize: '0.9rem',
                                    cursor: 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    gap: '6px',
                                    boxShadow: activeTab === 'withdraw' ? '0 4px 12px rgba(0,0,0,0.08)' : 'none',
                                    transition: 'all 0.2s'
                                }}
                            >
                                <WalletIcon size={17} /> {user?.role === 'buddy' ? 'Rút tiền' : 'Rút tiền hoàn'}
                            </button>
                        </div>

                        {activeTab === 'deposit' ? (
                            /* DEPOSIT FORM */
                            <div>
                                <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#0f172a', margin: '0 0 0.375rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    Nạp số dư vào ví UniTravel
                                </h3>
                                <p style={{ color: '#64748b', fontSize: '0.85rem', marginBottom: '1.5rem' }}>
                                    Nạp tiền nhanh chóng để thanh toán tour, gia hạn ngoài giờ và trải nghiệm không gián đoạn
                                </p>

                                <form onSubmit={handleDeposit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                                    {/* Method */}
                                    <div>
                                        <label style={labelStyle}>Phương thức nạp tiền</label>
                                        <div style={{ position: 'relative' }}>
                                            <Zap size={16} style={{ position: 'absolute', left: '0.875rem', top: '50%', transform: 'translateY(-50%)', color: '#0284c7' }} />
                                            <select value={depositMethod} onChange={e => setDepositMethod(e.target.value as any)}
                                                style={{ ...inputStyle, appearance: 'none', background: 'white' }}>
                                                <option value='INSTANT'>⚡ Nạp nhanh trực tiếp vào ví (Chế độ tiện lợi)</option>
                                                <option value='VNPAY'>Cổng thanh toán VNPay (Ngân hàng / ATM / QR)</option>
                                                <option value='BANK'>Chuyển khoản Ngân hàng (Vietcombank / MB / TCB)</option>
                                                <option value='MOMO'>Ví điện tử MoMo</option>
                                            </select>
                                        </div>
                                    </div>

                                    {/* Amount */}
                                    <div>
                                        <label style={labelStyle}>Số tiền muốn nạp (VND)</label>
                                        <div style={{ position: 'relative', marginBottom: '0.75rem' }}>
                                            <span style={{ position: 'absolute', left: '0.875rem', top: '50%', transform: 'translateY(-50%)', color: '#0284c7', fontWeight: 700, fontSize: '1.1rem' }}>₫</span>
                                            <input required type='number' value={depositAmount} onChange={e => setDepositAmount(e.target.value)} placeholder='500000'
                                                style={{ ...inputStyle, padding: '1rem 0.875rem 1rem 2.5rem', fontSize: '1.25rem', fontWeight: 700 }} />
                                        </div>

                                        {/* Quick amount pills */}
                                        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                                            {[100000, 200000, 500000, 1000000, 2000000].map((quickAmt) => (
                                                <button
                                                    key={quickAmt}
                                                    type="button"
                                                    onClick={() => setDepositAmount(String(quickAmt))}
                                                    style={{
                                                        padding: '6px 12px',
                                                        borderRadius: '8px',
                                                        border: '1px solid #e2e8f0',
                                                        background: depositAmount === String(quickAmt) ? '#e0f2fe' : '#f8fafc',
                                                        color: depositAmount === String(quickAmt) ? '#0284c7' : '#475569',
                                                        fontWeight: 700,
                                                        fontSize: '0.8rem',
                                                        cursor: 'pointer',
                                                        transition: 'all 0.2s'
                                                    }}
                                                >
                                                    + {quickAmt.toLocaleString('vi-VN')} ₫
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    <button type='submit' disabled={depositStatus === 'loading'}
                                        style={{ width: '100%', background: 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)', border: 'none', borderRadius: '12px', padding: '1rem', color: 'white', fontWeight: 700, fontSize: '0.95rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', boxShadow: '0 6px 20px rgba(2,132,199,0.3)', fontFamily: 'inherit', opacity: depositStatus === 'loading' ? 0.7 : 1 }}>
                                        {depositStatus === 'loading' ? (
                                            <><div style={{ width: '16px', height: '16px', border: '2px solid rgba(255,255,255,0.3)', borderTopColor: 'white', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} /> Đang nạp tiền...</>
                                        ) : (
                                            <><PlusCircle size={18} /> Xác nhận nạp tiền ngay</>
                                        )}
                                    </button>

                                    <p style={{ textAlign: 'center', color: '#94a3b8', fontSize: '0.72rem', margin: 0 }}>
                                        ⚡ Số dư được cập nhật lập tức và an toàn vào tài khoản của bạn
                                    </p>
                                </form>
                            </div>
                        ) : (
                            /* WITHDRAW FORM */
                            <div>
                                <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#0f172a', margin: '0 0 0.375rem' }}>
                                    {user?.role === 'buddy' ? 'Rút tiền' : 'Rút tiền hoàn'}
                                </h3>
                                <p style={{ color: '#64748b', fontSize: '0.85rem', marginBottom: '1.75rem' }}>
                                    {user?.role === 'buddy' ? 'Chuyển thu nhập về tài khoản ngân hàng của bạn' : 'Yêu cầu chuyển số dư ví về tài khoản ngân hàng của bạn'}
                                </p>

                                <form onSubmit={handleWithdraw} style={{ display: 'flex', flexDirection: 'column', gap: '1.1rem' }}>
                                    {/* Bank */}
                                    <div>
                                        <label style={labelStyle}>Ngân hàng</label>
                                        <div style={{ position: 'relative' }}>
                                            <Landmark size={16} style={{ position: 'absolute', left: '0.875rem', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                                            <select value={bankCode} onChange={e => setBankCode(e.target.value)}
                                                style={{ ...inputStyle, appearance: 'none', background: 'white' }}>
                                                <option value='VCB'>Vietcombank</option>
                                                <option value='TCB'>Techcombank</option>
                                                <option value='MB'>MB Bank</option>
                                                <option value='MOMO'>MoMo Wallet</option>
                                                <option value='OTHER'>Khác...</option>
                                            </select>
                                        </div>
                                        {bankCode === 'OTHER' && (
                                            <div style={{ marginTop: '0.875rem' }}>
                                                <input required type='text' value={customBank} onChange={e => setCustomBank(e.target.value)} placeholder='Nhập tên ngân hàng hoặc ví...' style={inputStyle} />
                                            </div>
                                        )}
                                    </div>

                                    {/* Account number & name */}
                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.875rem' }}>
                                        <div>
                                            <label style={labelStyle}>Số tài khoản</label>
                                            <div style={{ position: 'relative' }}>
                                                <CreditCard size={15} style={{ position: 'absolute', left: '0.875rem', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                                                <input required type='text' value={accountNumber} onChange={e => setAccountNumber(e.target.value)} placeholder='0123456789' style={{ ...inputStyle, fontFamily: 'monospace' }} />
                                            </div>
                                        </div>
                                        <div>
                                            <label style={labelStyle}>Tên tài khoản</label>
                                            <div style={{ position: 'relative' }}>
                                                <span style={{ position: 'absolute', left: '0.875rem', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8', fontSize: '0.8rem' }}>👤</span>
                                                <input required type='text' value={accountName} onChange={e => setAccountName(e.target.value)} placeholder='NGUYEN VAN A' style={{ ...inputStyle, textTransform: 'uppercase' }} />
                                            </div>
                                        </div>
                                    </div>

                                    {/* Amount */}
                                    <div>
                                        <label style={labelStyle}>Số tiền rút (VND)</label>
                                        <div style={{ position: 'relative' }}>
                                            <span style={{ position: 'absolute', left: '0.875rem', top: '50%', transform: 'translateY(-50%)', color: '#0284c7', fontWeight: 700, fontSize: '1.1rem' }}>₫</span>
                                            <input required type='number' value={amount} onChange={e => setAmount(e.target.value)} placeholder='500000'
                                                style={{ ...inputStyle, padding: '1rem 0.875rem 1rem 2.5rem', fontSize: '1.25rem', fontWeight: 700 }} />
                                        </div>
                                    </div>

                                    <button type='submit' disabled={status === 'loading'}
                                        style={{ width: '100%', background: 'var(--gradient-primary)', border: 'none', borderRadius: '12px', padding: '1rem', color: 'white', fontWeight: 700, fontSize: '0.95rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', boxShadow: '0 6px 20px rgba(2,132,199,0.25)', fontFamily: 'inherit', opacity: status === 'loading' ? 0.7 : 1 }}>
                                        {status === 'loading' ? (
                                            <><div style={{ width: '16px', height: '16px', border: '2px solid rgba(255,255,255,0.3)', borderTopColor: 'white', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} /> Đang xử lý...</>
                                        ) : 'Xác nhận rút tiền'}
                                    </button>

                                    <p style={{ textAlign: 'center', color: '#94a3b8', fontSize: '0.72rem', margin: 0 }}>
                                        🔒 Bảo vệ bởi MongoDB Transactions
                                    </p>
                                </form>
                            </div>
                        )}
                    </div>
                </div>
            </div>
            <style>{`@keyframes spin { to { transform: rotate(360deg) } } select { background: white; }`}</style>
        </div>
    );
};
