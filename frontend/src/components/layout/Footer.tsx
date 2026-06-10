import { Link } from 'react-router-dom';
import { Compass, Mail, Phone, MapPin, Share2, Globe } from 'lucide-react';

export default function Footer() {
  return (
    <footer style={{
      background: 'var(--color-bg-2)',
      borderTop: '1px solid var(--color-border)',
      padding: '4rem 0 2rem',
      color: 'var(--color-text)',
      marginTop: 'auto'
    }}>
      <div className="container">
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
          gap: '3rem',
          marginBottom: '3rem'
        }}>
          {/* Cột 1: Brand & Intro */}
          <div>
            <Link to='/' style={{ display: 'flex', alignItems: 'center', gap: '8px', textDecoration: 'none', color: 'var(--color-primary)', marginBottom: '1.5rem' }}>
              <Compass size={28} />
              <span style={{ fontSize: '1.5rem', fontWeight: 900, letterSpacing: '-0.5px' }}>UniTravel</span>
            </Link>
            <p style={{ color: 'var(--color-text-muted)', lineHeight: 1.6, marginBottom: '1.5rem' }}>
              Nền tảng kết nối du khách với những người bạn bản địa (Local Buddy) tận tâm, mang đến trải nghiệm du lịch chân thực và độc đáo nhất tại Việt Nam.
            </p>
            <div style={{ display: 'flex', gap: '1rem' }}>
              <a href="#" style={{ color: 'var(--color-text-faint)', transition: 'color 0.2s' }} onMouseEnter={e => e.currentTarget.style.color = 'var(--color-primary)'} onMouseLeave={e => e.currentTarget.style.color = 'var(--color-text-faint)'}><Share2 size={20} /></a>
              <a href="#" style={{ color: 'var(--color-text-faint)', transition: 'color 0.2s' }} onMouseEnter={e => e.currentTarget.style.color = 'var(--color-primary)'} onMouseLeave={e => e.currentTarget.style.color = 'var(--color-text-faint)'}><Globe size={20} /></a>
              <a href="#" style={{ color: 'var(--color-text-faint)', transition: 'color 0.2s' }} onMouseEnter={e => e.currentTarget.style.color = 'var(--color-primary)'} onMouseLeave={e => e.currentTarget.style.color = 'var(--color-text-faint)'}><Mail size={20} /></a>
            </div>
          </div>

          {/* Cột 2: Khám phá */}
          <div>
            <h4 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '1.5rem', color: 'var(--color-text)' }}>Khám phá</h4>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <li><Link to="/" style={{ color: 'var(--color-text-muted)', textDecoration: 'none', transition: 'color 0.2s' }} onMouseEnter={e => e.currentTarget.style.color = 'var(--color-primary)'} onMouseLeave={e => e.currentTarget.style.color = 'var(--color-text-muted)'}>Tất cả trải nghiệm</Link></li>
              <li><Link to="/buddies" style={{ color: 'var(--color-text-muted)', textDecoration: 'none', transition: 'color 0.2s' }} onMouseEnter={e => e.currentTarget.style.color = 'var(--color-primary)'} onMouseLeave={e => e.currentTarget.style.color = 'var(--color-text-muted)'}>Tìm Local Buddy</Link></li>
              <li><Link to="/" style={{ color: 'var(--color-text-muted)', textDecoration: 'none', transition: 'color 0.2s' }} onMouseEnter={e => e.currentTarget.style.color = 'var(--color-primary)'} onMouseLeave={e => e.currentTarget.style.color = 'var(--color-text-muted)'}>Về chúng tôi</Link></li>
              <li><Link to="/" style={{ color: 'var(--color-text-muted)', textDecoration: 'none', transition: 'color 0.2s' }} onMouseEnter={e => e.currentTarget.style.color = 'var(--color-primary)'} onMouseLeave={e => e.currentTarget.style.color = 'var(--color-text-muted)'}>Cẩm nang du lịch</Link></li>
            </ul>
          </div>

          {/* Cột 3: Hỗ trợ */}
          <div>
            <h4 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '1.5rem', color: 'var(--color-text)' }}>Hỗ trợ</h4>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <li><Link to="/" style={{ color: 'var(--color-text-muted)', textDecoration: 'none', transition: 'color 0.2s' }} onMouseEnter={e => e.currentTarget.style.color = 'var(--color-primary)'} onMouseLeave={e => e.currentTarget.style.color = 'var(--color-text-muted)'}>Trung tâm trợ giúp</Link></li>
              <li><Link to="/" style={{ color: 'var(--color-text-muted)', textDecoration: 'none', transition: 'color 0.2s' }} onMouseEnter={e => e.currentTarget.style.color = 'var(--color-primary)'} onMouseLeave={e => e.currentTarget.style.color = 'var(--color-text-muted)'}>An toàn & Tin cậy</Link></li>
              <li><Link to="/" style={{ color: 'var(--color-text-muted)', textDecoration: 'none', transition: 'color 0.2s' }} onMouseEnter={e => e.currentTarget.style.color = 'var(--color-primary)'} onMouseLeave={e => e.currentTarget.style.color = 'var(--color-text-muted)'}>Điều khoản sử dụng</Link></li>
              <li><Link to="/" style={{ color: 'var(--color-text-muted)', textDecoration: 'none', transition: 'color 0.2s' }} onMouseEnter={e => e.currentTarget.style.color = 'var(--color-primary)'} onMouseLeave={e => e.currentTarget.style.color = 'var(--color-text-muted)'}>Chính sách bảo mật</Link></li>
            </ul>
          </div>

          {/* Cột 4: Liên hệ */}
          <div>
            <h4 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '1.5rem', color: 'var(--color-text)' }}>Liên hệ</h4>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <li style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', color: 'var(--color-text-muted)' }}>
                <MapPin size={18} style={{ color: 'var(--color-primary)', flexShrink: 0, marginTop: '2px' }} />
                <span>Đại Học FPT University Đà Nẵng</span>
              </li>
              <li style={{ display: 'flex', alignItems: 'center', gap: '10px', color: 'var(--color-text-muted)' }}>
                <Phone size={18} style={{ color: 'var(--color-primary)', flexShrink: 0 }} />
                <span>1999 9999</span>
              </li>
              <li style={{ display: 'flex', alignItems: 'center', gap: '10px', color: 'var(--color-text-muted)' }}>
                <Mail size={18} style={{ color: 'var(--color-primary)', flexShrink: 0 }} />
                <span>support@unitravel.vn</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bản quyền */}
        <div style={{
          borderTop: '1px solid var(--color-border)',
          paddingTop: '2rem',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '1rem'
        }}>
          <p style={{ color: 'var(--color-text-faint)', fontSize: '0.9rem', margin: 0 }}>
            &copy; {new Date().getFullYear()} UniTravel. Tất cả quyền được bảo lưu.
          </p>
          <div style={{ display: 'flex', gap: '1.5rem' }}>
            <span style={{ color: 'var(--color-text-faint)', fontSize: '0.9rem' }}>Tiếng Việt</span>
            <span style={{ color: 'var(--color-text-faint)', fontSize: '0.9rem' }}>VND</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
