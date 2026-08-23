import React, { useState, useRef, useEffect } from 'react';
import { Bell, CheckCircle2, Clock, Info, ShieldCheck, Sparkles, ChevronRight, X } from 'lucide-react';
import { initialFieldDispatches } from '../services/api';

export default function ProjectUpdatesNotification({ theme, lang = 'ar' }) {
  const [isOpen, setIsOpen] = useState(false);
  const [dispatches, setDispatches] = useState(initialFieldDispatches);
  const [selectedDispatch, setSelectedDispatch] = useState(null);
  const [hasUnread, setHasUnread] = useState(true);
  const menuRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleOpen = () => {
    setIsOpen(!isOpen);
    setHasUnread(false);
  };

  return (
    <div className="relative" ref={menuRef}>
      {/* Bell Button */}
      <button
        onClick={handleOpen}
        title={lang === 'ar' ? 'تحديثات المشاريع والأوامر الميدانية الحية' : 'Live Project Updates & Field Dispatches'}
        className={`relative w-9 h-9 rounded-xl flex items-center justify-center border shadow-sm transition-all duration-300 cursor-pointer hover:scale-105 ${
          isOpen
            ? 'bg-amber-500 text-slate-950 border-amber-400 shadow-md shadow-amber-500/25'
            : theme === 'light'
              ? 'bg-slate-100/90 hover:bg-slate-200 text-slate-800 border-slate-300/80 shadow-slate-100'
              : 'bg-white/10 hover:bg-white/20 text-slate-100 border-white/15'
        }`}
      >
        <Bell className="w-4 h-4" />
        {hasUnread && (
          <span className="absolute -top-1 -right-1 flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-amber-500 border border-slate-900 text-[8px] font-black text-slate-950 items-center justify-center">
              4
            </span>
          </span>
        )}
      </button>

      {/* Notifications Glassmorphic Dropdown */}
      {isOpen && (
        <div className={`absolute top-12 end-0 w-80 sm:w-96 rounded-2xl border shadow-2xl p-4 z-50 animate-scaleUp backdrop-blur-2xl text-start ${
          theme === 'light'
            ? 'bg-white/95 border-slate-200/90 text-slate-900 shadow-slate-200/80'
            : 'bg-[#090d18]/95 border-amber-500/30 text-white shadow-black/80'
        }`}>
          {/* Header */}
          <div className="flex items-center justify-between border-b pb-3 border-slate-200 dark:border-white/10 mb-3">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-amber-500/20 text-amber-500 flex items-center justify-center">
                <Sparkles className="w-4 h-4" />
              </div>
              <h4 className="font-black text-xs sm:text-sm">
                {lang === 'ar' ? 'تحديثات المشاريع والأوامر الحية' : 'Live Project Field Updates'}
              </h4>
            </div>
            <span className="px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 text-[10px] font-bold border border-emerald-500/25">
              {lang === 'ar' ? 'مباشر 2026' : 'Live 2026'}
            </span>
          </div>

          {/* List of dispatches */}
          <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
            {dispatches.map((item) => (
              <div
                key={item.id}
                onClick={() => {
                  setSelectedDispatch(item);
                  setIsOpen(false);
                }}
                className={`p-3 rounded-xl border transition-all cursor-pointer text-xs space-y-1.5 glass-card-hover ${
                  theme === 'light'
                    ? 'bg-slate-50/80 hover:bg-amber-50/60 border-slate-200/80'
                    : 'bg-white/[0.04] hover:bg-white/[0.08] border-white/10'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-amber-500 text-[10px]">{item.sector}</span>
                  <span className="text-slate-400 text-[9px] font-mono">{item.time}</span>
                </div>
                <h5 className="font-black text-xs line-clamp-1">{item.title}</h5>
                <div className="flex items-center justify-between text-[10px] text-slate-400 pt-0.5">
                  <span className="text-emerald-500 font-bold">{item.status}</span>
                  <span>{item.author}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Dispatch Detail Modal */}
      {selectedDispatch && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
          <div className={`relative max-w-md w-full rounded-[28px] p-6 border shadow-2xl space-y-4 animate-scaleUp text-start ${
            theme === 'light' ? 'bg-white border-slate-200 text-slate-900' : 'bg-[#090d18] border-amber-500/40 text-white'
          }`}>
            <button
              onClick={() => setSelectedDispatch(null)}
              className="absolute top-4 left-4 p-2 rounded-full bg-slate-100 dark:bg-white/10 hover:bg-slate-200 dark:hover:bg-white/20 transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-amber-500/20 text-amber-500 flex items-center justify-center">
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <div>
                <span className="text-xs font-bold text-amber-500">{selectedDispatch.sector}</span>
                <span className="text-xs text-slate-400 block">{selectedDispatch.time} • {selectedDispatch.author}</span>
              </div>
            </div>

            <h3 className="font-black text-base leading-snug">{selectedDispatch.title}</h3>
            
            <div className={`p-4 rounded-2xl border text-xs leading-relaxed space-y-2 ${
              theme === 'light' ? 'bg-slate-50 border-slate-200' : 'bg-white/5 border-white/10'
            }`}>
              <div className="flex items-center justify-between text-[11px]">
                <span className="text-slate-500">حالة الأمر الفني:</span>
                <span className="font-black text-emerald-500 bg-emerald-500/10 px-2 py-0.5 rounded-md">{selectedDispatch.status}</span>
              </div>
              <p className="text-slate-600 dark:text-slate-300">
                تم اعتماد التوجيه الميداني رسمياً من قبل المهندس المقيم وتعميم المحضر الهندسي للجهة المنفذة ومختبر الجودة.
              </p>
            </div>

            <button
              onClick={() => setSelectedDispatch(null)}
              className="w-full py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs transition-colors cursor-pointer"
            >
              {lang === 'ar' ? 'إغلاق ومتابعة' : 'Close'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
