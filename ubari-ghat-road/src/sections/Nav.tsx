import { useEffect, useState, useRef, useCallback } from 'react';
import { Menu, X } from 'lucide-react';
import { scrollToSection, scrollToProgress, scrollToTop } from '@/lib/scroll';
import { assetUrl } from '@/lib/utils';

const NAV_LINKS = [
  { id: 'hero', label: 'الرئيسية', num: '٠٠' },
  { id: 'manifesto', label: 'الفكرة', num: '٠١' },
  { id: 'stats', label: 'الأرقام', num: '٠٢' },
  { id: 'route', label: 'المسار', num: '٠٣' },
  { id: 'phases', label: 'المراحل', num: '٠٤' },
  { id: 'partners', label: 'الشركاء', num: '٠٥' },
  { id: 'impact', label: 'الأثر', num: '٠٦' },
];

export default function Nav() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState('hero');
  const [hoverPercent, setHoverPercent] = useState<number | null>(null);

  const scrubBarRef = useRef<HTMLDivElement>(null);
  const progressBarRef = useRef<HTMLDivElement>(null);
  const isScrolledRef = useRef(false);
  const activeSectionRef = useRef('hero');
  const tickingRef = useRef(false);
  const lastSectionCheckRef = useRef(0);

  // تحديث شريط التقدم بالـ GPU وبدون إعادة تصيير المكون
  const updateScrollState = useCallback(() => {
    const scrollY = window.scrollY;
    const shouldBeScrolled = scrollY > 40;

    if (shouldBeScrolled !== isScrolledRef.current) {
      isScrolledRef.current = shouldBeScrolled;
      setIsScrolled(shouldBeScrolled);
    }

    const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
    if (maxScroll > 0 && progressBarRef.current) {
      const p = Math.min(1, Math.max(0, scrollY / maxScroll));
      progressBarRef.current.style.transform = `scaleX(${p})`;
    }

    // فحص القسم النشط كل 120ms لتفادي إعادة الحسابات المكلفة
    const now = performance.now();
    if (now - lastSectionCheckRef.current > 120) {
      lastSectionCheckRef.current = now;
      const checkpoint = scrollY + window.innerHeight * 0.35;

      for (let i = NAV_LINKS.length - 1; i >= 0; i--) {
        const item = NAV_LINKS[i];
        const el = document.getElementById(item.id);
        if (el) {
          const spacer = el.closest('.pin-spacer') as HTMLElement | null;
          const target = spacer || el;
          const top = target.getBoundingClientRect().top + scrollY;
          if (checkpoint >= top - 60) {
            if (activeSectionRef.current !== item.id) {
              activeSectionRef.current = item.id;
              setActiveSection(item.id);
            }
            break;
          }
        }
      }
    }

    tickingRef.current = false;
  }, []);

  useEffect(() => {
    const onScroll = () => {
      if (!tickingRef.current) {
        tickingRef.current = true;
        requestAnimationFrame(updateScrollState);
      }
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    // تنفيذ أولي
    updateScrollState();

    return () => window.removeEventListener('scroll', onScroll);
  }, [updateScrollState]);

  const handleNavClick = (id: string) => {
    setMobileMenuOpen(false);
    scrollToSection(id);
  };

  const handleScrubClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!scrubBarRef.current) return;
    const rect = scrubBarRef.current.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const ratio = Math.max(0, Math.min(1, (rect.width - clickX) / rect.width));
    scrollToProgress(ratio);
  };

  const handleScrubMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!scrubBarRef.current) return;
    const rect = scrubBarRef.current.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const ratio = Math.max(0, Math.min(1, (rect.width - clickX) / rect.width));
    setHoverPercent(Math.round(ratio * 100));
  };

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-colors duration-300 ${
        isScrolled
          ? 'bg-[#0a0a0b]/92 border-b border-white/10 shadow-[0_12px_32px_rgba(0,0,0,0.7)] backdrop-blur-xl'
          : 'bg-gradient-to-b from-[#0a0a0b]/90 via-[#0a0a0b]/60 to-transparent'
      }`}
    >
      <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-3 md:px-10 md:py-3.5">
        {/* الشعار واسم الجهاز */}
        <button
          onClick={() => scrollToTop()}
          className="group flex items-center gap-3.5 text-right transition-transform active:scale-95"
          title="العودة لأعلى الصفحة"
        >
          <div className="relative flex h-11 w-11 md:h-12 md:w-12 items-center justify-center rounded-xl border border-white/15 bg-white/5 p-1 transition-all group-hover:border-[var(--amber)] group-hover:shadow-[0_0_15px_rgba(232,147,44,0.3)]">
            <img
              src={assetUrl('images/logo.webp')}
              onError={(e) => {
                const target = e.currentTarget;
                if (!target.src.endsWith('.png')) {
                  target.src = assetUrl('images/logo.png');
                }
              }}
              alt="شعار جهاز تنفيذ مشروعات الموصلات"
              width="48"
              height="48"
              loading="eager"
              decoding="async"
              className="h-full w-full object-contain"
            />
          </div>
          <div className="leading-tight">
            <div className="flex items-center gap-2">
              <p className="text-xs md:text-sm font-bold tracking-wide text-[var(--bone)] group-hover:text-[var(--amber)] transition-colors">
                جهاز تنفيذ مشروعات الموصلات
              </p>
              <span className="hidden lg:inline-flex items-center gap-1 rounded-full border border-[var(--amber)]/30 bg-[var(--amber)]/10 px-2 py-0.5 text-[9px] font-medium text-[var(--amber)]">
                <span className="h-1.5 w-1.5 rounded-full bg-[var(--amber)] animate-pulse" />
                خطة عودة الحياة
              </span>
            </div>
            <p className="text-[10px] md:text-[11px] text-[var(--mute)]">
              إدارة مشروعات الطرق الرئيسية — ليبيا
            </p>
          </div>
        </button>

        {/* روابط التنقل الرئيسية لأجهزة سطح المكتب */}
        <nav
          aria-label="القائمة الرئيسية"
          className="hidden lg:flex items-center gap-1 rounded-full border border-white/10 bg-white/[0.04] p-1.5 backdrop-blur-md"
        >
          {NAV_LINKS.map((item) => {
            const isActive = activeSection === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.id)}
                className={`relative rounded-full px-3.5 py-1.5 text-xs font-semibold tracking-wide transition-all ${
                  isActive
                    ? 'bg-[var(--amber)] text-black font-bold shadow-[0_0_12px_rgba(232,147,44,0.4)]'
                    : 'text-[var(--bone)]/80 hover:text-white hover:bg-white/10'
                }`}
              >
                {item.label}
              </button>
            );
          })}
        </nav>

        {/* زر القائمة للشاشات الصغيرة */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/15 bg-white/5 text-[var(--bone)] transition-colors hover:border-[var(--amber)] hover:text-[var(--amber)] lg:hidden"
          aria-label="فتح القائمة"
        >
          {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {/* شريط التقدم والتمرير التفاعلي في أسفل النيف بار */}
      <div
        ref={scrubBarRef}
        onClick={handleScrubClick}
        onMouseMove={handleScrubMouseMove}
        onMouseLeave={() => setHoverPercent(null)}
        className="group relative h-1.5 w-full cursor-pointer bg-white/10 transition-all hover:h-2.5"
        title="انقر في أي موضع للانتقال السريع"
      >
        {/* خط التقدم باستخدام GPU transform: scaleX لتحقيق 120 FPS بدون أي reflow */}
        <div
          ref={progressBarRef}
          className="absolute inset-y-0 right-0 w-full origin-right bg-gradient-to-l from-[var(--amber)] via-[#e8932c] to-[var(--gold)] shadow-[0_0_10px_rgba(232,147,44,0.8)] will-change-transform"
          style={{ transform: 'scaleX(0)' }}
        />

        {/* مؤشر النسبة المئوية عند التحويم */}
        {hoverPercent !== null && (
          <div
            className="pointer-events-none absolute -bottom-7 rounded bg-black/95 px-2 py-0.5 text-[10px] font-bold text-[var(--amber)] shadow-md border border-[var(--amber)]/30 backdrop-blur-sm"
            style={{ right: `${hoverPercent}%`, transform: 'translateX(50%)' }}
          >
            {hoverPercent}%
          </div>
        )}
      </div>

      {/* القائمة المنسدلة للشاشات الصغيرة والمتوسطة */}
      {mobileMenuOpen && (
        <div className="border-b border-white/15 bg-[#0a0a0b]/98 px-6 py-6 shadow-2xl backdrop-blur-2xl lg:hidden animate-in fade-in slide-in-from-top-4 duration-200">
          <div className="grid grid-cols-2 gap-2.5">
            {NAV_LINKS.map((item) => {
              const isActive = activeSection === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleNavClick(item.id)}
                  className={`flex items-center justify-between rounded-xl px-4 py-3 text-sm font-semibold transition-all ${
                    isActive
                      ? 'bg-[var(--amber)] text-black font-bold'
                      : 'border border-white/10 bg-white/5 text-[var(--bone)] hover:border-[var(--amber)]/40 hover:bg-white/10'
                  }`}
                >
                  <span>{item.label}</span>
                  <span className={`num-latin text-xs ${isActive ? 'text-black/70' : 'text-[var(--mute)]'}`}>
                    {item.num}
                  </span>
                </button>
              );
            })}
          </div>

          <div className="mt-5 pt-4 border-t border-white/10">
            <p className="text-xs font-bold text-[var(--bone)]">مشروع طريق أوباري – غات</p>
            <p className="text-[11px] text-[var(--mute)]">٣٦٠ كم في عمق الجنوب الليبي — إشراف جهاز تنفيذ مشروعات الموصلات</p>
          </div>
        </div>
      )}
    </header>
  );
}
