import React, { useState, useEffect } from 'react';
import { MapPin, Navigation, ExternalLink, Compass, Layers, ShieldCheck, CheckCircle2, AlertTriangle, Clock, ArrowUpRight, X } from 'lucide-react';
import { nationalProjects, getSavedExecutiveProjects } from '../services/api';
import { resolveAsset } from '../utils/assets';

export default function InteractiveLibyaMap({ theme, lang = 'ar' }) {
  const [filterStatus, setFilterStatus] = useState('all');
  const [projectsList, setProjectsList] = useState(getSavedExecutiveProjects);
  const [selectedProject, setSelectedProject] = useState(() => projectsList[0] || nationalProjects[0]);
  const [mapMode, setMapMode] = useState('tactical'); // 'tactical' | 'satellite'

  useEffect(() => {
    const handleUpdate = () => {
      const updated = getSavedExecutiveProjects();
      setProjectsList(updated);
      setSelectedProject(prev => {
        if (!prev) return updated[0] || null;
        const found = updated.find(p => p.id === prev.id);
        return found || updated[0] || null;
      });
    };

    window.addEventListener('storage', handleUpdate);
    window.addEventListener('cloud_projects_updated', handleUpdate);
    return () => {
      window.removeEventListener('storage', handleUpdate);
      window.removeEventListener('cloud_projects_updated', handleUpdate);
    };
  }, []);

  const filteredProjects = projectsList.filter(p => {
    if (filterStatus === 'all') return true;
    return p.status === filterStatus;
  });


  return (
    <section id="map-section" className="py-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-8 animate-fadeIn select-none">
      
      {/* ── Section Title & Status Filters Header ── */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b pb-6 border-slate-200 dark:border-white/10">
        <div className="text-start space-y-2">
          <div className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-black border shadow-sm ${
            theme === 'light'
              ? 'bg-amber-100/90 border-amber-300 text-amber-950'
              : 'bg-amber-500/10 border-amber-500/35 text-amber-300'
          }`}>
            <MapPin className="w-4 h-4 text-amber-500" />
            <span>{lang === 'ar' ? 'المنظومة الجغرافية التفاعلية' : 'Interactive Geographic GIS Map'}</span>
          </div>
          <h2 className={`text-3xl sm:text-5xl font-black leading-snug ${
            theme === 'light' ? 'text-slate-950' : 'text-white'
          }`}>
            {lang === 'ar' ? 'خريطة مشروعات الطرق الاستراتيجية في ليبيا' : 'Libya Strategic Highway Projects Network'}
          </h2>
          <p className={`text-xs sm:text-base font-medium max-w-2xl ${
            theme === 'light' ? 'text-slate-600' : 'text-slate-400'
          }`}>
            {lang === 'ar'
              ? 'متابعة حية لمواقع مشروعات الطرق السريعة ومسار طريق أوباري – غات (360 كم) وشبكة الربط الوطني عبر الأقاليم.'
              : 'Live spatial tracking of national highway corridors, the 360km Ubari – Ghat route, and inter-regional corridors.'}
          </p>
        </div>

        {/* Tactical / Satellite Mode Toggle & Map Filter Pills */}
        <div className="flex flex-wrap items-center gap-2">
          <div className={`p-1.5 rounded-2xl border flex items-center gap-1 ${
            theme === 'light' ? 'bg-white border-slate-200 shadow-sm' : 'bg-[#0a0f1d] border-white/10'
          }`}>
            {[
              { id: 'all', label: lang === 'ar' ? 'جميع المشروعات (6)' : 'All (6)', color: 'text-slate-700 dark:text-slate-300' },
              { id: 'completed', label: lang === 'ar' ? 'متقدم / مكتمل' : 'Near Completion', color: 'text-emerald-500' },
              { id: 'in_progress', label: lang === 'ar' ? 'جاري التنفيذ' : 'In Progress', color: 'text-amber-500' },
              { id: 'under_study', label: lang === 'ar' ? 'قيد الدراسة' : 'Study Phase', color: 'text-rose-500' }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setFilterStatus(tab.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer ${
                  filterStatus === tab.id
                    ? 'bg-amber-500 text-slate-950 font-black shadow-md shadow-amber-500/20 scale-[1.02]'
                    : `${tab.color} hover:bg-slate-100 dark:hover:bg-white/10`
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <button
            onClick={() => setMapMode(m => m === 'tactical' ? 'satellite' : 'tactical')}
            className={`px-4 py-2 rounded-2xl border text-xs font-black transition-all cursor-pointer flex items-center gap-2 shadow-sm ${
              mapMode === 'satellite'
                ? 'bg-cyan-500 text-slate-950 border-cyan-400 font-black shadow-cyan-500/25'
                : theme === 'light'
                  ? 'bg-white hover:bg-slate-50 text-slate-800 border-slate-200'
                  : 'bg-white/10 hover:bg-white/20 text-white border-white/15'
            }`}
          >
            <Compass className="w-3.5 h-3.5" />
            <span>{mapMode === 'tactical' ? (lang === 'ar' ? 'القمر الصناعي' : 'Satellite') : (lang === 'ar' ? 'خريطة رقمية' : 'Digital Map')}</span>
          </button>
        </div>
      </div>

      {/* ── Main Map Canvas Container ── */}
      <div className={`rounded-[32px] border shadow-2xl overflow-hidden relative transition-all ${
        theme === 'light' ? 'bg-white border-slate-200 shadow-slate-200/80' : 'bg-[#090d18] border-white/10 shadow-black/80'
      }`}>
        
        {mapMode === 'tactical' ? (
          /* ── 3D Tactical SVG Map of Libya with Glowing Project Nodes ── */
          <div className="relative w-full h-[520px] sm:h-[620px] overflow-hidden bg-gradient-to-b from-[#0e1628] via-[#0b101e] to-[#070a14] p-4 flex items-center justify-center select-none">
            
            {/* Ambient Background Glows & Grid */}
            <div className="absolute inset-0 bg-grid-pattern opacity-30" />
            <div className="absolute top-1/3 left-1/4 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

            {/* Tactical Compass Badge */}
            <div className="absolute top-6 left-6 z-10 flex items-center gap-2.5 px-4 py-2 rounded-2xl bg-black/60 backdrop-blur-md border border-white/10 text-white text-xs font-mono">
              <Compass className="w-4 h-4 text-amber-400 animate-spin" style={{ animationDuration: '24s' }} />
              <span className="font-bold">{lang === 'ar' ? 'شبكة الطرق الوطنية الموحدة 2026' : 'National Highway Grid 2026'}</span>
            </div>

            {/* Legend Widget */}
            <div className="absolute bottom-6 left-6 z-10 p-3 rounded-2xl bg-black/75 backdrop-blur-md border border-white/10 text-[11px] text-white space-y-1.5 shadow-xl text-start">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></span>
                <span>{lang === 'ar' ? 'متقدم / مكتمل (80%+)' : 'Near Completion'}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-400"></span>
                <span>{lang === 'ar' ? 'جاري التنفيذ الميداني' : 'In Active Paving'}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-400"></span>
                <span>{lang === 'ar' ? 'قيد الدراسة والتأسيس' : 'Under Technical Study'}</span>
              </div>
            </div>

            {/* Stylized Libya Map Vector Canvas */}
            <div className="relative w-full max-w-4xl h-full flex items-center justify-center">
              <svg viewBox="0 0 1000 700" className="w-full h-full filter drop-shadow-2xl">
                {/* Libya Coastline & Territory Geometry */}
                <defs>
                  <linearGradient id="libyaTerrainGrad" x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0%" stopColor="#1E293B" stopOpacity="0.85" />
                    <stop offset="50%" stopColor="#0F172A" stopOpacity="0.95" />
                    <stop offset="100%" stopColor="#090D18" stopOpacity="0.98" />
                  </linearGradient>
                  <filter id="neonGlowEmerald" x="-20%" y="-20%" width="140%" height="140%">
                    <feGaussianBlur stdDeviation="4" result="blur" />
                    <feComposite in="SourceGraphic" in2="blur" operator="over" />
                  </filter>
                  <filter id="neonGlowAmber" x="-20%" y="-20%" width="140%" height="140%">
                    <feGaussianBlur stdDeviation="4" result="blur" />
                    <feComposite in="SourceGraphic" in2="blur" operator="over" />
                  </filter>
                </defs>

                {/* Libya Simplified Boundaries Path */}
                <path
                  d="M 180 80 Q 260 90, 360 85 Q 460 160, 520 180 Q 640 120, 780 110 Q 860 140, 880 180 L 870 540 Q 750 630, 600 640 L 320 620 L 140 560 L 120 280 Q 140 180, 180 80 Z"
                  fill="url(#libyaTerrainGrad)"
                  stroke="rgba(255, 171, 0, 0.35)"
                  strokeWidth="2.5"
                  strokeDasharray="4 2"
                />

                {/* Regional Territory Labels */}
                <text x="240" y="190" fill="rgba(255,255,255,0.3)" fontSize="14" fontWeight="bold" fontFamily="Tajawal">إقليم طرابلس (الغرب)</text>
                <text x="680" y="240" fill="rgba(255,255,255,0.3)" fontSize="14" fontWeight="bold" fontFamily="Tajawal">إقليم برقة (الشرق)</text>
                <text x="360" y="440" fill="rgba(255,171,0,0.4)" fontSize="18" fontWeight="black" fontFamily="Tajawal">إقليم فزان (الجنوب الليبي)</text>

                {/* Major Inter-city Highway Connecting Corridors */}
                {/* Coastal Highway */}
                <path d="M 180 85 Q 360 95, 520 180 Q 660 125, 870 120" fill="none" stroke="rgba(0, 245, 212, 0.4)" strokeWidth="2.5" strokeDasharray="6 4" />
                {/* North to South Strategic Link (Sirte - Jufra - Sabha) */}
                <path d="M 520 180 L 460 340 L 380 430" fill="none" stroke="rgba(255, 171, 0, 0.5)" strokeWidth="3" strokeDasharray="5 3" />
                {/* Ubari - Ghat 360km Corridor (Active Master Highlight) */}
                <path d="M 330 460 Q 280 500, 220 540 L 160 590" fill="none" stroke="#FFAB00" strokeWidth="5" filter="url(#neonGlowAmber)" />
                {/* Sabha - Ubari Link */}
                <path d="M 380 430 L 330 460" fill="none" stroke="#10B981" strokeWidth="4" filter="url(#neonGlowEmerald)" />
                {/* Shwayrif - Brak Link */}
                <path d="M 440 320 L 390 410" fill="none" stroke="rgba(255, 171, 0, 0.6)" strokeWidth="3" />
                {/* Ghat - Tahat Link */}
                <path d="M 160 590 L 140 640" fill="none" stroke="rgba(251, 146, 60, 0.7)" strokeWidth="3" strokeDasharray="4 4" />
                {/* Murzuk - Qatrun */}
                <path d="M 390 490 L 420 570" fill="none" stroke="rgba(244, 63, 94, 0.6)" strokeWidth="2.5" strokeDasharray="4 4" />

                {/* Major Landmarks Cities */}
                <g fill="#94A3B8" fontSize="11" fontWeight="bold">
                  <circle cx="210" cy="95" r="4" fill="#FFFFFF" />
                  <text x="220" y="100">طرابلس</text>

                  <circle cx="740" cy="140" r="4" fill="#FFFFFF" />
                  <text x="750" y="145">بنغازي</text>

                  <circle cx="520" cy="180" r="4" fill="#FFFFFF" />
                  <text x="530" y="185">سرت</text>

                  <circle cx="380" cy="430" r="5" fill="#FFAB00" />
                  <text x="395" y="435" fill="#FFAB00" fontWeight="black">سبها</text>

                  <circle cx="330" cy="460" r="5" fill="#FFAB00" />
                  <text x="345" y="465" fill="#FFAB00" fontWeight="black">أوباري (000+00)</text>

                  <circle cx="160" cy="590" r="5" fill="#FFAB00" />
                  <text x="175" y="595" fill="#FFAB00" fontWeight="black">غات (360 كم)</text>
                </g>

              </svg>

              {/* Dynamic Interactive Project Glowing Pins */}
              {filteredProjects.map((prj) => {
                const isSelected = selectedProject?.id === prj.id;
                const statusBg = prj.status === 'completed' 
                  ? 'bg-emerald-500 shadow-emerald-500/50' 
                  : prj.status === 'in_progress' 
                    ? 'bg-amber-500 shadow-amber-500/50' 
                    : 'bg-rose-500 shadow-rose-500/50';

                return (
                  <div
                    key={prj.id}
                    onClick={() => setSelectedProject(prj)}
                    style={{ left: `${prj.coords.x}%`, top: `${prj.coords.y}%` }}
                    className="absolute -translate-x-1/2 -translate-y-1/2 cursor-pointer group z-20"
                  >
                    {/* Pulsating Wave Ring */}
                    <span className="relative flex h-8 w-8 items-center justify-center">
                      <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-60 ${statusBg}`} />
                      <span className={`relative inline-flex rounded-full h-5 w-5 ${statusBg} border-2 border-white shadow-xl flex items-center justify-center text-[9px] font-black text-slate-950 ${isSelected ? 'scale-125 ring-4 ring-amber-400' : 'group-hover:scale-115'}`}>
                        {prj.lengthKm}k
                      </span>
                    </span>

                    {/* Tooltip on Hover */}
                    <div className="absolute bottom-9 left-1/2 -translate-x-1/2 hidden group-hover:flex flex-col items-center pointer-events-none z-30">
                      <div className="px-3 py-1.5 rounded-xl bg-black/90 text-white text-[11px] font-black whitespace-nowrap shadow-2xl border border-white/15">
                        {prj.title} ({prj.progress}%)
                      </div>
                      <div className="w-2 h-2 bg-black/90 rotate-45 -mt-1 border-r border-b border-white/15"></div>
                    </div>
                  </div>
                );
              })}

            </div>

            {/* Selected Project Interactive Floating HUD Card */}
            {selectedProject && (
              <div className="absolute top-6 right-6 z-20 w-80 sm:w-96 rounded-3xl p-5 border shadow-2xl bg-black/85 backdrop-blur-2xl text-white space-y-3.5 animate-scaleUp text-start border-amber-500/40">
                <div className="flex items-center justify-between">
                  <span className="px-2.5 py-1 rounded-xl text-[10px] font-black bg-amber-500/20 text-amber-400 border border-amber-500/30">
                    {selectedProject.region}
                  </span>
                  <span className={`px-2.5 py-1 rounded-xl text-[10px] font-black ${
                    selectedProject.status === 'completed' ? 'bg-emerald-500/20 text-emerald-400' : selectedProject.status === 'in_progress' ? 'bg-amber-500/20 text-amber-400' : 'bg-rose-500/20 text-rose-400'
                  }`}>
                    {selectedProject.statusLabel}
                  </span>
                </div>

                <div className="h-28 rounded-2xl overflow-hidden relative border border-white/10">
                  <img 
                    src={resolveAsset(selectedProject.image)} 
                    alt={selectedProject.title} 
                    className="w-full h-full object-cover" 
                    onError={(e) => {
                      e.currentTarget.onerror = null;
                      e.currentTarget.src = resolveAsset('./road-asphalt-paver.jpg');
                    }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                  <span className="absolute bottom-2 right-2 text-xs font-mono font-black text-amber-300">
                    {selectedProject.lengthKm} {lang === 'ar' ? 'كم' : 'km'} • {selectedProject.budget}
                  </span>
                </div>

                <h4 className="font-black text-sm leading-snug">{selectedProject.title}</h4>
                <p className="text-xs text-slate-300 line-clamp-2 leading-relaxed">{selectedProject.desc}</p>

                {/* Progress Bar */}
                <div className="space-y-1">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-slate-400">نسبة الإنجاز الفعلي:</span>
                    <span className="font-mono font-black text-amber-400">{selectedProject.progress}%</span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden border border-white/10">
                    <div className="bg-gradient-to-r from-amber-500 to-amber-300 h-full rounded-full" style={{ width: `${selectedProject.progress}%` }} />
                  </div>
                </div>

                {/* Quick specs pill */}
                <div className="flex items-center justify-between pt-2 border-t border-white/10 text-[11px] text-slate-400 font-mono">
                  <span>الشركة: <strong className="text-white font-sans">{selectedProject.contractor}</strong></span>
                  <a
                    href={`https://maps.google.com/?q=${selectedProject.realCoords}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-amber-400 hover:underline flex items-center gap-1"
                  >
                    <span>Google Maps</span>
                    <ArrowUpRight className="w-3 h-3" />
                  </a>
                </div>
              </div>
            )}

          </div>
        ) : (
          /* ── Satellite Google Maps Mode ── */
          <div className="relative w-full h-[520px] sm:h-[620px] bg-slate-950">
            <iframe
              title="Libya Strategic Road Satellite"
              src="https://maps.google.com/maps?q=Ubari,Libya&t=k&z=9&ie=UTF8&iwloc=&output=embed"
              width="100%"
              height="100%"
              style={{ border: 0 }}
              allowFullScreen=""
              loading="lazy"
            />
          </div>
        )}

      </div>

    </section>
  );
}
