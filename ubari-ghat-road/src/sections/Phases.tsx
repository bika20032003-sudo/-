import { useLayoutEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { assetUrl } from '@/lib/utils';

gsap.registerPlugin(ScrollTrigger);

const PHASES = [
  { date: 'يناير 2022', title: 'توقيع العقد', desc: 'حكومة الوحدة الوطنية توقّع عقد صيانة وتطوير الطريق مع تحالف شركات مصرية ضمن خطة «عودة الحياة».' },
  { date: 'أغسطس 2023', title: 'تسليم موقع التنفيذ', desc: 'تسليم موقع المشروع للتحالف المنفذ بحضور نائب رئيس الحكومة وأعيان ومشايخ وبلديات المنطقة.' },
  { date: 'يناير 2024', title: 'وصول المعدات', desc: 'وصول الدفعة الثانية من معدات الصيانة الثقيلة إلى بلدية أوباري تمهيداً لبدء الأعمال.' },
  { date: 'مايو 2024', title: 'انطلاق التنفيذ', desc: 'رئيس الحكومة يؤكد سير أعمال الصيانة بكامل طاقتها بعد بدء المراحل الأولى من المشروع.' },
  { date: 'فبراير 2025', title: 'الرصف الأسفلتي', desc: 'استمرار أعمال الرصف الأسفلتي في القطاع الأول (موقع رقم 1) بإشراف إدارة مشروعات الطرق الرئيسية.' },
];

export default function Phases() {
  const root = useRef<HTMLElement>(null);

  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({
        scrollTrigger: {
          id: 'st-phases',
          trigger: root.current,
          start: 'top top',
          end: '+=320%',
          scrub: 1,
          pin: true,
        },
      });

      tl.fromTo('.phase-bg', { yPercent: -8 }, { yPercent: 8, ease: 'none', duration: 6 }, 0)
        .fromTo('.phase-spine', { scaleY: 0 }, { scaleY: 1, ease: 'none', duration: 5.4 }, 0.2);

      gsap.utils.toArray<HTMLElement>('.phase-item').forEach((el, i) => {
        tl.fromTo(
          el,
          { opacity: 0, x: 60 },
          { opacity: 1, x: 0, ease: 'power2.out', duration: 0.7 },
          0.5 + i * 1.05
        );
      });
    }, root);
    return () => ctx.revert();
  }, []);

  return (
    <section ref={root} id="phases" className="relative h-screen overflow-hidden">
      <div className="cine-bg phase-bg" style={{ backgroundImage: `url(${assetUrl('images/paving.webp')})` }} />
      <div className="absolute inset-0 bg-[var(--ink)]/78" />
      <div className="cine-veil" />

      <div className="relative z-10 mx-auto flex h-full max-w-6xl flex-col justify-center px-5 md:px-12">
        <p className="mb-2 md:mb-4 text-[11px] font-semibold tracking-[0.4em] md:tracking-[0.5em] text-[var(--amber)]">٠٤ — مراحل التنفيذ</p>
        <h2 className="font-display mb-5 md:mb-12 text-2xl sm:text-3xl md:text-6xl text-[var(--bone)]">محطات المشروع</h2>

        <div className="relative max-w-3xl">
          <div className="absolute top-0 bottom-0 right-[7px] w-px bg-[var(--bone)]/15" />
          <div
            className="phase-spine absolute top-0 bottom-0 right-[6px] w-[3px] origin-top bg-[var(--amber)]"
            style={{ transform: 'scaleY(0)' }}
          />
          <div className="space-y-3 sm:space-y-5 md:space-y-8">
            {PHASES.map((p, i) => (
              <div key={i} className="phase-item relative pr-8 md:pr-10" style={{ opacity: 0 }}>
                <span className="absolute right-0 top-1.5 md:top-2 h-[15px] w-[15px] rounded-full border-2 border-[var(--amber)] bg-[var(--ink)]" />
                <p className="text-[10px] md:text-xs font-bold tracking-widest text-[var(--amber)] num-latin">{p.date}</p>
                <h3 className="font-display mt-0.5 md:mt-1 text-base sm:text-xl md:text-3xl text-[var(--bone)]">{p.title}</h3>
                <p className="mt-0.5 md:mt-1 max-w-xl text-[11px] md:text-sm font-light leading-relaxed text-[var(--bone)]/70">{p.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
