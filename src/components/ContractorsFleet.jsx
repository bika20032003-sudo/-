import React, { useState } from 'react';
import { 
  Truck, 
  Wrench, 
  Building2, 
  Search, 
  CheckCircle2, 
  Sparkles, 
  ShieldCheck,
  Award
} from 'lucide-react';
import { translations } from '../i18n/translations';

export default function ContractorsFleet({ contractors = [], theme, lang = 'ar' }) {
  const t = translations[lang] || translations.ar;
  const [searchTerm, setSearchTerm] = useState('');

  const filteredContractors = contractors.filter(c => 
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    c.sector.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <section className="py-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-8 animate-fadeIn select-none">
      
      {/* Header Bar */}
      <div className={`flex flex-col md:flex-row md:items-center justify-between gap-5 border-b pb-6 ${
        theme === 'light' ? 'border-slate-200' : 'border-white/10'
      }`}>
        <div className="text-start space-y-2">
          <div className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-black border shadow-sm ${
            theme === 'light'
              ? 'bg-purple-100/90 border-purple-300 text-purple-950'
              : 'bg-purple-500/10 border-purple-500/35 text-purple-300'
          }`}>
            <Truck className="w-4 h-4 text-purple-500" />
            <span>{t.contractorsBadge}</span>
          </div>
          <h2 className={`text-3xl sm:text-5xl font-black tracking-tight ${
            theme === 'light' ? 'text-slate-950' : 'text-white'
          }`}>
            {t.contractorsTitle}
          </h2>
          <p className={`text-xs sm:text-sm font-medium ${
            theme === 'light' ? 'text-slate-600' : 'text-slate-400'
          }`}>
            {t.contractorsDesc}
          </p>
        </div>

        {/* 4K Search Input Bar */}
        <div className="relative w-full md:w-88">
          <input
            type="text"
            placeholder={lang === 'ar' ? 'بحث باسم الشركة أو القطاع...' : 'Search company or sector...'}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className={`w-full text-xs rounded-2xl px-5 py-3.5 border focus:border-amber-500 focus:outline-none transition-all shadow-sm font-medium ${
              theme === 'light'
                ? 'bg-white text-slate-900 placeholder-slate-400 border-slate-200 shadow-slate-100'
                : 'bg-slate-900/90 text-white placeholder-slate-400 border-white/15 shadow-black/40'
            }`}
          />
          <Search className="w-4 h-4 text-slate-400 absolute top-4 end-4 pointer-events-none" />
        </div>
      </div>

      {/* Contractors 4K Cards Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {filteredContractors.map((cont) => (
          <div 
            key={cont.id}
            className={`p-6 sm:p-8 rounded-[32px] border shadow-2xl space-y-6 transition-all text-start glass-card-hover ${
              theme === 'light'
                ? 'bg-white border-slate-200/90 text-slate-900 shadow-slate-200/80'
                : 'bg-[#0a0f1d]/95 border-white/15 text-slate-100 shadow-black/70'
            }`}
          >
            {/* Top Bar: Company Details & Quality Score */}
            <div className={`flex items-start justify-between gap-4 border-b pb-5 ${
              theme === 'light' ? 'border-slate-200' : 'border-white/10'
            }`}>
              <div className="flex items-center gap-3.5">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-amber-400 via-amber-500 to-amber-600 p-[1.5px] shadow-lg shadow-amber-500/25 flex-shrink-0">
                  <div className="w-full h-full rounded-[14px] bg-[#0c1220] flex items-center justify-center text-amber-400">
                    <Building2 className="w-7 h-7" />
                  </div>
                </div>
                <div>
                  <h3 className={`font-black text-lg ${theme === 'light' ? 'text-slate-950' : 'text-white'}`}>
                    {cont.name}
                  </h3>
                  <span className="text-xs text-amber-500 font-bold">{cont.sector}</span>
                </div>
              </div>

              <div className="text-center bg-emerald-500/10 px-3.5 py-2 rounded-2xl border border-emerald-500/30 flex-shrink-0 shadow-sm">
                <span className={`text-[10px] font-bold block ${theme === 'light' ? 'text-slate-500' : 'text-slate-400'}`}>{t.qualityScore}</span>
                <span className="text-sm font-black text-emerald-500 font-mono">{cont.qualityScore}</span>
              </div>
            </div>

            {/* Contract Financials & Field Completion */}
            <div className="grid grid-cols-2 gap-3.5 text-xs">
              <div className={`p-4 rounded-2xl border ${
                theme === 'light' ? 'bg-slate-50 border-slate-200 shadow-sm' : 'bg-white/[0.04] border-white/10'
              }`}>
                <span className={`block mb-1 font-medium ${theme === 'light' ? 'text-slate-500' : 'text-slate-400'}`}>{t.contractValue}</span>
                <strong className={`font-mono text-sm font-black ${theme === 'light' ? 'text-slate-950' : 'text-white'}`}>{cont.contractValue}</strong>
              </div>
              <div className={`p-4 rounded-2xl border ${
                theme === 'light' ? 'bg-slate-50 border-slate-200 shadow-sm' : 'bg-white/[0.04] border-white/10'
              }`}>
                <span className={`block mb-1 font-medium ${theme === 'light' ? 'text-slate-500' : 'text-slate-400'}`}>{t.contractCompletion}</span>
                <strong className="text-amber-500 font-mono text-sm font-black">{cont.completion}%</strong>
              </div>
            </div>

            {/* Machinery Breakdown List */}
            <div className="space-y-3">
              <h4 className={`text-xs font-bold flex items-center gap-2 ${
                theme === 'light' ? 'text-slate-800' : 'text-slate-200'
              }`}>
                <Wrench className="w-4 h-4 text-cyan-500" />
                <span>{t.fleetTitle}:</span>
              </h4>

              <div className="space-y-2">
                {cont.machinery.map((m, idx) => (
                  <div 
                    key={idx}
                    className={`flex items-center justify-between p-3 rounded-2xl border text-xs ${
                      theme === 'light'
                        ? 'bg-slate-50 border-slate-200 text-slate-800'
                        : 'bg-slate-900/70 border-white/10 text-slate-200'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <span className="w-2 h-2 rounded-full bg-cyan-500"></span>
                      <span className={`font-semibold ${theme === 'light' ? 'text-slate-800' : 'text-slate-200'}`}>{m.type}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="font-mono font-black text-amber-500">{m.count} {lang === 'ar' ? 'قطع' : 'Units'}</span>
                      <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/15 text-emerald-500 text-[10px] font-black border border-emerald-500/30">
                        {m.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>
        ))}
      </div>

    </section>
  );
}
