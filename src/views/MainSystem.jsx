import React, { useState, Suspense, lazy } from 'react';
import { Sidebar } from '../components/Sidebar';
import { Navbar } from '../components/Navbar';

// Lazy-loaded views for instant initial page speed and reduced bundle size
const DashboardView = lazy(() => import('./DashboardView').then(m => ({ default: m.DashboardView })));
const UploadReportsView = lazy(() => import('./UploadReportsView').then(m => ({ default: m.UploadReportsView })));
const RoadProgressView = lazy(() => import('./RoadProgressView').then(m => ({ default: m.RoadProgressView })));
const DailyAnalysisView = lazy(() => import('./DailyAnalysisView').then(m => ({ default: m.DailyAnalysisView })));
const TomorrowPlanView = lazy(() => import('./TomorrowPlanView').then(m => ({ default: m.TomorrowPlanView })));
const DailyReportsView = lazy(() => import('./DailyReportsView').then(m => ({ default: m.DailyReportsView })));
const ReportsView = lazy(() => import('./ReportsView').then(m => ({ default: m.ReportsView })));
const EquipmentView = lazy(() => import('./EquipmentView').then(m => ({ default: m.EquipmentView })));
const CrushersView = lazy(() => import('./CrushersView').then(m => ({ default: m.CrushersView })));
const SharshoorView = lazy(() => import('./SharshoorView').then(m => ({ default: m.SharshoorView })));
const FuelView = lazy(() => import('./FuelView').then(m => ({ default: m.FuelView })));
const AlertsView = lazy(() => import('./AlertsView').then(m => ({ default: m.AlertsView })));
const UsersView = lazy(() => import('./UsersView').then(m => ({ default: m.UsersView })));
const ReportsArchiveView = lazy(() => import('./ReportsArchiveView').then(m => ({ default: m.ReportsArchiveView })));
import { CreateReportModal } from '../components/CreateReportModal';
import { OfficialPrintModal } from '../components/OfficialPrintModal';

const ViewLoadingFallback = () => (
  <div style={{
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '350px',
    gap: '0.85rem',
    color: '#64748b'
  }}>
    <div style={{
      width: '36px',
      height: '36px',
      border: '3px solid #e2e8f0',
      borderTopColor: '#2563eb',
      borderRadius: '50%',
      animation: 'spin 0.6s linear infinite'
    }} />
    <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>جاري تحميل الشاشة فورياً...</span>
  </div>
);

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
          <Suspense fallback={<ViewLoadingFallback />}>
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
          </Suspense>
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
