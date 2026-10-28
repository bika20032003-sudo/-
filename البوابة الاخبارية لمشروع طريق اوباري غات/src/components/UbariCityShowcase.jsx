import React, { useState, useEffect } from 'react';
import { Layers, Signpost, ShieldCheck, Paintbrush, MapPin, Navigation, BookOpen } from 'lucide-react';
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
      badge: lang === 'ar' ? 'معايير دولية' : 'Global Specs'
    },
    {
      id: 1,
      title: t.ubariTransportTitle,
      desc: t.ubariTransportDesc,
      icon: Signpost,
      color: 'text-amber-600 dark:text-amber-400',
      iconColor: 'text-amber-500',
      iconBg: 'bg-amber-500/15 border-amber-500/30',
      badge: lang === 'ar' ? 'سلامة مرورية' : 'Road Safety'
    },
    {
      id: 2,
      title: t.ubariEnergyTitle,
      desc: t.ubariEnergyDesc,
      icon: ShieldCheck,
      color: 'text-emerald-600 dark:text-emerald-400',
      iconColor: 'text-emerald-500',
      iconBg: 'bg-emerald-500/15 border-emerald-500/30',
      badge: lang === 'ar' ? 'تصريف هيدروليكي' : 'Flood Safe'
    },
    {
      id: 3,
      title: t.ubariHeritageTitle,
      desc: t.ubariHeritageDesc,
      icon: Paintbrush,
      color: 'text-violet-600 dark:text-violet-400',
      iconColor: 'text-violet-500',
      iconBg: 'bg-violet-500/15 border-violet-500/30',
      badge: lang === 'ar' ? 'تخطيط حراري' : 'Road Markings'
    }
  ];

  const [activeFeatureIdx, setActiveFeatureIdx] = useState(0);
  const [fadeActive, setFadeActive] = useState(true);
  const [touchStart, setTouchStart] = useState(null);
  const [touchEnd, setTouchEnd] = useState(null);

  const handleNext = () => {
    setFadeActive(false);
    setTimeout(() => {
      setActiveFeatureIdx(prev => (prev + 1) % originalFeatures.length);
      setFadeActive(true);
    }, 200);
  };

  const handlePrev = () => {
    setFadeActive(false);
    setTimeout(() => {
      setActiveFeatureIdx(prev => (prev - 1 + originalFeatures.length) % originalFeatures.length);
      setFadeActive(true);
    }, 200);
  };

  const onTouchStart = (e) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const onTouchMove = (e) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    const distance = touchStart - touchEnd;
    if (distance > 45) {
      handleNext();
    } else if (distance < -45) {
      handlePrev();
    }
  };

  // 5-second automatic progression with fade animation (المدة خمسة ثواني مع انميشن تلاشي)
  useEffect(() => {
    const interval = setInterval(() => {
      handleNext();
    }, 5000);
    return () => clearInterval(interval);
  }, [originalFeatures.length]);

  const currentFeature = originalFeatures[activeFeatureIdx];
  const CurrentIcon = currentFeature.icon;

  return (
    <section className="px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto animate-fadeIn select-none">
      
      {/* ── 2026 4K Luxury Road Project Showcase Card (Compact & Harmonious) ── */}
      <div className={`p-3.5 xs:p-4 sm:p-6 rounded-2xl border shadow-xl space-y-3 sm:space-y-4 relative overflow-hidden transition-all ${
        theme === 'light'
          ? 'bg-gradient-to-br from-white via-amber-50/40 to-white border-amber-200/90 text-slate-900 shadow-slate-200/90'
          : 'bg-gradient-to-br from-[#0c1222]/95 via-[#0f172a]/95 to-[#0c1222]/95 border-amber-500/25 text-white shadow-black/90'
      }`}>
        
        {/* Ambient Top Glow Orbs (GPU-friendly zero-blur) */}
        <div 
          className="absolute -top-24 -right-24 w-60 h-60 rounded-full pointer-events-none opacity-30"
          style={{ background: 'radial-gradient(circle, rgba(255,171,0,0.25) 0%, transparent 70%)' }}
        />
        <div 
          className="absolute -bottom-24 -left-24 w-60 h-60 rounded-full pointer-events-none opacity-20"
          style={{ background: 'radial-gradient(circle, rgba(0,245,212,0.15) 0%, transparent 70%)' }}
        />

        {/* Title Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 sm:gap-4 border-b pb-2.5 sm:pb-3.5 border-slate-200 dark:border-white/10 relative z-10">
          <div className="flex items-center gap-2.5 sm:gap-3.5 min-w-0 flex-1">
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl bg-gradient-to-br from-amber-400 via-amber-500 to-amber-600 p-[1.5px] shadow-md shadow-amber-500/20 shrink-0">
              <div className="w-full h-full rounded-[7px] sm:rounded-[10px] bg-[#0c1220] flex items-center justify-center text-amber-400">
                <Navigation className="w-4 h-4 sm:w-5 sm:h-5 animate-float" />
              </div>
            </div>
            <div className="min-w-0 flex-1 text-start">
              <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
                <span className="text-[10px] sm:text-[11px] font-bold px-2 py-0.5 rounded-md bg-amber-500 text-slate-950 shadow-sm flex items-center gap-1 shrink-0">
                  <BookOpen className="w-3 h-3" />
                  <span>{lang === 'ar' ? 'نبذة عن المشروع' : 'Project Overview'}</span>
                </span>
                <span className="text-[10px] sm:text-[11px] font-semibold px-2 py-0.5 rounded-md bg-amber-500/15 text-amber-500 border border-amber-500/30 font-mono shrink-0">
                  {t.ubariBadge}
                </span>
              </div>
              <h3 className={`text-sm sm:text-base lg:text-lg font-bold leading-snug mt-1 ${theme === 'light' ? 'text-slate-950' : 'text-white'}`}>
                {t.ubariTitle}
              </h3>
              <p className={`text-[11px] sm:text-xs mt-0.5 font-normal ${theme === 'light' ? 'text-slate-600' : 'text-slate-400'}`}>
                {t.ubariSub}
              </p>
            </div>
          </div>

          <div className="text-[10px] sm:text-[11px] font-semibold text-amber-500 bg-amber-500/10 px-2.5 py-1 rounded-lg border border-amber-500/25 self-start sm:self-center shadow-sm flex items-center gap-1.5 shrink-0">
            <MapPin className="w-3 h-3" />
            <span>{t.ubariRegionBadge}</span>
          </div>
        </div>

        {/* Narrative Paragraph (Compact & Clean) */}
        <p className={`text-xs sm:text-[13px] leading-relaxed text-start relative z-10 font-normal ${
          theme === 'light' ? 'text-slate-700' : 'text-slate-300'
        }`}>
          {t.ubariParagraph}
        </p>

        {/* 1. DESKTOP ONLY: 4 Compact Specification Cards */}
        <div className="hidden md:grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-3 pt-0.5 relative z-10">
          
          {/* Card 1: Technical Asphalt Specs */}
          <div className={`p-3 sm:p-3.5 rounded-xl border space-y-2 glass-card-hover ${
            theme === 'light' 
              ? 'bg-white/95 border-slate-200/90 shadow-sm' 
              : 'bg-white/[0.04] border-white/10 shadow-md shadow-black/30'
          }`}>
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-cyan-500/15 text-cyan-500 border border-cyan-500/30 flex items-center justify-center shrink-0">
                <Layers className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              </div>
              <h4 className="font-bold text-xs sm:text-[13px] text-cyan-600 dark:text-cyan-400 leading-tight">{t.ubariLakesTitle}</h4>
            </div>
            <div className="text-[10.5px] sm:text-[11px] text-slate-500 dark:text-slate-400 leading-normal font-normal space-y-1 text-start">
              {t.ubariLakesDesc.split('\n').map((point, idx) => (
                <div key={idx} className="flex items-start gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-cyan-500 mt-1 shrink-0 shadow-sm shadow-cyan-500/50" />
                  <span>{point}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Card 2: Guidance & Road Safety */}
          <div className={`p-3 sm:p-3.5 rounded-xl border space-y-2 glass-card-hover ${
            theme === 'light' 
              ? 'bg-white/95 border-slate-200/90 shadow-sm' 
              : 'bg-white/[0.04] border-white/10 shadow-md shadow-black/30'
          }`}>
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-amber-500/15 text-amber-500 border border-amber-500/30 flex items-center justify-center shrink-0">
                <Signpost className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              </div>
              <h4 className="font-bold text-xs sm:text-[13px] text-amber-600 dark:text-amber-400 leading-tight">{t.ubariTransportTitle}</h4>
            </div>
            <div className="text-[10.5px] sm:text-[11px] text-slate-500 dark:text-slate-400 leading-normal font-normal space-y-1 text-start">
              {t.ubariTransportDesc.split('\n').map((point, idx) => (
                <div key={idx} className="flex items-start gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-500 mt-1 shrink-0 shadow-sm shadow-amber-500/50" />
                  <span>{point}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Card 3: Culverts & Drainage */}
          <div className={`p-3 sm:p-3.5 rounded-xl border space-y-2 glass-card-hover ${
            theme === 'light' 
              ? 'bg-white/95 border-slate-200/90 shadow-sm' 
              : 'bg-white/[0.04] border-white/10 shadow-md shadow-black/30'
          }`}>
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-emerald-500/15 text-emerald-500 border border-emerald-500/30 flex items-center justify-center shrink-0">
                <ShieldCheck className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              </div>
              <h4 className="font-bold text-xs sm:text-[13px] text-emerald-600 dark:text-emerald-400 leading-tight">{t.ubariEnergyTitle}</h4>
            </div>
            <p className="text-[10.5px] sm:text-[11px] text-slate-500 dark:text-slate-400 leading-normal font-normal">
              {t.ubariEnergyDesc}
            </p>
          </div>

          {/* Card 4: Road Surface Painting & Markings */}
          <div className={`p-3 sm:p-3.5 rounded-xl border space-y-2 glass-card-hover ${
            theme === 'light' 
              ? 'bg-white/95 border-slate-200/90 shadow-sm' 
              : 'bg-white/[0.04] border-white/10 shadow-md shadow-black/30'
          }`}>
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-violet-500/15 text-violet-500 border border-violet-500/30 flex items-center justify-center shrink-0">
                <Paintbrush className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              </div>
              <h4 className="font-bold text-xs sm:text-[13px] text-violet-600 dark:text-violet-400 leading-tight">{t.ubariHeritageTitle}</h4>
            </div>
            <div className="text-[10.5px] sm:text-[11px] text-slate-500 dark:text-slate-400 leading-normal font-normal space-y-1 text-start">
              {t.ubariHeritageDesc.split('\n').map((point, idx) => (
                <div key={idx} className="flex items-start gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-violet-500 mt-1 shrink-0 shadow-sm shadow-violet-500/50" />
                  <span>{point}</span>
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* 2. MOBILE ONLY: 5-Second Fade Animation Auto-Cycling Card */}
        <div 
          className="md:hidden relative z-10 text-start space-y-2"
          onTouchStart={onTouchStart}
          onTouchMove={onTouchMove}
          onTouchEnd={onTouchEnd}
        >
          <div 
            className={`p-3.5 rounded-xl border shadow-lg transition-all duration-500 min-h-[145px] flex flex-col justify-between ${
              fadeActive ? 'opacity-100 scale-100' : 'opacity-0 scale-[0.98]'
            } ${
              theme === 'light' 
                ? 'bg-white/95 border-slate-200/90 text-slate-900 shadow-slate-200/80' 
                : 'bg-[#090e1a]/95 border-white/10 text-white shadow-black/80'
            }`}
          >
            {/* Card Header: Icon + Badge + Counter */}
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2 min-w-0">
                <div className={`w-7 h-7 rounded-lg border flex items-center justify-center shadow-sm shrink-0 ${currentFeature.iconBg} ${currentFeature.iconColor}`}>
                  <CurrentIcon className="w-3.5 h-3.5" />
                </div>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-amber-500/15 text-amber-500 border border-amber-500/30 whitespace-nowrap shrink-0">
                  {currentFeature.badge}
                </span>
              </div>

              {/* 5s Auto Indicator & Slide index */}
              <div className="flex items-center gap-1.5 shrink-0">
                <span className="text-[10px] text-emerald-500 font-bold flex items-center gap-1 font-mono whitespace-nowrap">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
                  <span>5s</span>
                </span>
                <span className="text-[10px] text-slate-400 font-mono bg-slate-100 dark:bg-white/5 px-2 py-0.5 rounded border border-slate-200 dark:border-white/10 whitespace-nowrap">
                  {activeFeatureIdx + 1} / {originalFeatures.length}
                </span>
              </div>
            </div>

            {/* Card Title & Description */}
            <div className="space-y-1 my-2">
              <h4 className={`font-bold text-xs ${currentFeature.color}`}>
                {currentFeature.title}
              </h4>
              <div className="text-[10.5px] text-slate-600 dark:text-slate-300 leading-normal font-normal space-y-1 text-start">
                {currentFeature.desc.includes('\n') ? (
                  currentFeature.desc.split('\n').map((point, idx) => (
                    <div key={idx} className="flex items-start gap-1.5">
                      <span className={`w-1.5 h-1.5 rounded-full mt-1 shrink-0 shadow-sm ${currentFeature.id === 0 ? 'bg-cyan-500 shadow-cyan-500/50' : 'bg-amber-500 shadow-amber-500/50'}`} />
                      <span>{point}</span>
                    </div>
                  ))
                ) : (
                  <p>{currentFeature.desc}</p>
                )}
              </div>
            </div>

            {/* Card Navigation Controls */}
            <div className="flex items-center justify-between pt-1.5 border-t border-slate-100 dark:border-white/10 text-xs">
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
                    className={`h-1.5 rounded-full transition-all duration-300 cursor-pointer ${
                      i === activeFeatureIdx ? 'w-4 bg-amber-500' : 'w-1.5 bg-slate-300 dark:bg-white/20'
                    }`}
                    aria-label={`Card ${i + 1}`}
                  />
                ))}
              </div>

              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={handlePrev}
                  className="w-6 h-6 rounded-md border border-slate-200 dark:border-white/10 flex items-center justify-center text-xs active:scale-95 text-slate-400 hover:text-white cursor-pointer"
                  aria-label="Previous card"
                >
                  ‹
                </button>
                <button
                  type="button"
                  onClick={handleNext}
                  className="w-6 h-6 rounded-md border border-slate-200 dark:border-white/10 flex items-center justify-center text-xs active:scale-95 text-slate-400 hover:text-white cursor-pointer"
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
