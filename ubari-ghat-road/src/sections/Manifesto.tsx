import { useLayoutEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

const LINES = [
  { text: 'طريقٌ يختصر الصحراء،', cls: 'text-[var(--bone)]' },
  { text: 'ويصل ما انقطع لسنوات.', cls: 'text-stroke' },
  { text: 'من أوباري إلى غات،', cls: 'text-[var(--bone)]' },
  { text: 'شريانٌ جديد للجنوب الليبي.', cls: 'text-[var(--amber)]' },
];

export default function Manifesto() {
  const root = useRef<HTMLElement>(null);

  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({
        scrollTrigger: {
          id: 'st-manifesto',
          trigger: root.current,
          start: 'top top',
          end: '+=260%',
          scrub: 1,
          pin: true,
        },
      });

      gsap.set('.m-line', { opacity: 0.08 });
      tl.to('.m-line', {
        opacity: 1,
        stagger: 0.35,
        ease: 'none',
      }).to({}, { duration: 0.6 }); // لحظة سكون في النهاية
    }, root);
    return () => ctx.revert();
  }, []);

  return (
    <section ref={root} id="manifesto" className="relative flex h-screen items-center overflow-hidden bg-[var(--ink)]">
      <div className="mx-auto w-full max-w-6xl px-6 md:px-12">
        <p className="mb-6 md:mb-10 text-[11px] font-semibold tracking-[0.4em] md:tracking-[0.5em] text-[var(--mute)]">٠١ — الفكرة</p>
        <h2 className="font-display text-[7.5vw] sm:text-[8vw] md:text-[5.2vw] leading-[1.38] md:leading-[1.3]">
          {LINES.map((l, i) => (
            <span key={i} className={`m-line block py-0.5 ${l.cls}`}>{l.text}</span>
          ))}
        </h2>
      </div>
      <div
        className="pointer-events-none absolute -bottom-10 left-0 select-none font-display text-[26vw] leading-none num-latin"
        style={{ color: 'rgba(245,242,236,0.035)' }}
      >
        360
      </div>
    </section>
  );
}
