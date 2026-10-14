import React, { useState, useEffect, useRef } from 'react';
import { 
  ArrowUpRight, 
  Zap, 
  ShieldCheck, 
  MapPin, 
  Activity, 
  Compass, 
  Layers, 
  Flame, 
  Calendar, 
  CheckCircle2, 
  Users, 
  Sun,
  Building2,
  Clock,
  Crown
} from 'lucide-react';
import { translations } from '../i18n/translations';
import MarqueeTicker from './MarqueeTicker';
import { getSavedHeroCard } from '../services/api';

export default function Hero3D({ summaryData, setActiveTab, theme, user, onOpenGoogleAuth, lang = 'ar', tickerNews }) {
  const t = translations[lang] || translations.ar;
  const progressVal = summaryData?.overallProgress ?? 68.5;

  // Dynamic Hero Showcase Card State (Controllable from Dashboard)
  const [heroCard, setHeroCard] = useState(getSavedHeroCard);

  useEffect(() => {
    const handleStorageChange = () => {
      setHeroCard(getSavedHeroCard());
    };
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  // Circular progress calculation for SVG
  const radius = 38;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (progressVal / 100) * circumference;

  // ── High-Performance Parallax Engine (Zero React Re-renders & Battery-Safe) ──
  const heroRef = useRef(null);
  const bgImageRef = useRef(null);
  const cardTiltRef = useRef(null);

  // High-Performance Parallax Engine (Zero Layout Thrashing & Scoped)

  useEffect(() => {
    // Disable heavy parallax only on narrow mobile viewports (< 768px)
    if (window.innerWidth < 768) return;

    let animFrame = null;
    let targetX = 0;
    let targetY = 0;
    let currentX = 0;
    let currentY = 0;
    let isTicking = false;
    let isVisible = true;

    // Pause parallax loop completely when hero is out of viewport
    const observer = new IntersectionObserver(([entry]) => {
      isVisible = entry.isIntersecting;
      if (!isVisible && animFrame) {
        cancelAnimationFrame(animFrame);
        isTicking = false;
      }
    }, { threshold: 0.05 });

    if (heroRef.current) observer.observe(heroRef.current);

    const updateTransforms = () => {
      if (!isVisible) {
        isTicking = false;
        return;
      }

      // Smooth lerp
      currentX += (targetX - currentX) * 0.12;
      currentY += (targetY - currentY) * 0.12;

      if (bgImageRef.current) {
        bgImageRef.current.style.transform = `translate3d(${currentX * -14}px, ${currentY * -10}px, 0) scale(1.06)`;
      }

      // Continue animating while moving
      if (Math.abs(targetX - currentX) > 0.005 || Math.abs(targetY - currentY) > 0.005) {
        animFrame = requestAnimationFrame(updateTransforms);
      } else {
        isTicking = false;
      }
    };

    const handleMouseMove = (e) => {
      if (!isVisible) return;

      const halfW = window.innerWidth / 2;
      const halfH = window.innerHeight / 2;
      targetX = Math.max(-1, Math.min(1, (e.clientX - halfW) / halfW));
      targetY = Math.max(-1, Math.min(1, (e.clientY - halfH) / halfH));

      if (!isTicking) {
        isTicking = true;
        animFrame = requestAnimationFrame(updateTransforms);
      }
    };

    const heroEl = heroRef.current;
    if (heroEl) {
      heroEl.addEventListener('pointermove', handleMouseMove, { passive: true });
    }

    return () => {
      if (heroEl) heroEl.removeEventListener('pointermove', handleMouseMove);
      if (animFrame) cancelAnimationFrame(animFrame);
      observer.disconnect();
    };
  }, []);

  return (
    <section 
      ref={heroRef}
      id="hero-section" 
      className="relative min-h-[90vh] lg:min-h-screen w-full flex flex-col justify-between overflow-hidden bg-grid-pattern select-none pt-20 sm:pt-24 pb-4"
    >
      
      {/* ── 4K Cinematic Background Road Photo with GPU Parallax ── */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        <img 
          ref={bgImageRef}
          src="/road-aerial-highway.jpg" 
          alt="أعمال رصف وصيانة طريق أوباري غات الميدانية 4K" 
          fetchpriority="high"
          decoding="async"
          className="w-full h-full object-cover object-center will-change-transform"
          style={{ 
            transform: 'scale(1.06)',
            filter: theme === 'light' 
              ? 'brightness(1.04) saturate(1.1) contrast(1.02)' 
              : 'brightness(0.85) saturate(1.15) contrast(1.08)' 
          }}
        />

        {/* 3D Glowing Road Horizon Guide Trajectory */}
        <div className="absolute inset-0 pointer-events-none opacity-30">
          <div className="w-full h-full bg-gradient-to-t from-amber-500/10 via-transparent to-transparent" />
        </div>

        {/* Multi-Layer Gradient Overlays for High-Contrast Readability */}
        <div className={`hero-overlay-left absolute inset-0 ${
          theme === 'light'
            ? 'bg-gradient-to-r from-white/95 via-white/85 to-white/30'
            : 'bg-gradient-to-r from-[#06080E]/95 via-[#06080E]/70 to-transparent'
        }`} />
        <div className={`hero-overlay-top absolute inset-0 ${
          theme === 'light'
            ? 'bg-gradient-to-t from-[#F8FAFC]/95 via-transparent to-white/50'
            : 'bg-gradient-to-t from-[#06080E] via-transparent to-[#06080E]/40'
        }`} />
        <div className={`absolute bottom-0 left-0 right-0 h-44 ${
          theme === 'light'
            ? 'bg-gradient-to-t from-[#F8FAFC] to-transparent'
            : 'bg-gradient-to-t from-[#06080E] to-transparent'
        }`} />
      </div>

      {/* ── Ambient Radial Glows (Optimized blur for smooth GPU rendering) ── */}
      <div 
        className="absolute z-[1] rounded-full pointer-events-none blur-2xl opacity-60"
        style={{
          width: '420px', height: '420px',
          right: '5%', top: '10%',
          background: 'radial-gradient(circle, rgba(255,171,0,0.18) 0%, rgba(255,171,0,0.03) 50%, transparent 75%)',
        }}
      />
      <div 
        className="absolute z-[1] rounded-full pointer-events-none blur-2xl opacity-50"
        style={{
          width: '360px', height: '360px',
          left: '8%', bottom: '12%',
          background: 'radial-gradient(circle, rgba(0,245,212,0.12) 0%, transparent 70%)',
        }}
      />

      {/* ── Single Moving Live Marquee Ticker Directly Under Header ── */}
      <div className="w-full relative z-30 mb-3 sm:mb-5 select-none">
        <MarqueeTicker 
          variant="hero" 
          theme={theme} 
          lang={lang}
          direction={lang === 'ar' ? 'rtl' : 'ltr'} 
          items={tickerNews?.filter(n => n.active !== false)}
        />
      </div>

      {/* ── Main Hero Content ── */}
      <div className="relative z-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-10 w-full space-y-10 my-auto">
        
        <div className="flex flex-col lg:flex-row items-center justify-between gap-10 lg:gap-16">
          
          {/* ── Right Text Column: Clean Government Hierarchy ── */}
          <div className="w-full lg:w-7/12 space-y-6 animate-fadeIn text-start gsap-header">
            
            {/* Official Kicker */}
            <div className="flex items-center gap-2 text-xs sm:text-sm font-bold text-amber-500">
              <span className="w-2 h-2 rounded-full bg-amber-500 flex-shrink-0" />
              <span>{lang === 'ar' ? 'دولة ليبيا • جهاز تنفيذ مشروعات المواصلات' : 'State of Libya • Transportation Projects Authority'}</span>
            </div>

            {/* 4K Hero Title */}
            <div className="space-y-4">
              <h1 className={`text-3xl sm:text-5xl lg:text-6xl font-black leading-snug sm:leading-snug ${
                theme === 'light' ? 'text-slate-950' : 'text-white'
              }`}>
                <span className="block mb-2 text-slate-900 dark:text-white">{t.heroMainTitle1}</span>
                <span className="inline-block text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-amber-300 to-amber-500 py-1">
                  {t.heroMainTitle2}
                </span>
                <span className="inline-block text-2xl sm:text-4xl font-light text-slate-400 ms-3">
                  (360 كم)
                </span>
              </h1>
              
              <p className={`text-base sm:text-xl font-semibold leading-relaxed ${
                theme === 'light' ? 'text-slate-800' : 'text-slate-200'
              }`}>
                {t.heroSubtitle}
              </p>

              <p className={`text-sm sm:text-base max-w-xl leading-relaxed font-normal ${
                theme === 'light' ? 'text-slate-600' : 'text-slate-400'
              }`}>
                {t.heroDesc}
              </p>
            </div>

            {/* Action Buttons */}
            <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center gap-3.5">
              {/* Primary Action Button */}
              <button
                onClick={() => {
                  const el = document.getElementById('projects-section');
                  if (el) el.scrollIntoView({ behavior: 'smooth' });
                }}
                className="w-full sm:w-auto px-7 py-3.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-sm transition-colors shadow-lg shadow-amber-500/20 cursor-pointer text-center"
              >
                {lang === 'ar' ? 'استكشف المشاريع' : 'Explore Projects'}
              </button>
            </div>

          </div>

          {/* ── Left Column: Dignified Project Showcase Card with GPU Hover ── */}
          <div 
            ref={cardTiltRef}
            className="w-full lg:w-5/12 flex flex-col items-center lg:items-end animate-scaleUp gsap-scale-in"
          >
            
            <div className={`w-full max-w-md rounded-3xl overflow-hidden border shadow-2xl text-start glass-card-hover cursor-pointer ${
              theme === 'light' 
                ? 'bg-white/95 border-slate-200/90 text-slate-900 shadow-slate-200/80' 
                : 'bg-[#0b101e]/95 border-white/15 text-white shadow-black/80'
            }`}>
              
              {/* Photo with clean caption */}
              <div 
                className="h-56 sm:h-64 relative overflow-hidden group cursor-pointer"
                data-cursor-image="true"
                data-cursor-label={lang === 'ar' ? 'معاينة 4K ↗' : 'View 4K ↗'}
              >
                <img 
                  src={heroCard.image || "/road-asphalt-paver.jpg"} 
                  alt={heroCard.title || "أعمال رصف وتأهيل طريق أوباري غات"} 
                  className="w-full h-full object-cover photo-hover-zoom group-hover:scale-110 transition-transform duration-700 ease-out"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/25 to-transparent transition-opacity duration-300 group-hover:opacity-80" />
                
                <div className="absolute bottom-4 start-5 end-5 text-white">
                  <span className="text-[11px] font-bold text-amber-400 block mb-1">
                    {lang === 'ar' ? (heroCard.tag || 'الموقف التنفيذي الميداني المعتمد') : (heroCard.tagEn || heroCard.tag || 'Field Operations Status')}
                  </span>
                  <h3 className="text-base sm:text-lg font-black leading-snug">
                    {lang === 'ar' ? (heroCard.title || 'أعمال رصف وتأهيل مسار 360 كم') : (heroCard.titleEn || heroCard.title || '360km Highway Paving Operations')}
                  </h3>
                </div>
              </div>

              {/* Clean metrics content */}
              <div className="p-5 sm:p-6 space-y-4">
                
                {/* Progress Bar */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs font-bold">
                    <span className={theme === 'light' ? 'text-slate-600' : 'text-slate-400'}>
                      {lang === 'ar' ? 'نسبة الإنجاز الإجمالي الفعلي:' : 'Overall Progress:'}
                    </span>
                    <span className="font-mono text-base font-black text-amber-500">
                      {heroCard.progress ?? progressVal}%
                    </span>
                  </div>
                  <div className="w-full bg-slate-200 dark:bg-white/10 rounded-full h-2 overflow-hidden">
                    <div 
                      className="bg-amber-500 h-full rounded-full transition-all duration-1000" 
                      style={{ width: `${heroCard.progress ?? progressVal}%` }} 
                    />
                  </div>
                </div>

                {/* 4 Clean Key Data Items */}
                <div className={`grid grid-cols-2 gap-3 pt-3 border-t text-xs ${
                  theme === 'light' ? 'border-slate-100' : 'border-white/10'
                }`}>
                  <div>
                    <span className="text-[11px] text-slate-400 block">
                      {lang === 'ar' ? 'المسافة الإجمالية:' : 'Total Distance:'}
                    </span>
                    <strong className="font-bold text-slate-800 dark:text-slate-100">
                      {lang === 'ar' ? (heroCard.distance || '360 كيلومتراً') : (heroCard.distanceEn || heroCard.distance || '360 km')}
                    </strong>
                  </div>
                  <div>
                    <span className="text-[11px] text-slate-400 block">
                      {lang === 'ar' ? 'الجهة المشرفة:' : 'Supervising Agency:'}
                    </span>
                    <strong className="font-bold text-slate-800 dark:text-slate-100">
                      {lang === 'ar' ? (heroCard.supervisor || 'مشروعات المواصلات') : (heroCard.supervisorEn || heroCard.supervisor || 'Transport Projects')}
                    </strong>
                  </div>
                  <div>
                    <span className="text-[11px] text-slate-400 block">
                      {lang === 'ar' ? 'تاريخ البدء المعتمد:' : 'Start Date:'}
                    </span>
                    <strong className="font-mono font-bold text-slate-800 dark:text-slate-100">
                      {lang === 'ar' ? (heroCard.startDate || 'يناير 2025') : (heroCard.startDateEn || heroCard.startDate || 'Jan 2025')}
                    </strong>
                  </div>
                  <div>
                    <span className="text-[11px] text-slate-400 block">
                      {lang === 'ar' ? 'الموعد المخطط للإنجاز:' : 'Target Completion:'}
                    </span>
                    <strong className="font-mono font-bold text-emerald-600 dark:text-emerald-400">
                      {lang === 'ar' ? (heroCard.completionDate || 'ديسمبر 2026') : (heroCard.completionDateEn || heroCard.completionDate || 'Dec 2026')}
                    </strong>
                  </div>
                </div>

              </div>

            </div>

          </div>

        </div>

      </div>



    </section>
  );
}
