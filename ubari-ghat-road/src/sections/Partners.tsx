import { useLayoutEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { assetUrl } from '@/lib/utils';

gsap.registerPlugin(ScrollTrigger);

const GROUPS = [
  {
    role: 'الجهة المشرفة',
    items: ['جهاز تنفيذ مشروعات الموصلات', 'إدارة مشروعات الطرق الرئيسية'],
  },
  {
    role: 'التحالف المنفذ',
    items: ['أوراسكوم للإنشاء والصناعة', 'أبناء حسن علام', 'رواد الهندسة الحديثة'],
  },
  {
    role: 'الجهة المالكة',
    items: ['حكومة الوحدة الوطنية', 'خطة عودة الحياة'],
  },
];

export default function Partners() {
  const root = useRef<HTMLElement>(null);

  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      gsap.to('.partners-bg', {
        yPercent: 12,
        ease: 'none',
        scrollTrigger: { trigger: root.current, start: 'top bottom', end: 'bottom top', scrub: 1 },
      });

      gsap.utils.toArray<HTMLElement>('.partner-row').forEach((el, i) => {
        gsap.from(el, {
          opacity: 0,
          y: 60,
          duration: 0.9,
          ease: 'power3.out',
          delay: i * 0.08,
          scrollTrigger: { trigger: el, start: 'top 88%' },
        });
      });
    }, root);
    return () => ctx.revert();
  }, []);

  return (
    <section ref={root} id="partners" className="relative overflow-hidden py-28 md:py-40">
      <div className="cine-bg partners-bg" style={{ backgroundImage: `url(${assetUrl('images/machinery.webp')})` }} />
      <div className="absolute inset-0 bg-[var(--ink)]/82" />
      <div className="cine-veil" />

      <div className="relative z-10 mx-auto max-w-6xl px-6 md:px-12">
        <p className="mb-16 text-[11px] font-semibold tracking-[0.5em] text-[var(--amber)]">٠٥ — الشركاء</p>

        {(() => {
          let counter = 0;
          return GROUPS.map((g, gi) => (
            <div key={gi} className="mb-14 last:mb-0">
              <p className="mb-5 text-xs font-bold tracking-[0.35em] text-[var(--mute)]">{g.role}</p>
              {g.items.map((item, ii) => {
                counter += 1;
                const num = String(counter).padStart(2, '0');
                return (
                  <div
                    key={ii}
                    className="partner-row group flex items-baseline justify-between border-t border-[var(--bone)]/12 py-5 transition-colors duration-500 hover:border-[var(--amber)]/60"
                  >
                    <h3 className="font-display text-2xl md:text-5xl text-[var(--bone)] transition-colors duration-500 group-hover:text-[var(--amber)]">
                      {item}
                    </h3>
                    <span className="num-latin text-xs md:text-sm text-[var(--mute)]">{num}</span>
                  </div>
                );
              })}
            </div>
          ));
        })()}
      </div>
    </section>
  );
}
