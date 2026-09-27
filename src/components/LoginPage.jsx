import React, { useState } from 'react';
import { ShieldCheck, Eye, EyeOff, AlertCircle, Facebook } from 'lucide-react';

// ===== Default Users with Passwords =====
// These are the base credentials. Passwords can be changed from UsersView
// and will be persisted in localStorage.
const DEFAULT_USERS = [
  {
    id: 1,
    username: 'admin',
    name: 'مدير المشروع',
    role: 'مدير المشروع',
    sector: 'all',
    password: 'admin1234'
  },
  {
    id: 2,
    username: 'admin_sectors',
    name: 'مدير القطاعات',
    role: 'مدير القطاعات',
    sector: 'all',
    password: 'sectors123'
  },
  {
    id: 3,
    username: 'sector_a',
    name: 'مشرف القطاع (A)',
    role: 'مشرف القطاع (A)',
    sector: 'القطعة A',
    password: 'sectora123'
  },
  {
    id: 4,
    username: 'sector_b',
    name: 'مشرف القطاع (B)',
    role: 'مشرف القطاع (B)',
    sector: 'القطعة B',
    password: 'sectorb123'
  }
];

/**
 * Get the current list of users with their latest passwords.
 * Merges default users with any password changes saved in localStorage.
 */
export function getSystemUsers() {
  let users = JSON.parse(JSON.stringify(DEFAULT_USERS));
  try {
    const savedPasswords = JSON.parse(localStorage.getItem('system_user_passwords') || '{}');
    users = users.map(u => ({
      ...u,
      password: savedPasswords[u.username] || u.password
    }));

    // Also merge any custom users added via UsersView
    const customUsers = JSON.parse(localStorage.getItem('system_custom_users') || '[]');
    customUsers.forEach(cu => {
      const existingIdx = users.findIndex(u => u.username === cu.username);
      if (existingIdx === -1) {
        users.push({
          ...cu,
          password: savedPasswords[cu.username] || cu.password || 'admin1234'
        });
      }
    });
  } catch (e) {
    console.warn('Error reading saved passwords:', e);
  }
  return users;
}

/**
 * Save/update a user's password in localStorage
 */
export function updateUserPassword(username, newPassword) {
  try {
    const savedPasswords = JSON.parse(localStorage.getItem('system_user_passwords') || '{}');
    savedPasswords[username] = newPassword;
    localStorage.setItem('system_user_passwords', JSON.stringify(savedPasswords));
    return true;
  } catch (e) {
    console.error('Error saving password:', e);
    return false;
  }
}

/**
 * Save a custom user to localStorage
 */
export function saveCustomUser(user) {
  try {
    const customUsers = JSON.parse(localStorage.getItem('system_custom_users') || '[]');
    const existingIdx = customUsers.findIndex(u => u.username === user.username || u.id === user.id);
    if (existingIdx >= 0) {
      customUsers[existingIdx] = { ...customUsers[existingIdx], ...user };
    } else {
      customUsers.push(user);
    }
    localStorage.setItem('system_custom_users', JSON.stringify(customUsers));

    // Also save password
    if (user.password) {
      updateUserPassword(user.username, user.password);
    }
    return true;
  } catch (e) {
    console.error('Error saving custom user:', e);
    return false;
  }
}

/**
 * Delete a custom user from localStorage
 */
export function deleteCustomUser(userId) {
  try {
    const customUsers = JSON.parse(localStorage.getItem('system_custom_users') || '[]');
    const filtered = customUsers.filter(u => u.id !== userId);
    localStorage.setItem('system_custom_users', JSON.stringify(filtered));
    return true;
  } catch (e) {
    return false;
  }
}

export const LoginPage = ({ onLoginSuccess }) => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [errorMsg, setErrorMsg] = useState('');

    const handleLogin = (e) => {
        e.preventDefault();
        setErrorMsg('');
        const trimmedUser = username.trim();
        const trimmedPass = password.trim();

        if (!trimmedUser) {
            setErrorMsg('يرجى إدخال اسم المستخدم');
            return;
        }
        if (!trimmedPass) {
            setErrorMsg('يرجى إدخال كلمة المرور');
            return;
        }

        setIsLoading(true);
        setTimeout(() => {
            // Get all users with their current passwords
            const systemUsers = getSystemUsers();

            // Find matching user by username
            const matchedUser = systemUsers.find(
              u => u.username === trimmedUser || u.email === trimmedUser
            );

            if (!matchedUser) {
                setErrorMsg('اسم المستخدم غير مسجل في النظام');
                setIsLoading(false);
                return;
            }

            // Validate password
            if (matchedUser.password !== trimmedPass) {
                setErrorMsg('كلمة المرور غير صحيحة');
                setIsLoading(false);
                return;
            }

            // Success - pass correct user data with role and sector
            setIsLoading(false);
            onLoginSuccess({
                id: matchedUser.id,
                username: matchedUser.username,
                name: matchedUser.name,
                role: matchedUser.role,
                sector: matchedUser.sector || 'all'
            });
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
                  <span>جاري التحقق...</span>
                </>) : (<>
                  <span>تسجيل الدخول للمنظومة</span>
                </>)}
            </button>
          </form>

          {/* Quick Login Hints */}
          <div style={{
            marginTop: '1.25rem',
            background: '#f8fafc',
            border: '1px solid #e2e8f0',
            borderRadius: '10px',
            padding: '0.85rem 1rem',
          }}>
            <div style={{ fontSize: '0.76rem', fontWeight: 800, color: '#475569', marginBottom: '0.5rem' }}>
              بيانات الدخول الافتراضية:
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.35rem', fontSize: '0.72rem', color: '#64748b' }}>
              <span>🔑 <strong>admin</strong> / admin1234</span>
              <span style={{ color: '#2563eb' }}>→ مدير المشروع</span>
              <span>🔑 <strong>admin_sectors</strong> / sectors123</span>
              <span style={{ color: '#16a34a' }}>→ مدير القطاعات</span>
              <span>🔑 <strong>sector_a</strong> / sectora123</span>
              <span style={{ color: '#ea580c' }}>→ مشرف القطاع A</span>
              <span>🔑 <strong>sector_b</strong> / sectorb123</span>
              <span style={{ color: '#7c3aed' }}>→ مشرف القطاع B</span>
            </div>
          </div>

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
