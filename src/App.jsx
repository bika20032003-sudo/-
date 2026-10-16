import React, { useState, useEffect, lazy, Suspense } from 'react';
import Header from './components/Header';
import Hero3D from './components/Hero3D';
import FeaturedProjects from './components/FeaturedProjects';
import InteractiveProjectMap from './components/InteractiveProjectMap';
import Footer from './components/Footer';
import GoogleAuthModal from './components/GoogleAuthModal';
import WeatherExchangeWidgets from './components/WeatherExchangeWidgets';
import UbariCityShowcase from './components/UbariCityShowcase';
import NewsPostCarousel from './components/NewsPostCarousel';

// Code split heavy dashboard for faster initial page load
const ExecutiveDashboard = lazy(() => import('./components/ExecutiveDashboard'));

import { 
  fetchProjectSummary, 
  fetchSectors, 
  fetchContractors,
  initialSectors,
  initialSummary,
  initialContractors,
  initialTickerNews,
  getSavedTickerNews
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
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150'
  }
];

function App() {
  // Navigation tab state: 'hero' | 'sectors' | 'contractors' | 'media' | 'dashboard'
  const [activeTab, setActiveTab] = useState('hero');

  // Theme state: 'dark' | 'light' - Default is Night Mode (dark)
  const [theme, setTheme] = useState(() => {
    const saved = localStorage.getItem('portal_theme_v2');
    if (saved === 'light' || saved === 'dark') return saved;
    return 'dark';
  });

  // Language state: 'ar' | 'en'
  const [lang, setLang] = useState(() => {
    return localStorage.getItem('portal_lang') || 'ar';
  });

  // User state
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('portal_user');
    return saved ? JSON.parse(saved) : null;
  });

  // Google Auth modal state
  const [isGoogleAuthModalOpen, setIsGoogleAuthModalOpen] = useState(false);

  // Dynamic project data
  const [summaryData, setSummaryData] = useState(initialSummary);

  const [sectors, setSectors] = useState(() => {
    const saved = localStorage.getItem('portal_sectors');
    return saved ? JSON.parse(saved) : initialSectors;
  });

  const [contractors, setContractors] = useState(() => {
    const saved = localStorage.getItem('portal_contractors');
    return saved ? JSON.parse(saved) : initialContractors;
  });

  const [documents, setDocuments] = useState(() => {
    const saved = localStorage.getItem('portal_documents');
    return saved ? JSON.parse(saved) : DEFAULT_DOCUMENTS;
  });

  const [authorizedUsers, setAuthorizedUsers] = useState(() => {
    const saved = localStorage.getItem('portal_authorized_users');
    return saved ? JSON.parse(saved) : DEFAULT_USERS;
  });

  // Top Bar Ticker News State (managed from Dashboard)
  const [tickerNews, setTickerNews] = useState(getSavedTickerNews);

  useEffect(() => {
    const handleStorageChange = () => {
      setTickerNews(getSavedTickerNews());
    };
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  // Apply theme & dir attribute to document
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('portal_theme_v2', theme);
    localStorage.setItem('portal_theme', theme);
  }, [theme]);

  useEffect(() => {
    document.documentElement.setAttribute('dir', lang === 'ar' ? 'rtl' : 'ltr');
    document.documentElement.setAttribute('lang', lang);
    localStorage.setItem('portal_lang', lang);
  }, [lang]);

  // Fetch real data from backend on mount (graceful fallback to initial)
  useEffect(() => {
    fetchProjectSummary()
      .then(res => {
        if (res.success && res.data) {
          setSummaryData(res.data);
        }
      })
      .catch(() => {
        // Fallback already in state
      });

    fetchSectors()
      .then(res => {
        if (res.success && res.data && res.data.length > 0) {
          setSectors(res.data);
        }
      })
      .catch(() => {});

    fetchContractors()
      .then(res => {
        if (res.success && res.data && res.data.length > 0) {
          setContractors(res.data);
        }
      })
      .catch(() => {});
  }, []);

  // Theme toggle
  const toggleTheme = () => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light');
  };

  // Language toggle
  const toggleLang = () => {
    setLang(prev => prev === 'ar' ? 'en' : 'ar');
  };

  // Login handler
  const handleLoginSuccess = (userData) => {
    setUser(userData);
    localStorage.setItem('portal_user', JSON.stringify(userData));
    setIsGoogleAuthModalOpen(false);
  };

  // Logout handler
  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('portal_user');
    if (activeTab === 'dashboard') {
      setActiveTab('hero');
    }
  };

  return (
    <div className={`min-h-screen font-arabic selection:bg-amber-500 selection:text-black transition-colors duration-300 ${
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
          <Suspense fallback={
            <div className="flex min-h-screen items-center justify-center bg-background text-muted-foreground font-medium">
              جارٍ تحميل لوحة التحكم التنفيذية...
            </div>
          }>
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
              tickerNews={tickerNews}
              setTickerNews={setTickerNews}
            />
          </Suspense>
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
                tickerNews={tickerNews}
              />

              {/* Live Weather Telemetry Ribbon */}
              <div className="w-full">
                <WeatherExchangeWidgets theme={theme} lang={lang} />
              </div>
            </div>

            {/* Section: News Post Carousel (بوست أخبار المشروع المصور مع التنقل ونقاط العرض - للكمبيوتر) */}
            <div className="hidden lg:block">
              <NewsPostCarousel theme={theme} lang={lang} />
            </div>

            {/* Section: Ubari - Ghat 360km Project Overview (نبذة خاصة بالمشروع) */}
            <div id="about-section" className="gsap-scale-in">
              <UbariCityShowcase theme={theme} lang={lang} />
            </div>

            {/* Section: National Strategic Featured Projects */}
            <div id="projects-section">
              <FeaturedProjects theme={theme} lang={lang} />
            </div>

            {/* Section: Interactive Ubari - Ghat Project Map */}
            <div id="map-section" className="gsap-header">
              <InteractiveProjectMap theme={theme} lang={lang} />
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

export default App;
