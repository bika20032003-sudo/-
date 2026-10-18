import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X } from 'lucide-react';
import { ASSETS } from '../utils/assets';
import { useProjectData } from '../context/ProjectDataContext';

const NAV_LINKS = [
  { to: '/', label: 'الرئيسية' },
  { to: '/progress', label: 'نسب الإنجاز' },
  { to: '/news', label: 'الأخبار والتقارير' }
];

export default function SiteHeader() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const { isAuthenticated } = useProjectData();
  const location = useLocation();
  const isHome = location.pathname === '/';

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 60);
    };
    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const isTransparent = isHome && !scrolled;

  return (
    <header
      className={`fixed top-0 right-0 left-0 z-50 transition-all duration-500 ${
        isTransparent
          ? 'bg-transparent text-white'
          : 'border-b border-border bg-background/90 text-foreground backdrop-blur-md shadow-sm'
      }`}
    >
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-5 md:h-20 md:px-8">
        {/* Brand / Logo */}
        <Link to="/" className="flex items-center gap-3 group">
          <span className="block h-11 w-11 overflow-hidden rounded-full bg-white shadow-md ring-1 ring-black/10 md:h-12 md:w-12 shrink-0 transition-transform group-hover:scale-105">
            <img
              src={ASSETS.logo}
              alt="شعار جهاز تنفيذ مشروعات المواصلات"
              className="h-full w-full object-cover"
            />
          </span>
          <span className="leading-tight">
            <span
              className={`block font-display text-sm font-bold md:text-base ${
                isTransparent ? 'text-white' : 'text-foreground'
              }`}
            >
              جهاز تنفيذ مشروعات المواصلات
            </span>
            <span
              className={`block text-[10px] tracking-[0.18em] ${
                isTransparent ? 'text-white/70' : 'text-muted-foreground'
              }`}
            >
              طريق أوبارﻱ — غات
            </span>
          </span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden items-center gap-9 md:flex">
          {NAV_LINKS.map((item) => {
            const isActive = location.pathname === item.to;
            return (
              <Link
                key={item.to}
                to={item.to}
                className={`text-[13px] font-medium transition-colors ${
                  isTransparent
                    ? 'text-white/85 hover:text-white'
                    : 'text-foreground/75 hover:text-gold'
                } ${isActive && !isTransparent ? 'text-gold font-bold' : ''} ${
                  isActive && isTransparent ? 'text-white font-bold' : ''
                }`}
              >
                {item.label}
              </Link>
            );
          })}

          <a
            href="https://bika20032003-sudo.github.io/-/road/"
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-full px-4 py-2 text-[13px] font-bold text-orange-500 border border-orange-500/40 hover:bg-orange-500/10 transition-colors shadow-sm"
          >
            بداية الرحلة
          </a>

          <Link
            to={isAuthenticated ? '/dashboard' : '/login'}
            className={`rounded-full px-5 py-2 text-[13px] font-medium transition-colors ${
              isTransparent
                ? 'border border-white/40 text-white hover:bg-white/10'
                : 'border border-foreground/20 hover:border-gold hover:text-gold'
            }`}
          >
            {isAuthenticated ? 'لوحة التحكم' : 'دخول المدير'}
          </Link>
        </nav>

        {/* Mobile Hamburger Toggle */}
        <button
          type="button"
          className={`${isTransparent ? 'text-white' : 'text-foreground'} md:hidden p-2 rounded-lg hover:bg-white/10`}
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label="القائمة"
        >
          {mobileOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileOpen && (
        <div className="border-t border-border bg-background px-5 py-5 text-foreground md:hidden shadow-xl animate-in fade-in-0 duration-200">
          <div className="flex flex-col gap-1">
            {NAV_LINKS.map((item) => (
              <Link
                key={item.to}
                to={item.to}
                onClick={() => setMobileOpen(false)}
                className="rounded-lg px-3 py-3 text-sm font-medium text-foreground/80 hover:bg-secondary transition-colors"
              >
                {item.label}
              </Link>
            ))}
            <a
              href="https://bika20032003-sudo.github.io/-/road/"
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => setMobileOpen(false)}
              className="mt-2 rounded-full border border-orange-500/40 px-5 py-3 text-center text-sm font-bold text-orange-500 hover:bg-orange-500/10 transition-colors"
            >
              بداية الرحلة
            </a>
            <Link
              to={isAuthenticated ? '/dashboard' : '/login'}
              onClick={() => setMobileOpen(false)}
              className="mt-2 rounded-full border border-foreground/20 px-5 py-3 text-center text-sm font-medium hover:border-gold hover:text-gold transition-colors"
            >
              {isAuthenticated ? 'لوحة التحكم' : 'دخول المدير'}
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
