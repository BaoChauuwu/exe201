import { Link } from 'react-router-dom'
import {
  Users, Star, Shield,
  Compass, ArrowRight, Zap, Heart
} from 'lucide-react'
import Navbar from '../components/layout/Navbar'
import Footer from '../components/layout/Footer'

const features = [
  {
    icon: <Users size={24} />,
    iconClass: 'feature-icon-blue',
    title: 'Local Buddy đa dạng',
    desc: 'Hàng trăm hướng dẫn viên bản địa là sinh viên năng động am hiểu sâu sắc về văn hóa, ẩm thực địa phương.'
  },
  {
    icon: <Shield size={24} />,
    iconClass: 'feature-icon-green',
    title: 'Hồ sơ xác thực eKYC',
    desc: 'Tất cả Local Buddy đều được kiểm duyệt danh tính qua CCCD/Hộ chiếu nghiêm ngặt để đảm bảo an toàn.'
  },
  {
    icon: <Compass size={24} />,
    iconClass: 'feature-icon-purple',
    title: 'Lịch trình cá nhân hóa',
    desc: 'Tự do trao đổi trực tiếp và thiết kế lịch trình riêng biệt phù hợp hoàn toàn với sở thích cá nhân của bạn.'
  },
  {
    icon: <Zap size={24} />,
    iconClass: 'feature-icon-pink',
    title: 'Đặt lịch nhanh chóng',
    desc: 'Trao đổi trực tiếp qua chat, đặt lịch và thanh toán tiện lợi, an toàn ngay trên nền tảng.'
  },
  {
    icon: <Star size={24} />,
    iconClass: 'feature-icon-amber',
    title: 'Đánh giá chân thực',
    desc: 'Hệ thống đánh giá từ các khách hàng đi trước giúp bạn dễ dàng chọn được người bạn đồng hành ưng ý nhất.'
  },
  {
    icon: <Heart size={24} />,
    iconClass: 'feature-icon-cyan',
    title: 'Chi phí linh hoạt',
    desc: 'Thuê theo giờ hoặc theo ngày với mức phí hợp lý, minh bạch được niêm yết trực tiếp trên hồ sơ.'
  }
]

export default function HomePage() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <Navbar />

      {/* ====== HERO ====== */}
      <section className='hero'>
        <div className='hero-bg'>
          <div className='hero-orb hero-orb-1' />
          <div className='hero-orb hero-orb-2' />
          <div className='hero-orb hero-orb-3' />
        </div>

        <div className='container'>
          <div className='hero-content'>
            <div>
              <div className='hero-badge animate-fade-in-up'>
                <span className='hero-badge-dot' />
                ✈️ Nền tảng thuê hướng dẫn viên bản địa tự do
              </div>

              <h1 className='hero-title animate-fade-in-up animate-delay-1'>
                Thuê Local Buddy
                <br />
                Trải nghiệm <span className='gradient-text'>bản địa đích thực</span>
              </h1>

              <p className='hero-description animate-fade-in-up animate-delay-2'>
                Tìm kiếm và đặt lịch với các hướng dẫn viên địa phương (Local Buddy) để có hành trình du lịch cá nhân hóa, độc đáo, an toàn và tiết kiệm nhất.
              </p>

              <div className='hero-actions animate-fade-in-up animate-delay-3'>
                <Link to='/register'>
                  <button className='btn btn-primary btn-lg' id='hero-cta-register'>
                    Khám phá Buddy ngay <ArrowRight size={18} />
                  </button>
                </Link>
                <Link to='/login'>
                  <button className='btn btn-secondary btn-lg' id='hero-cta-login'>
                    Đăng nhập
                  </button>
                </Link>
              </div>

              <div className='hero-stats animate-fade-in-up animate-delay-4'>
                <div>
                  <div className='hero-stat-value'>500+</div>
                  <div className='hero-stat-label'>Buddy đã xác thực</div>
                </div>
                <div style={{ width: '1px', background: 'var(--color-border)' }} />
                <div>
                  <div className='hero-stat-value'>10K+</div>
                  <div className='hero-stat-label'>Chuyến đi hoàn thành</div>
                </div>
                <div style={{ width: '1px', background: 'var(--color-border)' }} />
                <div>
                  <div className='hero-stat-value'>4.9★</div>
                  <div className='hero-stat-label'>Đánh giá trung bình</div>
                </div>
              </div>
            </div>

            {/* Hero Visual */}
            <div className='hero-visual'>
              <div className='hero-card-main'>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
                  <div style={{
                    width: 44, height: 44, borderRadius: '50%',
                    background: 'var(--gradient-primary)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center'
                  }}>
                    <Users size={20} color='#fff' />
                  </div>
                  <div>
                    <div style={{ fontWeight: 700 }}>Lan Anh (Local Buddy)</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>Chuyên tour Đà Lạt ẩn mình</div>
                  </div>
                  <div style={{
                    marginLeft: 'auto', background: 'rgba(16,185,129,0.15)',
                    color: '#10b981', padding: '4px 12px', borderRadius: '999px',
                    fontSize: '0.75rem', fontWeight: 600
                  }}>Sẵn sàng</div>
                </div>

                <div style={{
                  background: 'rgba(14,165,233,0.08)', borderRadius: '12px',
                  padding: '16px', marginBottom: '16px',
                  border: '1px solid rgba(14,165,233,0.15)'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                    <span style={{ color: 'var(--color-text-muted)', fontSize: '0.8rem' }}>Lịch trống tuần này</span>
                    <span style={{ color: 'var(--color-primary)', fontSize: '0.8rem', fontWeight: 600 }}>4/7 ngày</span>
                  </div>
                  <div style={{ background: 'var(--color-border)', borderRadius: '4px', height: '6px' }}>
                    <div style={{
                      width: '57%', height: '100%',
                      background: 'var(--gradient-primary)', borderRadius: '4px'
                    }} />
                  </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <div className='gradient-gold' style={{ fontSize: '1.5rem', fontWeight: 800 }}>250K</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>/ giờ</div>
                  </div>
                  <Link to='/register'>
                    <button className='btn btn-primary btn-sm'>Đặt lịch ngay</button>
                  </Link>
                </div>
              </div>

              {/* Floating cards */}
              <div className='hero-card-float hero-card-float-1'>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Star size={16} style={{ color: '#f59e0b' }} fill='#f59e0b' />
                  <span style={{ fontWeight: 700, fontSize: '0.875rem' }}>4.95</span>
                  <span style={{ color: 'var(--color-text-muted)', fontSize: '0.75rem' }}>Rating</span>
                </div>
              </div>

              <div className='hero-card-float hero-card-float-2'>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Shield size={16} style={{ color: 'var(--color-primary)' }} />
                  <span style={{ fontSize: '0.875rem', fontWeight: 600 }}>Đã xác thực eKYC</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ====== FEATURES ====== */}
      <section className='section' id='features' style={{ background: 'var(--color-bg-2)' }}>
        <div className='container'>
          <div className='section-header'>
            <div className='section-badge'>Tại sao chọn chúng tôi</div>
            <h2 className='section-title'>
              Tại sao nên thuê Local Buddy<br />
              <span className='gradient-text'>trên UniTravel?</span>
            </h2>
            <p className='section-subtitle'>
              UniTravel cung cấp giải pháp kết nối trực tiếp giúp bạn dễ dàng thuê được hướng dẫn viên bản địa ưng ý, đảm bảo an toàn tuyệt đối.
            </p>
          </div>

          <div className='features-grid'>
            {features.map((f, i) => (
              <div key={i} className='feature-card animate-fade-in-up' style={{ animationDelay: `${i * 0.1}s` }}>
                <div className={`feature-icon ${f.iconClass}`}>{f.icon}</div>
                <h3 className='feature-title'>{f.title}</h3>
                <p className='feature-desc'>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ====== CTA ====== */}
      <section className='section' style={{ background: 'var(--color-bg)', textAlign: 'center' }}>
        <div className='container'>
          <div style={{
            background: 'var(--gradient-card)',
            border: '1px solid var(--color-border)',
            borderRadius: 'var(--radius-xl)',
            padding: '4rem 2rem',
            position: 'relative',
            overflow: 'hidden'
          }}>
            <div style={{
              position: 'absolute', inset: 0,
              background: 'radial-gradient(ellipse at center, rgba(14,165,233,0.08) 0%, transparent 70%)',
              pointerEvents: 'none'
            }} />
            <Compass size={48} style={{ color: 'var(--color-primary)', marginBottom: '1.5rem' }} />
            <h2 className='section-title' style={{ marginBottom: '1rem' }}>
              Sẵn sàng khám phá cùng Local Buddy?
            </h2>
            <p style={{ color: 'var(--color-text-muted)', marginBottom: '2rem', maxWidth: '500px', margin: '0 auto 2rem' }}>
              Tham gia cộng đồng UniTravel ngay hôm nay để bắt đầu lên lịch trình và thuê người dẫn đường địa phương năng động nhất.
            </p>
            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
              <Link to='/register'>
                <button className='btn btn-primary btn-lg' id='cta-register-bottom'>
                  Đăng ký tài khoản miễn phí <ArrowRight size={18} />
                </button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  )
}
