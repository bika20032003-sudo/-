import React, { useState } from 'react';
import { Layers, MapPin, Compass, ShieldCheck, CheckCircle2, ArrowUpRight, Sparkles, Building2, Wrench, FileText, Info, X } from 'lucide-react';
import { nationalProjects } from '../services/api';

export default function FeaturedProjects({ theme, lang = 'ar' }) {
  const [selectedModalProject, setSelectedModalProject] = useState(null);

  return (
    <section id="projects-section" className="py-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-10 animate-fadeIn select-none">
      
      {/* ── Section Title Header ── */}
      <div className="text-center max-w-3xl mx-auto space-y-3">
        <div className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-black border shadow-sm ${
          theme === 'light'
            ? 'bg-amber-100/90 border-amber-300 text-amber-950'
            : 'bg-amber-500/10 border-amber-500/35 text-amber-300'
        }`}>
          <Layers className="w-4 h-4 text-amber-500" />
          <span>{lang === 'ar' ? 'حزم ومشاريع مسار أوباري – غات 🇱🇾' : 'Ubari – Ghat Corridor Projects 🇱🇾'}</span>
        </div>
        <h2 className={`text-3xl sm:text-5xl font-black tracking-tight ${
          theme === 'light' ? 'text-slate-950' : 'text-white'
        }`}>
          {lang === 'ar' ? 'المشروعات التنفيذية لمسار أوباري – غات (360 كم)' : 'Execution Projects – Ubari – Ghat Highway'}
        </h2>
        <p className={`text-xs sm:text-base font-medium ${
          theme === 'light' ? 'text-slate-600' : 'text-slate-400'
        }`}>
          {lang === 'ar'
            ? 'الحزم والمشاريع الهندسية المتكاملة الجاري تنفيذها على امتداد قطاعات طريق أوباري - غات لضمان أعلى معايير السلامة والجودة.'
            : 'Integrated engineering packages currently under execution along the Ubari – Ghat highway corridor.'}
        </p>
      </div>

      {/* ── Luxury Cards Grid (Ubari - Ghat Projects) ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {nationalProjects.map((project) => (
          <div
            key={project.id}
            className={`p-6 sm:p-8 rounded-[36px] border shadow-2xl space-y-6 transition-all duration-400 text-start relative overflow-hidden glass-card-hover ${
              theme === 'light'
                ? 'bg-white border-slate-200/90 text-slate-900 shadow-slate-200/80'
                : 'bg-[#0a0f1d]/95 border-white/15 text-white shadow-black/80'
            }`}
          >
            {/* Top 4K Photo Box with Live Overlay */}
            <div className="h-64 sm:h-72 rounded-[26px] overflow-hidden relative border border-slate-200 dark:border-white/10 group">
              <img
                src={project.image}
                alt={project.title}
                className="w-full h-full object-cover group-hover:scale-108 transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent" />
              
              {/* Status Badge */}
              <span className={`absolute top-3.5 right-3.5 px-3 py-1.5 rounded-xl text-xs font-black shadow-lg backdrop-blur-md border ${
                project.status === 'completed'
                  ? 'bg-emerald-500/90 text-slate-950 border-emerald-400'
                  : project.status === 'in_progress'
                    ? 'bg-amber-500/90 text-slate-950 border-amber-400'
                    : 'bg-rose-500/90 text-white border-rose-400'
              }`}>
                {project.statusLabel}
              </span>

              {/* Distance Tag */}
              <span className="absolute bottom-3.5 right-3.5 px-3 py-1.5 rounded-xl bg-black/75 backdrop-blur-md text-amber-400 font-mono font-black text-xs border border-white/10">
                {project.lengthKm} {lang === 'ar' ? 'كم' : 'KM'} • {project.region}
              </span>
            </div>

            {/* Title and Narrative */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs text-amber-500 font-mono font-bold">
                <span>{project.id}</span>
                <span>{project.startDate} — {project.targetDate}</span>
              </div>
              <h3 className={`text-xl sm:text-2xl font-black ${theme === 'light' ? 'text-slate-950' : 'text-white'}`}>
                {project.title}
              </h3>
              <p className={`text-xs sm:text-sm font-medium leading-relaxed line-clamp-2 ${
                theme === 'light' ? 'text-slate-600' : 'text-slate-300'
              }`}>
                {project.desc}
              </p>
            </div>

            {/* Live Progress Bar with Glow */}
            <div className="space-y-2 pt-2 border-t border-slate-200 dark:border-white/10">
              <div className="flex items-center justify-between text-xs">
                <span className={`font-semibold ${theme === 'light' ? 'text-slate-500' : 'text-slate-400'}`}>
                  {lang === 'ar' ? 'نسبة الإنجاز الفعلي:' : 'Actual Completion:'}
                </span>
                <span className="font-mono font-black text-amber-500 text-sm">{project.progress}%</span>
              </div>
              <div className={`w-full h-3 rounded-full overflow-hidden p-0.5 border ${
                theme === 'light' ? 'bg-slate-200 border-slate-300' : 'bg-slate-800 border-white/5'
              }`}>
                <div
                  className="bg-gradient-to-r from-amber-500 via-amber-400 to-amber-300 h-full rounded-full shimmer-active shadow-md transition-all duration-700"
                  style={{ width: `${project.progress}%` }}
                />
              </div>
            </div>

            {/* Bottom Meta & Details Button */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-2">
              <div className="text-xs space-y-0.5">
                <span className={`block text-[11px] ${theme === 'light' ? 'text-slate-500' : 'text-slate-400'}`}>
                  {lang === 'ar' ? 'الجهة المنفذة المعتمدة:' : 'Executing Contractor:'}
                </span>
                <strong className={`font-bold ${theme === 'light' ? 'text-slate-950' : 'text-white'}`}>
                  {project.contractor}
                </strong>
              </div>

              <button
                onClick={() => setSelectedModalProject(project)}
                className="px-5 py-3 rounded-2xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black text-xs shadow-lg shadow-amber-500/25 flex items-center justify-center gap-2 transition-all hover:scale-105 cursor-pointer"
              >
                <Info className="w-4 h-4" />
                <span>{lang === 'ar' ? 'التفاصيل' : 'Details'}</span>
              </button>
            </div>

          </div>
        ))}
      </div>

      {/* ── Project Specification Modal ── */}
      {selectedModalProject && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fadeIn">
          <div className={`relative max-w-2xl w-full rounded-[36px] p-6 sm:p-8 border shadow-2xl space-y-6 animate-scaleUp text-start ${
            theme === 'light' ? 'bg-white border-slate-200 text-slate-900' : 'bg-[#0b101e] border-amber-500/40 text-white'
          }`}>
            <button
              onClick={() => setSelectedModalProject(null)}
              className="absolute top-5 left-5 p-2.5 rounded-full bg-slate-100 dark:bg-white/10 hover:bg-slate-200 dark:hover:bg-white/20 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Modal Header */}
            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-2xl bg-amber-500/20 text-amber-500 flex items-center justify-center font-mono font-black">
                <Layers className="w-6 h-6" />
              </div>
              <div>
                <span className="text-xs font-bold text-amber-500 font-mono">{selectedModalProject.id} • {selectedModalProject.region}</span>
                <h3 className="text-xl sm:text-2xl font-black leading-tight">{selectedModalProject.title}</h3>
              </div>
            </div>

            {/* Photo Box */}
            <div className="h-56 rounded-2xl overflow-hidden relative border border-white/10">
              <img src={selectedModalProject.image} alt={selectedModalProject.title} className="w-full h-full object-cover" />
            </div>

            {/* 4 Specs Tiles */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              <div className={`p-3.5 rounded-2xl border ${theme === 'light' ? 'bg-slate-50 border-slate-200' : 'bg-white/5 border-white/10'}`}>
                <span className="text-slate-400 block text-[10px]">{lang === 'ar' ? 'طول المشروع' : 'Distance'}</span>
                <strong className="text-sm font-black font-mono">{selectedModalProject.lengthKm} كم</strong>
              </div>
              <div className={`p-3.5 rounded-2xl border ${theme === 'light' ? 'bg-slate-50 border-slate-200' : 'bg-white/5 border-white/10'}`}>
                <span className="text-slate-400 block text-[10px]">{lang === 'ar' ? 'الميزانية المعتمدة' : 'Budget'}</span>
                <strong className="text-sm font-black font-mono text-emerald-500">{selectedModalProject.budget}</strong>
              </div>
              <div className={`p-3.5 rounded-2xl border ${theme === 'light' ? 'bg-slate-50 border-slate-200' : 'bg-white/5 border-white/10'}`}>
                <span className="text-slate-400 block text-[10px]">{lang === 'ar' ? 'سُمك الأسفلت' : 'Thickness'}</span>
                <strong className="text-sm font-black font-mono text-cyan-500">{selectedModalProject.specs.thickness}</strong>
              </div>
              <div className={`p-3.5 rounded-2xl border ${theme === 'light' ? 'bg-slate-50 border-slate-200' : 'bg-white/5 border-white/10'}`}>
                <span className="text-slate-400 block text-[10px]">{lang === 'ar' ? 'مطابقة الجودة' : 'QA Rating'}</span>
                <strong className="text-sm font-black font-mono text-amber-500">{selectedModalProject.specs.qualityScore}</strong>
              </div>
            </div>

            {/* Description & Contractor */}
            <div className="space-y-2 text-xs leading-relaxed">
              <p className={theme === 'light' ? 'text-slate-700' : 'text-slate-300'}>
                {selectedModalProject.desc}
              </p>
              <div className="flex items-center justify-between text-slate-400 pt-2 border-t border-slate-200 dark:border-white/10">
                <span>الجهة المنفذة: <strong className="text-amber-500">{selectedModalProject.contractor}</strong></span>
                <span>تاريخ التسليم المستهدف: <strong>{selectedModalProject.targetDate}</strong></span>
              </div>
            </div>

            <button
              onClick={() => setSelectedModalProject(null)}
              className="w-full py-3.5 rounded-2xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs transition-colors cursor-pointer"
            >
              {lang === 'ar' ? 'إغلاق التفاصيل' : 'Close Details'}
            </button>
          </div>
        </div>
      )}

    </section>
  );
}
