// صفحة تسجيل الدخول
// منظومة إدارة مخازن الهيئة العامة لخدمات نقل الدم - ليبيا
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Eye, EyeOff, AlertCircle, Loader2, ShieldCheck } from 'lucide-react';

const HERO_SLIDES = [
  {
    badge: 'النظام السحابي الموحد',
    title: `إدارة ذكية. دقة فائقة.\nمنظومة مخازن خدمات نقل الدم.`,
    desc: `نظام متكامل لمتابعة وتوزيع مخزون أكياس الدم والفصائل والمستلزمات الطبية بكفاءة عالية على مستوى جميع الفروع والمستشفيات.`,
  },
  {
    badge: 'رقابة وجودة عالية',
    title: `تتبع فوري لمخزون الدم.\nرقابة دقيقة على تواريخ الصلاحية.`,
    desc: `رصد مستمر لمخزون الفصائل الشائعة والنادرة (A, B, AB, O) مع نظام تنبيهات مبكر لمنع أي استنفاد أو تلف للمستلزمات الحيوية.`,
  },
  {
    badge: 'إمداد متكامل وسريع',
    title: `ربط المرفق الطبي بالشبكة.\nسرعة استجابة للحالات الطارئة.`,
    desc: `تيسير عمليات التزويد والطلب بين بنوك الدم المركزية والفرعية لضمان وصول أكياس الدم والإمدادات في الوقت المناسب.`,
  },
];

export default function LoginPage() {
  const router = useRouter();

  // حالة النموذج
  const [username, setUsername] = useState('admin');
  const [password, setPassword] = useState('admin123');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [activeSlide, setActiveSlide] = useState(0);

  // التبديل التلقائي لشرائح البانر
  useEffect(() => {
    const timer = setInterval(() => {
      setActiveSlide((prev) => (prev + 1) % HERO_SLIDES.length);
    }, 6000);
    return () => clearInterval(timer);
  }, []);

  // معالجة تسجيل الدخول
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!username.trim() || !password.trim()) {
      setError('يرجى إدخال اسم المستخدم وكلمة المرور');
      return;
    }

    setLoading(true);

    try {
      // محاكاة عملية تسجيل الدخول
      if (username === 'admin' && password === 'admin123') {
        localStorage.setItem(
          'user',
          JSON.stringify({
            Id: 1,
            FullName: 'مدير النظام',
            Username: 'admin',
            Role: 'admin',
          })
        );
        localStorage.setItem('isLoggedIn', 'true');
        router.push('/dashboard');
      } else if (username === 'ahmed' && password === 'admin123') {
        localStorage.setItem(
          'user',
          JSON.stringify({
            Id: 2,
            FullName: 'أحمد محمد - أمين مخزن',
            Username: 'ahmed',
            Role: 'storekeeper',
          })
        );
        localStorage.setItem('isLoggedIn', 'true');
        router.push('/dashboard');
      } else {
        setError('اسم المستخدم أو كلمة المرور غير صحيحة');
      }
    } catch {
      setError('حدث خطأ أثناء تسجيل الدخول. يرجى المحاولة مرة أخرى.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-split-card">
        {/* القسم الأيسر - نموذج تسجيل الدخول */}
        <div className="login-form-container">
            {/* الهوية البصرية وشعار الهيئة في النموذج */}
            <div className="authority-form-header">
              <img
                src="./logo.png"
                alt="شعار الهيئة الوطنية لخدمات نقل الدم"
                className="authority-form-logo-img"
              />
              <div className="authority-form-title-box">
                <h1 className="authority-form-main-title">
                  الهيئة الوطنية لخدمات نقل الدم
                </h1>
                <p className="authority-form-sub-title">منظومة إدارة المخازن</p>
              </div>
            </div>

          <div className="login-form-wrapper">
            {/* رسالة الخطأ */}
            {error && (
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  backgroundColor: '#fef2f2',
                  border: '1px solid #fecaca',
                  color: '#dc2626',
                  padding: '12px 14px',
                  borderRadius: '10px',
                  marginBottom: '20px',
                  fontSize: '0.88rem',
                }}
              >
                <AlertCircle size={18} style={{ flexShrink: 0 }} />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleLogin}>
              {/* حقل البريد الإلكتروني / اسم المستخدم */}
              <div className="login-form-group">
                <label className="login-field-label" htmlFor="username">
                  البريد الإلكتروني / المستخدم
                </label>
                <input
                  id="username"
                  type="text"
                  className="login-input-field"
                  placeholder="admin"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  autoFocus
                  disabled={loading}
                />
              </div>

              {/* حقل كلمة المرور */}
              <div className="login-form-group">
                <label className="login-field-label" htmlFor="password">
                  كلمة المرور
                </label>
                <div className="login-password-wrapper">
                  <input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    className="login-input-field"
                    placeholder="•••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    disabled={loading}
                  />
                  <button
                    type="button"
                    className="password-toggle-btn"
                    onClick={() => setShowPassword(!showPassword)}
                    aria-label="تبديل رؤية كلمة المرور"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              {/* زر تسجيل الدخول الهيئة */}
              <button
                type="submit"
                className="login-orange-btn"
                disabled={loading}
                style={{ marginTop: '24px' }}
              >
                {loading ? (
                  <>
                    <Loader2 size={20} className="animate-spin" />
                    جاري تسجيل الدخول...
                  </>
                ) : (
                  'تسجيل الدخول'
                )}
              </button>
            </form>

            {/* أيقونة فيسبوك دائرية شفافة */}
            <div style={{ marginTop: '28px', display: 'flex', justifyContent: 'center' }}>
              <a
                href="https://www.facebook.com/profile.php?id=100089019495418"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="صفحة الهيئة الوطنية لخدمات نقل الدم على فيسبوك"
                title="صفحة الهيئة الوطنية لخدمات نقل الدم على فيسبوك"
                className="facebook-circle-btn"
              >
                <svg width="22" height="22" viewBox="0 0 24 24" fill="#1877f2">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                </svg>
              </a>
            </div>
          </div>

          <div></div>
        </div>

        {/* القسم الأيمن - البانر والصورة بهوية الهيئة */}
        <div className="login-hero-container" style={{ backgroundImage: "url('./blood-bank-hero.png')" }}>
          <div className="login-hero-overlay" />
          <div className="login-hero-content">
            {/* الشعار واسم الهيئة */}
            <div className="login-brand-logo">
              <div className="brand-icon-box">
                <img src="./logo.png" alt="شعار الهيئة الوطنية لخدمات نقل الدم" />
              </div>
              <div className="brand-name-box">
                <span className="brand-name-text">
                  الهيئة الوطنية لخدمات نقل الدم
                </span>
                <span className="brand-subtitle-text">
                  منظومة إدارة المخازن والإمداد الطبي
                </span>
              </div>
            </div>

            {/* الجزء السفلي: العنوان والوصف وشريط الشرائح */}
            <div className="login-hero-bottom">
              <div className="login-hero-badge">
                <ShieldCheck size={14} />
                <span>{HERO_SLIDES[activeSlide].badge}</span>
              </div>

              <h2 className="login-hero-heading">
                {HERO_SLIDES[activeSlide].title}
              </h2>
              <p className="login-hero-desc">
                {HERO_SLIDES[activeSlide].desc}
              </p>

              {/* مؤشرات الترقيم */}
              <div className="login-slider-dots">
                {HERO_SLIDES.map((_, idx) => (
                  <button
                    key={idx}
                    type="button"
                    className={`slider-dot ${activeSlide === idx ? 'active' : ''}`}
                    onClick={() => setActiveSlide(idx)}
                    aria-label={`الشريحة ${idx + 1}`}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}


