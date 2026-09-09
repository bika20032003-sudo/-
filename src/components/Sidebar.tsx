import React from 'react';
import { 
  Home, 
  Milestone,
  Building2,
  UploadCloud, 
  FileText, 
  Layers, 
  CalendarDays, 
  BarChart3, 
  Truck, 
  Factory, 
  Mountain, 
  Fuel, 
  Bell, 
  Users, 
  LogOut
} from 'lucide-react';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onLogout: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ activeTab, setActiveTab, onLogout }) => {
  const [unreadAlerts, setUnreadAlerts] = React.useState(0);

  React.useEffect(() => {
    fetch('http://localhost:5000/api/alerts')
      .then(res => res.json())
      .then(data => {
        if (data.success && data.alerts) {
          setUnreadAlerts(data.alerts.filter((a: any) => !a.isRead).length);
        }
      })
      .catch(() => {});
  }, [activeTab]);

  // Operational Navigation Menu
  const menuItems = [
    { id: 'dashboard', label: 'الرئيسية', icon: Home },
    { id: 'road-progress', label: 'إنجاز طريق أوباري غات', icon: Milestone },
    { id: 'sectors', label: 'القطاعات والشركات', icon: Building2 },
    { id: 'upload-reports', label: 'رفع التقارير', icon: UploadCloud },
    { id: 'daily-analysis', label: 'تحليل اليومية والأداء', icon: Layers },
    { id: 'tomorrow-plan', label: 'خطة الغد والتنفيذ', icon: CalendarDays },
    { id: 'daily-reports', label: 'أرشيف التقارير', icon: FileText },
    { id: 'analytics', label: 'التقارير والتحليلات', icon: BarChart3 },
    { id: 'crushers', label: 'الكسارات والإنتاج', icon: Factory },
    { id: 'sharshoor', label: 'الشرشور والركام', icon: Mountain },
    { id: 'fuel', label: 'الوقود والصهاريج', icon: Fuel },
    { id: 'equipment', label: 'المعدات والآليات', icon: Truck },
    { id: 'users', label: 'مركز المستخدمين', icon: Users },
    { id: 'alerts', label: 'التنبيهات', icon: Bell, badge: unreadAlerts > 0 ? unreadAlerts : undefined }
  ];

  return (
    <aside className="custom-app-sidebar">
      {/* Brand Header with Agency Emblem */}
      <div className="sidebar-app-brand">
        <div className="agency-logo-wrap">
          <img 
            src="/logo-agency.jpg" 
            alt="شعار جهاز تنفيذ مشروعات المواصلات" 
            className="agency-sidebar-logo" 
          />
        </div>
        <div className="brand-app-title">
          <h2>منظومة متابعة الكسارات</h2>
          <h3>والمعدات والوقود</h3>
        </div>
      </div>

      {/* Nav List */}
      <nav className="sidebar-app-nav">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              className={`nav-btn-link ${isActive ? 'active' : ''}`}
              onClick={() => setActiveTab(item.id)}
            >
              <div className="nav-btn-inner">
                <Icon size={18} className="nav-svg-icon" />
                <span className="nav-link-title">{item.label}</span>
              </div>

              {item.badge !== undefined && (
                <div className="nav-btn-extra">
                  <span className="nav-badge-pill">{item.badge}</span>
                </div>
              )}
            </button>
          );
        })}
      </nav>

      {/* Footer Section with Original Styled Logout Button */}
      <div className="sidebar-app-footer">
        <div className="agency-meta-card">
          <p className="agency-meta-title">جهاز تنفيذ مشروعات المواصلات</p>
          <p className="agency-meta-sub">منظومة دعم القرار والتشغيل اليومي</p>
        </div>

        <button 
          className="nav-logout-btn"
          onClick={onLogout}
        >
          <LogOut size={18} />
          <span>تسجيل الخروج</span>
        </button>
      </div>
    </aside>
  );
};
