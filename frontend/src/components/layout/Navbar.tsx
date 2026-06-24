import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { Plane, User, LogOut, ChevronDown, Moon, Sun, Menu, X } from 'lucide-react'
import { useAuthStore } from '../../store/authStore'
import { authApi } from '../../api/auth.api'
import axios from 'axios'

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'light')
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const { isAuthenticated, user, logout, refreshToken } = useAuthStore()
  const navigate = useNavigate()
  const location = useLocation()

  // Close mobile menu on route change
  useEffect(() => {
    setMobileMenuOpen(false)
  }, [location.pathname])

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
    localStorage.setItem('theme', theme)
  }, [theme])

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20)
    const handleClickOutside = () => setDropdownOpen(false)
    window.addEventListener('scroll', handleScroll)
    document.addEventListener('click', handleClickOutside)
    return () => {
      window.removeEventListener('scroll', handleScroll)
      document.removeEventListener('click', handleClickOutside)
    }
  }, [])

  const handleLogout = async () => {
    try {
      if (refreshToken) await authApi.logout(refreshToken)
    } finally {
      logout()
      navigate('/')
    }
  }

  const navigateToLiveTracking = async (e: React.MouseEvent) => {
    e.preventDefault();
    if (!user) return;
    try {
        const res = await axios.get((import.meta.env.VITE_API_URL || 'http://localhost:3000') + '/bookings/my', {
            headers: { Authorization: `Bearer ${localStorage.getItem('access_token')}` }
        });
        const bookings = res.data.result || [];
        const todayStr = new Date().toISOString().split('T')[0];
        let activeBooking = bookings.find((b: any) => b.status === 'ongoing') || 
                            bookings.find((b: any) => b.status === 'confirmed' && new Date(b.scheduledDate).toISOString().split('T')[0] === todayStr);

        if (activeBooking) {
            navigate(user.role === 'buddy' ? '/live-tracking/' + activeBooking._id : '/tourist/live/' + activeBooking._id);
        } else {
            // Route to general live map where they can see their own location without sharing
            navigate(user.role === 'buddy' ? '/live-tracking/general' : '/tourist/live/general');
        }
    } catch (err) {
        import('react-hot-toast').then(({ default: hotToast }) => hotToast.error('Lỗi khi tải thông tin chuyến đi.'));
    }
  };

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
    gap: '1rem',
    listStyle: 'none',
  }

  const linkStyle: React.CSSProperties = {
    color: '#475569',
    fontSize: '0.8rem',
    fontWeight: 600,
    textDecoration: 'none',
    transition: 'color 0.2s',
    fontFamily: "'Inter', sans-serif",
    whiteSpace: 'nowrap',
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
          <ul className="desktop-only" style={linksStyle}>
            <li>
              <Link to='/' style={linkStyle}
                onMouseEnter={e => (e.currentTarget.style.color = '#0284c7')}
                onMouseLeave={e => (e.currentTarget.style.color = '#475569')}>
                Trang chủ
              </Link>
            </li>
            <li>
              <Link to='/buddies' style={linkStyle}
                onMouseEnter={e => (e.currentTarget.style.color = '#0284c7')}
                onMouseLeave={e => (e.currentTarget.style.color = '#475569')}>
                Tìm Buddy
              </Link>
            </li>
            <li>
              <Link to='/smart-match' style={{ ...linkStyle, color: '#0ea5e9', display: 'flex', alignItems: 'center', gap: '3px' }}
                onMouseEnter={e => (e.currentTarget.style.color = '#0284c7')}
                onMouseLeave={e => (e.currentTarget.style.color = '#0ea5e9')}>
                ✨ Ghép Cặp Tour
              </Link>
            </li>
            {isAuthenticated && (
              <>
                {user?.role === 'admin' ? (
                  <li>
                    <Link to='/admin' style={linkStyle}
                      onMouseEnter={e => (e.currentTarget.style.color = '#0284c7')}
                      onMouseLeave={e => (e.currentTarget.style.color = '#475569')}>
                      Admin Portal
                    </Link>
                  </li>
                ) : (
                  <>
                    <li>
                      <Link to='/dashboard' style={linkStyle}
                        onMouseEnter={e => (e.currentTarget.style.color = '#0284c7')}
                        onMouseLeave={e => (e.currentTarget.style.color = '#475569')}>
                        Dashboard
                      </Link>
                    </li>
                    <li style={{ position: 'relative' }}>
                      <div 
                        style={{ ...linkStyle, display: 'flex', alignItems: 'center', gap: '4px', cursor: 'pointer' }}
                        onClick={(e) => {
                          e.stopPropagation();
                          setDropdownOpen(!dropdownOpen);
                        }}
                      >
                        Chức năng <ChevronDown size={14} style={{ transform: dropdownOpen ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s' }} />
                      </div>
                      
                      {dropdownOpen && (
                        <ul style={{
                          position: 'absolute', top: '100%', left: '50%', transform: 'translateX(-50%)',
                          background: 'white', padding: '0.5rem 0', borderRadius: '12px',
                          boxShadow: '0 10px 25px rgba(0,0,0,0.1)', listStyle: 'none',
                          minWidth: '200px', display: 'flex', flexDirection: 'column',
                          marginTop: '0.5rem', border: '1px solid rgba(14, 165, 233, 0.1)'
                        }}>
                          <li>
                            <Link to='/my-trips' style={{...linkStyle, display: 'block', padding: '0.75rem 1.25rem'}}
                              onMouseEnter={e => { e.currentTarget.style.background = '#f0f9ff'; e.currentTarget.style.color = '#0284c7'; }}
                              onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#475569'; }}>
                              Chuyến đi của tôi
                            </Link>
                          </li>
                          <li>
                            <Link to='/conversations' style={{...linkStyle, display: 'block', padding: '0.75rem 1.25rem'}}
                              onMouseEnter={e => { e.currentTarget.style.background = '#f0f9ff'; e.currentTarget.style.color = '#0284c7'; }}
                              onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#475569'; }}>
                              Tin nhắn
                            </Link>
                          </li>
                          <li>
                            <Link to='/wallet' style={{...linkStyle, display: 'block', padding: '0.75rem 1.25rem'}}
                              onMouseEnter={e => { e.currentTarget.style.background = '#f0f9ff'; e.currentTarget.style.color = '#0284c7'; }}
                              onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#475569'; }}>
                              Ví tiền
                            </Link>
                          </li>
                          <li>
                            <Link to='/calendar' style={{...linkStyle, display: 'block', padding: '0.75rem 1.25rem'}}
                              onMouseEnter={e => { e.currentTarget.style.background = '#f0f9ff'; e.currentTarget.style.color = '#0284c7'; }}
                              onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#475569'; }}>
                              Lịch trình
                            </Link>
                          </li>
                          {user?.role === 'tourist' && (
                            <>
                              <li>
                                <Link to='/my-requests' style={{...linkStyle, display: 'block', padding: '0.75rem 1.25rem'}}
                                  onMouseEnter={e => { e.currentTarget.style.background = '#f0f9ff'; e.currentTarget.style.color = '#0284c7'; }}
                                  onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#475569'; }}>
                                  Yêu cầu chuyến đi
                                </Link>
                              </li>
                              <li>
                                <a href='#' onClick={navigateToLiveTracking} style={{...linkStyle, display: 'block', padding: '0.75rem 1.25rem', color: '#0ea5e9'}}
                                  onMouseEnter={e => { e.currentTarget.style.background = '#f0f9ff'; }}
                                  onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; }}>
                                  🗺️ Xem Bản Đồ (Live Map)
                                </a>
                              </li>
                            </>
                          )}
                          {user?.role === 'buddy' && (
                            <>
                              <li>
                                <Link to='/trip-requests/open' style={{...linkStyle, display: 'block', padding: '0.75rem 1.25rem'}}
                                  onMouseEnter={e => { e.currentTarget.style.background = '#f0f9ff'; e.currentTarget.style.color = '#0284c7'; }}
                                  onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#475569'; }}>
                                  Bảng yêu cầu
                                </Link>
                              </li>
                              <li>
                                <a href='#' onClick={navigateToLiveTracking} style={{...linkStyle, display: 'block', padding: '0.75rem 1.25rem', color: '#ef4444'}}
                                  onMouseEnter={e => { e.currentTarget.style.background = '#fef2f2'; }}
                                  onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; }}>
                                  🚨 Mở Live SOS & Map
                                </a>
                              </li>
                            </>
                          )}
                        </ul>
                      )}
                    </li>
                  </>
                )}
              </>
            )}
          </ul>

          {/* Actions */}
          <div className="desktop-only" style={actionsStyle}>
            {/* Theme Toggle */}
            <button
              onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
              style={{
                background: 'transparent',
                border: 'none',
                cursor: 'pointer',
                color: 'var(--color-text)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '8px',
                borderRadius: '50%',
                transition: 'background 0.2s',
                marginRight: '8px'
              }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'var(--color-surface-hover)' }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'transparent' }}
              title={theme === 'light' ? 'Chế độ tối' : 'Chế độ sáng'}
            >
              {theme === 'light' ? <Moon size={18} /> : <Sun size={18} />}
            </button>

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

          {/* Mobile Menu Toggle Button */}
          <button 
            className="mobile-only"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            style={{
              background: 'transparent', border: 'none', color: 'var(--color-text)', 
              padding: '0.5rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center'
            }}
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile Menu Overlay */}
        {mobileMenuOpen && (
          <div style={{
            position: 'absolute', top: '100%', left: 0, right: 0,
            background: 'var(--color-surface)', borderBottom: '1px solid var(--color-border)',
            boxShadow: '0 10px 25px rgba(0,0,0,0.1)', padding: '1.5rem',
            display: 'flex', flexDirection: 'column', gap: '1.25rem', zIndex: 199
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: '1rem', borderBottom: '1px solid var(--color-border)' }}>
              <span style={{ fontWeight: 700, color: 'var(--color-text-muted)' }}>Menu</span>
              <button
                onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
                style={{
                  background: 'var(--color-bg)', border: '1px solid var(--color-border)', color: 'var(--color-text)',
                  padding: '6px 12px', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer'
                }}
              >
                {theme === 'light' ? <Moon size={16} /> : <Sun size={16} />} 
                <span style={{ fontSize: '0.8rem', fontWeight: 600 }}>{theme === 'light' ? 'Chế độ tối' : 'Chế độ sáng'}</span>
              </button>
            </div>
            
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <li><Link to='/' style={{...linkStyle, fontSize: '1rem'}}>Trang chủ</Link></li>
              <li><Link to='/buddies' style={{...linkStyle, fontSize: '1rem'}}>Tìm Buddy</Link></li>
              <li><Link to='/smart-match' style={{...linkStyle, fontSize: '1rem', color: '#0ea5e9'}}>✨ Ghép Cặp Tour</Link></li>
              
              {isAuthenticated && user?.role === 'admin' && (
                <li><Link to='/admin' style={{...linkStyle, fontSize: '1rem'}}>Admin Portal</Link></li>
              )}
              
              {isAuthenticated && user?.role !== 'admin' && (
                <>
                  <li><Link to='/dashboard' style={{...linkStyle, fontSize: '1rem'}}>Dashboard</Link></li>
                  <li><Link to='/my-trips' style={{...linkStyle, fontSize: '1rem'}}>Chuyến đi của tôi</Link></li>
                  <li><Link to='/conversations' style={{...linkStyle, fontSize: '1rem'}}>Tin nhắn</Link></li>
                  <li><Link to='/wallet' style={{...linkStyle, fontSize: '1rem'}}>Ví tiền</Link></li>
                  <li><Link to='/calendar' style={{...linkStyle, fontSize: '1rem'}}>Lịch trình</Link></li>
                  
                  {user?.role === 'tourist' && (
                    <>
                      <li><Link to='/my-requests' style={{...linkStyle, fontSize: '1rem'}}>Yêu cầu chuyến đi</Link></li>
                      <li><a href='#' onClick={navigateToLiveTracking} style={{...linkStyle, fontSize: '1rem', color: '#0ea5e9'}}>🗺️ Xem Bản Đồ (Live Map)</a></li>
                    </>
                  )}
                  {user?.role === 'buddy' && (
                    <>
                      <li><Link to='/trip-requests/open' style={{...linkStyle, fontSize: '1rem'}}>Bảng yêu cầu</Link></li>
                      <li><a href='#' onClick={navigateToLiveTracking} style={{...linkStyle, fontSize: '1rem', color: '#ef4444'}}>🚨 Mở Live SOS & Map</a></li>
                    </>
                  )}
                </>
              )}
            </ul>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginTop: '1rem' }}>
              {isAuthenticated ? (
                <>
                  <Link to='/profile' style={{ textDecoration: 'none', width: '100%' }}>
                    <div style={{...btnSecondaryStyle, width: '100%', justifyContent: 'center', boxSizing: 'border-box'}}><User size={15} /> Hồ sơ cá nhân</div>
                  </Link>
                  <button style={{...btnLogoutStyle, width: '100%', justifyContent: 'center'}} onClick={handleLogout}>
                    <LogOut size={15} /> Đăng xuất
                  </button>
                </>
              ) : (
                <>
                  <Link to='/login' style={{ textDecoration: 'none', width: '100%' }}>
                    <div style={{...btnSecondaryStyle, width: '100%', justifyContent: 'center', boxSizing: 'border-box'}}>Đăng nhập</div>
                  </Link>
                  <Link to='/register' style={{ textDecoration: 'none', width: '100%' }}>
                    <div style={{...btnPrimaryStyle, width: '100%', justifyContent: 'center', boxSizing: 'border-box'}}>Đăng ký</div>
                  </Link>
                </>
              )}
            </div>
          </div>
        )}
      </nav>

      {/* Navbar spacer — push content below fixed nav */}
      <div style={{ height: '64px' }} />
    </>
  )
}
