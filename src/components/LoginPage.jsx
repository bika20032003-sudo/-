import React, { useState } from 'react';
import { ShieldCheck, Eye, EyeOff, AlertCircle, Facebook } from 'lucide-react';

export const LoginPage = ({ onLoginSuccess }) => {
    const [username, setUsername] = useState('admin');
    const [password, setPassword] = useState('admin1234');
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [errorMsg, setErrorMsg] = useState('');

    const handleLogin = (e) => {
        e.preventDefault();
        setErrorMsg('');
        const trimmedUser = username.trim();
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
            onLoginSuccess({
                id: 1,
                username: trimmedUser,
                name: 'مدير المشروع',
                role: 'إدارة عامة'
            });
        }, 200);
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
                <p>منظومة إدارة الكسارات والوقود والمعدات</p>
              </div>
            </div>

            {/* Main Hero Information */}
            <div className="promo-main-info">
              <div className="cloud-pill">
                <ShieldCheck size={16}/>
                <span>بوابة المتابعة والإشراف الميداني</span>
              </div>

              <h1 className="promo-title">
                إدارة ميدانية وتنفيذية متكاملة.
                <br />
                <span className="highlight">مشروع صيانة طريق أوباري - غات.</span>
              </h1>

              <p className="promo-description">
                متابعة يومية شاملة لتقدم أعمال الرصف، إنتاج الكسارات وتوريد الشرشور، أرصدة الوقود والصهاريج، ورفع التقارير الميدانية المباشرة.
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

          {/* Error Alert */}
          {errorMsg && (<div className="alert-box error">
              <AlertCircle size={18}/>
              <span>{errorMsg}</span>
            </div>)}

          {/* Form Fields */}
          <form onSubmit={handleLogin} style={{ marginTop: '0.5rem' }}>
            <div className="form-group">
              <label className="form-label">اسم المستخدم</label>
              <div className="input-container">
                <input 
                  type="text" 
                  className="form-input" 
                  value={username} 
                  onChange={(e) => setUsername(e.target.value)} 
                  placeholder="أدخل اسم المستخدم" 
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
                  {showPassword ? <EyeOff size={20}/> : <Eye size={20}/>}
                </button>
              </div>
            </div>

            {/* Submit Action Button */}
            <button type="submit" className="submit-btn crimson" disabled={isLoading} style={{ marginTop: '1.25rem' }}>
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

export default LoginPage;
