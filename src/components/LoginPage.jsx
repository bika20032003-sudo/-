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
    const [isLoading, setIsLoading] = useState(false);
    const [loadingRole, setLoadingRole] = useState(null);
    const [showCustomLogin, setShowCustomLogin] = useState(false);
    const [customName, setCustomName] = useState('');
    const [errorMsg, setErrorMsg] = useState('');

    const systemUsers = getSystemUsers();

    // Default 4 main roles for instant direct login
    const quickRoles = [
      {
        id: 1,
        username: 'admin',
        name: 'مدير المشروع',
        role: 'مدير المشروع',
        sector: 'all',
        description: 'صلاحيات تنفيذية كاملة ولوحة المتابعة الشاملة',
        badgeColor: '#2563eb',
        bgHover: '#eff6ff',
        borderHover: '#93c5fd',
        icon: '🛡️'
      },
      {
        id: 2,
        username: 'admin_sectors',
        name: 'مدير القطاعات',
        role: 'مدير القطاعات',
        sector: 'all',
        description: 'إشراف ومتابعة كافة القطاعات واعتماد التقارير',
        badgeColor: '#16a34a',
        bgHover: '#f0fdf4',
        borderHover: '#86efac',
        icon: '🏢'
      },
      {
        id: 3,
        username: 'sector_a',
        name: 'مشرف القطاع (A)',
        role: 'مشرف القطاع (A)',
        sector: 'القطعة A',
        description: 'لوحة العمليات الميدانية والتقارير للقطعة A',
        badgeColor: '#ea580c',
        bgHover: '#fff7ed',
        borderHover: '#fdba74',
        icon: '🚧'
      },
      {
        id: 4,
        username: 'sector_b',
        name: 'مشرف القطاع (B)',
        role: 'مشرف القطاع (B)',
        sector: 'القطعة B',
        description: 'لوحة العمليات الميدانية والتقارير للقطعة B',
        badgeColor: '#7c3aed',
        bgHover: '#faf5ff',
        borderHover: '#d8b4fe',
        icon: '🚧'
      }
    ];

    const handleRoleLogin = (roleItem) => {
      setLoadingRole(roleItem.id);
      setIsLoading(true);
      setTimeout(() => {
        setIsLoading(false);
        setLoadingRole(null);
        onLoginSuccess({
          id: roleItem.id,
          username: roleItem.username,
          name: roleItem.name,
          role: roleItem.role,
          sector: roleItem.sector || 'all'
        });
      }, 250);
    };

    const handleCustomSubmit = (e) => {
      e.preventDefault();
      const trimmed = customName.trim();
      if (!trimmed) {
        setErrorMsg('يرجى إدخال اسم المستخدم أو الدور');
        return;
      }
      setIsLoading(true);
      setTimeout(() => {
        setIsLoading(false);
        const matched = systemUsers.find(
          u => u.username.toLowerCase() === trimmed.toLowerCase() ||
               u.name.toLowerCase().includes(trimmed.toLowerCase())
        );
        if (matched) {
          onLoginSuccess({
            id: matched.id,
            username: matched.username,
            name: matched.name,
            role: matched.role,
            sector: matched.sector || 'all'
          });
        } else {
          onLoginSuccess({
            id: Date.now(),
            username: trimmed,
            name: trimmed,
            role: 'مدير المشروع',
            sector: 'all'
          });
        }
      }, 250);
    };

    return (
      <div className="login-page-screen">
        <div className="portal-wrapper" style={{ height: 'auto', minHeight: '560px', maxHeight: '92vh' }}>
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

          {/* ================= Right Side: One-Click Role Selection ================= */}
          <div className="login-column" style={{ padding: '2rem 2.5rem', overflowY: 'auto' }}>
            {/* Form Header with Logo */}
            <div className="form-header" style={{ marginBottom: '1.25rem' }}>
              <div className="form-logo-box" style={{ width: '48px', height: '48px', marginBottom: '0.75rem' }}>
                <img src={`${import.meta.env.BASE_URL}logo-agency.jpg`} alt="شعار جهاز تنفيذ مشروعات المواصلات" className="form-logo-img"/>
              </div>
              <div className="form-brand">
                <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0f172a', margin: '0 0 0.25rem 0' }}>
                  جهاز تنفيذ مشروعات المواصلات
                </h2>
                <p style={{ fontSize: '0.85rem', color: '#64748b', margin: 0 }}>
                  بوابة تسجيل الدخول والمتابعة الميدانية
                </p>
              </div>
            </div>

            {/* Error Alert */}
            {errorMsg && (
              <div className="alert-box error" style={{ marginBottom: '1rem' }}>
                <AlertCircle size={18}/>
                <span>{errorMsg}</span>
              </div>
            )}

            {/* Main Action: Primary Instant Entry Button */}
            <button
              onClick={() => handleRoleLogin(quickRoles[0])}
              disabled={isLoading}
              className="submit-btn crimson"
              style={{
                width: '100%',
                height: '48px',
                fontSize: '0.95rem',
                fontWeight: 800,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.6rem',
                marginBottom: '1.25rem',
                boxShadow: '0 6px 18px rgba(185, 28, 28, 0.25)',
                cursor: 'pointer'
              }}
            >
              {isLoading && loadingRole === 1 ? (
                <>
                  <div className="spinner"/>
                  <span>جاري الدخول...</span>
                </>
              ) : (
                <>
                  <ShieldCheck size={20} />
                  <span>الدخول المباشر للمنظومة (كامل الصلاحيات)</span>
                </>
              )}
            </button>

            {/* Section Subtitle */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem',
              marginBottom: '0.85rem'
            }}>
              <div style={{ flex: 1, height: '1px', background: '#e2e8f0' }} />
              <span style={{ fontSize: '0.78rem', fontWeight: 700, color: '#64748b' }}>
                أو اختر الدور الوظيفي للمتابعة المباشرة:
              </span>
              <div style={{ flex: 1, height: '1px', background: '#e2e8f0' }} />
            </div>

            {/* Role Cards Grid (No passwords, No username hassle) */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '0.6rem', marginBottom: '1.25rem' }}>
              {quickRoles.map((roleItem) => (
                <div
                  key={roleItem.id}
                  onClick={() => !isLoading && handleRoleLogin(roleItem)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '0.75rem 1rem',
                    background: '#ffffff',
                    border: '1.5px solid #e2e8f0',
                    borderRadius: '12px',
                    cursor: isLoading ? 'not-allowed' : 'pointer',
                    transition: 'all 0.2s ease',
                    boxShadow: '0 2px 6px rgba(0, 0, 0, 0.03)'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = roleItem.borderHover;
                    e.currentTarget.style.background = roleItem.bgHover;
                    e.currentTarget.style.transform = 'translateY(-2px)';
                    e.currentTarget.style.boxShadow = '0 6px 14px rgba(0, 0, 0, 0.06)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = '#e2e8f0';
                    e.currentTarget.style.background = '#ffffff';
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = '0 2px 6px rgba(0, 0, 0, 0.03)';
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <div style={{
                      width: '38px',
                      height: '38px',
                      borderRadius: '10px',
                      background: `${roleItem.badgeColor}15`,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '1.2rem'
                    }}>
                      {roleItem.icon}
                    </div>
                    <div>
                      <div style={{ fontSize: '0.88rem', fontWeight: 800, color: '#1e293b' }}>
                        {roleItem.name}
                      </div>
                      <div style={{ fontSize: '0.72rem', color: '#64748b', marginTop: '0.1rem' }}>
                        {roleItem.description}
                      </div>
                    </div>
                  </div>

                  <span style={{
                    fontSize: '0.75rem',
                    fontWeight: 700,
                    color: roleItem.badgeColor,
                    background: `${roleItem.badgeColor}12`,
                    padding: '0.35rem 0.75rem',
                    borderRadius: '8px',
                    whiteSpace: 'nowrap'
                  }}>
                    {isLoading && loadingRole === roleItem.id ? 'جاري الدخول...' : 'دخول فوري ➔'}
                  </span>
                </div>
              ))}
            </div>

            {/* Optional Custom User Dropdown Toggle */}
            <div style={{ textAlign: 'center', marginTop: '0.5rem' }}>
              <button
                type="button"
                onClick={() => setShowCustomLogin(!showCustomLogin)}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#64748b',
                  fontSize: '0.75rem',
                  cursor: 'pointer',
                  textDecoration: 'underline'
                }}
              >
                {showCustomLogin ? 'إخفاء الدخول المخصص' : 'أو الدخول باسم مستخدم آخر'}
              </button>

              {showCustomLogin && (
                <form onSubmit={handleCustomSubmit} style={{ marginTop: '0.75rem' }}>
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <input
                      type="text"
                      className="form-input"
                      style={{ height: '38px', fontSize: '0.82rem' }}
                      placeholder="أدخل الاسم أو المسمى الوظيفي"
                      value={customName}
                      onChange={(e) => setCustomName(e.target.value)}
                    />
                    <button
                      type="submit"
                      className="primary-action-btn"
                      style={{ height: '38px', padding: '0 1rem', fontSize: '0.82rem', whiteSpace: 'nowrap' }}
                    >
                      دخول
                    </button>
                  </div>
                </form>
              )}
            </div>

            {/* Footer Support Social Icon */}
            <div className="portal-footer-actions" style={{ marginTop: '1.25rem' }}>
              <button className="social-circle-btn" title="صفحتنا على فيسبوك" onClick={(e) => {
                e.preventDefault();
                window.open('https://facebook.com', '_blank');
              }}>
                <Facebook size={18} color="#1877f2"/>
              </button>
            </div>
          </div>
        </div>
      </div>
    );
};

export default LoginPage;
