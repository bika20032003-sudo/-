import Lenis from 'lenis';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

declare global {
  interface Window {
    __lenis?: Lenis;
    ScrollTrigger?: typeof ScrollTrigger;
  }
}

export function getLenis(): Lenis | undefined {
  if (typeof window !== 'undefined') {
    return window.__lenis;
  }
  return undefined;
}

export function getScrollProgress(): number {
  if (typeof window === 'undefined') return 0;
  const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
  if (maxScroll <= 0) return 0;
  return Math.min(1, Math.max(0, window.scrollY / maxScroll));
}

export function scrollToPosition(targetY: number, options?: { duration?: number; immediate?: boolean }) {
  const lenis = getLenis();
  const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
  const clampedY = Math.max(0, Math.min(maxScroll, targetY));

  if (lenis) {
    if (options?.immediate) {
      lenis.scrollTo(clampedY, { immediate: true });
    } else {
      lenis.scrollTo(clampedY, { duration: options?.duration ?? 1.2 });
    }
  } else {
    window.scrollTo({
      top: clampedY,
      behavior: options?.immediate ? 'auto' : 'smooth',
    });
  }
}

export function scrollToProgress(progress: number, options?: { duration?: number; immediate?: boolean }) {
  if (typeof window === 'undefined') return;
  const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
  const targetY = progress * maxScroll;
  scrollToPosition(targetY, options);
}

export function scrollToSection(sectionId: string, duration = 1.2) {
  if (typeof window === 'undefined') return;

  // 1. Check ScrollTrigger instance ID
  const st = ScrollTrigger.getById(`st-${sectionId}`);
  if (st && typeof st.start === 'number') {
    scrollToPosition(st.start, { duration });
    return;
  }

  // 2. Check DOM element
  const el = document.getElementById(sectionId);
  if (!el) return;

  // If pinned inside GSAP pin-spacer, use parent spacer's top
  const spacer = el.closest('.pin-spacer') as HTMLElement | null;
  const targetEl = spacer || el;
  const rect = targetEl.getBoundingClientRect();
  const targetY = rect.top + window.scrollY;

  scrollToPosition(targetY, { duration });
}

export function scrollToTop() {
  scrollToPosition(0, { duration: 1.2 });
}

export function scrollToBottom() {
  if (typeof window === 'undefined') return;
  const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
  scrollToPosition(maxScroll, { duration: 1.2 });
}
