import { useLayoutEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { assetUrl } from '@/lib/utils';

gsap.registerPlugin(ScrollTrigger);

const IMPACTS = [
  'تسهيل وصول الخدمات إلى جميع مواطني الجنوب',
  'تعزيز السلامة المرورية وجودة شبكة الطرق',
  'دعم التنمية الاقتصادية والخدمات اللوجستية بالمنطقة',
];

export default function Impact() {
  const root = useRef<HTMLElement>(null);

  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({
        scrollTrigger: {
          id: 'st-impact',
          trigger: root.current,
          start: 'top top',
          end: '+=200%',
          scrub: 1,
          pin: true,
        },
      });

      tl.fromTo('.impact-bg', { scale: 1.2 }, { scale: 1.02, ease: 'none', duration: 3 }, 0)
        .fromTo('.impact-title .reveal-line > span', { yPercent: 115 }, { yPercent: 0, stagger: 0.15, ease: 'power3.out', duration: 1 }, 0.2)
        .fromTo('.impact-point', { opacity: 0, y: 40 }, { opacity: 1, y: 0, stagger: 0.25, ease: 'power2.out', duration: 0.8 }, 0.9)
        .fromTo('.impact-cta', { opacity: 0 }, { opacity: 1, duration: 0.5 }, 1.8);
    }, root);
    return () => ctx.revert();
  }, []);

  return (
    <section ref={root} id="impact" className="relative h-screen overflow-hidden">
      <div className="cine-bg impact-bg" style={{ backgroundImage: `url(${assetUrl('images/horizon.webp')})` }} />
      <div className="cine-veil" />

      <div className="relative z-10 flex h-full flex-col items-center justify-center px-5 text-center">
        <p className="mb-4 md:mb-8 text-[11px] font-semibold tracking-[0.4em] md:tracking-[0.5em] text-[var(--amber)]">٠٦ — الأثر</p>

        <h2 className="impact-title font-display leading-[1.28] md:leading-[1.18]">
          <span className="reveal-line text-[8vw] sm:text-[8.5vw] md:text-[6.5vw] text-[var(--bone)] pb-1"><span>طريقٌ واحد،</span></span>
          <span className="reveal-line text-[8vw] sm:text-[8.5vw] md:text-[6.5vw] text-[var(--bone)] pb-1"><span>أثرٌ <span className="text-[var(--amber)]">على جنوبٍ بأكمله</span></span></span>
        </h2>

        <div className="mt-8 md:mt-12 flex flex-col items-center gap-3 md:flex-row md:gap-12">
          {IMPACTS.map((t, i) => (
            <p key={i} className="impact-point max-w-[280px] text-xs md:text-sm font-light leading-relaxed text-[var(--bone)]/85" style={{ opacity: 0 }}>
              {t}
            </p>
          ))}
        </div>

        <p className="impact-cta mt-8 md:mt-14 text-[10px] md:text-[11px] tracking-[0.3em] md:tracking-[0.4em] text-[var(--mute)]" style={{ opacity: 0 }}>
          جهاز تنفيذ مشروعات الموصلات — نبني ما يربط ليبيا
        </p>
      </div>
    </section>
  );
}
