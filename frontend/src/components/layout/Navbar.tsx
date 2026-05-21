import { Link, useNavigate } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { Plane, User, LogOut } from 'lucide-react'
import { useAuthStore } from '../../store/authStore'
import { authApi } from '../../api/auth.api'

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const { isAuthenticated, logout, refreshToken } = useAuthStore()
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

  return (
    <nav className={`navbar ${scrolled ? 'scrolled' : ''}`}>
      <div className='container'>
        <div className='navbar-inner'>
          <Link to='/' className='navbar-logo'>
            <div className='navbar-logo-icon'>
              <Plane size={18} color='#fff' />
            </div>
            <span className='gradient-text'>UniTravel</span>
          </Link>

          <ul className='navbar-links'>
            <li><Link to='/'>Trang chủ</Link></li>
            <li><a href='#features'>Tính năng</a></li>
            {isAuthenticated && <li><Link to='/dashboard'>Dashboard</Link></li>}
          </ul>

          <div className='navbar-actions'>
            {isAuthenticated ? (
              <>
                <Link to='/profile'>
                  <button className='btn btn-secondary btn-sm' style={{ gap: '6px' }}>
                    <User size={16} /> Hồ sơ
                  </button>
                </Link>
                <button className='btn btn-ghost btn-sm' onClick={handleLogout} style={{ gap: '6px' }}>
                  <LogOut size={16} /> Đăng xuất
                </button>
              </>
            ) : (
              <>
                <Link to='/login'>
                  <button className='btn btn-secondary btn-sm'>Đăng nhập</button>
                </Link>
                <Link to='/register'>
                  <button className='btn btn-primary btn-sm'>Đăng ký</button>
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  )
}
