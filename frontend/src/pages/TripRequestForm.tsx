import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/layout/Navbar';
import { tripRequestApi } from '../api/tripRequest.api';
import type { TripRequestFormValues } from '../api/tripRequest.api';
import { useAuthStore } from '../store/authStore';
import { MapPin, Calendar, Clock, DollarSign, AlignLeft, Info } from 'lucide-react';

export const TripRequestForm = () => {
  const navigate = useNavigate();
  const { accessToken, user } = useAuthStore();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const [formData, setFormData] = useState<TripRequestFormValues>({
    title: '',
    description: '',
    date: '',
    time: '',
    durationHours: 1,
    budget: 0,
    city: 'Đà Nẵng',
    meetingPointLng: 108.2208,
    meetingPointLat: 16.0471
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: name === 'durationHours' || name === 'budget' ? Number(value) : value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!accessToken || user?.role !== 'tourist') {
      setError('Bạn cần đăng nhập với tài khoản Tourist để đăng yêu cầu.');
      return;
    }

    setLoading(true);
    try {
      await tripRequestApi.create(formData, { headers: { Authorization: `Bearer ${accessToken}` } });
      navigate('/my-requests'); // We'll create this route next
    } catch (err: any) {
      setError(err.response?.data?.message || 'Có lỗi xảy ra khi tạo yêu cầu.');
    } finally {
      setLoading(false);
    }
  };

  const inputStyle: React.CSSProperties = {
    width: '100%', padding: '0.875rem 1rem 0.875rem 2.5rem', border: '1px solid var(--color-border)',
    borderRadius: '12px', fontSize: '0.95rem', outline: 'none', transition: 'all 0.2s',
    background: 'white', color: 'var(--color-text)', fontFamily: 'inherit'
  };

  const labelStyle: React.CSSProperties = {
    display: 'block', marginBottom: '0.5rem', fontWeight: 600, color: 'var(--color-text)', fontSize: '0.9rem'
  };

  const iconStyle: React.CSSProperties = {
    position: 'absolute', left: '0.875rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-faint)'
  };

  return (
    <div style={{ minHeight: '100vh', background: 'var(--gradient-hero)', fontFamily: "'Inter', sans-serif" }}>
      <Navbar />
      
      <div style={{ maxWidth: '800px', margin: '0 auto', padding: '3rem 1.5rem', color: 'var(--color-text)' }}>
        <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
          <h1 style={{ fontSize: '2.5rem', fontWeight: 800, margin: '0 0 1rem', background: 'var(--gradient-primary)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            Tìm Người Đồng Hành Của Bạn
          </h1>
          <p style={{ color: 'var(--color-text-muted)', fontSize: '1.1rem', maxWidth: '600px', margin: '0 auto' }}>
            Cho chúng tôi biết bạn muốn đi đâu, làm gì. Các Buddy bản địa sẽ gửi đề xuất cho bạn.
          </p>
        </div>

        <form onSubmit={handleSubmit} style={{ background: 'var(--color-surface)', borderRadius: '24px', padding: '2.5rem', boxShadow: 'var(--shadow-lg)', border: '1px solid var(--color-border)' }}>
          {error && <div style={{ background: '#fee2e2', color: '#b91c1c', padding: '1rem', borderRadius: '12px', marginBottom: '1.5rem', fontSize: '0.9rem', fontWeight: 500 }}>{error}</div>}

          <div style={{ display: 'grid', gap: '1.5rem' }}>
            <div>
              <label style={labelStyle}>Tiêu đề chuyến đi</label>
              <div style={{ position: 'relative' }}>
                <Info size={18} style={iconStyle} />
                <input type="text" name="title" value={formData.title} onChange={handleChange} placeholder="vd: Cần người dẫn đi food tour quanh chợ Cồn" style={inputStyle} required />
              </div>
            </div>

            <div>
              <label style={labelStyle}>Chi tiết chuyến đi</label>
              <div style={{ position: 'relative' }}>
                <AlignLeft size={18} style={{ ...iconStyle, top: '1.5rem' }} />
                <textarea name="description" value={formData.description} onChange={handleChange} placeholder="Bạn muốn làm gì, tham quan nơi nào, ăn gì..." style={{ ...inputStyle, minHeight: '120px', resize: 'vertical' }} required />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
              <div>
                <label style={labelStyle}>Ngày khởi hành</label>
                <div style={{ position: 'relative' }}>
                  <Calendar size={18} style={iconStyle} />
                  <input type="date" name="date" value={formData.date} onChange={handleChange} style={inputStyle} required />
                </div>
              </div>
              <div>
                <label style={labelStyle}>Giờ bắt đầu</label>
                <div style={{ position: 'relative' }}>
                  <Clock size={18} style={iconStyle} />
                  <input type="time" name="time" value={formData.time} onChange={handleChange} style={inputStyle} required />
                </div>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
              <div>
                <label style={labelStyle}>Số giờ dự kiến</label>
                <div style={{ position: 'relative' }}>
                  <Clock size={18} style={iconStyle} />
                  <input type="number" name="durationHours" value={formData.durationHours} onChange={handleChange} min="1" style={inputStyle} required />
                </div>
              </div>
              <div>
                <label style={labelStyle}>Ngân sách tối đa (VND)</label>
                <div style={{ position: 'relative' }}>
                  <DollarSign size={18} style={iconStyle} />
                  <input type="number" name="budget" value={formData.budget} onChange={handleChange} min="0" step="50000" placeholder="500000" style={inputStyle} required />
                </div>
              </div>
            </div>
            
            <div>
              <label style={labelStyle}>Thành phố</label>
              <div style={{ position: 'relative' }}>
                <MapPin size={18} style={iconStyle} />
                <input type="text" name="city" value={formData.city} onChange={handleChange} placeholder="Đà Nẵng" style={inputStyle} required />
              </div>
            </div>

            <button type="submit" disabled={loading} style={{ width: '100%', padding: '1rem', background: 'var(--gradient-primary)', color: 'white', border: 'none', borderRadius: '12px', fontSize: '1rem', fontWeight: 700, cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.7 : 1, marginTop: '1rem', transition: 'all 0.2s', boxShadow: 'var(--shadow-md)' }}>
              {loading ? 'Đang tạo...' : 'Đăng Yêu Cầu'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
