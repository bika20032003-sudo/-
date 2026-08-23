import React, { useState } from 'react';
import { 
  MapPin, 
  Navigation, 
  ExternalLink, 
  Compass,
  Sparkles,
  Layers
} from 'lucide-react';
import { translations } from '../i18n/translations';

const getMapLocations = (lang) => [
  {
    id: 'ubari',
    title: lang === 'ar' ? 'أوباري (نقطة الانطلاق)' : 'Ubari (Starting Point)',
    coords: '26.5925,12.7803',
    mapUrl: 'https://maps.google.com/maps?q=Ubari,Libya&t=&z=11&ie=UTF8&iwloc=&output=embed',
    directUrl: 'https://maps.google.com/?q=26.5925,12.7803',
    sector: lang === 'ar' ? 'المحطة 000+00' : 'Station 000+00',
    contractor: lang === 'ar' ? 'شركة أوباري الوطنية للمقاولات' : 'Ubari National Contracting Co.',
    progress: 82,
    desc: lang === 'ar' 
      ? 'منطقة انطلاق المشروع والمجمع الإداري الرئيسي لجهاز تنفيذ مشروعات المواصلات.'
      : 'Project starting zone and headquarters for the Transportation Projects Execution Authority.'
  },
  {
    id: 'alfuroos',
    title: lang === 'ar' ? 'قطاع الفروض - بيسان' : 'Al-Furoos – Bisan Sector',
    coords: '26.2100,12.1500',
    mapUrl: 'https://maps.google.com/maps?q=Al+Furoos,Libya&t=&z=10&ie=UTF8&iwloc=&output=embed',
    directUrl: 'https://maps.google.com/?q=26.2100,12.1500',
    sector: lang === 'ar' ? 'المحطة 085+00' : 'Station 085+00',
    contractor: lang === 'ar' ? 'شركة الفروض العامة للإنشاءات' : 'Al-Furoos General Construction Co.',
    progress: 74,
    desc: lang === 'ar'
      ? 'أعمال طبقة الأسفلت الرابطة وإنجاز العبارات الخرسانية الصندوقية.'
      : 'Binder asphalt layer works and box culvert drainage installations.'
  },
  {
    id: 'aluwaynat',
    title: lang === 'ar' ? 'قطاع العوينات - البركت' : 'Al-Uwaynat – Barkat Sector',
    coords: '25.3500,10.6800',
    mapUrl: 'https://maps.google.com/maps?q=Al+Uwaynat,Libya&t=&z=10&ie=UTF8&iwloc=&output=embed',
    directUrl: 'https://maps.google.com/?q=25.3500,10.6800',
    sector: lang === 'ar' ? 'المحطة 215+00' : 'Station 215+00',
    contractor: lang === 'ar' ? 'ائتلاف شركات الطرق الأفريقية' : 'African Roads Consortium',
    progress: 65,
    desc: lang === 'ar'
      ? 'إنجاز أعمال التوسعة والفرش والتجهيز لإنارة أعمدة الطاقة الشمسية.'
      : 'Road expansion, grading, and solar lighting pole foundation preparation.'
  },
  {
    id: 'ghat',
    title: lang === 'ar' ? 'مدينة غات (نهاية الطريق 360 كم)' : 'Ghat City (Route End 360 km)',
    coords: '24.9647,10.1764',
    mapUrl: 'https://maps.google.com/maps?q=Ghat,Libya&t=&z=11&ie=UTF8&iwloc=&output=embed',
    directUrl: 'https://maps.google.com/?q=24.9647,10.1764',
    sector: lang === 'ar' ? 'المحطة 360+00' : 'Station 360+00',
    contractor: lang === 'ar' ? 'شركة غات الدولية للمقاولات' : 'Ghat International Contracting Co.',
    progress: 58,
    desc: lang === 'ar'
      ? 'المنفذ الحدودي الجنوبي الغربي وتأهيل مداخل المدينة التاريخية.'
      : 'Southwestern border gateway and entrance boulevard development.'
  }
];

export default function InteractiveProjectMap({ theme, lang = 'ar' }) {
  const t = translations[lang] || translations.ar;
  const locations = getMapLocations(lang);
  const [selectedLocId, setSelectedLocId] = useState('ubari');

  const selectedLoc = locations.find(l => l.id === selectedLocId) || locations[0];

  return (
    <section className="py-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-8 animate-fadeIn select-none">
      
      {/* Section Header */}
      <div className="space-y-3 text-start">
        <div className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-black border shadow-sm ${
          theme === 'light'
            ? 'bg-amber-100/90 border-amber-300 text-amber-950'
            : 'bg-amber-500/10 border-amber-500/35 text-amber-300'
        }`}>
          <MapPin className="w-4 h-4 text-amber-500" />
          <span>{t.mapBadge}</span>
        </div>

        <h2 className={`text-3xl sm:text-5xl font-black tracking-tight ${
          theme === 'light' ? 'text-slate-950' : 'text-white'
        }`}>
          {t.mapTitle}
        </h2>

        <p className={`text-xs sm:text-sm max-w-2xl font-medium leading-relaxed ${
          theme === 'light' ? 'text-slate-600' : 'text-slate-400'
        }`}>
          {t.mapDesc}
        </p>
      </div>

      {/* Locations Switcher Bar */}
      <div className="flex flex-wrap items-center gap-2.5">
        {locations.map((loc) => {
          const isSelected = loc.id === selectedLoc.id;
          return (
            <button
              key={loc.id}
              onClick={() => setSelectedLocId(loc.id)}
              className={`px-5 py-3 rounded-2xl text-xs font-black transition-all duration-300 flex items-center gap-2.5 border shadow-sm cursor-pointer ${
                isSelected
                  ? 'bg-gradient-to-r from-amber-400 via-amber-500 to-amber-600 text-slate-950 font-black border-amber-300 shadow-xl shadow-amber-500/30 scale-[1.03]'
                  : theme === 'light'
                    ? 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50 hover:border-slate-300 shadow-slate-100'
                    : 'bg-white/[0.04] border-white/10 text-slate-300 hover:bg-white/10 hover:border-white/20'
              }`}
            >
              <Compass className={`w-4 h-4 ${isSelected ? 'text-slate-950' : 'text-amber-500'}`} />
              <span>{loc.title}</span>
            </button>
          );
        })}
      </div>

      {/* Main 4K Map Container */}
      <div className={`relative overflow-hidden rounded-[32px] border shadow-2xl transition-all duration-400 ${
        theme === 'light'
          ? 'bg-white border-slate-200/90 shadow-slate-300/80'
          : 'bg-[#0a0f1d] border-white/15 shadow-black/80'
      }`}>
        
        {/* Map Header Card Info Overlay */}
        <div className={`p-5 sm:p-7 border-b flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
          theme === 'light' ? 'bg-slate-50/90 border-slate-200' : 'bg-black/40 border-white/10'
        }`}>
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/15 border border-amber-500/35 flex items-center justify-center text-amber-500 shadow-md flex-shrink-0">
              <MapPin className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className={`font-black text-base sm:text-lg ${theme === 'light' ? 'text-slate-950' : 'text-white'}`}>
                  {selectedLoc.title}
                </h3>
                <span className="text-[10px] px-2.5 py-0.5 rounded-lg bg-emerald-500/20 text-emerald-500 font-extrabold border border-emerald-500/30">
                  {t.mapLive} 2026
                </span>
              </div>
              <p className={`text-xs mt-0.5 font-medium leading-relaxed ${theme === 'light' ? 'text-slate-600' : 'text-slate-400'}`}>
                {selectedLoc.desc}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <a
              href={selectedLoc.directUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="px-5 py-3 rounded-2xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-black flex items-center gap-2.5 transition-all shadow-xl shadow-amber-500/25 hover:scale-105"
            >
              <Navigation className="w-4 h-4" />
              <span>{t.btnOpenGoogleMaps}</span>
              <ExternalLink className="w-3.5 h-3.5 opacity-70" />
            </a>
          </div>
        </div>

        {/* Map Frame */}
        <div className="relative w-full h-[400px] sm:h-[480px] bg-slate-950">
          <iframe
            title={selectedLoc.title}
            src={selectedLoc.mapUrl}
            width="100%"
            height="100%"
            style={{ 
              border: 0, 
              filter: theme === 'dark' ? 'contrast(1.08) saturate(1.15)' : 'none' 
            }}
            allowFullScreen=""
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            className="w-full h-full"
          />

          {/* Floating Telemetry HUD Overlay */}
          <div className={`absolute bottom-5 left-5 p-4 rounded-2xl border backdrop-blur-2xl shadow-2xl max-w-xs text-xs space-y-2 hidden sm:block ${
            theme === 'light' ? 'bg-white/95 border-slate-200 text-slate-900 shadow-slate-300' : 'bg-[#06080E]/95 border-white/25 text-slate-100 shadow-black'
          }`}>
            <div className="flex items-center justify-between font-extrabold">
              <span>{t.mapSector}</span>
              <span className="text-amber-500 font-mono font-black">{selectedLoc.sector}</span>
            </div>
            <div className={`text-[11px] font-medium ${theme === 'light' ? 'text-slate-600' : 'text-slate-400'}`}>
              {t.mapContractor} {selectedLoc.contractor}
            </div>
            <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden border border-white/10 mt-1">
              <div className="bg-gradient-to-r from-amber-500 to-amber-300 h-full rounded-full shimmer-active" style={{ width: `${selectedLoc.progress}%` }} />
            </div>
          </div>
        </div>

      </div>
    </section>
  );
}
