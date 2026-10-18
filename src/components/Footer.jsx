import React from 'react';
import { 
  MapPin, 
  Globe, 
  ArrowUp,
  ShieldCheck
} from 'lucide-react';
import { translations } from '../i18n/translations';

export default function Footer({ setActiveTab, theme, lang = 'ar' }) {
  const t = translations[lang] || translations.ar;

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className={`text-xs pt-16 pb-10 px-4 sm:px-6 lg:px-8 relative overflow-hidden border-t select-none ${
      theme === 'light'
        ? 'bg-white text-slate-600 border-slate-200'
        : 'bg-[#05070c] text-slate-400 border-white/10'
    }`}>
      
      {/* Top Ambient Light for Footer (GPU-friendly) */}
      <div 
        className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-24 pointer-events-none opacity-20"
        style={{ background: 'radial-gradient(circle, rgba(255,171,0,0.3) 0%, transparent 70%)' }}
      />

      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-12 gap-8 mb-10 relative z-10">
        
        {/* Col 1: Agency Brand */}
        <div className="md:col-span-5 space-y-4 text-start">
          <div className="flex items-center gap-3.5">
            <div className="w-13 h-13 rounded-2xl bg-white border-2 border-amber-500/50 flex items-center justify-center p-0.5 shadow-xl overflow-hidden flex-shrink-0">
              <img src="/logo-agency.jpg" alt="جهاز تنفيذ مشروعات المواصلات" className="w-full h-full object-contain rounded-2xl" />
            </div>
            <div>
              <h3 className={`font-black text-base ${theme === 'light' ? 'text-slate-950' : 'text-white'}`}>{t.footerAgencyTitle}</h3>
              <span className="text-[11px] text-amber-500 font-bold block mt-0.5">
                {t.footerInitiative}
              </span>
            </div>
          </div>

          <p className={`text-xs leading-relaxed max-w-md font-medium ${theme === 'light' ? 'text-slate-600' : 'text-slate-400'}`}>
            {lang === 'ar' 
              ? 'البوابة الرقمية الموحدة لمتابعة تنفيذ ورصف طريق أوبارﻱ – غات (طول 360 كم) بأعلى معايير الجودة والإنارة بالطاقة الشمسية والربط الإلكتروني.'
              : 'Unified digital portal monitoring the execution and paving of the 360km Ubari – Ghat Highway according to modern engineering standards and solar lighting.'}
          </p>
        </div>

        {/* Col 2: Quick Links */}
        <div className="md:col-span-3 space-y-3.5 text-start">
          <h4 className={`font-black text-sm leading-snug ${theme === 'light' ? 'text-slate-950' : 'text-white'}`}>
            {lang === 'ar' ? 'أقسام البوابة' : 'Quick Navigation'}
          </h4>
          <ul className="space-y-2.5 font-medium">
            <li>
              <button 
                onClick={() => {
                  setActiveTab('hero');
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }} 
                className="hover:text-amber-500 transition-colors cursor-pointer flex items-center gap-1.5"
              >
                <span className="text-amber-500">›</span>
                <span>{t.navHome}</span>
              </button>
            </li>
            <li>
              <button 
                onClick={() => {
                  setActiveTab('hero');
                  setTimeout(() => {
                    const el = document.getElementById('projects-section');
                    if (el) el.scrollIntoView({ behavior: 'smooth' });
                  }, 60);
                }} 
                className="hover:text-amber-500 transition-colors cursor-pointer flex items-center gap-1.5"
              >
                <span className="text-amber-500">›</span>
                <span>{lang === 'ar' ? 'المشاريع الاستراتيجية' : 'Strategic Projects'}</span>
              </button>
            </li>
            <li>
              <button 
                onClick={() => {
                  setActiveTab('hero');
                  setTimeout(() => {
                    const el = document.getElementById('about-section');
                    if (el) el.scrollIntoView({ behavior: 'smooth' });
                  }, 60);
                }} 
                className="hover:text-amber-500 transition-colors cursor-pointer flex items-center gap-1.5"
              >
                <span className="text-amber-500">›</span>
                <span>{lang === 'ar' ? 'نبذة عن المشروع' : 'Project Overview'}</span>
              </button>
            </li>
            <li>
              <button 
                onClick={() => {
                  setActiveTab('hero');
                  setTimeout(() => {
                    const el = document.getElementById('map-section');
                    if (el) el.scrollIntoView({ behavior: 'smooth' });
                  }, 60);
                }} 
                className="hover:text-amber-500 transition-colors cursor-pointer flex items-center gap-1.5"
              >
                <span className="text-amber-500">›</span>
                <span>{lang === 'ar' ? 'الخريطة والموقع الجغرافي' : 'Interactive Map'}</span>
              </button>
            </li>
          </ul>
        </div>

        {/* Col 3: Official Info */}
        <div className="md:col-span-4 space-y-3.5 text-start">
          <h4 className={`font-black text-sm leading-snug ${theme === 'light' ? 'text-slate-950' : 'text-white'}`}>
            {lang === 'ar' ? 'بيانات الاتصال والتواصل' : 'Contact & Headquarters'}
          </h4>
          <p className="flex items-center gap-2.5 font-medium">
            <MapPin className="w-4 h-4 text-amber-500 flex-shrink-0" />
            <span>{lang === 'ar' ? 'طرابلس / غريان / سبها / أوبارﻱ - دولة ليبيا' : 'Tripoli / Sabha / Ubari – Libya'}</span>
          </p>
          <p className="flex items-center gap-2.5 font-mono">
            <Globe className="w-4 h-4 text-cyan-500 flex-shrink-0" />
            <span>www.transport.gov.ly</span>
          </p>
        </div>

      </div>

      {/* Bottom Copyright Bar */}
      <div className={`max-w-7xl mx-auto pt-6 border-t flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] font-medium relative z-10 ${
        theme === 'light' ? 'border-slate-200 text-slate-500' : 'border-white/10 text-slate-500'
      }`}>
        <p>{t.footerRights}</p>

        <button 
          onClick={scrollToTop}
          className={`px-4 py-2.5 rounded-2xl transition-all border flex items-center gap-2 font-black cursor-pointer shadow-sm hover:scale-105 ${
            theme === 'light'
              ? 'bg-slate-100 hover:bg-amber-500 hover:text-slate-950 text-slate-700 border-slate-200'
              : 'bg-white/5 hover:bg-amber-500 hover:text-slate-950 text-slate-300 border-white/10'
          }`}
        >
          <span>{lang === 'ar' ? 'العودة للأعلى' : 'Back to Top'}</span>
          <ArrowUp className="w-3.5 h-3.5" />
        </button>
      </div>

    </footer>
  );
}
