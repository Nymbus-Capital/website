'use client';

import { useEffect, useRef } from 'react';

// Simplified world map SVG paths (natural earth projection, simplified continents)
const continentPaths = [
  // North America
  "M 130 95 L 145 80 L 160 75 L 170 70 L 185 72 L 195 78 L 200 85 L 195 95 L 185 100 L 175 108 L 170 120 L 165 130 L 155 140 L 148 148 L 142 155 L 138 150 L 130 140 L 120 130 L 115 120 L 118 110 L 125 100 Z",
  // South America
  "M 175 175 L 185 168 L 195 172 L 200 185 L 205 200 L 208 215 L 205 230 L 198 245 L 190 255 L 182 260 L 178 250 L 175 238 L 170 220 L 168 205 L 170 190 Z",
  // Europe
  "M 295 70 L 310 65 L 320 68 L 330 72 L 335 80 L 330 88 L 320 92 L 310 90 L 300 85 L 295 78 Z",
  // Africa
  "M 295 110 L 310 105 L 325 108 L 335 115 L 340 130 L 342 150 L 338 170 L 330 185 L 320 195 L 308 198 L 298 190 L 290 175 L 285 155 L 282 135 L 285 120 Z",
  // Asia
  "M 340 55 L 360 50 L 385 48 L 410 52 L 430 58 L 445 65 L 455 75 L 450 88 L 440 95 L 425 100 L 410 105 L 395 108 L 380 105 L 365 98 L 350 90 L 340 80 L 335 68 Z",
  // Australia
  "M 425 195 L 445 190 L 460 195 L 468 205 L 465 218 L 455 225 L 440 228 L 428 222 L 422 210 L 420 200 Z",
  // Greenland
  "M 195 42 L 210 38 L 220 42 L 222 52 L 215 58 L 205 55 L 198 50 Z",
  // UK/Ireland
  "M 285 68 L 292 65 L 296 68 L 294 74 L 288 75 L 285 72 Z",
  // Japan
  "M 455 72 L 460 68 L 462 75 L 458 80 L 454 78 Z",
  // Indonesia/SE Asia
  "M 420 135 L 435 130 L 450 132 L 460 138 L 455 145 L 440 148 L 425 145 L 418 140 Z",
  // Madagascar
  "M 345 195 L 350 190 L 355 195 L 352 205 L 347 205 Z",
  // New Zealand
  "M 478 230 L 482 225 L 485 230 L 483 238 L 479 236 Z",
];

// Montreal coordinates mapped to our SVG viewBox (600x320)
// Montreal: 45.5°N, 73.6°W → roughly x=165, y=88
const MONTREAL = { x: 165, y: 88 };

export default function WorldMap() {
  const svgRef = useRef<SVGSVGElement>(null);
  const sonarRefs = useRef<SVGCircleElement[]>([]);
  const dotRef = useRef<SVGCircleElement>(null);
  const frameRef = useRef<number>(0);

  useEffect(() => {
    let animationId: number;
    let time = 0;

    const animate = () => {
      time += 0.016; // ~60fps

      // Sonar rings - 3 rings with staggered timing
      sonarRefs.current.forEach((ring, i) => {
        if (!ring) return;
        const offset = i * 1.2; // stagger
        const cycle = ((time + offset) % 3.6) / 3.6; // 3.6s per cycle
        const radius = 4 + cycle * 35;
        const opacity = Math.max(0, 0.6 - cycle * 0.7);
        ring.setAttribute('r', String(radius));
        ring.setAttribute('opacity', String(opacity));
        ring.setAttribute('stroke-width', String(1.5 - cycle * 0.8));
      });

      // Pulsing center dot
      if (dotRef.current) {
        const pulse = 2.5 + Math.sin(time * 4) * 0.8;
        dotRef.current.setAttribute('r', String(pulse));
      }

      animationId = requestAnimationFrame(animate);
    };

    animationId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationId);
  }, []);

  return (
    <div className="w-full relative">
      <svg
        ref={svgRef}
        viewBox="0 0 600 320"
        className="w-full h-auto"
        preserveAspectRatio="xMidYMid meet"
      >
        <defs>
          {/* Subtle grid pattern */}
          <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
            <path d="M 20 0 L 0 0 0 20" fill="none" stroke="rgba(148,163,184,0.08)" strokeWidth="0.5" />
          </pattern>
          {/* Glow filter for Montreal */}
          <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="3" result="coloredBlur" />
            <feMerge>
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          {/* Gradient for continents */}
          <linearGradient id="continentGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#cbd5e1" stopOpacity="0.5" />
            <stop offset="100%" stopColor="#94a3b8" stopOpacity="0.35" />
          </linearGradient>
          {/* Radial gradient for sonar */}
          <radialGradient id="sonarGlow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.3" />
            <stop offset="100%" stopColor="#3b82f6" stopOpacity="0" />
          </radialGradient>
        </defs>

        {/* Background grid */}
        <rect width="600" height="320" fill="url(#grid)" />

        {/* Latitude/longitude lines */}
        {[64, 128, 192, 256].map((y) => (
          <line key={`lat-${y}`} x1="0" y1={y} x2="600" y2={y} stroke="rgba(148,163,184,0.06)" strokeWidth="0.5" strokeDasharray="4 8" />
        ))}
        {[120, 240, 360, 480].map((x) => (
          <line key={`lon-${x}`} x1={x} y1="0" x2={x} y2="320" stroke="rgba(148,163,184,0.06)" strokeWidth="0.5" strokeDasharray="4 8" />
        ))}

        {/* Continents */}
        {continentPaths.map((path, i) => (
          <path
            key={i}
            d={path}
            fill="url(#continentGrad)"
            stroke="rgba(148,163,184,0.3)"
            strokeWidth="0.5"
          />
        ))}

        {/* Connection lines from Montreal to key financial centers */}
        {[
          { x: 310, y: 78 },  // London
          { x: 195, y: 95 },  // New York
          { x: 340, y: 78 },  // Frankfurt
          { x: 145, y: 95 },  // Chicago
          { x: 445, y: 78 },  // Tokyo
        ].map((city, i) => (
          <line
            key={`conn-${i}`}
            x1={MONTREAL.x}
            y1={MONTREAL.y}
            x2={city.x}
            y2={city.y}
            stroke="rgba(59,130,246,0.12)"
            strokeWidth="0.5"
            strokeDasharray="3 6"
          />
        ))}

        {/* Sonar rings */}
        <g filter="url(#glow)">
          {[0, 1, 2].map((i) => (
            <circle
              key={`sonar-${i}`}
              ref={(el) => { if (el) sonarRefs.current[i] = el; }}
              cx={MONTREAL.x}
              cy={MONTREAL.y}
              r="4"
              fill="none"
              stroke="#3b82f6"
              strokeWidth="1.5"
              opacity="0.6"
            />
          ))}
        </g>

        {/* Ambient glow under dot */}
        <circle cx={MONTREAL.x} cy={MONTREAL.y} r="12" fill="url(#sonarGlow)" />

        {/* Center dot */}
        <circle
          ref={dotRef}
          cx={MONTREAL.x}
          cy={MONTREAL.y}
          r="2.5"
          fill="#3b82f6"
          filter="url(#glow)"
        />

        {/* Label */}
        <g>
          <rect x={MONTREAL.x + 8} y={MONTREAL.y - 12} width="62" height="18" rx="4" fill="rgba(15,23,42,0.85)" />
          <text x={MONTREAL.x + 12} y={MONTREAL.y + 1} fill="white" fontSize="8" fontWeight="600" fontFamily="system-ui">
            Montreal, QC
          </text>
        </g>
      </svg>
    </div>
  );
}