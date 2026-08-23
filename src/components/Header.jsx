import React, { useState, useRef, useEffect } from 'react';
import { 
  ShieldCheck, 
  Eye, 
  SlidersHorizontal,
  Activity,
  Layers,
  Sparkles,
  Sun,
  Moon,
  LogOut,
  LogIn,
  User,
  Globe,
  ChevronDown,
  LayoutDashboard
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
  const [themeKey, setThemeKey] = useState(0); // for re-trigger animation
  const [activeSection, setActiveSection] = useState('hero');
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

  // Active scroll section observer
  useEffect(() => {
    if (activeTab === 'dashboard') {
      setActiveSection('dashboard');
      return;
    }

    const sectionIds = [
      { id: 'hero', target: 'hero-section' },
      { id: 'projects', target: 'projects-section' },
      { id: 'sectors', target: 'sectors-section' },
      { id: 'contractors', target: 'contractors-section' },
      { id: 'map', target: 'map-section' },
      { id: 'media', target: 'media-section' }
    ];

    const handleScroll = () => {
      const scrollY = window.scrollY + 130;
      for (let i = sectionIds.length - 1; i >= 0; i--) {
        const el = document.getElementById(sectionIds[i].target);
        if (el && el.offsetTop <= scrollY) {
          setActiveSection(sectionIds[i].id);
          return;
        }
      }
      setActiveSection('hero');
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [activeTab]);

  const handleThemeToggle = () => {
    setThemeKey(k => k + 1);
    toggleTheme();
  };

  const navItems = [
    { id: 'hero', targetId: 'hero-section', label: lang === 'ar' ? 'الرئيسية' : 'Home' },
    { id: 'projects', targetId: 'projects-section', label: lang === 'ar' ? 'المشاريع' : 'Projects' },
    { id: 'sectors', targetId: 'sectors-section', label: lang === 'ar' ? 'القطاعات' : 'Sectors' },
    { id: 'contractors', targetId: 'contractors-section', label: lang === 'ar' ? 'الشركات' : 'Contractors' },
    { id: 'map', targetId: 'map-section', label: lang === 'ar' ? 'الخريطة التفاعلية' : 'Interactive Map' },
    { id: 'media', targetId: 'media-section', label: lang === 'ar' ? 'الشفافية والتقارير' : 'Reports & Media' }
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
    <header className="fixed top-1.5 left-0 right-0 z-50 px-2 sm:px-4 lg:px-8 py-1 transition-all duration-300 select-none">
      <div className={`max-w-7xl mx-auto rounded-2xl px-3 py-1.5 border shadow-xl flex items-center justify-between backdrop-blur-xl transition-colors duration-300 ${
        theme === 'dark'
          ? 'bg-[#090d18]/90 border-white/15 text-slate-100 shadow-black/60'
          : 'bg-white/95 border-slate-200/90 text-slate-900 shadow-slate-200/70'
      }`}>
        {/* Agency Brand Logo */}
        <div 
          onClick={() => handleNavClick('hero', 'hero-section')}
          className="flex items-center gap-2 cursor-pointer group"
        >
          <div className="relative w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-gradient-to-br from-amber-400 via-amber-500 to-amber-600 p-[1.5px] shadow-sm shadow-amber-500/25 group-hover:scale-105 transition-all duration-300 flex-shrink-0">
            <img 
              src="/logo-agency.jpg" 
              alt="جهاز تنفيذ مشروعات المواصلات" 
              className="w-full h-full object-contain rounded-full bg-white"
            />
            <span className="absolute -bottom-0.5 -right-0.5 flex h-2.5 w-2.5">
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
            </span>
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <h1 className={`font-black text-xs sm:text-sm tracking-wide leading-tight group-hover:text-amber-500 transition-colors ${
                theme === 'light' ? 'text-slate-900' : 'text-white'
              }`}>
                {lang === 'ar' ? 'جهاز تنفيذ مشروعات المواصلات' : 'Transportation Projects Authority'}
              </h1>
            </div>
            <p className="text-[9px] text-amber-500 font-bold uppercase tracking-wider flex items-center gap-1">
              <span>{lang === 'ar' ? 'مشروع طريق أوباري – غات 360 كم' : 'Ubari – Ghat 360km Highway Project'}</span>
            </p>
          </div>
        </div>

        {/* Desktop Navigation Links */}
        <nav className={`hidden lg:flex items-center gap-1 p-1 rounded-xl border ${
          theme === 'light' ? 'bg-slate-100/80 border-slate-200' : 'bg-white/5 border-white/10'
        }`}>
          {navItems.map((item) => {
            const isActive = (activeTab !== 'dashboard' && activeSection === item.id);
            return (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.id, item.targetId)}
                className={`relative px-3.5 py-1.5 rounded-lg text-xs font-black transition-all duration-200 flex items-center gap-1.5 cursor-pointer ${
                  isActive
                    ? 'bg-amber-500 text-slate-950 font-black shadow-md shadow-amber-500/25 scale-[1.02]'
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

        {/* Action Controls: Sign In Button / User Profile Dropdown, Language Toggle, Theme Toggle & Mobile Menu */}
        <div className="flex items-center gap-2">

          {/* ── BEFORE LOGIN: Transparent Frosted Glass "دخول" Button ── */}
          {!user ? (
            <button
              onClick={onOpenGoogleAuth}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-black transition-all duration-300 flex items-center justify-center border shadow-sm backdrop-blur-md cursor-pointer hover:scale-105 ${
                theme === 'light'
                  ? 'bg-slate-100/80 hover:bg-slate-200/90 text-slate-800 border-slate-300/80'
                  : 'bg-white/10 hover:bg-white/20 text-white border-white/20 hover:border-white/35'
              }`}
            >
              <span>{lang === 'ar' ? 'دخول' : 'Sign In'}</span>
            </button>
          ) : (
            /* ── AFTER LOGIN: Reference Avatar Photo (Sharp & Clear) + Chevron Menu ── */
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
                title={user.name || (lang === 'ar' ? 'قائمة الحساب' : 'Account Menu')}
              >
                {/* 4K High-Definition Sharp Avatar Circle */}
                <div className="relative w-8 h-8 rounded-full bg-gradient-to-tr from-amber-400 via-amber-500 to-amber-600 p-[1.5px] shadow-sm shadow-amber-500/30 flex-shrink-0">
                  <img 
                    src={user.avatar} 
                    alt={user.name} 
                    className="w-full h-full rounded-full object-cover object-center bg-slate-900"
                  />
                  <span className="absolute -bottom-0.5 -right-0.5 flex h-2 w-2">
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500 ring-1 ring-white"></span>
                  </span>
                </div>

                {/* Downward Chevron Arrow */}
                <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-300 ${
                  profileDropdownOpen ? 'rotate-180 text-amber-500' : 'text-slate-300'
                }`} />
              </button>

              {/* Floating Dropdown Menu */}
              {profileDropdownOpen && (
                <div className={`absolute top-full mt-2 end-0 w-60 rounded-2xl p-2 border shadow-2xl backdrop-blur-2xl animate-scaleUp z-50 ${
                  theme === 'light'
                    ? 'bg-white/95 border-slate-200 text-slate-900 shadow-slate-300/80'
                    : 'bg-[#0a0f1d]/95 border-white/15 text-white shadow-black/90'
                }`}>
                  
                  {/* User Profile Header */}
                  <div className="p-2.5 mb-1.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-start space-y-0.5">
                    <div className="font-black text-xs text-amber-500">{user.name}</div>
                    <div className="text-[10px] text-slate-400 truncate">{user.email}</div>
                  </div>

                  {/* Option 1: لوحة التحكم (Dashboard) */}
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

                  {/* Option 2: تسجيل الخروج (Sign Out) */}
                  <button
                    onClick={() => {
                      setProfileDropdownOpen(false);
                      onLogout();
                    }}
                    className="w-full px-3 py-2.5 rounded-xl text-xs font-extrabold flex items-center gap-2.5 transition-all text-start text-red-400 hover:bg-red-500/15 hover:text-red-300 cursor-pointer"
                  >
                    <LogOut className="w-4 h-4 text-red-500" />
                    <span>{lang === 'ar' ? 'تسجيل الخروج' : 'Sign Out'}</span>
                  </button>

                </div>
              )}
            </div>
          )}

          {/* ── Language Switcher Button (AR / EN) ── */}
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

          {/* Mobile Hamburger Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className={`lg:hidden p-2 rounded-xl border ${
              theme === 'light' ? 'bg-slate-100 text-slate-800 border-slate-200' : 'bg-white/10 text-white border-white/10'
            }`}
          >
            <SlidersHorizontal className="w-4 h-4 text-amber-500" />
          </button>
        </div>

      </div>

      {/* Mobile Dropdown Menu */}
      {mobileMenuOpen && (
        <div className={`lg:hidden mt-2 p-3 rounded-2xl border shadow-2xl flex flex-col gap-1 animate-scaleUp max-w-7xl mx-auto ${
          theme === 'light' ? 'bg-white border-slate-200 text-slate-900' : 'bg-[#090d18]/95 border-amber-500/30 text-white'
        }`}>
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => {
                handleNavClick(item.id, item.targetId);
                setMobileMenuOpen(false);
              }}
              className={`w-full px-3.5 py-2.5 rounded-xl text-xs font-extrabold text-start transition-all flex items-center justify-between ${
                (activeTab !== 'dashboard' && activeSection === item.id)
                  ? 'bg-amber-500 text-slate-950 shadow-md'
                  : theme === 'light'
                    ? 'text-slate-700 hover:bg-slate-100'
                    : 'text-slate-300 hover:bg-white/10'
              }`}
            >
              <span>{item.label}</span>
              {(activeTab !== 'dashboard' && activeSection === item.id) && <Sparkles className="w-4 h-4 fill-slate-950" />}
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
