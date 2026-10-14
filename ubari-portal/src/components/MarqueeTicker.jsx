import React from 'react';
import { Activity, ShieldCheck, Flame, Zap, Award, Radio } from 'lucide-react';

export default function MarqueeTicker({ 
  items = [], 
  speed = 'normal', 
  theme = 'dark', 
  variant = 'hero', // 'hero' | 'selected-work'
  direction = 'rtl',
  lang = 'ar'
}) {
  const defaultHeroItems = [
    { text: 'مشروع صيانة ورصف طريق أوباري – غات الاستراتيجي بطول 360 كم', tag: 'مشروع وطني' },
    { text: 'نسبة الإنجاز الفعلي الإجمالية تتجاوز 68.5% على امتداد مسار الطريق', tag: 'متابعة دورية' },
    { text: 'تواصل أعمال طبقات الرصف والأسفلت بأعلى معايير الجودة المعتمدة', tag: 'سير الأعمال' },
    { text: 'توريد وتركيب أعمدة الإنارة الذكية بالطاقة الشمسية على امتداد المسار', tag: 'السلامة والإنارة' },
    { text: 'فحص جودة خلطات الأسفلت والدمك عبر المعامل الجيوتقنية المعتمدة', tag: 'ضبط الجودة' },
    { text: 'إشراف هندسي ميداني متواصل ومتابعة مستمرة لمعايير السلامة المرورية', tag: 'الإشراف الهندسي' }
  ];

  const defaultSelectedWorkItems = [
    { title: 'القطاع 01: أوباري - تين أوباو (90 كم)', stat: '78% منجز', badge: 'رصف الطبقة الرابطة', icon: 'zap' },
    { title: 'القطاع 02: تين أوباو - العوينات (110 كم)', stat: '65% منجز', badge: 'طبقة الأساس والعبّارات', icon: 'flame' },
    { title: 'القطاع 03: العوينات - تهالة (85 كم)', stat: '72% منجز', badge: 'تثبيت الأكتاف والإنارة', icon: 'shield' },
    { title: 'القطاع 04: تهالة - غات (75 كم)', stat: '59% منجز', badge: 'أعمال التوسعة والسلامة', icon: 'activity' },
    { title: 'منظومة الإنارة بالطاقة الشمسية', stat: '100% مطابقة', badge: 'طاقة خضراء ذكية', icon: 'award' },
    { title: 'مختبرات الفحص الهندسي الميداني', stat: 'ISO 9001', badge: 'معايير دولية', icon: 'shield' }
  ];

  const activeItems = items.length > 0 ? items : (variant === 'hero' ? defaultHeroItems : defaultSelectedWorkItems);

  // Ensure base list has enough items for widescreen displays (minimum 8 items)
  let baseList = [...activeItems];
  while (baseList.length < 8) {
    baseList = [...baseList, ...activeItems];
  }

  // Calculate speed: calm, comfortable reading velocity with continuous 0s delay
  const getDuration = () => {
    if (typeof speed === 'number') return `${speed}s`;
    if (speed === 'fast') return '50s';
    if (speed === 'slow') return '100s';
    return '75s'; // Calm, comfortable, slower tempo as requested by user
  };
  const animDuration = getDuration();

  // ── Variant 1: Selected Work Grid Marquee (Seamless Dual-Track) ──
  if (variant === 'selected-work') {
    return (
      <div className="w-full overflow-hidden py-3 select-none relative marquee-container group">
        {/* Fade gradient masks on sides */}
        <div className="absolute top-0 bottom-0 left-0 w-16 sm:w-28 z-10 pointer-events-none bg-gradient-to-r from-background-current to-transparent" />
        <div className="absolute top-0 bottom-0 right-0 w-16 sm:w-28 z-10 pointer-events-none bg-gradient-to-l from-background-current to-transparent" />

        <div className="flex w-full overflow-hidden select-none" dir="ltr">
          {/* Track 1 */}
          <div 
            className="flex shrink-0 animate-marquee items-center gap-4 sm:gap-6 pe-4 sm:pe-6 py-1 will-change-transform"
            style={{ animationDuration: animDuration }}
          >
            {baseList.map((item, idx) => (
              <div
                key={`work1-${idx}`}
                dir="rtl"
                className={`flex items-center gap-3 px-4 sm:px-5 py-2.5 rounded-2xl border shadow-sm transition-transform duration-200 hover:scale-[1.02] flex-shrink-0 ${
                  theme === 'light'
                    ? 'bg-white border-slate-200 text-slate-900 shadow-slate-200/40'
                    : 'bg-[#0f172a] border-white/10 text-white shadow-black/40'
                }`}
              >
                <div className="w-8 h-8 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-500">
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <div className="text-start">
                  <div className="flex items-center gap-2">
                    <span className="text-xs sm:text-sm font-black">{item.title}</span>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-amber-500 text-slate-950">
                      {item.stat}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 font-medium">{item.badge}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Track 2 (Clone for infinite seamless loop) */}
          <div 
            aria-hidden="true"
            className="flex shrink-0 animate-marquee items-center gap-4 sm:gap-6 pe-4 sm:pe-6 py-1 will-change-transform"
            style={{ animationDuration: animDuration }}
          >
            {baseList.map((item, idx) => (
              <div
                key={`work2-${idx}`}
                dir="rtl"
                className={`flex items-center gap-3 px-4 sm:px-5 py-2.5 rounded-2xl border shadow-sm transition-transform duration-200 hover:scale-[1.02] flex-shrink-0 ${
                  theme === 'light'
                    ? 'bg-white border-slate-200 text-slate-900 shadow-slate-200/40'
                    : 'bg-[#0f172a] border-white/10 text-white shadow-black/40'
                }`}
              >
                <div className="w-8 h-8 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-500">
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <div className="text-start">
                  <div className="flex items-center gap-2">
                    <span className="text-xs sm:text-sm font-black">{item.title}</span>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-amber-500 text-slate-950">
                      {item.stat}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 font-medium">{item.badge}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // ── Variant 2: Hero Ticker (2026 Seamless Borderless Floating Glass Edition) ──
  const isRtl = direction === 'rtl' || lang === 'ar';

  return (
    <div 
      className="w-full overflow-hidden py-2.5 px-3 sm:px-4 relative select-none z-30 transition-all duration-300 border-none"
      style={{
        background: theme === 'light'
          ? isRtl
            ? 'linear-gradient(to left, transparent 0%, rgba(245, 158, 11, 0.05) 5%, rgba(254, 243, 199, 0.22) 14%, rgba(254, 243, 199, 0.3) 20%, rgba(255, 255, 255, 0.25) 45%, rgba(255, 255, 255, 0.2) 75%, transparent 100%)'
            : 'linear-gradient(to right, transparent 0%, rgba(245, 158, 11, 0.05) 5%, rgba(254, 243, 199, 0.22) 14%, rgba(254, 243, 199, 0.3) 20%, rgba(255, 255, 255, 0.25) 45%, rgba(255, 255, 255, 0.2) 75%, transparent 100%)'
          : isRtl
            ? 'linear-gradient(to left, transparent 0%, rgba(245, 158, 11, 0.08) 5%, rgba(245, 158, 11, 0.04) 14%, rgba(15, 23, 42, 0.35) 45%, rgba(15, 23, 42, 0.45) 75%, transparent 100%)'
            : 'linear-gradient(to right, transparent 0%, rgba(245, 158, 11, 0.08) 5%, rgba(245, 158, 11, 0.04) 14%, rgba(15, 23, 42, 0.35) 45%, rgba(15, 23, 42, 0.45) 75%, transparent 100%)'
      }}
    >
      <div className="max-w-7xl mx-auto flex items-center gap-3 sm:gap-4 relative">
        
        {/* ── Ambient Warm Golden Glow behind & beside the Badge on Right (RTL) ── */}
        <div 
          className="absolute -end-3 top-1/2 -translate-y-1/2 w-48 h-12 pointer-events-none rounded-full opacity-60 z-10"
          style={{
            background: 'radial-gradient(ellipse at center, rgba(245, 158, 11, 0.3) 0%, rgba(251, 191, 36, 0.1) 50%, transparent 80%)'
          }}
        />

        {/* ── Fixed Live Broadcast Badge (Pulsing Radar) ── */}
        <div className="flex-shrink-0 flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500 text-slate-950 font-black text-[11px] sm:text-xs shadow-md shadow-amber-500/25 z-20 border-none transition-transform hover:scale-[1.02]">
          <span className="relative flex h-2 w-2 flex-shrink-0">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-red-600 shadow-sm"></span>
          </span>
          <span className="tracking-wide whitespace-nowrap">
            {lang === 'ar' ? 'المستجدات الميدانية' : 'Field Updates'}
          </span>
        </div>

        {/* ── Marquee Track with Side Fade Masks ── */}
        <div className="relative flex-1 overflow-hidden marquee-container group">
          
          {/* Side Fade Gradient Mask - Start (Right in RTL, next to badge) */}
          <div 
            className="absolute top-0 bottom-0 start-0 w-12 sm:w-24 z-10 pointer-events-none"
            style={{
              background: theme === 'light'
                ? isRtl
                  ? 'linear-gradient(to left, rgba(254, 243, 199, 0.5) 0%, rgba(255, 255, 255, 0.25) 50%, transparent 100%)'
                  : 'linear-gradient(to right, rgba(254, 243, 199, 0.5) 0%, rgba(255, 255, 255, 0.25) 50%, transparent 100%)'
                : isRtl
                  ? 'linear-gradient(to left, rgba(245, 158, 11, 0.18) 0%, rgba(15, 23, 42, 0.4) 50%, transparent 100%)'
                  : 'linear-gradient(to right, rgba(245, 158, 11, 0.18) 0%, rgba(15, 23, 42, 0.4) 50%, transparent 100%)'
            }}
          />
          
          {/* Side Fade Gradient Mask - End (Left in RTL, screen edge) */}
          <div 
            className="absolute top-0 bottom-0 end-0 w-12 sm:w-24 z-10 pointer-events-none"
            style={{
              background: theme === 'light'
                ? isRtl
                  ? 'linear-gradient(to right, rgba(255, 255, 255, 0.6) 0%, transparent 100%)'
                  : 'linear-gradient(to left, rgba(255, 255, 255, 0.6) 0%, transparent 100%)'
                : isRtl
                  ? 'linear-gradient(to right, rgba(15, 23, 42, 0.6) 0%, transparent 100%)'
                  : 'linear-gradient(to left, rgba(15, 23, 42, 0.6) 0%, transparent 100%)'
            }}
          />

          {/* Continuous Moving Track: Dual-Track Seamless Infinite Loop (Zero delay, instant continuation) */}
          <div className="flex w-full overflow-hidden select-none" dir="ltr">
            {/* Primary Track 1 */}
            <div 
              className="flex shrink-0 animate-marquee items-center gap-8 sm:gap-10 pe-8 sm:pe-10 py-0.5 will-change-transform"
              style={{ animationDuration: animDuration }}
            >
              {baseList.map((item, idx) => (
                <div key={`track1-${idx}`} dir="rtl" className="flex items-center gap-3 whitespace-nowrap text-sm sm:text-base font-bold">
                  {/* News Tag Micro-Pill */}
                  <span className={`px-2.5 py-0.5 rounded-lg text-xs font-black tracking-wide transition-colors ${
                    theme === 'light'
                      ? 'bg-amber-500/15 text-amber-950 shadow-sm'
                      : 'bg-amber-400/20 text-amber-300 shadow-sm'
                  }`}>
                    {item.tag || (lang === 'ar' ? 'متابعة دورية' : 'Update')}
                  </span>

                  {/* News Headline - High Clarity & Sharp Legibility */}
                  <span className={`tracking-normal transition-colors cursor-pointer select-text ${
                    theme === 'light' 
                      ? 'text-slate-950 hover:text-amber-600 drop-shadow-[0_1px_1px_rgba(255,255,255,0.9)]' 
                      : 'text-white hover:text-amber-300 drop-shadow-[0_1px_3px_rgba(0,0,0,0.85)]'
                  }`}>
                    {item.text}
                  </span>

                  {/* Glowing Separator Diamond */}
                  <span className="text-amber-400 font-black mx-3 text-xs drop-shadow-[0_0_8px_rgba(251,191,36,0.8)]">✦</span>
                </div>
              ))}
            </div>

            {/* Seamless Sibling Track 2 (Cloned for 100% infinite loop with zero delay) */}
            <div 
              aria-hidden="true"
              className="flex shrink-0 animate-marquee items-center gap-8 sm:gap-10 pe-8 sm:pe-10 py-0.5 will-change-transform"
              style={{ animationDuration: animDuration }}
            >
              {baseList.map((item, idx) => (
                <div key={`track2-${idx}`} dir="rtl" className="flex items-center gap-3 whitespace-nowrap text-sm sm:text-base font-bold">
                  {/* News Tag Micro-Pill */}
                  <span className={`px-2.5 py-0.5 rounded-lg text-xs font-black tracking-wide transition-colors ${
                    theme === 'light'
                      ? 'bg-amber-500/15 text-amber-950 shadow-sm'
                      : 'bg-amber-400/20 text-amber-300 shadow-sm'
                  }`}>
                    {item.tag || (lang === 'ar' ? 'متابعة دورية' : 'Update')}
                  </span>

                  {/* News Headline - High Clarity & Sharp Legibility */}
                  <span className={`tracking-normal transition-colors cursor-pointer select-text ${
                    theme === 'light' 
                      ? 'text-slate-950 hover:text-amber-600 drop-shadow-[0_1px_1px_rgba(255,255,255,0.9)]' 
                      : 'text-white hover:text-amber-300 drop-shadow-[0_1px_3px_rgba(0,0,0,0.85)]'
                  }`}>
                    {item.text}
                  </span>

                  {/* Glowing Separator Diamond */}
                  <span className="text-amber-400 font-black mx-3 text-xs drop-shadow-[0_0_8px_rgba(251,191,36,0.8)]">✦</span>
                </div>
              ))}
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
