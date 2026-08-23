import React from 'react';
import { 
  ArrowUpRight, 
  Zap, 
  ShieldCheck, 
  MapPin, 
  Activity, 
  Sparkles, 
  Compass, 
  Layers, 
  Flame, 
  Calendar, 
  CheckCircle2, 
  Truck, 
  Sun,
  Building2,
  Clock
} from 'lucide-react';
import { translations } from '../i18n/translations';

export default function Hero3D({ summaryData, setActiveTab, theme, user, onOpenGoogleAuth, lang = 'ar' }) {
  const t = translations[lang] || translations.ar;
  const progressVal = summaryData?.overallProgress ?? 68.5;

  // Circular progress calculation for SVG
  const radius = 38;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (progressVal / 100) * circumference;

  return (
    <section id="hero-section" className="relative min-h-[92vh] lg:min-h-screen w-full flex items-center overflow-hidden bg-grid-pattern select-none pt-24 pb-16">
      
      {/* ── 4K Cinematic Background Road Photo with 3D Specular Horizon ── */}
      <div className="absolute inset-0 z-0 overflow-hidden">
        <img 
          src="/road-aerial-highway.jpg" 
          alt="أعمال رصف وصيانة طريق أوباري غات الميدانية 4K" 
          className="w-full h-full object-cover object-center scale-[1.03] transition-transform duration-[15000ms] hover:scale-[1.07]"
          style={{ 
            filter: theme === 'light' 
              ? 'brightness(1.05) saturate(1.15) contrast(1.02)' 
              : 'brightness(0.85) saturate(1.2) contrast(1.1)' 
          }}
        />

        {/* 3D Glowing Road Horizon Guide Trajectory */}
        <div className="absolute inset-0 pointer-events-none opacity-40">
          <div className="w-full h-full bg-gradient-to-t from-amber-500/10 via-transparent to-transparent" />
        </div>

        {/* 4K Multi-Layer Gradient Overlays for High-Contrast Readability */}
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

      {/* ── Ambient Cyber-Aurora Radial Glows ── */}
      <div 
        className="absolute z-[1] rounded-full pointer-events-none blur-3xl opacity-70 animate-float"
        style={{
          width: '580px', height: '580px',
          right: '5%', top: '10%',
          background: 'radial-gradient(circle, rgba(255,171,0,0.22) 0%, rgba(255,171,0,0.05) 50%, transparent 75%)',
        }}
      />
      <div 
        className="absolute z-[1] rounded-full pointer-events-none blur-3xl opacity-60"
        style={{
          width: '460px', height: '460px',
          left: '8%', bottom: '12%',
          background: 'radial-gradient(circle, rgba(0,245,212,0.15) 0%, transparent 70%)',
          animation: 'floatSmooth 7s ease-in-out infinite 1.5s',
        }}
      />

      {/* ── Main Container ── */}
      <div className="relative z-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-10 w-full space-y-12">
        
        <div className="flex flex-col lg:flex-row items-center justify-between gap-12 lg:gap-16">
          
          {/* ── Right Text Column: Title, Live Telemetry & Actions ── */}
          <div className="w-full lg:w-7/12 space-y-7 animate-fadeIn text-start">
            
            {/* Live Radar Status Pill */}
            <div className="inline-flex items-center gap-3 px-4 py-2 rounded-full glass-pill-ultra text-xs font-extrabold tracking-wider shadow-2xl border border-amber-500/35 hover:border-amber-400 transition-colors">
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500 shadow-sm shadow-emerald-400"></span>
              </span>
              <span className="text-amber-500 dark:text-amber-300 font-black tracking-normal">{t.initiativeBadge}</span>
              <span className="h-4 w-px bg-slate-300 dark:bg-white/20 flex-shrink-0" />
              <span className="text-emerald-600 dark:text-emerald-400 font-mono text-[11px] flex items-center gap-1.5 font-bold">
                <Zap className="w-3.5 h-3.5 fill-emerald-500 flex-shrink-0" />
                <span>{lang === 'ar' ? '🟢 جاري التنفيذ • 68.5% إنجاز' : '🟢 In Progress • 68.5% Done'}</span>
              </span>
            </div>

            {/* 4K Hero Title */}
            <div className="space-y-3">
              <h1 className={`text-4xl sm:text-6xl lg:text-7xl font-black leading-[1.12] tracking-tight ${
                theme === 'light' ? 'text-slate-950' : 'text-white'
              }`}>
                {t.heroMainTitle1} <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-500 via-amber-600 to-amber-700 dark:from-amber-300 dark:via-amber-400 dark:to-amber-500 glow-gold-text">
                  {t.heroMainTitle2}
                </span>
                <span className="inline-block ms-3 px-3.5 py-1 text-xl sm:text-2xl font-mono font-black rounded-2xl bg-amber-500/20 text-amber-600 dark:text-amber-400 border border-amber-500/40 align-middle shadow-sm">
                  {t.heroDistanceBadge}
                </span>
              </h1>
              <p className={`text-lg sm:text-2xl font-light tracking-wide ${
                theme === 'light' ? 'text-slate-800' : 'text-slate-200'
              }`}>
                {lang === 'ar' ? 'بوابة المشاريع الحكومية – جهاز تنفيذ مشروعات المواصلات' : 'Government Projects Command Portal – Transportation Authority'}
              </p>
            </div>

            {/* Description */}
            <p className={`text-sm sm:text-base max-w-xl leading-relaxed font-normal ${
              theme === 'light' ? 'text-slate-700' : 'text-slate-300'
            }`}>
              {t.heroDesc}
            </p>

            {/* 4K Action Buttons */}
            <div className="pt-2 flex flex-wrap items-center gap-3.5">
              {/* Primary Action Button: Explore Projects */}
              <button
                onClick={() => {
                  const el = document.getElementById('projects-section');
                  if (el) el.scrollIntoView({ behavior: 'smooth' });
                }}
                className="px-7 py-4 rounded-2xl bg-gradient-to-r from-amber-500 via-amber-600 to-amber-700 hover:from-amber-400 hover:to-amber-600 text-white font-black text-sm shadow-2xl shadow-amber-500/35 transition-all duration-300 hover:scale-105 active:scale-95 flex items-center gap-3 cursor-pointer"
              >
                <span>{lang === 'ar' ? 'استكشف مشروعات أوباري – غات' : 'Explore Ubari – Ghat Projects'}</span>
                <span className="text-lg">←</span>
              </button>

              {/* Login / Auth Button */}
              <button
                onClick={user ? () => setActiveTab('dashboard') : onOpenGoogleAuth}
                className={`px-7 py-4 rounded-2xl font-black text-sm border backdrop-blur-2xl transition-all duration-300 hover:scale-105 active:scale-95 flex items-center justify-center cursor-pointer shadow-xl ${
                  theme === 'light'
                    ? 'bg-white hover:bg-slate-50 text-slate-900 border-slate-300 shadow-slate-200'
                    : 'bg-white/10 hover:bg-white/20 text-white border-white/25 shadow-black/40'
                }`}
              >
                <span>{user ? (lang === 'ar' ? 'لوحة التحكم 📊' : 'Dashboard 📊') : (lang === 'ar' ? 'تسجيل الدخول 🔑' : 'Sign In 🔑')}</span>
              </button>
            </div>

          </div>

          {/* ── Left Column: Ultra-Luxury Master Project Card ── */}
          <div className="w-full lg:w-5/12 flex flex-col items-center lg:items-end animate-scaleUp">
            
            <div className={`w-full max-w-md p-6 sm:p-7 rounded-[36px] space-y-5 glass-card-hover border shadow-2xl text-start relative overflow-hidden ${
              theme === 'light' 
                ? 'bg-white/95 border-amber-300/80 shadow-slate-200/90 text-slate-900' 
                : 'bg-[#0a0f1e]/95 border-amber-500/35 shadow-black/80 text-white'
            }`}>
              
              {/* Photo Box with Live Badges */}
              <div className="h-52 rounded-2xl overflow-hidden relative border border-slate-200 dark:border-white/15 shadow-inner">
                <img 
                  src="/road-asphalt-paver.jpg" 
                  alt="أعمال رصف طريق أوباري غات 4K" 
                  className="w-full h-full object-cover hover:scale-105 transition-transform duration-700"
                />
                
                {/* Status Badges */}
                <div className="absolute top-3 right-3 bg-emerald-500/90 text-slate-950 backdrop-blur-md px-3 py-1 rounded-full text-xs font-black flex items-center gap-1.5 shadow-lg border border-emerald-400">
                  <span className="w-2 h-2 rounded-full bg-slate-950 animate-pulse"></span>
                  <span>{lang === 'ar' ? '🟢 جاري التنفيذ' : '🟢 In Progress'}</span>
                </div>

                <div className="absolute bottom-3 right-3 bg-black/80 backdrop-blur-md px-3 py-1 rounded-full text-amber-300 text-xs font-mono font-black border border-white/15">
                  360 KM • 4 Sectors
                </div>
              </div>

              {/* Title & Contractor */}
              <div className="space-y-1">
                <h3 className={`font-black text-lg ${theme === 'light' ? 'text-slate-950' : 'text-white'}`}>
                  {lang === 'ar' ? 'مشروع صيانة طريق أوباري – غات' : 'Ubari – Ghat Highway Project'}
                </h3>
                <div className="flex items-center gap-2 text-xs text-amber-500 font-bold">
                  <Building2 className="w-3.5 h-3.5" />
                  <span>{lang === 'ar' ? 'الجهة: ائتلاف شركات الطرق وفزان' : 'Consortium of National Road Contractors'}</span>
                </div>
              </div>

              {/* Radial Progress Ring & Dates Grid */}
              <div className={`p-4 rounded-2xl border flex items-center justify-between gap-4 ${
                theme === 'light' ? 'bg-slate-50 border-slate-200' : 'bg-white/5 border-white/10'
              }`}>
                {/* SVG Radial Progress Ring */}
                <div className="relative w-24 h-24 flex items-center justify-center flex-shrink-0">
                  <svg className="w-full h-full transform -rotate-90" viewBox="0 0 90 90">
                    <circle
                      cx="45"
                      cy="45"
                      r={radius}
                      stroke="currentColor"
                      strokeWidth="8"
                      className="text-slate-300 dark:text-slate-800"
                      fill="transparent"
                    />
                    <circle
                      cx="45"
                      cy="45"
                      r={radius}
                      stroke="#FFAB00"
                      strokeWidth="8"
                      strokeDasharray={circumference}
                      strokeDashoffset={strokeDashoffset}
                      strokeLinecap="round"
                      fill="transparent"
                      className="transition-all duration-1000 ease-out"
                    />
                  </svg>
                  <div className="absolute flex flex-col items-center justify-center">
                    <span className="font-mono font-black text-base text-amber-500">{progressVal}%</span>
                    <span className="text-[9px] text-slate-400 font-bold">إنجاز</span>
                  </div>
                </div>

                {/* Project Timeline Dates */}
                <div className="space-y-2 text-xs">
                  <div className="space-y-0.5">
                    <span className="text-[10px] text-slate-400 block flex items-center gap-1">
                      <Calendar className="w-3 h-3 text-amber-500" />
                      <span>{lang === 'ar' ? 'تاريخ البدء المعتمد:' : 'Start Date:'}</span>
                    </span>
                    <strong className="font-bold text-slate-700 dark:text-slate-200 font-mono">يناير 2025</strong>
                  </div>
                  <div className="space-y-0.5">
                    <span className="text-[10px] text-slate-400 block flex items-center gap-1">
                      <Clock className="w-3 h-3 text-emerald-500" />
                      <span>{lang === 'ar' ? 'الإنجاز المتوقع:' : 'Target Date:'}</span>
                    </span>
                    <strong className="font-bold text-emerald-600 dark:text-emerald-400 font-mono">ديسمبر 2026</strong>
                  </div>
                </div>
              </div>

            </div>

          </div>

        </div>

        {/* ── 4 Live KPI Telemetry Strip Directly Under Hero ── */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4">
          {[
            { label: lang === 'ar' ? 'مسافة الرصف المنجزة' : 'Paved Distance', value: `${summaryData?.asphaltPavedKm ?? '246.6'} كم`, sub: 'من إجمالي 360 كم', icon: Layers, color: 'text-amber-500', bg: 'bg-amber-500/10' },
            { label: lang === 'ar' ? 'أسطول الآليات والمعدات' : 'Heavy Fleet Units', value: '142 آلية', sub: 'تعمل 24/7 في الحقل', icon: Truck, color: 'text-cyan-500', bg: 'bg-cyan-500/10' },
            { label: lang === 'ar' ? 'أعمدة الإنارة الشمسية' : 'Solar Light Poles', value: '760 عمود', sub: 'من إجمالي 1,100 عمود', icon: Sun, color: 'text-amber-400', bg: 'bg-amber-400/10' },
            { label: lang === 'ar' ? 'مطابقة الجودة المعملية' : 'QA Test Compliance', value: '98.4%', sub: 'وفق معايير مارشال', icon: ShieldCheck, color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
          ].map((kpi) => {
            const Icon = kpi.icon;
            return (
              <div
                key={kpi.label}
                className={`p-5 rounded-2xl border shadow-lg space-y-2 text-start transition-all glass-card-hover ${
                  theme === 'light' ? 'bg-white border-slate-200/90 shadow-slate-100' : 'bg-[#0a0f1e]/90 border-white/10'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className={`p-2 rounded-xl ${kpi.bg} ${kpi.color}`}>
                    <Icon className="w-5 h-5" />
                  </span>
                  <span className="text-[10px] text-slate-400 font-mono">مباشر 2026</span>
                </div>
                <div className="space-y-0.5">
                  <span className="text-xs text-slate-500 dark:text-slate-400 font-medium block">{kpi.label}</span>
                  <h4 className={`text-xl font-black font-mono ${kpi.color}`}>{kpi.value}</h4>
                  <span className="text-[10px] text-slate-400 block">{kpi.sub}</span>
                </div>
              </div>
            );
          })}
        </div>

      </div>

    </section>
  );
}
