import React, { useEffect, useRef } from 'react';

export default function CustomGoldenCursor() {
  // Completely disable custom cursor on touch/mobile devices or screens < 1024px
  const isTouchDevice = typeof window !== 'undefined' && (
    window.matchMedia('(pointer: coarse)').matches || 
    window.innerWidth < 1024 || 
    'ontouchstart' in window
  );

  if (isTouchDevice) {
    return null;
  }

  const dotRef = useRef(null);
  const ringRef = useRef(null);
  const labelRef = useRef(null);

  const targetPos = useRef({ x: -100, y: -100 });
  const currentPos = useRef({ x: -100, y: -100 });
  const animFrameId = useRef(null);
  const isMoving = useRef(false);
  const isHovering = useRef(false);
  const isClicking = useRef(false);

  useEffect(() => {
    const dotEl = dotRef.current;
    const ringEl = ringRef.current;
    const labelEl = labelRef.current;

    if (!dotEl || !ringEl) return;

    // Smooth lerp loop with auto-sleep when stationary to save CPU/battery
    const updatePhysics = () => {
      const dx = targetPos.current.x - currentPos.current.x;
      const dy = targetPos.current.y - currentPos.current.y;

      currentPos.current.x += dx * 0.22;
      currentPos.current.y += dy * 0.22;

      ringEl.style.transform = `translate3d(${currentPos.current.x}px, ${currentPos.current.y}px, 0) translate(-50%, -50%)`;

      // If close enough to target, stop animating until next move
      if (Math.abs(dx) > 0.15 || Math.abs(dy) > 0.15) {
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

      // Update dot position immediately via GPU transform (0ms latency)
      dotEl.style.transform = `translate3d(${e.clientX}px, ${e.clientY}px, 0) translate(-50%, -50%)`;

      if (dotEl.style.opacity !== '1') {
        dotEl.style.opacity = '1';
        ringEl.style.opacity = '1';
      }

      startLoop();
    };

    const onMouseDown = () => {
      isClicking.current = true;
      ringEl.classList.add('scale-75', 'bg-amber-400/30');
      dotEl.classList.add('scale-150');
    };

    const onMouseUp = () => {
      isClicking.current = false;
      ringEl.classList.remove('scale-75', 'bg-amber-400/30');
      dotEl.classList.remove('scale-150');
    };

    const onMouseLeave = () => {
      dotEl.style.opacity = '0';
      ringEl.style.opacity = '0';
    };

    const onMouseEnter = () => {
      dotEl.style.opacity = '1';
      ringEl.style.opacity = '1';
    };

    // Throttled interactive element detection
    let lastHoverTarget = null;
    const handleMouseOver = (e) => {
      const target = e.target;
      if (target === lastHoverTarget) return;
      lastHoverTarget = target;

      const interactiveEl = target.closest('button, a, input, select, textarea, [role="button"], .cursor-pointer, .glass-card-hover');
      
      if (interactiveEl) {
        isHovering.current = true;
        ringEl.classList.add('scale-150', 'border-amber-400', 'bg-amber-500/15');
        dotEl.classList.add('scale-50');

        const customLabel = interactiveEl.getAttribute('data-cursor-label');
        if (customLabel && labelEl) {
          labelEl.textContent = customLabel;
          labelEl.style.display = 'inline-block';
        } else if (labelEl) {
          labelEl.style.display = 'none';
        }
      } else {
        isHovering.current = false;
        ringEl.classList.remove('scale-150', 'border-amber-400', 'bg-amber-500/15');
        dotEl.classList.remove('scale-50');
        if (labelEl) labelEl.style.display = 'none';
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
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none z-[99999] overflow-hidden select-none">
      {/* ── Trailing Outer Golden Ring (Pure GPU transform, no transition interference) ── */}
      <div
        ref={ringRef}
        className="fixed top-0 left-0 w-9 h-9 rounded-full border border-amber-400/80 bg-amber-500/5 shadow-[0_0_12px_rgba(245,158,11,0.3)] flex items-center justify-center opacity-0 pointer-events-none will-change-transform"
        style={{ transform: 'translate3d(-100px, -100px, 0)' }}
      >
        <span
          ref={labelRef}
          className="text-[9px] font-black text-amber-300 bg-black/85 px-1.5 py-0.5 rounded-full whitespace-nowrap shadow-md hidden"
        />
      </div>

      {/* ── Precise Golden Center Dot ── */}
      <div
        ref={dotRef}
        className="fixed top-0 left-0 w-2 h-2 rounded-full bg-gradient-to-tr from-amber-500 via-amber-300 to-yellow-100 shadow-[0_0_8px_#F59E0B] opacity-0 pointer-events-none will-change-transform"
        style={{ transform: 'translate3d(-100px, -100px, 0)' }}
      />
    </div>
  );
}
