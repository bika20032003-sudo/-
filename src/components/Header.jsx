import React, { useState, useRef, useEffect } from 'react';
import { 
  ShieldCheck, 
  Eye, 
  SlidersHorizontal,
  Activity,
  Layers,
  Sun,
  Moon,
  LogOut,
  LogIn,
  User,
  Globe,
  ChevronDown,
  LayoutDashboard,
  Crown,
  Award
} from 'lucide-react';

export default function Header({ 
  activeTab, 
  setActiveTab, 
  theme, 
  toggleTheme, 
  lang = 'ar', 
  toggleLang, 
  user, 
  onOpenGoogleAuth, 
  onLogout 
}) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [themeKey, setThemeKey] = useState(0);
  const [activeSection, setActiveSection] = useState('hero');
  const [isScrolled, setIsScrolled] = useState(false);
  const dropdownRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setProfileDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Sticky Scroll & Section Active State (Throttled & Layout-Safe)
  useEffect(() => {
    let ticking = false;
    let lastScrolled = false;
    let lastSection = 'hero';
    let cachedOffsets = [];

    const sectionIds = [
      { id: 'hero', target: 'hero-section' },
      { id: 'about', target: 'about-section' },
      { id: 'projects', target: 'projects-section' },
      { id: 'sectors', target: 'sectors-section' },
      { id: 'map', target: 'map-section' }
    ];

    const measureOffsets = () => {
      cachedOffsets = sectionIds.map(s => {
        const el = document.getElementById(s.target);
        return {
          id: s.id,
          top: el ? el.offsetTop : 0
        };
      });
    };

    // Initial measurement after mount
    const measureTimer = setTimeout(measureOffsets, 200);
    window.addEventListener('resize', measureOffsets, { passive: true });

    const checkScroll = () => {
      const scrollY = window.scrollY;
      const shouldBeScrolled = scrollY > 20;

      if (shouldBeScrolled !== lastScrolled) {
        lastScrolled = shouldBeScrolled;
        setIsScrolled(shouldBeScrolled);
      }

      if (activeTab === 'dashboard') {
        if (lastSection !== 'dashboard') {
          lastSection = 'dashboard';
          setActiveSection('dashboard');
        }
        ticking = false;
        return;
      }

      const offsetTarget = scrollY + 160;
      let matchedSection = 'hero';
      
      // Use cached offsets to prevent layout thrashing (0 forced reflows)
      for (let i = cachedOffsets.length - 1; i >= 0; i--) {
        if (cachedOffsets[i].top <= offsetTarget) {
          matchedSection = cachedOffsets[i].id;
          break;
        }
      }

      if (matchedSection !== lastSection) {
        lastSection = matchedSection;
        setActiveSection(matchedSection);
      }

      ticking = false;
    };

    const handleScroll = () => {
      if (!ticking) {
        ticking = true;
        window.requestAnimationFrame(checkScroll);
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => {
      clearTimeout(measureTimer);
      window.removeEventListener('resize', measureOffsets);
      window.removeEventListener('scroll', handleScroll);
    };
  }, [activeTab]);

  const handleThemeToggle = () => {
    setThemeKey(k => k + 1);
    toggleTheme();
  };

  const navItems = [
    { id: 'hero', targetId: 'hero-section', label: lang === 'ar' ? 'الرئيسية' : 'Home' },
    { id: 'about', targetId: 'about-section', label: lang === 'ar' ? 'نبذة عن المشروع' : 'About Project' },
    { id: 'projects', targetId: 'projects-section', label: lang === 'ar' ? 'المشاريع' : 'Projects' },
    { id: 'map', targetId: 'map-section', label: lang === 'ar' ? 'الخريطة' : 'Interactive Map' }
  ];

  const handleNavClick = (sectionId, targetId) => {
    setActiveSection(sectionId);
    if (activeTab === 'dashboard') {
      setActiveTab('hero');
      setTimeout(() => {
        if (sectionId === 'hero') {
          window.scrollTo({ top: 0, behavior: 'smooth' });
        } else {
          const el = document.getElementById(targetId);
          if (el) el.scrollIntoView({ behavior: 'smooth' });
        }
      }, 100);
    } else {
      if (sectionId === 'hero') {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      } else {
        const el = document.getElementById(targetId);
        if (el) el.scrollIntoView({ behavior: 'smooth' });
      }
    }
  };

  return (
    <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 select-none ${
      isScrolled 
        ? 'py-2 px-2 sm:px-4 lg:px-8 border-b border-amber-500/20' 
        : 'py-3 px-2 sm:px-4 lg:px-8 bg-transparent'
    }`}>
      <div className={`max-w-7xl mx-auto rounded-2xl px-3 sm:px-4 py-2 border transition-all duration-200 flex items-center justify-between backdrop-blur-md ${
        theme === 'dark'
          ? isScrolled 
            ? 'bg-[#060a14]/95 border-amber-500/30 text-slate-100 shadow-2xl shadow-black/80' 
            : 'bg-[#090d18]/90 border-white/15 text-slate-100 shadow-xl shadow-black/60'
          : isScrolled
            ? 'bg-white/95 border-amber-500/30 text-slate-900 shadow-xl shadow-slate-200/90'
            : 'bg-white/95 border-slate-200/90 text-slate-900 shadow-lg shadow-slate-200/60'
      }`}>
        
        {/* ── Left Side: Official Agency Logo & Title ── */}
        <div 
          onClick={() => handleNavClick('hero', 'hero-section')}
          className="flex items-center gap-2.5 sm:gap-3 cursor-pointer group"
          data-cursor-label={lang === 'ar' ? 'الرئيسية' : 'Home'}
        >
          {/* Official Agency Emblem */}
          <div className="relative w-9 h-9 sm:w-10 sm:h-10 rounded-2xl bg-gradient-to-br from-amber-400 via-amber-500 to-amber-600 p-[1.5px] shadow-sm shadow-amber-500/20 group-hover:scale-105 transition-all duration-300 flex-shrink-0">
            <img 
              src="/logo-agency.jpg" 
              alt="جهاز تنفيذ مشروعات المواصلات" 
              className="w-full h-full object-contain rounded-2xl bg-white"
            />
          </div>

          {/* Authority Official Title */}
          <div className="text-start border-s border-slate-300 dark:border-white/10 ps-2.5 sm:ps-3">
            <div className="flex items-center gap-1.5">
              <h1 className={`font-black text-xs sm:text-sm leading-snug group-hover:text-amber-500 transition-colors ${
                theme === 'light' ? 'text-slate-900' : 'text-white'
              }`}>
                {lang === 'ar' ? 'جهاز تنفيذ مشروعات المواصلات' : 'Transportation Projects Authority'}
              </h1>
            </div>
            <p className="text-[10px] text-amber-500 font-bold flex items-center gap-1">
              <span>{lang === 'ar' ? 'مشروع طريق أوباري – غات (360 كم)' : 'Ubari – Ghat 360km Highway Project'}</span>
            </p>
          </div>
        </div>

        {/* ── Center: Desktop Navigation Links ── */}
        <nav className={`hidden lg:flex items-center gap-1 p-1 rounded-2xl border ${
          theme === 'light' ? 'bg-slate-100/80 border-slate-200' : 'bg-white/5 border-white/10'
        }`}>
          {navItems.map((item) => {
            const isActive = (activeTab !== 'dashboard' && activeSection === item.id);
            return (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.id, item.targetId)}
                className={`relative px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all duration-200 flex items-center gap-1.5 cursor-pointer ${
                  isActive
                    ? theme === 'light'
                      ? 'bg-amber-500/15 text-amber-900 border border-amber-500/40 shadow-sm font-black'
                      : 'bg-amber-500/15 text-amber-400 border border-amber-500/30 shadow-sm font-black'
                    : theme === 'light'
                      ? 'text-slate-700 hover:text-slate-950 hover:bg-white'
                      : 'text-slate-300 hover:text-white hover:bg-white/10'
                }`}
              >
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* ── Right Side: Action Controls ── */}
        <div className="flex items-center gap-2">

          {/* ── BEFORE LOGIN: Glass "دخول" Button ── */}
          {!user ? (
            <button
              onClick={onOpenGoogleAuth}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-black transition-all duration-300 flex items-center justify-center border shadow-sm backdrop-blur-md cursor-pointer hover:scale-105 ${
                theme === 'light'
                  ? 'bg-slate-100/90 hover:bg-slate-200/90 text-slate-800 border-slate-300'
                  : 'bg-white/10 hover:bg-white/20 text-white border-white/20 hover:border-amber-400/50'
              }`}
            >
              <span>{lang === 'ar' ? 'دخول' : 'Sign In'}</span>
            </button>
          ) : (
            /* ── AFTER LOGIN: User Avatar Dropdown ── */
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                className={`p-1 px-2 rounded-2xl border flex items-center gap-1.5 transition-all duration-300 cursor-pointer hover:scale-105 shadow-sm ${
                  profileDropdownOpen
                    ? 'border-amber-500 bg-amber-500/20 shadow-md shadow-amber-500/25'
                    : theme === 'light'
                      ? 'bg-slate-100/90 hover:bg-slate-200/80 border-slate-200 text-slate-800'
                      : 'bg-white/10 hover:bg-white/20 border-white/15 text-white'
                }`}
              >
                <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-amber-400 via-amber-500 to-amber-600 p-[1.5px] shadow-sm shadow-amber-500/20 flex-shrink-0">
                  <img 
                    src={user.avatar} 
                    alt={user.name} 
                    className="w-full h-full rounded-full object-cover object-center bg-slate-900"
                  />
                </div>

                <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-300 ${
                  profileDropdownOpen ? 'rotate-180 text-amber-500' : 'text-slate-300'
                }`} />
              </button>

              {/* Floating Dropdown */}
              {profileDropdownOpen && (
                <div className={`absolute top-full mt-2 end-0 w-60 rounded-2xl p-2 border shadow-2xl backdrop-blur-2xl animate-scaleUp z-50 ${
                  theme === 'light'
                    ? 'bg-white/95 border-slate-200 text-slate-900 shadow-slate-300/80'
                    : 'bg-[#0a0f1d]/95 border-amber-500/30 text-white shadow-black/90'
                }`}>
                  <div className="p-2.5 mb-1.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-start space-y-0.5">
                    <div className="font-black text-xs text-amber-400 flex items-center justify-between">
                      <span>{user.name}</span>
                      <span className="text-[9px] px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 font-bold">مسؤول</span>
                    </div>
                    <div className="text-[10px] text-slate-400 truncate">{user.email}</div>
                  </div>

                  <button
                    onClick={() => {
                      setProfileDropdownOpen(false);
                      setActiveTab('dashboard');
                    }}
                    className={`w-full px-3 py-2.5 rounded-xl text-xs font-extrabold flex items-center gap-2.5 transition-all text-start cursor-pointer ${
                      activeTab === 'dashboard'
                        ? 'bg-amber-500 text-slate-950 font-black'
                        : theme === 'light'
                          ? 'hover:bg-slate-100 text-slate-800'
                          : 'hover:bg-white/10 text-slate-200'
                    }`}
                  >
                    <LayoutDashboard className="w-4 h-4 text-amber-500" />
                    <span>{lang === 'ar' ? 'لوحة التحكم' : 'Dashboard'}</span>
                  </button>

                  <button
                    onClick={() => {
                      setProfileDropdownOpen(false);
                      onLogout();
                    }}
                    className={`w-full px-3 py-2.5 rounded-xl text-xs font-extrabold flex items-center gap-2.5 transition-all text-start text-red-400 hover:bg-red-500/15 hover:text-red-300 cursor-pointer`}
                  >
                    <LogOut className="w-4 h-4 text-red-500" />
                    <span>{lang === 'ar' ? 'تسجيل الخروج' : 'Sign Out'}</span>
                  </button>
                </div>
              )}
            </div>
          )}

          {/* ── Language Switcher (AR / EN) ── */}
          <button
            onClick={toggleLang}
            title={lang === 'ar' ? 'Switch to English' : 'التبديل إلى العربية'}
            className={`px-2.5 py-1.5 rounded-xl text-xs font-black transition-all duration-300 flex items-center gap-1.5 border shadow-sm cursor-pointer hover:scale-105 ${
              theme === 'light'
                ? 'bg-slate-100 hover:bg-slate-200 text-slate-800 border-slate-300'
                : 'bg-white/10 hover:bg-white/20 text-slate-100 border-white/15'
            }`}
          >
            <Globe className="w-3.5 h-3.5 text-amber-500" />
            <span className="font-mono tracking-wider">{lang === 'ar' ? 'EN' : 'عربي'}</span>
          </button>

          {/* ── Day / Night Toggle ── */}
          <button
            id="theme-toggle-btn"
            onClick={handleThemeToggle}
            title={theme === 'light' ? 'التبديل إلى الوضع الليلي' : 'التبديل إلى الوضع النهاري'}
            className={`relative w-9 h-9 rounded-xl flex items-center justify-center border shadow-md transition-all duration-300 overflow-hidden cursor-pointer hover:scale-105 ${
              theme === 'light'
                ? 'bg-amber-100/90 border-amber-300/80 hover:bg-amber-200 text-amber-900 shadow-amber-500/10'
                : 'bg-slate-800/80 border-slate-600/50 hover:bg-slate-700/80 text-amber-400'
            }`}
          >
            <span key={themeKey} className="theme-icon-enter">
              {theme === 'light' 
                ? <Moon className="w-4 h-4 text-amber-800" />
                : <Sun className="w-4 h-4 text-amber-400" />
              }
            </span>
          </button>

          {/* Mobile Menu Toggle Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className={`lg:hidden p-2 rounded-xl border ${
              theme === 'light' ? 'bg-slate-100 text-slate-800 border-slate-200' : 'bg-white/10 text-white border-white/10'
            }`}
            aria-label="القائمة الجانبية"
          >
            <SlidersHorizontal className="w-4 h-4 text-amber-500" />
          </button>
        </div>

      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className={`lg:hidden mt-2 p-3 rounded-2xl border shadow-2xl flex flex-col gap-1 animate-scaleUp max-w-7xl mx-auto ${
          theme === 'light' ? 'bg-white border-slate-200 text-slate-900' : 'bg-[#090d18]/95 border-amber-500/30 text-white'
        }`}>
          {/* Logo badge inside mobile menu */}
          <div className="flex items-center justify-between p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/20 mb-2">
            <div className="flex items-center gap-2">
              <Award className="w-4 h-4 text-amber-400" />
              <span className="text-xs font-black text-amber-400">
                {lang === 'ar' ? 'بوابة مشروعات المواصلات' : 'Transportation Authority'}
              </span>
            </div>
            <span className="text-[10px] text-slate-400">طريق أوباري – غات 360 كم</span>
          </div>

          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => {
                handleNavClick(item.id, item.targetId);
                setMobileMenuOpen(false);
              }}
              className={`w-full px-3.5 py-2.5 rounded-xl text-xs font-bold text-start transition-all flex items-center justify-between ${
                (activeTab !== 'dashboard' && activeSection === item.id)
                  ? 'bg-amber-500/15 text-amber-500 font-bold border border-amber-500/30'
                  : theme === 'light'
                    ? 'text-slate-700 hover:bg-slate-100'
                    : 'text-slate-300 hover:bg-white/10'
              }`}
            >
              <span>{item.label}</span>
            </button>
          ))}

          {/* Mobile Dashboard & Auth Options */}
          <div className="border-t border-white/10 pt-2 mt-1 space-y-1">
            {!user ? (
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  onOpenGoogleAuth();
                }}
                className="w-full px-3.5 py-2 rounded-xl text-xs font-extrabold text-start text-cyan-400 hover:bg-cyan-500/15 flex items-center gap-2"
              >
                <LogIn className="w-3.5 h-3.5" />
                <span>{lang === 'ar' ? 'دخول' : 'Sign In'}</span>
              </button>
            ) : (
              <>
                <button
                  onClick={() => {
                    setActiveTab('dashboard');
                    setMobileMenuOpen(false);
                  }}
                  className="w-full px-3.5 py-2 rounded-xl text-xs font-extrabold text-start text-amber-400 hover:bg-amber-500/15 flex items-center gap-2"
                >
                  <LayoutDashboard className="w-3.5 h-3.5" />
                  <span>{lang === 'ar' ? 'لوحة التحكم' : 'Dashboard'}</span>
                </button>
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    onLogout();
                  }}
                  className="w-full px-3.5 py-2 rounded-xl text-xs font-extrabold text-start text-red-400 hover:bg-red-500/15 flex items-center gap-2"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>{lang === 'ar' ? 'تسجيل الخروج' : 'Sign Out'}</span>
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
