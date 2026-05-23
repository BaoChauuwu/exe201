import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import {
  Users, Star, Shield,
  Compass, ArrowRight, Zap, Heart, MapPin, Clock
} from 'lucide-react'
import { useAuthStore } from '../store/authStore'
import Navbar from '../components/layout/Navbar'
import Footer from '../components/layout/Footer'
import { experienceApi, type IExperience } from '../api/experience.api'

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
  const { isAuthenticated } = useAuthStore()
  const [experiences, setExperiences] = useState<IExperience[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [fetchError, setFetchError] = useState<string | null>(null)

  useEffect(() => {
    experienceApi.getAllPublic()
      .then(res => {
        console.log('[HomePage] API response:', res.data)
        const list = res.data.result || []
        console.log('[HomePage] Tours loaded:', list.length)
        setExperiences(list)
      })
      .catch(err => {
        console.error('[HomePage] Lỗi khi tải danh sách tour:', err)
        setFetchError(err?.response?.data?.message || err?.message || 'Không thể tải danh sách tour')
      })
      .finally(() => {
        setIsLoading(false)
      })
  }, [])

  const getCategoryLabel = (cat: string) => {
    switch (cat) {
      case 'food': return '🍴 Ẩm thực'
      case 'adventure': return '🧗 Phiêu lưu'
      case 'culture': return '🏛️ Văn hóa'
      case 'nightlife': return '💃 Giải trí đêm'
      default: return '🗺️ Khác'
    }
  }

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
                {isAuthenticated ? (
                  <>
                    <Link to='/buddies'>
                      <button className='btn btn-primary btn-lg' id='hero-cta-buddies'>
                        Khám phá Buddy ngay <ArrowRight size={18} />
                      </button>
                    </Link>
                    <Link to='/dashboard'>
                      <button className='btn btn-secondary btn-lg' id='hero-cta-dashboard'>
                        Vào Dashboard
                      </button>
                    </Link>
                  </>
                ) : (
                  <>
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
                  </>
                )}
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

      {/* ====== FEATURED EXPERIENCES ====== */}
      <section className='section' id='experiences' style={{ background: 'var(--color-bg)', padding: '5rem 0' }}>
        <div className='container'>
          <div className='section-header' style={{ marginBottom: '3.5rem' }}>
            <div className='section-badge'>Trải nghiệm độc đáo</div>
            <h2 className='section-title'>
              Trải nghiệm bản địa nổi bật<br />
              <span className='gradient-text'>Được dẫn dắt bởi Local Buddy</span>
            </h2>
            <p className='section-subtitle'>
              Khám phá các tour ẩm thực, văn hóa và phiêu lưu được thiết kế và hướng dẫn trực tiếp bởi những người bạn bản địa năng động.
            </p>
          </div>

          {isLoading ? (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '2rem', justifyContent: 'center' }}>
              {[1, 2, 3].map(i => (
                <div key={i} style={{ background: '#ffffff', border: '1px solid rgba(14, 165, 233, 0.12)', borderRadius: '24px', height: '360px', position: 'relative', overflow: 'hidden', boxShadow: '0 10px 30px rgba(14, 165, 233, 0.02)', maxWidth: '360px', width: '100%', margin: '0 auto' }}>
                  <div style={{ height: '180px', background: '#f1f5f9' }} />
                  <div style={{ padding: '1.5rem' }}>
                    <div style={{ width: '30%', height: '12px', background: '#e2e8f0', borderRadius: '4px', marginBottom: '1rem' }} />
                    <div style={{ width: '80%', height: '20px', background: '#e2e8f0', borderRadius: '6px', marginBottom: '0.75rem' }} />
                    <div style={{ width: '50%', height: '12px', background: '#e2e8f0', borderRadius: '4px', marginBottom: '1.5rem' }} />
                    <div style={{ width: '100%', height: '38px', background: '#f1f5f9', borderRadius: '10px' }} />
                  </div>
                </div>
              ))}
            </div>
          ) : fetchError ? (
            <div style={{ background: '#fff5f5', border: '1px dashed rgba(239,68,68,0.3)', borderRadius: '24px', padding: '4rem 2rem', textAlign: 'center', color: '#ef4444', maxWidth: '500px', margin: '0 auto' }}>
              <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>⚠️</div>
              <p style={{ fontWeight: 600 }}>Không thể tải danh sách tour</p>
              <p style={{ fontSize: '0.85rem', color: '#94a3b8', marginTop: '0.5rem' }}>{fetchError}</p>
            </div>
          ) : experiences.length === 0 ? (
            <div style={{ background: '#ffffff', border: '1px dashed rgba(14, 165, 233, 0.3)', borderRadius: '24px', padding: '4rem 2rem', textAlign: 'center', color: 'var(--color-text-muted)', maxWidth: '500px', margin: '0 auto' }}>
              <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🗺️</div>
              <p>Hiện tại chưa có tour trải nghiệm nào được duyệt. Quay lại sau nhé!</p>
            </div>
          ) : (

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '2rem', justifyContent: 'center' }}>
              {experiences.slice(0, 6).map(exp => (
                <div
                  key={exp._id}
                  style={{
                    background: '#ffffff',
                    border: '1px solid rgba(14, 165, 233, 0.12)',
                    borderRadius: '24px',
                    overflow: 'hidden',
                    display: 'flex',
                    flexDirection: 'column',
                    transition: 'all 0.3s ease',
                    boxShadow: '0 10px 30px rgba(14, 165, 233, 0.04)',
                    maxWidth: '360px',
                    width: '100%',
                    margin: '0 auto',
                  }}
                  onMouseEnter={e => {
                    const card = e.currentTarget as HTMLElement
                    card.style.transform = 'translateY(-6px)'
                    card.style.borderColor = 'rgba(14, 165, 233, 0.35)'
                    card.style.boxShadow = '0 15px 35px rgba(14, 165, 233, 0.08)'
                  }}
                  onMouseLeave={e => {
                    const card = e.currentTarget as HTMLElement
                    card.style.transform = 'translateY(0)'
                    card.style.borderColor = 'rgba(14, 165, 233, 0.12)'
                    card.style.boxShadow = '0 10px 30px rgba(14, 165, 233, 0.04)'
                  }}
                >
                  <div style={{ height: '180px', width: '100%', position: 'relative', overflow: 'hidden', background: '#f1f5f9' }}>
                    {exp.images && exp.images.length > 0 ? (
                      <img src={exp.images[0]} alt={exp.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    ) : (
                      <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-text-faint)' }}>🗺️ Chưa có ảnh</div>
                    )}
                    <div style={{ position: 'absolute', top: '1rem', left: '1rem', background: 'rgba(15, 12, 41, 0.75)', backdropFilter: 'blur(10px)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '8px', padding: '4px 10px', fontSize: '0.72rem', fontWeight: 700, color: '#fff' }}>
                      {getCategoryLabel(exp.category)}
                    </div>
                  </div>

                  <div style={{ padding: '1.5rem', flex: 1, display: 'flex', flexDirection: 'column' }}>
                    <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', marginBottom: '0.75rem', fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>
                      <MapPin size={12} style={{ color: 'var(--color-primary)' }} />
                      <span>{exp.city || 'Đà Nẵng'}</span>
                      <span style={{ margin: '0 4px', color: 'var(--color-text-faint)' }}>•</span>
                      <Clock size={12} style={{ color: 'var(--color-primary)' }} />
                      <span>{exp.minHours}h tối thiểu</span>
                    </div>

                    <h3 style={{ fontSize: '1.1rem', fontWeight: 800, margin: '0 0 0.5rem', lineHeight: 1.4, color: 'var(--color-text)' }}>{exp.title}</h3>
                    <p style={{ fontSize: '0.82rem', color: 'var(--color-text-muted)', margin: '0 0 1.25rem', lineHeight: 1.5, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{exp.description}</p>

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 'auto', paddingTop: '1rem', borderTop: '1px solid var(--color-border)' }}>
                      <div>
                        <div style={{ fontSize: '0.65rem', color: 'var(--color-text-faint)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Chi phí</div>
                        <div style={{ display: 'flex', alignItems: 'baseline', gap: '2px' }}>
                          <span style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--color-primary)' }}>{exp.price?.toLocaleString()}</span>
                          <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', fontWeight: 600 }}>{exp.currency || 'VND'}/h</span>
                        </div>
                      </div>

                      <Link to={isAuthenticated ? `/buddies/${exp.buddyId}` : '/register'} style={{ textDecoration: 'none' }}>
                        <button style={{ background: 'var(--gradient-primary)', border: 'none', borderRadius: '10px', padding: '0.5rem 1rem', color: 'white', fontSize: '0.8rem', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px', boxShadow: '0 4px 12px rgba(2, 132, 199, 0.25)' }}>
                          Khám phá Buddy <ArrowRight size={12} />
                        </button>
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
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
              {isAuthenticated ? (
                <Link to='/buddies'>
                  <button className='btn btn-primary btn-lg' id='cta-buddies-bottom'>
                    Bắt đầu tìm Buddy <ArrowRight size={18} />
                  </button>
                </Link>
              ) : (
                <Link to='/register'>
                  <button className='btn btn-primary btn-lg' id='cta-register-bottom'>
                    Đăng ký tài khoản miễn phí <ArrowRight size={18} />
                  </button>
                </Link>
              )}
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  )
}
