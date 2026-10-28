import { useEffect } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Lenis from 'lenis';
import Nav from './sections/Nav';
import Hero from './sections/Hero';
import Manifesto from './sections/Manifesto';
import Stats from './sections/Stats';
import RouteMap from './sections/RouteMap';
import Phases from './sections/Phases';
import Partners from './sections/Partners';
import Impact from './sections/Impact';
import Footer from './sections/Footer';

gsap.registerPlugin(ScrollTrigger);
ScrollTrigger.clearScrollMemory('manual');
if ('scrollRestoration' in history) history.scrollRestoration = 'manual';

export default function App() {
  useEffect(() => {
    const lenis = new Lenis({
      autoRaf: false,
      duration: 1.1,
      smoothWheel: true,
      wheelMultiplier: 1.0,
      touchMultiplier: 1.5,
    });
    lenis.on('scroll', ScrollTrigger.update);
    const raf = (time: number) => lenis.raf(time * 1000);
    gsap.ticker.add(raf);
    // تفعيل تخفيف اللاغ لمنع القفزات اللحظية عند انشغال المعالج
    gsap.ticker.lagSmoothing(500, 33);

    // ربط المحرك لتمكين التحكم السلس
    (window as any).__lenis = lenis;
    (window as any).ScrollTrigger = ScrollTrigger;

    // إعادة حساب مواضع التثبيت بعد تحميل الصور والخطوط
    const refresh = () => ScrollTrigger.refresh();
    window.addEventListener('load', refresh);
    if (document.fonts) document.fonts.ready.then(refresh);

    return () => {
      window.removeEventListener('load', refresh);
      gsap.ticker.remove(raf);
      lenis.destroy();
      delete (window as any).__lenis;
    };
  }, []);

  return (
    <main className="bg-[var(--ink)] min-h-screen relative selection:bg-[var(--amber)] selection:text-black">
      {/* طبقة حُبيبات سينمائية واحدة ومثبتة لتوفير استهلاك كرت الشاشة والبطارية */}
      <div className="cine-grain" aria-hidden="true" />
      <Nav />
      <Hero />
      <Manifesto />
      <Stats />
      <RouteMap />
      <Phases />
      <Partners />
      <Impact />
      <Footer />
    </main>
  );
}
