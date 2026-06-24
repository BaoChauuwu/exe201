import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Sparkles, Compass, DollarSign, Clock, Utensils,
  MapPin, ChevronRight, ChevronLeft, Check, ArrowRight,
  Smile
} from 'lucide-react';
import Navbar from '../components/layout/Navbar';
import { experienceApi, type IMatchResult } from '../api/experience.api';
import toast from 'react-hot-toast';
import { Link } from 'react-router-dom';

const STEPS = [
  { id: 'budget', title: 'Ngân sách' },
  { id: 'timeOfDay', title: 'Thời gian đi chơi' },
  { id: 'interests', title: 'Hoạt động yêu thích' },
  { id: 'personality', title: 'Vibe của Buddy' },
  { id: 'conditions', title: 'Tiện ích đi kèm' }
];

export const SmartMatchWizard = () => {
  const savedStateStr = sessionStorage.getItem('smartMatchState');
  const savedState = savedStateStr ? JSON.parse(savedStateStr) : null;

  const [step, setStep] = useState(savedState?.step ?? 0); // 0 to 4: Quiz, 5: Scanning, 6: Results
  const [budget, setBudget] = useState<'low' | 'medium' | 'high'>(savedState?.budget ?? 'medium');
  const [timeOfDay, setTimeOfDay] = useState<'morning' | 'afternoon' | 'evening'>(savedState?.timeOfDay ?? 'afternoon');
  const [interests, setInterests] = useState<string[]>(savedState?.interests ?? []);
  const [personality, setPersonality] = useState<'nang_dong' | 'sau_sac' | 'am_ap'>(savedState?.personality ?? 'nang_dong');
  const [hasMotorbike, setHasMotorbike] = useState(savedState?.hasMotorbike ?? false);
  const [english, setEnglish] = useState(savedState?.english ?? false);
  
  const [results, setResults] = useState<IMatchResult[]>(savedState?.results ?? []);
  const [scanMessage, setScanMessage] = useState('Đang khởi tạo thuật toán...');

  useEffect(() => {
    sessionStorage.setItem('smartMatchState', JSON.stringify({
      step, budget, timeOfDay, interests, personality, hasMotorbike, english, results
    }));
  }, [step, budget, timeOfDay, interests, personality, hasMotorbike, english, results]);

  const handleInterestToggle = (val: string) => {
    if (interests.includes(val)) {
      setInterests(interests.filter(i => i !== val));
    } else {
      setInterests([...interests, val]);
    }
  };

  const handleNext = () => {
    if (step < 4) {
      setStep(step + 1);
    } else {
      startMatching();
    }
  };

  const handleBack = () => {
    if (step > 0) {
      setStep(step - 1);
    }
  };

  const startMatching = async () => {
    setStep(5);
    // setIsLoading(true);

    const messages = [
      '🔍 Đang phân tích ngân sách & khoảng giá...',
      '🌅 Cập nhật thời gian hoạt động tối ưu...',
      '🍴 Kết hợp sở thích và loại hình tour...',
      '🧠 Phân tích phong cách và Vibe của Local Buddy...',
      '🛵 Kiểm tra điều kiện phương tiện & ngoại ngữ...',
      '✨ Đang tính điểm tương thích...'
    ];

    let msgIndex = 0;
    const interval = setInterval(() => {
      if (msgIndex < messages.length) {
        setScanMessage(messages[msgIndex]);
        msgIndex++;
      }
    }, 400);

    try {
      const response = await experienceApi.match({
        budget,
        timeOfDay,
        interests,
        personality,
        hasMotorbike,
        english
      });
      
      // Artificial timeout to allow users to experience the "Scanning" transition
      setTimeout(() => {
        clearInterval(interval);
        setResults(response.data.data || []);
        setStep(6);
        // setIsLoading(false);
      }, 2000);
    } catch (err: any) {
      clearInterval(interval);
      toast.error('Có lỗi xảy ra khi tìm kiếm tour phù hợp.');
      setStep(4);
      // setIsLoading(false);
    }
  };

  const handleReset = () => {
    setStep(0);
    setBudget('medium');
    setTimeOfDay('afternoon');
    setInterests([]);
    setPersonality('nang_dong');
    setHasMotorbike(false);
    setEnglish(false);
    setResults([]);
    sessionStorage.removeItem('smartMatchState');
  };

  const formatPrice = (p: number) => {
    return p.toLocaleString('vi-VN') + ' đ/giờ';
  };

  const getCategoryEmoji = (cat: string) => {
    switch (cat) {
      case 'food': return '🍴 Ẩm thực';
      case 'adventure': return '🧗 Phượt/Phiêu lưu';
      case 'culture': return '🏛️ Văn hóa';
      case 'nightlife': return '💃 Bar/Pub/Đêm';
      default: return '☕ Trải nghiệm';
    }
  };

  const getPersonalityLabel = (tag: string) => {
    switch (tag) {
      case 'nang_dong': return '🔥 Năng động, Vui vẻ';
      case 'sau_sac': return '🧠 Điềm đạm, Sâu sắc';
      case 'am_ap': return '🌱 Ấm áp, Chu đáo';
      default: return tag;
    }
  };

  const currentStepInfo = STEPS[step] || { title: '' };

  return (
    <div style={{ 
      minHeight: '100vh', 
      background: 'var(--gradient-hero)', 
      fontFamily: "'Inter', -apple-system, sans-serif",
      paddingBottom: '4rem'
    }}>
      <Navbar />

      <div style={{ maxWidth: '800px', margin: '2.5rem auto 0', padding: '0 1.5rem' }}>
        
        {/* Header Title for Wizard */}
        {step < 5 && (
          <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
            <span style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              background: 'rgba(14, 165, 233, 0.1)',
              border: '1px solid rgba(14, 165, 233, 0.25)',
              borderRadius: '999px',
              padding: '0.4rem 1rem',
              color: '#0284c7',
              fontSize: '0.825rem',
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '0.05em'
            }}>
              <Sparkles size={14} /> Smart Match Wizard
            </span>
            <h1 style={{ 
              fontSize: '2rem', 
              fontWeight: 800, 
              color: '#0f172a',
              marginTop: '0.75rem',
              marginBottom: '0.5rem',
              letterSpacing: '-0.02em'
            }}>
              Tìm Tour Hợp Gu Nhất
            </h1>
            <p style={{ color: '#475569', fontSize: '0.9rem', maxWidth: '480px', margin: '0 auto' }}>
              Trả lời 5 câu hỏi nhanh để tìm người bạn đồng hành và tour du lịch hoàn hảo theo phong cách của bạn.
            </p>

            {/* Progress indicators */}
            <div style={{ 
              display: 'flex', 
              justifyContent: 'center', 
              alignItems: 'center', 
              gap: '0.5rem', 
              marginTop: '2rem' 
            }}>
              {STEPS.map((s, idx) => (
                <div key={s.id} style={{ display: 'flex', alignItems: 'center' }}>
                  <div style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '50%',
                    background: idx < step 
                      ? '#10b981' 
                      : idx === step 
                        ? 'linear-gradient(135deg, #0284c7, #0ea5e9)' 
                        : '#e2e8f0',
                    color: idx <= step ? 'white' : '#64748b',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '0.85rem',
                    fontWeight: 700,
                    border: idx === step ? '4px solid rgba(14, 165, 233, 0.15)' : 'none',
                    transition: 'all 0.3s ease'
                  }}>
                    {idx < step ? <Check size={16} /> : idx + 1}
                  </div>
                  {idx < STEPS.length - 1 && (
                    <div style={{
                      width: '40px',
                      height: '3px',
                      background: idx < step ? '#10b981' : '#e2e8f0',
                      marginLeft: '0.5rem',
                      marginRight: '0.5rem'
                    }} />
                  )}
                </div>
              ))}
            </div>
            
            <div style={{ color: '#64748b', fontSize: '0.8rem', marginTop: '0.75rem', fontWeight: 600 }}>
              Bước {step + 1}/{STEPS.length}: {currentStepInfo.title}
            </div>
          </div>
        )}

        {/* Wizard Main Panel */}
        <AnimatePresence mode="wait">
          {step === 0 && (
            <motion.div
              key="step-budget"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
              style={{
                background: '#ffffff',
                border: '1px solid rgba(14, 165, 233, 0.12)',
                borderRadius: '24px',
                padding: '2.5rem',
                boxShadow: '0 15px 40px rgba(14, 165, 233, 0.05)',
                display: 'flex',
                flexDirection: 'column',
                gap: '1.5rem'
              }}
            >
              <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#0f172a', margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <DollarSign style={{ color: '#0284c7' }} /> Ngân sách thuê Buddy của bạn ở mức nào?
              </h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '0.5rem' }}>
                {[
                  { value: 'low', title: '💰 Hạt dẻ', desc: 'Dưới 150k/giờ · Ưu tiên sinh viên, tiết kiệm tối đa' },
                  { value: 'medium', title: '💳 Hợp lý', desc: '150k - 300k/giờ · Cân bằng hoàn hảo giữa chi phí và dịch vụ' },
                  { value: 'high', title: '💎 Thoải mái', desc: 'Trên 300k/giờ · VIP Vibe, tự do trải nghiệm không giới hạn' }
                ].map(item => (
                  <div
                    key={item.value}
                    onClick={() => setBudget(item.value as any)}
                    style={{
                      padding: '1.25rem',
                      borderRadius: '16px',
                      border: budget === item.value 
                        ? '2px solid #0284c7' 
                        : '1px solid rgba(14, 165, 233, 0.15)',
                      background: budget === item.value 
                        ? 'rgba(2, 132, 199, 0.04)' 
                        : '#f8fafc',
                      cursor: 'pointer',
                      transition: 'all 0.2s',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between'
                    }}
                  >
                    <div>
                      <h3 style={{ margin: '0 0 0.25rem', fontSize: '1rem', fontWeight: 700, color: '#0f172a' }}>{item.title}</h3>
                      <p style={{ margin: 0, fontSize: '0.8rem', color: '#64748b' }}>{item.desc}</p>
                    </div>
                    <div style={{
                      width: '20px',
                      height: '20px',
                      borderRadius: '50%',
                      border: '2px solid #0284c7',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      background: budget === item.value ? '#0284c7' : 'transparent'
                    }}>
                      {budget === item.value && <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'white' }} />}
                    </div>
                  </div>
                ))}
              </div>
              
              <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '1.5rem' }}>
                <button onClick={handleNext} className="btn btn-primary" style={{ padding: '0.8rem 1.8rem', borderRadius: '12px' }}>
                  Tiếp tục <ChevronRight size={16} />
                </button>
              </div>
            </motion.div>
          )}

          {step === 1 && (
            <motion.div
              key="step-time"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
              style={{
                background: '#ffffff',
                border: '1px solid rgba(14, 165, 233, 0.12)',
                borderRadius: '24px',
                padding: '2.5rem',
                boxShadow: '0 15px 40px rgba(14, 165, 233, 0.05)',
                display: 'flex',
                flexDirection: 'column',
                gap: '1.5rem'
              }}
            >
              <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#0f172a', margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Clock style={{ color: '#0284c7' }} /> Bạn muốn bắt đầu chuyến phiêu lưu lúc nào?
              </h2>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '1rem', marginTop: '0.5rem' }}>
                {[
                  { value: 'morning', title: '🌅 Bình minh / Sáng sớm', desc: 'Bắt đầu từ 6:00 - 12:00 · Phù hợp check-in cà phê sáng, chợ địa phương' },
                  { value: 'afternoon', title: '🌇 Chiều lộng gió', desc: 'Bắt đầu từ 12:00 - 18:00 · Khám phá phố phường, ngắm hoàng hôn chill' },
                  { value: 'evening', title: '🌃 Phố lên đèn / Đêm muộn', desc: 'Bắt đầu từ 18:00 - 24:00 · Nhịp sống đêm, ăn vặt đêm muộn, dạo phố cổ' }
                ].map(item => (
                  <div
                    key={item.value}
                    onClick={() => setTimeOfDay(item.value as any)}
                    style={{
                      padding: '1.25rem',
                      borderRadius: '16px',
                      border: timeOfDay === item.value 
                        ? '2px solid #0284c7' 
                        : '1px solid rgba(14, 165, 233, 0.15)',
                      background: timeOfDay === item.value 
                        ? 'rgba(2, 132, 199, 0.04)' 
                        : '#f8fafc',
                      cursor: 'pointer',
                      transition: 'all 0.2s',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between'
                    }}
                  >
                    <div>
                      <h3 style={{ margin: '0 0 0.25rem', fontSize: '1rem', fontWeight: 700, color: '#0f172a' }}>{item.title}</h3>
                      <p style={{ margin: 0, fontSize: '0.8rem', color: '#64748b' }}>{item.desc}</p>
                    </div>
                    <div style={{
                      width: '20px',
                      height: '20px',
                      borderRadius: '50%',
                      border: '2px solid #0284c7',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      background: timeOfDay === item.value ? '#0284c7' : 'transparent'
                    }}>
                      {timeOfDay === item.value && <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'white' }} />}
                    </div>
                  </div>
                ))}
              </div>
              
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '1.5rem' }}>
                <button onClick={handleBack} className="btn btn-secondary" style={{ padding: '0.8rem 1.8rem', borderRadius: '12px' }}>
                  <ChevronLeft size={16} /> Quay lại
                </button>
                <button onClick={handleNext} className="btn btn-primary" style={{ padding: '0.8rem 1.8rem', borderRadius: '12px' }}>
                  Tiếp tục <ChevronRight size={16} />
                </button>
              </div>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div
              key="step-interests"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
              style={{
                background: '#ffffff',
                border: '1px solid rgba(14, 165, 233, 0.12)',
                borderRadius: '24px',
                padding: '2.5rem',
                boxShadow: '0 15px 40px rgba(14, 165, 233, 0.05)',
                display: 'flex',
                flexDirection: 'column',
                gap: '1.5rem'
              }}
            >
              <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#0f172a', margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Utensils style={{ color: '#0284c7' }} /> Kèo đi chơi lý tưởng của bạn là gì? (Chọn nhiều)
              </h2>
              <p style={{ color: '#64748b', fontSize: '0.825rem', margin: '-0.5rem 0 0.5rem' }}>
                Hãy chọn các hoạt động bạn muốn trải nghiệm nhất để hệ thống lọc ra các tour thích hợp.
              </p>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}>
                {[
                  { value: 'am_thuc', label: '🍴 Ẩm thực càn quét', desc: 'Thưởng thức đặc sản lề đường, chợ đêm' },
                  { value: 'chup_anh', label: '📸 Sống ảo check-in', desc: 'Chụp hình đẹp, săn góc ảnh lạ' },
                  { value: 'van_hoa', label: '🏛️ Lịch sử văn hóa', desc: 'Bảo tàng, phố cổ, lắng nghe câu chuyện xưa' },
                  { value: 'phuot', label: '🧗 Phượt xe máy, dã ngoại', desc: 'Thử thách địa hình, leo núi, phiêu lưu' },
                  { value: 'chill', label: '☕ Cà phê chill nhẹ nhàng', desc: 'Quán nước đẹp, trò chuyện thư giãn' },
                  { value: 'nightlife', label: '💃 Bar/Pub náo nhiệt', desc: 'Xập xình về đêm, vui tươi hết cỡ' }
                ].map(item => {
                  const isSelected = interests.includes(item.value);
                  return (
                    <div
                      key={item.value}
                      onClick={() => handleInterestToggle(item.value)}
                      style={{
                        padding: '1.1rem',
                        borderRadius: '16px',
                        border: isSelected 
                          ? '2px solid #0284c7' 
                          : '1px solid rgba(14, 165, 233, 0.15)',
                        background: isSelected 
                          ? 'rgba(2, 132, 199, 0.04)' 
                          : '#f8fafc',
                        cursor: 'pointer',
                        transition: 'all 0.2s',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'space-between',
                        gap: '0.35rem'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <span style={{ fontSize: '0.95rem', fontWeight: 700, color: '#0f172a' }}>{item.label}</span>
                        <div style={{
                          width: '18px',
                          height: '18px',
                          borderRadius: '4px',
                          border: '2px solid #0284c7',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          background: isSelected ? '#0284c7' : 'transparent',
                          color: 'white'
                        }}>
                          {isSelected && <Check size={12} strokeWidth={3} />}
                        </div>
                      </div>
                      <span style={{ fontSize: '0.75rem', color: '#64748b' }}>{item.desc}</span>
                    </div>
                  );
                })}
              </div>
              
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '1.5rem' }}>
                <button onClick={handleBack} className="btn btn-secondary" style={{ padding: '0.8rem 1.8rem', borderRadius: '12px' }}>
                  <ChevronLeft size={16} /> Quay lại
                </button>
                <button 
                  onClick={handleNext} 
                  disabled={interests.length === 0}
                  className="btn btn-primary" 
                  style={{ padding: '0.8rem 1.8rem', borderRadius: '12px' }}
                >
                  Tiếp tục <ChevronRight size={16} />
                </button>
              </div>
            </motion.div>
          )}

          {step === 3 && (
            <motion.div
              key="step-personality"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
              style={{
                background: '#ffffff',
                border: '1px solid rgba(14, 165, 233, 0.12)',
                borderRadius: '24px',
                padding: '2.5rem',
                boxShadow: '0 15px 40px rgba(14, 165, 233, 0.05)',
                display: 'flex',
                flexDirection: 'column',
                gap: '1.5rem'
              }}
            >
              <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#0f172a', margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Smile style={{ color: '#0284c7' }} /> Bạn muốn đồng hành cùng một Local Buddy thế nào?
              </h2>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '1rem', marginTop: '0.5rem' }}>
                {[
                  { value: 'nang_dong', title: '🔥 Năng động, Vui vẻ', desc: 'Rất hoạt ngôn, kể chuyện vui dí dỏm, tràn đầy năng lượng tích cực' },
                  { value: 'sau_sac', title: '🧠 Sâu sắc, Điềm đạm', desc: 'Hiểu biết sâu rộng về địa phương, thích lắng nghe và chia sẻ câu chuyện văn hóa sâu lắng' },
                  { value: 'am_ap', title: '🌱 Ấm áp, Chu đáo', desc: 'Tinh tế, chăm sóc cẩn thận từng chi tiết nhỏ, tạo cảm giác thân thuộc như người nhà' }
                ].map(item => (
                  <div
                    key={item.value}
                    onClick={() => setPersonality(item.value as any)}
                    style={{
                      padding: '1.25rem',
                      borderRadius: '16px',
                      border: personality === item.value 
                        ? '2px solid #0284c7' 
                        : '1px solid rgba(14, 165, 233, 0.15)',
                      background: personality === item.value 
                        ? 'rgba(2, 132, 199, 0.04)' 
                        : '#f8fafc',
                      cursor: 'pointer',
                      transition: 'all 0.2s',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between'
                    }}
                  >
                    <div>
                      <h3 style={{ margin: '0 0 0.25rem', fontSize: '1rem', fontWeight: 700, color: '#0f172a' }}>{item.title}</h3>
                      <p style={{ margin: 0, fontSize: '0.8rem', color: '#64748b' }}>{item.desc}</p>
                    </div>
                    <div style={{
                      width: '20px',
                      height: '20px',
                      borderRadius: '50%',
                      border: '2px solid #0284c7',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      background: personality === item.value ? '#0284c7' : 'transparent'
                    }}>
                      {personality === item.value && <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'white' }} />}
                    </div>
                  </div>
                ))}
              </div>
              
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '1.5rem' }}>
                <button onClick={handleBack} className="btn btn-secondary" style={{ padding: '0.8rem 1.8rem', borderRadius: '12px' }}>
                  <ChevronLeft size={16} /> Quay lại
                </button>
                <button onClick={handleNext} className="btn btn-primary" style={{ padding: '0.8rem 1.8rem', borderRadius: '12px' }}>
                  Tiếp tục <ChevronRight size={16} />
                </button>
              </div>
            </motion.div>
          )}

          {step === 4 && (
            <motion.div
              key="step-conditions"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
              style={{
                background: '#ffffff',
                border: '1px solid rgba(14, 165, 233, 0.12)',
                borderRadius: '24px',
                padding: '2.5rem',
                boxShadow: '0 15px 40px rgba(14, 165, 233, 0.05)',
                display: 'flex',
                flexDirection: 'column',
                gap: '1.5rem'
              }}
            >
              <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#0f172a', margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Compass style={{ color: '#0284c7' }} /> Tiện ích đi kèm & Yêu cầu đặc biệt khác
              </h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '0.5rem' }}>
                <div
                  onClick={() => setHasMotorbike(!hasMotorbike)}
                  style={{
                    padding: '1.25rem',
                    borderRadius: '16px',
                    border: hasMotorbike 
                      ? '2px solid #0284c7' 
                      : '1px solid rgba(14, 165, 233, 0.15)',
                    background: hasMotorbike 
                      ? 'rgba(2, 132, 199, 0.04)' 
                      : '#f8fafc',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between'
                  }}
                >
                  <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                    <div style={{ fontSize: '1.5rem' }}>🛵</div>
                    <div>
                      <h3 style={{ margin: '0 0 0.15rem', fontSize: '0.95rem', fontWeight: 700, color: '#0f172a' }}>Cần xe máy đưa đón</h3>
                      <p style={{ margin: 0, fontSize: '0.78rem', color: '#64748b' }}>Buddy sẽ đón bạn bằng xe máy tại điểm hẹn hoặc khách sạn</p>
                    </div>
                  </div>
                  <div style={{
                    width: '20px',
                    height: '20px',
                    borderRadius: '4px',
                    border: '2px solid #0284c7',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    background: hasMotorbike ? '#0284c7' : 'transparent',
                    color: 'white'
                  }}>
                    {hasMotorbike && <Check size={14} strokeWidth={3} />}
                  </div>
                </div>

                <div
                  onClick={() => setEnglish(!english)}
                  style={{
                    padding: '1.25rem',
                    borderRadius: '16px',
                    border: english 
                      ? '2px solid #0284c7' 
                      : '1px solid rgba(14, 165, 233, 0.15)',
                    background: english 
                      ? 'rgba(2, 132, 199, 0.04)' 
                      : '#f8fafc',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between'
                  }}
                >
                  <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                    <div style={{ fontSize: '1.5rem' }}>🗣️</div>
                    <div>
                      <h3 style={{ margin: '0 0 0.15rem', fontSize: '0.95rem', fontWeight: 700, color: '#0f172a' }}>Giao tiếp ngoại ngữ tốt</h3>
                      <p style={{ margin: 0, fontSize: '0.78rem', color: '#64748b' }}>Phù hợp với du khách nước ngoài hoặc muốn luyện tiếng Anh</p>
                    </div>
                  </div>
                  <div style={{
                    width: '20px',
                    height: '20px',
                    borderRadius: '4px',
                    border: '2px solid #0284c7',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    background: english ? '#0284c7' : 'transparent',
                    color: 'white'
                  }}>
                    {english && <Check size={14} strokeWidth={3} />}
                  </div>
                </div>
              </div>
              
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '1.5rem' }}>
                <button onClick={handleBack} className="btn btn-secondary" style={{ padding: '0.8rem 1.8rem', borderRadius: '12px' }}>
                  <ChevronLeft size={16} /> Quay lại
                </button>
                <button onClick={handleNext} className="btn btn-primary" style={{ padding: '0.8rem 2.2rem', borderRadius: '12px', background: 'linear-gradient(135deg, #10b981, #059669)', boxShadow: '0 4px 15px rgba(16, 185, 129, 0.2)' }}>
                  Tìm Tour Hợp Gu <Sparkles size={16} style={{ marginLeft: '4px' }} />
                </button>
              </div>
            </motion.div>
          )}

          {step === 5 && (
            <motion.div
              key="step-scanning"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              style={{
                background: '#ffffff',
                border: '1px solid rgba(14, 165, 233, 0.12)',
                borderRadius: '24px',
                padding: '4rem 2rem',
                boxShadow: '0 15px 40px rgba(14, 165, 233, 0.05)',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '2rem',
                textAlign: 'center'
              }}
            >
              {/* Radar Scanner Animation */}
              <div style={{ position: 'relative', width: '150px', height: '150px' }}>
                <div style={{
                  position: 'absolute',
                  inset: 0,
                  borderRadius: '50%',
                  border: '2px solid rgba(2, 132, 199, 0.15)',
                  animation: 'ping 2s cubic-bezier(0, 0, 0.2, 1) infinite'
                }} />
                <div style={{
                  position: 'absolute',
                  inset: '20px',
                  borderRadius: '50%',
                  border: '2px solid rgba(2, 132, 199, 0.3)',
                  animation: 'ping 2s cubic-bezier(0, 0, 0.2, 1) infinite',
                  animationDelay: '0.5s'
                }} />
                <div style={{
                  position: 'absolute',
                  inset: 0,
                  borderRadius: '50%',
                  background: 'conic-gradient(from 0deg, transparent 50%, rgba(2, 132, 199, 0.2) 100%)',
                  animation: 'spin 2s linear infinite'
                }} />
                <div style={{
                  position: 'absolute',
                  top: '50%',
                  left: '50%',
                  transform: 'translate(-50%, -50%)',
                  width: '64px',
                  height: '64px',
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, #0284c7, #0ea5e9)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 0 20px rgba(2, 132, 199, 0.4)'
                }}>
                  <Compass size={32} color="white" style={{ animation: 'pulse 1.5s ease-in-out infinite' }} />
                </div>
              </div>

              <div>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0f172a', margin: '0 0 0.5rem' }}>Đang tìm kiếm người bạn đồng hành...</h3>
                <p style={{ margin: 0, color: '#0284c7', fontSize: '0.9rem', fontWeight: 600, minHeight: '1.5rem' }}>
                  {scanMessage}
                </p>
              </div>

              <style>{`
                @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
                @keyframes ping { 75%, 100% { transform: scale(1.6); opacity: 0; } }
                @keyframes pulse { 0%, 100% { transform: scale(1); } 50% { transform: scale(1.1); } }
              `}</style>
            </motion.div>
          )}

          {step === 6 && (
            <motion.div
              key="step-results"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}
            >
              {/* Summary of criteria card */}
              <div style={{
                background: 'rgba(255,255,255,0.7)',
                border: '1px solid rgba(14, 165, 233, 0.12)',
                borderRadius: '20px',
                padding: '1.25rem 1.75rem',
                backdropFilter: 'blur(20px)',
                display: 'flex',
                flexWrap: 'wrap',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: '1rem'
              }}>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', alignItems: 'center' }}>
                  <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#475569', textTransform: 'uppercase', marginRight: '0.5rem' }}>Bộ lọc của bạn:</span>
                  <span style={{ background: '#f1f5f9', border: '1px solid #e2e8f0', color: '#334155', borderRadius: '8px', padding: '0.25rem 0.6rem', fontSize: '0.75rem', fontWeight: 600 }}>
                    💸 {budget === 'low' ? 'Hạt dẻ' : budget === 'medium' ? 'Hợp lý' : 'Thoải mái'}
                  </span>
                  <span style={{ background: '#f1f5f9', border: '1px solid #e2e8f0', color: '#334155', borderRadius: '8px', padding: '0.25rem 0.6rem', fontSize: '0.75rem', fontWeight: 600 }}>
                    ⏰ {timeOfDay === 'morning' ? 'Sáng' : timeOfDay === 'afternoon' ? 'Chiều' : 'Tối/Đêm'}
                  </span>
                  <span style={{ background: '#f1f5f9', border: '1px solid #e2e8f0', color: '#334155', borderRadius: '8px', padding: '0.25rem 0.6rem', fontSize: '0.75rem', fontWeight: 600 }}>
                    🔥 Vibe {getPersonalityLabel(personality).split(' ')[1]}
                  </span>
                  {hasMotorbike && (
                    <span style={{ background: '#f1f5f9', border: '1px solid #e2e8f0', color: '#334155', borderRadius: '8px', padding: '0.25rem 0.6rem', fontSize: '0.75rem', fontWeight: 600 }}>
                      🛵 Xe máy đón
                    </span>
                  )}
                  {english && (
                    <span style={{ background: '#f1f5f9', border: '1px solid #e2e8f0', color: '#334155', borderRadius: '8px', padding: '0.25rem 0.6rem', fontSize: '0.75rem', fontWeight: 600 }}>
                      🗣️ Tiếng Anh tốt
                    </span>
                  )}
                </div>
                <button onClick={handleReset} style={{
                  background: 'none',
                  border: 'none',
                  color: '#0284c7',
                  fontSize: '0.8rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  textDecoration: 'underline',
                  padding: 0
                }}>
                  Làm lại Trắc nghiệm
                </button>
              </div>

              {/* Title & Results summary */}
              <div>
                <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#0f172a', margin: '0 0 0.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  🎉 Đã tìm thấy {results.length} tour phù hợp với bạn
                </h2>
                <p style={{ margin: 0, color: '#64748b', fontSize: '0.85rem' }}>
                  Danh sách được sắp xếp tối ưu dựa trên điểm số tương thích ("Khớp Vibe") với tiêu chí trắc nghiệm.
                </p>
              </div>

              {results.length === 0 ? (
                <div style={{
                  background: '#ffffff',
                  border: '1px solid rgba(14, 165, 233, 0.12)',
                  borderRadius: '24px',
                  padding: '4rem 2rem',
                  textAlign: 'center',
                  boxShadow: '0 15px 40px rgba(14, 165, 233, 0.05)'
                }}>
                  <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🗺️</div>
                  <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#0f172a', margin: '0 0 0.5rem' }}>Chưa có tour nào đạt mức độ tương thích cao</h3>
                  <p style={{ color: '#64748b', fontSize: '0.85rem', maxWidth: '400px', margin: '0 auto 1.5rem' }}>
                    Hiện tại không có tour nào hoạt động thỏa mãn đầy đủ điều kiện bạn mong muốn. Bạn thử thay đổi tiêu chí ngân sách hoặc buổi đi xem sao nhé!
                  </p>
                  <button onClick={handleReset} className="btn btn-primary" style={{ padding: '0.75rem 1.5rem', borderRadius: '10px' }}>
                    Thử lại ngay
                  </button>
                </div>
              ) : (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '1.25rem' }}>
                  {results.map((exp) => {
                    // Score coloring variables
                    const isHighMatch = exp.score >= 80;
                    const isMedMatch = exp.score >= 50 && exp.score < 80;
                    
                    const scoreBg = isHighMatch 
                      ? 'linear-gradient(135deg, #10b981, #059669)' 
                      : isMedMatch 
                        ? 'linear-gradient(135deg, #fbbf24, #f59e0b)' 
                        : 'linear-gradient(135deg, #94a3b8, #64748b)';

                    return (
                      <div
                        key={exp._id}
                        style={{
                          background: '#ffffff',
                          border: '1px solid rgba(14, 165, 233, 0.12)',
                          borderRadius: '24px',
                          padding: '1.5rem',
                          boxShadow: '0 10px 30px rgba(14, 165, 233, 0.03)',
                          display: 'flex',
                          flexDirection: 'column',
                          gap: '1.25rem',
                          position: 'relative',
                          overflow: 'hidden',
                          transition: 'transform 0.2s, box-shadow 0.2s'
                        }}
                        onMouseEnter={e => {
                          e.currentTarget.style.transform = 'translateY(-2px)';
                          e.currentTarget.style.boxShadow = '0 15px 35px rgba(14, 165, 233, 0.08)';
                        }}
                        onMouseLeave={e => {
                          e.currentTarget.style.transform = 'translateY(0)';
                          e.currentTarget.style.boxShadow = '0 10px 30px rgba(14, 165, 233, 0.03)';
                        }}
                      >
                        {/* Match percentage badge overlay */}
                        <div style={{
                          position: 'absolute',
                          top: '1.25rem',
                          right: '1.25rem',
                          background: scoreBg,
                          color: 'white',
                          padding: '0.4rem 0.875rem',
                          borderRadius: '999px',
                          fontSize: '0.8rem',
                          fontWeight: 800,
                          boxShadow: '0 4px 10px rgba(0,0,0,0.1)',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '4px'
                        }}>
                          <Sparkles size={12} /> {exp.score}% Khớp Vibe
                        </div>

                        {/* Top layout: Image + Info */}
                        <div style={{ display: 'flex', gap: '1.25rem', flexWrap: 'wrap' }}>
                          {/* Image */}
                          <div style={{ 
                            width: '130px', 
                            height: '110px', 
                            borderRadius: '16px', 
                            overflow: 'hidden', 
                            background: '#f1f5f9',
                            flexShrink: 0 
                          }}>
                            {exp.images && exp.images.length > 0 ? (
                              <img
                                src={exp.images[0]}
                                alt={exp.title}
                                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                              />
                            ) : (
                              <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2rem' }}>
                                🏝️
                              </div>
                            )}
                          </div>

                          {/* Info Column */}
                          <div style={{ flex: 1, minWidth: '220px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                            <div>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.35rem' }}>
                                <span style={{
                                  background: 'rgba(2, 132, 199, 0.08)',
                                  color: '#0284c7',
                                  fontSize: '0.72rem',
                                  fontWeight: 700,
                                  padding: '0.15rem 0.5rem',
                                  borderRadius: '6px'
                                }}>
                                  {getCategoryEmoji(exp.category)}
                                </span>
                                <span style={{ color: '#94a3b8', fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '2px' }}>
                                  <MapPin size={10} /> {exp.city || 'Đà Nẵng'}
                                </span>
                              </div>
                              <h3 style={{ margin: '0 0 0.5rem', fontSize: '1.15rem', fontWeight: 800, color: '#0f172a', lineHeight: 1.35, paddingRight: '8rem' }}>
                                {exp.title}
                              </h3>
                              <p style={{ 
                                margin: 0, 
                                fontSize: '0.8rem', 
                                color: '#64748b', 
                                display: '-webkit-box',
                                WebkitLineClamp: 2,
                                WebkitBoxOrient: 'vertical',
                                overflow: 'hidden',
                                lineHeight: 1.4
                              }}>
                                {exp.description}
                              </p>
                            </div>

                            {/* Price details */}
                            <div style={{ display: 'flex', alignItems: 'baseline', gap: '4px', marginTop: '0.5rem' }}>
                              <span style={{ fontSize: '1rem', fontWeight: 800, color: '#0284c7' }}>{formatPrice(exp.price)}</span>
                              <span style={{ fontSize: '0.7rem', color: '#94a3b8' }}>/ tour · min {exp.minHours || 1} giờ</span>
                            </div>
                          </div>
                        </div>

                        {/* Mid layout: Matching details & Tags explanation */}
                        <div style={{ 
                          background: '#f8fafc', 
                          border: '1px solid rgba(14, 165, 233, 0.08)',
                          borderRadius: '16px', 
                          padding: '0.875rem 1.25rem',
                          display: 'flex',
                          flexDirection: 'column',
                          gap: '0.5rem'
                        }}>
                          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.85rem' }}>
                            {exp.matchDetails && exp.matchDetails.map((detail, dIdx) => (
                              <div key={dIdx} style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.78rem', color: '#059669', fontWeight: 600 }}>
                                <Check size={12} strokeWidth={3} /> {detail}
                              </div>
                            ))}
                          </div>
                          
                          {/* Tour features tags */}
                          {exp.tags && exp.tags.length > 0 && (
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', borderTop: '1px dashed rgba(14, 165, 233, 0.1)', paddingTop: '0.5rem' }}>
                              {exp.tags.map((tag, tIdx) => (
                                <span key={tIdx} style={{
                                  background: 'white',
                                  border: '1px solid rgba(14, 165, 233, 0.12)',
                                  borderRadius: '6px',
                                  padding: '0.15rem 0.4rem',
                                  fontSize: '0.7rem',
                                  color: '#475569'
                                }}>
                                  #{tag}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>

                        {/* Bottom layout: Buddy profile summary & Actions */}
                        <div style={{ 
                          display: 'flex', 
                          alignItems: 'center', 
                          justifyContent: 'space-between', 
                          flexWrap: 'wrap', 
                          gap: '1rem', 
                          borderTop: '1px solid rgba(14, 165, 233, 0.08)',
                          paddingTop: '1rem' 
                        }}>
                          {/* Buddy */}
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                            <div style={{ width: '40px', height: '40px', borderRadius: '50%', overflow: 'hidden', background: '#e2e8f0', border: '2px solid #e0f2fe' }}>
                              {exp.buddyId?.avatar ? (
                                <img
                                  src={exp.buddyId.avatar}
                                  alt={exp.buddyId.name}
                                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                />
                              ) : (
                                <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.25rem', background: '#bae6fd', color: '#0284c7' }}>
                                  👤
                                </div>
                              )}
                            </div>
                            <div>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#0f172a' }}>{exp.buddyId?.name || 'Local Buddy'}</span>
                                <span style={{
                                  background: 'rgba(16, 185, 129, 0.1)',
                                  color: '#10b981',
                                  fontSize: '0.65rem',
                                  fontWeight: 700,
                                  padding: '0.05rem 0.35rem',
                                  borderRadius: '4px'
                                }}>
                                  Verified
                                </span>
                              </div>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.72rem', color: '#64748b', marginTop: '0.15rem' }}>
                                <span>⭐ {exp.buddyId?.rating?.toFixed(1) || '5.0'}</span>
                                <span>•</span>
                                <span>Khớp Vibe: {exp.buddyId?.personalityTags?.map((tag: string) => getPersonalityLabel(tag).split(' ')[1]).join(', ') || 'Vui vẻ'}</span>
                              </div>
                            </div>
                          </div>

                          {/* CTA buttons */}
                          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                            {exp.buddyId?._id && (
                              <Link to={`/chat/${exp.buddyId._id}`} className="btn btn-secondary btn-sm" style={{ borderRadius: '10px' }}>
                                Trò chuyện
                              </Link>
                            )}
                            <Link to={`/experiences/${exp._id}`} className="btn btn-primary btn-sm" style={{ borderRadius: '10px', boxShadow: 'none' }}>
                              Chi tiết Tour <ArrowRight size={14} />
                            </Link>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};
