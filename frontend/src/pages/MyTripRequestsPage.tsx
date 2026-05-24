import React, { useState, useEffect } from 'react';
import Navbar from '../components/layout/Navbar';
import { tripRequestApi } from '../api/tripRequest.api';
import type { ITripRequest } from '../api/tripRequest.api';
import { biddingApi } from '../api/bidding.api';
import { useAuthStore } from '../store/authStore';
import { Calendar, Clock, DollarSign, CheckCircle2, ChevronDown, ChevronUp, User } from 'lucide-react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';

export const MyTripRequestsPage = () => {
  const { accessToken, user } = useAuthStore();
  const [requests, setRequests] = useState<ITripRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [biddingsMap, setBiddingsMap] = useState<Record<string, any[]>>({});

  const fetchRequests = async () => {
    try {
      const res = await tripRequestApi.getMyRequests({ headers: { Authorization: `Bearer ${accessToken}` } });
      setRequests(res.data.result);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (accessToken && user?.role === 'tourist') {
      fetchRequests();
    } else {
      setLoading(false);
    }
  }, [accessToken, user]);

  const loadBiddings = async (requestId: string) => {
    if (expandedId === requestId) {
      setExpandedId(null);
      return;
    }
    
    setExpandedId(requestId);
    if (!biddingsMap[requestId]) {
      try {
        const res = await tripRequestApi.getById(requestId, { headers: { Authorization: `Bearer ${accessToken}` } });
        setBiddingsMap(prev => ({ ...prev, [requestId]: res.data.result.biddings }));
      } catch (err) {
        console.error(err);
      }
    }
  };

  const handleAccept = async (biddingId: string, requestId: string) => {
    if (!window.confirm('Bạn có chắc chắn muốn chọn Buddy này không? Hành động này sẽ đóng yêu cầu.')) return;
    try {
      await biddingApi.accept(biddingId, { headers: { Authorization: `Bearer ${accessToken}` } });
      toast.success('Đã chọn Buddy thành công!');
      fetchRequests();
      
      // Update local biddings status
      setBiddingsMap(prev => {
        const updated = (prev[requestId] || []).map(b => 
          b._id === biddingId ? { ...b, status: 'accepted' } : { ...b, status: 'rejected' }
        );
        return { ...prev, [requestId]: updated };
      });
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Có lỗi xảy ra');
    }
  };

  if (user?.role !== 'tourist') {
    return (
      <div style={{ minHeight: '100vh', background: 'var(--gradient-hero)', fontFamily: "'Inter', sans-serif" }}>
        <Navbar />
        <div style={{ textAlign: 'center', padding: '5rem', color: 'var(--color-text)' }}>
          <h2>Trang này chỉ dành cho Tourist</h2>
        </div>
      </div>
    );
  }

  const getStatusColor = (status: string) => {
    switch(status) {
      case 'open': return { bg: '#dbeafe', color: '#2563eb', label: 'Đang mở' };
      case 'assigned': return { bg: '#d1fae5', color: '#059669', label: 'Đã có Buddy' };
      case 'completed': return { bg: '#f3f4f6', color: '#4b5563', label: 'Hoàn thành' };
      case 'cancelled': return { bg: '#fee2e2', color: '#dc2626', label: 'Đã hủy' };
      default: return { bg: '#f3f4f6', color: '#4b5563', label: status };
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: 'var(--color-bg)', fontFamily: "'Inter', sans-serif", color: 'var(--color-text)' }}>
      <Navbar />
      
      <div style={{ maxWidth: '900px', margin: '0 auto', padding: '3rem 1.5rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
          <h1 style={{ fontSize: '2rem', fontWeight: 800, margin: 0, color: 'var(--color-text)' }}>Yêu Cầu Của Tôi</h1>
          <Link to="/trip-requests/new" style={{ padding: '0.75rem 1.5rem', background: 'var(--gradient-primary)', color: 'white', borderRadius: '12px', textDecoration: 'none', fontWeight: 600, boxShadow: 'var(--shadow-sm)' }}>
            + Tạo Yêu Cầu Mới
          </Link>
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '3rem' }}>Đang tải...</div>
        ) : requests.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '5rem', background: 'var(--color-surface)', borderRadius: '24px', border: '1px solid var(--color-border)' }}>
            <p style={{ fontSize: '1.2rem', color: 'var(--color-text-muted)' }}>Bạn chưa tạo yêu cầu chuyến đi nào.</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            {requests.map(req => {
              const statusCfg = getStatusColor(req.status);
              const isExpanded = expandedId === req._id;
              const biddings = biddingsMap[req._id] || [];

              return (
                <div key={req._id} style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: '20px', overflow: 'hidden', boxShadow: 'var(--shadow-sm)' }}>
                  {/* Header */}
                  <div style={{ padding: '1.5rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }} onClick={() => loadBiddings(req._id)}>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '0.5rem' }}>
                        <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 700 }}>{req.title}</h3>
                        <span style={{ background: statusCfg.bg, color: statusCfg.color, padding: '4px 12px', borderRadius: '999px', fontSize: '0.75rem', fontWeight: 700 }}>{statusCfg.label}</span>
                      </div>
                      
                      <div style={{ display: 'flex', gap: '1.5rem', color: 'var(--color-text-muted)', fontSize: '0.9rem' }}>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><Calendar size={14} /> {new Date(req.date).toLocaleDateString('vi-VN')}</span>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><Clock size={14} /> {req.time} ({req.durationHours}h)</span>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><DollarSign size={14} /> {req.budget.toLocaleString()} ₫</span>
                      </div>
                    </div>
                    
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                      {req.status === 'open' && (
                        <div style={{ background: 'var(--color-bg)', padding: '0.5rem 1rem', borderRadius: '10px', fontSize: '0.85rem', fontWeight: 600, color: 'var(--color-primary-dark)' }}>
                          {biddingsMap[req._id] ? biddings.length : '?'} Đề xuất
                        </div>
                      )}
                      <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: 'var(--color-bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-text-muted)' }}>
                        {isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                      </div>
                    </div>
                  </div>

                  {/* Expanded Biddings Area */}
                  {isExpanded && (
                    <div style={{ borderTop: '1px solid var(--color-border)', background: 'var(--color-bg)', padding: '1.5rem' }}>
                      <h4 style={{ margin: '0 0 1rem', fontSize: '1rem', fontWeight: 700 }}>Danh sách Buddy đề xuất ({biddings.length})</h4>
                      
                      {biddings.length === 0 ? (
                        <p style={{ margin: 0, color: 'var(--color-text-muted)', fontSize: '0.9rem', fontStyle: 'italic' }}>Chưa có Buddy nào gửi báo giá cho yêu cầu này.</p>
                      ) : (
                        <div style={{ display: 'grid', gap: '1rem' }}>
                          {biddings.map(bid => (
                            <div key={bid._id} style={{ background: 'var(--color-surface)', border: `1px solid ${bid.status === 'accepted' ? '#10b981' : 'var(--color-border)'}`, borderRadius: '16px', padding: '1.25rem', display: 'flex', gap: '1.5rem', opacity: bid.status === 'rejected' ? 0.6 : 1 }}>
                              <div style={{ width: '50px', height: '50px', borderRadius: '50%', background: 'var(--color-border)', overflow: 'hidden', flexShrink: 0 }}>
                                <img src={bid.buddyId?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(bid.buddyId?.name || 'B')}`} alt="avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                              </div>
                              
                              <div style={{ flex: 1 }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
                                  <div>
                                    <h5 style={{ margin: 0, fontSize: '1rem', fontWeight: 700 }}>
                                      <Link to={`/buddies/${bid.buddyId?._id}`} style={{ color: 'inherit', textDecoration: 'none' }}>{bid.buddyId?.name}</Link>
                                    </h5>
                                    <span style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>Đã gửi {new Date(bid.created_at).toLocaleDateString('vi-VN')}</span>
                                  </div>
                                  <div style={{ textAlign: 'right' }}>
                                    <div style={{ fontSize: '1.1rem', fontWeight: 800, color: '#059669' }}>{bid.offerPrice.toLocaleString()} ₫</div>
                                  </div>
                                </div>
                                
                                <p style={{ margin: '0 0 1rem', fontSize: '0.9rem', color: 'var(--color-text)', lineHeight: 1.5, background: 'var(--color-bg)', padding: '0.75rem', borderRadius: '8px' }}>
                                  {bid.proposal}
                                </p>

                                {req.status === 'open' && bid.status === 'pending' && (
                                  <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                                    <button onClick={() => handleAccept(bid._id, req._id)} style={{ padding: '0.6rem 1.5rem', background: '#10b981', color: 'white', border: 'none', borderRadius: '10px', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.4rem', transition: 'background 0.2s' }}
                                      onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = '#059669'; }}
                                      onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = '#10b981'; }}>
                                      <CheckCircle2 size={16} /> Chọn Buddy này
                                    </button>
                                  </div>
                                )}
                                
                                {bid.status === 'accepted' && (
                                  <div style={{ display: 'flex', justifyContent: 'flex-end', color: '#059669', fontWeight: 700, fontSize: '0.9rem', alignItems: 'center', gap: '4px' }}>
                                    <CheckCircle2 size={16} /> Đã chọn
                                  </div>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
