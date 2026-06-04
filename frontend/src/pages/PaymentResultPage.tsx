import { useEffect, useState } from 'react'
import { useSearchParams, Link } from 'react-router-dom'
import { CheckCircle2, XCircle, Loader2, Home, Receipt } from 'lucide-react'
import Navbar from '../components/layout/Navbar'
import { vnpayApi } from '../api/vnpay.api'

type ResultStatus = 'loading' | 'success' | 'failed'

const PaymentResultPage = () => {
  const [searchParams] = useSearchParams()
  const [status, setStatus] = useState<ResultStatus>('loading')
  const [bookingId, setBookingId] = useState<string | null>(null)
  const [responseCode, setResponseCode] = useState<string | null>(null)

  useEffect(() => {
    const query: Record<string, string> = {}
    searchParams.forEach((value, key) => {
      query[key] = value
    })

    const vnpResponseCode = query['vnp_ResponseCode']
    const vnpTxnRef = query['vnp_TxnRef']
    setResponseCode(vnpResponseCode)
    setBookingId(vnpTxnRef)

    // Gọi Backend để xác minh chữ ký và lấy trạng thái thực từ DB
    vnpayApi
      .getReturnResult(query)
      .then((res) => {
        const code = res.data?.data?.vnpResponseCode ?? vnpResponseCode
        setStatus(code === '00' ? 'success' : 'failed')
      })
      .catch(() => {
        // Fallback: dùng vnp_ResponseCode từ URL nếu backend lỗi
        setStatus(vnpResponseCode === '00' ? 'success' : 'failed')
      })
  }, [searchParams])

  return (
    <div
      style={{
        minHeight: '100vh',
        background: 'var(--color-bg)',
        fontFamily: "'Inter', -apple-system, sans-serif",
        color: 'var(--color-text)'
      }}
    >
      <Navbar />

      <div
        style={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '6rem 1.5rem 2rem'
        }}
      >
        {/* Loading */}
        {status === 'loading' && (
          <div style={{ textAlign: 'center' }}>
            <div
              style={{
                width: '72px',
                height: '72px',
                borderRadius: '50%',
                background: 'rgba(14,165,233,0.1)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 1.5rem'
              }}
            >
              <Loader2
                size={36}
                style={{
                  color: 'var(--color-primary)',
                  animation: 'spin 1s linear infinite'
                }}
              />
            </div>
            <h2
              style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '0.5rem' }}
            >
              Đang xác minh giao dịch...
            </h2>
            <p style={{ color: 'var(--color-text-muted)', fontSize: '0.9rem' }}>
              Vui lòng không tắt trang này
            </p>
          </div>
        )}

        {/* Success */}
        {status === 'success' && (
          <div
            style={{
              background: '#ffffff',
              borderRadius: '28px',
              padding: '3rem 2.5rem',
              maxWidth: '460px',
              width: '100%',
              textAlign: 'center',
              boxShadow: '0 20px 60px rgba(16,185,129,0.08)',
              border: '1px solid rgba(16,185,129,0.15)'
            }}
          >
            {/* Icon */}
            <div
              style={{
                width: '80px',
                height: '80px',
                borderRadius: '50%',
                background: 'linear-gradient(135deg, rgba(16,185,129,0.15), rgba(5,150,105,0.1))',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 1.5rem',
                boxShadow: '0 8px 24px rgba(16,185,129,0.15)'
              }}
            >
              <CheckCircle2 size={40} style={{ color: '#10b981' }} />
            </div>

            <h1
              style={{
                fontSize: '1.6rem',
                fontWeight: 900,
                marginBottom: '0.6rem',
                color: '#0f172a',
                letterSpacing: '-0.02em'
              }}
            >
              Thanh toán thành công! 🎉
            </h1>
            <p
              style={{
                color: 'var(--color-text-muted)',
                fontSize: '0.9rem',
                lineHeight: 1.6,
                marginBottom: '0.5rem'
              }}
            >
              Giao dịch của bạn đã được xác nhận. Chuyến đi đã sẵn sàng!
            </p>

            {bookingId && (
              <div
                style={{
                  background: '#f0fdf4',
                  border: '1px solid rgba(16,185,129,0.2)',
                  borderRadius: '12px',
                  padding: '0.75rem 1rem',
                  marginBottom: '2rem',
                  fontSize: '0.8rem',
                  color: '#059669'
                }}
              >
                <span style={{ fontWeight: 600 }}>Mã giao dịch: </span>
                <span style={{ fontFamily: 'monospace' }}>{bookingId}</span>
              </div>
            )}

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <Link
                to='/my-bookings'
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.5rem',
                  padding: '0.85rem 1.5rem',
                  background: 'linear-gradient(135deg, #10b981, #059669)',
                  color: 'white',
                  borderRadius: '14px',
                  fontWeight: 700,
                  fontSize: '0.95rem',
                  textDecoration: 'none',
                  boxShadow: '0 6px 20px rgba(16,185,129,0.25)',
                  transition: 'all 0.2s'
                }}
              >
                <Receipt size={18} /> Xem lịch đặt của tôi
              </Link>

              <Link
                to='/'
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.5rem',
                  padding: '0.85rem 1.5rem',
                  background: '#f8fafc',
                  color: 'var(--color-text-muted)',
                  borderRadius: '14px',
                  fontWeight: 600,
                  fontSize: '0.9rem',
                  textDecoration: 'none',
                  border: '1px solid var(--color-border)',
                  transition: 'all 0.2s'
                }}
              >
                <Home size={16} /> Về trang chủ
              </Link>
            </div>
          </div>
        )}

        {/* Failed */}
        {status === 'failed' && (
          <div
            style={{
              background: '#ffffff',
              borderRadius: '28px',
              padding: '3rem 2.5rem',
              maxWidth: '460px',
              width: '100%',
              textAlign: 'center',
              boxShadow: '0 20px 60px rgba(239,68,68,0.06)',
              border: '1px solid rgba(239,68,68,0.12)'
            }}
          >
            {/* Icon */}
            <div
              style={{
                width: '80px',
                height: '80px',
                borderRadius: '50%',
                background: 'rgba(239,68,68,0.1)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 1.5rem',
                boxShadow: '0 8px 24px rgba(239,68,68,0.1)'
              }}
            >
              <XCircle size={40} style={{ color: '#ef4444' }} />
            </div>

            <h1
              style={{
                fontSize: '1.6rem',
                fontWeight: 900,
                marginBottom: '0.6rem',
                color: '#0f172a',
                letterSpacing: '-0.02em'
              }}
            >
              Thanh toán thất bại
            </h1>
            <p
              style={{
                color: 'var(--color-text-muted)',
                fontSize: '0.9rem',
                lineHeight: 1.6,
                marginBottom: '0.5rem'
              }}
            >
              Giao dịch chưa hoàn tất hoặc đã bị hủy.
              <br />
              Booking của bạn vẫn được giữ, bạn có thể thử thanh toán lại.
            </p>

            {responseCode && responseCode !== '00' && (
              <div
                style={{
                  background: '#fef2f2',
                  border: '1px solid rgba(239,68,68,0.15)',
                  borderRadius: '12px',
                  padding: '0.75rem 1rem',
                  marginBottom: '2rem',
                  fontSize: '0.8rem',
                  color: '#dc2626'
                }}
              >
                <span style={{ fontWeight: 600 }}>Mã lỗi VNPAY: </span>
                <span style={{ fontFamily: 'monospace' }}>{responseCode}</span>
              </div>
            )}

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <Link
                to='/my-bookings'
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.5rem',
                  padding: '0.85rem 1.5rem',
                  background: 'var(--gradient-primary)',
                  color: 'white',
                  borderRadius: '14px',
                  fontWeight: 700,
                  fontSize: '0.95rem',
                  textDecoration: 'none',
                  boxShadow: '0 6px 20px rgba(2,132,199,0.2)',
                  transition: 'all 0.2s'
                }}
              >
                <Receipt size={18} /> Thử thanh toán lại
              </Link>

              <Link
                to='/'
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.5rem',
                  padding: '0.85rem 1.5rem',
                  background: '#f8fafc',
                  color: 'var(--color-text-muted)',
                  borderRadius: '14px',
                  fontWeight: 600,
                  fontSize: '0.9rem',
                  textDecoration: 'none',
                  border: '1px solid var(--color-border)',
                  transition: 'all 0.2s'
                }}
              >
                <Home size={16} /> Về trang chủ
              </Link>
            </div>
          </div>
        )}
      </div>

      <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
    </div>
  )
}

export default PaymentResultPage
