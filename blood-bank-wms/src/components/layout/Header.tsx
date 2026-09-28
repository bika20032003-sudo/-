'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Search, Bell, Moon, Sun, ChevronDown, User, Settings, LogOut } from 'lucide-react';
import { useTheme } from '@/context/ThemeContext';

export default function Header({ title, subtitle }: { title: string; subtitle?: string }) {
  const router = useRouter();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const { theme, toggleTheme } = useTheme();

  const [userInfo, setUserInfo] = useState({
    name: 'مدير النظام',
    role: 'مدير',
    initial: 'م',
  });

  useEffect(() => {
    try {
      const savedUser = localStorage.getItem('user');
      if (savedUser) {
        const parsed = JSON.parse(savedUser);
        if (parsed.FullName) {
          setUserInfo({
            name: parsed.FullName,
            role: parsed.Role === 'admin' ? 'مدير' : 'أمين مخزن',
            initial: parsed.FullName.charAt(0) || 'م',
          });
        }
      }
    } catch {}
  }, []);

  const handleLogout = () => {
    try {
      localStorage.removeItem('user');
      localStorage.removeItem('isLoggedIn');
    } catch {}
    setShowUserMenu(false);
    router.push('/login');
  };

  return (
    <header className="header">
      {/* الجانب الأيمن - العنوان */}
      <div className="header-right">
        <div>
          <h2 className="page-title">{title}</h2>
          {subtitle && <p className="page-breadcrumb">{subtitle}</p>}
        </div>
      </div>

      {/* الجانب الأيسر - البحث والإجراءات */}
      <div className="header-left">
        {/* حقل البحث */}
        <div className="header-search">
          <Search className="header-search-icon" size={18} />
          <input type="text" placeholder="بحث في المنظومة..." />
        </div>

        {/* أيقونات الإجراءات */}
        <div className="header-actions">
          {/* زر تبديل الوضع (النهارى / الليلي) */}
          <button
            className="header-icon-btn"
            onClick={toggleTheme}
            title={theme === 'dark' ? 'الوضع النهاري (Light Mode)' : 'الوضع الليلي (Dark Mode)'}
            aria-label="تبديل المظهر"
          >
            {theme === 'dark' ? (
              <Sun size={20} style={{ color: '#f59e0b' }} />
            ) : (
              <Moon size={20} style={{ color: 'var(--text-secondary)' }} />
            )}
          </button>

          {/* زر الإشعارات */}
          <button className="header-icon-btn" title="الإشعارات">
            <Bell size={20} />
            <span className="notification-dot"></span>
          </button>
        </div>

        {/* معلومات المستخدم */}
        <div className="dropdown" style={{ position: 'relative' }}>
          <div className="header-user" onClick={() => setShowUserMenu(!showUserMenu)}>
            <div className="header-user-avatar">{userInfo.initial}</div>
            <div className="header-user-info">
              <div className="header-user-name">{userInfo.name}</div>
              <div className="header-user-role">{userInfo.role}</div>
            </div>
            <ChevronDown size={16} style={{ color: 'var(--text-tertiary)' }} />
          </div>

          {/* خلفية شفافة لإغلاق القائمة عند النقر خارجها */}
          {showUserMenu && (
            <div
              style={{ position: 'fixed', inset: 0, zIndex: 998 }}
              onClick={() => setShowUserMenu(false)}
            />
          )}

          {/* القائمة المنسدلة */}
          {showUserMenu && (
            <div className="dropdown-menu" style={{ position: 'absolute', top: '100%', left: 0, zIndex: 999, marginTop: '8px' }}>
              <Link href="/profile" style={{ color: 'inherit', textDecoration: 'none' }} onClick={() => setShowUserMenu(false)}>
                <div className="dropdown-item">
                  <User size={16} />
                  <span>الملف الشخصي</span>
                </div>
              </Link>
              <Link href="/settings" style={{ color: 'inherit', textDecoration: 'none' }} onClick={() => setShowUserMenu(false)}>
                <div className="dropdown-item">
                  <Settings size={16} />
                  <span>الإعدادات</span>
                </div>
              </Link>
              <div className="dropdown-divider"></div>
              <div className="dropdown-item danger" onClick={handleLogout} style={{ cursor: 'pointer' }}>
                <LogOut size={16} />
                <span>تسجيل الخروج</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

