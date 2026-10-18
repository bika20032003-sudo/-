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
  Compass,
  ArrowUpRight,
  Sparkles
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
      <div className={`max-w-7xl mx-auto rounded-2xl px-3 sm:px-4 py-2 border transition-all duration-200 flex items-center justify-between shadow-lg ${
        theme === 'dark'
          ? isScrolled 
            ? 'bg-[#060a14] border-amber-500/30 text-slate-100 shadow-black/80' 
            : 'bg-[#090d18] border-white/15 text-slate-100 shadow-black/60'
          : isScrolled
            ? 'bg-white border-amber-500/30 text-slate-900 shadow-slate-200/90'
            : 'bg-white border-slate-200 text-slate-900 shadow-slate-200/60'
      }`}>
        
        {/* ── Left Side: Official Agency Logo & Title ── */}
        <div 
          onClick={() => handleNavClick('hero', 'hero-section')}
          className="flex items-center gap-2 sm:gap-3 cursor-pointer group min-w-0 flex-1 sm:flex-initial"
          data-cursor-label={lang === 'ar' ? 'الرئيسية' : 'Home'}
        >
          {/* Official Agency Emblem */}
          <div className="relative w-8 h-8 sm:w-10 sm:h-10 rounded-xl sm:rounded-2xl bg-gradient-to-br from-amber-400 via-amber-500 to-amber-600 p-[1.5px] shadow-sm shadow-amber-500/20 group-hover:scale-105 transition-all duration-300 flex-shrink-0">
            <img 
              src="./logo-agency.jpg" 
              alt="جهاز تنفيذ مشروعات المواصلات" 
              className="w-full h-full object-contain rounded-xl sm:rounded-2xl bg-white"
            />
          </div>

          {/* Authority Official Title */}
          <div className="text-start border-s border-slate-300 dark:border-white/10 ps-1.5 sm:ps-3 min-w-0 flex-1 sm:flex-initial overflow-hidden">
            <div className="flex items-center gap-1 min-w-0">
              <h1 className={`font-black text-[10px] xs:text-[11px] sm:text-sm leading-tight truncate sm:whitespace-nowrap group-hover:text-amber-500 transition-colors ${
                theme === 'light' ? 'text-slate-900' : 'text-white'
              }`}>
                {lang === 'ar' ? 'جهاز تنفيذ مشروعات المواصلات' : 'Transportation Authority'}
              </h1>
            </div>
            <p className="text-[9px] sm:text-[10px] text-amber-500 font-bold flex items-center gap-1 truncate sm:whitespace-nowrap mt-0.5">
              <span>{lang === 'ar' ? 'طريق أوباري – غات' : 'Ubari – Ghat'}</span>
              <span className="hidden xs:inline">(360 كم)</span>
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
        <div className="flex items-center gap-1.5 sm:gap-2 flex-shrink-0">

          {/* ── زر بداية الرحلة (الموقع التعريفي) ── */}
          {/* Desktop & Tablet: Full Button */}
          <a
            href="https://bika20032003-sudo.github.io/-/road/"
            target="_blank"
            rel="noopener noreferrer"
            title={lang === 'ar' ? 'الموقع التعريفي لمشروع طريق أوباري – غات' : 'Showcase Website'}
            className={`hidden md:flex px-3 py-1.5 rounded-xl text-xs font-black transition-all duration-200 items-center gap-1.5 border shadow-sm cursor-pointer hover:scale-105 ${
              theme === 'light'
                ? 'bg-orange-50 hover:bg-orange-100 border-orange-300/80 text-orange-600 shadow-orange-500/10'
                : 'bg-orange-500/10 hover:bg-orange-500/20 border-orange-500/30 hover:border-orange-400/60 text-orange-400 shadow-orange-500/10'
            }`}
          >
            <Compass className="w-3.5 h-3.5 text-amber-500" />
            <span className="font-black tracking-wide">
              {lang === 'ar' ? 'بداية الرحلة' : 'Journey Start'}
            </span>
            <ArrowUpRight className="w-3 h-3 opacity-70" />
          </a>



          {/* ── BEFORE LOGIN: Glass "دخول" Button (Desktop/Tablet) ── */}
          {!user ? (
            <button
              onClick={onOpenGoogleAuth}
              className={`hidden sm:flex px-3 py-1.5 rounded-xl text-xs font-black transition-all duration-200 items-center justify-center border shadow-sm cursor-pointer hover:scale-105 ${
                theme === 'light'
                  ? 'bg-slate-100 hover:bg-slate-200 text-slate-800 border-slate-300'
                  : 'bg-white/10 hover:bg-white/20 text-white border-white/20 hover:border-amber-400/50'
              }`}
            >
              <span>{lang === 'ar' ? 'دخول' : 'Sign In'}</span>
            </button>
          ) : (
            /* ── AFTER LOGIN: User Avatar Dropdown (Desktop & Tablet) ── */
            <div className="relative hidden sm:block" ref={dropdownRef}>
              <button
                onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                className={`p-1 px-1.5 sm:px-2 rounded-2xl border flex items-center gap-1 sm:gap-1.5 transition-all duration-300 cursor-pointer hover:scale-105 shadow-sm ${
                  profileDropdownOpen
                    ? 'border-amber-500 bg-amber-500/20 shadow-md shadow-amber-500/25'
                    : theme === 'light'
                      ? 'bg-slate-100/90 hover:bg-slate-200/80 border-slate-200 text-slate-800'
                      : 'bg-white/10 hover:bg-white/20 border-white/15 text-white'
                }`}
              >
                <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-gradient-to-tr from-amber-400 via-amber-500 to-amber-600 p-[1.5px] shadow-sm shadow-amber-500/20 flex-shrink-0">
                  <img 
                    src={user.avatar} 
                    alt={user.name} 
                    className="w-full h-full rounded-full object-cover object-center bg-slate-900"
                  />
                </div>

                <ChevronDown className={`w-3 h-3 sm:w-3.5 sm:h-3.5 transition-transform duration-300 ${
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

          {/* ── Language Switcher (AR / EN) (Desktop/Tablet) ── */}
          <button
            onClick={toggleLang}
            title={lang === 'ar' ? 'Switch to English' : 'التبديل إلى العربية'}
            className={`hidden sm:flex px-2.5 py-1.5 rounded-xl text-xs font-black transition-all duration-300 items-center gap-1.5 border shadow-sm cursor-pointer hover:scale-105 ${
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
            className={`relative w-8 h-8 sm:w-9 sm:h-9 rounded-xl flex items-center justify-center border shadow-sm transition-all duration-300 overflow-hidden cursor-pointer hover:scale-105 ${
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
            className={`lg:hidden w-8 h-8 sm:w-9 sm:h-9 rounded-xl border flex items-center justify-center transition-all cursor-pointer relative shrink-0 ${
              mobileMenuOpen 
                ? 'bg-amber-500 text-slate-950 border-amber-400 shadow-md shadow-amber-500/20' 
                : theme === 'light' ? 'bg-slate-100 text-slate-800 border-slate-200' : 'bg-white/10 text-white border-white/10'
            }`}
            aria-label="القائمة الجانبية"
          >
            {user ? (
              <div className="w-5.5 h-5.5 rounded-full overflow-hidden ring-1.5 ring-amber-500">
                <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
              </div>
            ) : (
              <SlidersHorizontal className={`w-4 h-4 ${mobileMenuOpen ? 'text-slate-950' : 'text-amber-500'}`} />
            )}
          </button>
        </div>

      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className={`lg:hidden mt-2 p-3.5 rounded-2xl border shadow-2xl flex flex-col gap-1.5 animate-scaleUp max-w-7xl mx-auto ${
          theme === 'light' ? 'bg-white/98 border-amber-400/40 text-slate-900 shadow-slate-300/80' : 'bg-[#090d18]/98 border-amber-500/30 text-white shadow-black/90'
        }`}>
          {/* User profile card if logged in */}
          {user && (
            <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/25 mb-1 flex items-center justify-between gap-2.5 text-start">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-8 h-8 rounded-full overflow-hidden ring-2 ring-amber-500 flex-shrink-0">
                  <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
                </div>
                <div className="min-w-0 text-start">
                  <div className="font-black text-xs text-amber-500 dark:text-amber-400 truncate">{user.name}</div>
                  <div className="text-[10px] text-slate-500 dark:text-slate-400 truncate">{user.email}</div>
                </div>
              </div>
              <span className="text-[9px] px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-600 dark:text-amber-300 font-bold border border-amber-500/30 shrink-0">
                مسؤول
              </span>
            </div>
          )}

          {/* Logo badge inside mobile menu */}
          <div className="flex items-center justify-between p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/20 mb-1">
            <span className={`text-xs font-black ${theme === 'light' ? 'text-slate-900' : 'text-white'}`}>
              {lang === 'ar' ? 'جهاز تنفيذ مشروعات المواصلات' : 'Transportation Authority'}
            </span>
            <span className="text-[10px] text-amber-400 font-bold bg-amber-500/15 px-2 py-0.5 rounded border border-amber-500/30">360 كم</span>
          </div>

          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => {
                handleNavClick(item.id, item.targetId);
                setMobileMenuOpen(false);
              }}
              className={`w-full px-3.5 py-2.5 rounded-xl text-xs font-bold text-start transition-all flex items-center justify-between cursor-pointer ${
                (activeTab !== 'dashboard' && activeSection === item.id)
                  ? 'bg-amber-500/15 text-amber-500 font-black border border-amber-500/30 shadow-sm'
                  : theme === 'light'
                    ? 'text-slate-700 hover:bg-slate-100'
                    : 'text-slate-300 hover:bg-white/10'
              }`}
            >
              <span>{item.label}</span>
            </button>
          ))}

          {/* Mobile Language Switcher */}
          <button
            onClick={() => {
              toggleLang();
              setMobileMenuOpen(false);
            }}
            className={`w-full px-3.5 py-2.5 rounded-xl text-xs font-bold text-start transition-all flex items-center justify-between border cursor-pointer ${
              theme === 'light'
                ? 'bg-slate-50 border-slate-200 text-slate-800 hover:bg-slate-100'
                : 'bg-white/5 border-white/10 text-slate-200 hover:bg-white/10'
            }`}
          >
            <span className="flex items-center gap-2">
              <Globe className="w-3.5 h-3.5 text-amber-500" />
              <span>{lang === 'ar' ? 'English Language' : 'اللغة العربية'}</span>
            </span>
            <span className="text-[10px] px-2 py-0.5 rounded font-mono font-black bg-amber-500/20 text-amber-500">
              {lang === 'ar' ? 'EN' : 'عربي'}
            </span>
          </button>

          {/* Mobile Dashboard & Auth Options */}
          <div className="border-t border-slate-200 dark:border-white/10 pt-2 mt-1 space-y-1.5">
            {/* زر بداية الرحلة للجوال - تصميم عصري وفخم */}
            <a
              href="https://bika20032003-sudo.github.io/-/road/"
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => setMobileMenuOpen(false)}
              className={`group relative overflow-hidden w-full p-2.5 sm:p-3 rounded-2xl border transition-all duration-300 flex items-center justify-between gap-2.5 shadow-md active:scale-[0.98] cursor-pointer ${
                theme === 'light'
                  ? 'bg-gradient-to-r from-amber-50 via-orange-50/90 to-amber-100/70 border-amber-300/80 hover:border-amber-400 shadow-amber-500/10'
                  : 'bg-gradient-to-r from-amber-950/40 via-orange-950/30 to-slate-900/90 border-amber-500/40 hover:border-amber-400/70 shadow-black/40 backdrop-blur-md'
              }`}
            >
              {/* لمسة بريق ضوئي تمر عند التحويم */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-in-out pointer-events-none" />

              {/* الجانب الأيمن: أيقونة بوصلة متوهجة + العنوان الرئيسي والفرعي */}
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-amber-400 via-orange-500 to-amber-600 text-slate-950 flex items-center justify-center shrink-0 shadow-sm shadow-orange-500/30 group-hover:scale-105 group-hover:rotate-6 transition-all duration-300">
                  <Compass className="w-5 h-5" />
                </div>
                <div className="flex flex-col text-start min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className={`text-xs font-black tracking-wide truncate ${
                      theme === 'light' ? 'text-slate-900' : 'text-white'
                    }`}>
                      {lang === 'ar' ? 'بداية الرحلة' : 'Journey Start'}
                    </span>
                    <span className="text-[9px] font-black px-1.5 py-0.5 rounded-full bg-amber-500/20 text-amber-500 border border-amber-500/30 shrink-0">
                      3D
                    </span>
                  </div>
                  <span className={`text-[10px] font-semibold truncate ${
                    theme === 'light' ? 'text-amber-900/80' : 'text-amber-200/75'
                  }`}>
                    {lang === 'ar' ? 'الموقع التعريفي للمشروع' : 'Interactive Showcase'}
                  </span>
                </div>
              </div>

              {/* الجانب الأيسر: زر تفاعلي أنيق بلمسة عصرية */}
              <div className="shrink-0 flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-[11px] font-black bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 shadow-sm shadow-amber-500/25 group-hover:from-amber-400 group-hover:to-orange-400 group-hover:shadow-md transition-all duration-200">
                <span>{lang === 'ar' ? 'استكشف' : 'Explore'}</span>
                <ArrowUpRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform duration-200" />
              </div>
            </a>

            {!user ? (
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  onOpenGoogleAuth();
                }}
                className="w-full px-3.5 py-2.5 rounded-xl text-xs font-black text-start bg-amber-500 text-slate-950 flex items-center justify-center gap-2 shadow-md shadow-amber-500/20 cursor-pointer hover:bg-amber-400 transition-colors"
              >
                <LogIn className="w-4 h-4" />
                <span>{lang === 'ar' ? 'تسجيل الدخول' : 'Sign In'}</span>
              </button>
            ) : (
              <>
                <button
                  onClick={() => {
                    setActiveTab('dashboard');
                    setMobileMenuOpen(false);
                  }}
                  className="w-full px-3.5 py-2.5 rounded-xl text-xs font-extrabold text-start text-amber-400 hover:bg-amber-500/15 flex items-center gap-2"
                >
                  <LayoutDashboard className="w-4 h-4" />
                  <span>{lang === 'ar' ? 'لوحة التحكم التنفيذية' : 'Dashboard'}</span>
                </button>
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    onLogout();
                  }}
                  className="w-full px-3.5 py-2.5 rounded-xl text-xs font-extrabold text-start text-red-400 hover:bg-red-500/15 flex items-center gap-2"
                >
                  <LogOut className="w-4 h-4" />
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
