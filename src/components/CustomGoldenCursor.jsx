import React, { useEffect, useRef, useState } from 'react';

/**
 * CustomGoldenCursor Engine - Ultra High-Performance 120FPS
 * Zero layout-thrashing, GPU-accelerated, throttled hover detection.
 */
export default function CustomGoldenCursor() {
  const [enabled, setEnabled] = useState(false);

  const dotRef = useRef(null);
  const ringRef = useRef(null);
  const labelRef = useRef(null);

  const targetPos = useRef({ x: -100, y: -100 });
  const currentPos = useRef({ x: -100, y: -100 });
  const targetScale = useRef(1.0);
  const currentScale = useRef(1.0);

  const animFrameId = useRef(null);
  const isMoving = useRef(false);

  useEffect(() => {
    // Only activate cursor when user moves a mouse pointer (ignores pure touch taps)
    const onFirstMouseMove = (e) => {
      if (e.pointerType === 'touch') return;
      setEnabled(true);
      window.removeEventListener('pointermove', onFirstMouseMove);
    };

    window.addEventListener('pointermove', onFirstMouseMove, { passive: true, once: true });

    return () => {
      window.removeEventListener('pointermove', onFirstMouseMove);
    };
  }, []);

  useEffect(() => {
    if (!enabled) return;

    const dotEl = dotRef.current;
    const ringEl = ringRef.current;
    const labelEl = labelRef.current;
    if (!dotEl || !ringEl) return;

    // Ultra-lightweight Lerp loop: updates only transform3d
    const updatePhysics = () => {
      const dx = targetPos.current.x - currentPos.current.x;
      const dy = targetPos.current.y - currentPos.current.y;

      currentPos.current.x += dx * 0.35;
      currentPos.current.y += dy * 0.35;
      currentScale.current += (targetScale.current - currentScale.current) * 0.25;

      ringEl.style.transform = `translate3d(${currentPos.current.x - 20}px, ${currentPos.current.y - 20}px, 0) scale(${currentScale.current.toFixed(2)})`;
      dotEl.style.transform = `translate3d(${targetPos.current.x - 5}px, ${targetPos.current.y - 5}px, 0)`;

      if (Math.abs(dx) > 0.2 || Math.abs(dy) > 0.2 || Math.abs(targetScale.current - currentScale.current) > 0.02) {
        animFrameId.current = requestAnimationFrame(updatePhysics);
      } else {
        isMoving.current = false;
      }
    };

    const startLoop = () => {
      if (!isMoving.current) {
        isMoving.current = true;
        animFrameId.current = requestAnimationFrame(updatePhysics);
      }
    };

    const onPointerMove = (e) => {
      targetPos.current.x = e.clientX;
      targetPos.current.y = e.clientY;

      if (dotEl.style.opacity !== '1') {
        dotEl.style.opacity = '1';
        ringEl.style.opacity = '1';
      }

      startLoop();
    };

    const onPointerDown = () => {
      targetScale.current = 0.8;
      startLoop();
    };

    const onPointerUp = () => {
      targetScale.current = 1.0;
      startLoop();
    };

    const onMouseLeave = () => {
      dotEl.style.opacity = '0';
      ringEl.style.opacity = '0';
    };

    const onMouseEnter = () => {
      dotEl.style.opacity = '1';
      ringEl.style.opacity = '1';
    };

    // Fast, lightweight hover detection (no recursive DOM thrashing)
    let lastTarget = null;
    const onPointerOver = (e) => {
      const target = e.target;
      if (!target || target === lastTarget) return;
      lastTarget = target;

      const isImg = target.tagName === 'IMG' || target.getAttribute('data-cursor-image') === 'true';
      const isInteractive = isImg || target.tagName === 'BUTTON' || target.tagName === 'A' || target.classList?.contains('cursor-pointer');

      if (isImg) {
        targetScale.current = 2.2;
        ringEl.setAttribute('data-cursor-mode', 'image');
        if (labelEl) {
          const customLabel = target.getAttribute('data-cursor-label');
          labelEl.textContent = customLabel || 'معاينة 4K ↗';
          labelEl.style.display = 'inline-block';
        }
      } else if (isInteractive) {
        targetScale.current = 1.4;
        ringEl.setAttribute('data-cursor-mode', 'hover');
        if (labelEl) labelEl.style.display = 'none';
      } else {
        targetScale.current = 1.0;
        ringEl.removeAttribute('data-cursor-mode');
        if (labelEl) labelEl.style.display = 'none';
      }
      startLoop();
    };

    window.addEventListener('pointermove', onPointerMove, { passive: true });
    window.addEventListener('pointerdown', onPointerDown, { passive: true });
    window.addEventListener('pointerup', onPointerUp, { passive: true });
    document.addEventListener('pointerover', onPointerOver, { passive: true });
    document.documentElement.addEventListener('mouseleave', onMouseLeave, { passive: true });
    document.documentElement.addEventListener('mouseenter', onMouseEnter, { passive: true });

    return () => {
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('pointerdown', onPointerDown);
      window.removeEventListener('pointerup', onPointerUp);
      document.removeEventListener('pointerover', onPointerOver);
      document.documentElement.removeEventListener('mouseleave', onMouseLeave);
      document.documentElement.removeEventListener('mouseenter', onMouseEnter);
      if (animFrameId.current) cancelAnimationFrame(animFrameId.current);
    };
  }, [enabled]);

  if (!enabled) return null;

  return (
    <div className="fixed inset-0 pointer-events-none z-[99999] overflow-hidden select-none">
      {/* ── Trailing Outer Golden Ring with adaptive scale & glow ── */}
      <div
        ref={ringRef}
        className="fixed top-0 left-0 w-10 h-10 rounded-full border border-amber-400/80 bg-amber-500/10 shadow-[0_0_12px_rgba(245,158,11,0.35)] flex items-center justify-center opacity-0 pointer-events-none will-change-transform data-[cursor-mode=image]:border-amber-300 data-[cursor-mode=image]:bg-amber-500/25 data-[cursor-mode=image]:shadow-[0_0_20px_rgba(245,158,11,0.5)] transition-[border-color,background-color] duration-150"
        style={{ transform: 'translate3d(-100px, -100px, 0)' }}
      >
        <span
          ref={labelRef}
          className="text-[9px] font-black text-amber-300 bg-black/90 px-2 py-0.5 rounded-full whitespace-nowrap shadow-lg border border-amber-500/30 hidden"
        />
      </div>

      {/* ── Precise Golden Center Dot ── */}
      <div
        ref={dotRef}
        className="fixed top-0 left-0 w-2.5 h-2.5 rounded-full bg-amber-400 shadow-[0_0_8px_#F59E0B] opacity-0 pointer-events-none will-change-transform"
        style={{ transform: 'translate3d(-100px, -100px, 0)' }}
      ></div>
    </div>
  );
}
