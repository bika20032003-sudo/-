import React, { useRef, useEffect } from 'react';
import { motion, useInView, animate, useMotionValue, useSpring, useTransform } from 'framer-motion';

export const EASING = [0.22, 1, 0.36, 1];

/**
 * FadeIn Component with scroll-trigger and custom delay/offset
 */
export function FadeIn({ children, delay = 0, y = 40, className = '' }) {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-60px' }}
      transition={{ duration: 0.9, delay, ease: EASING }}
    >
      {children}
    </motion.div>
  );
}

/**
 * CountUp Component for animated number counters
 */
export function CountUp({ text, className = '' }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-60px' });
  const numMatch = String(text).match(/\d+/);

  useEffect(() => {
    if (!inView || !numMatch || !ref.current) return;
    const target = parseInt(numMatch[0], 10);
    const controls = animate(0, target, {
      duration: 1.6,
      ease: EASING,
      onUpdate: (latest) => {
        if (ref.current) {
          ref.current.textContent = String(text).replace(numMatch[0], String(Math.round(latest)));
        }
      }
    });
    return () => controls.stop();
  }, [inView, text]);

  return (
    <span ref={ref} className={className}>
      {text}
    </span>
  );
}

/**
 * Tilt Component for subtle interactive 3D perspective effect
 */
export function Tilt({ children, className = '' }) {
  const ref = useRef(null);
  const x = useMotionValue(0.5);
  const y = useMotionValue(0.5);
  const springX = useSpring(x, { stiffness: 120, damping: 18 });
  const springY = useSpring(y, { stiffness: 120, damping: 18 });
  const rotateX = useTransform(springY, [0, 1], [8, -8]);
  const rotateY = useTransform(springX, [0, 1], [-10, 10]);

  return (
    <motion.div
      ref={ref}
      className={className}
      style={{
        rotateX,
        rotateY,
        transformStyle: 'preserve-3d',
        perspective: 800
      }}
      onMouseMove={(e) => {
        const rect = ref.current?.getBoundingClientRect();
        if (rect) {
          x.set((e.clientX - rect.left) / rect.width);
          y.set((e.clientY - rect.top) / rect.height);
        }
      }}
      onMouseLeave={() => {
        x.set(0.5);
        y.set(0.5);
      }}
    >
      {children}
    </motion.div>
  );
}

/**
 * Float Component for gentle up-and-down hovering animation
 */
export function Float({ children, className = '', duration = 5, distance = 12 }) {
  return (
    <motion.div
      className={className}
      animate={{ y: [-distance / 2, distance / 2, -distance / 2] }}
      transition={{ duration, repeat: Infinity, ease: 'easeInOut' }}
    >
      {children}
    </motion.div>
  );
}
