import { useLayoutEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

const STATS = [
  { value: 360, suffix: ' كم', label: 'الطول الإجمالي للطريق' },
  { value: 4, suffix: '', label: 'بلديات في الجنوب يخدمها الطريق' },
  { value: 2022, suffix: '', label: 'سنة توقيع العقد ضمن خطة عودة الحياة', plain: true },
];

export default function Stats() {
  const root = useRef<HTMLElement>(null);

  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      gsap.utils.toArray<HTMLElement>('.stat-item').forEach((el) => {
        const numEl = el.querySelector<HTMLElement>('.stat-num');
        const target = Number(numEl?.dataset.value || 0);
        const obj = { v: 0 };

        gsap.from(el, {
          opacity: 0,
          y: 70,
          duration: 1,
          ease: 'power3.out',
          scrollTrigger: { trigger: el, start: 'top 85%' },
        });

        gsap.to(obj, {
          v: target,
          duration: 2,
          ease: 'power2.out',
          scrollTrigger: { trigger: el, start: 'top 80%' },
          onUpdate: () => {
            if (!numEl) return;
            const v = Math.round(obj.v);
            numEl.textContent = numEl.dataset.plain === '1' ? String(v) : v.toLocaleString('en-US');
          },
        });
      });

      gsap.to('.stats-marquee', {
        xPercent: 25,
        ease: 'none',
        scrollTrigger: { trigger: root.current, start: 'top bottom', end: 'bottom top', scrub: 1 },
      });
    }, root);
    return () => ctx.revert();
  }, []);

  return (
    <section ref={root} id="stats" className="relative overflow-hidden bg-[var(--ink)] py-20 md:py-40">
      {/* نص ضخم متحرك في الخلفية */}
      <div className="pointer-events-none absolute top-1/2 right-0 -translate-y-1/2 select-none whitespace-nowrap">
        <div className="stats-marquee marquee-track font-display text-[16vw] md:text-[18vw] leading-none text-stroke opacity-[0.11]">
          أوباري — غات&nbsp;·&nbsp;٣٦٠ كم&nbsp;·&nbsp;أوباري — غات&nbsp;·&nbsp;٣٦٠ كم&nbsp;·&nbsp;
        </div>
      </div>

      <div className="relative mx-auto max-w-6xl px-5 md:px-12">
        <p className="mb-10 md:mb-16 text-[11px] font-semibold tracking-[0.4em] md:tracking-[0.5em] text-[var(--mute)]">٠٢ — بالأرقام</p>
        <div className="grid grid-cols-1 gap-10 md:grid-cols-2 md:gap-x-20 md:gap-y-24">
          {STATS.map((s, i) => (
            <div key={i} className="stat-item border-t border-[var(--bone)]/15 pt-5 md:pt-6">
              <div className="font-display num-latin text-5xl sm:text-6xl md:text-8xl text-[var(--bone)] flex items-baseline gap-1">
                <span className="stat-num" data-value={s.value} data-plain={s.plain ? '1' : '0'}>0</span>
                <span className="text-2xl sm:text-3xl md:text-4xl text-[var(--amber)]">{s.suffix}</span>
              </div>
              <p className="mt-2 md:mt-3 text-xs sm:text-sm md:text-base font-light text-[var(--mute)]">{s.label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
