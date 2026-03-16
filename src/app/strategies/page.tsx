'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import { funds, Fund } from '@/data/funds';
import { Card } from '@/components/ui/Card';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { ScrollReveal } from '@/components/animations/ScrollReveal';
import { cn, formatPercent } from '@/lib/utils';
import { TrendingUp, BarChart3, Shield, ArrowRight, Activity } from 'lucide-react';
import gsap from 'gsap';

// Generate realistic monthly data for each fund
const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const years = [2020, 2021, 2022, 2023, 2024, 2025];

function generateMonthlyData(fund: Fund) {
  const data: { time: string; value: number; return: number; drawdown: number }[] = [];
  const seed = fund.slug.length * 7;
  let cumReturn = 0;
  let peak = 10000;

  for (let y = 0; y < years.length; y++) {
    for (let m = 0; m < 12; m++) {
      const idx = y * 12 + m;
      const pseudoRandom = Math.sin(seed + idx * 1.5) * 0.5 + Math.cos(seed * 0.7 + idx * 0.8) * 0.3;
      const monthlyReturn = (fund.returns.sinceInception / 100 / 12) + pseudoRandom * 0.015;
      cumReturn += monthlyReturn;
      const value = Math.round(10000 * (1 + cumReturn));
      if (value > peak) peak = value;
      const drawdown = +((value - peak) / peak * 100).toFixed(2);
      const day = String(Math.min(28, 1 + m * 2)).padStart(2, '0');
      const month = String(m + 1).padStart(2, '0');

      data.push({
        time: `${years[y]}-${month}-${day}`,
        value,
        return: +(monthlyReturn * 100).toFixed(2),
        drawdown,
      });
    }
  }
  return data;
}

const fundColors = ['#0066FF', '#059669', '#7c3aed', '#dc2626'];
const allFundData = funds.map(f => ({ fund: f, data: generateMonthlyData(f) }));

// SVG + GSAP Line Chart Component
function SVGLineChart({
  fundIndices,
  chartMode,
  height = 450,
}: {
  fundIndices: number[];
  chartMode: 'growth' | 'drawdown';
  height?: number;
}) {
  const svgRef = useRef<SVGSVGElement>(null);
  const pathRefs = useRef<(SVGPathElement | null)[]>([]);

  useEffect(() => {
    if (!svgRef.current || fundIndices.length === 0) return;

    const width = svgRef.current.clientWidth || 800;
    const padding = 50;
    const chartWidth = width - padding * 2;
    const chartHeight = height - padding * 2;

    // Animate all paths
    fundIndices.forEach((fi, idx) => {
      const pathEl = pathRefs.current[idx];
      if (!pathEl) return;

      const length = pathEl.getTotalLength();
      gsap.fromTo(
        pathEl,
        { strokeDasharray: length, strokeDashoffset: length },
        {
          strokeDashoffset: 0,
          duration: 2,
          ease: 'power2.inOut',
          delay: idx * 0.2,
        }
      );
    });
  }, [fundIndices, chartMode]);

  const width = 800;
  const padding = 50;
  const chartWidth = width - padding * 2;
  const chartHeight = height - padding * 2;

  // Get data range for scaling
  const dataValues = fundIndices.flatMap((fi) => {
    const { data } = allFundData[fi];
    if (chartMode === 'growth') {
      return data.map((d) => d.value);
    } else {
      return data.map((d) => d.drawdown);
    }
  });

  const minVal = Math.min(...dataValues);
  const maxVal = Math.max(...dataValues);
  const range = maxVal - minVal || 1;
  const scale = (v: number) => padding + ((v - minVal) / range) * chartHeight;

  return (
    <div className="w-full overflow-x-auto">
      <svg
        ref={svgRef}
        viewBox={`0 0 ${width} ${height}`}
        className="w-full"
        style={{ minHeight: height, minWidth: width }}
      >
        {/* Grid */}
        {[0, 0.25, 0.5, 0.75, 1].map((frac) => (
          <line
            key={`hgrid-${frac}`}
            x1={padding}
            x2={padding + chartWidth}
            y1={padding + frac * chartHeight}
            y2={padding + frac * chartHeight}
            stroke="#f1f5f9"
            strokeWidth="1"
          />
        ))}

        {/* Axes */}
        <line x1={padding} x2={padding} y1={padding} y2={padding + chartHeight} stroke="#e2e8f0" strokeWidth="2" />
        <line
          x1={padding}
          x2={padding + chartWidth}
          y1={padding + chartHeight}
          y2={padding + chartHeight}
          stroke="#e2e8f0"
          strokeWidth="2"
        />

        {/* Y-axis labels */}
        {[0, 0.25, 0.5, 0.75, 1].map((frac, i) => {
          const val = minVal + frac * range;
          const label =
            chartMode === 'growth'
              ? '$' + Math.round(val).toLocaleString()
              : val.toFixed(1) + '%';
          return (
            <text
              key={`ylabel-${i}`}
              x={padding - 10}
              y={padding + (1 - frac) * chartHeight + 4}
              textAnchor="end"
              fontSize="11"
              fill="#94a3b8"
            >
              {label}
            </text>
          );
        })}

        {/* Lines */}
        {fundIndices.map((fi, idx) => {
          const { data } = allFundData[fi];
          const color = fundColors[fi];
          const values = chartMode === 'growth' ? data.map((d) => d.value) : data.map((d) => d.drawdown);

          const points = values.map((v, i) => {
            const x = padding + (i / (values.length - 1)) * chartWidth;
            const y = scale(v);
            return `${x},${y}`;
          });

          const pathD = 'M' + points.join('L');

          return (
            <g key={fi}>
              <defs>
                <linearGradient id={`grad-${fi}`} x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor={color} stopOpacity="0.15" />
                  <stop offset="100%" stopColor={color} stopOpacity="0" />
                </linearGradient>
              </defs>
              <path
                d={pathD}
                fill="none"
                stroke={color}
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d={`${pathD}L${padding + chartWidth},${padding + chartHeight}L${padding},${padding + chartHeight}Z`}
                fill={`url(#grad-${fi})`}
              />
            </g>
          );
        })}
      </svg>
    </div>
  );
}

// Animated bar chart using gsap
function AnimatedBarChart({ fundIndices }: { fundIndices: number[] }) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;
    const bars = containerRef.current.querySelectorAll('.bar-fill');
    gsap.fromTo(bars, { scaleY: 0 }, {
      scaleY: 1,
      duration: 0.8,
      stagger: 0.05,
      ease: 'power3.out',
      transformOrigin: 'bottom',
    });
  }, [fundIndices]);

  // Last 12 months of returns for selected funds
  const selectedData = fundIndices.map(fi => allFundData[fi]);
  const last12 = selectedData[0]?.data.slice(-12) || [];

  return (
    <div ref={containerRef} className="w-full h-[450px] flex items-end gap-1 px-4 pb-8 pt-4 relative">
      {/* Y axis labels */}
      <div className="absolute left-0 top-4 bottom-8 flex flex-col justify-between text-xs text-slate-400 w-10">
        <span>2%</span>
        <span>1%</span>
        <span>0%</span>
        <span>-1%</span>
      </div>
      {/* Zero line */}
      <div className="absolute left-10 right-4 top-[55%] border-t border-slate-200 border-dashed" />
      <div className="flex-1 flex items-center justify-around gap-1 h-full ml-10">
        {last12.map((point, mi) => (
          <div key={mi} className="flex flex-col items-center gap-1 flex-1 h-full justify-end relative">
            <div className="flex gap-0.5 items-end h-[80%] w-full justify-center">
              {selectedData.map(({ fund, data }, fi) => {
                const val = data.slice(-12)[mi]?.return ?? 0;
                const maxH = 45; // percent of container
                const barH = Math.abs(val) * maxH / 2;
                const isPositive = val >= 0;
                return (
                  <div
                    key={fund.slug}
                    className="bar-fill rounded-t-sm flex-1 max-w-3"
                    style={{
                      height: `${barH}%`,
                      backgroundColor: fundColors[funds.indexOf(fund)],
                      opacity: 0.85,
                      alignSelf: isPositive ? 'flex-end' : 'flex-start',
                      borderRadius: isPositive ? '2px 2px 0 0' : '0 0 2px 2px',
                    }}
                    title={`${fund.shortName}: ${val.toFixed(2)}%`}
                  />
                );
              })}
            </div>
            <span className="text-[10px] text-slate-400 mt-1">{point.time.slice(5, 7)}/{point.time.slice(2, 4)}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

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

export default function StrategiesPage() {
  const [selectedFunds, setSelectedFunds] = useState<number[]>([0, 1, 2, 3]);
  const [chartMode, setChartMode] = useState<'growth' | 'returns' | 'drawdown'>('growth');

  const toggleFund = (idx: number) => {
    setSelectedFunds(prev =>
      prev.includes(idx) ? prev.filter(i => i !== idx) : [...prev, idx]
    );
  };

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
      {(['Fixed Income', 'Alternatives', 'Multi-Asset'] as const).map((assetClass, sectionIdx) => {
        const assetClassFunds = allFundData.filter(({ fund }) => fund.assetClass === assetClass);
        const sectionTitles = {
          'Fixed Income': 'Fixed Income Strategies',
          'Alternatives': 'Liquid Alternatives',
          'Multi-Asset': 'Multi-Asset Strategies',
        };

        return (
          <section key={assetClass} className="px-6 pb-16 md:px-12">
            <div className="max-w-7xl mx-auto">
              <ScrollReveal>
                <h2 className="text-3xl font-bold text-slate-900 mb-2">{sectionTitles[assetClass]}</h2>
                <p className="text-slate-600 mb-8">
                  {assetClass === 'Fixed Income' && 'Systematic bond strategies targeting enhanced returns with ESG integration.'}
                  {assetClass === 'Alternatives' && 'Diversified alternatives combining multiple strategies for consistent risk-adjusted returns.'}
                  {assetClass === 'Multi-Asset' && 'Global multi-asset strategies optimized for low volatility and stable performance.'}
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
                              <p className="text-sm font-bold text-slate-900">{fund.sharpe?.toFixed(2) ?? '—'}</p>
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

      {/* Interactive Performance Comparison */}
      <section className="px-6 py-20 md:px-12 bg-slate-50 border-t border-slate-100">
        <div className="max-w-7xl mx-auto">
          <ScrollReveal>
            <SectionHeader
              eyebrow="Analytics"
              title="Interactive Performance Analysis"
              description="Compare fund performance across multiple dimensions. Toggle funds on and off, switch between visualization types."
            />
          </ScrollReveal>

          {/* Fund Toggles */}
          <ScrollReveal delay={100}>
            <div className="flex flex-wrap gap-3 mb-6">
              {funds.map((fund, i) => (
                <button
                  key={fund.slug}
                  onClick={() => toggleFund(i)}
                  className={cn(
                    "flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 border",
                    selectedFunds.includes(i)
                      ? 'border-transparent text-white shadow-md'
                      : 'border-slate-200 text-slate-400 bg-white hover:border-slate-300'
                  )}
                  style={selectedFunds.includes(i) ? { backgroundColor: fundColors[i] } : {}}
                >
                  <span className="w-3 h-3 rounded-full" style={{ backgroundColor: fundColors[i] }} />
                  {fund.shortName}
                </button>
              ))}
            </div>
          </ScrollReveal>

          {/* Chart Type Selector */}
          <ScrollReveal delay={200}>
            <div className="flex gap-2 mb-8">
              {[
                { id: 'growth' as const, label: 'Growth of $10K', icon: TrendingUp },
                { id: 'returns' as const, label: 'Monthly Returns', icon: BarChart3 },
                { id: 'drawdown' as const, label: 'Drawdowns', icon: Activity },
              ].map(({ id, label, icon: Icon }) => (
                <button
                  key={id}
                  onClick={() => setChartMode(id)}
                  className={cn(
                    "flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all",
                    chartMode === id
                      ? 'bg-slate-900 text-white'
                      : 'bg-white text-slate-600 border border-slate-200 hover:border-slate-300'
                  )}
                >
                  <Icon className="w-4 h-4" />
                  <span className="hidden sm:inline">{label}</span>
                </button>
              ))}
            </div>
          </ScrollReveal>

          {/* Charts */}
          <Card className="p-4 md:p-6 border border-slate-200 overflow-hidden">
            {/* Legend */}
            <div className="flex flex-wrap gap-4 mb-4">
              {selectedFunds.map(fi => (
                <div key={fi} className="flex items-center gap-2 text-sm">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: fundColors[fi] }} />
                  <span className="text-slate-700 font-medium">{funds[fi].shortName}</span>
                </div>
              ))}
            </div>

            {chartMode === 'returns' ? (
              <AnimatedBarChart fundIndices={selectedFunds} />
            ) : (
              <SVGLineChart
                fundIndices={selectedFunds}
                chartMode={chartMode}
                height={450}
              />
            )}
          </Card>
        </div>
      </section>

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

                {(['Fixed Income', 'Alternatives', 'Multi-Asset'] as const).map((assetClass) => (
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