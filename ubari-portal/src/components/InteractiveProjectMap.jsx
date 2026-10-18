import React, { useState, useEffect, useRef } from 'react';
import { 
  MapPin, 
  Navigation, 
  ExternalLink, 
  Compass,
  Layers,
  X
} from 'lucide-react';
import { translations } from '../i18n/translations';

const getMapLocations = (lang) => [
  {
    id: 'ubari',
    title: lang === 'ar' ? 'ﻱ (نقطة الانطلاق)' : 'Ubari (Starting Point)',
    coords: '26.5925,12.7803',
    sector: lang === 'ar' ? 'المحطة 000+00' : 'Station 000+00',
    stage: lang === 'ar' ? 'طبقة الرصف السطحية وأعمال الأكتاف' : 'Surface Paving & Shoulders',
    progress: 82,
    desc: lang === 'ar' 
      ? 'منطقة انطلاق المشروع والمجمع الإداري الرئيسي لجهاز تنفيذ مشروعات المواصلات.'
      : 'Project starting zone and headquarters for the Transportation Projects Execution Authority.'
  },
  {
    id: 'alfuroos',
    title: lang === 'ar' ? 'قطاع الفروض - بيسان' : 'Al-Furoos – Bisan Sector',
    coords: '26.2100,12.1500',
    sector: lang === 'ar' ? 'المحطة 085+00' : 'Station 085+00',
    stage: lang === 'ar' ? 'طبقة الأساس والعبّارات الخرسانية' : 'Base Course & Box Culverts',
    progress: 74,
    desc: lang === 'ar'
      ? 'أعمال طبقة الأسفلت الرابطة وإنجاز العبارات الخرسانية الصندوقية.'
      : 'Binder asphalt layer works and box culvert drainage installations.'
  },
  {
    id: 'aluwaynat',
    title: lang === 'ar' ? 'قطاع العوينات - البركت' : 'Al-Uwaynat – Barkat Sector',
    coords: '25.3500,10.6800',
    sector: lang === 'ar' ? 'المحطة 215+00' : 'Station 215+00',
    stage: lang === 'ar' ? 'أعمال التوسعة وإنارة الطاقة الشمسية' : 'Road Widening & Solar Lighting',
    progress: 65,
    desc: lang === 'ar'
      ? 'إنجاز أعمال التوسعة والفرش والتجهيز لإنارة أعمدة الطاقة الشمسية.'
      : 'Road expansion, grading, and solar lighting pole foundation preparation.'
  },
  {
    id: 'ghat',
    title: lang === 'ar' ? 'مدينة غات (نهاية الطريق 360 كم)' : 'Ghat City (Route End 360 km)',
    coords: '24.9647,10.1764',
    sector: lang === 'ar' ? 'المحطة 360+00' : 'Station 360+00',
    stage: lang === 'ar' ? 'تأهيل المداخل واللوحات المرورية' : 'Entry Boulevards & Signage',
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
  const [mapType, setMapType] = useState('m'); // 'm' = Roadmap, 'k' = Satellite
  const [isMapTouchActive, setIsMapTouchActive] = useState(false);

  const selectedLoc = locations.find(l => l.id === selectedLocId) || locations[0];
  const embedUrl = `https://maps.google.com/maps?q=${selectedLoc.coords}&hl=${lang}&t=${mapType}&z=11&ie=UTF8&iwloc=&output=embed`;
  const directUrl = `https://maps.google.com/?q=${selectedLoc.coords}`;

  return (
    <section id="map-section" className="py-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-8 animate-fadeIn select-none">
      
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

        <h2 className={`text-xl xs:text-2xl sm:text-4xl lg:text-5xl font-black leading-tight sm:leading-snug ${
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

      {/* Locations Switcher Bar with Fluid Mobile Horizontal Scroll */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none sm:flex-wrap">
        {locations.map((loc) => {
          const isSelected = loc.id === selectedLoc.id;
          return (
            <button
              key={loc.id}
              onClick={() => setSelectedLocId(loc.id)}
              className={`px-3.5 sm:px-5 py-2 sm:py-3 rounded-2xl text-[11px] sm:text-xs font-bold transition-all duration-200 flex items-center gap-1.5 sm:gap-2 border shadow-sm cursor-pointer shrink-0 whitespace-nowrap ${
                isSelected
                  ? 'bg-amber-500 text-slate-950 font-black border-amber-400 shadow-lg shadow-amber-500/25 scale-[1.02]'
                  : theme === 'light'
                    ? 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50 hover:border-slate-300 shadow-slate-100'
                    : 'bg-white/[0.04] border-white/10 text-slate-300 hover:bg-white/10 hover:border-white/20'
              }`}
            >
              <Compass className={`w-3.5 h-3.5 sm:w-4 sm:h-4 ${isSelected ? 'text-slate-950' : 'text-amber-500'}`} />
              <span>{loc.title}</span>
            </button>
          );
        })}
      </div>

      {/* Main 4K Map Container */}
      <div 
        className={`relative overflow-hidden rounded-[24px] sm:rounded-[32px] border shadow-2xl transition-all duration-300 ${
        theme === 'light'
          ? 'bg-white border-slate-200/90 shadow-slate-300/80'
          : 'bg-[#0a0f1d] border-white/15 shadow-black/80'
      }`}>
        
        {/* Map Header Card Info Overlay */}
        <div className={`p-3.5 sm:p-7 border-b flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 ${
          theme === 'light' ? 'bg-slate-50/90 border-slate-200' : 'bg-black/40 border-white/10'
        }`}>
          <div className="flex items-start sm:items-center gap-3 sm:gap-3.5 min-w-0 flex-1">
            <div className="w-9 h-9 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-amber-500/15 border border-amber-500/35 flex items-center justify-center text-amber-500 shadow-md shrink-0">
              <MapPin className="w-4 h-4 sm:w-6 sm:h-6" />
            </div>
            <div className="min-w-0 flex-1 text-start">
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className={`font-black text-sm sm:text-lg truncate ${theme === 'light' ? 'text-slate-950' : 'text-white'}`}>
                  {selectedLoc.title}
                </h3>
                <span className="text-[10px] px-2 py-0.5 rounded-lg bg-emerald-500/20 text-emerald-500 font-bold border border-emerald-500/30 shrink-0">
                  {t.mapLive}
                </span>
              </div>
              <p className={`text-xs mt-0.5 font-medium leading-relaxed ${theme === 'light' ? 'text-slate-600' : 'text-slate-400'}`}>
                {selectedLoc.desc}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap sm:flex-nowrap items-center gap-2 shrink-0 w-full sm:w-auto">
            {/* View Mode Toggle: Roadmap vs Satellite */}
            <div className={`p-1 rounded-xl border flex items-center gap-1 flex-1 sm:flex-initial justify-center ${
              theme === 'light' ? 'bg-slate-200/80 border-slate-300' : 'bg-white/10 border-white/15'
            }`}>
              <button
                onClick={() => setMapType('m')}
                className={`flex-1 sm:flex-initial px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  mapType === 'm'
                    ? 'bg-amber-500 text-slate-950 font-black shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {lang === 'ar' ? 'خريطة الطرق' : 'Roadmap'}
              </button>
              <button
                onClick={() => setMapType('k')}
                className={`flex-1 sm:flex-initial px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  mapType === 'k'
                    ? 'bg-amber-500 text-slate-950 font-black shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {lang === 'ar' ? 'قمر صناعي' : 'Satellite'}
              </button>
            </div>

            <a
              href={directUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 sm:flex-initial justify-center px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold flex items-center gap-2 transition-all shadow-md shadow-amber-500/20 active:scale-95 whitespace-nowrap"
            >
              <Navigation className="w-3.5 h-3.5" />
              <span>{t.btnOpenGoogleMaps}</span>
              <ExternalLink className="w-3.5 h-3.5 opacity-70" />
            </a>
          </div>
        </div>

        {/* Map Frame */}
        <div className="relative w-full h-[380px] sm:h-[500px] bg-slate-950 overflow-hidden">
          <iframe
            key={`${selectedLoc.id}-${mapType}`}
            title={selectedLoc.title}
            src={embedUrl}
            width="100%"
            height="100%"
            style={{ border: 0 }}
            allowFullScreen=""
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            className={`w-full h-full transition-opacity ${
              isMapTouchActive ? 'pointer-events-auto' : 'pointer-events-none sm:pointer-events-auto'
            }`}
          />

          {/* Mobile Tap-To-Interact Protection Overlay */}
          {!isMapTouchActive && (
            <div 
              onClick={() => setIsMapTouchActive(true)}
              className="sm:hidden absolute inset-0 bg-black/40 flex flex-col items-center justify-center p-4 text-center cursor-pointer z-10"
            >
              <div className="px-4 py-2.5 rounded-2xl bg-amber-500 text-slate-950 font-black text-xs shadow-xl flex items-center gap-2">
                <Navigation className="w-4 h-4" />
                <span>{lang === 'ar' ? 'انقر لتفعيل تحريك وتكبير الخريطة' : 'Tap to interact with map'}</span>
              </div>
              <p className="text-[10px] text-white/80 mt-2 font-medium">
                {lang === 'ar' ? 'أو تابع التمرير لتصفح الصفحة بسلاسة' : 'Or keep scrolling past this section'}
              </p>
            </div>
          )}

          {/* Mobile Re-Lock Button when Map is active */}
          {isMapTouchActive && (
            <button
              onClick={() => setIsMapTouchActive(false)}
              className="sm:hidden absolute top-3 right-3 z-20 px-3 py-1.5 rounded-xl bg-slate-900/90 text-white border border-white/20 text-xs font-bold shadow-lg flex items-center gap-1.5"
            >
              <X className="w-3.5 h-3.5" />
              <span>{lang === 'ar' ? 'قفل الخريطة للمتابعة' : 'Lock Map'}</span>
            </button>
          )}

          {/* Floating Telemetry HUD Overlay */}
          <div className={`absolute bottom-4 left-4 sm:bottom-5 sm:left-5 p-3.5 sm:p-4 rounded-2xl border shadow-xl max-w-xs text-xs space-y-2 hidden sm:block ${
            theme === 'light' ? 'bg-white/95 border-slate-200 text-slate-900 shadow-slate-300' : 'bg-[#06080E]/95 border-white/25 text-slate-100 shadow-black'
          }`}>
            <div className="flex items-center justify-between font-extrabold">
              <span>{t.mapSector}</span>
              <span className="text-amber-500 font-mono font-black">{selectedLoc.sector}</span>
            </div>
            <div className={`text-[11px] font-medium ${theme === 'light' ? 'text-slate-600' : 'text-slate-400'}`}>
              <span className="text-slate-500">{lang === 'ar' ? 'المرحلة الفنية: ' : 'Technical Stage: '}</span>
              <span className="font-bold">{selectedLoc.stage}</span>
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
