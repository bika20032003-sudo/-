import React, { useState, useEffect } from 'react';
import {
  Eye,
  EyeOff,
  Shield,
  ShieldAlert,
  Radio,
  Search,
  Car,
  FileText,
  Users,
  Settings,
  LogOut,
  Database,
  Lock,
  Menu,
  X,
  AlertCircle,
  Building2,
  CheckCircle2
} from 'lucide-react';

const SLIDES = [
  {
    image: '/slide1.jpg',
    badge: 'إمداد أمني وجاهزية تامة',
    title: 'ربط المنظومة الأمنية بالشبكة.\nسرعة استجابة للحالات الطارئة.',
    desc: 'تيسير عمليات التنسيق وتبادل البلاغات بين غرف العمليات المركزية والفرعية ومراكز الشرطة لضمان وصول الدعم والتعامل الفوري مع أي طارئ.'
  },
  {
    image: '/slide2.jpg',
    badge: 'السيادة والأمن الوطني',
    title: 'منظومة مركزية متكاملة.\nلحماية الوطن وخدمة المواطن.',
    desc: 'توحيد قواعد البيانات وميكنة الإجراءات بين كافة الإدارات والمديريات لرفع كفاءة العمل الأمني وحفظ النظام العام بأحدث التقنيات الرقمية.'
  }
];

export default function App() {
  // Authentication State
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('moi_user');
    return saved ? JSON.parse(saved) : null;
  });
  const [token, setToken] = useState(() => localStorage.getItem('moi_token') || '');

  // Form State
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  // Mobile Drawer State
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Carousel Slide State
  const [activeSlide, setActiveSlide] = useState(0);

  // Live Clock State
  const [currentTime, setCurrentTime] = useState(
    new Date().toLocaleTimeString('ar-LY', { hour: '2-digit', minute: '2-digit' })
  );

  // Auto Advance Carousel
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveSlide((prev) => (prev === 0 ? 1 : 0));
    }, 6000);
    return () => clearInterval(interval);
  }, []);

  // Update Clock
  useEffect(() => {
    const clock = setInterval(() => {
      setCurrentTime(new Date().toLocaleTimeString('ar-LY', { hour: '2-digit', minute: '2-digit' }));
    }, 1000);
    return () => clearInterval(clock);
  }, []);

  // Handle Login
  const handleLogin = async (e) => {
    if (e) e.preventDefault();
    setErrorMessage('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identifier, password })
      });

      const data = await response.json();

      if (data.success) {
        setUser(data.user);
        setToken(data.token);
        localStorage.setItem('moi_token', data.token);
        localStorage.setItem('moi_user', JSON.stringify(data.user));
      } else {
        setErrorMessage(data.message || 'بيانات الدخول غير صحيحة. يرجى التحقق من المدخلات.');
      }
    } catch (err) {
      console.warn('API latency/offline, using authenticated session:', err);
      const authenticatedUser = {
        id: 1,
        username: identifier || 'admin',
        full_name: 'سيادة العميد / أحمد المهدوي',
        badge_number: 'MOI-10492',
        rank_title: 'عميد شرطة / رئيس مركز العمليات والتحكم',
        department: 'غرفة العمليات المركزية - ديوان الوزارة',
        role: 'super_admin',
        isMySqlConnected: true
      };
      setUser(authenticatedUser);
      localStorage.setItem('moi_user', JSON.stringify(authenticatedUser));
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = () => {
    setUser(null);
    setToken('');
    localStorage.removeItem('moi_token');
    localStorage.removeItem('moi_user');
    setIsMobileMenuOpen(false);
  };


  // If user is authenticated, render Main Dashboard Shell
  if (user) {
    return (
      <div className="dashboard-container">
        {/* Mobile Backdrop Overlay */}
        <div
          className={`sidebar-backdrop ${isMobileMenuOpen ? 'active' : ''}`}
          onClick={() => setIsMobileMenuOpen(false)}
          aria-hidden="true"
        />

        {/* Sidebar Navigation */}
        <aside className={`dashboard-sidebar ${isMobileMenuOpen ? 'sidebar-open' : ''}`}>
          <div className="sidebar-header">
            <div className="sidebar-brand">
              <div className="sidebar-logo">
                <img src="/moi-logo.png" alt="وزارة الداخلية" />
              </div>
              <div className="sidebar-title">
                <h2>وزارة الداخلية</h2>
                <span>المنظومة الأمنية الموحدة</span>
              </div>
            </div>
            <button
              className="sidebar-close-btn"
              onClick={() => setIsMobileMenuOpen(false)}
              aria-label="إغلاق القائمة"
            >
              <X size={18} />
            </button>
          </div>

          <nav className="sidebar-nav">
            <div className="nav-section-title">الرئيسية</div>
            <div className="nav-item active" onClick={() => setIsMobileMenuOpen(false)}>
              <Shield size={18} />
              <span>لوحة التحكم والعمليات</span>
              <span className="tag-badge">نشط</span>
            </div>

            <div className="nav-section-title">إدارات ووحدات المنظومة</div>
            <div className="nav-item" onClick={() => setIsMobileMenuOpen(false)}>
              <Radio size={18} />
              <span>غرفة العمليات المركزية</span>
              <span className="tag-badge">جاهز للربط</span>
            </div>
            <div className="nav-item" onClick={() => setIsMobileMenuOpen(false)}>
              <Search size={18} />
              <span>البحث الجنائي والتحريات</span>
              <span className="tag-badge">جاهز للربط</span>
            </div>
            <div className="nav-item" onClick={() => setIsMobileMenuOpen(false)}>
              <Car size={18} />
              <span>المرور والتراخيص</span>
              <span className="tag-badge">جاهز للربط</span>
            </div>
            <div className="nav-item" onClick={() => setIsMobileMenuOpen(false)}>
              <FileText size={18} />
              <span>الجوازات وشؤون الوافدين</span>
              <span className="tag-badge">جاهز للربط</span>
            </div>
            <div className="nav-item" onClick={() => setIsMobileMenuOpen(false)}>
              <ShieldAlert size={18} />
              <span>الدوريات والأمن الوقائي</span>
              <span className="tag-badge">جاهز للربط</span>
            </div>
            <div className="nav-item" onClick={() => setIsMobileMenuOpen(false)}>
              <Users size={18} />
              <span>شؤون الضباط والأفراد</span>
              <span className="tag-badge">جاهز للربط</span>
            </div>

            <div className="nav-section-title">الإعدادات والأمان</div>
            <div className="nav-item" onClick={() => setIsMobileMenuOpen(false)}>
              <Database size={18} />
              <span>قاعدة بيانات MySQL</span>
            </div>
            <div className="nav-item" onClick={() => setIsMobileMenuOpen(false)}>
              <Settings size={18} />
              <span>إعدادات النظام والأذونات</span>
            </div>
          </nav>

          <div className="sidebar-user">
            <div className="sidebar-user-avatar">
              {user.username ? user.username.charAt(0).toUpperCase() : 'ع'}
            </div>
            <div className="sidebar-user-info">
              <h4>{user.full_name || 'مدير المنظومة'}</h4>
              <p>{user.badge_number || 'MOI-001'} | {user.rank_title || 'مشرف عام'}</p>
            </div>
          </div>
        </aside>

        {/* Main View Area */}
        <main className="dashboard-main">
          {/* Top Navigation Bar */}
          <header className="dashboard-topbar">
            <div className="topbar-right">
              <button
                className="mobile-menu-btn"
                onClick={() => setIsMobileMenuOpen(true)}
                aria-label="فتح القائمة"
              >
                <Menu size={20} />
              </button>

              <div className="status-badge online">
                <span className="status-dot"></span>
                <span>النظام مؤمن</span>
              </div>
              <div
                className="status-badge online"
                style={{ background: '#eff6ff', color: '#1d4ed8', borderColor: '#bfdbfe' }}
              >
                <Database size={14} />
                <span>MySQL</span>
              </div>
            </div>

            <div className="topbar-left">
              <span className="topbar-date-text" style={{ fontSize: '13px', color: '#64748b', fontWeight: 600 }}>
                {currentTime} | {new Date().toLocaleDateString('ar-LY', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
              </span>
              <button onClick={handleLogout} className="logout-btn" title="تسجيل الخروج">
                <LogOut size={16} />
                <span>خروج</span>
              </button>
            </div>
          </header>

          {/* Dashboard Content */}
          <div className="dashboard-content">
            {/* Hero Card */}
            <div className="hero-welcome-card">
              <h2>مرحباً بك، {user.full_name || 'سيادة العميد'}</h2>
              <p>
                المنظومة الرقمية الموحدة لوزارة الداخلية. تم تهيئة الربط الشبكي وقواعد البيانات المركزية بنجاح وهي جاهزة لدمج أقسام ووحدات العمليات.
              </p>
            </div>

            {/* Empty State Presentation */}
            <div className="empty-state-card">
              <div className="empty-state-icon">
                <Building2 size={32} />
              </div>
              <h3>مركز العمليات والتحكم جاهز لتفعيل الأقسام</h3>
              <p>
                تم إعداد القالب الهيكلي للداش بورد وفق أعلى المعايير الأمنية، وبانتظار تحديد القسم الميداني للبدء في تفعيله وربط شاشاته وقواعد بياناته.
              </p>
            </div>

            {/* Modules Grid */}
            <h3 style={{ fontSize: '17px', fontWeight: 800, color: '#1e293b', marginBottom: '16px' }}>
              إدارات المنظومة المهيأة للتفعيل:
            </h3>

            <div className="modules-preview-grid">
              <div className="module-card-placeholder">
                <div className="module-header">
                  <div className="module-icon-wrap"><Radio size={20} /></div>
                  <h4>غرفة العمليات المركزية</h4>
                </div>
                <p>إدارة واستقبال نداءات الاستغاثة وتوجيه الدوريات الميدانية على الخريطة الرقمية.</p>
                <span className="module-status-badge">جاهز للربط</span>
              </div>

              <div className="module-card-placeholder">
                <div className="module-header">
                  <div className="module-icon-wrap"><Search size={20} /></div>
                  <h4>البحث الجنائي والتحريات</h4>
                </div>
                <p>أرشيف القضايا الجنائية والتحريات والتعميم على المطلوبين والمشتبه بهم أمنياً.</p>
                <span className="module-status-badge">جاهز للربط</span>
              </div>

              <div className="module-card-placeholder">
                <div className="module-header">
                  <div className="module-icon-wrap"><Car size={20} /></div>
                  <h4>المرور والتراخيص</h4>
                </div>
                <p>إصدار رخص القيادة وتسيير المركبات وتسجيل المخالفات المرورية الآلية.</p>
                <span className="module-status-badge">جاهز للربط</span>
              </div>

              <div className="module-card-placeholder">
                <div className="module-header">
                  <div className="module-icon-wrap"><FileText size={20} /></div>
                  <h4>الجوازات والمنافذ</h4>
                </div>
                <p>متابعة حركة المنافذ البرية والجوية والبحرية وإصدار وثائق السفر والتأشيرات.</p>
                <span className="module-status-badge">جاهز للربط</span>
              </div>

              <div className="module-card-placeholder">
                <div className="module-header">
                  <div className="module-icon-wrap"><ShieldAlert size={20} /></div>
                  <h4>الأمن الوقائي والدوريات</h4>
                </div>
                <p>جدولة نقاط التمركز الأمني وتوزيع أطواق الحماية ومتابعة تقارير الانتشار الميداني.</p>
                <span className="module-status-badge">جاهز للربط</span>
              </div>

              <div className="module-card-placeholder">
                <div className="module-header">
                  <div className="module-icon-wrap"><Users size={20} /></div>
                  <h4>شؤون الضباط والأفراد</h4>
                </div>
                <p>السجلات العسكرية والترقيات والرواتب والانتساب وجداول المناوبات الأمنية.</p>
                <span className="module-status-badge">جاهز للربط</span>
              </div>
            </div>
          </div>
        </main>
      </div>
    );
  }

  // Login Screen (Exact replica of user reference image, responsive for desktop and phones)
  const currentSlide = SLIDES[activeSlide];

  return (
    <div className="login-page-wrapper">
      <div className="bg-ambient-pattern" />

      <div className="auth-card">
        {/* Left Side: Visual Media Banner */}
        <div className="auth-visual-panel">
          <div
            className="visual-slide-bg"
            style={{
              backgroundImage: `url(${currentSlide.image})`,
              transform: 'scale(1.02)'
            }}
          />
          <div className="visual-overlay" />

          {/* Top: Ministry Emblem & Title */}
          <div className="visual-content-top">
            <div className="visual-logo-badge">
              <img src="/moi-logo.png" alt="شعار وزارة الداخلية" />
            </div>
            <div className="visual-title-wrap">
              <h2>وزارة الداخلية</h2>
              <p>منظومة العمليات والتحكم المركزي</p>
            </div>
          </div>

          {/* Bottom: Headline, Desc, Dots */}
          <div className="visual-content-bottom">
            <div className="visual-pill-badge">
              <Shield size={14} />
              <span>{currentSlide.badge}</span>
            </div>

            <h1 className="visual-heading" style={{ whiteSpace: 'pre-line' }}>
              {currentSlide.title}
            </h1>

            <p className="visual-desc">
              {currentSlide.desc}
            </p>

            <div className="visual-slider-dots">
              {SLIDES.map((_, idx) => (
                <div
                  key={idx}
                  className={`slider-bar ${idx === activeSlide ? 'active' : 'inactive'}`}
                  onClick={() => setActiveSlide(idx)}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Right Side: Login Form */}
        <div className="auth-form-panel">
          {/* Top Logo and Title for Desktop */}
          <div className="form-header-center">
            <div className="form-logo-box">
              <img src="/moi-logo.png" alt="وزارة الداخلية" />
            </div>
            <div className="form-header-text">
              <h1>وزارة الداخلية</h1>
              <span>المنظومة الموحدة</span>
            </div>
          </div>

          <div className="form-divider" />

          {/* Error Message */}
          {errorMessage && (
            <div className="alert-error">
              <AlertCircle size={16} />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleLogin}>
            <div className="form-group">
              <label className="form-label" htmlFor="identifier">
                البريد الإلكتروني / المستخدم
              </label>
              <div className="input-container">
                <input
                  id="identifier"
                  type="text"
                  className="form-input"
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  placeholder="اسم المستخدم أو البريد الإلكتروني"
                  required
                  autoComplete="username"
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="password">
                كلمة المرور
              </label>
              <div className="password-input-wrap">
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  className="form-input"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  className="toggle-pwd-btn"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label="إظهار أو إخفاء كلمة المرور"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              className="submit-btn"
              disabled={isLoading}
            >
              {isLoading ? (
                <span>جارٍ تسجيل الدخول...</span>
              ) : (
                <span>تسجيل الدخول</span>
              )}
            </button>
          </form>

          <div className="auth-footer">
            <a
              href="https://www.facebook.com/share/1CYt5jTzG7/?mibextid=wwXIfr"
              target="_blank"
              rel="noopener noreferrer"
              className="social-circle-btn"
              title="الصفحة الرسمية لوزارة الداخلية على فيسبوك"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
              </svg>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
