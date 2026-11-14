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
    password: 'admin1234'
  },
  {
    id: 7,
    username: 'fuel_officer',
    name: 'مسؤول الوقود والمحروقات',
    role: 'مسؤول الوقود بالموقع',
    title: 'مسؤول الوقود والمحروقات (المواقع 107 و 240)',
    sector: 'all',
    email: 'fuel@mot.gov.ly',
    password: 'fuel123'
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
  'hammad': 'saleh_quality',
  'fuel': 'fuel_officer',
  'fuel_officer': 'fuel_officer',
  'وقود': 'fuel_officer',
  'مسؤول الوقود': 'fuel_officer',
  'مسؤول الوقود والمحروقات': 'fuel_officer'
};

/**
 * Helper to identify fuel officer accounts
 */
const isFuelOfficerAccount = (u) => {
  if (!u) return false;
  const uname = String(u.username || '').toLowerCase();
  const name = String(u.name || '').toLowerCase();
  const role = String(u.role || '').toLowerCase();
  const title = String(u.title || '').toLowerCase();
  return uname === 'fuel_officer' || uname === 'fuel' || 
         role.includes('وقود') || name.includes('مسؤول الوقود') || title.includes('مسؤول الوقود');
};

/**
 * Helper to identify Marwan accounts (purged permanently)
 */
const isMarwanAccount = (u) => {
  if (!u) return false;
  const uname = String(u.username || '').toLowerCase();
  const name = String(u.name || '').toLowerCase();
  return uname === 'honi' || name.includes('مروان') || name.includes('الهوني');
};

/**
 * Core official accounts that must never be deleted
 */
const isCoreOfficialAccount = (u) => {
  if (!u) return false;
  const coreIds = [1, 2, 3, 4, 5, 6];
  const coreUsernames = ['admin', 'project_manager', 'abrikaw', 'saleh_quality', 'salah_alarabi', 'issa_altahir'];
  return coreIds.includes(u.id) || coreUsernames.includes(String(u.username || '').toLowerCase());
};

/**
 * Get the current list of users with their latest passwords.
 */
export function getSystemUsers() {
  let users = JSON.parse(JSON.stringify(DEFAULT_USERS));
  try {
    // Read deleted users list
    const rawDeleted = localStorage.getItem('system_deleted_users');
    const deletedList = rawDeleted ? JSON.parse(rawDeleted) : [];
    const isDeleted = (u) => {
      if (isCoreOfficialAccount(u)) return false;
      return deletedList.some(d => {
        if (!d) return false;
        if (typeof d === 'number' || typeof d === 'string') {
          return String(d).toLowerCase() === String(u.id).toLowerCase() || 
                 String(d).toLowerCase() === String(u.username).toLowerCase();
        }
        return (d.id && d.id === u.id) || 
               (d.username && String(d.username).toLowerCase() === String(u.username).toLowerCase()) ||
               (d.name && d.name === u.name);
      });
    };

    const rawPasswords = localStorage.getItem('system_user_passwords');
    const savedPasswords = rawPasswords ? JSON.parse(rawPasswords) : {};
    if (savedPasswords && typeof savedPasswords === 'object') {
      users = users.map(u => {
        const uPass = savedPasswords[u.username] || 
                      savedPasswords[u.username.toLowerCase()] || 
                      savedPasswords[u.name] || 
                      u.password;
        return {
          ...u,
          password: uPass,
          avatar: localStorage.getItem(`user_avatar_${u.username}`) || u.avatar || ''
        };
      });
    }

    // Merge custom users safely
    const rawCustom = localStorage.getItem('system_custom_users');
    let customUsers = rawCustom ? JSON.parse(rawCustom) : [];
    if (Array.isArray(customUsers)) {
      // Purge any Marwan or duplicate fuel entries from stored custom users
      const cleanedCustom = customUsers.filter(cu => cu && typeof cu === 'object' && !isMarwanAccount(cu));
      if (cleanedCustom.length !== customUsers.length) {
        localStorage.setItem('system_custom_users', JSON.stringify(cleanedCustom));
        customUsers = cleanedCustom;
      }

      customUsers.forEach(cu => {
        if (!cu || typeof cu !== 'object') return;
        if (isMarwanAccount(cu)) return;
        if (isDeleted(cu)) return;

        // Never allow legacy cache to overwrite core account identities
        if (cu.username === 'admin' || cu.username === 'project_manager') {
          return;
        }

        const cuPass = (savedPasswords && (savedPasswords[cu.username] || savedPasswords[cu.username.toLowerCase()] || savedPasswords[cu.name])) || cu.password || 'admin1234';

        // Check if this is a fuel officer custom user: deduplicate into single canonical account
        if (isFuelOfficerAccount(cu)) {
          const canonFuelIdx = users.findIndex(u => isFuelOfficerAccount(u));
          if (canonFuelIdx >= 0) {
            users[canonFuelIdx] = {
              ...users[canonFuelIdx],
              password: cuPass || users[canonFuelIdx].password,
              avatar: localStorage.getItem(`user_avatar_${cu.username}`) || cu.avatar || users[canonFuelIdx].avatar || ''
            };
            return;
          }
        }

        const existingIdx = users.findIndex(u => u.username === cu.username || u.id === cu.id);
        if (existingIdx === -1) {
          users.push({
            ...cu,
            password: cuPass,
            avatar: localStorage.getItem(`user_avatar_${cu.username}`) || cu.avatar || ''
          });
        } else if (!isCoreOfficialAccount(users[existingIdx])) {
          users[existingIdx] = {
            ...users[existingIdx],
            ...cu,
            password: cuPass,
            avatar: localStorage.getItem(`user_avatar_${cu.username}`) || cu.avatar || users[existingIdx]?.avatar || ''
          };
        }
      });
    }

    // Filter out deleted users & Marwan
    users = users.filter(u => !isMarwanAccount(u) && !isDeleted(u));

    // Deduplicate fuel officer accounts strictly: keep only 1 canonical fuel officer
    let seenFuel = false;
    users = users.filter(u => {
      if (isFuelOfficerAccount(u)) {
        if (seenFuel) return false;
        seenFuel = true;
      }
      return true;
    });

    // Deduplicate by username
    const seenUsernames = new Set();
    users = users.filter(u => {
      const uname = String(u.username || '').toLowerCase();
      if (!uname || seenUsernames.has(uname)) return false;
      seenUsernames.add(uname);
      return true;
    });

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
    const rawU = (username || '').trim();
    if (!rawU || !newPassword) return false;
    const lowU = rawU.toLowerCase();
    const canonU = ALIASES[lowU] || lowU;

    const savedPasswords = JSON.parse(localStorage.getItem('system_user_passwords') || '{}');
    savedPasswords[rawU] = newPassword;
    savedPasswords[lowU] = newPassword;
    savedPasswords[canonU] = newPassword;

    // Also associate by real name if matched in default users
    const matched = DEFAULT_USERS.find(u => u.username === canonU || u.username === lowU || u.name === rawU);
    if (matched) {
      savedPasswords[matched.username] = newPassword;
      savedPasswords[matched.name] = newPassword;
    }

    localStorage.setItem('system_user_passwords', JSON.stringify(savedPasswords));

    // Also update system_custom_users if user is stored there
    try {
      const customUsers = JSON.parse(localStorage.getItem('system_custom_users') || '[]');
      let updatedCustom = false;
      const newCustom = customUsers.map(cu => {
        if (cu.username === canonU || cu.username === lowU || cu.username === rawU || cu.name === rawU) {
          updatedCustom = true;
          return { ...cu, password: newPassword };
        }
        return cu;
      });
      if (updatedCustom) {
        localStorage.setItem('system_custom_users', JSON.stringify(newCustom));
      }
    } catch (_) {}

    window.dispatchEvent(new CustomEvent('passwords-updated', { detail: { username: canonU, newPassword } }));
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
 * Delete a custom or non-core user from localStorage permanently
 */
export function deleteCustomUser(userId, username, name) {
  try {
    const rawCustom = localStorage.getItem('system_custom_users') || '[]';
    const customUsers = JSON.parse(rawCustom);
    const filtered = customUsers.filter(u => {
      if (!u) return false;
      if (userId && (u.id === userId || String(u.id) === String(userId))) return false;
      if (username && String(u.username).toLowerCase() === String(username).toLowerCase()) return false;
      if (name && u.name === name) return false;
      return true;
    });
    localStorage.setItem('system_custom_users', JSON.stringify(filtered));

    // Register into system_deleted_users so non-core or default users stay deleted
    const rawDeleted = localStorage.getItem('system_deleted_users') || '[]';
    const deletedUsers = JSON.parse(rawDeleted);
    const already = deletedUsers.some(d => {
      if (!d) return false;
      if (typeof d === 'number' || typeof d === 'string') {
        return (userId && String(d) === String(userId)) || 
               (username && String(d).toLowerCase() === String(username).toLowerCase());
      }
      return (userId && d.id === userId) ||
             (username && String(d.username || '').toLowerCase() === String(username).toLowerCase());
    });
    if (!already) {
      deletedUsers.push({ id: userId, username: username || '', name: name || '' });
      localStorage.setItem('system_deleted_users', JSON.stringify(deletedUsers));
    }
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
                  <p>منظومة متابعة أعمال الطريق والوقود والآليات</p>
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
                  متابعة يومية شاملة لتقدم أعمال الرصف بالمرحلتين الأولى والثانية، وأرصدة الوقود والصهاريج، ومواقف تشغيل الآليات، ورفع التقارير الميدانية المباشرة.
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
