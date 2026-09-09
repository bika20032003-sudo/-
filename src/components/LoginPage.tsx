import React, { useState } from 'react';
import { 
  ShieldCheck, 
  Eye, 
  EyeOff, 
  AlertCircle
} from 'lucide-react';
import { Facebook } from 'lucide-react'; // For the social icon in the image

interface LoginPageProps {
  onLoginSuccess: () => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ onLoginSuccess }) => {
  const [username, setUsername] = useState('admin');
  const [password, setPassword] = useState('admin1234');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!username.trim()) {
      setErrorMsg('يرجى إدخال البريد الإلكتروني / المستخدم');
      return;
    }
    if (!password.trim()) {
      setErrorMsg('يرجى إدخال كلمة المرور');
      return;
    }

    setIsLoading(true);

    // Simulate authentication
    setTimeout(() => {
      setIsLoading(false);
      onLoginSuccess();
    }, 400);
  };

  return (
    <div className="login-page-screen">
      <div className="portal-wrapper">
        {/* ================= Left Side: Visual Promo Banner ================= */}
        <div 
          className="promo-column"
          style={{
            backgroundImage: `url('/road-work.jpg')`
          }}
        >
          <div className="promo-overlay" />

          <div className="promo-content">
            {/* Top Brand Pill */}
            <div className="promo-top-badge">
              <img 
                src="/logo-agency.jpg" 
                alt="شعار جهاز تنفيذ مشروعات المواصلات" 
                className="promo-logo-icon" 
              />
              <div className="promo-brand-text">
                <h4>جهاز تنفيذ مشروعات المواصلات</h4>
                <p>منظومة إدارة المخازن والمعدات والوقود</p>
              </div>
            </div>

            {/* Main Hero Information */}
            <div className="promo-main-info">
              <div className="cloud-pill">
                <ShieldCheck size={16} />
                <span>النظام السحابي الموحد</span>
              </div>

              <h1 className="promo-title">
                إدارة ذكية. دقة فائقة.
                <br />
                <span className="highlight">منظومة إدارة الكسارات والوقود.</span>
              </h1>

              <p className="promo-description">
                نظام متكامل لمتابعة وتوزيع الوقود، رصيد الكسارات والشرشور، وجاهزية المعدات والآليات على مستوى كافة القطاعات والمشروعات.
              </p>
            </div>
          </div>
        </div>

        {/* ================= Right Side: Login Card Form ================= */}
        <div className="login-column">
          {/* Form Header with Logo */}
          <div className="form-header">
            <div className="form-brand">
              <h2>جهاز تنفيذ مشروعات المواصلات</h2>
              <p>منظومة إدارة الكسارات والوقود</p>
            </div>

            <div className="form-logo-box">
              <img 
                src="/logo-agency.jpg" 
                alt="شعار جهاز تنفيذ مشروعات المواصلات" 
                className="form-logo-img" 
              />
            </div>
          </div>

          <div className="form-divider" />

          {/* Error Alert */}
          {errorMsg && (
            <div className="alert-box error">
              <AlertCircle size={18} />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Form Fields */}
          <form onSubmit={handleLogin}>
            <div className="form-group">
              <label className="form-label">البريد الإلكتروني / المستخدم</label>
              <div className="input-container">
                <input
                  type="text"
                  className="form-input"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="أدخل اسم المستخدم أو البريد"
                  dir="ltr"
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">كلمة المرور</label>
              <div className="input-container">
                <input
                  type={showPassword ? 'text' : 'password'}
                  className="form-input"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="أدخل كلمة المرور"
                  dir="ltr"
                />
                <button
                  type="button"
                  className="input-icon-btn"
                  onClick={() => setShowPassword(!showPassword)}
                  title={showPassword ? 'إخفاء كلمة المرور' : 'إظهار كلمة المرور'}
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            {/* Submit Action Button */}
            <button 
              type="submit" 
              className="submit-btn crimson"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <div className="spinner" />
                  <span>جاري التحقق...</span>
                </>
              ) : (
                <>
                  <span>تسجيل الدخول</span>
                </>
              )}
            </button>
          </form>

          {/* Footer Support Social Icon */}
          <div className="portal-footer-actions">
            <button 
              className="social-circle-btn"
              title="صفحتنا على فيسبوك"
              onClick={(e) => {
                e.preventDefault();
                window.open('https://facebook.com', '_blank');
              }}
            >
              <Facebook size={20} color="#1877f2" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
