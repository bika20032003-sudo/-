import React from 'react';
import { Layers, Sun, ShieldCheck, Route, MapPin, Navigation, Award, BookOpen, CheckCircle2 } from 'lucide-react';
import { translations } from '../i18n/translations';
import { resolveAsset } from '../utils/assets';

export default function UbariCityShowcase({ theme, lang = 'ar' }) {
  const t = translations[lang] || translations.ar;

  const aboutFeatures = [
    {
      title: t.ubariLakesTitle,
      desc: t.ubariLakesDesc,
      icon: Layers,
      color: 'text-cyan-500',
      badge: lang === 'ar' ? 'المواصفات الفنية للأسفلت' : 'Asphalt Technical Specs',
      image: './road-asphalt-paver.jpg'
    },
    {
      title: t.ubariTransportTitle,
      desc: t.ubariTransportDesc,
      icon: Sun,
      color: 'text-amber-500',
      badge: lang === 'ar' ? 'الإنارة بالطاقة الشمسية' : 'Solar Lighting',
      image: './road-solar-lighting.jpg'
    },
    {
      title: t.ubariEnergyTitle,
      desc: t.ubariEnergyDesc,
      icon: ShieldCheck,
      color: 'text-emerald-500',
      badge: lang === 'ar' ? 'تصريف السيول والعبارات' : 'Drainage & Culverts',
      image: './road-qa-testing-core.jpg'
    },
    {
      title: t.ubariHeritageTitle,
      desc: t.ubariHeritageDesc,
      icon: Route,
      color: 'text-amber-500',
      badge: lang === 'ar' ? 'الربط الاستراتيجي والتجاري' : 'Strategic Highway Link',
      image: './road-aerial-highway.jpg'
    }
  ];

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

        {/* 2. MOBILE ONLY: News-Post Style Cards (نظام البوست للأخبار على الهاتف حصراً) */}
        <div className="md:hidden space-y-3.5 pt-1 relative z-10 text-start">
          {aboutFeatures.map((post, idx) => (
            <div 
              key={idx}
              className={`rounded-2xl overflow-hidden border shadow-lg transition-all ${
                theme === 'light'
                  ? 'bg-white border-slate-200/90 text-slate-900 shadow-slate-200/70'
                  : 'bg-[#090e1a]/95 border-white/10 text-white shadow-black/80'
              }`}
            >
              {/* Post Header: Agency Brand + Tag */}
              <div className="px-3 py-2 flex items-center justify-between border-b border-slate-100 dark:border-white/10">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-amber-400 to-amber-600 p-[1px] shadow-sm flex-shrink-0">
                    <img 
                      src={resolveAsset('./logo-agency.jpg')} 
                      alt="جهاز تنفيذ مشروعات المواصلات" 
                      className="w-full h-full object-contain rounded-md bg-white"
                      onError={(e) => { e.currentTarget.style.display = 'none'; }}
                    />
                  </div>
                  <div className="text-start leading-tight">
                    <div className="flex items-center gap-1">
                      <span className="font-black text-xs">
                        {lang === 'ar' ? 'مشروعات المواصلات' : 'Transport Projects'}
                      </span>
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                    </div>
                    <span className="text-[10px] text-slate-400 font-medium">
                      {lang === 'ar' ? 'نبذة تنفيذية معتمدة' : 'Official Project Pillar'}
                    </span>
                  </div>
                </div>

                <span className="text-[10px] font-black px-2 py-0.5 rounded-lg bg-amber-500/15 text-amber-500 border border-amber-500/30">
                  {post.badge}
                </span>
              </div>

              {/* Post Photo */}
              <div className="h-40 relative overflow-hidden bg-slate-950">
                <img 
                  src={resolveAsset(post.image)} 
                  alt={post.title} 
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.currentTarget.onerror = null;
                    e.currentTarget.src = resolveAsset('./road-asphalt-paver.jpg');
                  }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                <div className="absolute bottom-2 start-2.5 end-2.5 flex items-center justify-between text-white text-[10px]">
                  <span className="px-2 py-0.5 rounded-md bg-black/70 font-mono font-bold text-amber-400 border border-white/10">
                    {lang === 'ar' ? 'توثيق ميداني 4K' : '4K Documentation'}
                  </span>
                  <span className="bg-emerald-500/90 text-slate-950 font-black px-2 py-0.5 rounded-md text-[10px]">
                    {lang === 'ar' ? 'مطابق للمواصفات' : 'Certified'}
                  </span>
                </div>
              </div>

              {/* Post Content */}
              <div className="p-3 space-y-1.5">
                <h4 className="font-black text-xs xs:text-sm leading-snug">
                  {post.title}
                </h4>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed font-normal">
                  {post.desc}
                </p>
                <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-white/10 text-[10px]">
                  <span className="text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" />
                    <span>{lang === 'ar' ? 'متابعة رسمية مباشرة' : 'Direct Authority Supervision'}</span>
                  </span>
                  <span className="text-amber-500 font-bold font-mono">
                    {lang === 'ar' ? 'طريق أوباري غات (360 كم)' : '360 KM Highway'}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}
