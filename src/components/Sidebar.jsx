import React, { useState, useEffect } from 'react';
import { 
  Home, Milestone, UploadCloud, FileText, 
  Layers, CalendarDays, Truck, Factory, 
  Mountain, Fuel, Bell, Users, LogOut, ShieldCheck, Plus
} from 'lucide-react';
import { fastFetch } from '../utils/apiCache.js';

export const Sidebar = ({ activeTab, setActiveTab, onLogout, currentUser, isMobileOpen, onCloseMobile }) => {
    const [unreadAlerts, setUnreadAlerts] = useState(0);
    const [pendingReportsCount, setPendingReportsCount] = useState(0);

    useEffect(() => {
        fastFetch('http://localhost:5000/api/alerts')
            .then(data => {
                if (data.success && data.alerts) {
                    setUnreadAlerts(data.alerts.filter((a) => !a.isRead).length);
                }
            })
            .catch(() => { });

        fastFetch('http://localhost:5000/api/reports')
            .then(data => {
                if (data.success && data.reports) {
                    const pending = data.reports.filter(r => r.status === 'pending_review').length;
                    setPendingReportsCount(pending);
                }
            })
            .catch(() => { });
    }, [activeTab]);

    const menuItems = [
        { id: 'dashboard', label: 'الرئيسية (لوحة التحكم العامة)', icon: Home },
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

      {/* Role Pill Banner */}
      <div style={{
        margin: '0.75rem 1rem 0.25rem 1rem',
        padding: '0.45rem 0.75rem',
        borderRadius: '8px',
        background: '#f8fafc',
        border: '1px solid #e2e8f0',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between'
      }}>
        <div style={{ fontSize: '0.74rem', fontWeight: 800, color: '#0f172a' }}>
          {currentUser?.name || 'مدير المشروع'}
        </div>
        <span style={{ fontSize: '0.68rem', color: '#64748b', fontWeight: 700 }}>
          إدارة المشروع
        </span>
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
