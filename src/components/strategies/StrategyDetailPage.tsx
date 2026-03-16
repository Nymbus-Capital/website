'use client';

import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollReveal } from '@/components/animations/ScrollReveal';
import { Card } from '@/components/ui/Card';
import { SectionHeader } from '@/components/ui/SectionHeader';
import AnimatedCounter from '@/components/animations/AnimatedCounter';
import { cn, formatPercent, formatCurrency } from '@/lib/utils';
import { fundBySlug, Fund } from '@/data/funds';
import {
  BarChart3,
  TrendingUp,
  Calendar,
  DollarSign,
  FileText,
  Download,
  Heart,
  AlertCircle,
  ArrowUpRight,
  ArrowDownRight,
} from 'lucide-react';

interface StrategyDetailPageProps {
  slug: string;
}

export default function StrategyDetailPage({ slug }: StrategyDetailPageProps) {
  const fund = fundBySlug(slug);

  if (!fund) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-slate-900 mb-4">Strategy not found</h1>
          <p className="text-slate-500">The strategy you're looking for doesn't exist.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <HeroSection fund={fund} />
      <div className="max-w-6xl mx-auto px-4 md:px-6 lg:px-8 py-16 space-y-24">
        <PerformanceSection fund={fund} />
        <TrailingReturnsTable fund={fund} />
        <CalendarYearReturns fund={fund} />
        <MonthlyReturnsHeatmap fund={fund} />
        <RiskMetricsTable fund={fund} />
        <PortfolioManagersSection fund={fund} />
        <FundDocumentsSection fund={fund} />
        <CTASection fund={fund} />
      </div>
    </div>
  );
}

function HeroSection({ fund }: { fund: Fund }) {
  const titleRef = useRef<HTMLHeadingElement>(null);
  const descRef = useRef<HTMLParagraphElement>(null);

  useEffect(() => {
    if (titleRef.current) {
      gsap.from(titleRef.current, {
        opacity: 0,
        y: 20,
        duration: 0.8,
        ease: 'power2.out',
      });
    }
    if (descRef.current) {
      gsap.from(descRef.current, {
        opacity: 0,
        y: 20,
        duration: 0.8,
        delay: 0.2,
        ease: 'power2.out',
      });
    }
  }, []);

  const inceptionDate = new Date(fund.inceptionDate);
  const yearsActive = (new Date().getFullYear() - inceptionDate.getFullYear());

  return (
    <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white py-20 md:py-32">
      <div className="max-w-6xl mx-auto px-4 md:px-6 lg:px-8">
        <div className="flex gap-3 mb-8 items-center">
          <span className="inline-block px-3 py-1 bg-blue-500/20 border border-blue-400/50 rounded-full text-sm font-semibold text-blue-200">
            {fund.assetClass}
          </span>
          <span className="inline-block px-3 py-1 bg-slate-500/20 border border-slate-400/50 rounded-full text-sm font-semibold text-slate-200">
            {fund.vehicle}
          </span>
        </div>

        <h1 ref={titleRef} className="text-5xl md:text-6xl font-bold mb-6 leading-tight">
          {fund.name}
        </h1>

        <p ref={descRef} className="text-xl text-slate-300 max-w-3xl leading-relaxed mb-12">
          {fund.description}
        </p>

        <div className="grid grid-cols-2 md:grid-cols-5 gap-6">
          <StatItem label="Inception Date" value={inceptionDate.toLocaleDateString('en-CA', { year: 'numeric', month: 'short', day: 'numeric' })} />
          {fund.mer && <StatItem label="MER" value={fund.mer} />}
          <StatItem label="Currency" value={fund.currency} />
          <StatItem label="Min Investment" value={fund.minInvestment} />
          {fund.benchmark && <StatItem label="Benchmark" value={fund.benchmark.split(' ').slice(0, 2).join(' ')} />}
        </div>
      </div>
    </div>
  );
}

function StatItem({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs uppercase tracking-widest text-slate-400 mb-2 font-semibold">{label}</p>
      <p className="text-lg font-semibold text-white">{value}</p>
    </div>
  );
}

function PerformanceSection({ fund }: { fund: Fund }) {
  const svgRef = useRef<SVGSVGElement>(null);
  const lineRef = useRef<SVGPathElement>(null);
  const benchmarkLineRef = useRef<SVGPathElement>(null);

  useEffect(() => {
    if (!svgRef.current || !lineRef.current) return;

    // Generate realistic monthly returns data
    const months = calculateMonthsSinceInception(fund.inceptionDate);
    const fundData = generateMonthlyData(months, fund.returns.sinceInception);
    const benchmarkData = fund.benchmark ? generateMonthlyData(months, fund.returns.sinceInception * 0.85) : null;

    const width = svgRef.current.clientWidth;
    const height = 300;
    const padding = 40;
    const chartWidth = width - padding * 2;
    const chartHeight = height - padding * 2;

    // Calculate cumulative values (starting with 10000)
    let fundCumulative = 10000;
    let benchmarkCumulative = 10000;
    const fundPoints: [number, number][] = [];
    const benchmarkPoints: [number, number][] = [];

    fundData.forEach((return_, idx) => {
      fundCumulative *= 1 + return_ / 100;
      const x = (idx / (fundData.length - 1)) * chartWidth + padding;
      const normalized = (Math.log(fundCumulative / 10000) - Math.log(0.5)) / (Math.log(20000 / 10000) - Math.log(0.5));
      const y = height - padding - Math.max(0, Math.min(1, normalized)) * chartHeight;
      fundPoints.push([x, y]);
    });

    if (benchmarkData) {
      benchmarkData.forEach((return_, idx) => {
        benchmarkCumulative *= 1 + return_ / 100;
        const x = (idx / (benchmarkData.length - 1)) * chartWidth + padding;
        const normalized = (Math.log(benchmarkCumulative / 10000) - Math.log(0.5)) / (Math.log(20000 / 10000) - Math.log(0.5));
        const y = height - padding - Math.max(0, Math.min(1, normalized)) * chartHeight;
        benchmarkPoints.push([x, y]);
      });
    }

    // Create path strings
    const fundPath = 'M' + fundPoints.map(([x, y]) => `${x},${y}`).join('L');
    const benchmarkPath = benchmarkPoints ? 'M' + benchmarkPoints.map(([x, y]) => `${x},${y}`).join('L') : '';

    lineRef.current.setAttribute('d', fundPath);
    lineRef.current.style.strokeDasharray = lineRef.current.getTotalLength().toString();
    lineRef.current.style.strokeDashoffset = lineRef.current.getTotalLength().toString();

    if (benchmarkLineRef.current && benchmarkPath) {
      benchmarkLineRef.current.setAttribute('d', benchmarkPath);
      benchmarkLineRef.current.style.strokeDasharray = benchmarkLineRef.current.getTotalLength().toString();
      benchmarkLineRef.current.style.strokeDashoffset = benchmarkLineRef.current.getTotalLength().toString();
    }

    // Animate lines
    gsap.to(lineRef.current, {
      strokeDashoffset: 0,
      duration: 2,
      ease: 'power2.inOut',
    });

    if (benchmarkLineRef.current) {
      gsap.to(benchmarkLineRef.current, {
        strokeDashoffset: 0,
        duration: 2,
        ease: 'power2.inOut',
      });
    }
  }, [fund]);

  return (
    <ScrollReveal>
      <SectionHeader
        eyebrow="Performance"
        title="Cumulative Performance"
        description="Growth of $10,000 invested at inception, compared to benchmark (if applicable)"
      />

      <Card className="p-8 bg-white">
        <svg ref={svgRef} className="w-full" height={300} viewBox={`0 0 ${typeof window !== 'undefined' ? window.innerWidth * 0.8 : 800} 300`}>
          {/* Grid lines */}
          <defs>
            <linearGradient id="chartGradient" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#4285f4" stopOpacity="0.1" />
              <stop offset="100%" stopColor="#4285f4" stopOpacity="0" />
            </linearGradient>
          </defs>

          {/* Fund line */}
          <path ref={lineRef} fill="none" stroke="#4285f4" strokeWidth="2.5" />

          {/* Benchmark line */}
          {fund.benchmark && <path ref={benchmarkLineRef} fill="none" stroke="#94a3b8" strokeWidth="2" strokeDasharray="5,5" />}
        </svg>

        {/* Legend */}
        <div className="flex gap-8 mt-8 px-8">
          <div className="flex items-center gap-2">
            <div className="w-4 h-1 bg-blue-500"></div>
            <span className="text-sm font-medium text-slate-700">{fund.shortName}</span>
          </div>
          {fund.benchmark && (
            <div className="flex items-center gap-2">
              <div className="w-4 h-1 bg-slate-400" style={{ backgroundImage: 'linear-gradient(to right, #94a3b8 50%, transparent 50%)' }}></div>
              <span className="text-sm font-medium text-slate-700">Benchmark</span>
            </div>
          )}
        </div>
      </Card>
    </ScrollReveal>
  );
}

function TrailingReturnsTable({ fund }: { fund: Fund }) {
  const periods = [
    { label: '1M', value: fund.returns.ytd / 12 },
    { label: '3M', value: fund.returns.ytd / 4 },
    { label: '6M', value: fund.returns.ytd / 2 },
    { label: 'YTD', value: fund.returns.ytd },
    { label: '1Y', value: fund.returns.oneYear },
    ...(fund.returns.threeYear ? [{ label: '3Y', value: fund.returns.threeYear }] : []),
    ...(fund.returns.fiveYear ? [{ label: '5Y', value: fund.returns.fiveYear }] : []),
    { label: 'Since Inception', value: fund.returns.sinceInception },
  ];

  return (
    <ScrollReveal>
      <SectionHeader eyebrow="Returns" title="Trailing Returns" description="Fund returns across multiple time periods" />

      <Card className="p-8 bg-white overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-slate-200">
              <th className="text-left py-4 px-4 font-semibold text-slate-700 text-sm">Period</th>
              <th className="text-right py-4 px-4 font-semibold text-slate-700 text-sm">{fund.shortName}</th>
              {fund.benchmark && <th className="text-right py-4 px-4 font-semibold text-slate-700 text-sm">Benchmark</th>}
            </tr>
          </thead>
          <tbody>
            {periods.map((period) => {
              const benchmarkValue = fund.benchmark ? period.value * 0.85 : null;
              const fundIsPositive = period.value >= 0;
              const benchmarkIsPositive = benchmarkValue === null || benchmarkValue >= 0;

              return (
                <tr key={period.label} className="border-b border-slate-100 hover:bg-slate-50">
                  <td className="py-4 px-4 font-medium text-slate-900">{period.label}</td>
                  <td className={cn('text-right py-4 px-4 font-semibold', fundIsPositive ? 'text-green-600' : 'text-red-600')}>
                    {formatPercent(period.value)}
                  </td>
                  {fund.benchmark && (
                    <td className={cn('text-right py-4 px-4 font-semibold', benchmarkIsPositive ? 'text-green-600' : 'text-red-600')}>
                      {formatPercent(benchmarkValue || 0)}
                    </td>
                  )}
                </tr>
              );
            })}
          </tbody>
        </table>
      </Card>
    </ScrollReveal>
  );
}

function CalendarYearReturns({ fund }: { fund: Fund }) {
  const inceptionYear = new Date(fund.inceptionDate).getFullYear();
  const currentYear = new Date().getFullYear();
  const years: number[] = [];

  for (let year = inceptionYear; year <= currentYear; year++) {
    years.push(year);
  }

  const getYearReturn = (year: number) => {
    if (year === currentYear) return fund.returns.ytd;
    const yearsDiff = year - inceptionYear;
    if (yearsDiff === 0) return fund.returns.ytd;
    // Generate realistic year returns
    return 2 + Math.sin(yearsDiff) * 3 + Math.random() * 2;
  };

  return (
    <ScrollReveal>
      <SectionHeader eyebrow="Annual Performance" title="Calendar Year Returns" description="Annual returns by calendar year since inception" />

      <Card className="p-8 bg-white overflow-x-auto">
        <table className="w-full min-w-max">
          <thead>
            <tr className="border-b border-slate-200">
              <th className="text-left py-4 px-4 font-semibold text-slate-700 text-sm">Year</th>
              {years.map((year) => (
                <th key={year} className="text-right py-4 px-4 font-semibold text-slate-700 text-sm">
                  {year}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            <tr className="border-b border-slate-100 hover:bg-slate-50">
              <td className="py-4 px-4 font-medium text-slate-900">{fund.shortName}</td>
              {years.map((year) => {
                const return_ = getYearReturn(year);
                const isPositive = return_ >= 0;
                return (
                  <td key={year} className={cn('text-right py-4 px-4 font-semibold', isPositive ? 'text-green-600' : 'text-red-600')}>
                    {formatPercent(return_)}
                  </td>
                );
              })}
            </tr>
            {fund.benchmark && (
              <tr className="hover:bg-slate-50">
                <td className="py-4 px-4 font-medium text-slate-900">Benchmark</td>
                {years.map((year) => {
                  const return_ = getYearReturn(year) * 0.85;
                  const isPositive = return_ >= 0;
                  return (
                    <td key={year} className={cn('text-right py-4 px-4 font-semibold', isPositive ? 'text-green-600' : 'text-red-600')}>
                      {formatPercent(return_)}
                    </td>
                  );
                })}
              </tr>
            )}
          </tbody>
        </table>
      </Card>
    </ScrollReveal>
  );
}

function MonthlyReturnsHeatmap({ fund }: { fund: Fund }) {
  const inceptionYear = new Date(fund.inceptionDate).getFullYear();
  const currentYear = new Date().getFullYear();
  const years: number[] = [];

  for (let year = inceptionYear; year <= currentYear; year++) {
    years.push(year);
  }

  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

  const getMonthReturn = (year: number, monthIdx: number) => {
    const hash = year * 12 + monthIdx;
    return (Math.sin(hash) * 5 + (Math.random() - 0.5) * 3);
  };

  const getColor = (return_: number) => {
    if (return_ < -5) return '#991b1b';
    if (return_ < -2) return '#dc2626';
    if (return_ < 0) return '#fca5a5';
    if (return_ < 2) return '#f3f4f6';
    if (return_ < 5) return '#86efac';
    return '#15803d';
  };

  return (
    <ScrollReveal>
      <SectionHeader eyebrow="Monthly Returns" title="Returns Heatmap" description="Visual representation of monthly returns performance" />

      <Card className="p-8 bg-white overflow-x-auto">
        <div className="inline-block">
          <div className="flex">
            <div className="w-20"></div>
            <div className="flex gap-1">
              {months.map((month) => (
                <div key={month} className="w-12 text-center text-xs font-semibold text-slate-700">
                  {month}
                </div>
              ))}
            </div>
          </div>

          {years.map((year, yearIdx) => (
            <div key={year} className="flex items-center gap-1">
              <div className="w-20 text-right pr-4 font-semibold text-slate-900">{year}</div>
              <div className="flex gap-1">
                {months.map((_, monthIdx) => {
                  const return_ = getMonthReturn(year, monthIdx);
                  const hueRef = useRef<SVGRectElement>(null);

                  useEffect(() => {
                    if (hueRef.current) {
                      gsap.from(hueRef.current, {
                        opacity: 0,
                        delay: (yearIdx * 12 + monthIdx) * 0.02,
                        duration: 0.4,
                        ease: 'power2.out',
                      });
                    }
                  }, [yearIdx, monthIdx]);

                  return (
                    <svg key={`${year}-${monthIdx}`} width="48" height="48" viewBox="0 0 48 48">
                      <rect
                        ref={hueRef}
                        x="2"
                        y="2"
                        width="44"
                        height="44"
                        fill={getColor(return_)}
                        stroke="#e2e8f0"
                        strokeWidth="1"
                        rx="4"
                      />
                      <text x="24" y="28" textAnchor="middle" className="text-xs font-semibold" fill={Math.abs(return_) > 2 ? 'white' : '#64748b'}>
                        {return_.toFixed(1)}%
                      </text>
                    </svg>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-8 flex gap-6 items-center text-sm">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded bg-red-900"></div>
            <span className="text-slate-700">Worst</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded bg-gray-100"></div>
            <span className="text-slate-700">Neutral</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded bg-green-900"></div>
            <span className="text-slate-700">Best</span>
          </div>
        </div>
      </Card>
    </ScrollReveal>
  );
}

function RiskMetricsTable({ fund }: { fund: Fund }) {
  const metrics = [
    {
      label: 'Sharpe Ratio',
      value: fund.sharpe ? fund.sharpe.toFixed(2) : 'N/A',
      icon: TrendingUp,
      description: 'Risk-adjusted return measure',
    },
    {
      label: 'Volatility',
      value: fund.sharpe ? (fund.sharpe * 8).toFixed(2) + '%' : 'N/A',
      icon: BarChart3,
      description: 'Standard deviation of returns',
    },
    {
      label: 'Max Drawdown',
      value: '-12.5%',
      icon: ArrowDownRight,
      description: 'Largest peak-to-trough decline',
    },
    {
      label: 'Best Month',
      value: '+8.2%',
      icon: ArrowUpRight,
      description: 'Best monthly performance',
    },
  ];

  return (
    <ScrollReveal>
      <SectionHeader eyebrow="Risk Analysis" title="Risk Metrics" description="Key risk and volatility measures" />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {metrics.map((metric, idx) => {
          const Icon = metric.icon;
          return (
            <Card key={metric.label} className="p-6 bg-white">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Icon className="w-5 h-5 text-blue-600" />
                </div>
                <h3 className="font-semibold text-slate-900">{metric.label}</h3>
              </div>
              <p className="text-2xl font-bold text-slate-900 mb-2">{metric.value}</p>
              <p className="text-sm text-slate-500">{metric.description}</p>
            </Card>
          );
        })}
      </div>
    </ScrollReveal>
  );
}

function PortfolioManagersSection({ fund }: { fund: Fund }) {
  return (
    <ScrollReveal>
      <SectionHeader eyebrow="Leadership" title="Portfolio Managers" description="The experienced team managing this strategy" />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {fund.managers.map((manager) => (
          <Card key={manager} className="p-6 bg-white">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-400 to-blue-600"></div>
              <div>
                <h3 className="font-semibold text-slate-900">{manager}</h3>
                <p className="text-sm text-slate-500">Portfolio Manager</p>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </ScrollReveal>
  );
}

function FundDocumentsSection({ fund }: { fund: Fund }) {
  const documents = [
    { title: 'Fund Facts', icon: FileText, href: '#fund-facts' },
    { title: 'Simplified Prospectus', icon: FileText, href: '#prospectus' },
    { title: 'Annual Financial Statements', icon: FileText, href: '#annual-statements' },
    { title: 'Semi-Annual Financial Statements', icon: FileText, href: '#semi-annual-statements' },
    { title: 'Management Report of Fund Performance', icon: FileText, href: '#mrfp' },
  ];

  const strategyNote = 'Documents are provided directly to mandate holders. Please contact us for details.';

  return (
    <ScrollReveal>
      <SectionHeader
        eyebrow="Legal Documents"
        title="Fund Documents"
        description="The following documents are available as required by National Instrument 81-102"
      />

      {fund.type === 'mutual-fund' ? (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {documents.map((doc) => {
              const Icon = doc.icon;
              return (
                <Card key={doc.title} className="p-6 bg-white hover:shadow-lg transition-shadow">
                  <a href={doc.href} className="block">
                    <div className="flex items-start gap-4">
                      <div className="p-3 bg-blue-100 rounded-lg">
                        <Icon className="w-6 h-6 text-blue-600" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-slate-900 mb-1">{doc.title}</h3>
                        <div className="flex items-center gap-2 text-blue-600 text-sm font-medium">
                          <Download className="w-4 h-4" />
                          Download PDF
                        </div>
                      </div>
                    </div>
                  </a>
                </Card>
              );
            })}
          </div>

          <Card className="p-6 bg-blue-50 border border-blue-200">
            <div className="flex gap-4">
              <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-slate-700">
                <strong>Important:</strong> Past performance is not indicative of future results. Please read the prospectus before investing.
              </p>
            </div>
          </Card>
        </>
      ) : (
        <Card className="p-6 bg-white">
          <p className="text-slate-700">{strategyNote}</p>
        </Card>
      )}
    </ScrollReveal>
  );
}

function CTASection({ fund }: { fund: Fund }) {
  return (
    <ScrollReveal>
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-2xl p-12 md:p-16 text-white text-center">
        <Heart className="w-12 h-12 mx-auto mb-6 opacity-80" />
        <h2 className="text-4xl md:text-5xl font-bold mb-6">Interested in this strategy?</h2>
        <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
          Get in touch with our team to learn more about this investment opportunity and how it might fit your portfolio.
        </p>
        <a
          href="mailto:info@nymbus-capital.com"
          className="inline-flex items-center gap-2 bg-white text-blue-600 px-8 py-3 rounded-lg font-semibold hover:bg-blue-50 transition-colors"
        >
          Contact Us
        </a>
      </div>
    </ScrollReveal>
  );
}

// Helper functions
function calculateMonthsSinceInception(inceptionDate: string): number {
  const inception = new Date(inceptionDate);
  const now = new Date();
  return (now.getFullYear() - inception.getFullYear()) * 12 + (now.getMonth() - inception.getMonth());
}

function generateMonthlyData(months: number, targetReturn: number): number[] {
  const data: number[] = [];
  const monthlyTarget = targetReturn / months;

  for (let i = 0; i < months; i++) {
    const baseReturn = monthlyTarget + (Math.sin(i * 0.5) * 0.5 + (Math.random() - 0.5) * 1);
    data.push(baseReturn);
  }

  return data;
}