import React, { useState, useEffect } from 'react';
import { Layers, Sun, ShieldCheck, Route, MapPin, Navigation, BookOpen } from 'lucide-react';
import { translations } from '../i18n/translations';

export default function UbariCityShowcase({ theme, lang = 'ar' }) {
  const t = translations[lang] || translations.ar;

  const originalFeatures = [
    {
      id: 0,
      title: t.ubariLakesTitle,
      desc: t.ubariLakesDesc,
      icon: Layers,
      color: 'text-cyan-600 dark:text-cyan-400',
      iconColor: 'text-cyan-500',
      iconBg: 'bg-cyan-500/15 border-cyan-500/30',
      badge: lang === 'ar' ? 'المواصفات الفنية للأسفلت' : 'Asphalt Specs'
    },
    {
      id: 1,
      title: t.ubariTransportTitle,
      desc: t.ubariTransportDesc,
      icon: Sun,
      color: 'text-amber-600 dark:text-amber-400',
      iconColor: 'text-amber-500',
      iconBg: 'bg-amber-500/15 border-amber-500/30',
      badge: lang === 'ar' ? 'الإنارة بالطاقة الشمسية' : 'Solar Lighting'
    },
    {
      id: 2,
      title: t.ubariEnergyTitle,
      desc: t.ubariEnergyDesc,
      icon: ShieldCheck,
      color: 'text-emerald-600 dark:text-emerald-400',
      iconColor: 'text-emerald-500',
      iconBg: 'bg-emerald-500/15 border-emerald-500/30',
      badge: lang === 'ar' ? 'تصريف السيول والعبارات' : 'Drainage & Culverts'
    },
    {
      id: 3,
      title: t.ubariHeritageTitle,
      desc: t.ubariHeritageDesc,
      icon: Route,
      color: 'text-amber-600 dark:text-amber-400',
      iconColor: 'text-amber-500',
      iconBg: 'bg-amber-500/15 border-amber-500/30',
      badge: lang === 'ar' ? 'الربط الاستراتيجي والتجاري' : 'Strategic Link'
    }
  ];

  const [activeFeatureIdx, setActiveFeatureIdx] = useState(0);
  const [fadeActive, setFadeActive] = useState(true);

  // 5-second automatic progression with fade animation (المدة خمسة ثواني مع انميشن تلاشي)
  useEffect(() => {
    const interval = setInterval(() => {
      setFadeActive(false);
      setTimeout(() => {
        setActiveFeatureIdx(prev => (prev + 1) % originalFeatures.length);
        setFadeActive(true);
      }, 350);
    }, 5000);
    return () => clearInterval(interval);
  }, [originalFeatures.length]);

  const currentFeature = originalFeatures[activeFeatureIdx];
  const CurrentIcon = currentFeature.icon;

  return (
    <section className="px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto animate-fadeIn select-none">
      
      {/* ── 2026 4K Luxury Road Project Showcase Card ── */}
      <div className={`p-4 xs:p-6 sm:p-10 rounded-2xl sm:rounded-[32px] border shadow-2xl space-y-5 sm:space-y-8 relative overflow-hidden transition-all ${
        theme === 'light'
          ? 'bg-gradient-to-br from-white via-amber-50/40 to-white border-amber-200/90 text-slate-900 shadow-slate-200/90'
          : 'bg-gradient-to-br from-[#0c1222]/95 via-[#0f172a]/95 to-[#0c1222]/95 border-amber-500/25 text-white shadow-black/90'
      }`}>
        
        {/* Ambient Top Glow Orbs (GPU-friendly zero-blur) */}
        <div 
          className="absolute -top-24 -right-24 w-72 h-72 rounded-full pointer-events-none opacity-40"
          style={{ background: 'radial-gradient(circle, rgba(255,171,0,0.3) 0%, transparent 70%)' }}
        />
        <div 
          className="absolute -bottom-24 -left-24 w-72 h-72 rounded-full pointer-events-none opacity-30"
          style={{ background: 'radial-gradient(circle, rgba(0,245,212,0.2) 0%, transparent 70%)' }}
        />

        {/* Title Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 border-b pb-4 sm:pb-6 border-slate-200 dark:border-white/10 relative z-10">
          <div className="flex items-center gap-3 sm:gap-4">
            <div className="w-11 h-11 sm:w-14 sm:h-14 rounded-xl sm:rounded-2xl bg-gradient-to-br from-amber-400 via-amber-500 to-amber-600 p-[1.5px] shadow-lg shadow-amber-500/25 flex-shrink-0">
              <div className="w-full h-full rounded-[10px] sm:rounded-[14px] bg-[#0c1220] flex items-center justify-center text-amber-400">
                <Navigation className="w-5 h-5 sm:w-7 sm:h-7 animate-float" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2 sm:gap-2.5 flex-wrap">
                <span className="text-[10px] sm:text-xs font-black px-2.5 sm:px-3.5 py-0.5 sm:py-1 rounded-xl bg-amber-500 text-slate-950 shadow-md flex items-center gap-1.5">
                  <BookOpen className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                  <span>{lang === 'ar' ? 'نبذة عن المشروع' : 'Project Overview'}</span>
                </span>
                <h3 className={`text-lg sm:text-2xl lg:text-3xl font-black leading-snug ${theme === 'light' ? 'text-slate-950' : 'text-white'}`}>
                  {t.ubariTitle}
                </h3>
                <span className="text-[10px] sm:text-xs font-black px-2 sm:px-3 py-0.5 sm:py-1 rounded-xl bg-amber-500/20 text-amber-500 border border-amber-500/35 font-mono shadow-sm">
                  {t.ubariBadge}
                </span>
              </div>
              <p className={`text-xs sm:text-sm mt-0.5 sm:mt-1 font-medium ${theme === 'light' ? 'text-slate-600' : 'text-slate-400'}`}>
                {t.ubariSub}
              </p>
            </div>
          </div>

          <div className="text-[11px] sm:text-xs font-bold text-amber-500 bg-amber-500/10 px-2.5 sm:px-3.5 py-1 sm:py-1.5 rounded-xl border border-amber-500/30 self-start sm:self-auto shadow-sm flex items-center gap-1.5">
            <MapPin className="w-3.5 h-3.5" />
            <span>{t.ubariRegionBadge}</span>
          </div>
        </div>

        {/* Narrative Paragraph */}
        <p className={`text-xs sm:text-base leading-relaxed text-start relative z-10 font-normal ${
          theme === 'light' ? 'text-slate-700' : 'text-slate-300'
        }`}>
          {t.ubariParagraph}
        </p>

        {/* 1. DESKTOP ONLY: 4 Holographic 4K Feature Cards Grid (100% Preserved) */}
        <div className="hidden md:grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-5 pt-1 sm:pt-2 relative z-10">
          
          {/* Card 1: Technical Asphalt Specs */}
          <div className={`p-4 sm:p-5 rounded-xl sm:rounded-2xl border space-y-2 sm:space-y-3 glass-card-hover ${
            theme === 'light' 
              ? 'bg-white/95 border-slate-200/90 shadow-sm' 
              : 'bg-white/[0.04] border-white/10 shadow-lg shadow-black/40'
          }`}>
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-cyan-500/15 text-cyan-500 border border-cyan-500/30 flex items-center justify-center shadow-sm">
              <Layers className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
            <h4 className="font-extrabold text-xs sm:text-sm text-cyan-600 dark:text-cyan-400">{t.ubariLakesTitle}</h4>
            <p className="text-[11px] sm:text-xs text-slate-500 dark:text-slate-400 leading-relaxed font-medium">
              {t.ubariLakesDesc}
            </p>
          </div>

          {/* Card 2: Solar Lighting */}
          <div className={`p-4 sm:p-5 rounded-xl sm:rounded-2xl border space-y-2 sm:space-y-3 glass-card-hover ${
            theme === 'light' 
              ? 'bg-white/95 border-slate-200/90 shadow-sm' 
              : 'bg-white/[0.04] border-white/10 shadow-lg shadow-black/40'
          }`}>
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-amber-500/15 text-amber-500 border border-amber-500/30 flex items-center justify-center shadow-sm">
              <Sun className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
            <h4 className="font-extrabold text-xs sm:text-sm text-amber-600 dark:text-amber-400">{t.ubariTransportTitle}</h4>
            <p className="text-[11px] sm:text-xs text-slate-500 dark:text-slate-400 leading-relaxed font-medium">
              {t.ubariTransportDesc}
            </p>
          </div>

          {/* Card 3: Culverts & Drainage */}
          <div className={`p-4 sm:p-5 rounded-xl sm:rounded-2xl border space-y-2 sm:space-y-3 glass-card-hover ${
            theme === 'light' 
              ? 'bg-white/95 border-slate-200/90 shadow-sm' 
              : 'bg-white/[0.04] border-white/10 shadow-lg shadow-black/40'
          }`}>
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-emerald-500/15 text-emerald-500 border border-emerald-500/30 flex items-center justify-center shadow-sm">
              <ShieldCheck className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
            <h4 className="font-extrabold text-xs sm:text-sm text-emerald-600 dark:text-emerald-400">{t.ubariEnergyTitle}</h4>
            <p className="text-[11px] sm:text-xs text-slate-500 dark:text-slate-400 leading-relaxed font-medium">
              {t.ubariEnergyDesc}
            </p>
          </div>

          {/* Card 4: Economic & Border Nexus */}
          <div className={`p-4 sm:p-5 rounded-xl sm:rounded-2xl border space-y-2 sm:space-y-3 glass-card-hover ${
            theme === 'light' 
              ? 'bg-white/95 border-slate-200/90 shadow-sm' 
              : 'bg-white/[0.04] border-white/10 shadow-lg shadow-black/40'
          }`}>
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-amber-500/15 text-amber-500 border border-amber-500/30 flex items-center justify-center shadow-sm">
              <Route className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
            <h4 className="font-extrabold text-xs sm:text-sm text-amber-600 dark:text-amber-400">{t.ubariHeritageTitle}</h4>
            <p className="text-[11px] sm:text-xs text-slate-500 dark:text-slate-400 leading-relaxed font-medium">
              {t.ubariHeritageDesc}
            </p>
          </div>

        </div>

        {/* 2. MOBILE ONLY: 5-Second Fade Animation Auto-Cycling Card (البطاقات فوق بعضها البعض وتتحرك تلقائياً كل 5 ثواني بانميشن تلاشي) */}
        <div className="md:hidden relative z-10 text-start space-y-2.5">
          <div 
            className={`p-4 xs:p-5 rounded-2xl border shadow-xl transition-all duration-500 min-h-[170px] flex flex-col justify-between ${
              fadeActive ? 'opacity-100 scale-100' : 'opacity-0 scale-[0.98]'
            } ${
              theme === 'light' 
                ? 'bg-white/95 border-slate-200/90 text-slate-900 shadow-slate-200/80' 
                : 'bg-[#090e1a]/95 border-white/10 text-white shadow-black/80'
            }`}
          >
            {/* Card Header: Icon + Badge + Counter */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className={`w-9 h-9 rounded-xl border flex items-center justify-center shadow-sm ${currentFeature.iconBg} ${currentFeature.iconColor}`}>
                  <CurrentIcon className="w-4 h-4 xs:w-5 xs:h-5" />
                </div>
                <div>
                  <span className="text-[10px] font-black px-2 py-0.5 rounded-lg bg-amber-500/15 text-amber-500 border border-amber-500/30">
                    {currentFeature.badge}
                  </span>
                </div>
              </div>

              {/* 5s Auto Indicator & Slide index */}
              <div className="flex items-center gap-2">
                <span className="text-[10px] text-emerald-500 font-bold flex items-center gap-1 font-mono">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
                  <span>5s</span>
                </span>
                <span className="text-[10px] text-slate-400 font-mono bg-slate-100 dark:bg-white/5 px-1.5 py-0.5 rounded border border-slate-200 dark:border-white/10">
                  {activeFeatureIdx + 1} / {originalFeatures.length}
                </span>
              </div>
            </div>

            {/* Card Title & Description */}
            <div className="space-y-1.5 my-2">
              <h4 className={`font-black text-xs xs:text-sm ${currentFeature.color}`}>
                {currentFeature.title}
              </h4>
              <p className="text-[11px] xs:text-xs text-slate-600 dark:text-slate-300 leading-relaxed font-normal">
                {currentFeature.desc}
              </p>
            </div>

            {/* Card Navigation Controls: Dots + Arrows */}
            <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-white/10 text-xs">
              <div className="flex items-center gap-1.5">
                {originalFeatures.map((_, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => {
                      setFadeActive(false);
                      setTimeout(() => {
                        setActiveFeatureIdx(i);
                        setFadeActive(true);
                      }, 200);
                    }}
                    className={`h-2 rounded-full transition-all duration-300 cursor-pointer ${
                      i === activeFeatureIdx ? 'w-5 bg-amber-500' : 'w-2 bg-slate-300 dark:bg-white/20'
                    }`}
                    aria-label={`Card ${i + 1}`}
                  />
                ))}
              </div>

              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => {
                    setFadeActive(false);
                    setTimeout(() => {
                      setActiveFeatureIdx((activeFeatureIdx - 1 + originalFeatures.length) % originalFeatures.length);
                      setFadeActive(true);
                    }, 200);
                  }}
                  className="w-6 h-6 rounded-lg border border-slate-200 dark:border-white/10 flex items-center justify-center text-xs active:scale-95 text-slate-400 hover:text-white cursor-pointer"
                  aria-label="Previous card"
                >
                  ‹
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setFadeActive(false);
                    setTimeout(() => {
                      setActiveFeatureIdx((activeFeatureIdx + 1) % originalFeatures.length);
                      setFadeActive(true);
                    }, 200);
                  }}
                  className="w-6 h-6 rounded-lg border border-slate-200 dark:border-white/10 flex items-center justify-center text-xs active:scale-95 text-slate-400 hover:text-white cursor-pointer"
                  aria-label="Next card"
                >
                  ›
                </button>
              </div>
            </div>

          </div>
        </div>

      </div>
    </section>
  );
}
