import { Link } from 'react-router-dom'
import { Plane, Mail, Globe, Share2 } from 'lucide-react'

export default function Footer() {
  return (
    <footer className='footer'>
      <div className='container'>
        <div className='footer-content'>
          <div className='footer-brand'>
            <Link to='/' style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div className='navbar-logo-icon'>
                <Plane size={18} color='#fff' />
              </div>
              <span className='gradient-text' style={{ fontSize: '1.25rem', fontWeight: 800 }}>UniTravel</span>
            </Link>
            <p>Nền tảng du lịch thông minh dành cho sinh viên — khám phá thế giới với chi phí tối ưu.</p>
          </div>

          <div>
            <h4 className='footer-heading'>Sản phẩm</h4>
            <ul className='footer-links'>
              <li><a href='#features'>Tính năng</a></li>
              <li><a href='#'>Đặt tour</a></li>
              <li><a href='#'>Chia sẻ lịch trình</a></li>
              <li><a href='#'>Cộng đồng</a></li>
            </ul>
          </div>

          <div>
            <h4 className='footer-heading'>Hỗ trợ</h4>
            <ul className='footer-links'>
              <li><a href='#'>Trung tâm trợ giúp</a></li>
              <li><a href='#'>Liên hệ</a></li>
              <li><a href='#'>Báo lỗi</a></li>
              <li><a href='#'>Changelog</a></li>
            </ul>
          </div>

          <div>
            <h4 className='footer-heading'>Pháp lý</h4>
            <ul className='footer-links'>
              <li><a href='#'>Điều khoản</a></li>
              <li><a href='#'>Bảo mật</a></li>
              <li><a href='#'>Cookie</a></li>
            </ul>
          </div>
        </div>

        <div className='footer-bottom'>
          <span>© 2024 UniTravel. Made with ❤️ by EXE201 Team</span>
          <div style={{ display: 'flex', gap: '16px' }}>
            <a href='#' style={{ color: 'var(--color-text-faint)', transition: 'color 0.2s' }}
               onMouseEnter={e => (e.currentTarget.style.color = 'var(--color-primary)')}
               onMouseLeave={e => (e.currentTarget.style.color = 'var(--color-text-faint)')}>
              <Share2 size={18} />
            </a>
            <a href='#' style={{ color: 'var(--color-text-faint)', transition: 'color 0.2s' }}
               onMouseEnter={e => (e.currentTarget.style.color = 'var(--color-primary)')}
               onMouseLeave={e => (e.currentTarget.style.color = 'var(--color-text-faint)')}>
              <Globe size={18} />
            </a>
            <a href='#' style={{ color: 'var(--color-text-faint)', transition: 'color 0.2s' }}
               onMouseEnter={e => (e.currentTarget.style.color = 'var(--color-primary)')}
               onMouseLeave={e => (e.currentTarget.style.color = 'var(--color-text-faint)')}>
              <Mail size={18} />
            </a>
          </div>
        </div>
      </div>
    </footer>
  )
}
