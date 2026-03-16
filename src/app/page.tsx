'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { Card } from '@/components/ui/Card';
import { ScrollReveal } from '@/components/animations/ScrollReveal';
import TypewriterEffect from '@/components/animations/TypewriterEffect';
import AnimatedCounter from '@/components/animations/AnimatedCounter';
import { funds } from '@/data/funds';
import { formatPercent } from '@/lib/utils';
import { TrendingUp, BarChart3, Shield, ArrowRight, Newspaper, Calendar, ChevronRight } from 'lucide-react';
import gsap from 'gsap';

// Generate smooth performance data
const generatePerformanceData = () => {
  const data: { time: string; fund: number; benchmark: number }[] = [];
  let fundVal = 10000;
  let benchVal = 10000;
  const months = ['01', '02', '03', '04', '05', '06', '07', '08', '09', '10', '11', '12'];
  for (let y = 0; y < 5; y++) {
    for (let m = 0; m < 12; m++) {
      const i = y * 12 + m;
      fundVal += (Math.sin(i * 0.3) * 50 + Math.cos(i * 0.15) * 30 + 90);
      benchVal += 55 + Math.sin(i * 0.4) * 15;
      const day = String(Math.min(28, 1 + m * 2)).padStart(2, '0');
      data.push({
        time: `${2020 + y}-${months[m]}-${day}`,
        fund: Math.round(fundVal),
        benchmark: Math.round(benchVal),
      });
    }
  }
  return data;
};

const performanceData = generatePerformanceData();

const newsItems = [
  { date: '2024', title: 'Nymbus Capital Reaches $1 Billion in Assets Under Management', category: 'Milestone', description: 'A significant milestone reflecting institutional trust and investment excellence.' },
  { date: '2023', title: 'Launch of Sustainable Bond Funds with Fondaction', category: 'Product Launch', description: 'New sustainable bond fund collaboration focused on ESG-forward fixed income investing.' },
  { date: '2023', title: 'Machine Learning Integration in Market Regime Classification', category: 'Innovation', description: 'Cutting-edge ML models now drive dynamic asset allocation across strategies.' },
  { date: '2023', title: 'Zero Fossil Fuel Achievement in Credit Portfolio', category: 'ESG', description: 'Full elimination of fossil fuel exposure from credit holdings, leading Canadian fixed income managers.' },
  { date: '2022', title: 'New Institutional Mandate with FMOQ', category: 'Growth', description: "Awarded mandate from the Quebec medical professionals' investment fund." },
  { date: '2020', title: 'Historic Three-Firm Merger', category: 'Milestone', description: 'Union of Nymbus Capital (2013), Gestion de portefeuille Landry (2002), and Perseus Capital (2005).' },
];

// SVG Chart Component with GSAP animation
function PerformanceChart() {
  const containerRef = useRef<HTMLDivElement>(null);
  const fundPathRef = useRef<SVGPathElement>(null);
  const benchPathRef = useRef<SVGPathElement>(null);
  const fundAreaRef = useRef<SVGPathElement>(null);
  const [animated, setAnimated] = useState(false);

  // Pre-compute chart geometry
  const width = 800;
  const height = 400;
  const padding = { top: 40, right: 30, bottom: 50, left: 60 };
  const chartWidth = width - padding.left - padding.right;
  const chartHeight = height - padding.top - padding.bottom;

  const minVal = Math.min(...performanceData.map(d => Math.min(d.fund, d.benchmark)));
  const maxVal = Math.max(...performanceData.map(d => Math.max(d.fund, d.benchmark)));
  const range = maxVal - minVal || 1;

  const points = performanceData.map((d, i) => ({
    x: padding.left + (i / (performanceData.length - 1)) * chartWidth,
    fundY: padding.top + chartHeight - ((d.fund - minVal) / range) * chartHeight,
    benchY: padding.top + chartHeight - ((d.benchmark - minVal) / range) * chartHeight,
  }));

  const fundPathD = points.map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x.toFixed(1)},${p.fundY.toFixed(1)}`).join(' ');
  const benchPathD = points.map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x.toFixed(1)},${p.benchY.toFixed(1)}`).join(' ');
  const fundAreaD = fundPathD + ` L${points[points.length - 1].x.toFixed(1)},${(padding.top + chartHeight).toFixed(1)} L${points[0].x.toFixed(1)},${(padding.top + chartHeight).toFixed(1)} Z`;

  // Y-axis ticks
  const yTicks = 5;
  const yTickValues = Array.from({ length: yTicks + 1 }, (_, i) => minVal + (range / yTicks) * i);

  // X-axis year labels
  const years = ['2020', '2021', '2022', '2023', '2024'];

  useEffect(() => {
    if (!fundPathRef.current || !benchPathRef.current) return;

    const fundEl = fundPathRef.current;
    const benchEl = benchPathRef.current;
    const areaEl = fundAreaRef.current;

    // Animate fund line using stroke-dashoffset
    let fundLen = 2000;
    try {
      fundLen = fundEl.getTotalLength();
    } catch {
      // fallback
    }

    // Set initial hidden state for fund line
    fundEl.style.strokeDasharray = `${fundLen}`;
    fundEl.style.strokeDashoffset = `${fundLen}`;

    // Benchmark uses opacity fade instead of dash animation (preserves its dashed style)
    benchEl.style.opacity = '0';

    if (areaEl) {
      areaEl.style.opacity = '0';
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !animated) {
          setAnimated(true);

          // Animate fund line drawing
          gsap.to(fundEl, {
            strokeDashoffset: 0,
            duration: 2,
            ease: 'power2.out',
            delay: 0.2,
          });

          // Fade in benchmark line
          gsap.to(benchEl, {
            opacity: 1,
            duration: 1.5,
            ease: 'power2.out',
            delay: 0.6,
          });

          // Fade in area fill
          if (areaEl) {
            gsap.to(areaEl, {
              opacity: 1,
              duration: 1.5,
              ease: 'power2.out',
              delay: 1,
            });
          }

          observer.disconnect();
        }
      },
      { threshold: 0.2 }
    );

    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    return () => observer.disconnect();
  }, [animated]);

  return (
    <div ref={containerRef} className="w-full overflow-x-auto">
      <svg
        viewBox={`0 0 ${width} ${height}`}
        className="w-full"
        style={{ minHeight: '350px' }}
        preserveAspectRatio="xMidYMid meet"
      >
        <defs>
          <linearGradient id="fundAreaGradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="rgba(0, 102, 255, 0.15)" />
            <stop offset="100%" stopColor="rgba(0, 102, 255, 0)" />
          </linearGradient>
        </defs>

        {/* Horizontal grid lines */}
        {yTickValues.map((val, i) => {
          const y = padding.top + chartHeight - ((val - minVal) / range) * chartHeight;
          return (
            <g key={i}>
              <line x1={padding.left} y1={y} x2={width - padding.right} y2={y} stroke="#f1f5f9" strokeWidth="1" />
              <text x={padding.left - 8} y={y + 4} textAnchor="end" fill="#94a3b8" fontSize="10" fontFamily="system-ui">
                ${(val / 1000).toFixed(0)}k
              </text>
            </g>
          );
        })}

        {/* X-axis year labels */}
        {years.map((year, i) => {
          const x = padding.left + (i / (years.length - 1)) * chartWidth;
          return (
            <text key={year} x={x} y={height - 10} textAnchor="middle" fill="#94a3b8" fontSize="11" fontFamily="system-ui">
              {year}
            </text>
          );
        })}

        {/* Fund area fill */}
        <path
          ref={fundAreaRef}
          d={fundAreaD}
          fill="url(#fundAreaGradient)"
          style={{ opacity: 0 }}
        />

        {/* Benchmark line (dashed) */}
        <path
          ref={benchPathRef}
          d={benchPathD}
          fill="none"
          stroke="#94a3b8"
          strokeWidth="2"
          style={{ strokeDasharray: '5,5' }}
        />

        {/* Fund line */}
        <path
          ref={fundPathRef}
          d={fundPathD}
          fill="none"
          stroke="#0066FF"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* End dots */}
        <circle cx={points[points.length - 1].x} cy={points[points.length - 1].fundY} r="4" fill="#0066FF" opacity={animated ? 1 : 0} style={{ transition: 'opacity 0.5s ease 2s' }} />
        <circle cx={points[points.length - 1].x} cy={points[points.length - 1].benchY} r="3" fill="#94a3b8" opacity={animated ? 1 : 0} style={{ transition: 'opacity 0.5s ease 2s' }} />

        {/* End value labels */}
        <text x={points[points.length - 1].x + 8} y={points[points.length - 1].fundY + 4} fill="#0066FF" fontSize="11" fontWeight="600" fontFamily="system-ui" opacity={animated ? 1 : 0} style={{ transition: 'opacity 0.5s ease 2s' }}>
          ${(performanceData[performanceData.length - 1].fund / 1000).toFixed(1)}k
        </text>
        <text x={points[points.length - 1].x + 8} y={points[points.length - 1].benchY + 4} fill="#94a3b8" fontSize="11" fontFamily="system-ui" opacity={animated ? 1 : 0} style={{ transition: 'opacity 0.5s ease 2s' }}>
          ${(performanceData[performanceData.length - 1].benchmark / 1000).toFixed(1)}k
        </text>
      </svg>
    </div>
  );
}

// Dot particle canvas animation for hero background
function DotParticleCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size
    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight * 0.9;
    };
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    // Particle system
    const particleCount = 150;
    const particles: {
      x: number;
      y: number;
      vx: number;
      vy: number;
    }[] = [];

    for (let i = 0; i < particleCount; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 0.5,
        vy: (Math.random() - 0.5) * 0.5,
      });
    }

    const animate = () => {
      // Clear canvas
      ctx.fillStyle = 'rgba(255, 255, 255, 0)';
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Update and draw particles
      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];

        // Update position
        p.x += p.vx;
        p.y += p.vy;

        // Wrap around edges
        if (p.x < 0) p.x = canvas.width;
        if (p.x > canvas.width) p.x = 0;
        if (p.y < 0) p.y = canvas.height;
        if (p.y > canvas.height) p.y = 0;

        // Draw dot
        ctx.fillStyle = 'rgba(51, 65, 85, 0.3)';
        ctx.beginPath();
        ctx.arc(p.x, p.y, 1.5, 0, Math.PI * 2);
        ctx.fill();

        // Draw connecting lines to nearby particles
        for (let j = i + 1; j < particles.length; j++) {
          const p2 = particles[j];
          const dx = p2.x - p.x;
          const dy = p2.y - p.y;
          const distance = Math.sqrt(dx * dx + dy * dy);

          if (distance < 100) {
            ctx.strokeStyle = `rgba(0, 102, 255, ${0.1 * (1 - distance / 100)})`;
            ctx.lineWidth = 0.5;
            ctx.beginPath();
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(p2.x, p2.y);
            ctx.stroke();
          }
        }
      }

      requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener('resize', resizeCanvas);
    };
  }, []);

  return <canvas ref={canvasRef} className="absolute inset-0 opacity-40" />;
}

// Aceternity-style logo cloud with blur animation
function InvestorLogoBar() {
  const logos = [
    { name: 'CDPQ', w: 90 },
    { name: 'PSP Investments', w: 130 },
    { name: 'OMERS', w: 90 },
    { name: "Ontario Teachers'", w: 130 },
    { name: 'BCI', w: 60 },
    { name: 'AIMCo', w: 80 },
    { name: 'Desjardins', w: 100 },
    { name: 'National Bank', w: 120 },
    { name: 'Fiera Capital', w: 110 },
    { name: 'iA Financial', w: 100 },
  ];

  return (
    <div className="relative w-full overflow-hidden py-8">
      {/* Left gradient mask */}
      <div className="absolute left-0 top-0 bottom-0 w-20 bg-gradient-to-r from-slate-50 to-transparent pointer-events-none z-10" />
      {/* Right gradient mask */}
      <div className="absolute right-0 top-0 bottom-0 w-20 bg-gradient-to-l from-slate-50 to-transparent pointer-events-none z-10" />

      <div className="flex gap-8 animate-scroll">
        {[...logos, ...logos].map((logo, idx) => (
          <div key={idx} className="flex-shrink-0 flex items-center justify-center">
            <svg width={logo.w} height="40" viewBox={`0 0 ${logo.w} 40`} className="drop-shadow-none hover:drop-shadow-md transition-all duration-300">
              <rect x="0" y="8" width={logo.w} height="24" rx="4" fill="#f1f5f9" />
              <text x={logo.w / 2} y="24" textAnchor="middle" fill="#475569" fontSize="11" fontWeight="600" fontFamily="Poppins, system-ui, sans-serif">
                {logo.name}
              </text>
            </svg>
          </div>
        ))}
      </div>

      <style jsx>{`
        @keyframes scroll {
          0% {
            transform: translateX(0);
          }
          100% {
            transform: translateX(calc(-50% - 16px));
          }
        }
        .animate-scroll {
          animation: scroll 40s linear infinite;
        }
        .animate-scroll:hover {
          animation-play-state: paused;
        }
      `}</style>
    </div>
  );
}

function ParallaxSection({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!ref.current) return;
    const el = ref.current;

    const handleScroll = () => {
      const rect = el.getBoundingClientRect();
      const wh = window.innerHeight;
      if (rect.top < wh && rect.bottom > 0) {
        const progress = (wh - rect.top) / (wh + rect.height);
        gsap.set(el.querySelector('.parallax-inner'), { y: -progress * 40 });
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div ref={ref} className={className}>
      <div className="parallax-inner">{children}</div>
    </div>
  );
}

export default function Home() {
  return (
    <main className="bg-white">
      {/* Hero */}
      <section className="min-h-[90vh] flex flex-col items-center justify-center px-6 py-20 relative overflow-hidden">
        <DotParticleCanvas />
        <div className="absolute inset-0 bg-gradient-to-b from-slate-50/50 to-white pointer-events-none" />
        <div className="max-w-3xl text-center relative z-10">
          <h1 className="text-5xl md:text-7xl font-bold text-slate-900 mb-6 leading-tight">
            <TypewriterEffect
              words={['Scientific Investing', 'Systematic Alpha', 'Quantitative Edge', 'Data-Driven Returns']}
              className="text-blue-600"
            />
          </h1>
          <p className="text-xl text-slate-600 mb-10 leading-relaxed max-w-2xl mx-auto">
            Rigorous quantitative research and systematic strategies applied to fixed income and multi-asset investing. Built in Montreal for institutional investors worldwide.
          </p>
          <div className="flex gap-4 justify-center flex-wrap">
            <Link href="/strategies" className="bg-slate-900 hover:bg-slate-800 text-white px-8 py-3.5 rounded-lg font-medium inline-flex items-center gap-2 transition-colors">
              Explore Strategies <ArrowRight className="w-4 h-4" />
            </Link>
            <Link href="/solutions" className="border border-slate-200 text-slate-700 hover:border-slate-300 hover:bg-slate-50 px-8 py-3.5 rounded-lg font-medium inline-flex items-center gap-2 transition-all">
              Investment Solutions
            </Link>
          </div>
        </div>
      </section>

      {/* Stats Bar */}
      <section className="bg-white border-y border-slate-100">
        <div className="max-w-7xl mx-auto px-6 py-14">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <ScrollReveal>
              <div className="text-center">
                <div className="text-4xl font-bold text-slate-900 mb-2">
                  $<AnimatedCounter target={1.5} suffix="B+" duration={2000} />
                </div>
                <p className="text-sm text-slate-500 font-medium">Assets Under Management</p>
              </div>
            </ScrollReveal>
            <ScrollReveal delay={100}>
              <div className="text-center">
                <div className="text-4xl font-bold text-slate-900 mb-2">
                  <AnimatedCounter target={4} suffix="" duration={2000} />
                </div>
                <p className="text-sm text-slate-500 font-medium">Investment Strategies</p>
              </div>
            </ScrollReveal>
            <ScrollReveal delay={200}>
              <div className="text-center">
                <div className="text-4xl font-bold text-slate-900 mb-2">
                  <AnimatedCounter target={14} suffix="" duration={2000} />
                </div>
                <p className="text-sm text-slate-500 font-medium">Investment Professionals</p>
              </div>
            </ScrollReveal>
            <ScrollReveal delay={300}>
              <div className="text-center">
                <div className="text-4xl font-bold text-slate-900 mb-2">
                  <AnimatedCounter target={10} suffix="+" duration={2000} />
                </div>
                <p className="text-sm text-slate-500 font-medium">Years of Track Record</p>
              </div>
            </ScrollReveal>
          </div>
        </div>
      </section>

      {/* Our Approach */}
      <section className="py-20 px-6 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">
            <ScrollReveal>
              <div>
                <p className="text-sm font-semibold text-blue-600 mb-2 uppercase tracking-wide">Our Approach</p>
                <h2 className="text-4xl font-bold text-slate-900 mb-6 leading-tight">
                  At the Intersection of Technology, Data & Finance
                </h2>
                <p className="text-lg text-slate-600 leading-relaxed mb-6">
                  We believe that systematic, quantitative approaches to investing deliver superior risk-adjusted returns. Our team combines decades of institutional experience with cutting-edge research in machine learning, signal processing, and portfolio optimization.
                </p>
                <Link href="/team" className="inline-flex items-center gap-2 text-blue-600 font-medium hover:text-blue-700 transition-colors">
                  Meet our team <ChevronRight className="w-4 h-4" />
                </Link>
              </div>
            </ScrollReveal>
            <ScrollReveal delay={200}>
              <div className="space-y-5">
                {[
                  { icon: TrendingUp, title: 'Quantitative Research', desc: 'Deep analysis of market dynamics, credit fundamentals, and risk factors using proprietary models and ML.' },
                  { icon: BarChart3, title: 'Systematic Construction', desc: 'Rules-based portfolio building using optimization models with disciplined allocation and rebalancing.' },
                  { icon: Shield, title: 'Dynamic Risk Management', desc: 'Continuous monitoring with ML-driven regime classification and proactive hedging strategies.' },
                ].map((item) => (
                  <Card key={item.title} className="p-6 border border-slate-200 bg-white hover:border-blue-200 transition-colors">
                    <div className="flex gap-4">
                      <div className="flex-shrink-0 w-12 h-12 rounded-lg bg-blue-50 flex items-center justify-center">
                        <item.icon className="w-6 h-6 text-blue-600" />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-slate-900 mb-2">{item.title}</h3>
                        <p className="text-sm text-slate-600 leading-relaxed">{item.desc}</p>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </ScrollReveal>
          </div>
        </div>
      </section>

      {/* Strategies */}
      <section className="py-20 px-6 bg-slate-50 border-t border-slate-100">
        <div className="max-w-7xl mx-auto">
          <ScrollReveal>
            <div className="flex items-end justify-between mb-12">
              <div>
                <p className="text-sm font-semibold text-blue-600 mb-3 uppercase tracking-wide">Strategies</p>
                <h2 className="text-4xl font-bold text-slate-900">Our Investment Solutions</h2>
              </div>
              <Link href="/strategies" className="hidden md:inline-flex items-center gap-2 text-blue-600 font-medium hover:text-blue-700 transition-colors">
                View all strategies <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </ScrollReveal>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {funds.slice(0, 4).map((fund, index) => (
              <ScrollReveal key={fund.slug} delay={index * 100}>
                <Link href={`/strategies/${fund.slug}`}>
                  <Card className="h-full p-6 border border-slate-200 bg-white hover:border-blue-200 hover:shadow-md transition-all cursor-pointer group">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h3 className="text-lg font-bold text-slate-900 group-hover:text-blue-600 transition-colors">{fund.name}</h3>
                        <div className="flex gap-2 mt-1">
                          <span className="px-2 py-0.5 bg-slate-100 text-slate-600 rounded text-xs">{fund.assetClass}</span>
                          <span className="px-2 py-0.5 bg-slate-100 text-slate-600 rounded text-xs">{fund.vehicle}</span>
                        </div>
                      </div>
                      <ArrowRight className="w-5 h-5 text-slate-300 group-hover:text-blue-600 transition-colors" />
                    </div>
                    <p className="text-sm text-slate-600 leading-relaxed mb-4 line-clamp-2">{fund.description}</p>
                    <div className="grid grid-cols-3 gap-4 pt-4 border-t border-slate-100 text-center">
                      <div>
                        <p className="text-sm font-bold text-slate-900">{formatPercent(fund.returns.oneYear)}</p>
                        <p className="text-xs text-slate-500 mt-1">1-Year</p>
                      </div>
                      <div>
                        <p className="text-sm font-bold text-slate-900">{formatPercent(fund.returns.sinceInception)}</p>
                        <p className="text-xs text-slate-500 mt-1">Since Inception</p>
                      </div>
                      <div>
                        <p className="text-sm font-bold text-slate-900">{fund.sharpe?.toFixed(2) ?? 'N/A'}</p>
                        <p className="text-xs text-slate-500 mt-1">Sharpe</p>
                      </div>
                    </div>
                  </Card>
                </Link>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* Performance Chart */}
      <section className="py-20 px-6 bg-white">
        <div className="max-w-7xl mx-auto">
          <ScrollReveal>
            <div className="mb-12">
              <p className="text-sm font-semibold text-blue-600 mb-3 uppercase tracking-wide">Performance</p>
              <h2 className="text-4xl font-bold text-slate-900 mb-2">Growth of $10,000</h2>
              <p className="text-lg text-slate-500">Illustrative 5-year cumulative performance vs. benchmark</p>
            </div>
          </ScrollReveal>
          <ScrollReveal delay={200}>
            <Card className="p-4 md:p-6 border border-slate-200 bg-white">
              <PerformanceChart />
              <div className="flex items-center justify-center gap-6 mt-4 text-sm text-slate-500">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-0.5 bg-blue-600" />
                  Nymbus Multi-Strategy
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-0.5 bg-slate-400" />
                  Benchmark
                </div>
              </div>
            </Card>
          </ScrollReveal>
        </div>
      </section>

      {/* Institutional Trust - Logo Bar */}
      <section className="py-12 px-6 bg-slate-50 border-y border-slate-100">
        <div className="max-w-7xl mx-auto">
          <ScrollReveal>
            <p className="text-center text-sm font-semibold text-slate-400 uppercase tracking-wide mb-6">
              Trusted by Canada&apos;s Leading Institutions
            </p>
          </ScrollReveal>
          <ScrollReveal delay={200}>
            <InvestorLogoBar />
          </ScrollReveal>
        </div>
      </section>

      {/* News / Insights Parallax Section */}
      <section className="py-20 px-6 bg-white border-b border-slate-100">
        <div className="max-w-7xl mx-auto">
          <ScrollReveal>
            <div className="flex items-end justify-between mb-12">
              <div>
                <p className="text-sm font-semibold text-blue-600 mb-3 uppercase tracking-wide">
                  <Newspaper className="w-4 h-4 inline-block mr-1 -mt-0.5" />
                  News & Milestones
                </p>
                <h2 className="text-4xl font-bold text-slate-900">Recent Developments</h2>
              </div>
            </div>
          </ScrollReveal>

          <ParallaxSection>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {newsItems.map((item, index) => (
                <ScrollReveal key={index} delay={index * 80}>
                  <Card className="p-6 border border-slate-200 bg-white hover:border-blue-300 transition-all h-full group cursor-pointer relative overflow-hidden">
                    {/* Gradient overlay on hover */}
                    <div className="absolute inset-0 bg-gradient-to-br from-blue-50/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />

                    <div className="relative z-10">
                      <div className="flex items-center gap-2 mb-3">
                        <span className="px-2 py-0.5 bg-blue-50 text-blue-600 rounded text-xs font-semibold">{item.category}</span>
                        <span className="text-slate-400 text-xs flex items-center gap-1">
                          <Calendar className="w-3 h-3" /> {item.date}
                        </span>
                      </div>
                      <h3 className="text-base font-bold text-slate-900 mb-2 leading-snug">{item.title}</h3>
                      <p className="text-slate-600 text-sm leading-relaxed">{item.description}</p>
                    </div>

                    {/* Arrow icon on hover */}
                    <div className="absolute top-4 right-4 text-blue-600 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-x-2 group-hover:translate-x-0">
                      <ArrowRight className="w-5 h-5" />
                    </div>

                    {/* Lift effect on hover */}
                    <style jsx>{`
                      @keyframes liftCard {
                        from {
                          transform: translateY(0);
                        }
                        to {
                          transform: translateY(-8px);
                        }
                      }
                      .group:hover {
                        box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
                        animation: liftCard 0.3s ease-out forwards;
                      }
                    `}</style>
                  </Card>
                </ScrollReveal>
              ))}
            </div>
          </ParallaxSection>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-6 bg-slate-900">
        <div className="max-w-3xl mx-auto text-center">
          <ScrollReveal>
            <h2 className="text-4xl font-bold text-white mb-6">Ready to explore systematic investing?</h2>
            <p className="text-lg text-slate-400 mb-8">
              Connect with our team to learn how our quantitative approach can deliver superior risk-adjusted returns for your portfolio.
            </p>
            <div className="flex gap-4 justify-center flex-wrap">
              <Link href="/contact" className="bg-white text-slate-900 hover:bg-slate-100 px-8 py-3.5 rounded-lg font-medium inline-flex items-center gap-2 transition-colors">
                Get in Touch <ArrowRight className="w-4 h-4" />
              </Link>
              <Link href="/solutions" className="border border-white/20 text-white hover:border-white/40 px-8 py-3.5 rounded-lg font-medium inline-flex items-center gap-2 transition-colors">
                View Solutions
              </Link>
            </div>
          </ScrollReveal>
        </div>
      </section>
    </main>
  );
}
