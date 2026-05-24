import { Link, useNavigate } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { Plane, User, LogOut } from 'lucide-react'
import { useAuthStore } from '../../store/authStore'
import { authApi } from '../../api/auth.api'

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const { isAuthenticated, user, logout, refreshToken } = useAuthStore()
  const navigate = useNavigate()

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const handleLogout = async () => {
    try {
      if (refreshToken) await authApi.logout(refreshToken)
    } finally {
      logout()
      navigate('/')
    }
  }

  const navStyle: React.CSSProperties = {
    position: 'fixed',
    top: 0, left: 0, right: 0,
    zIndex: 200,
    padding: '0.875rem 0',
    transition: 'all 0.3s ease',
    background: scrolled
      ? 'rgba(255, 255, 255, 0.95)'
      : 'rgba(255, 255, 255, 0.85)',
    backdropFilter: 'blur(20px)',
    WebkitBackdropFilter: 'blur(20px)',
    borderBottom: scrolled ? '1px solid rgba(14, 165, 233, 0.15)' : '1px solid transparent',
    boxShadow: scrolled ? '0 4px 20px rgba(14, 165, 233, 0.05)' : 'none',
  }

  const containerStyle: React.CSSProperties = {
    maxWidth: '1200px',
    margin: '0 auto',
    padding: '0 2rem',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
  }

  const logoStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: '0.625rem',
    textDecoration: 'none',
  }

  const logoIconStyle: React.CSSProperties = {
    width: '36px', height: '36px',
    borderRadius: '10px',
    background: 'linear-gradient(135deg, #0284c7, #0ea5e9)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    boxShadow: '0 4px 12px rgba(14, 165, 233, 0.25)',
    flexShrink: 0,
  }

  const logoTextStyle: React.CSSProperties = {
    fontSize: '1.2rem',
    fontWeight: 800,
    background: 'linear-gradient(135deg, #0369a1, #0ea5e9)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    backgroundClip: 'text',
    fontFamily: "'Inter', sans-serif",
  }

  const linksStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: '2rem',
    listStyle: 'none',
  }

  const linkStyle: React.CSSProperties = {
    color: '#475569',
    fontSize: '0.875rem',
    fontWeight: 500,
    textDecoration: 'none',
    transition: 'color 0.2s',
    fontFamily: "'Inter', sans-serif",
  }

  const actionsStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: '0.625rem',
  }

  const btnSecondaryStyle: React.CSSProperties = {
    display: 'inline-flex', alignItems: 'center', gap: '0.4rem',
    padding: '0.5rem 1rem',
    background: '#f8fafc',
    border: '1px solid rgba(14, 165, 233, 0.2)',
    borderRadius: '10px',
    color: '#0f172a',
    fontSize: '0.8rem', fontWeight: 600,
    cursor: 'pointer', textDecoration: 'none',
    transition: 'all 0.2s',
    fontFamily: "'Inter', sans-serif",
  }

  const btnPrimaryStyle: React.CSSProperties = {
    display: 'inline-flex', alignItems: 'center', gap: '0.4rem',
    padding: '0.5rem 1rem',
    background: 'linear-gradient(135deg, #0284c7, #0ea5e9)',
    border: 'none',
    borderRadius: '10px',
    color: 'white',
    fontSize: '0.8rem', fontWeight: 700,
    cursor: 'pointer', textDecoration: 'none',
    boxShadow: '0 4px 12px rgba(14, 165, 233, 0.25)',
    transition: 'all 0.2s',
    fontFamily: "'Inter', sans-serif",
  }

  const btnLogoutStyle: React.CSSProperties = {
    display: 'inline-flex', alignItems: 'center', gap: '0.4rem',
    padding: '0.5rem 1rem',
    background: 'transparent',
    border: '1px solid rgba(239,68,68,0.2)',
    borderRadius: '10px',
    color: 'rgba(239,68,68,0.8)',
    fontSize: '0.8rem', fontWeight: 600,
    cursor: 'pointer',
    transition: 'all 0.2s',
    fontFamily: "'Inter', sans-serif",
  }

  return (
    <>
      <nav style={navStyle}>
        <div style={containerStyle}>
          {/* Logo */}
          <Link to='/' style={logoStyle}>
            <div style={logoIconStyle}>
              <Plane size={18} color='#fff' />
            </div>
            <span style={logoTextStyle}>UniTravel</span>
          </Link>

          {/* Center links */}
          <ul style={linksStyle}>
            <li>
              <Link to='/' style={linkStyle}
                onMouseEnter={e => (e.currentTarget.style.color = '#0284c7')}
                onMouseLeave={e => (e.currentTarget.style.color = '#475569')}>
                Trang chủ
              </Link>
            </li>
            <li>
              <a href='#features' style={linkStyle}
                onMouseEnter={e => (e.currentTarget.style.color = '#0284c7')}
                onMouseLeave={e => (e.currentTarget.style.color = '#475569')}>
                Tính năng
              </a>
            </li>
            <li>
              <Link to='/buddies' style={linkStyle}
                onMouseEnter={e => (e.currentTarget.style.color = '#0284c7')}
                onMouseLeave={e => (e.currentTarget.style.color = '#475569')}>
                Tìm Buddy
              </Link>
            </li>
            {isAuthenticated && (
              <>
                <li>
                  <Link to='/dashboard' style={linkStyle}
                    onMouseEnter={e => (e.currentTarget.style.color = '#0284c7')}
                    onMouseLeave={e => (e.currentTarget.style.color = '#475569')}>
                    Dashboard
                  </Link>
                </li>
                <li>
                  <Link to='/conversations' style={linkStyle}
                    onMouseEnter={e => (e.currentTarget.style.color = '#0284c7')}
                    onMouseLeave={e => (e.currentTarget.style.color = '#475569')}>
                    Tin nhắn
                  </Link>
                </li>
                {user?.role === 'tourist' && (
                  <li>
                    <Link to='/my-requests' style={linkStyle}
                      onMouseEnter={e => (e.currentTarget.style.color = '#0284c7')}
                      onMouseLeave={e => (e.currentTarget.style.color = '#475569')}>
                      Yêu cầu chuyến đi
                    </Link>
                  </li>
                )}
                {user?.role === 'buddy' && (
                  <li>
                    <Link to='/trip-requests/open' style={linkStyle}
                      onMouseEnter={e => (e.currentTarget.style.color = '#0284c7')}
                      onMouseLeave={e => (e.currentTarget.style.color = '#475569')}>
                      Bảng yêu cầu
                    </Link>
                  </li>
                )}
              </>
            )}
          </ul>

          {/* Actions */}
          <div style={actionsStyle}>
            {isAuthenticated ? (
              <>
                <Link to='/profile' style={{ textDecoration: 'none' }}>
                  <div style={btnSecondaryStyle}
                    onMouseEnter={e => { 
                      (e.currentTarget as HTMLElement).style.background = '#e2e8f0'; 
                      (e.currentTarget as HTMLElement).style.borderColor = 'rgba(14, 165, 233, 0.4)' 
                    }}
                    onMouseLeave={e => { 
                      (e.currentTarget as HTMLElement).style.background = '#f8fafc'; 
                      (e.currentTarget as HTMLElement).style.borderColor = 'rgba(14, 165, 233, 0.2)' 
                    }}>
                    <User size={15} /> Hồ sơ
                  </div>
                </Link>
                <button style={btnLogoutStyle} onClick={handleLogout}
                  onMouseEnter={e => { 
                    (e.currentTarget as HTMLElement).style.background = 'rgba(239, 68, 68, 0.05)'; 
                    (e.currentTarget as HTMLElement).style.borderColor = 'rgba(239, 68, 68, 0.4)' 
                  }}
                  onMouseLeave={e => { 
                    (e.currentTarget as HTMLElement).style.background = 'transparent'; 
                    (e.currentTarget as HTMLElement).style.borderColor = 'rgba(239, 68, 68, 0.2)' 
                  }}>
                  <LogOut size={15} /> Đăng xuất
                </button>
              </>
            ) : (
              <>
                <Link to='/login' style={{ textDecoration: 'none' }}>
                  <div style={btnSecondaryStyle}
                    onMouseEnter={e => { 
                      (e.currentTarget as HTMLElement).style.background = '#e2e8f0';
                      (e.currentTarget as HTMLElement).style.borderColor = 'rgba(14, 165, 233, 0.4)'
                    }}
                    onMouseLeave={e => { 
                      (e.currentTarget as HTMLElement).style.background = '#f8fafc';
                      (e.currentTarget as HTMLElement).style.borderColor = 'rgba(14, 165, 233, 0.2)'
                    }}>
                    Đăng nhập
                  </div>
                </Link>
                <Link to='/register' style={{ textDecoration: 'none' }}>
                  <div style={btnPrimaryStyle}
                    onMouseEnter={e => { 
                      (e.currentTarget as HTMLElement).style.opacity = '0.88'; 
                      (e.currentTarget as HTMLElement).style.transform = 'translateY(-1px)' 
                    }}
                    onMouseLeave={e => { 
                      (e.currentTarget as HTMLElement).style.opacity = '1'; 
                      (e.currentTarget as HTMLElement).style.transform = 'translateY(0)' 
                    }}>
                    Đăng ký
                  </div>
                </Link>
              </>
            )}
          </div>
        </div>
      </nav>

      {/* Navbar spacer — push content below fixed nav */}
      <div style={{ height: '64px' }} />
    </>
  )
}
