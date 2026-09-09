import React, { useState } from 'react';
import { Sidebar } from '../components/Sidebar';
import { Navbar } from '../components/Navbar';
import { DashboardView } from './DashboardView';
import { UploadReportsView } from './UploadReportsView';
import { RoadProgressView } from './RoadProgressView';
import { SectorsView } from './SectorsView';
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

interface MainSystemProps {
  onLogout: () => void;
}

export const MainSystem: React.FC<MainSystemProps> = ({ onLogout }) => {
  const [activeTab, setActiveTab] = useState('dashboard');

  const tabTitles: Record<string, string> = {
    'dashboard': 'لوحة التحكم والمتابعة التنفيذية',
    'road-progress': 'متابعة نسب إنجاز مشروع طريق أوباري - غات',
    'sectors': 'متابعة قطاعات المشروع والشركات المنفذة',
    'upload-reports': 'رفع ومعالجة التقارير الميدانية',
    'daily-analysis': 'تحليل اليومية والأداء التشغيلي',
    'tomorrow-plan': 'إدارة واعتماد خطة الغد ومقارنة التنفيذ',
    'daily-reports': 'أرشيف وسجل التقارير اليومية',
    'analytics': 'مركز التقارير والتحليلات المعتمدة',
    'crushers': 'الكسارات ومعدلات الإنتاج',
    'sharshoor': 'أرصدة ومخزون الشرشور والركام',
    'fuel': 'إدارة الوقود والصهاريج',
    'equipment': 'إدارة وسجل المعدات والآليات',
    'users': 'مركز المستخدمين وإدارة الحسابات',
    'alerts': 'مركز التنبيهات والإشعارات'
  };

  return (
    <div className="custom-system-layout">
      {/* Sidebar Navigation on Right (RTL) */}
      <Sidebar 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        onLogout={onLogout} 
      />

      {/* Main Container */}
      <div className="custom-system-main">
        <Navbar 
          currentTabName={tabTitles[activeTab] || 'لوحة التحكم الرئيسية'} 
          onBellClick={() => setActiveTab('alerts')}
          onProfileClick={() => setActiveTab('users')}
        />

        <main className="custom-page-container">
          {activeTab === 'dashboard' && <DashboardView onNavigateTab={setActiveTab} />}
          {activeTab === 'road-progress' && <RoadProgressView onNavigateTab={setActiveTab} />}
          {activeTab === 'sectors' && <SectorsView />}
          {activeTab === 'upload-reports' && <UploadReportsView onNavigateTab={setActiveTab} />}
          {activeTab === 'daily-analysis' && <DailyAnalysisView onNavigateTab={setActiveTab} />}
          {activeTab === 'tomorrow-plan' && <TomorrowPlanView />}
          {activeTab === 'daily-reports' && <DailyReportsView />}
          {activeTab === 'analytics' && <ReportsView />}
          {activeTab === 'crushers' && <CrushersView />}
          {activeTab === 'sharshoor' && <SharshoorView />}
          {activeTab === 'fuel' && <FuelView />}
          {activeTab === 'equipment' && <EquipmentView />}
          {activeTab === 'users' && <UsersView />}
          {activeTab === 'alerts' && <AlertsView />}
        </main>
      </div>
    </div>
  );
};
