import React, { useState } from 'react';
import { Sidebar } from '../components/Sidebar';
import { Navbar } from '../components/Navbar';

import { DashboardView } from './DashboardView';
import { SectorDashboardView } from './SectorDashboardView';
import { UploadReportsView } from './UploadReportsView';
import { RoadProgressView } from './RoadProgressView';
import { DailyAnalysisView } from './DailyAnalysisView';
import { TomorrowPlanView } from './TomorrowPlanView';
import { DailyReportsView } from './DailyReportsView';
import { ReportsView } from './ReportsView';
import { EquipmentView } from './EquipmentView';
import { CrushersView } from './CrushersView';
import { SharshoorView } from './SharshoorView';
import { FuelView } from './FuelView';
import { AlertsView } from './AlertsView';
import { UsersView } from './UsersView';
import { ReportsArchiveView } from './ReportsArchiveView';
import { PeriodicReportsView } from './PeriodicReportsView';
import { CreateReportModal } from '../components/CreateReportModal';
import { OfficialPrintModal } from '../components/OfficialPrintModal';

/**
 * Determines if the user is a Sector Supervisor (A or B)
 * Sector supervisors get a restricted, sector-specific dashboard
 */
function isSectorSupervisor(user) {
    if (!user || !user.role) return false;
    return user.role.includes('مشرف القطاع');
}

/**
 * Determines if the user is an admin-level user (مدير المشروع or مدير القطاعات)
 */
function isAdminUser(user) {
    if (!user || !user.role) return false;
    return user.role.includes('مدير المشروع') || user.role.includes('مدير القطاعات');
}

export const MainSystem = ({ onLogout, currentUser }) => {
    // Sector supervisors default to their sector dashboard
    const defaultTab = isSectorSupervisor(currentUser) ? 'sector-dashboard' : 'dashboard';
    const [activeTab, setActiveTab] = useState(defaultTab);
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
    const [selectedReportForPrint, setSelectedReportForPrint] = useState(null);

    // If activeTab is 'create-report', open the modal and stay on appropriate tab
    const handleTabChange = (tabId) => {
      setIsMobileSidebarOpen(false);
      if (tabId === 'create-report') {
        setIsCreateModalOpen(true);
      } else {
        setActiveTab(tabId);
      }
    };

    const tabTitles = {
        'dashboard': 'لوحة التحكم والمتابعة التنفيذية الشاملة',
        'sector-dashboard': `لوحة العمليات الميدانية - ${currentUser?.role || 'القطاع'}`,
        'periodic-reports': 'مركز التقارير الدورية (الشهرية والسنوية التلقائية)',
        'reports-archive': 'أرشيف تقارير المشروع ونظام الطباعة',
        'create-report': 'إنشاء تقرير ميداني جديد',
        'road-progress': 'متابعة نسب إنجاز مشروع طريق أوباري - غات',
        'upload-reports': 'رفع ومعالجة التقارير الميدانية',
        'daily-analysis': 'تحليل اليومية والأداء التشغيلي',
        'tomorrow-plan': 'إدارة واعتماد خطة الغد ومقارنة التنفيذ',
        'daily-reports': 'أرشيف واعتماد التقارير الميدانية',
        'analytics': 'مركز التقارير والتحليلات المعتمدة',
        'crushers': 'الكسارات ومعدلات الإنتاج',
        'sharshoor': 'أرصدة ومخزون الشرشور والركام',
        'fuel': 'إدارة الوقود والصهاريج',
        'equipment': 'إدارة وسجل المعدات والآليات',
        'users': 'مركز المستخدمين والصلاحيات',
        'alerts': 'مركز التنبيهات والإشعارات'
    };

    return (<div className="custom-system-layout">
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
      />

      {/* Main Container */}
      <div className="custom-system-main">
        <Navbar 
          currentTabName={tabTitles[activeTab] || 'لوحة التحكم'} 
          onBellClick={() => setActiveTab('alerts')} 
          onProfileClick={() => isAdminUser(currentUser) ? setActiveTab('users') : null}
          currentUser={currentUser}
          onToggleMobileSidebar={() => setIsMobileSidebarOpen(prev => !prev)}
        />

        <main className="custom-page-container">
          {/* Admin Dashboard (مدير المشروع + مدير القطاعات) */}
          {activeTab === 'dashboard' && <DashboardView onNavigateTab={handleTabChange}/>}

          {/* Sector-Specific Dashboard (مشرف القطاع A / B) */}
          {activeTab === 'sector-dashboard' && <SectorDashboardView currentUser={currentUser} />}

          {activeTab === 'periodic-reports' && <PeriodicReportsView currentUser={currentUser} />}
          {activeTab === 'reports-archive' && <ReportsArchiveView currentUser={currentUser} onNavigateTab={handleTabChange} />}
          {activeTab === 'road-progress' && <RoadProgressView onNavigateTab={handleTabChange}/>}
          {activeTab === 'upload-reports' && <UploadReportsView onNavigateTab={handleTabChange} currentUser={currentUser}/>}
          {activeTab === 'daily-analysis' && <DailyAnalysisView onNavigateTab={handleTabChange}/>}
          {activeTab === 'tomorrow-plan' && <TomorrowPlanView />}
          {activeTab === 'daily-reports' && <DailyReportsView currentUser={currentUser} onNavigateTab={handleTabChange} />}
          {activeTab === 'analytics' && <ReportsView />}
          {activeTab === 'crushers' && <CrushersView />}
          {activeTab === 'sharshoor' && <SharshoorView />}
          {activeTab === 'fuel' && <FuelView />}
          {activeTab === 'equipment' && <EquipmentView />}
          {activeTab === 'users' && <UsersView currentUser={currentUser} />}
          {activeTab === 'alerts' && <AlertsView />}
        </main>
      </div>

      {/* Standalone Create Report Modal if triggered from sidebar */}
      {isCreateModalOpen && (
        <CreateReportModal
          isOpen={isCreateModalOpen}
          currentUser={currentUser}
          onClose={() => setIsCreateModalOpen(false)}
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
    </div>);
};

export default MainSystem;
