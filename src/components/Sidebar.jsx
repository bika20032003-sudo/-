import React, { useState, useEffect } from 'react';
import { 
  Home, Milestone, UploadCloud, FileText, 
  CalendarRange, Truck, 
  Fuel, Bell, Users, LogOut, ShieldCheck, Plus, MapPin,
  Camera, Mail, FilePlus, Target, Award
} from 'lucide-react';
import { fastFetch } from '../utils/apiCache.js';

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

    const roleDisplay = getRoleDisplay();

    // Categorized navigation groups tailored by role
    let menuGroups = [];

    if (isHeadOfSupervision) {
        // رئيس جهاز الإشراف (م. عبدالسلام ابريكاو)
        menuGroups = [
            {
                title: 'الرئيسية والمتابعة الإشرافية',
                items: [
                    { id: 'dashboard', label: 'لوحة القيادة الموحدة', icon: Home },
                    { id: 'road-progress', label: 'متابعة إنجاز الطريق (360 كم)', icon: Milestone },
                    { id: 'executive-progress', label: 'الموقف التنفيذي (360 كم)', icon: Award },
                ]
            },
            {
                title: 'التقارير الميدانية والاعتمادات',
                items: [
                    { id: 'create-report', label: 'إنشاء تقرير جديد', icon: FilePlus },
                    { id: 'targeted-works', label: 'الأعمال المستهدفة', icon: Target },
                    { id: 'reports-archive', label: 'أرشيف التقارير والاعتماد', icon: FileText },
                    { id: 'upload-reports', label: 'رفع ومعالجة التقارير', icon: UploadCloud },
                ]
            },
            {
                title: 'الموارد والتشغيل',
                items: [
                    { id: 'fuel', label: 'إدارة الوقود', icon: Fuel },
                    { id: 'equipment', label: 'سجل المعدات والآليات', icon: Truck },
                ]
            },
            {
                title: 'المراسلات والنظام',
                items: [
                    { id: 'messages', label: 'البريد والمراسلات', icon: Mail, badge: unreadMessages > 0 ? unreadMessages : undefined }
                ]
            }
        ];
    } else if (isQualityOfficer) {
        // مسؤول الجودة (م. صالح حماد)
        menuGroups = [
            {
                title: 'الرئيسية والمتابعة',
                items: [
                    { id: 'dashboard', label: 'لوحة القيادة الموحدة', icon: Home },
                    { id: 'road-progress', label: 'متابعة رصف الطبقات', icon: Milestone },
                    { id: 'executive-progress', label: 'الموقف التنفيذي (360 كم)', icon: Award },
                ]
            },
            {
                title: 'الفحوصات والتقارير الفنية',
                items: [
                    { id: 'create-report', label: 'تسجيل فحص / تقرير جديد', icon: FilePlus },
                    { id: 'targeted-works', label: 'الأعمال المستهدفة', icon: Target },
                    { id: 'upload-reports', label: 'رفع نتائج ومستندات الفحص', icon: UploadCloud },
                    { id: 'reports-archive', label: 'أرشيف التقارير والطباعة', icon: FileText },
                    { id: 'analytics', label: 'مركز التحليلات والإحصائيات', icon: FileText },
                ]
            },
            {
                title: 'المراسلات والنظام',
                items: [
                    { id: 'messages', label: 'البريد والمراسلات', icon: Mail, badge: unreadMessages > 0 ? unreadMessages : undefined }
                ]
            }
        ];
    } else if (isSectorSupervisor) {
        // مهندسو الإشراف (م. صلاح العربي - المرحلة الأولى أو م. عيسى الطاهر - المرحلة الثانية)
        const sectorLabel = isSectorA ? 'المرحلة الأولى' : 'المرحلة الثانية';
        menuGroups = [
            {
                title: 'الميدان والمتابعة',
                items: [
                    { id: 'sector-dashboard', label: `لوحة عمليات (${sectorLabel})`, icon: MapPin },
                    { id: 'road-progress', label: 'متابعة مسار الطريق', icon: Milestone },
                    { id: 'executive-progress', label: 'الموقف التنفيذي (360 كم)', icon: Award },
                ]
            },
            {
                title: 'التقارير الميدانية',
                items: [
                    { id: 'create-report', label: 'إنشاء تقرير ميداني جديد', icon: FilePlus },
                    { id: 'targeted-works', label: 'الأعمال المستهدفة', icon: Target },
                    { id: 'upload-reports', label: 'رفع ومعالجة التقارير', icon: UploadCloud },
                    { id: 'reports-archive', label: 'أرشيف التقارير والطباعة', icon: FileText }
                ]
            },
            {
                title: 'الموارد والتشغيل الميداني',
                items: [
                    { id: 'fuel', label: 'إدارة الوقود', icon: Fuel },
                    { id: 'equipment', label: 'سجل المعدات والآليات', icon: Truck }
                ]
            },
            {
                title: 'المراسلات والنظام',
                items: [
                    { id: 'messages', label: 'البريد والمراسلات', icon: Mail, badge: unreadMessages > 0 ? unreadMessages : undefined }
                ]
            }
        ];
    } else if (isProjectManager) {
        // مدير المشروع (م. عبدالرحمن الأنصاري)
        // يظهر فيه: داش بورد الخاصة بإنجاز المرحلتين، قسم البريد، قسم أرشيف التقارير، عداد الوقود، عداد إدارة ومتابعة المهام، لوحة التقارير، والأعمال المستهدفة
        menuGroups = [
            {
                title: 'القيادة والمتابعة الإشرافية',
                items: [
                    { id: 'dashboard', label: 'لوحة القيادة الموحدة', icon: Home },
                    { id: 'road-progress', label: 'متابعة إنجاز الطريق (360 كم)', icon: Milestone },
                    { id: 'executive-progress', label: 'الموقف التنفيذي (360 كم)', icon: Award },
                ]
            },
            {
                title: 'الخطط والتقارير الميدانية',
                items: [
                    { id: 'targeted-works', label: 'الأعمال المستهدفة', icon: Target },
                    { id: 'create-report', label: 'إنشاء تقرير جديد', icon: FilePlus },
                    { id: 'reports-archive', label: 'أرشيف التقارير والطباعة', icon: FileText }
                ]
            },
            {
                title: 'الموارد والتشغيل الميداني',
                items: [
                    { id: 'fuel', label: 'إدارة الوقود', icon: Fuel },
                    { id: 'equipment', label: 'سجل المعدات والآليات', icon: Truck }
                ]
            },
            {
                title: 'المراسلات والتواصل',
                items: [
                    { id: 'messages', label: 'البريد والمراسلات', icon: Mail, badge: unreadMessages > 0 ? unreadMessages : undefined }
                ]
            }
        ];
    } else {
        // م. حساب التطوير (Super Admin) - صلاحيات وإشراف برمجي ونظام شامل
        menuGroups = [
            {
                title: 'الرئيسية والقيادة (شامل)',
                items: [
                    { id: 'dashboard', label: 'لوحة القيادة الموحدة', icon: Home },
                    { id: 'road-progress', label: 'متابعة إنجاز الطريق (360 كم)', icon: Milestone },
                    { id: 'executive-progress', label: 'الموقف التنفيذي (360 كم)', icon: Award },
                ]
            },
            {
                title: 'التقارير والمستندات',
                items: [
                    { id: 'create-report', label: 'إنشاء تقرير جديد', icon: FilePlus },
                    { id: 'targeted-works', label: 'الأعمال المستهدفة', icon: Target },
                    { id: 'upload-reports', label: 'رفع ومعالجة التقارير', icon: UploadCloud },
                    { id: 'reports-archive', label: 'أرشيف التقارير والطباعة', icon: FileText }
                ]
            },
            {
                title: 'الموارد والتشغيل الميداني',
                items: [
                    { id: 'fuel', label: 'إدارة الوقود', icon: Fuel },
                    { id: 'equipment', label: 'سجل المعدات والآليات', icon: Truck }
                ]
            },
            {
                title: 'الإدارة والتحليلات والبريد',
                items: [
                    { id: 'messages', label: 'البريد والمراسلات', icon: Mail, badge: unreadMessages > 0 ? unreadMessages : undefined },
                    { id: 'users', label: 'المستخدمين والصلاحيات', icon: Users }
                ]
            }
        ];
    }

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
          {menuGroups.map((group, gIdx) => (
            <div key={gIdx} className="sidebar-nav-group">
              <div className="sidebar-group-header">
                <span>{group.title}</span>
              </div>

              <div className="sidebar-group-items">
                {group.items.map((item) => {
                  const Icon = item.icon;
                  const isActive = activeTab === item.id;
                  const isAction = item.isAction;

                  return (
                    <button 
                      key={item.id} 
                      className={`nav-btn-link ${isActive ? 'active' : ''} ${isAction ? 'nav-action-link' : ''}`} 
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
          ))}
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
