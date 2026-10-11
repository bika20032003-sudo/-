import React from 'react';
import { Activity, ShieldCheck, Flame, Zap, Award, Compass, TrendingUp } from 'lucide-react';

export default function MarqueeTicker({ 
  items = [], 
  speed = 'normal', 
  theme = 'dark', 
  variant = 'hero', // 'hero' | 'selected-work'
  direction = 'rtl' 
}) {
  const defaultHeroItems = [
    { text: 'مشروع صيانة ورصف طريق أوباري – غات الاستراتيجي بطول 360 كم', tag: 'مشروع وطني' },
    { text: 'نسبة الإنجاز الفعلي الإجمالية تتجاوز 68.5% عبر القطاعات الأربعة', tag: 'متابعة دورية' },
    { text: 'تواصل أعمال طبقات الرصف والأسفلت وفق أعلى المواصفات الفنية المعتمدة', tag: 'سير الأعمال' },
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

  // Ensure base list has enough items for widescreen displays, then create 2 exact identical halves for 100% seamless loop
  let baseList = [...activeItems];
  while (baseList.length < 6) {
    baseList = [...baseList, ...activeItems];
  }
  const duplicatedItems = [...baseList, ...baseList];

  if (variant === 'selected-work') {
    return (
      <div className="w-full overflow-hidden py-3 select-none relative group">
        {/* Fade gradient masks on sides */}
        <div className="absolute top-0 bottom-0 left-0 w-16 sm:w-28 z-10 pointer-events-none bg-gradient-to-r from-background-current to-transparent" />
        <div className="absolute top-0 bottom-0 right-0 w-16 sm:w-28 z-10 pointer-events-none bg-gradient-to-l from-background-current to-transparent" />

        <div className="flex w-max animate-marquee gap-4 sm:gap-6 hover:[animation-play-state:paused] py-1 will-change-transform">
          {duplicatedItems.map((item, idx) => (
            <div
              key={idx}
              className={`flex items-center gap-3 px-4 sm:px-5 py-2.5 rounded-2xl border shadow-md transition-all duration-200 hover:scale-[1.02] flex-shrink-0 ${
                theme === 'light'
                  ? 'bg-white/95 border-slate-200 text-slate-900 shadow-slate-200/60'
                  : 'bg-[#0f172a]/95 border-white/15 text-white shadow-black/60'
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
    );
  }

  // Variant: Hero Ticker
  return (
    <div 
      className={`w-full overflow-hidden py-2.5 px-2 border-y relative select-none z-30 transition-colors ${
        theme === 'light'
          ? 'bg-amber-50/95 border-amber-200/80 text-slate-900'
          : 'bg-[#0a0f1d]/95 border-amber-500/20 text-amber-100'
      }`}
    >
      <div className="max-w-7xl mx-auto flex items-center gap-3">
        {/* Left Fixed Badge */}
        <div className="flex-shrink-0 flex items-center gap-2 px-3 py-1 rounded-xl bg-amber-500 text-slate-950 font-bold text-xs shadow-sm">
          <span className="w-2 h-2 rounded-full bg-red-600"></span>
          <span className="tracking-wide">المستجدات الميدانية</span>
        </div>

        {/* Marquee Track */}
        <div className="relative flex-1 overflow-hidden">
          <div className="flex w-max animate-marquee gap-8 items-center hover:[animation-play-state:paused]">
            {duplicatedItems.map((item, idx) => (
              <div key={idx} className="flex items-center gap-2.5 whitespace-nowrap text-xs sm:text-sm font-bold">
                <span className="px-2 py-0.5 rounded-md text-[10px] font-black bg-amber-500/20 text-amber-500 border border-amber-500/30">
                  {item.tag || 'أخبار المشروع'}
                </span>
                <span className={theme === 'light' ? 'text-slate-800' : 'text-slate-200'}>
                  {item.text}
                </span>
                <span className="text-amber-500/50 mx-2">•</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
