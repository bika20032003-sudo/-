import React from 'react';
import { Layers, Sun, ShieldCheck, Route, MapPin, Navigation, Award, BookOpen } from 'lucide-react';
import { translations } from '../i18n/translations';

export default function UbariCityShowcase({ theme, lang = 'ar' }) {
  const t = translations[lang] || translations.ar;

  return (
    <section className="px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto animate-fadeIn select-none">
      
      {/* ── 2026 4K Luxury Road Project Showcase Card ── */}
      <div className={`p-6 sm:p-10 rounded-[32px] border shadow-2xl space-y-8 relative overflow-hidden transition-all ${
        theme === 'light'
          ? 'bg-gradient-to-br from-white via-amber-50/40 to-white border-amber-200/90 text-slate-900 shadow-slate-200/90'
          : 'bg-gradient-to-br from-[#0c1222]/95 via-[#0f172a]/95 to-[#0c1222]/95 border-amber-500/25 text-white shadow-black/90'
      }`}>
        
        {/* Ambient Top Glow Orbs */}
        <div 
          className="absolute -top-24 -right-24 w-72 h-72 rounded-full pointer-events-none blur-3xl opacity-40"
          style={{ background: 'radial-gradient(circle, rgba(255,171,0,0.3) 0%, transparent 70%)' }}
        />
        <div 
          className="absolute -bottom-24 -left-24 w-72 h-72 rounded-full pointer-events-none blur-3xl opacity-30"
          style={{ background: 'radial-gradient(circle, rgba(0,245,212,0.2) 0%, transparent 70%)' }}
        />

        {/* Title Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b pb-6 border-slate-200 dark:border-white/10 relative z-10">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-amber-400 via-amber-500 to-amber-600 p-[1.5px] shadow-lg shadow-amber-500/25 flex-shrink-0">
              <div className="w-full h-full rounded-[14px] bg-[#0c1220] flex items-center justify-center text-amber-400">
                <Navigation className="w-7 h-7 animate-float" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2.5 flex-wrap">
                <span className="text-xs font-black px-3.5 py-1 rounded-xl bg-amber-500 text-slate-950 shadow-md flex items-center gap-1.5">
                  <BookOpen className="w-3.5 h-3.5" />
                  <span>{lang === 'ar' ? 'نبذة عن المشروع' : 'Project Overview'}</span>
                </span>
                <h3 className={`text-2xl sm:text-3xl font-black leading-snug ${theme === 'light' ? 'text-slate-950' : 'text-white'}`}>
                  {t.ubariTitle}
                </h3>
                <span className="text-xs font-black px-3 py-1 rounded-xl bg-amber-500/20 text-amber-500 border border-amber-500/35 font-mono shadow-sm">
                  {t.ubariBadge}
                </span>
              </div>
              <p className={`text-xs sm:text-sm mt-1 font-medium ${theme === 'light' ? 'text-slate-600' : 'text-slate-400'}`}>
                {t.ubariSub}
              </p>
            </div>
          </div>

          <div className="text-xs font-bold text-amber-500 bg-amber-500/10 px-3.5 py-1.5 rounded-xl border border-amber-500/30 self-start sm:self-auto shadow-sm flex items-center gap-1.5">
            <MapPin className="w-3.5 h-3.5" />
            <span>{t.ubariRegionBadge}</span>
          </div>
        </div>

        {/* Narrative Paragraph */}
        <p className={`text-sm sm:text-base leading-relaxed text-start relative z-10 font-normal ${
          theme === 'light' ? 'text-slate-700' : 'text-slate-300'
        }`}>
          {t.ubariParagraph}
        </p>

        {/* 4 Holographic 4K Feature Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 pt-2 relative z-10">
          
          {/* Card 1: Technical Asphalt Specs */}
          <div className={`p-5 rounded-2xl border space-y-3 glass-card-hover ${
            theme === 'light' 
              ? 'bg-white/95 border-slate-200/90 shadow-sm' 
              : 'bg-white/[0.04] border-white/10 shadow-lg shadow-black/40'
          }`}>
            <div className="w-10 h-10 rounded-xl bg-cyan-500/15 text-cyan-500 border border-cyan-500/30 flex items-center justify-center shadow-sm">
              <Layers className="w-5 h-5" />
            </div>
            <h4 className="font-extrabold text-sm text-cyan-600 dark:text-cyan-400">{t.ubariLakesTitle}</h4>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed font-medium">
              {t.ubariLakesDesc}
            </p>
          </div>

          {/* Card 2: Solar Lighting */}
          <div className={`p-5 rounded-2xl border space-y-3 glass-card-hover ${
            theme === 'light' 
              ? 'bg-white/95 border-slate-200/90 shadow-sm' 
              : 'bg-white/[0.04] border-white/10 shadow-lg shadow-black/40'
          }`}>
            <div className="w-10 h-10 rounded-xl bg-amber-500/15 text-amber-500 border border-amber-500/30 flex items-center justify-center shadow-sm">
              <Sun className="w-5 h-5" />
            </div>
            <h4 className="font-extrabold text-sm text-amber-600 dark:text-amber-400">{t.ubariTransportTitle}</h4>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed font-medium">
              {t.ubariTransportDesc}
            </p>
          </div>

          {/* Card 3: Culverts & Drainage */}
          <div className={`p-5 rounded-2xl border space-y-3 glass-card-hover ${
            theme === 'light' 
              ? 'bg-white/95 border-slate-200/90 shadow-sm' 
              : 'bg-white/[0.04] border-white/10 shadow-lg shadow-black/40'
          }`}>
            <div className="w-10 h-10 rounded-xl bg-emerald-500/15 text-emerald-500 border border-emerald-500/30 flex items-center justify-center shadow-sm">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <h4 className="font-extrabold text-sm text-emerald-600 dark:text-emerald-400">{t.ubariEnergyTitle}</h4>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed font-medium">
              {t.ubariEnergyDesc}
            </p>
          </div>

          {/* Card 4: Economic & Border Nexus */}
          <div className={`p-5 rounded-2xl border space-y-3 glass-card-hover ${
            theme === 'light' 
              ? 'bg-white/95 border-slate-200/90 shadow-sm' 
              : 'bg-white/[0.04] border-white/10 shadow-lg shadow-black/40'
          }`}>
            <div className="w-10 h-10 rounded-xl bg-amber-500/15 text-amber-500 border border-amber-500/30 flex items-center justify-center shadow-sm">
              <Route className="w-5 h-5" />
            </div>
            <h4 className="font-extrabold text-sm text-amber-600 dark:text-amber-400">{t.ubariHeritageTitle}</h4>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed font-medium">
              {t.ubariHeritageDesc}
            </p>
          </div>

        </div>

      </div>
    </section>
  );
}
