import React, { useState } from 'react';
import { Sidebar } from '../components/Sidebar';
import { Navbar } from '../components/Navbar';

import { DashboardView } from './DashboardView';
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
import { CreateReportModal } from '../components/CreateReportModal';
import { OfficialPrintModal } from '../components/OfficialPrintModal';

export const MainSystem = ({ onLogout, currentUser }) => {
    const [activeTab, setActiveTab] = useState('dashboard');
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
          onProfileClick={() => setActiveTab('users')}
          currentUser={currentUser}
          onToggleMobileSidebar={() => setIsMobileSidebarOpen(prev => !prev)}
        />

        <main className="custom-page-container">
          {activeTab === 'dashboard' && <DashboardView onNavigateTab={handleTabChange}/>}
          {activeTab === 'reports-archive' && <ReportsArchiveView currentUser={currentUser} />}
          {activeTab === 'road-progress' && <RoadProgressView onNavigateTab={handleTabChange}/>}
          {activeTab === 'upload-reports' && <UploadReportsView onNavigateTab={handleTabChange} currentUser={currentUser}/>}
          {activeTab === 'daily-analysis' && <DailyAnalysisView onNavigateTab={handleTabChange}/>}
          {activeTab === 'tomorrow-plan' && <TomorrowPlanView />}
          {activeTab === 'daily-reports' && <DailyReportsView currentUser={currentUser} />}
          {activeTab === 'analytics' && <ReportsView />}
          {activeTab === 'crushers' && <CrushersView />}
          {activeTab === 'sharshoor' && <SharshoorView />}
          {activeTab === 'fuel' && <FuelView />}
          {activeTab === 'equipment' && <EquipmentView />}
          {activeTab === 'users' && <UsersView />}
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
