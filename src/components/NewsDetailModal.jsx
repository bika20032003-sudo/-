import React, { useEffect } from 'react';
import { 
  X, 
  MapPin, 
  Calendar, 
  Eye, 
  CheckCircle2, 
  Share2, 
  Printer, 
  Building2, 
  ShieldCheck, 
  Layers, 
  ExternalLink
} from 'lucide-react';
import { resolveAsset } from '../utils/assets';

export default function NewsDetailModal({ post, isOpen, onClose, theme = 'dark', lang = 'ar' }) {
  // Close on Escape key press
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  if (!isOpen || !post) return null;

  const handleShare = async () => {
    const shareData = {
      title: post.title,
      text: post.desc,
      url: window.location.href,
    };
    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch (err) {
        // Ignored or cancelled
      }
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert(lang === 'ar' ? 'تم نسخ رابط الخبر بنجاح!' : 'Link copied to clipboard!');
    }
  };

  // Detailed editorial narrative paragraphs per post if not fully provided
  const detailedParagraphs = [
    post.desc,
    lang === 'ar'
      ? 'تأتي هذه الأعمال الميدانية المكثفة ضمن استراتيجية حكومة الوحدة الوطنية وجهاز تنفيذ مشروعات المواصلات لتطوير البنية التحتية وربط واحات ومدن الجنوب الليبي بشبكة طرق حديثة تواكب أعلى المعايير الهندسية الدولية.'
      : 'These intensive field works are part of the Transportation Projects Implementation Authority strategy to modernize southern highway corridors according to international engineering standards.',
    lang === 'ar'
      ? 'وأكدت الفرق الهندسية المشرفة أن المشروع يشهد التزاماً صارماً بمواصفات الجودة المعتمدة، مع إجراء اختبارات معملية دورية للخلطة الإسفلتية ومتابعة دقيقة لمناسيب تصريف مياه الأمطار والسيول لضمان ديمومة الطريق وسلامة مستخدميه.'
      : 'Supervising engineers confirmed rigorous compliance with certified quality standards, including regular laboratory testing and drainage culvert inspections to guarantee road longevity and user safety.'
  ];

  return (
    <div 
      className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-5 bg-black/85 backdrop-blur-md animate-fadeIn"
      onClick={onClose}
    >
      <div 
        className={`w-full max-w-2xl max-h-[92vh] flex flex-col rounded-3xl border shadow-2xl text-start relative overflow-hidden animate-scaleUp ${
          theme === 'light' 
            ? 'bg-white border-amber-300/80 text-slate-900 shadow-slate-300/90' 
            : 'bg-[#090e1a]/98 border-amber-500/35 text-white shadow-black/95'
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Ambient Top Glow Orbs */}
        <div 
          className="absolute -top-24 -right-24 w-72 h-72 rounded-full pointer-events-none opacity-30"
          style={{ background: 'radial-gradient(circle, rgba(255,171,0,0.3) 0%, transparent 70%)' }}
        />

        {/* ── Modal Header: Agency Brand + Close Button ── */}
        <div className="px-3.5 sm:px-6 py-3 sm:py-3.5 flex items-center justify-between border-b border-slate-100 dark:border-white/10 relative z-10 shrink-0 gap-2">
          <div className="flex items-center gap-2 sm:gap-2.5 min-w-0 flex-1 overflow-hidden">
            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-gradient-to-br from-amber-400 to-amber-600 p-[1.5px] shadow-sm shrink-0">
              <img 
                src={resolveAsset('./logo-agency.jpg')} 
                alt="جهاز تنفيذ مشروعات المواصلات" 
                className="w-full h-full object-contain rounded-[10px] bg-white"
                onError={(e) => { e.currentTarget.style.display = 'none'; }}
              />
            </div>
            <div className="min-w-0 flex-1 overflow-hidden text-start">
              <div className="flex items-center gap-1.5 min-w-0">
                <span className="font-black text-xs sm:text-sm text-amber-500 truncate block">
                  {lang === 'ar' ? 'جهاز تنفيذ مشروعات المواصلات' : 'Transport Projects Authority'}
                </span>
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
              </div>
              <p className="text-[10px] text-slate-400 truncate block">
                {lang === 'ar' ? 'المكتب الإعلامي • تقرير ميداني معتمد' : 'Media Office • Official Field Report'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 shrink-0 ms-1 sm:ms-2">
            <button
              type="button"
              onClick={handleShare}
              className="w-8 h-8 rounded-xl border border-slate-200 dark:border-white/10 flex items-center justify-center text-slate-400 hover:text-amber-500 hover:border-amber-500/40 transition-colors cursor-pointer"
              title={lang === 'ar' ? 'مشاركة الخبر' : 'Share Article'}
            >
              <Share2 className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={onClose}
              className="w-8 h-8 rounded-xl border border-slate-200 dark:border-white/10 flex items-center justify-center text-slate-400 hover:text-rose-500 hover:border-rose-500/40 transition-colors cursor-pointer text-lg font-bold"
              title={lang === 'ar' ? 'إغلاق' : 'Close'}
            >
              ✕
            </button>
          </div>
        </div>

        {/* ── Scrollable Body Content ── */}
        <div className="overflow-y-auto p-4 sm:p-6 space-y-4 sm:space-y-5 text-start relative z-10 flex-1 overscroll-contain">
          
          {/* Post Photo in Full Visual Splendor */}
          <div className="relative rounded-2xl overflow-hidden h-52 xs:h-64 sm:h-80 bg-slate-950 border border-slate-200 dark:border-white/10 shadow-lg">
            <img 
              src={resolveAsset(post.image || './road-asphalt-paver.jpg')} 
              alt={post.title} 
              className="w-full h-full object-cover"
              onError={(e) => {
                e.currentTarget.onerror = null;
                e.currentTarget.src = resolveAsset('./road-asphalt-paver.jpg');
              }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/25 to-transparent" />



            {/* Bottom Photo Telemetry */}
            <div className="absolute bottom-3 start-3 end-3 flex items-center justify-between text-white text-xs gap-2 pointer-events-none">
              <span className="flex items-center gap-1.5 bg-black/80 px-2.5 sm:px-3 py-1 rounded-xl border border-white/15 text-[10px] sm:text-[11px] font-bold min-w-0 truncate">
                <MapPin className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                <span className="truncate">{post.location || (lang === 'ar' ? 'مسار أوباري - غات' : 'Ubari - Ghat Highway')}</span>
              </span>

              <span className="bg-black/70 px-2.5 py-1 rounded-xl text-[10px] font-mono text-slate-300 border border-white/10 shrink-0 whitespace-nowrap">
                {post.timeAgo || (lang === 'ar' ? 'اليوم' : 'Today')}
              </span>
            </div>
          </div>

          {/* Post Metadata Pills */}
          <div className="flex items-center justify-between text-xs flex-wrap gap-2 pt-1 border-b border-slate-100 dark:border-white/10 pb-3">
            <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400 text-[11px] font-medium">
              <span className="text-amber-500 font-bold flex items-center gap-1">
                <Building2 className="w-3.5 h-3.5" />
                <span>{post.author || (lang === 'ar' ? 'قسم الإعلام والعلاقات' : 'Media Office')}</span>
              </span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <Calendar className="w-3 h-3" />
                <span>{post.timeAgo || (lang === 'ar' ? 'منذ يومين' : '2 days ago')}</span>
              </span>
            </div>

            <div className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 text-xs font-black">
              <ShieldCheck className="w-4 h-4" />
              <span>{lang === 'ar' ? 'متابعة رسمية معتمدة' : 'Official Update'}</span>
            </div>
          </div>

          {/* Full Headline */}
          <h2 className={`text-base sm:text-xl font-black leading-snug ${
            theme === 'light' ? 'text-slate-950' : 'text-white'
          }`}>
            {lang === 'ar' ? post.title : (post.titleEn || post.title)}
          </h2>

          {/* Detailed Paragraphs */}
          <div className="space-y-3 text-xs sm:text-sm leading-relaxed font-normal text-slate-700 dark:text-slate-300">
            {detailedParagraphs.map((para, i) => (
              <p key={i} className="text-justify leading-relaxed">
                {para}
              </p>
            ))}
          </div>

          {/* Technical Specifications Highlights Box */}
          <div className={`p-4 rounded-2xl border space-y-2.5 ${
            theme === 'light'
              ? 'bg-amber-50/70 border-amber-200 text-slate-800'
              : 'bg-amber-500/10 border-amber-500/25 text-white'
          }`}>
            <h4 className="text-xs font-black text-amber-500 flex items-center gap-1.5">
              <Layers className="w-4 h-4" />
              <span>{lang === 'ar' ? 'المعايير الفنية والتقنية المرتبطة بالعمل:' : 'Technical Specifications:'}</span>
            </h4>
            <div className="grid grid-cols-2 gap-2 text-[11px]">
              <div className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                <span>{lang === 'ar' ? 'المواصفات: كود الطرق السريعة AASHTO' : 'Code: AASHTO Standards'}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                <span>{lang === 'ar' ? 'الفحص: مختبر جيوتقني متنقل' : 'Lab: Geotechnical Mobile Lab'}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-cyan-500" />
                <span>{lang === 'ar' ? 'الطاقة: إنارة شمسية ذكية 100%' : 'Energy: 100% Smart Solar'}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-purple-500" />
                <span>{lang === 'ar' ? 'المتابعة: تصوير درون دوري 4K' : 'Surveillance: Weekly 4K Drone'}</span>
              </div>
            </div>
          </div>

        </div>

        {/* ── Modal Footer ── */}
        <div className="px-4 sm:px-6 py-2.5 border-t border-slate-100 dark:border-white/10 flex items-center justify-between text-xs relative z-10 shrink-0 bg-slate-50/70 dark:bg-black/30">
          <span className="text-[11px] text-slate-500 dark:text-slate-400 font-bold flex items-center gap-1.5 min-w-0 truncate">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500 shrink-0" />
            <span className="truncate">{lang === 'ar' ? 'جهاز تنفيذ مشروعات المواصلات - دولة ليبيا' : 'Transport Projects Execution Authority - State of Libya'}</span>
          </span>
          <span className="text-[10px] text-slate-400 dark:text-slate-500 font-mono shrink-0">
            {lang === 'ar' ? 'بوابة المشروعات الرسمية' : 'Official Portal'}
          </span>
        </div>

      </div>
    </div>
  );
}
