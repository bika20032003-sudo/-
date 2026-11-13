import React, { useState, useEffect } from 'react';
import { 
  Home, Milestone, UploadCloud, FileText, FolderArchive,
  CalendarRange, Truck, 
  Fuel, Bell, Users, LogOut, ShieldCheck, Plus, MapPin,
  Camera, Mail, Briefcase, FilePlus, Target, Award
} from 'lucide-react';
import { fastFetch } from '../utils/apiCache.js';
import { canAccessGeneralArchive, canAccessPeriodicReports } from '../utils/permissionUtils.js';

/**
 * Role-aware sidebar with customized menus:
 * 1. م. عبدالرحمن الأنصاري: مدير المشروع
 * 2. م. عبدالسلام ابريكاو: رئيس جهاز الإشراف
 * 3. م. صالح حماد: مسؤول الجودة
 * 4. م. صلاح العربي: مهندس مشرف (المرحلة الأولى)
 * 5. م. عيسى الطاهر: مهندس مشرف (المرحلة الثانية)
 */
export const Sidebar = ({ 
  activeTab, 
  setActiveTab, 
  onLogout, 
  currentUser, 
  isMobileOpen, 
  onCloseMobile,
  onOpenProfile
}) => {
    const [unreadAlerts, setUnreadAlerts] = useState(0);
    const [unreadMessages, setUnreadMessages] = useState(0);

    const userRole = currentUser?.role || '';
    const username = currentUser?.username || '';

    // Check specific roles
    const isDev = userRole.includes('حساب التطوير') || userRole.includes('التطوير') || username === 'admin' || username === 'dev';
    const isProjectManager = (userRole.includes('مدير المشروع') || username === 'project_manager' || username === 'alansari' || username === 'manager') && !isDev;
    const isHeadOfSupervision = (userRole.includes('رئيس جهاز الإشراف') || username === 'abrikaw' || username === 'admin_sectors') && !isDev;
    const isQualityOfficer = (userRole.includes('الجودة') || username === 'saleh_quality' || username === 'quality') && !isDev;
    const isSectorA = (userRole.includes('A') || (currentUser?.sector || '').includes('A') || username.includes('a') || username === 'salah_alarabi') && !isProjectManager && !isHeadOfSupervision && !isQualityOfficer && !isDev;
    const isSectorB = (userRole.includes('B') || (currentUser?.sector || '').includes('B') || username.includes('b') || username === 'issa_altahir') && !isProjectManager && !isHeadOfSupervision && !isQualityOfficer && !isDev;
    const isSectorSupervisor = isSectorA || isSectorB || userRole.includes('مشرف') || userRole.includes('مدير القطاع');

    useEffect(() => {
        const updateSidebarCounters = () => {
            fastFetch('/api/alerts')
                .then(data => {
                    const list = data?.alerts || (Array.isArray(data) ? data : []);
                    setUnreadAlerts(list.filter(a => !a.isRead).length);
                })
                .catch(() => { });

            if (username) {
                fastFetch(`/api/messages?username=${encodeURIComponent(username)}`)
                    .then(data => {
                        const list = data?.messages || (Array.isArray(data) ? data : []);
                        const unread = list.filter(m => !m.isRead && (m.toUsername === username || m.toUsername === 'all')).length;
                        setUnreadMessages(unread);
                    })
                    .catch(() => { });
            }
        };

        updateSidebarCounters();
        window.addEventListener('alerts-updated', updateSidebarCounters);
        window.addEventListener('storage', updateSidebarCounters);
        const intervalId = setInterval(updateSidebarCounters, 15000);
        return () => {
            window.removeEventListener('alerts-updated', updateSidebarCounters);
            window.removeEventListener('storage', updateSidebarCounters);
            clearInterval(intervalId);
        };
    }, [username]);

    // Determine user role badge display and styling
    const getRoleDisplay = () => {
        if (isDev) {
            return { 
                label: 'حساب التطوير', 
                color: '#10b981', 
                bg: 'rgba(16, 185, 129, 0.15)', 
                name: currentUser?.name || 'م. حساب التطوير' 
            };
        }
        if (isProjectManager) {
            return { 
                label: 'مدير المشروع', 
                color: '#3b82f6', 
                bg: 'rgba(59, 130, 246, 0.15)', 
                name: currentUser?.name || 'م. عبدالرحمن الأنصاري' 
            };
        }
        if (isHeadOfSupervision) {
            return { 
                label: 'رئيس جهاز الإشراف', 
                color: '#8b5cf6', 
                bg: 'rgba(139, 92, 246, 0.15)', 
                name: currentUser?.name || 'م. عبدالسلام ابريكاو' 
            };
        }
        if (isQualityOfficer) {
            return { 
                label: 'مسؤول الجودة', 
                color: '#10b981', 
                bg: 'rgba(16, 185, 129, 0.15)', 
                name: currentUser?.name || 'م. صالح حماد' 
            };
        }
        if (isSectorA) {
            return { 
                label: 'مهندس مشرف (المرحلة الأولى)', 
                color: '#f97316', 
                bg: 'rgba(249, 115, 22, 0.15)', 
                name: currentUser?.name || 'م. صلاح العربي' 
            };
        }
        if (isSectorB) {
            return { 
                label: 'مهندس مشرف (المرحلة الثانية)', 
                color: '#06b6d4', 
                bg: 'rgba(6, 182, 212, 0.15)', 
                name: currentUser?.name || 'م. عيسى الطاهر' 
            };
        }
        return { 
            label: userRole || 'جهاز الإشراف', 
            color: '#94a3b8', 
            bg: 'rgba(148, 163, 184, 0.15)', 
            name: currentUser?.name || 'مستخدم' 
        };
    };

    
    const [userAllowedSections, setUserAllowedSections] = useState(() => {
      if (typeof window === 'undefined') return null;
      try {
        const all = JSON.parse(localStorage.getItem('system_user_section_permissions') || '{}');
        const u = currentUser?.username;
        const lowU = (u || '').toLowerCase();
        const n = currentUser?.name;
        return all[u] || all[lowU] || (n ? all[n] : null) || null;
      } catch (e) {
        return null;
      }
    });

    useEffect(() => {
      const handlePermUpdate = () => {
        try {
          const all = JSON.parse(localStorage.getItem('system_user_section_permissions') || '{}');
          const u = currentUser?.username;
          const lowU = (u || '').toLowerCase();
          const n = currentUser?.name;
          setUserAllowedSections(all[u] || all[lowU] || (n ? all[n] : null) || null);
        } catch (e) {}
      };
      window.addEventListener('permissions-updated', handlePermUpdate);
      window.addEventListener('storage', handlePermUpdate);
      return () => {
        window.removeEventListener('permissions-updated', handlePermUpdate);
        window.removeEventListener('storage', handlePermUpdate);
      };
    }, [currentUser?.username, currentUser?.name]);

    const roleDisplay = getRoleDisplay();

    // Unified navigation for ALL engineers without differentiation:
    const mainItems = [
      { id: 'dashboard', label: 'لوحة القيادة الموحدة', icon: Home },
      { id: 'road-progress', label: 'متابعة إنجاز الطريق (360 كم)', icon: Milestone },
      { id: 'executive-progress', label: 'الموقف التنفيذي (360 كم)', icon: Award },
      { id: 'ai-agent', label: 'مساعد مدير المشروع', icon: Briefcase, badge: 'تنفيذي' }
    ];

    const canAccessGeneral = canAccessGeneralArchive(currentUser);
    const canAccessPeriodic = canAccessPeriodicReports(currentUser);

    const reportItems = [
      { id: 'create-report', label: 'إنشاء تقرير جديد', icon: FilePlus },
      { 
        id: 'periodic-reports', 
        label: 'التقارير الأسبوعية والشهرية', 
        icon: CalendarRange, 
        badge: 'تجميع آلي' 
      },
      { id: 'targeted-works', label: 'الأعمال المستهدفة', icon: Target },
      { id: 'upload-reports', label: 'رفع ومعالجة التقارير', icon: UploadCloud }
    ];

    if (canAccessGeneral) {
      reportItems.push({ 
        id: 'general-archive', 
        label: 'الأرشيف العام للمشروع', 
        icon: FolderArchive, 
        badge: 'شامل' 
      });
    }

    reportItems.push({ 
      id: 'reports-archive', 
      label: 'الأرشيف الخاص بي', 
      icon: FileText 
    });

    const resourceItems = [
      { id: 'fuel', label: 'إدارة الوقود', icon: Fuel },
      { id: 'equipment', label: 'سجل المعدات والآليات', icon: Truck }
    ];

    const commItems = [
      { id: 'messages', label: 'البريد والمراسلات', icon: Mail, badge: unreadMessages > 0 ? unreadMessages : undefined }
    ];
    if (isDev || isProjectManager || (Array.isArray(userAllowedSections) && userAllowedSections.includes('users'))) {
      commItems.push({ id: 'users', label: 'المستخدمين والصلاحيات', icon: Users });
    }

    const menuGroups = [
      {
        title: 'الرئيسية والمتابعة الإشرافية',
        items: mainItems
      },
      {
        title: 'التقارير والمستندات الميدانية',
        items: reportItems
      },
      {
        title: 'الموارد والتشغيل الميداني',
        items: resourceItems
      },
      {
        title: 'المراسلات والتواصل والنظام',
        items: commItems
      }
    ];

    const userAvatar = currentUser?.avatar || (typeof window !== 'undefined' && localStorage.getItem(`user_avatar_${currentUser?.username}`)) || '';

    return (
      <aside className={`custom-app-sidebar ${isMobileOpen ? 'mobile-open' : ''}`}>
        {/* Brand Header with Agency Emblem */}
        <div className="sidebar-app-brand" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div className="agency-logo-wrap">
              <img src={`${import.meta.env.BASE_URL}logo-agency.jpg`} alt="شعار جهاز تنفيذ مشروعات المواصلات" className="agency-sidebar-logo"/>
            </div>
            <div className="brand-app-title">
              <h2>جهاز الإشراف والمتابعة</h2>
              <h3>مشروع طريق أوباري - غات (360 كم)</h3>
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

        {/* Modern Dark Glassmorphic User Profile Card */}
        <div 
          className="sidebar-user-card" 
          onClick={onOpenProfile}
          title="انقر لتعديل الملف الشخصي ورفع الصورة"
          style={{ cursor: 'pointer', transition: 'all 0.2s ease', position: 'relative' }}
        >
          {userAvatar ? (
            <div className="sidebar-user-avatar" style={{ overflow: 'hidden', padding: 0, border: `2px solid ${roleDisplay.color}` }}>
              <img 
                src={userAvatar} 
                alt={roleDisplay.name} 
                style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
              />
            </div>
          ) : (
            <div className="sidebar-user-avatar" style={{ background: roleDisplay.color }}>
              {(roleDisplay.name || currentUser?.name || 'م')[0]}
            </div>
          )}

          <div className="sidebar-user-info" style={{ flex: 1, minWidth: 0 }}>
            <div className="sidebar-user-name" title={roleDisplay.name || currentUser?.name}>
              {roleDisplay.name || currentUser?.name}
            </div>
            <div className="sidebar-user-role">
              <span className="sidebar-role-indicator" style={{ background: roleDisplay.color }} />
              <span style={{ color: roleDisplay.color, fontWeight: 700 }}>{roleDisplay.label}</span>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2px', color: '#94a3b8' }}>
            <Camera size={14} style={{ color: roleDisplay.color }} />
            <span style={{ fontSize: '0.62rem', color: '#94a3b8' }}>الملف</span>
          </div>
        </div>

        {/* Categorized Nav Groups */}
        <nav className="sidebar-app-nav">
          {menuGroups.map((group, gIdx) => {
            const visibleItems = group.items.filter(item => {
              if (isDev) return true;
              
              // إذا كان للمستخدم صلاحيات مخصصة محددة من قسم الصلاحيات (UsersView)، يتم اعتمادها نصاً
              if (Array.isArray(userAllowedSections)) {
                return userAllowedSections.includes(item.id);
              }

              // الصلاحيات الافتراضية التلقائية في حال عدم التخصيص
              if (item.id === 'general-archive') {
                return canAccessGeneralArchive(currentUser);
              }
              if (item.id === 'users') {
                return isDev || isProjectManager;
              }
              return true;
            });
            if (visibleItems.length === 0) return null;

            return (
            <div key={gIdx} className="sidebar-nav-group">
              <div className="sidebar-group-header">
                <span>{group.title}</span>
              </div>

              <div className="sidebar-group-items">
                {visibleItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = activeTab === item.id;
                  const isAction = item.isAction;

                  return (
                    <button 
                      key={item.id} 
                      className={`nav-btn-link ${isActive ? 'active' : ''} ${isAction ? 'nav-action-link' : ''} ${item.id === 'ai-agent' ? 'nav-btn-ai-agent' : ''}`} 
                      data-section={item.id}
                      onClick={() => {
                        setActiveTab(item.id);
                        if (onCloseMobile) onCloseMobile();
                      }}
                      title={item.label}
                    >
                      <div className="nav-btn-inner">
                        <Icon size={18} className="nav-svg-icon" />
                        <span className="nav-link-title">{item.label}</span>
                      </div>

                      {item.badge !== undefined && (
                        <div className="nav-btn-extra">
                          <span className={`nav-badge-pill ${item.badge === 'تلقائي' ? 'auto-badge' : 'alert-badge'}`}>
                            {item.badge}
                          </span>
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          );
          })}
        </nav>

        {/* Footer Section with Logout Button */}
        <div className="sidebar-app-footer">
          <div className="agency-meta-card">
            <p className="agency-meta-title">جهاز تنفيذ مشروعات المواصلات</p>
            <p className="agency-meta-sub">منظومة الإشراف والمتابعة الميدانية</p>
          </div>

          <button className="nav-logout-btn" onClick={onLogout}>
            <LogOut size={18}/>
            <span>تسجيل الخروج</span>
          </button>
        </div>
      </aside>
    );
};

export default Sidebar;
