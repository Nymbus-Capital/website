'use client';

import { useEffect, useRef, useState } from 'react';

interface AnimatedCounterProps {
  target: number;
  prefix?: string;
  suffix?: string;
  duration?: number;
  decimals?: number;
  className?: string;
}

export default function AnimatedCounter({
  target,
  prefix = '',
  suffix = '',
  duration = 2000,
  decimals,
  className = '',
}: AnimatedCounterProps) {
  // Auto-detect decimals from target if not specified
  const decimalPlaces = decimals ?? (target % 1 !== 0 ? String(target).split('.')[1]?.length ?? 0 : 0);
  const [display, setDisplay] = useState(decimalPlaces > 0 ? '0.' + '0'.repeat(decimalPlaces) : '0');
  const ref = useRef<HTMLSpanElement>(null);
  const hasStarted = useRef(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasStarted.current) {
          hasStarted.current = true;
          const startTime = Date.now();

          const animate = () => {
            const elapsed = Date.now() - startTime;
            const progress = Math.min(elapsed / duration, 1);
            // Ease out cubic for smoother finish
            const eased = 1 - Math.pow(1 - progress, 3);
            const current = eased * target;

            if (decimalPlaces > 0) {
              setDisplay(current.toFixed(decimalPlaces));
            } else {
              setDisplay(Math.floor(current).toLocaleString());
            }

            if (progress < 1) {
              requestAnimationFrame(animate);
            } else {
              // Ensure final value is exact
              setDisplay(decimalPlaces > 0 ? target.toFixed(decimalPlaces) : target.toLocaleString());
            }
          };

          animate();
          observer.unobserve(entry.target);
        }
      },
      { threshold: 0.1 }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => observer.disconnect();
  }, [target, duration, decimalPlaces]);

  return (
    <span ref={ref} className={className}>
      {prefix}
      {display}
      {suffix}
    </span>
  );
}