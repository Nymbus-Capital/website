'use client';

import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { ScrollReveal } from '@/components/animations/ScrollReveal';
import AnimatedCounter from '@/components/animations/AnimatedCounter';
import { formatPercent, cn } from '@/lib/utils';
import { funds } from '@/data/funds';
import { team } from '@/data/team';
import Link from 'next/link';
import {
  FileText,
  Download,
  Calendar,
  Shield,
  TrendingUp,
  Droplet,
  BarChart3,
  Lock,
} from 'lucide-react';

gsap.registerPlugin(ScrollTrigger);

interface PerformanceBar {
  period: string;
  return: number;
}

interface CalendarReturn {
  year: number;
  return: number;
}

interface Holding {
  name: string;
  sector: string;
  weight: number;
}

interface SectorExposure {
  sector: string;
  percentage: number;
  color: string;
}

interface DocumentCard {
  title: string;
  category: string;
  updated: string;
  icon: React.ReactNode;
}

export default function MonthlyIncomeFundPage() {
  const fund = funds.find((f) => f.slug === 'sustainable-enhanced-short-term-bonds');
  const barsRef = useRef<(HTMLDivElement | null)[]>([]);
  const chartsRef = useRef<(SVGRectElement | null)[]>([]);

  useEffect(() => {
    // Animate trailing returns bars
    barsRef.current.forEach((bar, index) => {
      if (bar) {
        gsap.fromTo(
          bar,
          { width: '0%' },
          {
            width: '100%',
            duration: 0.8,
            delay: index * 0.1,
            ease: 'power2.out',
            scrollTrigger: {
              trigger: bar.closest('[data-performance-section]'),
              start: 'top 80%',
              once: true,
            },
          }
        );
      }
    });

    // Animate calendar year chart bars
    chartsRef.current.forEach((rect, index) => {
      if (rect) {
        gsap.fromTo(
          rect,
          { scaleY: 0, transformOrigin: 'bottom' },
          {
            scaleY: 1,
            duration: 0.6,
            delay: index * 0.08,
            ease: 'back.out',
            scrollTrigger: {
              trigger: rect.closest('svg'),
              start: 'top 75%',
              once: true,
            },
          }
        );
      }
    });

    return () => {
      ScrollTrigger.getAll().forEach((trigger) => trigger.kill());
    };
  }, []);

  if (!fund) {
    return <div className="text-center py-20">Fund not found</div>;
  }

  // Find managers from team data
  const fundManagers = team.filter((member) =>
    fund.managers.includes(member.name)
  );

  const trailingReturns: PerformanceBar[] = [
    { period: '1M', return: 0.4 },
    { period: '3M', return: 0.7 },
    { period: '6M', return: 1.1 },
    { period: 'YTD', return: 1.8 },
    { period: '1Y', return: 5.2 },
    { period: '3Y', return: 3.1 },
    { period: 'SI', return: 3.8 },
  ];

  const calendarYearReturns: CalendarReturn[] = [
    { year: 2020, return: 3.2 },
    { year: 2021, return: 1.8 },
    { year: 2022, return: -2.1 },
    { year: 2023, return: 4.6 },
    { year: 2024, return: 2.9 },
    { year: 2025, return: 1.8 },
  ];

  const topHoldings: Holding[] = [
    { name: 'Sagicor Group Jamaica', sector: 'Insurance', weight: 14.6 },
    { name: 'Government of Canada Bonds (3Y)', sector: 'Government', weight: 11.2 },
    { name: 'RBC Short-Term Bond ETF', sector: 'Fixed Income', weight: 9.8 },
    { name: 'Bank of Nova Scotia', sector: 'Financials', weight: 8.3 },
    { name: 'Toronto-Dominion Bank', sector: 'Financials', weight: 7.9 },
    { name: 'Manulife Financial', sector: 'Insurance', weight: 7.2 },
    { name: 'Canadian Imperial Bank', sector: 'Financials', weight: 6.8 },
    { name: 'Great-West Lifeco', sector: 'Insurance', weight: 6.5 },
    { name: 'Sun Life Financial', sector: 'Insurance', weight: 5.9 },
    { name: 'Government of Canada Bonds (1Y)', sector: 'Government', weight: 4.8 },
  ];

  const sectorExposure: SectorExposure[] = [
    { sector: 'Insurance', percentage: 42.6, color: '#059669' },
    { sector: 'Government', percentage: 16.0, color: '#0891b2' },
    { sector: 'Financials', percentage: 23.0, color: '#10b981' },
    { sector: 'Fixed Income Funds', percentage: 9.8, color: '#14b8a6' },
    { sector: 'Other', percentage: 8.6, color: '#94a3b8' },
  ];

  const characteristics = [
    {
      icon: <Lock className="w-6 h-6 text-emerald-600" />,
      title: 'Low Duration',
      description:
        'Minimizes interest rate sensitivity while capturing yield opportunities in the Canadian bond market.',
    },
    {
      icon: <Droplet className="w-6 h-6 text-emerald-600" />,
      title: 'Monthly Distributions',
      description:
        'Consistent income stream designed to provide regular cash flow to investors seeking stability.',
    },
    {
      icon: <BarChart3 className="w-6 h-6 text-emerald-600" />,
      title: 'ESG Integrated',
      description:
        'Sustainability criteria embedded throughout the investment process for responsible returns.',
    },
    {
      icon: <TrendingUp className="w-6 h-6 text-emerald-600" />,
      title: 'Capital Preservation',
      description:
        'Focus on maintaining purchasing power while generating competitive risk-adjusted returns.',
    },
  ];

  const documents: DocumentCard[] = [
    {
      title: 'Fund Facts',
      category: 'Monthly Updated',
      updated: 'March 2026',
      icon: <FileText className="w-5 h-5" />,
    },
    {
      title: 'Prospectus',
      category: 'Legal Documentation',
      updated: 'January 2025',
      icon: <Shield className="w-5 h-5" />,
    },
    {
      title: 'Annual Report',
      category: 'Fiscal Year 2025',
      updated: 'Feb 2026',
      icon: <Calendar className="w-5 h-5" />,
    },
    {
      title: 'Semi-Annual Report',
      category: 'H1 2025',
      updated: 'August 2025',
      icon: <FileText className="w-5 h-5" />,
    },
    {
      title: 'Audited Financial Statements',
      category: 'Year-End 2025',
      updated: 'Feb 2026',
      icon: <Shield className="w-5 h-5" />,
    },
    {
      title: 'Tax Documents (T3/T5)',
      category: 'Tax Year 2025',
      updated: 'March 2026',
      icon: <Download className="w-5 h-5" />,
    },
  ];

  const maxCalendarReturn = Math.max(
    ...calendarYearReturns.map((c) => Math.abs(c.return))
  );

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Hero Section */}
      <div
        className={cn(
          'relative overflow-hidden bg-gradient-to-br from-emerald-600 via-teal-500 to-cyan-600 py-24 sm:py-32'
        )}
      >
        <div className="absolute inset-0 opacity-30">
          <div className="absolute top-0 right-0 w-96 h-96 bg-white rounded-full mix-blend-multiply filter blur-3xl opacity-20" />
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-emerald-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20" />
        </div>

        <div className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <Link href="/strategies" className="inline-block mb-6">
            <Button
              variant="ghost"
              size="sm"
              className="text-white hover:bg-white/10"
            >
              ← Back to Strategies
            </Button>
          </Link>

          <ScrollReveal direction="up">
            <div className="mb-8">
              <div className="flex items-center gap-3 flex-wrap mb-6">
                <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white">
                  {fund.name}
                </h1>
                <span className="bg-white/20 backdrop-blur-sm text-white px-4 py-1.5 rounded-full text-sm font-semibold border border-white/30">
                  {fund.assetClass}
                </span>
                <span className="bg-white/20 backdrop-blur-sm text-white px-4 py-1.5 rounded-full text-sm font-semibold border border-white/30">
                  CAD
                </span>
              </div>
              <p className="text-lg md:text-xl text-white/90 max-w-2xl">
                {fund.description}
              </p>
            </div>

            {/* Hero Stats Card */}
            <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl p-8 mt-12">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                <div>
                  <p className="text-white/70 text-sm font-medium mb-2">MER</p>
                  <p className="text-2xl md:text-3xl font-bold text-white">
                    {fund.mer || '—'}
                  </p>
                </div>
                <div>
                  <p className="text-white/70 text-sm font-medium mb-2">
                    Inception
                  </p>
                  <p className="text-2xl md:text-3xl font-bold text-white">
                    {new Date(fund.inceptionDate).getFullYear()}
                  </p>
                </div>
                <div>
                  <p className="text-white/70 text-sm font-medium mb-2">
                    Sharpe Ratio
                  </p>
                  <p className="text-2xl md:text-3xl font-bold text-white">
                    {fund.sharpe?.toFixed(2) || '—'}
                  </p>
                </div>
                <div>
                  <p className="text-white/70 text-sm font-medium mb-2">
                    Benchmark
                  </p>
                  <p className="text-base md:text-lg font-semibold text-white/90">
                    FTSE Canada Short-Term
                  </p>
                </div>
              </div>
            </div>
          </ScrollReveal>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        {/* Trailing Returns Performance */}
        <ScrollReveal direction="up" delay={0.1}>
          <div className="mb-20" data-performance-section>
            <SectionHeader
              title="Trailing Returns"
              description="Performance as of March 15, 2026"
            />
            <Card className="p-8 mt-8">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-7 gap-6">
                {trailingReturns.map((item, idx) => (
                  <div key={item.period} className="flex flex-col">
                    <span className="text-xs font-semibold text-slate-600 mb-3 uppercase tracking-wider">
                      {item.period}
                    </span>
                    <div className="flex-1 bg-slate-100 rounded-lg overflow-hidden h-24 relative">
                      <div
                        ref={(el) => {
                          barsRef.current[idx] = el;
                        }}
                        className={cn(
                          'h-full rounded-lg flex items-end justify-center pb-2 transition-all duration-300',
                          item.return >= 0
                            ? 'bg-gradient-to-t from-emerald-600 to-emerald-400'
                            : 'bg-gradient-to-t from-red-600 to-red-400'
                        )}
                        style={{ width: '0%' }}
                      >
                        <span className="text-white text-sm font-bold">
                          {formatPercent(item.return)}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        </ScrollReveal>

        {/* Calendar Year Returns */}
        <ScrollReveal direction="up" delay={0.15}>
          <div className="mb-20">
            <SectionHeader title="Calendar Year Returns" />
            <Card className="p-8 mt-8">
              <svg
                viewBox="0 0 600 300"
                className="w-full"
                style={{ minHeight: '300px' }}
              >
                {/* Grid lines */}
                {[0, 1, 2, 3, 4].map((i) => (
                  <line
                    key={`grid-${i}`}
                    x1="60"
                    y1={50 + i * 50}
                    x2="580"
                    y2={50 + i * 50}
                    stroke="#e2e8f0"
                    strokeWidth="1"
                  />
                ))}

                {/* Y-axis labels */}
                {['-5%', '-2.5%', '0%', '2.5%', '5%'].map((label, i) => (
                  <text
                    key={`label-${i}`}
                    x="50"
                    y={55 + i * 50}
                    textAnchor="end"
                    className="text-xs fill-slate-600"
                  >
                    {label}
                  </text>
                ))}

                {/* Bars */}
                {calendarYearReturns.map((item, idx) => {
                  const barWidth = 35;
                  const x = 80 + idx * 80;
                  const yBase = 150;
                  const height = (item.return / maxCalendarReturn) * 120;
                  const y = item.return >= 0 ? yBase - height : yBase;

                  return (
                    <g key={item.year}>
                      <rect
                        ref={(el) => {
                          chartsRef.current[idx] = el;
                        }}
                        x={x}
                        y={y}
                        width={barWidth}
                        height={Math.abs(height)}
                        fill={
                          item.return >= 0
                            ? '#059669'
                            : '#dc2626'
                        }
                        rx="4"
                        opacity="0.8"
                        className="hover:opacity-100 transition-opacity cursor-pointer"
                      />
                      <text
                        x={x + barWidth / 2}
                        y={yBase + 25}
                        textAnchor="middle"
                        className="text-sm font-semibold fill-slate-900"
                      >
                        {item.year}
                      </text>
                      <text
                        x={x + barWidth / 2}
                        y={item.return >= 0 ? y - 5 : y + Math.abs(height) + 15}
                        textAnchor="middle"
                        className={cn(
                          'text-xs font-bold',
                          item.return >= 0
                            ? 'fill-emerald-600'
                            : 'fill-red-600'
                        )}
                      >
                        {formatPercent(item.return)}
                      </text>
                    </g>
                  );
                })}
              </svg>
            </Card>
          </div>
        </ScrollReveal>

        {/* Top 10 Holdings */}
        <ScrollReveal direction="up" delay={0.2}>
          <div className="mb-20">
            <SectionHeader
              title="Top 10 Holdings"
              description="Insurance-focused portfolio emphasizing quality short-term fixed income"
            />
            <Card className="p-8 mt-8">
              <div className="space-y-6">
                {topHoldings.map((holding, idx) => (
                  <div
                    key={idx}
                    className="group hover:bg-slate-50 p-4 rounded-lg transition-colors"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <p className="font-semibold text-slate-900">
                          {holding.name}
                        </p>
                        <p className="text-sm text-slate-600">{holding.sector}</p>
                      </div>
                      <span className="font-bold text-emerald-600 text-lg">
                        {holding.weight.toFixed(1)}%
                      </span>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                      <div
                        className="bg-gradient-to-r from-emerald-500 to-teal-500 h-2 rounded-full transition-all duration-500 group-hover:shadow-lg"
                        style={{
                          width: `${Math.min(holding.weight * 2.5, 100)}%`,
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        </ScrollReveal>

        {/* Sector Exposure */}
        <ScrollReveal direction="up" delay={0.25}>
          <div className="mb-20">
            <SectionHeader
              title="Sector Exposure"
              description="Strategic allocation across diversified fixed income sectors"
            />
            <Card className="p-8 mt-8">
              <div className="space-y-5">
                {sectorExposure.map((item) => (
                  <div key={item.sector} className="group">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-semibold text-slate-900">
                        {item.sector}
                      </span>
                      <span className="font-bold text-slate-900">
                        {item.percentage}%
                      </span>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-3 overflow-hidden">
                      <div
                        className="h-3 rounded-full transition-all duration-500 group-hover:shadow-lg"
                        style={{
                          width: `${item.percentage * 2}px`,
                          backgroundColor: item.color,
                          opacity: 0.85,
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        </ScrollReveal>

        {/* Key Characteristics */}
        <ScrollReveal direction="up" delay={0.3}>
          <div className="mb-20">
            <SectionHeader title="Key Characteristics" />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
              {characteristics.map((char, idx) => (
                <Card
                  key={idx}
                  className="p-6 border-l-4 border-l-emerald-600 hover:shadow-lg transition-shadow duration-300"
                >
                  <div className="flex items-start gap-4">
                    <div className="mt-1">{char.icon}</div>
                    <div>
                      <h4 className="font-semibold text-slate-900 mb-2">
                        {char.title}
                      </h4>
                      <p className="text-sm text-slate-600">{char.description}</p>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        </ScrollReveal>

        {/* Management Team */}
        <ScrollReveal direction="up" delay={0.35}>
          <div className="mb-20">
            <SectionHeader title="Management Team" />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
              {fundManagers.map((manager) => (
                <Card
                  key={manager.name}
                  className="p-6 hover:shadow-lg transition-shadow duration-300"
                >
                  <div className="flex items-center gap-4">
                    <div
                      className="w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-lg"
                      style={{ backgroundColor: manager.color }}
                    >
                      {manager.initials}
                    </div>
                    <div>
                      <p className="font-semibold text-slate-900">
                        {manager.name}
                      </p>
                      <p className="text-sm text-slate-600">{manager.title}</p>
                      {manager.designations && (
                        <p className="text-xs text-slate-500 mt-1">
                          {manager.designations}
                        </p>
                      )}
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        </ScrollReveal>

        {/* Fund Documentation */}
        <ScrollReveal direction="up" delay={0.4}>
          <div className="mb-20">
            <div className="mb-8">
              <SectionHeader
                title="Fund Documentation & Reports"
                description="Access all regulatory filings, fund facts, and financial documents"
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {documents.map((doc, idx) => (
                <Card
                  key={idx}
                  className="p-6 border-l-4 border-l-emerald-600 hover:shadow-lg hover:-translate-y-1 transition-all duration-300 flex flex-col"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="text-emerald-600">{doc.icon}</div>
                    <span className="text-xs font-semibold text-emerald-600 bg-emerald-50 px-2 py-1 rounded">
                      PDF
                    </span>
                  </div>
                  <h4 className="font-semibold text-slate-900 mb-1">
                    {doc.title}
                  </h4>
                  <p className="text-xs text-slate-600 mb-3">{doc.category}</p>
                  <div className="mt-auto flex items-center justify-between pt-4 border-t border-slate-100">
                    <span className="text-xs text-slate-500">{doc.updated}</span>
                    <button className="text-emerald-600 hover:text-emerald-700 transition-colors">
                      <Download className="w-4 h-4" />
                    </button>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        </ScrollReveal>

        {/* CTA Section */}
        <ScrollReveal direction="up" delay={0.45}>
          <div className="relative overflow-hidden rounded-2xl p-12 bg-gradient-to-r from-emerald-600 to-teal-500">
            <div className="absolute inset-0 opacity-10">
              <div className="absolute top-0 right-0 w-64 h-64 bg-white rounded-full mix-blend-multiply filter blur-3xl" />
            </div>
            <div className="relative text-center">
              <h3 className="text-3xl md:text-4xl font-bold text-white mb-4">
                Ready to Invest?
              </h3>
              <p className="text-lg text-white/90 mb-8 max-w-2xl mx-auto">
                Discover how the Monthly Income Fund can help you generate consistent
                returns with capital preservation and ESG alignment.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button
                  size="lg"
                  className="bg-white text-emerald-600 hover:bg-slate-100 font-semibold"
                >
                  Open an Account
                </Button>
                <Button
                  size="lg"
                  variant="ghost"
                  className="border border-white text-white hover:bg-white/10"
                >
                  Contact Us
                </Button>
              </div>
            </div>
          </div>
        </ScrollReveal>
      </div>
    </div>
  );
}
