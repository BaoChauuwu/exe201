import React, { useState } from 'react';
import { X, Star, MessageSquare, Send } from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { useAuthStore } from '../../store/authStore';

interface FeedbackModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const FeedbackModal: React.FC<FeedbackModalProps> = ({ isOpen, onClose }) => {
  const { accessToken, isAuthenticated } = useAuthStore();
  const [type, setType] = useState<'testimonial' | 'feedback'>('testimonial');
  const [rating, setRating] = useState(5);
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAuthenticated) {
      toast.error('Vui lòng đăng nhập để gửi đánh giá/góp ý.');
      return;
    }
    if (!content.trim()) {
      toast.error('Vui lòng nhập nội dung.');
      return;
    }

    setLoading(true);
    try {
      await axios.post(
        `${import.meta.env.VITE_API_URL || 'http://localhost:3000'}/feedbacks`,
        { type, rating: type === 'testimonial' ? rating : undefined, content },
        { headers: { Authorization: `Bearer ${accessToken}` } }
      );
      toast.success('Gửi thành công! Cảm ơn bạn đã đóng góp cho UniTravel.');
      setContent('');
      onClose();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Có lỗi xảy ra, vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
      background: 'rgba(15, 23, 42, 0.75)', backdropFilter: 'blur(8px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      zIndex: 99999, padding: '1rem', boxSizing: 'border-box'
    }}>
      <div style={{
        background: '#ffffff', borderRadius: '24px', width: '100%', maxWidth: '480px',
        padding: '2rem', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
        border: '1px solid rgba(14, 165, 233, 0.15)', position: 'relative', boxSizing: 'border-box'
      }}>
        <button 
          onClick={onClose}
          style={{ position: 'absolute', top: '1.25rem', right: '1.25rem', background: 'rgba(0,0,0,0.05)', border: 'none', borderRadius: '50%', width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', transition: 'all 0.2s' }}
        >
          <X size={16} />
        </button>

        <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
          <div style={{ width: '48px', height: '48px', borderRadius: '16px', background: 'linear-gradient(135deg, #0ea5e9, #6366f1)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem', color: 'white', boxShadow: '0 8px 16px rgba(14,165,233,0.25)' }}>
            <MessageSquare size={24} />
          </div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 800, margin: '0 0 0.5rem', color: '#0f172a' }}>Góp ý & Đánh giá</h2>
          <p style={{ color: '#64748b', fontSize: '0.9rem', margin: 0 }}>Giúp UniTravel mang đến trải nghiệm tốt hơn cho bạn.</p>
        </div>

        <form onSubmit={handleSubmit}>
          {/* Type Selection */}
          <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem', background: '#f1f5f9', padding: '0.35rem', borderRadius: '12px' }}>
            <button
              type="button"
              onClick={() => setType('testimonial')}
              style={{ flex: 1, padding: '0.6rem', border: 'none', borderRadius: '8px', fontSize: '0.85rem', fontWeight: 700, cursor: 'pointer', background: type === 'testimonial' ? 'white' : 'transparent', color: type === 'testimonial' ? '#0f172a' : '#64748b', boxShadow: type === 'testimonial' ? '0 2px 8px rgba(0,0,0,0.05)' : 'none', transition: 'all 0.2s' }}
            >
              ⭐ Đánh giá công khai
            </button>
            <button
              type="button"
              onClick={() => setType('feedback')}
              style={{ flex: 1, padding: '0.6rem', border: 'none', borderRadius: '8px', fontSize: '0.85rem', fontWeight: 700, cursor: 'pointer', background: type === 'feedback' ? 'white' : 'transparent', color: type === 'feedback' ? '#0f172a' : '#64748b', boxShadow: type === 'feedback' ? '0 2px 8px rgba(0,0,0,0.05)' : 'none', transition: 'all 0.2s' }}
            >
              💡 Góp ý ẩn danh
            </button>
          </div>

          {/* Rating (only for testimonial) */}
          {type === 'testimonial' && (
            <div style={{ marginBottom: '1.5rem', textAlign: 'center' }}>
              <div style={{ display: 'flex', justifyContent: 'center', gap: '8px' }}>
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRating(star)}
                    style={{ background: 'transparent', border: 'none', padding: 0, cursor: 'pointer', transition: 'transform 0.1s' }}
                    onMouseEnter={(e) => (e.currentTarget.style.transform = 'scale(1.2)')}
                    onMouseLeave={(e) => (e.currentTarget.style.transform = 'scale(1)')}
                  >
                    <Star size={32} fill={star <= rating ? '#f59e0b' : 'transparent'} color={star <= rating ? '#f59e0b' : '#cbd5e1'} strokeWidth={1.5} />
                  </button>
                ))}
              </div>
              <p style={{ margin: '0.5rem 0 0', fontSize: '0.8rem', color: '#f59e0b', fontWeight: 700 }}>
                {rating === 5 ? 'Tuyệt vời!' : rating === 4 ? 'Rất tốt' : rating === 3 ? 'Bình thường' : rating === 2 ? 'Tạm được' : 'Rất tệ'}
              </p>
            </div>
          )}

          {/* Content */}
          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#334155', marginBottom: '0.5rem' }}>
              {type === 'testimonial' ? 'Chia sẻ trải nghiệm của bạn' : 'Mô tả vấn đề hoặc ý tưởng của bạn'}
            </label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder={type === 'testimonial' ? 'Điều gì làm bạn hài lòng nhất về UniTravel?' : 'Ví dụ: Tôi thấy tính năng này bị lỗi... / Tôi muốn thêm tính năng...'}
              rows={4}
              style={{
                width: '100%', border: '1px solid #cbd5e1', borderRadius: '12px', padding: '0.85rem',
                fontSize: '0.95rem', fontFamily: 'inherit', outline: 'none', resize: 'vertical',
                boxSizing: 'border-box', transition: 'all 0.2s', background: '#f8fafc'
              }}
              onFocus={(e) => { e.currentTarget.style.borderColor = '#0ea5e9'; e.currentTarget.style.boxShadow = '0 0 0 3px rgba(14,165,233,0.1)'; }}
              onBlur={(e) => { e.currentTarget.style.borderColor = '#cbd5e1'; e.currentTarget.style.boxShadow = 'none'; }}
            />
          </div>

          {/* Alert for Testimonial */}
          {type === 'testimonial' && (
            <div style={{ background: '#f0f9ff', padding: '0.85rem', borderRadius: '8px', fontSize: '0.8rem', color: '#0369a1', marginBottom: '1.5rem', display: 'flex', gap: '8px' }}>
              <div>ℹ️</div>
              <div>Đánh giá của bạn sẽ được hiển thị công khai trên trang chủ.</div>
            </div>
          )}
          
          {type === 'feedback' && (
            <div style={{ background: '#fdf4ff', padding: '0.85rem', borderRadius: '8px', fontSize: '0.8rem', color: '#86198f', marginBottom: '1.5rem', display: 'flex', gap: '8px' }}>
              <div>🔒</div>
              <div>Góp ý của bạn được bảo mật và gửi trực tiếp đến ban quản trị UniTravel.</div>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            style={{
              width: '100%', padding: '0.95rem', background: 'linear-gradient(135deg, #0ea5e9, #0284c7)',
              border: 'none', borderRadius: '12px', color: 'white', fontWeight: 800, fontSize: '1rem',
              cursor: loading ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
              boxShadow: '0 8px 20px rgba(14,165,233,0.25)', opacity: loading ? 0.7 : 1, transition: 'all 0.2s'
            }}
          >
            {loading ? 'Đang gửi...' : <><Send size={18} /> Gửi ngay</>}
          </button>
        </form>
      </div>
    </div>
  );
};
