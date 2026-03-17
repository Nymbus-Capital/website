'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { funds, Fund } from '@/data/funds';
import { Card } from '@/components/ui/Card';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { ScrollReveal } from '@/components/animations/ScrollReveal';
import { cn, formatPercent } from '@/lib/utils';
import { ArrowRight } from 'lucide-react';
import gsap from 'gsap';

// Generate simple sparkline data for each fund
function generateSparklineData(fund: Fund) {
  const data: { value: number }[] = [];
  const seed = fund.slug.length * 7;
  let value = 10000;
  for (let i = 0; i < 24; i++) {
    const pseudoRandom = Math.sin(seed + i * 1.5) * 0.5 + Math.cos(seed * 0.7 + i * 0.8) * 0.3;
    const monthlyReturn = (fund.returns.sinceInception / 100 / 12) + pseudoRandom * 0.015;
    value = Math.round(value * (1 + monthlyReturn));
    data.push({ value });
  }
  return data;
}

const fundColors = ['#0066FF', '#059669', '#7c3aed', '#dc2626'];
const allFundData = funds.map(f => ({ fund: f, data: generateSparklineData(f) }));

// Downside Volatility vs Annual Returns scatter using SVG + gsap
function DownsideVolatilityScatter() {
  const svgRef = useRef<SVGSVGElement>(null);
  const [hoveredPoint, setHoveredPoint] = useState<number | null>(null);

  // Fund data
  const fundData = funds.map((fund, i) => ({
    name: fund.shortName,
    fullName: fund.name,
    downvol: fund.downsideVolatility || 5,
    annualReturn: fund.annualReturn || fund.returns.sinceInception,
    assetClass: fund.assetClass,
    color: fundColors[i],
  }));

  // Reference indices as grey dots
  const referenceData = [
    { name: 'S&P/TSX', risk: 15, ret: 8.5, color: '#a1a5a1' },
    { name: 'FTSE Bond', risk: 4.2, ret: 2.8, color: '#a1a5a1' },
    { name: 'MSCI World', risk: 14, ret: 9.2, color: '#a1a5a1' },
    { name: 'T-Bills', risk: 0.5, ret: 1.5, color: '#a1a5a1' },
  ];

  useEffect(() => {
    if (!svgRef.current) return;
    const circles = svgRef.current.querySelectorAll('.scatter-circle');
    gsap.fromTo(
      circles,
      { scale: 0, opacity: 0 },
      {
        scale: 1,
        opacity: 1,
        duration: 0.6,
        stagger: 0.1,
        ease: 'back.out(1.7)',
        transformOrigin: 'center',
      }
    );
  }, []);

  const width = 520;
  const height = 380;
  const margin = { top: 30, right: 30, bottom: 60, left: 70 };
  const innerW = width - margin.left - margin.right;
  const innerH = height - margin.top - margin.bottom;

  const xMin = 0,
    xMax = 16;
  const yMin = 0,
    yMax = 14;
  const scaleX = (v: number) => margin.left + ((v - xMin) / (xMax - xMin)) * innerW;
  const scaleY = (v: number) => margin.top + innerH - ((v - yMin) / (yMax - yMin)) * innerH;

  const allPoints = [
    ...fundData.map((d) => ({ ...d, isFund: true })),
    ...referenceData.map((d) => ({ name: d.name, fullName: d.name, downvol: d.risk, annualReturn: d.ret, color: d.color, isFund: false })),
  ];

  return (
    <div className="w-full overflow-x-auto">
      <svg ref={svgRef} viewBox={`0 0 ${width} ${height}`} className="w-full max-w-[520px] mx-auto">
        {/* Grid */}
        {[0, 4, 8, 12, 16].map((v) => (
          <line key={`gx-${v}`} x1={scaleX(v)} x2={scaleX(v)} y1={margin.top} y2={margin.top + innerH} stroke="#f1f5f9" strokeWidth={1} />
        ))}
        {[0, 4, 8, 12].map((v) => (
          <line key={`gy-${v}`} x1={margin.left} x2={margin.left + innerW} y1={scaleY(v)} y2={scaleY(v)} stroke="#f1f5f9" strokeWidth={1} />
        ))}
        {/* Axes */}
        <line x1={margin.left} x2={margin.left + innerW} y1={margin.top + innerH} y2={margin.top + innerH} stroke="#e2e8f0" strokeWidth="2" />
        <line x1={margin.left} x2={margin.left} y1={margin.top} y2={margin.top + innerH} stroke="#e2e8f0" strokeWidth="2" />
        {/* X axis labels */}
        {[0, 4, 8, 12, 16].map((v) => (
          <text key={`xl-${v}`} x={scaleX(v)} y={margin.top + innerH + 20} textAnchor="middle" fontSize={10} fill="#94a3b8">
            {v}%
          </text>
        ))}
        <text x={margin.left + innerW / 2} y={height - 8} textAnchor="middle" fontSize={11} fontWeight={600} fill="#64748b">
          Downside Volatility (%)
        </text>
        {/* Y axis labels */}
        {[0, 4, 8, 12].map((v) => (
          <text key={`yl-${v}`} x={margin.left - 12} y={scaleY(v) + 4} textAnchor="end" fontSize={10} fill="#94a3b8">
            {v}%
          </text>
        ))}
        <text
          x={20}
          y={margin.top + innerH / 2}
          textAnchor="middle"
          fontSize={11}
          fontWeight={600}
          fill="#64748b"
          transform={`rotate(-90, 20, ${margin.top + innerH / 2})`}
        >
          Annual Return (%)
        </text>
        {/* Dots */}
        {allPoints.map((d, i) => {
          const isReferenceData = !d.isFund;
          const radius = hoveredPoint === i ? 10 : 7;
          return (
            <g
              key={`${d.name}-${i}`}
              className="scatter-circle cursor-pointer"
              onMouseEnter={() => setHoveredPoint(i)}
              onMouseLeave={() => setHoveredPoint(null)}
            >
              <circle
                cx={scaleX(d.downvol)}
                cy={scaleY(d.annualReturn)}
                r={radius}
                fill={d.color}
                opacity={hoveredPoint !== null && hoveredPoint !== i ? 0.4 : 0.8}
                className="transition-all duration-200"
              />
              {!isReferenceData && (
                <text
                  x={scaleX(d.downvol)}
                  y={scaleY(d.annualReturn) + 3}
                  textAnchor="middle"
                  fontSize={8}
                  fontWeight={600}
                  fill="white"
                >
                  {d.name}
                </text>
              )}
              {hoveredPoint === i && (
                <g>
                  <rect
                    x={scaleX(d.downvol) + 15}
                    y={scaleY(d.annualReturn) - 35}
                    width={150}
                    height={58}
                    rx={6}
                    fill="white"
                    stroke="#e2e8f0"
                  />
                  <text x={scaleX(d.downvol) + 24} y={scaleY(d.annualReturn) - 18} fontSize={10} fontWeight={600} fill="#0f172a">
                    {d.fullName}
                  </text>
                  <text x={scaleX(d.downvol) + 24} y={scaleY(d.annualReturn) + 0} fontSize={9} fill="#64748b">
                    Downside Vol: {d.downvol.toFixed(1)}%
                  </text>
                  <text x={scaleX(d.downvol) + 24} y={scaleY(d.annualReturn) + 14} fontSize={9} fill="#64748b">
                    Annual Return: {d.annualReturn.toFixed(1)}%
                  </text>
                </g>
              )}
            </g>
          );
        })}
      </svg>
    </div>
  );
}

// Mini sparkline using SVG + gsap
function Sparkline({ data, color, height = 60 }: { data: number[]; color: string; height?: number }) {
  const pathRef = useRef<SVGPolylineElement>(null);
  const containerRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (!pathRef.current) return;
    const length = pathRef.current.getTotalLength();
    gsap.fromTo(pathRef.current,
      { strokeDasharray: length, strokeDashoffset: length },
      { strokeDashoffset: 0, duration: 1.5, ease: 'power2.out' }
    );
  }, []);

  const width = 200;
  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;
  const points = data.map((v, i) => {
    const x = (i / (data.length - 1)) * width;
    const y = height - ((v - min) / range) * (height - 8) - 4;
    return `${x},${y}`;
  });

  const areaPoints = [...points, `${width},${height}`, `0,${height}`].join(' ');

  return (
    <svg ref={containerRef} viewBox={`0 0 ${width} ${height}`} className="w-full" style={{ height }}>
      <defs>
        <linearGradient id={`spark-${color.replace('#', '')}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity={0.12} />
          <stop offset="100%" stopColor={color} stopOpacity={0} />
        </linearGradient>
      </defs>
      <polygon points={areaPoints} fill={`url(#spark-${color.replace('#', '')})`} />
      <polyline
        ref={pathRef}
        points={points.join(' ')}
        fill="none"
        stroke={color}
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

// Animated horizontal progress bar component
function AnimatedProgressBar({ value, max, color }: { value: number; max: number; color: string }) {
  const barRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!barRef.current) return;
    gsap.fromTo(
      barRef.current,
      { width: 0 },
      { width: `${(value / max) * 100}%`, duration: 1.2, ease: 'power2.out' }
    );
  }, [value, max]);

  return (
    <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
      <div
        ref={barRef}
        className="h-full rounded-full transition-all"
        style={{ backgroundColor: color }}
      />
    </div>
  );
}

// Performance comparison section
function PerformanceComparisonSection() {
  const [selectedFunds, setSelectedFunds] = useState<number[]>([0, 1, 2, 3]);

  const toggleFund = (idx: number) => {
    setSelectedFunds(prev =>
      prev.includes(idx) ? prev.filter(i => i !== idx) : [...prev, idx]
    );
  };

  const selectedFundsData = selectedFunds.map(idx => {
    const fund = funds[idx];
    return {
      idx,
      name: fund.shortName,
      fullName: fund.name,
      annualReturn: fund.annualReturn || fund.returns.sinceInception,
      sharpeRatio: fund.sharpe || 0.8,
      downsideVolatility: fund.downsideVolatility || 5,
      color: fundColors[idx],
    };
  });

  // Find max values for scaling
  const maxReturn = Math.max(...selectedFundsData.map(d => d.annualReturn), 15);
  const maxSharpe = Math.max(...selectedFundsData.map(d => d.sharpeRatio), 2);
  const maxVol = Math.max(...selectedFundsData.map(d => d.downsideVolatility), 10);

  return (
    <section className="px-6 py-20 md:px-12 bg-white border-t border-slate-100">
      <div className="max-w-7xl mx-auto">
        <ScrollReveal>
          <SectionHeader
            eyebrow="Analytics"
            title="Strategy Performance Comparison"
            description="Compare key metrics across our funds with a clean, modern dashboard view."
          />
        </ScrollReveal>

        {/* Fund Toggle Pills */}
        <ScrollReveal delay={100}>
          <div className="flex flex-wrap gap-2 mb-10">
            {funds.map((fund, i) => (
              <button
                key={fund.slug}
                onClick={() => toggleFund(i)}
                className={cn(
                  "px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-200",
                  selectedFunds.includes(i)
                    ? 'text-white shadow-sm'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                )}
                style={selectedFunds.includes(i) ? { backgroundColor: fundColors[i] } : {}}
              >
                {fund.shortName}
              </button>
            ))}
          </div>
        </ScrollReveal>

        {/* Performance Cards Grid */}
        <ScrollReveal delay={200}>
          <div className="space-y-6">
            {/* Annual Return */}
            <div className="bg-slate-50 rounded-lg p-6 border border-slate-100">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Annual Return</p>
                  <h3 className="text-lg font-bold text-slate-900">Expected Returns</h3>
                </div>
              </div>
              <div className="space-y-4">
                {selectedFundsData.map((fund) => (
                  <div key={fund.idx} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-slate-700">{fund.name}</span>
                      <span className="text-sm font-bold text-slate-900">{fund.annualReturn.toFixed(2)}%</span>
                    </div>
                    <AnimatedProgressBar value={fund.annualReturn} max={maxReturn} color={fund.color} />
                  </div>
                ))}
              </div>
            </div>

            {/* Sharpe Ratio */}
            <div className="bg-slate-50 rounded-lg p-6 border border-slate-100">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Risk-Adjusted Performance</p>
                  <h3 className="text-lg font-bold text-slate-900">Sharpe Ratio</h3>
                </div>
              </div>
              <div className="space-y-4">
                {selectedFundsData.map((fund) => (
                  <div key={fund.idx} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-slate-700">{fund.name}</span>
                      <span className="text-sm font-bold text-slate-900">{fund.sharpeRatio.toFixed(2)}</span>
                    </div>
                    <AnimatedProgressBar value={fund.sharpeRatio} max={maxSharpe} color={fund.color} />
                  </div>
                ))}
              </div>
            </div>

            {/* Downside Volatility */}
            <div className="bg-slate-50 rounded-lg p-6 border border-slate-100">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Risk Metric</p>
                  <h3 className="text-lg font-bold text-slate-900">Downside Volatility</h3>
                </div>
              </div>
              <div className="space-y-4">
                {selectedFundsData.map((fund) => (
                  <div key={fund.idx} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-slate-700">{fund.name}</span>
                      <span className="text-sm font-bold text-slate-900">{fund.downsideVolatility.toFixed(2)}%</span>
                    </div>
                    <AnimatedProgressBar value={fund.downsideVolatility} max={maxVol} color={fund.color} />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}

export default function StrategiesPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Hero */}
      <section className="px-6 py-20 md:py-28 md:px-12">
        <div className="max-w-6xl mx-auto">
          <ScrollReveal>
            <SectionHeader
              eyebrow="Strategies"
              title="Systematic Investment Strategies"
              description="Explore our quantitatively managed funds and strategies. Each employs proprietary models, rigorous research, and disciplined risk management."
            />
          </ScrollReveal>
        </div>
      </section>

      {/* Fund Cards organized by Asset Class */}
      {(['Fixed Income', 'Alternatives'] as const).map((assetClass, sectionIdx) => {
        const assetClassFunds = allFundData.filter(({ fund }) => fund.assetClass === assetClass);
        const sectionTitles = {
          'Fixed Income': 'Fixed Income Strategies',
          'Alternatives': 'Liquid Alternatives',
        };
        const sectionDescriptions = {
          'Fixed Income': 'Systematic bond strategies targeting enhanced returns with ESG integration.',
          'Alternatives': 'Daily-liquidity hedge fund strategies and systematic overlays combining multiple alpha sources for consistent risk-adjusted returns.',
        };

        return (
          <section key={assetClass} className="px-6 pb-16 md:px-12">
            <div className="max-w-7xl mx-auto">
              <ScrollReveal>
                <h2 className="text-3xl font-bold text-slate-900 mb-2">{sectionTitles[assetClass]}</h2>
                <p className="text-slate-600 mb-8">
                  {sectionDescriptions[assetClass]}
                </p>
              </ScrollReveal>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {assetClassFunds.map(({ fund, data }, index) => {
                  const globalIndex = allFundData.findIndex((f) => f.fund.slug === fund.slug);
                  return (
                    <ScrollReveal key={fund.slug} delay={index * 100}>
                      <Link href={`/strategies/${fund.slug}`}>
                        <Card className="p-6 border border-slate-200 hover:border-blue-300 hover:shadow-lg transition-all duration-300 cursor-pointer group h-full">
                          <div className="flex items-start justify-between mb-4">
                            <div>
                              <h3 className="text-lg font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
                                {fund.name}
                              </h3>
                              <div className="flex items-center gap-3 mt-1">
                                <span className="px-2 py-0.5 bg-slate-100 text-slate-600 rounded text-xs font-medium">{fund.vehicle}</span>
                              </div>
                            </div>
                            <ArrowRight className="w-5 h-5 text-slate-300 group-hover:text-blue-600 group-hover:translate-x-1 transition-all" />
                          </div>

                          <p className="text-slate-600 text-sm leading-relaxed mb-4 line-clamp-2">{fund.description}</p>

                          {/* Sparkline */}
                          <div className="mb-4">
                            <Sparkline
                              data={data.slice(-24).map((d) => d.value)}
                              color={fundColors[globalIndex]}
                              height={60}
                            />
                          </div>

                          {/* Performance Metrics */}
                          <div className="grid grid-cols-4 gap-3 pt-4 border-t border-slate-100">
                            <div className="text-center">
                              <p className="text-sm font-bold text-slate-900">{formatPercent(fund.returns.ytd)}</p>
                              <p className="text-xs text-slate-500">YTD</p>
                            </div>
                            <div className="text-center">
                              <p className="text-sm font-bold text-slate-900">{formatPercent(fund.returns.oneYear)}</p>
                              <p className="text-xs text-slate-500">1Y</p>
                            </div>
                            <div className="text-center">
                              <p className="text-sm font-bold text-slate-900">{formatPercent(fund.returns.sinceInception)}</p>
                              <p className="text-xs text-slate-500">SI</p>
                            </div>
                            <div className="text-center">
                              <p className="text-sm font-bold text-slate-900">{fund.sharpe?.toFixed(2) ?? '\u2014'}</p>
                              <p className="text-xs text-slate-500">Sharpe</p>
                            </div>
                          </div>
                        </Card>
                      </Link>
                    </ScrollReveal>
                  );
                })}
              </div>
            </div>
          </section>
        );
      })}

      {/* Strategy Performance Comparison */}
      <PerformanceComparisonSection />


      {/* Risk-Return Scatter */}
      <section className="px-6 py-20 md:px-12 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <ScrollReveal>
              <div>
                <p className="text-sm font-semibold text-blue-600 mb-2 uppercase tracking-wide">Risk Analysis</p>
                <h2 className="text-3xl font-bold text-slate-900 mb-6">Downside Volatility vs Returns</h2>
                <p className="text-slate-700 leading-relaxed mb-8">
                  Our strategies are positioned across the risk-return spectrum. The chart shows each fund's downside volatility against its annual return, along with key reference indices for context.
                </p>

                {(['Fixed Income', 'Alternatives'] as const).map((assetClass) => (
                  <div key={assetClass} className="mb-6">
                    <h3 className="text-sm font-bold text-slate-900 mb-3 uppercase tracking-wide">{assetClass}</h3>
                    <div className="space-y-2">
                      {funds.filter((f) => f.assetClass === assetClass).map((fund, i) => {
                        const fundIdx = funds.indexOf(fund);
                        return (
                          <div key={fund.slug} className="flex items-center gap-3">
                            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: fundColors[fundIdx] }} />
                            <div className="flex-1">
                              <p className="font-semibold text-slate-900 text-sm">{fund.shortName}</p>
                              <p className="text-slate-500 text-xs">
                                Downside Vol: {(fund.downsideVolatility || 5).toFixed(1)}% | Annual Return: {formatPercent(fund.returns.sinceInception)}
                              </p>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </ScrollReveal>

            <ScrollReveal delay={200}>
              <Card className="p-6 border border-slate-200">
                <DownsideVolatilityScatter />
              </Card>
            </ScrollReveal>
          </div>
        </div>
      </section>

    </div>
  );
}
