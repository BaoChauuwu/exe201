import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { ShieldAlert } from 'lucide-react';
import toast from 'react-hot-toast';
import axios from 'axios';

export const GlobalSOSButton = () => {
  const { isAuthenticated, user } = useAuthStore();
  const navigate = useNavigate();
  const [isPressing, setIsPressing] = useState(false);
  const [progress, setProgress] = useState(0);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const progressIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const startPress = () => {
    if (isPressing) return;
    setIsPressing(true);
    setProgress(0);

    progressIntervalRef.current = setInterval(() => {
      setProgress(p => Math.min(p + (100 / 30), 100)); // 3 seconds = 30 steps of 100ms
    }, 100);

    timerRef.current = setTimeout(async () => {
      cancelPress();
      
      try {
        const res = await axios.get((import.meta.env.VITE_API_URL || 'http://localhost:3000') + '/bookings/my', {
            headers: { Authorization: `Bearer ${localStorage.getItem('access_token')}` }
        });
        const bookings = res.data.result || [];
        // Only allow SOS if there is an ONGOING booking
        let activeBooking = bookings.find((b: any) => b.status === 'ongoing');

        if (activeBooking) {
            // Get location if available
            let location: any = null;
            if (navigator.geolocation) {
                try {
                    const pos: GeolocationPosition = await new Promise((resolve, reject) => {
                        navigator.geolocation.getCurrentPosition(resolve, reject, { timeout: 5000 });
                    });
                    location = {
                        lat: pos.coords.latitude,
                        lng: pos.coords.longitude,
                        timestamp: new Date()
                    };
                } catch (e) {
                    console.error("Could not get GPS location for SOS", e);
                }
            }

            await axios.post((import.meta.env.VITE_API_URL || 'http://localhost:3000') + '/safety/sos', {
                bookingId: activeBooking._id,
                userId: user?._id,
                message: 'KHẨN CẤP: Người dùng nhấn SOS từ nút Global.',
                location
            });
            toast.success('Đã gửi SOS kèm vị trí! Mở Live Map...', { duration: 3000 });
            navigate(user?.role === 'buddy' ? '/live-tracking/' + activeBooking._id : '/tourist/live/' + activeBooking._id);
        } else {
            toast.error('Chức năng SOS chỉ khả dụng khi bạn đang trong một chuyến đi (Live Tracking).');
        }
      } catch (err) {
        toast.error('Lỗi khi gửi SOS! Hãy gọi 113!');
      }
    }, 3000);
  };

  const cancelPress = () => {
    setIsPressing(false);
    setProgress(0);
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    if (progressIntervalRef.current) {
      clearInterval(progressIntervalRef.current);
      progressIntervalRef.current = null;
    }
  };

  useEffect(() => {
    return () => cancelPress();
  }, []);

  if (!isAuthenticated || !user) return null;
  if (user.role === 'admin') return null;

  // Don't show if already on tracking pages
  if (window.location.pathname.includes('/live-tracking') || window.location.pathname.includes('/tourist/live')) {
    return null;
  }

  return (
    <div
      style={{
        position: 'fixed',
        bottom: '24px',
        right: '24px',
        zIndex: 9999,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '8px'
      }}
    >
      {isPressing && (
        <div style={{
          background: 'rgba(0,0,0,0.8)',
          color: 'white',
          padding: '6px 12px',
          borderRadius: '8px',
          fontSize: '0.8rem',
          fontWeight: 'bold',
          whiteSpace: 'nowrap',
          animation: 'fade-in 0.2s ease',
          boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
        }}>
          Giữ thêm để mở Map
        </div>
      )}
      <button
        onMouseDown={startPress}
        onMouseUp={cancelPress}
        onMouseLeave={cancelPress}
        onTouchStart={startPress}
        onTouchEnd={cancelPress}
        onTouchCancel={cancelPress}
        onContextMenu={(e) => { e.preventDefault(); cancelPress(); }}
        style={{
          width: '64px',
          height: '64px',
          borderRadius: '50%',
          background: isPressing ? '#b91c1c' : '#ef4444',
          color: 'white',
          border: '2px solid rgba(255,255,255,0.2)',
          boxShadow: isPressing ? '0 0 15px rgba(239, 68, 68, 0.8)' : '0 6px 16px rgba(239, 68, 68, 0.4)',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          transition: 'all 0.2s',
          transform: isPressing ? 'scale(0.95)' : 'scale(1)',
          position: 'relative',
          overflow: 'hidden'
        }}
        title="Nhấn giữ 3 giây để mở Bản Đồ Tracking / SOS"
      >
        <div
          style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            width: '100%',
            height: `${progress}%`,
            background: 'rgba(255,255,255,0.25)',
            transition: 'height 0.1s linear'
          }}
        />
        <ShieldAlert size={28} style={{ zIndex: 1, position: 'relative' }} />
      </button>
      <style>{`
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(5px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
};
