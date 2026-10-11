import React, { useState, useEffect } from 'react';
import { 
  MapPin, 
  CheckCircle, 
  Sun, 
  ShieldCheck, 
  Layers, 
  Award
} from 'lucide-react';
import { translations } from '../i18n/translations';

export default function SectorsRoadmap({ sectors = [], theme, lang = 'ar' }) {
  const t = translations[lang] || translations.ar;
  const [selectedSector, setSelectedSector] = useState(sectors[0] || null);

  useEffect(() => {
    if (!selectedSector && sectors && sectors.length > 0) {
      setSelectedSector(sectors[0]);
    }
  }, [sectors]);

  const activeSector = selectedSector || sectors[0] || null;

  return (
    <section className="py-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-10 animate-fadeIn select-none">
      
      {/* Section Title Header */}
      <div className="text-center max-w-3xl mx-auto space-y-3">
        <div className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-black border shadow-sm ${
          theme === 'light'
            ? 'bg-cyan-100/90 border-cyan-300 text-cyan-950'
            : 'bg-cyan-500/10 border-cyan-500/35 text-cyan-300'
        }`}>
          <MapPin className="w-4 h-4 text-cyan-500" />
          <span>{t.sectorsBadge}</span>
        </div>
        <h2 className={`text-3xl sm:text-5xl font-black leading-snug ${
          theme === 'light' ? 'text-slate-950' : 'text-white'
        }`}>
          {t.sectorsTitle}
        </h2>
        <p className={`text-xs sm:text-base font-medium ${
          theme === 'light' ? 'text-slate-600' : 'text-slate-400'
        }`}>
          {t.sectorsDesc}
        </p>
      </div>

      {/* Interactive 4 Sector Milestone Tabs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {sectors.map((sec, index) => {
          const isSelected = activeSector && activeSector.id === sec.id;
          return (
            <button
              key={sec.id}
              onClick={() => setSelectedSector(sec)}
              className={`p-6 rounded-[28px] transition-all duration-400 relative overflow-hidden border shadow-xl cursor-pointer text-start glass-card-hover ${
                isSelected
                  ? 'border-amber-400 bg-amber-500/15 shadow-2xl shadow-amber-500/25 scale-[1.03]'
                  : theme === 'light'
                    ? 'border-slate-200 bg-white hover:bg-slate-50 text-slate-800 shadow-slate-100'
                    : 'border-white/10 hover:border-white/20 bg-[#0d121f]/90 text-white shadow-black/50'
              }`}
            >
              {/* Sector Header Badge */}
              <div className="flex items-center justify-between mb-3.5">
                <span className={`text-xs font-black px-3.5 py-1 rounded-xl shadow-sm ${
                  isSelected 
                    ? 'bg-amber-500 text-slate-950 font-black' 
                    : theme === 'light'
                      ? 'bg-slate-100 text-slate-700'
                      : 'bg-white/10 text-slate-300'
                }`}>
                  {lang === 'ar' ? `القطاع 0${index + 1}` : `Sector 0${index + 1}`}
                </span>
                <span className="font-mono text-xs text-amber-500 font-extrabold">{sec.lengthKm} {lang === 'ar' ? 'كم' : 'km'}</span>
              </div>

              <h3 className={`font-black text-base mb-1 line-clamp-1 ${theme === 'light' ? 'text-slate-950' : 'text-white'}`}>
                {sec.name.split(':')[1] || sec.name}
              </h3>
              <p className={`text-[11px] mb-4 line-clamp-1 font-medium ${theme === 'light' ? 'text-slate-500' : 'text-slate-400'}`}>{sec.residentEngineer}</p>

              {/* Progress Bar with Shimmer */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-[11px]">
                  <span className={`font-semibold ${theme === 'light' ? 'text-slate-500' : 'text-slate-400'}`}>{t.sectorProgressRate}:</span>
                  <span className="font-mono font-black text-amber-500">{sec.progress}%</span>
                </div>
                <div className={`w-full h-2.5 rounded-full overflow-hidden p-0.5 border ${theme === 'light' ? 'bg-slate-200 border-slate-300' : 'bg-slate-800 border-white/5'}`}>
                  <div 
                    className="bg-gradient-to-r from-amber-500 via-amber-400 to-amber-300 h-full rounded-full transition-all duration-700 shimmer-active shadow-md" 
                    style={{ width: `${sec.progress}%` }}
                  />
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {/* Selected Sector 4K Showcase Panel */}
      {activeSector && (
        <div className={`p-6 sm:p-10 rounded-[32px] border shadow-2xl relative overflow-hidden transition-all ${
          theme === 'light' ? 'bg-white border-amber-300/60 shadow-slate-200/90' : 'bg-[#0a0f1d]/95 border-amber-500/35 shadow-black/80'
        }`}>
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
            
            {/* Left Info Column */}
            <div className="lg:col-span-7 space-y-6 text-start">
              <div>
                <div className="flex flex-wrap items-center gap-2.5 mb-3.5">
                  <span className="px-3.5 py-1 rounded-xl text-xs font-black bg-amber-500/20 text-amber-500 border border-amber-500/35 font-mono shadow-sm">
                    {activeSector.id}
                  </span>
                  <span className="px-3.5 py-1 rounded-xl text-xs font-black bg-emerald-500/20 text-emerald-500 border border-emerald-500/35 shadow-sm">
                    {activeSector.status}
                  </span>
                </div>
                <h3 className={`text-2xl sm:text-4xl font-black leading-snug ${theme === 'light' ? 'text-slate-950' : 'text-white'}`}>
                  {activeSector.name}
                </h3>
                <p className={`text-xs sm:text-sm mt-2.5 leading-relaxed font-medium ${theme === 'light' ? 'text-slate-600' : 'text-slate-300'}`}>
                  {activeSector.notes}
                </p>
              </div>

              {/* Specs 4K Grid */}
              <div className={`grid grid-cols-2 sm:grid-cols-3 gap-4 pt-3 border-t ${theme === 'light' ? 'border-slate-200' : 'border-white/10'}`}>
                <div className={`p-4 rounded-2xl border ${theme === 'light' ? 'bg-slate-50 border-slate-200 shadow-sm' : 'bg-white/[0.04] border-white/10 shadow-md'}`}>
                  <span className={`text-[11px] font-bold block mb-1 ${theme === 'light' ? 'text-slate-500' : 'text-slate-400'}`}>{t.sectorThickness}</span>
                  <span className={`text-xl font-black font-mono ${theme === 'light' ? 'text-slate-950' : 'text-white'}`}>{activeSector.asphaltThicknessCm} {lang === 'ar' ? 'سم' : 'cm'}</span>
                </div>

                <div className={`p-4 rounded-2xl border ${theme === 'light' ? 'bg-slate-50 border-slate-200 shadow-sm' : 'bg-white/[0.04] border-white/10 shadow-md'}`}>
                  <span className={`text-[11px] font-bold block mb-1 ${theme === 'light' ? 'text-slate-500' : 'text-slate-400'}`}>{t.sectorSolar}</span>
                  <span className="text-xl font-black text-amber-500 font-mono">{activeSector.solarPolesInstalled} {lang === 'ar' ? 'عمود' : 'Poles'}</span>
                </div>

                <div className={`p-4 rounded-2xl border ${theme === 'light' ? 'bg-slate-50 border-slate-200 shadow-sm' : 'bg-white/[0.04] border-white/10 shadow-md'}`}>
                  <span className={`text-[11px] font-bold block mb-1 ${theme === 'light' ? 'text-slate-500' : 'text-slate-400'}`}>{t.sectorWorkers}</span>
                  <span className="text-xl font-black text-cyan-500 font-mono">{activeSector.activeWorkers} {lang === 'ar' ? 'كادر' : 'Staff'}</span>
                </div>
              </div>

              {/* Resident Engineer & Supervision details */}
              <div className={`p-4 rounded-2xl border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs ${theme === 'light' ? 'bg-slate-50 border-slate-200' : 'bg-slate-900/90 border-white/10'}`}>
                <div>
                  <span className={theme === 'light' ? 'text-slate-500' : 'text-slate-400'}>الجهة المشرفة: </span>
                  <strong className={theme === 'light' ? 'text-slate-950 font-bold' : 'text-white font-bold'}>جهاز تنفيذ مشروعات المواصلات</strong>
                </div>
                <div>
                  <span className={theme === 'light' ? 'text-slate-500' : 'text-slate-400'}>{t.sectorEngineer}: </span>
                  <strong className="text-amber-500 font-black">{activeSector.residentEngineer}</strong>
                </div>
              </div>
            </div>

            {/* Photo Thumbnail */}
            <div className="lg:col-span-5 relative group">
              <div className="rounded-3xl overflow-hidden border-2 border-white/15 shadow-2xl relative">
                <img 
                  src={activeSector.image} 
                  alt={activeSector.name}
                  loading="lazy"
                  decoding="async"
                  className="w-full h-84 object-cover group-hover:scale-105 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent"></div>
                <div className="absolute bottom-4 right-4 left-4 flex items-center justify-between text-white text-xs font-bold">
                  <span className="flex items-center gap-2 bg-black/80 px-3.5 py-2 rounded-2xl backdrop-blur-md border border-white/20 shadow-lg">
                    <Sun className="w-4 h-4 text-amber-400 animate-spin" style={{ animationDuration: '30s' }} />
                    <span>{lang === 'ar' ? 'إنارة بالخلايا الشمسية' : 'Solar Powered Lighting'}</span>
                  </span>
                  <span className="bg-amber-500 text-slate-950 px-3.5 py-2 rounded-2xl font-mono font-black shadow-xl">
                    {activeSector.lengthKm} {lang === 'ar' ? 'كم' : 'km'}
                  </span>
                </div>
              </div>
            </div>

          </div>
        </div>
      )}

    </section>
  );
}
