import React, { useState, useEffect } from 'react';
import { 
  Home, Milestone, UploadCloud, FileText, 
  Layers, CalendarDays, CalendarRange, Truck, Factory, 
  Mountain, Fuel, Bell, Users, LogOut, ShieldCheck, Plus, MapPin
} from 'lucide-react';
import { fastFetch } from '../utils/apiCache.js';

/**
 * Role-aware sidebar that shows different menu items based on the user's role:
 * - مدير المشروع: Full access to everything
 * - مدير القطاعات: Full access (admin-level)
 * - مشرف القطاع (A/B): Restricted to sector-specific dashboard + limited items
 */
export const Sidebar = ({ activeTab, setActiveTab, onLogout, currentUser, isMobileOpen, onCloseMobile }) => {
    const [unreadAlerts, setUnreadAlerts] = useState(0);
    const [pendingReportsCount, setPendingReportsCount] = useState(0);

    const userRole = currentUser?.role || '';
    const isSectorSupervisor = userRole.includes('مشرف القطاع');
    const isAdmin = userRole.includes('مدير المشروع') || userRole.includes('مدير القطاعات');

    useEffect(() => {
        fastFetch('http://localhost:5000/api/alerts')
            .then(data => {
                const list = data?.alerts || (Array.isArray(data) ? data : []);
                setUnreadAlerts(list.filter(a => !a.isRead).length);
            })
            .catch(() => { });

        fastFetch('http://localhost:5000/api/reports')
            .then(data => {
                const list = data?.reports || (Array.isArray(data) ? data : []);
                const pending = list.filter(r => r.status === 'pending_review').length;
                setPendingReportsCount(pending);
            })
            .catch(() => { });
    }, [activeTab]);

    // ===== Build menu items based on role =====
    let menuItems = [];

    if (isSectorSupervisor) {
        // Sector supervisors see a restricted menu
        const sectorLabel = userRole.includes('A') ? 'القطاع (A)' : 'القطاع (B)';
        menuItems = [
            { id: 'sector-dashboard', label: `لوحة العمليات - ${sectorLabel}`, icon: MapPin },
            { id: 'create-report', label: 'إنشاء تقرير ميداني جديد', icon: Plus },
            { id: 'upload-reports', label: 'رفع ومعالجة التقارير', icon: UploadCloud },
            { id: 'reports-archive', label: 'أرشيف التقارير والطباعة', icon: FileText },
            { id: 'crushers', label: 'الكسارات ومعدلات الإنتاج', icon: Factory },
            { id: 'sharshoor', label: 'الشرشور والركام', icon: Mountain },
            { id: 'fuel', label: 'إدارة الوقود والصهاريج', icon: Fuel },
            { id: 'equipment', label: 'سجل المعدات والآليات', icon: Truck },
            { id: 'alerts', label: 'التنبيهات والإشعارات', icon: Bell, badge: unreadAlerts > 0 ? unreadAlerts : undefined }
        ];
    } else {
        // Admin users (مدير المشروع + مدير القطاعات) get full menu
        menuItems = [
            { id: 'dashboard', label: 'الرئيسية (لوحة التحكم العامة)', icon: Home },
            { id: 'periodic-reports', label: 'التقارير الدورية (شهرية وسنوية)', icon: CalendarRange, badge: 'تلقائي' },
            { id: 'create-report', label: 'إنشاء تقرير ميداني جديد', icon: Plus },
            { id: 'reports-archive', label: 'أرشيف التقارير والطباعة', icon: FileText, badge: pendingReportsCount > 0 ? `${pendingReportsCount} قيد الاعتماد` : undefined },
            { id: 'daily-reports', label: 'اعتماد ومراجعة التقارير', icon: ShieldCheck },
            { id: 'road-progress', label: 'إنجاز طريق أوباري - غات', icon: Milestone },
            { id: 'upload-reports', label: 'رفع ومعالجة التقارير', icon: UploadCloud },
            { id: 'daily-analysis', label: 'تحليل اليومية والأداء', icon: Layers },
            { id: 'tomorrow-plan', label: 'خطة الغد والتنفيذ', icon: CalendarDays },
            { id: 'crushers', label: 'الكسارات ومعدلات الإنتاج', icon: Factory },
            { id: 'sharshoor', label: 'الشرشور والركام', icon: Mountain },
            { id: 'fuel', label: 'إدارة الوقود والصهاريج', icon: Fuel },
            { id: 'equipment', label: 'سجل المعدات والآليات', icon: Truck },
            { id: 'users', label: 'مركز المستخدمين والصلاحيات', icon: Users },
            { id: 'alerts', label: 'التنبيهات والإشعارات', icon: Bell, badge: unreadAlerts > 0 ? unreadAlerts : undefined }
        ];
    }

    // Determine the role display label and color
    const getRoleDisplay = () => {
        if (userRole.includes('مدير المشروع')) return { label: 'مدير المشروع', color: '#2563eb', bg: '#eff6ff' };
        if (userRole.includes('مدير القطاعات')) return { label: 'مدير القطاعات', color: '#16a34a', bg: '#f0fdf4' };
        if (userRole.includes('مشرف القطاع') && userRole.includes('A')) return { label: 'مشرف القطاع (A)', color: '#ea580c', bg: '#fff7ed' };
        if (userRole.includes('مشرف القطاع') && userRole.includes('B')) return { label: 'مشرف القطاع (B)', color: '#7c3aed', bg: '#f5f3ff' };
        return { label: userRole || 'مستخدم', color: '#64748b', bg: '#f8fafc' };
    };

    const roleDisplay = getRoleDisplay();

    return (<aside className={`custom-app-sidebar ${isMobileOpen ? 'mobile-open' : ''}`}>
      {/* Brand Header with Agency Emblem */}
      <div className="sidebar-app-brand" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div className="agency-logo-wrap">
            <img src={`${import.meta.env.BASE_URL}logo-agency.jpg`} alt="شعار جهاز تنفيذ مشروعات المواصلات" className="agency-sidebar-logo"/>
          </div>
          <div className="brand-app-title">
            <h2>منظومة متابعة الكسارات</h2>
            <h3>والمعدات والوقود والتشغيل</h3>
          </div>
        </div>

        {/* Mobile Close Button */}
        <button
          type="button"
          className="sidebar-mobile-close-btn"
          onClick={onCloseMobile}
          title="إغلاق القائمة"
        >
          ✕
        </button>
      </div>

      {/* Role Pill Banner - Shows actual user role with color */}
      <div style={{
        margin: '0.75rem 1rem 0.25rem 1rem',
        padding: '0.55rem 0.85rem',
        borderRadius: '10px',
        background: roleDisplay.bg,
        border: `1.5px solid ${roleDisplay.color}22`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '0.5rem'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <div style={{
            width: '28px',
            height: '28px',
            borderRadius: '50%',
            background: roleDisplay.color,
            color: '#fff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '0.7rem',
            fontWeight: 900
          }}>
            {(currentUser?.name || '?')[0]}
          </div>
          <div>
            <div style={{ fontSize: '0.78rem', fontWeight: 800, color: '#0f172a', lineHeight: 1.2 }}>
              {currentUser?.name || 'مدير المشروع'}
            </div>
            <div style={{ fontSize: '0.68rem', fontWeight: 700, color: roleDisplay.color }}>
              {roleDisplay.label}
            </div>
          </div>
        </div>
        <ShieldCheck size={16} color={roleDisplay.color} />
      </div>

      {/* Nav List */}
      <nav className="sidebar-app-nav">
        {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (<button 
              key={item.id} 
              className={`nav-btn-link ${isActive ? 'active' : ''}`} 
              onClick={() => {
                setActiveTab(item.id);
                if (onCloseMobile) onCloseMobile();
              }}
            >
              <div className="nav-btn-inner">
                <Icon size={18} className="nav-svg-icon"/>
                <span className="nav-link-title">{item.label}</span>
              </div>

              {item.badge !== undefined && (<div className="nav-btn-extra">
                  <span className="nav-badge-pill" style={item.id === 'daily-reports' && pendingReportsCount > 0 ? { background: '#d97706', color: '#fff', fontSize: '0.65rem' } : {}}>
                    {item.badge}
                  </span>
                </div>)}
            </button>);
        })}
      </nav>

      {/* Footer Section with Logout Button */}
      <div className="sidebar-app-footer">
        <div className="agency-meta-card">
          <p className="agency-meta-title">جهاز تنفيذ مشروعات المواصلات</p>
          <p className="agency-meta-sub">منظومة المتابعة والتشغيل اليومي</p>
        </div>

        <button className="nav-logout-btn" onClick={onLogout}>
          <LogOut size={18}/>
          <span>تسجيل الخروج</span>
        </button>
      </div>
    </aside>);
};

export default Sidebar;
