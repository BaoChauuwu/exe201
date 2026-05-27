import React, { useState, useRef, useCallback } from 'react';
import axios from 'axios';
import { CreditCard, Camera, UploadCloud, CheckCircle, Shield, X, AlertCircle } from 'lucide-react';
import Navbar from '../components/layout/Navbar';
import { useAuthStore } from '../store/authStore';
import toast from 'react-hot-toast';

// Convert File → base64 string
const toBase64 = (file: File): Promise<string> =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });

interface UploadSlot {
  label: string;
  icon: React.ReactNode;
  hint: string;
  file: File | null;
  preview: string;
  setFile: (f: File | null) => void;
  setPreview: (p: string) => void;
}

const UploadZone: React.FC<{
  slot: UploadSlot;
}> = ({ slot }) => {
  const [dragging, setDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const processFile = async (file: File) => {
    if (!file.type.startsWith('image/')) return;
    slot.setFile(file);
    const b64 = await toBase64(file);
    slot.setPreview(b64);
  };

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) processFile(file);
  }, []);

  const onDragOver = (e: React.DragEvent) => { e.preventDefault(); setDragging(true); };
  const onDragLeave = () => setDragging(false);
  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) processFile(file);
    e.target.value = '';
  };

  const zoneStyle: React.CSSProperties = {
    position: 'relative',
    background: dragging
      ? 'rgba(14, 165, 233, 0.08)'
      : slot.preview ? 'rgba(16,185,129,0.04)' : 'rgba(14, 165, 233, 0.02)',
    border: `2px dashed ${dragging ? '#0284c7' : slot.preview ? 'rgba(16,185,129,0.4)' : 'rgba(14, 165, 233, 0.18)'}`,
    borderRadius: '16px',
    padding: slot.preview ? '0' : '2rem 1rem',
    textAlign: 'center',
    cursor: 'pointer',
    transition: 'all 0.2s',
    overflow: 'hidden',
    minHeight: '160px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
  };

  return (
    <div style={zoneStyle}
      onDrop={onDrop} onDragOver={onDragOver} onDragLeave={onDragLeave}
      onClick={() => inputRef.current?.click()}
    >
      <input ref={inputRef} type='file' accept='image/*' style={{ display: 'none' }} onChange={onFileChange} />

      {slot.preview ? (
        <>
          <img src={slot.preview} alt='preview' style={{ width: '100%', height: '160px', objectFit: 'cover', display: 'block' }} />
          {/* Overlay with remove + label */}
          <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.45)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', opacity: 0, transition: 'opacity 0.2s' }}
            onMouseEnter={e => (e.currentTarget.style.opacity = '1')}
            onMouseLeave={e => (e.currentTarget.style.opacity = '0')}
          >
            <button
              type='button'
              onClick={ev => { ev.stopPropagation(); slot.setFile(null); slot.setPreview(''); }}
              style={{ background: 'rgba(239,68,68,0.85)', border: 'none', borderRadius: '50%', width: '36px', height: '36px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '0.5rem' }}
            >
              <X size={16} color='white' />
            </button>
            <span style={{ color: 'white', fontSize: '0.75rem', fontWeight: 600 }}>Đổi ảnh</span>
          </div>
          {/* Success badge */}
          <div style={{ position: 'absolute', top: '8px', right: '8px', background: 'rgba(16,185,129,0.9)', borderRadius: '999px', padding: '3px 10px', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.7rem', fontWeight: 700, color: 'white' }}>
            <CheckCircle size={11} /> OK
          </div>
        </>
      ) : (
        <>
          <div style={{ width: '48px', height: '48px', borderRadius: '14px', background: dragging ? 'rgba(14, 165, 233, 0.15)' : 'rgba(14, 165, 233, 0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '0.875rem', transition: 'all 0.2s' }}>
            <UploadCloud size={22} style={{ color: dragging ? '#0ea5e9' : 'rgba(14, 165, 233, 0.6)' }} />
          </div>
          <div style={{ fontWeight: 700, fontSize: '0.8rem', color: dragging ? '#0284c7' : '#475569', marginBottom: '0.25rem', display: 'flex', alignItems: 'center', gap: '0.35rem', justifyContent: 'center' }}>
            {slot.icon} {slot.label}
          </div>
          <p style={{ fontSize: '0.7rem', color: '#94a3b8', margin: 0, lineHeight: 1.5 }}>
            {dragging ? 'Thả ảnh vào đây' : 'Kéo thả hoặc click để chọn ảnh'}
          </p>
          <p style={{ fontSize: '0.65rem', color: '#94a3b8', marginTop: '0.35rem' }}>{slot.hint}</p>
        </>
      )}
    </div>
  );
};

export const EkycPage = () => {
  const { accessToken } = useAuthStore();

  const [frontFile, setFrontFile] = useState<File | null>(null);
  const [frontPreview, setFrontPreview] = useState('');
  const [backFile, setBackFile] = useState<File | null>(null);
  const [backPreview, setBackPreview] = useState('');
  const [selfieFile, setSelfieFile] = useState<File | null>(null);
  const [selfiePreview, setSelfiePreview] = useState('');

  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [errorMsg, setErrorMsg] = useState('');

  const allUploaded = frontPreview && backPreview && selfiePreview;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!accessToken) {
      setStatus('error');
      toast.error('Bạn chưa đăng nhập. Vui lòng đăng nhập lại.');
      return;
    }
    if (!allUploaded) {
      setStatus('error');
      toast.error('Vui lòng tải lên đủ 3 ảnh: Mặt trước CCCD, mặt sau CCCD và Selfie.');
      return;
    }

    setStatus('loading');

    try {
      // Convert files to base64
      const [idCardFrontUrl, idCardBackUrl, selfieUrl] = await Promise.all([
        toBase64(frontFile!),
        toBase64(backFile!),
        toBase64(selfieFile!),
      ]);

      await axios.post(
        (import.meta.env.VITE_API_URL || 'http://localhost:3000') + '/ekyc/submit',
        { idCardFrontUrl, idCardBackUrl, selfieUrl },
        { headers: { Authorization: `Bearer ${accessToken}` } }
      );

      setStatus('success');
    } catch (err: any) {
      setStatus('error');
      const msg = err.response?.data?.message || err.message || 'Gửi eKYC thất bại. Vui lòng thử lại.';
      setErrorMsg(msg);
      toast.error(msg);
    }
  };

  const slots = [
    {
      label: 'Mặt trước CCCD',
      icon: <CreditCard size={13} />,
      hint: 'JPG, PNG — tối đa 5MB',
      file: frontFile,
      preview: frontPreview,
      setFile: setFrontFile,
      setPreview: setFrontPreview,
    },
    {
      label: 'Mặt sau CCCD',
      icon: <CreditCard size={13} />,
      hint: 'JPG, PNG — tối đa 5MB',
      file: backFile,
      preview: backPreview,
      setFile: setBackFile,
      setPreview: setBackPreview,
    },
  ];

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(180deg, #f0f9ff 0%, #f8fafc 40%, #ffffff 100%)', fontFamily: "'Inter', -apple-system, sans-serif" }}>
      <Navbar />

      <div style={{ maxWidth: '720px', margin: '0 auto', padding: '2.5rem 1.5rem 4rem' }}>

        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
          <div style={{ width: '72px', height: '72px', borderRadius: '20px', background: 'linear-gradient(135deg, #0284c7, #0ea5e9)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.25rem', boxShadow: '0 8px 32px rgba(14,165,233,0.3)' }}>
            <Shield size={32} color='white' />
          </div>
          <h1 style={{ fontSize: '2rem', fontWeight: 800, color: '#0f172a', margin: '0 0 0.5rem', letterSpacing: '-0.025em' }}>
            Xác thực danh tính (eKYC)
          </h1>
          <p style={{ color: '#475569', fontSize: '0.95rem', margin: 0, maxWidth: '480px', marginInline: 'auto', lineHeight: 1.6 }}>
            Tải lên ảnh CCCD và Selfie để trở thành Local Buddy được xác thực. Tất cả dữ liệu được mã hoá an toàn.
          </p>
        </div>

        {/* Steps */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0', marginBottom: '2.5rem' }}>
          {[
            { n: 1, label: 'Upload ảnh', done: !!allUploaded },
            { n: 2, label: 'Gửi hồ sơ', done: status === 'success' },
            { n: 3, label: 'Chờ duyệt', done: false },
          ].map((step, i) => (
            <React.Fragment key={step.n}>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.35rem' }}>
                <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: step.done ? 'linear-gradient(135deg,#10b981,#059669)' : i === 0 ? 'linear-gradient(135deg,#0284c7,#0ea5e9)' : '#e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.8rem', fontWeight: 700, color: step.done || i === 0 ? 'white' : '#64748b', border: `2px solid ${step.done ? 'rgba(16,185,129,0.3)' : i === 0 ? 'rgba(14,165,233,0.3)' : 'rgba(148,163,184,0.1)'}` }}>
                  {step.done ? '✓' : step.n}
                </div>
                <span style={{ fontSize: '0.7rem', color: step.done ? '#10b981' : i === 0 ? '#0284c7' : '#94a3b8', fontWeight: 600, whiteSpace: 'nowrap' }}>{step.label}</span>
              </div>
              {i < 2 && <div style={{ width: '60px', height: '2px', background: '#cbd5e1', margin: '0 0.5rem', marginBottom: '1.2rem' }} />}
            </React.Fragment>
          ))}
        </div>

        {/* Main form card */}
        <div style={{ background: '#ffffff', border: '1px solid rgba(14, 165, 233, 0.12)', borderRadius: '24px', padding: '2rem', boxShadow: '0 10px 30px rgba(14, 165, 233, 0.04)' }}>

          {status === 'success' ? (
            /* Success state */
            <div style={{ textAlign: 'center', padding: '2rem 0' }}>
              <div style={{ width: '80px', height: '80px', borderRadius: '50%', background: 'rgba(16,185,129,0.15)', border: '2px solid rgba(16,185,129,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem', animation: 'glow 2s ease-in-out infinite' }}>
                <CheckCircle size={40} style={{ color: '#34d399' }} />
              </div>
              <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#0f172a', margin: '0 0 0.75rem' }}>Hồ sơ đã được gửi! 🎉</h2>
              <p style={{ color: '#475569', lineHeight: 1.6, maxWidth: '360px', margin: '0 auto 1.5rem' }}>
                Chúng tôi đã nhận được tài liệu của bạn và đang xem xét. Thường mất <strong style={{ color: '#0284c7' }}>1-2 ngày làm việc</strong>.
              </p>
              <div style={{ background: 'rgba(16,185,129,0.05)', border: '1px solid rgba(16,185,129,0.25)', borderRadius: '12px', padding: '1rem', display: 'flex', alignItems: 'center', gap: '0.75rem', justifyContent: 'center', color: '#10b981', fontSize: '0.875rem' }}>
                🔔 Bạn sẽ nhận được thông báo khi hồ sơ được duyệt
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit}>
              {/* CCCD Front + Back */}
              <div style={{ marginBottom: '0.5rem' }}>
                <p style={{ color: '#0f172a', fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.875rem' }}>
                  Căn cước công dân (CCCD)
                </p>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.25rem' }}>
                  {slots.map(slot => (
                    <UploadZone key={slot.label} slot={slot} />
                  ))}
                </div>
              </div>

              {/* Selfie */}
              <div style={{ marginBottom: '1.5rem' }}>
                <p style={{ color: '#0f172a', fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.875rem' }}>
                  Ảnh Selfie cầm CCCD
                </p>
                <div style={{ maxWidth: '320px', margin: '0 auto' }}>
                  <UploadZone slot={{
                    label: 'Selfie cầm CCCD',
                    icon: <Camera size={13} />,
                    hint: 'Giơ CCCD ngang mặt, rõ nét — JPG, PNG',
                    file: selfieFile,
                    preview: selfiePreview,
                    setFile: setSelfieFile,
                    setPreview: setSelfiePreview,
                  }} />
                </div>
              </div>

              {/* Tips */}
              <div style={{ background: 'rgba(2, 132, 199, 0.04)', border: '1px solid rgba(2, 132, 199, 0.15)', borderRadius: '12px', padding: '0.875rem 1rem', marginBottom: '1.5rem' }}>
                <p style={{ color: '#0284c7', fontSize: '0.75rem', fontWeight: 600, margin: '0 0 0.4rem' }}>💡 Lưu ý khi chụp ảnh</p>
                <ul style={{ color: '#475569', fontSize: '0.72rem', lineHeight: 1.8, paddingLeft: '1rem', margin: 0 }}>
                  <li>Ảnh rõ nét, không bị mờ, không che khuất thông tin</li>
                  <li>Đủ sáng, không bị lóe sáng hoặc tối quá</li>
                  <li>4 góc của CCCD phải hiện đầy đủ trong khung ảnh</li>
                  <li>Ảnh selfie phải thấy rõ mặt và CCCD cùng lúc</li>
                </ul>
              </div>


              {/* Error */}
              {status === 'error' && (
                <div style={{ background: 'rgba(239,68,68,0.05)', border: '1px solid rgba(239,68,68,0.25)', borderRadius: '12px', padding: '0.875rem 1rem', display: 'flex', alignItems: 'center', gap: '0.75rem', color: '#ef4444', fontSize: '0.875rem', marginBottom: '1.25rem' }}>
                  <AlertCircle size={16} style={{ flexShrink: 0 }} /> {errorMsg}
                </div>
              )}

              {/* Progress indicator */}
              <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.25rem' }}>
                {[
                  { label: 'Mặt trước', done: !!frontPreview },
                  { label: 'Mặt sau', done: !!backPreview },
                  { label: 'Selfie', done: !!selfiePreview },
                ].map(item => (
                  <div key={item.label} style={{ flex: 1, display: 'flex', alignItems: 'center', gap: '0.35rem', background: item.done ? 'rgba(16,185,129,0.05)' : '#f8fafc', border: `1px solid ${item.done ? 'rgba(16,185,129,0.25)' : 'rgba(14, 165, 233, 0.12)'}`, borderRadius: '8px', padding: '0.5rem 0.75rem' }}>
                    <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: item.done ? '#10b981' : 'rgba(14, 165, 233, 0.15)', flexShrink: 0 }} />
                    <span style={{ fontSize: '0.7rem', color: item.done ? '#10b981' : '#475569', fontWeight: 600 }}>{item.label}</span>
                    {item.done && <CheckCircle size={11} style={{ color: '#10b981', marginLeft: 'auto' }} />}
                  </div>
                ))}
              </div>

              {/* Submit */}
              <button
                type='submit'
                disabled={status === 'loading' || !allUploaded}
                style={{
                  width: '100%',
                  background: allUploaded
                    ? 'linear-gradient(135deg, #0284c7, #0ea5e9)'
                    : '#e2e8f0',
                  border: 'none',
                  borderRadius: '14px', padding: '1.1rem',
                  color: allUploaded ? 'white' : '#94a3b8',
                  fontWeight: 700, fontSize: '1rem', cursor: allUploaded ? 'pointer' : 'not-allowed',
                  boxShadow: allUploaded ? '0 8px 24px rgba(14,165,233,0.25)' : 'none',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
                  opacity: status === 'loading' ? 0.7 : 1, transition: 'all 0.3s',
                  fontFamily: 'inherit',
                }}
              >
                {status === 'loading' ? (
                  <>
                    <div style={{ width: '18px', height: '18px', border: '2px solid rgba(255,255,255,0.3)', borderTopColor: 'white', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
                    Đang mã hoá & gửi...
                  </>
                ) : (
                  <>
                    <Shield size={18} />
                    {allUploaded ? 'Gửi hồ sơ eKYC' : `Cần thêm ${[!frontPreview, !backPreview, !selfiePreview].filter(Boolean).length} ảnh nữa`}
                  </>
                )}
              </button>

              <p style={{ textAlign: 'center', color: '#94a3b8', fontSize: '0.72rem', marginTop: '1rem' }}>
                🔒 Ảnh được mã hoá Base64 và truyền qua HTTPS an toàn
              </p>
            </form>
          )}
        </div>
      </div>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg) } }
        @keyframes glow { 0%,100% { box-shadow: 0 0 20px rgba(16,185,129,0.3) } 50% { box-shadow: 0 0 40px rgba(16,185,129,0.6) } }
      `}</style>
    </div>
  );
};
