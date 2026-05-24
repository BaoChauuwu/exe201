import { useState, useEffect } from 'react';
import Navbar from '../components/layout/Navbar';
import { tripRequestApi } from '../api/tripRequest.api';
import type { ITripRequest } from '../api/tripRequest.api';
import { biddingApi } from '../api/bidding.api';
import { useAuthStore } from '../store/authStore';
import { MapPin, Calendar, Clock, DollarSign, Search } from 'lucide-react';

export const TripRequestsPage = () => {
  const { accessToken, user } = useAuthStore();
  const [requests, setRequests] = useState<ITripRequest[]>([]);
  const [myBiddings, setMyBiddings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedRequest, setSelectedRequest] = useState<ITripRequest | null>(null);
  
  // Bidding state
  const [offerPrice, setOfferPrice] = useState<number>(0);
  const [proposal, setProposal] = useState('');
  const [biddingLoading, setBiddingLoading] = useState(false);
  const [message, setMessage] = useState('');

  const fetchRequests = async () => {
    try {
      const [reqRes, bidRes] = await Promise.all([
        tripRequestApi.getOpenRequests({ headers: { Authorization: `Bearer ${accessToken}` } }),
        biddingApi.getMyBiddings({ headers: { Authorization: `Bearer ${accessToken}` } })
      ]);
      setRequests(reqRes.data.result);
      setMyBiddings(bidRes.data.result);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (accessToken && user?.role === 'buddy') {
      fetchRequests();
    } else {
      setLoading(false);
    }
  }, [accessToken, user]);

  const handleBidding = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRequest) return;
    
    setBiddingLoading(true);
    setMessage('');
    try {
      await biddingApi.create({
        tripRequestId: selectedRequest._id,
        offerPrice,
        proposal
      }, { headers: { Authorization: `Bearer ${accessToken}` } });
      
      setMessage('Gửi đề xuất thành công!');
      setTimeout(() => {
        setSelectedRequest(null);
        setMessage('');
        fetchRequests(); // Refresh list to maybe hide or update status (though it stays open until accepted)
      }, 2000);
    } catch (err: any) {
      setMessage(err.response?.data?.message || 'Có lỗi xảy ra');
    } finally {
      setBiddingLoading(false);
    }
  };

  if (user?.role !== 'buddy') {
    return (
      <div style={{ minHeight: '100vh', background: 'var(--gradient-hero)', fontFamily: "'Inter', sans-serif" }}>
        <Navbar />
        <div style={{ textAlign: 'center', padding: '5rem', color: 'var(--color-text)' }}>
          <h2>Trang này chỉ dành cho Local Buddy</h2>
        </div>
      </div>
    );
  }

  const badgeStyle = {
    background: 'rgba(99,102,241,0.1)', color: 'var(--color-primary-dark)', padding: '4px 10px',
    borderRadius: '999px', fontSize: '0.75rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px'
  };

  return (
    <div style={{ minHeight: '100vh', background: 'var(--color-bg)', fontFamily: "'Inter', sans-serif", color: 'var(--color-text)' }}>
      <Navbar />
      
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '3rem 1.5rem' }}>
        <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
          <h1 style={{ fontSize: '2.5rem', fontWeight: 800, margin: '0 0 1rem', background: 'var(--gradient-primary)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            Bảng Yêu Cầu Từ Khách Hàng
          </h1>
          <p style={{ color: 'var(--color-text-muted)', fontSize: '1.1rem', maxWidth: '600px', margin: '0 auto' }}>
            Xem các yêu cầu chuyến đi và gửi báo giá của bạn (Bidding) để nhận kèo.
          </p>
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '3rem' }}>Đang tải...</div>
        ) : requests.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '5rem', background: 'var(--color-surface)', borderRadius: '24px', border: '1px solid var(--color-border)' }}>
            <Search size={48} style={{ opacity: 0.3, margin: '0 auto 1rem', color: 'var(--color-text-muted)' }} />
            <p style={{ fontSize: '1.2rem', color: 'var(--color-text-muted)' }}>Hiện chưa có yêu cầu nào đang mở.</p>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '1.5rem' }}>
            {requests.map(req => (
              <div key={req._id} style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: '20px', padding: '1.5rem', boxShadow: 'var(--shadow-sm)', transition: 'all 0.2s', display: 'flex', flexDirection: 'column' }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = 'var(--color-primary)'; (e.currentTarget as HTMLElement).style.transform = 'translateY(-3px)'; }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = 'var(--color-border)'; (e.currentTarget as HTMLElement).style.transform = 'translateY(0)'; }}>
                
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
                  <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'var(--color-border)', overflow: 'hidden' }}>
                    <img src={req.touristId?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(req.touristId?.name || 'T')}`} alt="avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  </div>
                  <div>
                    <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 700 }}>{req.title}</h3>
                    <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>Bởi {req.touristId?.name}</p>
                  </div>
                </div>

                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '1rem' }}>
                  <span style={badgeStyle}><Calendar size={14} /> {new Date(req.date).toLocaleDateString('vi-VN')}</span>
                  <span style={badgeStyle}><Clock size={14} /> {req.time} ({req.durationHours}h)</span>
                  <span style={{ ...badgeStyle, background: 'rgba(16,185,129,0.1)', color: '#059669' }}><DollarSign size={14} /> {req.budget.toLocaleString()} ₫</span>
                  <span style={badgeStyle}><MapPin size={14} /> {req.city}</span>
                </div>

                <p style={{ color: 'var(--color-text-muted)', fontSize: '0.9rem', lineHeight: 1.5, marginBottom: '1.5rem', display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden', flex: 1 }}>
                  {req.description}
                </p>

                {(() => {
                  const hasBidded = myBiddings.some(b => String(b.tripRequestId) === String(req._id));
                  if (hasBidded) {
                    return (
                      <button disabled style={{ width: '100%', padding: '0.875rem', background: 'rgba(16, 185, 129, 0.1)', border: '1px solid rgba(16, 185, 129, 0.3)', color: '#059669', borderRadius: '12px', fontWeight: 700, cursor: 'not-allowed' }}>
                        Đã Gửi Đề Xuất
                      </button>
                    );
                  }
                  return (
                    <button onClick={() => {
                      setSelectedRequest(req);
                      setOfferPrice(req.budget); // Default to their budget
                    }} style={{ width: '100%', padding: '0.875rem', background: 'var(--color-bg)', border: '1px solid var(--color-primary)', color: 'var(--color-primary-dark)', borderRadius: '12px', fontWeight: 700, cursor: 'pointer', transition: 'all 0.2s' }}
                      onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'var(--color-primary)'; (e.currentTarget as HTMLElement).style.color = 'white'; }}
                      onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'var(--color-bg)'; (e.currentTarget as HTMLElement).style.color = 'var(--color-primary-dark)'; }}>
                      Nhận Kèo (Bidding)
                    </button>
                  );
                })()}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Bidding Modal */}
      {selectedRequest && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '1rem' }} onClick={() => setSelectedRequest(null)}>
          <div style={{ background: 'var(--color-surface)', width: '100%', maxWidth: '500px', borderRadius: '24px', padding: '2rem', boxShadow: 'var(--shadow-xl)' }} onClick={e => e.stopPropagation()}>
            <h2 style={{ margin: '0 0 1.5rem', fontSize: '1.5rem', fontWeight: 800 }}>Đề xuất báo giá</h2>
            
            <div style={{ marginBottom: '1.5rem', padding: '1rem', background: 'var(--color-bg)', borderRadius: '12px', fontSize: '0.9rem' }}>
              <strong>Yêu cầu:</strong> {selectedRequest.title}<br/>
              <strong>Ngân sách của khách:</strong> <span style={{ color: '#059669', fontWeight: 700 }}>{selectedRequest.budget.toLocaleString()} ₫</span>
            </div>

            {message && <div style={{ marginBottom: '1rem', padding: '0.75rem', background: message.includes('thành công') ? '#d1fae5' : '#fee2e2', color: message.includes('thành công') ? '#065f46' : '#b91c1c', borderRadius: '8px', fontSize: '0.9rem', fontWeight: 500 }}>{message}</div>}

            <form onSubmit={handleBidding}>
              <div style={{ marginBottom: '1.25rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600, fontSize: '0.9rem' }}>Mức giá đề xuất của bạn (VND)</label>
                <div style={{ position: 'relative' }}>
                  <DollarSign size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-faint)' }} />
                  <input type="number" value={offerPrice} onChange={e => setOfferPrice(Number(e.target.value))} min="0" step="10000" style={{ width: '100%', padding: '0.875rem 1rem 0.875rem 2.5rem', border: '1px solid var(--color-border)', borderRadius: '12px', fontSize: '1rem', outline: 'none' }} required />
                </div>
              </div>

              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600, fontSize: '0.9rem' }}>Lời nhắn / Kế hoạch tóm tắt</label>
                <textarea value={proposal} onChange={e => setProposal(e.target.value)} placeholder="Chào bạn, mình rất rành khu vực này. Mình dự định sẽ dẫn bạn đi..." style={{ width: '100%', padding: '1rem', border: '1px solid var(--color-border)', borderRadius: '12px', fontSize: '0.95rem', minHeight: '100px', resize: 'vertical', outline: 'none' }} required />
              </div>

              <div style={{ display: 'flex', gap: '1rem' }}>
                <button type="button" onClick={() => setSelectedRequest(null)} style={{ flex: 1, padding: '1rem', background: 'var(--color-bg)', border: '1px solid var(--color-border)', borderRadius: '12px', fontWeight: 600, cursor: 'pointer' }}>Hủy</button>
                <button type="submit" disabled={biddingLoading} style={{ flex: 1, padding: '1rem', background: 'var(--gradient-primary)', color: 'white', border: 'none', borderRadius: '12px', fontWeight: 600, cursor: biddingLoading ? 'not-allowed' : 'pointer', opacity: biddingLoading ? 0.7 : 1 }}>
                  {biddingLoading ? 'Đang gửi...' : 'Gửi Đề Xuất'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
