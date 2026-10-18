import { useEffect } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

export default function useGsapScrollAnimations() {
  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);

    const ctx = gsap.context(() => {
      // 1. Reveal on scroll for section headers (fires once, lightweight)
      gsap.utils.toArray('.gsap-header').forEach((el) => {
        gsap.from(el, {
          scrollTrigger: {
            trigger: el,
            start: 'top 88%',
            once: true,
          },
          y: 30,
          opacity: 0,
          duration: 0.6,
          ease: 'power2.out',
          clearProps: 'transform,opacity',
        });
      });

      // 2. Staggered reveal for cards & grid items (fires once)
      gsap.utils.toArray('.gsap-stagger-container').forEach((container) => {
        const children = container.querySelectorAll('.gsap-stagger-item');
        if (children.length > 0) {
          gsap.from(children, {
            scrollTrigger: {
              trigger: container,
              start: 'top 85%',
              once: true,
            },
            y: 30,
            opacity: 0,
            duration: 0.5,
            stagger: 0.08,
            ease: 'power2.out',
            clearProps: 'transform,opacity',
          });
        }
      });

      // 3. Smooth scale-in on scroll (fires once)
      gsap.utils.toArray('.gsap-scale-in').forEach((el) => {
        gsap.from(el, {
          scrollTrigger: {
            trigger: el,
            start: 'top 88%',
            once: true,
          },
          scale: 0.96,
          opacity: 0,
          duration: 0.6,
          ease: 'power2.out',
          clearProps: 'transform,opacity',
        });
      });
    });

    // Refresh after DOM painted
    const timer = setTimeout(() => {
      ScrollTrigger.refresh();
    }, 150);

    return () => {
      clearTimeout(timer);
      ctx.revert();
    };
  }, []);
}
