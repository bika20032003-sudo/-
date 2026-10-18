import React, { useState, useEffect, useRef, useCallback } from 'react';
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
import NewsDetailModal from './NewsDetailModal';
import { getSavedHeroCard, getSavedNewsPosts } from '../services/api';
import { resolveAsset } from '../utils/assets';

export default function Hero3D({ summaryData, setActiveTab, theme, user, onOpenGoogleAuth, lang = 'ar', tickerNews }) {
  const t = translations[lang] || translations.ar;
  const progressVal = summaryData?.overallProgress ?? 68.5;

  // Dynamic Hero Showcase Card State (Controllable from Dashboard - Preserved for Desktop)
  const [heroCard, setHeroCard] = useState(getSavedHeroCard);

  // Mobile News Post Feed State
  const [mobileNewsList, setMobileNewsList] = useState(getSavedNewsPosts);
  const [mobileNewsIdx, setMobileNewsIdx] = useState(0);
  const [isNewsFading, setIsNewsFading] = useState(false);
  const [selectedNewsPost, setSelectedNewsPost] = useState(null);

  useEffect(() => {
    const handleStorageChange = () => {
      setHeroCard(getSavedHeroCard());
      const updatedNews = getSavedNewsPosts();
      setMobileNewsList(updatedNews);
    };
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  // Smooth fade transition between news
  const goToMobileNews = useCallback((newIdx) => {
    if (isNewsFading || !mobileNewsList || mobileNewsList.length <= 1) return;
    setIsNewsFading(true);
    setTimeout(() => {
      setMobileNewsIdx(newIdx);
      setIsNewsFading(false);
    }, 220);
  }, [isNewsFading, mobileNewsList]);

  const nextMobileNews = useCallback(() => {
    if (!mobileNewsList || mobileNewsList.length === 0) return;
    const nextIdx = (mobileNewsIdx + 1) % mobileNewsList.length;
    goToMobileNews(nextIdx);
  }, [mobileNewsIdx, mobileNewsList, goToMobileNews]);

  const prevMobileNews = useCallback(() => {
    if (!mobileNewsList || mobileNewsList.length === 0) return;
    const prevIdx = (mobileNewsIdx - 1 + mobileNewsList.length) % mobileNewsList.length;
    goToMobileNews(prevIdx);
  }, [mobileNewsIdx, mobileNewsList, goToMobileNews]);

  // 6-second mobile news carousel auto progression with fade
  useEffect(() => {
    if (!mobileNewsList || mobileNewsList.length <= 1) return;
    const interval = setInterval(() => {
      nextMobileNews();
    }, 6000);
    return () => clearInterval(interval);
  }, [mobileNewsList, nextMobileNews]);

  const currentMobileNews = mobileNewsList[mobileNewsIdx] || mobileNewsList[0] || {};

  const onTouchStartHero = (e) => {
    setTouchEndHero(null);
    setTouchStartHero(e.targetTouches[0].clientX);
  };

  const onTouchMoveHero = (e) => {
    setTouchEndHero(e.targetTouches[0].clientX);
  };

  const onTouchEndHero = () => {
    if (!touchStartHero || !touchEndHero) return;
    const distance = touchStartHero - touchEndHero;
    if (distance > 45) {
      nextMobileNews();
    } else if (distance < -45) {
      prevMobileNews();
    }
  };

  // Circular progress calculation for SVG
  const radius = 38;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (progressVal / 100) * circumference;

  return (
    <section 
      id="hero-section" 
      className="relative min-h-[90vh] lg:min-h-screen w-full flex flex-col justify-between overflow-hidden bg-grid-pattern select-none pt-20 sm:pt-24 pb-4"
    >
      
      {/* ── 4K Cinematic Background Road Photo (Direct GPU Hardware Texture) ── */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        <picture className="w-full h-full block">
          {/* Mobile Portrait 9:16 Ultra-Sharp Image */}
          <source 
            media="(max-width: 768px)" 
            srcSet={resolveAsset('./road-hero-mobile.jpg')} 
          />
          {/* Desktop & Tablet 2.5K Panoramic Widescreen Image */}
          <source 
            media="(min-width: 769px)" 
            srcSet={resolveAsset('./hero-desert-road.jpg')} 
          />
          <img 
            src={resolveAsset('./hero-desert-road.jpg')} 
            alt="مشروع طريق أوباري - غات 4K" 
            fetchPriority="high"
            decoding="async"
            className="w-full h-full object-cover object-center"
            onError={(e) => {
              e.currentTarget.onerror = null;
              e.currentTarget.src = resolveAsset('./road-asphalt-paver.jpg');
            }}
          />
        </picture>

        {/* 3D Glowing Road Horizon Guide Trajectory */}
        <div className="absolute inset-0 pointer-events-none opacity-30">
          <div className="w-full h-full bg-gradient-to-t from-amber-500/10 via-transparent to-transparent" />
        </div>

        {/* Multi-Layer Gradient Overlays for High-Contrast Readability */}
        <div className={`hero-overlay-left absolute inset-0 ${
          theme === 'light'
            ? 'bg-gradient-to-r from-[#F8FAFC]/85 via-[#F8FAFC]/50 to-transparent'
            : 'bg-gradient-to-r from-[#06080E]/95 via-[#06080E]/70 to-transparent'
        }`} />
        {/* Mobile vertical contrast scrim to prevent text bleed over bright photos on phone */}
        <div className={`sm:hidden absolute inset-0 ${
          theme === 'light'
            ? 'bg-gradient-to-b from-[#F8FAFC]/90 via-[#F8FAFC]/50 to-[#F8FAFC]/95'
            : 'bg-gradient-to-b from-[#06080E]/90 via-[#06080E]/50 to-[#06080E]/95'
        }`} />
        <div className={`hero-overlay-top absolute inset-0 ${
          theme === 'light'
            ? 'bg-gradient-to-t from-[#F8FAFC] via-transparent to-[#F8FAFC]/25'
            : 'bg-gradient-to-t from-[#06080E] via-transparent to-[#06080E]/40'
        }`} />
        <div className={`absolute bottom-0 left-0 right-0 h-36 ${
          theme === 'light'
            ? 'bg-gradient-to-t from-[#F8FAFC] to-transparent'
            : 'bg-gradient-to-t from-[#06080E] to-transparent'
        }`} />
      </div>

      {/* ── Ambient Radial Glows (GPU-friendly zero-blur radial gradients) ── */}
      <div 
        className="absolute z-[1] rounded-full pointer-events-none opacity-60"
        style={{
          width: '420px', height: '420px',
          right: '5%', top: '10%',
          background: 'radial-gradient(circle, rgba(255,171,0,0.18) 0%, rgba(255,171,0,0.03) 50%, transparent 75%)',
        }}
      />
      <div 
        className="absolute z-[1] rounded-full pointer-events-none opacity-50"
        style={{
          width: '360px', height: '360px',
          left: '8%', bottom: '12%',
          background: 'radial-gradient(circle, rgba(0,245,212,0.12) 0%, transparent 70%)',
        }}
      />

      {/* ── Single Moving Live Marquee Ticker Directly Under Header ── */}
      <div className="w-full relative z-30 mb-2 sm:mb-4 select-none">
        <MarqueeTicker 
          variant="hero" 
          theme={theme} 
          lang={lang}
          direction={lang === 'ar' ? 'rtl' : 'ltr'} 
          items={tickerNews?.filter(n => n.active !== false)}
        />
      </div>

      {/* ── Main Hero Content ── */}
      <div className="relative z-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-10 w-full space-y-6 sm:space-y-10 my-auto">
        
        <div className="flex flex-col lg:flex-row items-center justify-between gap-6 sm:gap-10 lg:gap-16">
          
          {/* ── Right Text Column: Clean Government Hierarchy ── */}
          <div className="w-full lg:w-7/12 space-y-4 sm:space-y-6 animate-fadeIn text-start gsap-header">
            
            {/* Official Kicker */}
            <div className="flex items-center gap-2 text-[11px] sm:text-sm font-bold text-amber-500">
              <span className="w-2 h-2 rounded-full bg-amber-500 flex-shrink-0" />
              <span>{lang === 'ar' ? 'دولة ليبيا • جهاز تنفيذ مشروعات المواصلات' : 'State of Libya • Transportation Projects Authority'}</span>
            </div>

            {/* 4K Hero Title */}
            <div className="space-y-2 sm:space-y-4">
              <h1 
                style={{ fontFamily: "'Noto Kufi Arabic', 'Noto Sans Arabic', sans-serif" }}
                className={`text-xl xs:text-2xl sm:text-5xl lg:text-6xl font-black leading-tight sm:leading-snug ${
                  theme === 'light' ? 'text-slate-950' : 'text-white'
                }`}
              >
                <span className="block mb-0.5 sm:mb-2 text-slate-900 dark:text-white text-base xs:text-xl sm:text-4xl lg:text-5xl">{t.heroMainTitle1}</span>
                <span 
                  style={{ fontFamily: "'Noto Kufi Arabic', 'Noto Sans Arabic', sans-serif" }}
                  className="inline-block text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-amber-300 to-amber-500 px-1 pe-2 pb-1.5 pt-0.5 text-2xl xs:text-3xl sm:text-5xl lg:text-6xl overflow-visible font-black"
                >
                  {t.heroMainTitle2}
                </span>
                <span className="inline-block text-sm xs:text-base sm:text-3xl font-light text-slate-500 dark:text-white/85 ms-1.5 sm:ms-3">
                  (360 كم)
                </span>
              </h1>
              
              <p className={`text-xs xs:text-sm sm:text-lg lg:text-xl font-bold leading-relaxed ${
                theme === 'light' ? 'text-slate-800' : 'text-white'
              }`}>
                {t.heroSubtitle}
              </p>

              <p className={`text-[11px] xs:text-xs sm:text-sm lg:text-base max-w-xl leading-relaxed font-normal ${
                theme === 'light' ? 'text-slate-700' : 'text-white'
              }`}>
                {t.heroDesc}
              </p>
            </div>

            {/* Action Buttons */}
            <div className="pt-0.5 sm:pt-2 flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 sm:gap-3">
              {/* Primary Action Button */}
              <button
                onClick={() => {
                  const el = document.getElementById('projects-section');
                  if (el) el.scrollIntoView({ behavior: 'smooth' });
                }}
                className="w-full sm:w-auto px-5 sm:px-7 py-2.5 sm:py-3.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs sm:text-sm transition-all shadow-lg shadow-amber-500/20 cursor-pointer text-center active:scale-98"
              >
                {lang === 'ar' ? 'استكشف المشاريع' : 'Explore Projects'}
              </button>
            </div>

          </div>

          {/* ── Left Column: News Post Card on Mobile / Desktop Showcase Card with GPU Hover ── */}
          <div 
            className="w-full lg:w-5/12 flex flex-col items-center lg:items-end animate-scaleUp gsap-scale-in"
          >
            
            {/* 1. MOBILE ONLY: News Post Card (تبديل البطاقة بالهاتف إلى نظام بوست الأخبار الميدانية) */}
            <div 
              className="w-full max-w-md block lg:hidden"
              onTouchStart={onTouchStartHero}
              onTouchMove={onTouchMoveHero}
              onTouchEnd={onTouchEndHero}
            >
              <div 
                onClick={() => setSelectedNewsPost(currentMobileNews)}
                className={`w-full rounded-2xl overflow-hidden border shadow-xl text-start transition-all duration-300 cursor-pointer active:scale-[0.99] ${
                  theme === 'light'
                    ? 'bg-white border-amber-300/80 shadow-slate-200/90 text-slate-900'
                    : 'bg-[#090e1a]/95 border-amber-500/30 shadow-black/90 text-white'
                }`}
              >
                
                {/* Mobile Post Header: Agency Brand + Tag */}
                <div className="px-3.5 py-2.5 flex items-center justify-between border-b border-slate-100 dark:border-white/10 gap-2">
                  <div className="flex items-center gap-2 min-w-0 flex-1">
                    <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-amber-400 to-amber-600 p-[1px] shadow-sm flex-shrink-0">
                      <img 
                        src={resolveAsset('./logo-agency.jpg')} 
                        alt="جهاز تنفيذ مشروعات المواصلات" 
                        className="w-full h-full object-contain rounded-[10px] bg-white"
                        onError={(e) => { e.currentTarget.style.display = 'none'; }}
                      />
                    </div>
                    <div className="text-start leading-tight min-w-0 flex-1 overflow-hidden">
                      <div className="flex items-center gap-1 min-w-0">
                        <span className="font-black text-xs truncate">
                          {lang === 'ar' ? 'مشروعات المواصلات' : 'Transport Projects'}
                        </span>
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
                      </div>
                      <span className="text-[10px] text-slate-400 font-medium truncate block">
                        {lang === 'ar' ? (currentMobileNews.author || 'المكتب الإعلامي') : (currentMobileNews.authorEn || 'Media Office')} • {lang === 'ar' ? (currentMobileNews.timeAgo || 'مباشر') : (currentMobileNews.timeAgoEn || 'Live')}
                      </span>
                    </div>
                  </div>

                  <span className="text-[10px] font-black px-2 py-0.5 rounded-lg bg-amber-500/15 text-amber-500 border border-amber-500/30 shrink-0 whitespace-nowrap">
                    {lang === 'ar' ? 'المستجدات الميدانية' : 'Field News'}
                  </span>
                </div>

                {/* Mobile Post Photo with Controls */}
                <div className="h-44 xs:h-48 relative overflow-hidden group bg-slate-950">
                  <div className={`w-full h-full relative transition-all duration-300 ease-in-out ${
                    isNewsFading ? 'opacity-0 scale-[1.02]' : 'opacity-100 scale-100'
                  }`}>
                    <img 
                      src={resolveAsset(currentMobileNews.image || './road-asphalt-paver.jpg')} 
                      alt={currentMobileNews.title || 'أخبار طريق أوباري غات'} 
                      className="w-full h-full object-cover transition-transform duration-500"
                      onError={(e) => {
                        e.currentTarget.onerror = null;
                        e.currentTarget.src = resolveAsset('./road-asphalt-paver.jpg');
                      }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent" />
                  </div>



                  {/* Navigation Arrows for Mobile News */}
                  <button
                    type="button"
                    onClick={(e) => { e.stopPropagation(); prevMobileNews(); }}
                    className="absolute top-1/2 start-2 -translate-y-1/2 w-7 h-7 rounded-full bg-black/60 hover:bg-black/80 text-white flex items-center justify-center text-xs border border-white/20 active:scale-90 z-20 cursor-pointer"
                    aria-label="Previous"
                  >
                    ‹
                  </button>
                  <button
                    type="button"
                    onClick={(e) => { e.stopPropagation(); nextMobileNews(); }}
                    className="absolute top-1/2 end-2 -translate-y-1/2 w-7 h-7 rounded-full bg-black/60 hover:bg-black/80 text-white flex items-center justify-center text-xs border border-white/20 active:scale-90 z-20 cursor-pointer"
                    aria-label="Next"
                  >
                    ›
                  </button>

                  {/* Slide index & Location pill */}
                  <div className="absolute bottom-2 start-2.5 end-2.5 flex items-center justify-between text-white text-[10px] gap-2 pointer-events-none z-10">
                    <span className="px-2 py-0.5 rounded-md bg-black/70 font-mono font-bold text-amber-400 border border-white/10 truncate min-w-0">
                      {lang === 'ar' ? (currentMobileNews.location || 'طريق أوباري - غات') : (currentMobileNews.locationEn || 'Ubari - Ghat Highway')}
                    </span>
                    <span className="font-mono bg-black/60 px-1.5 py-0.5 rounded font-bold shrink-0 whitespace-nowrap">
                      {mobileNewsIdx + 1} / {mobileNewsList.length}
                    </span>
                  </div>
                </div>

                {/* Mobile Post Text Content with Fade */}
                <div className="p-3.5 space-y-2">
                  <div className={`space-y-2 transition-all duration-300 ease-in-out ${
                    isNewsFading ? 'opacity-0 translate-y-0.5' : 'opacity-100 translate-y-0'
                  }`}>
                    <h3 className="font-black text-xs xs:text-sm leading-snug line-clamp-2">
                      {lang === 'ar' ? currentMobileNews.title : (currentMobileNews.titleEn || currentMobileNews.title)}
                    </h3>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed font-normal">
                      {lang === 'ar' ? currentMobileNews.desc : (currentMobileNews.descEn || currentMobileNews.desc)}
                    </p>
                  </div>

                  {/* Dots Indicators + Full Story Prompt */}
                  <div className="flex items-center justify-between pt-1.5 border-t border-slate-100 dark:border-white/10 text-[10px]">
                    <div className="flex items-center gap-1">
                      {mobileNewsList.slice(0, 6).map((_, i) => (
                        <button
                          key={i}
                          type="button"
                          onClick={(e) => { e.stopPropagation(); goToMobileNews(i); }}
                          className={`h-1.5 rounded-full transition-all cursor-pointer ${
                            i === mobileNewsIdx ? 'w-4 bg-amber-500' : 'w-1.5 bg-slate-300 dark:bg-white/20'
                          }`}
                          aria-label={`News ${i + 1}`}
                        />
                      ))}
                    </div>
                    <span className="text-amber-500 font-black flex items-center gap-1 hover:underline">
                      <span>{lang === 'ar' ? 'عرض الخبر بالكامل ↗' : 'View Full Post ↗'}</span>
                    </span>
                  </div>
                </div>

              </div>
            </div>

            {/* 2. DESKTOP ONLY: Preserved 100% of Desktop Technical Showcase Card */}
            <div 
              onClick={() => setSelectedNewsPost(currentMobileNews || heroCard)}
              className={`hidden lg:block w-full max-w-md rounded-2xl sm:rounded-3xl overflow-hidden border shadow-2xl text-start glass-card-hover cursor-pointer ${
              theme === 'light' 
                ? 'bg-white/95 border-slate-200/90 text-slate-900 shadow-slate-200/80' 
                : 'bg-[#0b101e]/95 border-white/15 text-white shadow-black/80'
            }`}>
              
              {/* Photo with clean caption */}
              <div 
                className="h-44 xs:h-52 sm:h-64 relative overflow-hidden group cursor-pointer"
                data-cursor-image="true"
                data-cursor-label={lang === 'ar' ? 'معاينة 4K ↗' : 'View 4K ↗'}
              >
                <img 
                  src={resolveAsset(heroCard.image || "./road-asphalt-paver.jpg")} 
                  alt={heroCard.title || "أعمال رصف وتأهيل طريق أوباري غات"} 
                  className="w-full h-full object-cover photo-hover-zoom group-hover:scale-110 transition-transform duration-700 ease-out"
                  onError={(e) => {
                    e.currentTarget.onerror = null;
                    e.currentTarget.src = resolveAsset('./road-asphalt-paver.jpg');
                  }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/25 to-transparent transition-opacity duration-300 group-hover:opacity-80" />
                
                <div className="absolute bottom-3 sm:bottom-4 start-3.5 sm:start-5 end-3.5 sm:end-5 text-white">
                  <span className="text-[10px] sm:text-[11px] font-bold text-amber-400 block mb-0.5 sm:mb-1">
                    {lang === 'ar' ? (heroCard.tag || 'الموقف التنفيذي الميداني المعتمد') : (heroCard.tagEn || heroCard.tag || 'Field Operations Status')}
                  </span>
                  <h3 className="text-sm sm:text-lg font-black leading-snug">
                    {lang === 'ar' ? (heroCard.title || 'أعمال رصف وتأهيل مسار 360 كم') : (heroCard.titleEn || heroCard.title || '360km Highway Paving Operations')}
                  </h3>
                </div>
              </div>

              {/* Clean metrics content */}
              <div className="p-4 sm:p-6 space-y-3 sm:space-y-4">
                
                {/* Progress Bar */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs font-bold">
                    <span className={theme === 'light' ? 'text-slate-600' : 'text-slate-400'}>
                      {lang === 'ar' ? 'نسبة الإنجاز الإجمالي الفعلي:' : 'Overall Progress:'}
                    </span>
                    <span className="font-mono text-sm sm:text-base font-black text-amber-500">
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
                <div className={`grid grid-cols-2 gap-2 sm:gap-3 pt-3 border-t text-[11px] sm:text-xs ${
                  theme === 'light' ? 'border-slate-100' : 'border-white/10'
                }`}>
                  <div>
                    <span className="text-[10px] text-slate-400 block">
                      {lang === 'ar' ? 'المسافة الإجمالية:' : 'Total Distance:'}
                    </span>
                    <strong className="font-bold text-slate-800 dark:text-slate-100">
                      {lang === 'ar' ? (heroCard.distance || '360 كيلومتراً') : (heroCard.distanceEn || heroCard.distance || '360 km')}
                    </strong>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block">
                      {lang === 'ar' ? 'الجهة المشرفة:' : 'Supervising Agency:'}
                    </span>
                    <strong className="font-bold text-slate-800 dark:text-slate-100 truncate block">
                      {lang === 'ar' ? (heroCard.supervisor || 'مشروعات المواصلات') : (heroCard.supervisorEn || heroCard.supervisor || 'Transport Projects')}
                    </strong>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block">
                      {lang === 'ar' ? 'تاريخ البدء المعتمد:' : 'Start Date:'}
                    </span>
                    <strong className="font-mono font-bold text-slate-800 dark:text-slate-100">
                      {lang === 'ar' ? (heroCard.startDate || 'يناير 2025') : (heroCard.startDateEn || heroCard.startDate || 'Jan 2025')}
                    </strong>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block">
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

      {/* ── Full News Post Modal (يظهر الخبر بالكامل عند النقر) ── */}
      <NewsDetailModal 
        post={selectedNewsPost}
        isOpen={Boolean(selectedNewsPost)}
        onClose={() => setSelectedNewsPost(null)}
        theme={theme}
        lang={lang}
      />

    </section>
  );
}
