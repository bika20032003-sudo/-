import { useLayoutEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

export default function Hero() {
  const root = useRef<HTMLElement>(null);

  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({
        scrollTrigger: {
          id: 'st-hero',
          trigger: root.current,
          start: 'top top',
          end: '+=180%',
          scrub: 1,
          pin: true,
        },
      });

      // حركة خلفية سينمائية ناعمة
      tl.fromTo('.hero-bg', { scale: 1.25 }, { scale: 1.0, ease: 'none' }, 0)
        .fromTo('.hero-veil-dark', { opacity: 0.82 }, { opacity: 0.2, ease: 'none' }, 0)
        // انتقال المحتوى كاملاً لأعلى مع التلاشي السلس لمنع أي تداخل بين العناصر
        .to('.hero-content', { yPercent: -35, opacity: 0, ease: 'power1.in' }, 0.05)
        .to('.hero-cue', { opacity: 0, ease: 'none' }, 0.05);

      // دخول أولي فخم للعنوان والعناصر
      gsap.from('.hero-title-1 .reveal-line > span, .hero-title-2 .reveal-line > span', {
        yPercent: 115,
        duration: 1.3,
        ease: 'power4.out',
        stagger: 0.12,
        delay: 0.2,
      });
      gsap.from('.hero-kicker', { opacity: 0, y: 15, duration: 0.8, delay: 0.7, ease: 'power2.out' });
      gsap.from('.hero-sub', { opacity: 0, y: 20, duration: 0.9, delay: 0.9, ease: 'power2.out' });
    }, root);
    return () => ctx.revert();
  }, []);

  return (
    <section ref={root} id="hero" className="relative h-screen overflow-hidden">
      <div className="cine-bg hero-bg" style={{ backgroundImage: 'url(/images/hero.webp)' }} />
      <div className="cine-veil" />
      <div className="hero-veil-dark absolute inset-0 bg-[var(--ink)] opacity-[0.82]" />

      <div className="hero-content relative z-10 flex h-full flex-col items-center justify-center px-4 sm:px-6 text-center max-w-5xl mx-auto">
        <p className="hero-kicker mb-3 md:mb-5 text-[11px] sm:text-xs md:text-sm font-semibold tracking-[0.35em] md:tracking-[0.5em] text-[var(--amber)]">
          حكومة الوحدة الوطنية — خطة عودة الحياة
        </p>

        {/* العنوان الرئيسي: "طريق" بالسطر الأول، و"أوباري — غات" بالسطر الثاني كوحدة واحدة دون انكسار */}
        <div className="hero-title-wrap w-full">
          <h1 className="font-display text-[clamp(2.5rem,7.2vw,6.8rem)] leading-[1.15] md:leading-[1.08] tracking-tight">
            <span className="hero-title-1 block text-[var(--bone)]">
              <span className="reveal-line pb-1 md:pb-2"><span>طريق</span></span>
            </span>
            <span className="hero-title-2 block text-[var(--amber)] whitespace-nowrap">
              <span className="reveal-line pb-1 md:pb-2"><span>أوباري — غات</span></span>
            </span>
          </h1>
        </div>

        <p className="hero-sub mt-5 md:mt-8 max-w-xl px-2 text-xs sm:text-sm md:text-base lg:text-lg font-light leading-relaxed text-[var(--bone)]/90">
          ٣٦٠ كيلومتراً تعبر صحراء فزان، تربط ثانية مدن الجنوب ببوابة ليبيا الغربية على الحدود الجزائرية
        </p>
      </div>

      <div className="hero-cue absolute bottom-5 md:bottom-8 left-1/2 z-10 -translate-x-1/2 flex flex-col items-center gap-2 md:gap-3">
        <span className="text-[9px] md:text-[10px] tracking-[0.3em] md:tracking-[0.4em] text-[var(--mute)]">مرّر للأسفل</span>
        <div className="scroll-cue" />
      </div>
    </section>
  );
}
