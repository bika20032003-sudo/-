import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import Hero3D from './components/Hero3D';
import ExecutiveDashboard from './components/ExecutiveDashboard';
import FeaturedProjects from './components/FeaturedProjects';
import InteractiveProjectMap from './components/InteractiveProjectMap';
import SectorsRoadmap from './components/SectorsRoadmap';
import ContractorsFleet from './components/ContractorsFleet';
import Footer from './components/Footer';
import GoogleAuthModal from './components/GoogleAuthModal';
import WeatherExchangeWidgets from './components/WeatherExchangeWidgets';
import UbariCityShowcase from './components/UbariCityShowcase';
import DocumentReportsHub from './components/DocumentReportsHub';
import ProjectExecutiveAnalytics from './components/ProjectExecutiveAnalytics';

import { 
  fetchProjectSummary, 
  fetchSectors, 
  fetchContractors,
  initialSectors,
  initialSummary,
  initialContractors
} from './services/api';

const DEFAULT_DOCUMENTS = [
  {
    id: 'DOC-2026-08',
    title: 'التقرير التنفيذي الشهري الشامل - أغسطس 2026',
    titleEn: 'Monthly Comprehensive Executive Report – August 2026',
    category: 'تقارير الإنجاز',
    categoryEn: 'Progress Reports',
    date: '2026-08-10',
    size: '4.8 MB',
    author: 'إدارة المشروعات بالمنطقة الجنوبية',
    authorEn: 'Southern Region Projects Administration'
  },
  {
    id: 'LAB-2026-11',
    title: 'نتائج الفحص المعملي لعينات الأسفلت والدمك بالقطاع 01',
    titleEn: 'Laboratory Asphalt & Compaction Test Results – Sector 01',
    category: 'ضبط الجودة المعملي',
    categoryEn: 'Lab Quality Control',
    date: '2026-08-08',
    size: '2.1 MB',
    author: 'مختبرات الهندسة الجيوتقنية المعتمدة',
    authorEn: 'Certified Geotechnical Engineering Labs'
  },
  {
    id: 'ENV-2026-04',
    title: 'دراسة السلامة المرورية والإنارة بالطاقة الشمسية',
    titleEn: 'Traffic Safety & Solar Lighting System Evaluation',
    category: 'الدراسات البيئية',
    categoryEn: 'Environmental Studies',
    date: '2026-07-28',
    size: '6.4 MB',
    author: 'قسم الاستشارات والسلامة الهندسية',
    authorEn: 'Engineering Safety & Consulting Dept.'
  },
  {
    id: 'FIN-2026-Q3',
    title: 'كشف المستخلصات المالية المعتمدة للشركات المنفذة',
    titleEn: 'Approved Financial Claims Ledger for Executing Contractors',
    category: 'المالية والمستخلصات',
    categoryEn: 'Financial Claims',
    date: '2026-08-01',
    size: '1.9 MB',
    author: 'الإدارة المالية - ديوان الجهاز',
    authorEn: 'Financial Administration – Authority HQ'
  }
];

const DEFAULT_USERS = [
  {
    name: 'يحي الحافظ',
    email: 'yahi.alhafiz@transport.gov.ly',
    role: 'مدير عام مشروعات الجنوب',
    status: 'نشط',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'
  },
  {
    name: 'م. عبد السلام الفزاني',
    email: 'a.fazzani@transport.gov.ly',
    role: 'مهندس إشراف موقعي',
    status: 'نشط',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150'
  },
  {
    name: 'د. سالم التواتي',
    email: 's.touati@transport.gov.ly',
    role: 'مدير ضبط الجودة والمختبرات',
    status: 'نشط',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150'
  },
  {
    name: 'أ. فاطمة الورفلي',
    email: 'f.werfalli@finance.gov.ly',
    role: 'مدقق مالي ومستخلصات',
    status: 'نشط',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150'
  }
];

export default function App() {
  const [activeTab, setActiveTab] = useState('hero');

  // ── User Google Authentication State ───────────────────────
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('google-portal-user');
    return saved ? JSON.parse(saved) : null;
  });
  const [isGoogleAuthModalOpen, setIsGoogleAuthModalOpen] = useState(false);

  const handleLoginSuccess = (userData) => {
    setUser(userData);
    localStorage.setItem('google-portal-user', JSON.stringify(userData));
    setActiveTab('dashboard');
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('google-portal-user');
    setActiveTab('hero');
  };
  // ────────────────────────────────────────────────────────────

  // ── Theme: day / night ──────────────────────────────────────
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem('portal-theme') || 'light';
  });

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('portal-theme', theme);
  }, [theme]);

  const toggleTheme = () => setTheme(t => t === 'dark' ? 'light' : 'dark');
  // ────────────────────────────────────────────────────────────

  // ── Language: ar / en ───────────────────────────────────────
  const [lang, setLang] = useState(() => {
    return localStorage.getItem('portal-lang') || 'ar';
  });

  useEffect(() => {
    document.documentElement.setAttribute('lang', lang);
    document.documentElement.setAttribute('dir', lang === 'ar' ? 'rtl' : 'ltr');
    localStorage.setItem('portal-lang', lang);
  }, [lang]);

  const toggleLang = () => setLang(l => l === 'ar' ? 'en' : 'ar');
  // ────────────────────────────────────────────────────────────
  
  // Data States with persistent LocalStorage
  const [summaryData, setSummaryData] = useState(initialSummary);
  
  const [sectors, setSectors] = useState(() => {
    try {
      const saved = localStorage.getItem('portal-sectors-data');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {}
    return initialSectors;
  });

  const [contractors, setContractors] = useState(() => {
    try {
      const saved = localStorage.getItem('portal-contractors-data');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {}
    return initialContractors;
  });

  const [documents, setDocuments] = useState(() => {
    try {
      const saved = localStorage.getItem('portal-documents-data');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {}
    return DEFAULT_DOCUMENTS;
  });

  const [authorizedUsers, setAuthorizedUsers] = useState(() => {
    try {
      const saved = localStorage.getItem('portal-authorized-users');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {}
    return DEFAULT_USERS;
  });

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const loadAllData = async () => {
      try {
        const [sum, sec, cont] = await Promise.all([
          fetchProjectSummary(),
          fetchSectors(),
          fetchContractors()
        ]);
        if (sum) setSummaryData(sum);
        if (sec && sec.length > 0) setSectors(sec);
        if (cont && cont.length > 0) setContractors(cont);
      } catch (e) {
        console.error('Error loading background data:', e);
      }
    };

    loadAllData();
  }, []);

  return (
    <div className={`min-h-screen font-arabic selection:bg-amber-500 selection:text-black transition-colors duration-500 ${
      theme === 'light' 
        ? 'bg-[#F8FAFC] text-slate-900' 
        : 'bg-[#06080E] text-slate-100'
    }`}>
      
      {/* Header (Rendered on Public Portal mode) */}
      {activeTab !== 'dashboard' && (
        <Header 
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          theme={theme}
          toggleTheme={toggleTheme}
          lang={lang}
          toggleLang={toggleLang}
          user={user}
          onOpenGoogleAuth={() => setIsGoogleAuthModalOpen(true)}
          onLogout={handleLogout}
        />
      )}

      {/* Main Content Area */}
      <main className={activeTab === 'dashboard' ? 'min-h-screen' : 'space-y-16 pb-16'}>
        
        {/* Tab: Exclusive Executive Project Manager Dashboard & CMS */}
        {activeTab === 'dashboard' && (
          <ExecutiveDashboard 
            summaryData={summaryData} 
            sectors={sectors} 
            setSectors={setSectors}
            contractors={contractors} 
            setContractors={setContractors}
            documents={documents}
            setDocuments={setDocuments}
            authorizedUsers={authorizedUsers}
            setAuthorizedUsers={setAuthorizedUsers}
            theme={theme}
            lang={lang}
            user={user}
            onOpenGoogleAuth={() => setIsGoogleAuthModalOpen(true)}
            onLogout={handleLogout}
            onBackToPortal={() => setActiveTab('hero')}
          />
        )}

        {/* All Main Portal Sections */}
        {activeTab !== 'dashboard' && (
          <>
            {/* Section 1: 3D Horizon Hero & Weather Widgets */}
            <div id="hero-section">
              <Hero3D 
                summaryData={summaryData} 
                setActiveTab={setActiveTab} 
                theme={theme}
                lang={lang}
                user={user}
                onOpenGoogleAuth={() => setIsGoogleAuthModalOpen(true)}
              />

              {/* Live Weather & Currency Exchange Widget */}
              <WeatherExchangeWidgets theme={theme} lang={lang} />
            </div>

            {/* Section 2: National Strategic Featured Projects */}
            <div id="projects-section">
              <FeaturedProjects theme={theme} lang={lang} />
            </div>

            {/* Section 3: Interactive Ubari - Ghat Project Map */}
            <div id="map-section">
              <InteractiveProjectMap theme={theme} lang={lang} />
            </div>

            {/* Section 4: Ubari - Ghat 360km Corridor Strategic Showcase */}
            <UbariCityShowcase theme={theme} lang={lang} />

            {/* Section 5: Sectors Roadmap */}
            <div id="sectors-section">
              <SectorsRoadmap 
                sectors={sectors} 
                theme={theme}
                lang={lang}
              />
            </div>

            {/* Section 6: Executing Contractors Fleet */}
            <div id="contractors-section">
              <ContractorsFleet 
                contractors={contractors} 
                theme={theme}
                lang={lang}
              />
            </div>

            {/* Section 7: Official Transparency & Field Oversight Hub */}
            <div id="media-section">
              <DocumentReportsHub 
                documents={documents}
                theme={theme}
                lang={lang}
              />
            </div>
          </>
        )}
      </main>

      {/* Google Sign-In Authentication Modal */}
      <GoogleAuthModal 
        isOpen={isGoogleAuthModalOpen}
        onClose={() => setIsGoogleAuthModalOpen(false)}
        onLoginSuccess={handleLoginSuccess}
        theme={theme}
        lang={lang}
      />

      {/* Footer (Only on public portal) */}
      {activeTab !== 'dashboard' && (
        <Footer setActiveTab={setActiveTab} theme={theme} lang={lang} />
      )}

    </div>
  );
}
