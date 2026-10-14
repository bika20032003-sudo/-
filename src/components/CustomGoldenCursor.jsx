import React, { useEffect, useRef, useState } from 'react';

/**
 * CustomGoldenCursor Engine
 * Responsive golden fluid cursor with physics lerp, 
 * adaptive scaling on images, 3D cards, buttons, and custom labels.
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
  const targetDotScale = useRef(1.0);
  const currentDotScale = useRef(1.0);

  const animFrameId = useRef(null);
  const isMoving = useRef(false);
  const isHovering = useRef(false);
  const isClicking = useRef(false);

  useEffect(() => {
    // Only activate cursor when user moves a mouse pointer (ignores pure touch taps)
    const onFirstMouseMove = (e) => {
      if (e.pointerType === 'touch') return;
      setEnabled(true);
      window.removeEventListener('pointermove', onFirstMouseMove);
    };

    window.addEventListener('pointermove', onFirstMouseMove, { passive: true, once: true });

    // Hide if mobile touch is detected
    const onTouchStart = () => {
      if (ringRef.current && dotRef.current) {
        ringRef.current.style.opacity = '0';
        dotRef.current.style.opacity = '0';
      }
    };
    window.addEventListener('touchstart', onTouchStart, { passive: true });

    return () => {
      window.removeEventListener('pointermove', onFirstMouseMove);
      window.removeEventListener('touchstart', onTouchStart);
    };
  }, []);

  useEffect(() => {
    if (!enabled) return;

    const dotEl = dotRef.current;
    const ringEl = ringRef.current;
    const labelEl = labelRef.current;

    if (!dotEl || !ringEl) return;

    // Smooth lerp loop with auto-sleep when stationary
    const updatePhysics = () => {
      const dx = targetPos.current.x - currentPos.current.x;
      const dy = targetPos.current.y - currentPos.current.y;

      currentPos.current.x += dx * 0.22;
      currentPos.current.y += dy * 0.22;
      currentScale.current += (targetScale.current - currentScale.current) * 0.18;
      currentDotScale.current += (targetDotScale.current - currentDotScale.current) * 0.22;

      ringEl.style.transform = `translate3d(${currentPos.current.x}px, ${currentPos.current.y}px, 0) translate(-50%, -50%) scale(${currentScale.current.toFixed(3)})`;
      dotEl.style.transform = `translate3d(${targetPos.current.x}px, ${targetPos.current.y}px, 0) translate(-50%, -50%) scale(${currentDotScale.current.toFixed(3)})`;

      if (
        Math.abs(dx) > 0.15 || 
        Math.abs(dy) > 0.15 || 
        Math.abs(targetScale.current - currentScale.current) > 0.01 ||
        Math.abs(targetDotScale.current - currentDotScale.current) > 0.01
      ) {
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

    const onMouseMove = (e) => {
      targetPos.current.x = e.clientX;
      targetPos.current.y = e.clientY;

      if (dotEl.style.opacity !== '1') {
        dotEl.style.opacity = '1';
        ringEl.style.opacity = '1';
      }

      startLoop();
    };

    const onMouseDown = () => {
      isClicking.current = true;
      targetScale.current = 0.75;
      targetDotScale.current = 1.5;
      ringEl.style.backgroundColor = 'rgba(245, 158, 11, 0.35)';
      startLoop();
    };

    const onMouseUp = () => {
      isClicking.current = false;
      targetScale.current = isHovering.current ? 1.8 : 1.0;
      targetDotScale.current = isHovering.current ? 0.5 : 1.0;
      ringEl.style.backgroundColor = isHovering.current ? 'rgba(245, 158, 11, 0.15)' : 'rgba(245, 158, 11, 0.05)';
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

    // Responsive element detection on mouseover
    let lastHoverTarget = null;
    const handleMouseOver = (e) => {
      const target = e.target;
      if (target === lastHoverTarget) return;
      lastHoverTarget = target;

      const isImage = target.tagName === 'IMG' || target.closest('img, [data-cursor-image="true"]');
      const isCard = target.closest('.glass-card-hover, .project-card, [data-tilt]');
      const isButton = target.closest('button, a, input, select, textarea, [role="button"], .cursor-pointer');

      const isArabic = document.documentElement.getAttribute('lang') !== 'en';

      if (isImage) {
        isHovering.current = true;
        targetScale.current = 2.4;
        targetDotScale.current = 0.45;
        ringEl.style.borderColor = '#fbbf24';
        ringEl.style.backgroundColor = 'rgba(245, 158, 11, 0.2)';
        ringEl.style.boxShadow = '0 0 25px rgba(245, 158, 11, 0.5)';

        const customLabel = isImage.getAttribute?.('data-cursor-label') || isImage.parentElement?.getAttribute?.('data-cursor-label');
        if (labelEl) {
          labelEl.textContent = customLabel || (isArabic ? 'معاينة 4K ↗' : 'View 4K ↗');
          labelEl.style.display = 'inline-block';
        }
        startLoop();
      } else if (isCard) {
        isHovering.current = true;
        targetScale.current = 1.8;
        targetDotScale.current = 0.55;
        ringEl.style.borderColor = '#f59e0b';
        ringEl.style.backgroundColor = 'rgba(245, 158, 11, 0.12)';
        ringEl.style.boxShadow = '0 0 18px rgba(245, 158, 11, 0.35)';

        const customLabel = isCard.getAttribute?.('data-cursor-label');
        if (customLabel && labelEl) {
          labelEl.textContent = customLabel;
          labelEl.style.display = 'inline-block';
        } else if (labelEl) {
          labelEl.style.display = 'none';
        }
        startLoop();
      } else if (isButton) {
        isHovering.current = true;
        targetScale.current = 1.5;
        targetDotScale.current = 0.4;
        ringEl.style.borderColor = '#fbbf24';
        ringEl.style.backgroundColor = 'rgba(245, 158, 11, 0.16)';
        ringEl.style.boxShadow = '0 0 14px rgba(245, 158, 11, 0.3)';

        const customLabel = isButton.getAttribute?.('data-cursor-label');
        if (customLabel && labelEl) {
          labelEl.textContent = customLabel;
          labelEl.style.display = 'inline-block';
        } else if (labelEl) {
          labelEl.style.display = 'none';
        }
        startLoop();
      } else {
        isHovering.current = false;
        targetScale.current = 1.0;
        targetDotScale.current = 1.0;
        ringEl.style.borderColor = 'rgba(245, 158, 11, 0.75)';
        ringEl.style.backgroundColor = 'rgba(245, 158, 11, 0.05)';
        ringEl.style.boxShadow = '0 0 10px rgba(245, 158, 11, 0.25)';
        if (labelEl) labelEl.style.display = 'none';
        startLoop();
      }
    };

    window.addEventListener('mousemove', onMouseMove, { passive: true });
    window.addEventListener('mousedown', onMouseDown, { passive: true });
    window.addEventListener('mouseup', onMouseUp, { passive: true });
    document.addEventListener('mouseover', handleMouseOver, { passive: true });
    document.documentElement.addEventListener('mouseleave', onMouseLeave, { passive: true });
    document.documentElement.addEventListener('mouseenter', onMouseEnter, { passive: true });

    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mousedown', onMouseDown);
      window.removeEventListener('mouseup', onMouseUp);
      document.removeEventListener('mouseover', handleMouseOver);
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
        className="fixed top-0 left-0 w-10 h-10 rounded-full border border-amber-400/80 bg-amber-500/5 shadow-[0_0_12px_rgba(245,158,11,0.35)] flex items-center justify-center opacity-0 pointer-events-none will-change-transform transition-[border-color,background-color,box-shadow] duration-200"
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
        className="fixed top-0 left-0 w-2.5 h-2.5 rounded-full bg-gradient-to-tr from-amber-500 via-amber-300 to-yellow-100 shadow-[0_0_10px_#F59E0B] opacity-0 pointer-events-none will-change-transform"
        style={{ transform: 'translate3d(-100px, -100px, 0)' }}
      />
    </div>
  );
}
