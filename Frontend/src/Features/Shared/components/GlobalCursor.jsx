import React, { useEffect, useRef, useState } from 'react';

const GlobalCursor = () => {
  const ring = useRef(null);
  const dot = useRef(null);
  const op = useRef({ x: -200, y: -200, s: 1 });
  const tp = useRef({ x: -200, y: -200 });
  const [big, setBig] = useState(false);

  useEffect(() => {
    const mv = (e) => {
      tp.current = { x: e.clientX, y: e.clientY };
    };
    
    const handleMouseOver = (e) => {
      const isClickable = e.target.closest('a, button, input, textarea, select, [role="button"]');
      setBig(!!isClickable);
    };

    window.addEventListener('mousemove', mv);
    window.addEventListener('mouseover', handleMouseOver);
    
    let id;
    const loop = () => {
      // Linear Movement (Constant Velocity)
      const speed = 18; // pixels per frame
      const dx = tp.current.x - op.current.x;
      const dy = tp.current.y - op.current.y;
      const dist = Math.sqrt(dx * dx + dy * dy);

      if (dist > speed) {
        op.current.x += (dx / dist) * speed;
        op.current.y += (dy / dist) * speed;
      } else {
        op.current.x = tp.current.x;
        op.current.y = tp.current.y;
      }

      // Linear Scale
      const targetS = big ? 1.7 : 1;
      const ds = targetS - op.current.s;
      const scaleSpeed = 0.15;
      if (Math.abs(ds) > scaleSpeed) {
        op.current.s += Math.sign(ds) * scaleSpeed;
      } else {
        op.current.s = targetS;
      }

      if (ring.current) {
        ring.current.style.transform = `translate(${op.current.x}px,${op.current.y}px) translate(-50%,-50%) scale(${op.current.s})`;
      }
      if (dot.current) {
        dot.current.style.transform = `translate(${tp.current.x}px,${tp.current.y}px) translate(-50%,-50%)`;
      }
      id = requestAnimationFrame(loop);
    };
    
    loop();
    
    return () => {
      window.removeEventListener('mousemove', mv);
      window.removeEventListener('mouseover', handleMouseOver);
      cancelAnimationFrame(id);
    };
  }, [big]);

  return (
    <>
      <div
        ref={ring}
        style={{
          position: 'fixed',
          zIndex: 99999,
          pointerEvents: 'none',
          top: 0,
          left: 0,
          width: 44,
          height: 44,
          borderRadius: '50%',
          border: '1px solid rgba(255,255,255,.6)',
          mixBlendMode: 'difference',
          willChange: 'transform'
        }}
      />
      <div
        ref={dot}
        style={{
          position: 'fixed',
          zIndex: 99999,
          pointerEvents: 'none',
          top: 0,
          left: 0,
          width: 6,
          height: 6,
          borderRadius: '50%',
          background: '#ffffff',
          boxShadow: '0 0 10px #ffffff',
          willChange: 'transform'
        }}
      />
      <style>{`
        * {
          cursor: none !important;
        }
      `}</style>
    </>
  );
};

export default GlobalCursor;
