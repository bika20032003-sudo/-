import React, { useState } from 'react';
import { ShieldCheck, Eye, EyeOff, AlertCircle, Facebook } from 'lucide-react';

// ===== Official Supervision Agency Hierarchy (أعضاء جهاز الإشراف) =====
const DEFAULT_USERS = [
  {
    id: 1,
    username: 'admin',
    name: 'م. حساب التطوير',
    role: 'حساب التطوير',
    title: 'حساب التطوير والإشراف البرمجي الكامل',
    sector: 'all',
    email: 'dev@mot.gov.ly',
    phone: '091-2345678',
    password: 'admin1234'
  },
  {
    id: 2,
    username: 'abrikaw',
    name: 'م. عبدالسلام ابريكاو',
    role: 'رئيس جهاز الإشراف',
    title: 'رئيس جهاز الإشراف والمتابعة',
    sector: 'all',
    email: 'abrikaw@mot.gov.ly',
    phone: '091-3456789',
    password: 'abrikaw123'
  },
  {
    id: 3,
    username: 'saleh_quality',
    name: 'م. صالح حماد',
    role: 'مسؤول الجودة',
    title: 'مسؤول ضبط ومراقبة الجودة الفنية',
    sector: 'all',
    email: 'hammad.quality@mot.gov.ly',
    phone: '091-4567890',
    password: 'quality123'
  },
  {
    id: 4,
    username: 'salah_alarabi',
    name: 'م. صلاح العربي',
    role: 'مهندس مشرف (المرحلة الأولى)',
    title: 'مهندس مشرف - المرحلة الأولى',
    sector: 'المرحلة الأولى',
    email: 'alarabi.phase1@mot.gov.ly',
    phone: '091-5678901',
    password: 'sectora123'
  },
  {
    id: 5,
    username: 'issa_altahir',
    name: 'م. عيسى الطاهر',
    role: 'مهندس مشرف (المرحلة الثانية)',
    title: 'مهندس مشرف - المرحلة الثانية',
    sector: 'المرحلة الثانية',
    email: 'altahir.phase2@mot.gov.ly',
    phone: '091-6789012',
    password: 'sectorb123'
  },
  {
    id: 6,
    username: 'project_manager',
    name: 'م. عبدالرحمن الأنصاري',
    role: 'مدير المشروع',
    title: 'مدير المشروع (جهاز الإشراف)',
    sector: 'all',
    email: 'alansari@mot.gov.ly',
    phone: '091-2345678',
    password: 'admin1234'
  }
];

// Aliases for seamless login
const ALIASES = {
  'admin': 'admin',
  'dev': 'admin',
  'developer': 'admin',
  'development': 'admin',
  'تطوير': 'admin',
  'حساب التطوير': 'admin',
  'م. حساب التطوير': 'admin',
  'alansari': 'project_manager',
  'project_manager': 'project_manager',
  'manager': 'project_manager',
  'مدير المشروع': 'project_manager',
  'م. عبدالرحمن الأنصاري': 'project_manager',
  'عبدالرحمن': 'project_manager',
  'admin_sectors': 'abrikaw',
  'sectors': 'abrikaw',
  'abrikaw': 'abrikaw',
  'م. عبدالسلام ابريكاو': 'abrikaw',
  'ابريكاو': 'abrikaw',
  'sector_a': 'salah_alarabi',
  'salah_alarabi': 'salah_alarabi',
  'صلاح': 'salah_alarabi',
  'م. صلاح العربي': 'salah_alarabi',
  'sector_b': 'issa_altahir',
  'issa_altahir': 'issa_altahir',
  'عيسى': 'issa_altahir',
  'م. عيسى الطاهر': 'issa_altahir',
  'quality': 'saleh_quality',
  'saleh_quality': 'saleh_quality',
  'صالح': 'saleh_quality',
  'م. صالح حماد': 'saleh_quality',
  'hammad': 'saleh_quality'
};

/**
 * Get the current list of users with their latest passwords.
 */
export function getSystemUsers() {
  let users = JSON.parse(JSON.stringify(DEFAULT_USERS));
  try {
    const rawPasswords = localStorage.getItem('system_user_passwords');
    const savedPasswords = rawPasswords ? JSON.parse(rawPasswords) : {};
    if (savedPasswords && typeof savedPasswords === 'object') {
      users = users.map(u => ({
        ...u,
        password: savedPasswords[u.username] || u.password,
        avatar: localStorage.getItem(`user_avatar_${u.username}`) || u.avatar || ''
      }));
    }

    // Merge custom users safely
    const rawCustom = localStorage.getItem('system_custom_users');
    const customUsers = rawCustom ? JSON.parse(rawCustom) : [];
    if (Array.isArray(customUsers)) {
      customUsers.forEach(cu => {
        if (!cu || typeof cu !== 'object') return;
        // Never allow legacy cache to overwrite core account identities
        if (cu.username === 'admin' || cu.username === 'project_manager') {
          return;
        }
        const existingIdx = users.findIndex(u => u.username === cu.username || u.id === cu.id);
        if (existingIdx === -1) {
          users.push({
            ...cu,
            password: (savedPasswords && savedPasswords[cu.username]) || cu.password || 'admin1234',
            avatar: localStorage.getItem(`user_avatar_${cu.username}`) || cu.avatar || ''
          });
        } else if (![1, 2, 3, 4, 5, 6].includes(users[existingIdx].id)) {
          users[existingIdx] = {
            ...users[existingIdx],
            ...cu,
            password: (savedPasswords && savedPasswords[cu.username]) || cu.password || users[existingIdx].password,
            avatar: localStorage.getItem(`user_avatar_${cu.username}`) || cu.avatar || users[existingIdx]?.avatar || ''
          };
        }
      });
    }

    // Guaranteed presence of dev account and project manager
    if (!users.some(u => u.username === 'admin')) {
      users.unshift(DEFAULT_USERS[0]);
    }
    if (!users.some(u => u.username === 'project_manager')) {
      users.push(DEFAULT_USERS.find(u => u.username === 'project_manager'));
    }
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
    console.error('Error deleting custom user:', e);
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
            const systemUsers = getSystemUsers();
            const resolvedUsername = ALIASES[trimmedUser.toLowerCase()] || trimmedUser.toLowerCase();

            // Find matching user by username or email or name
            const matchedUser = systemUsers.find(
              u => u.username.toLowerCase() === resolvedUsername ||
                   u.username.toLowerCase() === trimmedUser.toLowerCase() ||
                   (u.email && u.email.toLowerCase() === trimmedUser.toLowerCase()) ||
                   u.name.toLowerCase() === trimmedUser.toLowerCase()
            );

            if (!matchedUser) {
                setErrorMsg('اسم المستخدم غير مسجل في النظام');
                setIsLoading(false);
                return;
            }

            // Validate password
            if (matchedUser.password && matchedUser.password !== trimmedPass) {
                setErrorMsg('كلمة المرور غير صحيحة');
                setIsLoading(false);
                return;
            }

            // Success - pass user data with role, sector, and avatar
            setIsLoading(false);
            const userAvatar = localStorage.getItem(`user_avatar_${matchedUser.username}`) || matchedUser.avatar || '';
            onLoginSuccess({
                id: matchedUser.id,
                username: matchedUser.username,
                name: matchedUser.name,
                role: matchedUser.role,
                title: matchedUser.title || matchedUser.role,
                sector: matchedUser.sector || 'all',
                email: matchedUser.email || '',
                phone: matchedUser.phone || '',
                avatar: userAvatar
            });
        }, 300);
    };

    return (
      <div className="login-page-screen">
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
              <div className="form-logo-box">
                <img src={`${import.meta.env.BASE_URL}logo-agency.jpg`} alt="شعار جهاز تنفيذ مشروعات المواصلات" className="form-logo-img"/>
              </div>

              <div className="form-brand">
                <h2>جهاز تنفيذ مشروعات المواصلات</h2>
                <p>تسجيل الدخول إلى منظومة المتابعة</p>
              </div>
            </div>

            <div className="form-divider"/>

            {/* Error Alert */}
            {errorMsg && (
              <div className="alert-box error">
                <AlertCircle size={18}/>
                <span>{errorMsg}</span>
              </div>
            )}

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
                    autoComplete="username"
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
                    autoComplete="current-password"
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
              <button 
                type="submit" 
                className="submit-btn" 
                disabled={isLoading} 
                style={{ 
                  marginTop: '1.5rem',
                  background: '#2563eb',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: '8px',
                  fontWeight: 700,
                  fontSize: '0.95rem',
                  height: '46px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.5rem',
                  cursor: 'pointer',
                  boxShadow: '0 4px 12px rgba(37, 99, 235, 0.25)'
                }}
              >
                {isLoading ? (
                  <>
                    <div className="spinner"/>
                    <span>جاري التحقق...</span>
                  </>
                ) : (
                  <>
                    <span>تسجيل الدخول للمنظومة</span>
                  </>
                )}
              </button>
            </form>

            {/* Quick Demo Accounts Selection */}
            <div style={{ marginTop: '1.25rem', paddingTop: '1rem', borderTop: '1px solid #e2e8f0' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.65rem' }}>
                <span style={{ fontSize: '0.8rem', fontWeight: 800, color: '#475569' }}>
                  حسابات الدخول المعتمدة (انقر للتعبئة الفورية):
                </span>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.5rem' }}>
                {[
                  { name: 'م. حساب التطوير', user: 'admin', pass: 'admin1234', role: 'حساب التطوير', color: '#059669', bg: '#ecfdf5' },
                  { name: 'م. عبدالرحمن الأنصاري', user: 'project_manager', pass: 'admin1234', role: 'مدير المشروع', color: '#2563eb', bg: '#eff6ff' },
                  { name: 'م. عبدالسلام ابريكاو', user: 'abrikaw', pass: 'abrikaw123', role: 'رئيس جهاز الإشراف', color: '#7c3aed', bg: '#f5f3ff' },
                  { name: 'م. صالح حماد', user: 'saleh_quality', pass: 'quality123', role: 'مسؤول الجودة', color: '#047857', bg: '#ecfdf5' },
                  { name: 'م. صلاح العربي', user: 'salah_alarabi', pass: 'sectora123', role: 'مشرف المرحلة 1', color: '#c2410c', bg: '#fff7ed' },
                  { name: 'م. عيسى الطاهر', user: 'issa_altahir', pass: 'sectorb123', role: 'مشرف المرحلة 2', color: '#0f766e', bg: '#f0fdfa' }
                ].map((acc) => (
                  <button
                    key={acc.user}
                    type="button"
                    onClick={() => {
                      setUsername(acc.user);
                      setPassword(acc.pass);
                      setErrorMsg('');
                    }}
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'flex-start',
                      padding: '0.45rem 0.65rem',
                      borderRadius: '8px',
                      background: username === acc.user ? acc.bg : '#f8fafc',
                      border: `1.5px solid ${username === acc.user ? acc.color : '#e2e8f0'}`,
                      cursor: 'pointer',
                      textAlign: 'right',
                      transition: 'all 0.15s ease'
                    }}
                  >
                    <span style={{ fontSize: '0.78rem', fontWeight: 800, color: '#0f172a' }}>{acc.name}</span>
                    <span style={{ fontSize: '0.68rem', color: acc.color, fontWeight: 700 }}>{acc.role}</span>
                  </button>
                ))}
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
      </div>
    );
};

export default LoginPage;
