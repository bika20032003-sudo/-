import React from 'react';
import { Home, Award, Plus, FolderArchive, Menu, Sparkles } from 'lucide-react';

/**
 * High-performance mobile bottom navigation bar
 * Designed specifically for field engineers & supervisors on mobile devices (<= 768px)
 */
export const MobileBottomNav = ({
  activeTab,
  onTabChange,
  onToggleMenu,
  currentUser,
  unreadCount = 0
}) => {
  const isArchiveActive = activeTab === 'reports-archive' || activeTab === 'general-archive';
  const isExecutiveActive = activeTab === 'executive-progress' || activeTab === 'road-progress';
  const isCreateActive = activeTab === 'create-report';
  const isDashboardActive = activeTab === 'dashboard';

  return (
    <nav className="mobile-bottom-navigation" aria-label="شريط التنقل السريع للهاتف">
      <div className="mobile-bottom-nav-inner">
        {/* 1. الرئيسية / لوحة القيادة */}
        <button
          type="button"
          className={`mobile-nav-item ${isDashboardActive ? 'active' : ''}`}
          onClick={() => onTabChange('dashboard')}
          aria-label="الرئيسية"
        >
          <div className="mobile-nav-icon-wrap">
            <Home size={20} />
          </div>
          <span className="mobile-nav-label">الرئيسية</span>
        </button>

        {/* 2. الموقف التنفيذي */}
        <button
          type="button"
          className={`mobile-nav-item ${isExecutiveActive ? 'active' : ''}`}
          onClick={() => onTabChange('executive-progress')}
          aria-label="الموقف التنفيذي"
        >
          <div className="mobile-nav-icon-wrap">
            <Award size={20} />
          </div>
          <span className="mobile-nav-label">الموقف التنفيذي</span>
        </button>

        {/* 3. زر إنشاء تقرير ميداني جديد بارز وسريع في المنتصف */}
        <div className="mobile-nav-center-action-wrap">
          <button
            type="button"
            className={`mobile-nav-center-btn ${isCreateActive ? 'active' : ''}`}
            onClick={() => onTabChange('create-report')}
            title="إنشاء تقرير ميداني جديد"
            aria-label="إنشاء تقرير جديد"
          >
            <div className="mobile-center-icon-glow">
              <Plus size={24} strokeWidth={2.8} />
            </div>
            <span className="mobile-center-label">تقرير جديد</span>
          </button>
        </div>

        {/* 4. الأرشيف الميداني */}
        <button
          type="button"
          className={`mobile-nav-item ${isArchiveActive ? 'active' : ''}`}
          onClick={() => onTabChange('reports-archive')}
          aria-label="الأرشيف"
        >
          <div className="mobile-nav-icon-wrap">
            <FolderArchive size={20} />
          </div>
          <span className="mobile-nav-label">الأرشيف</span>
        </button>

        {/* 5. القائمة الكاملة / باقي الأقسام */}
        <button
          type="button"
          className="mobile-nav-item mobile-menu-trigger"
          onClick={onToggleMenu}
          aria-label="القائمة الجانبية الكاملة"
        >
          <div className="mobile-nav-icon-wrap" style={{ position: 'relative' }}>
            <Menu size={20} />
            {unreadCount > 0 && (
              <span className="mobile-nav-badge">{unreadCount > 9 ? '9+' : unreadCount}</span>
            )}
          </div>
          <span className="mobile-nav-label">المزيد</span>
        </button>
      </div>
    </nav>
  );
};

export default MobileBottomNav;

