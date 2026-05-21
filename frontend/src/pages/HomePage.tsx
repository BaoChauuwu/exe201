import { Link } from 'react-router-dom'
import {
  Plane, Globe, Map, Users, Star, Shield,
  Compass, ArrowRight, Zap, Award, Heart
} from 'lucide-react'
import Navbar from '../components/layout/Navbar'
import Footer from '../components/layout/Footer'

const features = [
  {
    icon: <Map size={24} />,
    iconClass: 'feature-icon-blue',
    title: 'Lên kế hoạch thông minh',
    desc: 'AI gợi ý lịch trình tối ưu dựa trên ngân sách và sở thích của bạn.'
  },
  {
    icon: <Users size={24} />,
    iconClass: 'feature-icon-purple',
    title: 'Cộng đồng du lịch',
    desc: 'Kết nối với hàng nghìn bạn trẻ cùng đam mê khám phá thế giới.'
  },
  {
    icon: <Globe size={24} />,
    iconClass: 'feature-icon-amber',
    title: 'Khám phá toàn cầu',
    desc: 'Hơn 10,000 điểm đến trên toàn thế giới với đánh giá thực tế từ sinh viên.'
  },
  {
    icon: <Shield size={24} />,
    iconClass: 'feature-icon-green',
    title: 'An toàn & Tin cậy',
    desc: 'Hệ thống xác thực và đánh giá đảm bảo mọi trải nghiệm đều chân thực.'
  },
  {
    icon: <Zap size={24} />,
    iconClass: 'feature-icon-pink',
    title: 'Đặt nhanh, giá tốt',
    desc: 'So sánh và đặt tour, khách sạn ngay trong ứng dụng với giá sinh viên ưu đãi.'
  },
  {
    icon: <Heart size={24} />,
    iconClass: 'feature-icon-cyan',
    title: 'Lưu kỷ niệm',
    desc: 'Chia sẻ hành trình, ảnh và câu chuyện của bạn với cả cộng đồng.'
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
                ✈️ Nền tảng du lịch cho sinh viên
              </div>

              <h1 className='hero-title animate-fade-in-up animate-delay-1'>
                Khám phá thế giới
                <br />
                cùng <span className='gradient-text'>UniTravel</span>
              </h1>

              <p className='hero-description animate-fade-in-up animate-delay-2'>
                Du lịch thông minh, kết nối cộng đồng, tiết kiệm chi phí. 
                Dành riêng cho sinh viên Việt Nam yêu thích khám phá.
              </p>

              <div className='hero-actions animate-fade-in-up animate-delay-3'>
                <Link to='/register'>
                  <button className='btn btn-primary btn-lg' id='hero-cta-register'>
                    Bắt đầu ngay <ArrowRight size={18} />
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
                  <div className='hero-stat-value'>10K+</div>
                  <div className='hero-stat-label'>Người dùng</div>
                </div>
                <div style={{ width: '1px', background: 'var(--color-border)' }} />
                <div>
                  <div className='hero-stat-value'>500+</div>
                  <div className='hero-stat-label'>Tour địa điểm</div>
                </div>
                <div style={{ width: '1px', background: 'var(--color-border)' }} />
                <div>
                  <div className='hero-stat-value'>50+</div>
                  <div className='hero-stat-label'>Tỉnh thành</div>
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
                    <Plane size={20} color='#fff' />
                  </div>
                  <div>
                    <div style={{ fontWeight: 700 }}>Đà Lạt Weekend Trip</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>3 ngày 2 đêm</div>
                  </div>
                  <div style={{
                    marginLeft: 'auto', background: 'rgba(16,185,129,0.15)',
                    color: '#10b981', padding: '4px 12px', borderRadius: '999px',
                    fontSize: '0.75rem', fontWeight: 600
                  }}>Còn chỗ</div>
                </div>

                <div style={{
                  background: 'rgba(14,165,233,0.08)', borderRadius: '12px',
                  padding: '16px', marginBottom: '16px',
                  border: '1px solid rgba(14,165,233,0.15)'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                    <span style={{ color: 'var(--color-text-muted)', fontSize: '0.8rem' }}>Tiến độ đặt tour</span>
                    <span style={{ color: 'var(--color-primary)', fontSize: '0.8rem', fontWeight: 600 }}>8/12 người</span>
                  </div>
                  <div style={{ background: 'var(--color-border)', borderRadius: '4px', height: '6px' }}>
                    <div style={{
                      width: '66%', height: '100%',
                      background: 'var(--gradient-primary)', borderRadius: '4px'
                    }} />
                  </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <div className='gradient-gold' style={{ fontSize: '1.5rem', fontWeight: 800 }}>850K</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>/ người</div>
                  </div>
                  <button className='btn btn-primary btn-sm'>Đặt ngay</button>
                </div>
              </div>

              {/* Floating cards */}
              <div className='hero-card-float hero-card-float-1'>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Star size={16} style={{ color: '#f59e0b' }} fill='#f59e0b' />
                  <span style={{ fontWeight: 700, fontSize: '0.875rem' }}>4.9</span>
                  <span style={{ color: 'var(--color-text-muted)', fontSize: '0.75rem' }}>Rating</span>
                </div>
              </div>

              <div className='hero-card-float hero-card-float-2'>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Award size={16} style={{ color: 'var(--color-primary)' }} />
                  <span style={{ fontSize: '0.875rem', fontWeight: 600 }}>Best Travel App 2024</span>
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
            <div className='section-badge'>Tính năng</div>
            <h2 className='section-title'>
              Mọi thứ bạn cần cho<br />
              <span className='gradient-text'>chuyến đi hoàn hảo</span>
            </h2>
            <p className='section-subtitle'>
              UniTravel tích hợp tất cả công cụ cần thiết để lên kế hoạch, 
              đặt chỗ và chia sẻ hành trình của bạn.
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
              Sẵn sàng khám phá chưa?
            </h2>
            <p style={{ color: 'var(--color-text-muted)', marginBottom: '2rem', maxWidth: '500px', margin: '0 auto 2rem' }}>
              Tham gia cùng hàng nghìn sinh viên đang dùng UniTravel để lên kế hoạch những chuyến đi đáng nhớ.
            </p>
            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
              <Link to='/register'>
                <button className='btn btn-primary btn-lg' id='cta-register-bottom'>
                  Tạo tài khoản miễn phí <ArrowRight size={18} />
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
