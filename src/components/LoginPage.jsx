import React, { useState } from 'react';
import { ShieldCheck, Eye, EyeOff, AlertCircle, Building2, Truck, HardHat, Crown } from 'lucide-react';
import { Facebook } from 'lucide-react';

const PRESET_ACCOUNTS = [
  { id: 1, username: 'admin', pass: 'admin1234', name: 'مدير المشروع', role: 'مدير المشروع', sector: 'all', icon: Crown, desc: 'الإدارة والتحكم العام' },
  { id: 2, username: 'admin_sectors', pass: 'admin1234', name: 'مدير القطاعات', role: 'مدير القطاعات', sector: 'all', icon: Building2, desc: 'متابعة واعتماد التقارير' },
  { id: 3, username: 'sector_a', pass: 'admin1234', name: 'مشرف القطاع (A)', role: 'مشرف القطاع (A)', sector: 'القطعة A', icon: HardHat, desc: 'لوحة وتقارير القطاع A' },
  { id: 4, username: 'sector_b', pass: 'admin1234', name: 'مشرف القطاع (B)', role: 'مشرف القطاع (B)', sector: 'القطعة B', icon: Truck, desc: 'لوحة وتقارير القطاع B' }
];

export const LoginPage = ({ onLoginSuccess }) => {
    const [username, setUsername] = useState('sector_a');
    const [password, setPassword] = useState('admin1234');
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [errorMsg, setErrorMsg] = useState('');

    const handleSelectPreset = (acc) => {
        setUsername(acc.username);
        setPassword(acc.pass);
        setErrorMsg('');
    };

    const handleLogin = (e) => {
        e.preventDefault();
        setErrorMsg('');
        const trimmedUser = username.trim().toLowerCase();
        const trimmedPass = password.trim();

        if (!trimmedUser) {
            setErrorMsg('يرجى إدخال اسم المستخدم أو البريد');
            return;
        }
        if (!trimmedPass) {
            setErrorMsg('يرجى إدخال كلمة المرور');
            return;
        }

        setIsLoading(true);
        setTimeout(() => {
            setIsLoading(false);
            // Match against preset accounts
            const matched = PRESET_ACCOUNTS.find(a => a.username.toLowerCase() === trimmedUser);
            if (matched) {
                onLoginSuccess({
                    id: matched.id,
                    username: matched.username,
                    name: matched.name,
                    role: matched.role,
                    sector: matched.sector
                });
            } else {
                // Fallback default
                const isA = trimmedUser.includes('a');
                const isB = trimmedUser.includes('b');
                const role = isA ? 'مشرف القطاع (A)' : isB ? 'مشرف القطاع (B)' : 'مدير المشروع';
                const sector = isA ? 'القطعة A' : isB ? 'القطعة B' : 'all';
                onLoginSuccess({
                    id: Date.now(),
                    username: trimmedUser,
                    name: role,
                    role,
                    sector
                });
            }
        }, 300);
    };

    return (<div className="login-page-screen">
      <div className="portal-wrapper">
        {/* ================= Left Side: Visual Promo Banner ================= */}
        <div className="promo-column" style={{
            backgroundImage: `url('${import.meta.env.BASE_URL}road-work.jpg')`
        }}>
          <div className="promo-overlay"/>

          <div className="promo-content">
            {/* Top Brand Pill */}
            <div className="promo-top-badge">
              <img src={`${import.meta.env.BASE_URL}logo-agency.jpg`} alt="شعار جهاز تنفيذ مشروعات المواصلات" className="promo-logo-icon"/>
              <div className="promo-brand-text">
                <h4>جهاز تنفيذ مشروعات المواصلات</h4>
                <p>منظومة إدارة الكسارات والوقود ومتابعة القطاعات</p>
              </div>
            </div>

            {/* Main Hero Information */}
            <div className="promo-main-info">
              <div className="cloud-pill">
                <ShieldCheck size={16}/>
                <span>بوابة الدخول الموحدة للقطاعات</span>
              </div>

              <h1 className="promo-title">
                إدارة ميدانية متكاملة.
                <br />
                <span className="highlight">لوحات تحكم مخصصة لكل قطاع.</span>
              </h1>

              <p className="promo-description">
                متابعة يومية لتقدم أعمال الرصف، إنتاج الكسارات، أرصدة الوقود، ورفع التقارير الميدانية المباشرة لاعتمادها مركزياً.
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
              <p>تسجيل الدخول إلى منظومة المتابعة</p>
            </div>

            <div className="form-logo-box">
              <img src={`${import.meta.env.BASE_URL}logo-agency.jpg`} alt="شعار جهاز تنفيذ مشروعات المواصلات" className="form-logo-img"/>
            </div>
          </div>

          <div className="form-divider"/>

          {/* Quick Role Selection Pills */}
          <div style={{ marginBottom: '1.25rem' }}>
            <div style={{ fontSize: '0.78rem', fontWeight: 700, color: '#64748b', marginBottom: '0.5rem' }}>
              اختر الحساب المطلوب للدخول المباشر:
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.5rem' }}>
              {PRESET_ACCOUNTS.map((acc) => {
                const Icon = acc.icon;
                const isSelected = username.toLowerCase() === acc.username.toLowerCase();
                return (
                  <button
                    key={acc.id}
                    type="button"
                    onClick={() => handleSelectPreset(acc)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                      padding: '0.55rem 0.65rem',
                      borderRadius: '8px',
                      border: isSelected ? '2px solid #2563eb' : '1px solid #e2e8f0',
                      background: isSelected ? '#eff6ff' : '#f8fafc',
                      cursor: 'pointer',
                      textAlign: 'right',
                      transition: 'all 0.2s ease'
                    }}
                  >
                    <div style={{
                      width: '28px',
                      height: '28px',
                      borderRadius: '6px',
                      background: isSelected ? '#2563eb' : '#e2e8f0',
                      color: isSelected ? '#ffffff' : '#475569',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0
                    }}>
                      <Icon size={15} />
                    </div>
                    <div style={{ overflow: 'hidden' }}>
                      <div style={{ fontSize: '0.78rem', fontWeight: 800, color: isSelected ? '#1d4ed8' : '#0f172a', whiteSpace: 'nowrap' }}>
                        {acc.name}
                      </div>
                      <div style={{ fontSize: '0.66rem', color: '#64748b', whiteSpace: 'nowrap' }}>
                        {acc.desc}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Error Alert */}
          {errorMsg && (<div className="alert-box error">
              <AlertCircle size={18}/>
              <span>{errorMsg}</span>
            </div>)}

          {/* Form Fields */}
          <form onSubmit={handleLogin}>
            <div className="form-group">
              <label className="form-label">اسم المستخدم</label>
              <div className="input-container">
                <input type="text" className="form-input" value={username} onChange={(e) => setUsername(e.target.value)} placeholder="أدخل اسم المستخدم" dir="ltr"/>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">كلمة المرور</label>
              <div className="input-container">
                <input type={showPassword ? 'text' : 'password'} className="form-input" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="أدخل كلمة المرور" dir="ltr"/>
                <button type="button" className="input-icon-btn" onClick={() => setShowPassword(!showPassword)} title={showPassword ? 'إخفاء كلمة المرور' : 'إظهار كلمة المرور'}>
                  {showPassword ? <EyeOff size={20}/> : <Eye size={20}/>}
                </button>
              </div>
            </div>

            {/* Submit Action Button */}
            <button type="submit" className="submit-btn crimson" disabled={isLoading}>
              {isLoading ? (<>
                  <div className="spinner"/>
                  <span>جاري الدخول...</span>
                </>) : (<>
                  <span>تسجيل الدخول للمنظومة</span>
                </>)}
            </button>
          </form>

          {/* Footer Support Social Icon */}
          <div className="portal-footer-actions">
            <button className="social-circle-btn" title="صفحتنا على فيسبوك" onClick={(e) => {
            e.preventDefault();
            window.open('https://facebook.com', '_blank');
        }}>
              <Facebook size={20} color="#1877f2"/>
            </button>
          </div>
        </div>
      </div>
    </div>);
};
