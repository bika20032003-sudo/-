import React, { useState, useEffect } from 'react';
import { Sidebar } from '../components/Sidebar';
import { Navbar } from '../components/Navbar';

import { DashboardView } from './DashboardView';
import { SectorDashboardView } from './SectorDashboardView';
import { UploadReportsView } from './UploadReportsView';
import { RoadProgressView } from './RoadProgressView';
import { ReportsView } from './ReportsView';
import { EquipmentView } from './EquipmentView';
import { FuelView } from './FuelView';
import { UsersView } from './UsersView';
import { ReportsArchiveView } from './ReportsArchiveView';
import { CreateReportModal } from '../components/CreateReportModal';
import { OfficialPrintModal } from '../components/OfficialPrintModal';
import { UserProfileModal } from '../components/UserProfileModal';
import { DataBackupModal } from '../components/DataBackupModal';
import '../utils/secureDatabase.js';
import { CreateReportView } from './CreateReportView';
import { CorrespondenceView } from './CorrespondenceView';
import { TargetedWorksView } from './TargetedWorksView';
import { ExecutiveProgressView } from './ExecutiveProgressView';
import { AIAgentView } from './AIAgentView';
import { AIAgentWidget } from '../components/AIAgentWidget';

/**
 * Determine default dashboard based on supervision role
 */
function getDefaultTabForUser(user) {
    if (!user) return 'dashboard';
    const role = user.role || '';
    const username = user.username || '';

    // Sector supervisors default to their dedicated sector dashboard
    const isSectorSupervisor = (role.includes('مشرف') || role.includes('القطاع') || username === 'salah_alarabi' || username === 'issa_altahir') && 
                               !role.includes('مدير المشروع') && 
                               !role.includes('رئيس جهاز الإشراف') && 
                               !role.includes('الجودة');

    if (isSectorSupervisor) {
        return 'sector-dashboard';
    }
    return 'dashboard';
}

export const MainSystem = ({ onLogout, currentUser, onUpdateUser }) => {
    const defaultTab = getDefaultTabForUser(currentUser);
    const [activeTab, setActiveTab] = useState(defaultTab);

    useEffect(() => {
      const handleResetTab = () => {
        setActiveTab('dashboard');
      };
      window.addEventListener('reset-to-dashboard', handleResetTab);
      return () => window.removeEventListener('reset-to-dashboard', handleResetTab);
    }, []);
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
    const [isBackupModalOpen, setIsBackupModalOpen] = useState(false);
    const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
    const [selectedReportForPrint, setSelectedReportForPrint] = useState(null);

    const handleTabChange = (tabId) => {
      setIsMobileSidebarOpen(false);
      const isDev = (currentUser?.role || '').includes('تطوير') || currentUser?.username === 'admin' || currentUser?.username === 'dev';
      if (!isDev && typeof window !== 'undefined') {
        try {
          const all = JSON.parse(localStorage.getItem('system_user_section_permissions') || '{}');
          const u = currentUser?.username;
          const lowU = (u || '').toLowerCase();
          const n = currentUser?.name;
          const userPerms = all[u] || all[lowU] || (n ? all[n] : null);
          if (Array.isArray(userPerms) && !userPerms.includes(tabId)) {
            console.warn(`User ${currentUser?.username} is not permitted to access section: ${tabId}`);
            return;
          }
        } catch (e) {}
      }
      setActiveTab(tabId);
    };

    // Auto redirect if currently loaded tab is not allowed
    useEffect(() => {
      const checkAndEnforcePermissions = () => {
        const isDev = (currentUser?.role || '').includes('تطوير') || currentUser?.username === 'admin' || currentUser?.username === 'dev';
        if (!isDev && typeof window !== 'undefined') {
          try {
            const all = JSON.parse(localStorage.getItem('system_user_section_permissions') || '{}');
            const u = currentUser?.username;
            const lowU = (u || '').toLowerCase();
            const n = currentUser?.name;
            const userPerms = all[u] || all[lowU] || (n ? all[n] : null);
            if (Array.isArray(userPerms) && !userPerms.includes(activeTab)) {
              setActiveTab(userPerms[0] || 'dashboard');
            }
          } catch (e) {}
        }
      };
      checkAndEnforcePermissions();
      window.addEventListener('permissions-updated', checkAndEnforcePermissions);
      return () => window.removeEventListener('permissions-updated', checkAndEnforcePermissions);
    }, [currentUser, activeTab]);

    const tabTitles = {
        'dashboard': 'لوحة القيادة الموحدة - جهاز الإشراف والمتابعة',
        'sector-dashboard': `لوحة العمليات الميدانية - ${currentUser?.title || currentUser?.role || 'القطاع'}`,
        'reports-archive': 'أرشيف تقارير المشروع ونظام الاعتماد والطباعة',
        'create-report': 'إنشاء وإدخال تقرير ميداني جديد',
        'targeted-works': 'إدارة ومتابعة الأعمال المستهدفة',
        'messages': 'البريد والمراسلات الرسمية وإحالة التقارير',
        'road-progress': 'متابعة نسب إنجاز مشروع طريق أوباري - غات (360 كم)',
        'executive-progress': 'الموقف التنفيذي (360 كم) - المالي والفني المعتمد',
        'ai-agent': 'مساعد جهاز الإشراف (AI Supervision Assistant)',
        'upload-reports': 'رفع ومعالجة ملفات التقارير الميدانية',
        'analytics': 'مركز التحليلات والإحصائيات - إنتاج الكسارات الموثقة',
        'fuel': 'إدارة الوقود',
        'equipment': 'إدارة وسجل المعدات والآليات الميدانية',
        'users': 'مركز المستخدمين والصلاحيات الرسمية للجهاز'
    };

    return (
      <div className="custom-system-layout">
        {/* Mobile Backdrop */}
        {isMobileSidebarOpen && (
          <div 
            className="sidebar-mobile-backdrop"
            onClick={() => setIsMobileSidebarOpen(false)}
          />
        )}

        {/* Sidebar Navigation on Right (RTL) */}
        <Sidebar 
          activeTab={activeTab} 
          setActiveTab={handleTabChange} 
          onLogout={onLogout}
          currentUser={currentUser}
          isMobileOpen={isMobileSidebarOpen}
          onCloseMobile={() => setIsMobileSidebarOpen(false)}
          onOpenProfile={() => setIsProfileModalOpen(true)}
        />

        {/* Main Container */}
        <div className="custom-system-main">
          <Navbar 
            currentTabName={tabTitles[activeTab] || 'لوحة التحكم'} 
            onMailClick={() => setActiveTab('messages')}
            onProfileClick={() => setIsProfileModalOpen(true)}
            onBackupClick={() => setIsBackupModalOpen(true)}
            currentUser={currentUser}
            onToggleMobileSidebar={() => setIsMobileSidebarOpen(prev => !prev)}
          />

          <main className="custom-page-container">
            {/* 1. General Dashboard */}
            {activeTab === 'dashboard' && <DashboardView onNavigateTab={handleTabChange} currentUser={currentUser} />}

            {/* 2. Sector-Specific Dashboard (مهندس مشرف: م. صلاح العربي أو م. عيسى الطاهر) */}
            {activeTab === 'sector-dashboard' && (
              <SectorDashboardView currentUser={currentUser} />
            )}

            {/* 3. Dedicated Create Report Section */}
            {activeTab === 'create-report' && (
              <CreateReportView 
                currentUser={currentUser} 
                onNavigateTab={handleTabChange}
                onPrintReport={(rep) => setSelectedReportForPrint(rep)}
              />
            )}

            {/* 4. Dedicated Correspondence / Mail Section */}
            {activeTab === 'messages' && (
              <CorrespondenceView 
                currentUser={currentUser} 
                onNavigateTab={handleTabChange}
                onPrintReport={(rep) => setSelectedReportForPrint(rep)}
              />
            )}

            {/* 5. Dedicated Targeted Works Section (الأعمال المستهدفة) */}
            {activeTab === 'targeted-works' && (
              <TargetedWorksView 
                currentUser={currentUser} 
                onNavigateTab={handleTabChange}
              />
            )}

            {activeTab === 'reports-archive' && <ReportsArchiveView currentUser={currentUser} onNavigateTab={handleTabChange} />}
            {activeTab === 'road-progress' && <RoadProgressView onNavigateTab={handleTabChange} currentUser={currentUser} />}
            {activeTab === 'executive-progress' && (
              <ExecutiveProgressView 
                currentUser={currentUser} 
                onNavigateTab={handleTabChange} 
                onPrintReport={(rep) => setSelectedReportForPrint(rep)} 
              />
            )}
            {activeTab === 'upload-reports' && <UploadReportsView onNavigateTab={handleTabChange} currentUser={currentUser}/>}
            {activeTab === 'analytics' && <ReportsView />}
            {activeTab === 'fuel' && <FuelView currentUser={currentUser} onNavigateTab={handleTabChange} />}
            {activeTab === 'equipment' && <EquipmentView />}
            {activeTab === 'users' && <UsersView currentUser={currentUser} />}
            {activeTab === 'ai-agent' && <AIAgentView currentUser={currentUser} onNavigateTab={handleTabChange} />}
          </main>
        </div>

        {/* Standalone Create Report Modal if triggered from sidebar */}
        {isCreateModalOpen && (
          <CreateReportModal
            isOpen={isCreateModalOpen}
            currentUser={currentUser}
            onClose={() => setIsCreateModalOpen(false)}
            onNavigateTab={handleTabChange}
            onReportCreated={(rep) => {
              console.log('Report created successfully:', rep);
            }}
            onPrintReport={(newRep) => {
              setSelectedReportForPrint(newRep);
            }}
          />
        )}

        {/* Official Print Modal */}
        {selectedReportForPrint && (
          <OfficialPrintModal
            report={selectedReportForPrint}
            onClose={() => setSelectedReportForPrint(null)}
          />
        )}

        {/* Global AI Agent Floating Assistant */}
        <AIAgentWidget currentUser={currentUser} onNavigateTab={handleTabChange} />

        {/* User Profile Modal with Photo Upload & Credentials */}
        {isProfileModalOpen && (
          <UserProfileModal
            isOpen={isProfileModalOpen}
            currentUser={currentUser}
            onClose={() => setIsProfileModalOpen(false)}
            onUpdateUser={onUpdateUser}
          />
        )}

        {/* Database & Data Backup Management Modal */}
        {isBackupModalOpen && (
          <DataBackupModal
            isOpen={isBackupModalOpen}
            currentUser={currentUser}
            onClose={() => setIsBackupModalOpen(false)}
          />
        )}
      </div>
    );
};

export default MainSystem;
