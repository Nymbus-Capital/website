'use client';

import { useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { ScrollReveal } from '@/components/animations/ScrollReveal';
import AnimatedCounter from '@/components/animations/AnimatedCounter';
import { formatPercent, cn } from '@/lib/utils';
import { funds } from '@/data/funds';
import { team } from '@/data/team';
import Link from 'next/link';
import { FileText, Download, Calendar, Shield, TrendingUp, Leaf } from 'lucide-react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

export default function SustainableEnhancedBondsPage() {
  const fund = funds.find((f) => f.slug === 'sustainable-enhanced-bonds');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!fund) {
    return <div className="text-center py-20">Fund not found</div>;
  }

  const trailingReturns = [
    { period: '1M', return: 0.8 },
    { period: '3M', return: 1.1 },
    { period: '6M', return: 1.4 },
    { period: 'YTD', return: 1.2 },
    { period: '1Y', return: 7.8 },
    { period: '3Y', return: 2.1 },
    { period: '5Y', return: 3.4 },
    { period: 'SI', return: 4.2 },
  ];

  const calendarYearReturns = [
    { year: 2019, return: 6.2 },
    { year: 2020, return: 9.1 },
    { year: 2021, return: -1.5 },
    { year: 2022, return: -11.2 },
    { year: 2023, return: 5.8 },
    { year: 2024, return: 2.3 },
    { year: 2025, return: 1.2 },
  ];

  const topHoldings = [
    { name: 'Government of Canada Bonds', sector: 'Government', weight: 28.5 },
    { name: 'Royal Bank of Canada', sector: 'Financials', weight: 8.2 },
    { name: 'Toronto-Dominion Bank', sector: 'Financials', weight: 7.1 },
    { name: 'Bank of Montreal', sector: 'Financials', weight: 6.3 },
    { name: 'Scotiabank', sector: 'Financials', weight: 5.8 },
    { name: 'Canadian Imperial Bank of Commerce', sector: 'Financials', weight: 5.4 },
    { name: 'Enbridge Inc.', sector: 'Energy', weight: 4.6 },
    { name: 'BCE Inc.', sector: 'Telecom', weight: 4.2 },
    { name: 'Fortis Inc.', sector: 'Utilities', weight: 3.8 },
    { name: 'Canadian National Railway', sector: 'Transportation', weight: 3.1 },
  ];

  const creditQuality = [
    { rating: 'AAA', percentage: 28.5, color: '#0066FF' },
    { rating: 'AA', percentage: 35.2, color: '#0084FF' },
    { rating: 'A', percentage: 22.1, color: '#2E9CFF' },
    { rating: 'BBB', percentage: 12.8, color: '#60B4FF' },
    { rating: 'Below BBB', percentage: 1.4, color: '#9BD4FF' },
  ];

  const sectorAllocation = [
    { name: 'Financials', percentage: 32.8 },
    { name: 'Government', percentage: 28.5 },
    { name: 'Energy', percentage: 12.3 },
    { name: 'Utilities', percentage: 9.6 },
    { name: 'Telecom', percentage: 8.2 },
    { name: 'Other', percentage: 8.6 },
  ];

  const documents = [
    { title: 'Fund Facts (Monthly)', date: 'March 2026', icon: FileText, badge: 'PDF' },
    { title: 'Prospectus', date: 'Updated Jan 2024', icon: Shield, badge: 'PDF' },
    { title: 'Annual Report 2025', date: 'December 2025', icon: Calendar, badge: 'PDF' },
    { title: 'Semi-Annual Report', date: 'September 2025', icon: Calendar, badge: 'PDF' },
    { title: 'Audited Financial Statements', date: 'December 2025', icon: FileText, badge: 'PDF' },
    { title: 'Tax Documents (T3/T5)', date: 'February 2026', icon: Download, badge: 'PDF' },
  ];

  const managers = fund.managers;

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <div className="relative overflow-hidden bg-gradient-to-br from-blue-600 via-blue-500 to-slate-900 pt-20 pb-32">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-10 w-72 h-72 bg-blue-300 rounded-full mix-blend-multiply filter blur-3xl" />
          <div className="absolute -bottom-20 right-10 w-72 h-72 bg-blue-400 rounded-full mix-blend-multiply filter blur-3xl" />
        </div>

        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <Link href="/strategies" className="inline-block mb-8">
            <Button variant="ghost" size="sm" className="text-white hover:bg-white/10">
              ← Back to Strategies
            </Button>
          </Link>

          <ScrollReveal direction="up">
            <div className="flex items-start justify-between mb-12">
              <div className="flex-1">
                <div className="flex items-center gap-4 mb-6">
                  <div className="bg-white/10 backdrop-blur-md p-3 rounded-lg">
                    <Leaf className="w-8 h-8 text-emerald-300" />
                  </div>
                  <div>
                    <h1 className="text-5xl md:text-6xl font-bold text-white mb-2">{fund.name}</h1>
                    <p className="text-blue-100 text-lg">ESG-compliant fixed income strategy</p>
                  </div>
                </div>
              </div>

              <div className="flex gap-3 mt-2">
                <span className="bg-blue-400 text-white px-4 py-2 rounded-full text-sm font-semibold">
                  {fund.assetClass}
                </span>
                <span className="bg-emerald-400 text-slate-900 px-4 py-2 rounded-full text-sm font-semibold">
                  Fossil-Free
                </span>
              </div>
            </div>

            <p className="text-blue-50 text-lg max-w-2xl mb-12">{fund.description}</p>

            {/* Frosted Glass Stats Card */}
            <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-8 grid grid-cols-2 md:grid-cols-4 gap-8">
              <div>
                <p className="text-blue-100 text-sm font-medium mb-2">Assets Under Management</p>
                <p className="text-3xl font-bold text-white">{fund.aum || '—'}</p>
              </div>
              <div>
                <p className="text-blue-100 text-sm font-medium mb-2">Management Expense Ratio</p>
                <p className="text-3xl font-bold text-white">{fund.mer || '—'}</p>
              </div>
              <div>
                <p className="text-blue-100 text-sm font-medium mb-2">Inception Year</p>
                <p className="text-3xl font-bold text-white">{new Date(fund.inceptionDate).getFullYear()}</p>
              </div>
              <div>
                <p className="text-blue-100 text-sm font-medium mb-2">Sharpe Ratio</p>
                <p className="text-3xl font-bold text-white">{fund.sharpe?.toFixed(2) || '—'}</p>
              </div>
            </div>
          </ScrollReveal>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        {/* Performance Section */}
        <ScrollReveal direction="up" delay={0.1}>
          <div className="mb-20">
            <SectionHeader title="Trailing Returns" description="Performance as of March 15, 2026" />
            <Card className="p-8 mt-8">
              <div className="space-y-6">
                {trailingReturns.map((item, index) => (
                  <TrailingReturnBar
                    key={item.period}
                    period={item.period}
                    value={item.return}
                    index={index}
                    mounted={mounted}
                  />
                ))}
              </div>
            </Card>
          </div>
        </ScrollReveal>

        {/* Calendar Year Returns Chart */}
        <ScrollReveal direction="up" delay={0.15}>
          <div className="mb-20">
            <SectionHeader title="Calendar Year Returns" description="Annual performance breakdown" />
            <Card className="p-8 mt-8">
              <CalendarYearChart data={calendarYearReturns} mounted={mounted} />
            </Card>
          </div>
        </ScrollReveal>

        {/* Top Holdings */}
        <ScrollReveal direction="up" delay={0.2}>
          <div className="mb-20">
            <SectionHeader title="Top 10 Holdings" description="Current portfolio composition" />
            <Card className="p-8 mt-8">
              <div className="space-y-5">
                {topHoldings.map((holding, index) => (
                  <TopHoldingBar key={index} holding={holding} index={index} mounted={mounted} />
                ))}
              </div>
            </Card>
          </div>
        </ScrollReveal>

        {/* Credit Quality & Sector Allocation */}
        <ScrollReveal direction="up" delay={0.25}>
          <div className="grid md:grid-cols-2 gap-8 mb-20">
            {/* Credit Quality - Stacked Bar */}
            <div>
              <SectionHeader title="Credit Quality Breakdown" description="Distribution by rating" />
              <Card className="p-8 mt-6">
                <div className="flex h-12 rounded-lg overflow-hidden gap-1 bg-slate-100">
                  {creditQuality.map((item) => (
                    <div
                      key={item.rating}
                      className="flex items-center justify-center text-white text-xs font-bold transition-all hover:opacity-75"
                      style={{
                        width: `${item.percentage}%`,
                        backgroundColor: item.color,
                      }}
                      title={`${item.rating}: ${item.percentage}%`}
                    >
                      {item.percentage > 8 && item.rating}
                    </div>
                  ))}
                </div>
                <div className="mt-6 grid grid-cols-2 gap-3 text-sm">
                  {creditQuality.map((item) => (
                    <div key={item.rating} className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded" style={{ backgroundColor: item.color }} />
                      <span className="text-slate-700">
                        {item.rating}: <span className="font-semibold">{item.percentage}%</span>
                      </span>
                    </div>
                  ))}
                </div>
              </Card>
            </div>

            {/* Sector Allocation - Donut Chart */}
            <div>
              <SectionHeader title="Sector Allocation" description="Portfolio breakdown by sector" />
              <Card className="p-8 mt-6 flex flex-col items-center">
                <SectorDonutChart data={sectorAllocation} mounted={mounted} />
              </Card>
            </div>
          </div>
        </ScrollReveal>

        {/* Management Team */}
        <ScrollReveal direction="up" delay={0.3}>
          <div className="mb-20">
            <SectionHeader title="Management Team" description="Fund managers and their expertise" />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
              {managers.map((managerName) => {
                const teamMember = team.find((t) => t.name === managerName);
                return (
                  <Card key={managerName} className="p-6 hover:shadow-lg transition-shadow">
                    <div className="flex items-start gap-4 mb-4">
                      <div
                        className={`w-12 h-12 rounded-lg flex items-center justify-center text-white font-bold text-lg`}
                        style={{ backgroundColor: teamMember?.color || '#0066FF' }}
                      >
                        {teamMember?.initials || managerName[0]}
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-slate-900 text-lg">{managerName}</h3>
                        <p className="text-slate-600 text-sm">{teamMember?.title || 'Portfolio Manager'}</p>
                      </div>
                    </div>
                    {teamMember?.designations && teamMember.designations.length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {teamMember.designations.map((designation) => (
                          <span
                            key={designation}
                            className="bg-blue-50 text-blue-700 text-xs font-medium px-2 py-1 rounded"
                          >
                            {designation}
                          </span>
                        ))}
                      </div>
                    )}
                  </Card>
                );
              })}
            </div>
          </div>
        </ScrollReveal>

        {/* Fund Documentation */}
        <ScrollReveal direction="up" delay={0.35}>
          <div className="mb-20">
            <SectionHeader title="Fund Documentation & Reports" description="Access important fund documents" />
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">
              {documents.map((doc, index) => {
                const IconComponent = doc.icon;
                return (
                  <Card
                    key={index}
                    className="p-6 border-l-4 border-l-blue-600 hover:shadow-lg hover:translate-y-[-4px] transition-all group"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="p-3 bg-blue-50 rounded-lg group-hover:bg-blue-100 transition-colors">
                        <IconComponent className="w-6 h-6 text-blue-600" />
                      </div>
                      <span className="bg-slate-200 text-slate-700 text-xs font-semibold px-2 py-1 rounded">
                        {doc.badge}
                      </span>
                    </div>
                    <h3 className="font-semibold text-slate-900 mb-1">{doc.title}</h3>
                    <p className="text-sm text-slate-600 mb-4">{doc.date}</p>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="w-full justify-center text-blue-600 hover:bg-blue-50"
                    >
                      <Download className="w-4 h-4 mr-2" />
                      Download
                    </Button>
                  </Card>
                );
              })}
            </div>
          </div>
        </ScrollReveal>

        {/* CTA Section */}
        <ScrollReveal direction="up" delay={0.4}>
          <div className="bg-gradient-to-r from-blue-600 to-blue-500 rounded-2xl p-12 text-center">
            <TrendingUp className="w-12 h-12 text-white mx-auto mb-4" />
            <h2 className="text-3xl font-bold text-white mb-3">Ready to Invest?</h2>
            <p className="text-blue-100 mb-6 max-w-xl mx-auto">
              Start building a sustainable fixed income portfolio aligned with your values.
            </p>
            <Button size="lg" className="bg-white text-blue-600 hover:bg-blue-50">
              Contact Our Team
            </Button>
          </div>
        </ScrollReveal>
      </div>
    </div>
  );
}

/* Trailing Return Bar Component */
function TrailingReturnBar({
  period,
  value,
  index,
  mounted,
}: {
  period: string;
  value: number;
  index: number;
  mounted: boolean;
}) {
  const barRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!mounted || !barRef.current) return;

    const bar = barRef.current.querySelector('.bar-fill') as HTMLElement;
    if (!bar) return;

    gsap.set(bar, { width: 0 });

    const trigger = ScrollTrigger.create({
      trigger: barRef.current,
      start: 'top 80%',
      onEnter: () => {
        gsap.to(bar, {
          width: `${Math.min(value * 15, 100)}%`,
          duration: 0.8,
          delay: index * 0.05,
          ease: 'power2.out',
        });
      },
    });

    return () => trigger.kill();
  }, [mounted, index, value]);

  return (
    <div ref={barRef} className="flex items-center gap-4">
      <div className="w-16 text-right">
        <p className="font-semibold text-slate-900">{period}</p>
      </div>
      <div className="flex-1">
        <div className="bg-slate-100 rounded-full h-3 overflow-hidden">
          <div
            className="bar-fill bg-gradient-to-r from-blue-500 to-blue-600 h-full rounded-full"
            style={{ width: 0 }}
          />
        </div>
      </div>
      <div className="w-20 text-right">
        <p className={cn('font-bold text-lg', value >= 0 ? 'text-green-600' : 'text-red-600')}>
          {formatPercent(value)}
        </p>
      </div>
    </div>
  );
}

/* Calendar Year Chart Component */
function CalendarYearChart({ data, mounted }: { data: any[]; mounted: boolean }) {
  const maxReturn = Math.max(...data.map((d) => Math.abs(d.return)));
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!mounted || !containerRef.current) return;

    const bars = containerRef.current.querySelectorAll('.chart-bar');
    gsap.set(bars, { height: 0 });

    const trigger = ScrollTrigger.create({
      trigger: containerRef.current,
      start: 'top 75%',
      onEnter: () => {
        bars.forEach((bar, index) => {
          gsap.to(bar, {
            height: (bar as HTMLElement).dataset.height || '0%',
            duration: 0.6,
            delay: index * 0.05,
            ease: 'back.out',
          });
        });
      },
    });

    return () => trigger.kill();
  }, [mounted]);

  return (
    <div ref={containerRef} className="flex items-flex-end justify-between gap-3 h-64">
      {data.map((item) => {
        const percentage = (Math.abs(item.return) / maxReturn) * 100;
        const isPositive = item.return >= 0;

        return (
          <div key={item.year} className="flex-1 flex flex-col items-center">
            <div className="flex-1 w-full flex items-flex-end justify-center mb-2 min-h-40">
              <div
                className="chart-bar w-full rounded-t-lg transition-colors hover:opacity-80"
                style={{
                  backgroundColor: isPositive ? '#10B981' : '#EF4444',
                  height: 0,
                }}
                data-height={`${percentage}%`}
                title={`${item.year}: ${item.return}%`}
              />
            </div>
            <div className="text-center">
              <p className="font-bold text-slate-900 mb-1">{item.year}</p>
              <p className={cn('text-sm font-semibold', isPositive ? 'text-green-600' : 'text-red-600')}>
                {formatPercent(item.return)}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
}

/* Top Holding Bar Component */
function TopHoldingBar({ holding, index, mounted }: { holding: any; index: number; mounted: boolean }) {
  const barRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!mounted || !barRef.current) return;

    const bar = barRef.current.querySelector('.holding-bar') as HTMLElement;
    if (!bar) return;

    gsap.set(bar, { width: 0 });

    const trigger = ScrollTrigger.create({
      trigger: barRef.current,
      start: 'top 80%',
      onEnter: () => {
        gsap.to(bar, {
          width: `${holding.weight}%`,
          duration: 0.8,
          delay: index * 0.03,
          ease: 'power2.out',
        });
      },
    });

    return () => trigger.kill();
  }, [mounted, index, holding.weight]);

  return (
    <div ref={barRef} className="space-y-2">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className="font-semibold text-slate-900">{holding.name}</p>
          <p className="text-xs text-slate-600">{holding.sector}</p>
        </div>
        <p className="font-bold text-slate-900 ml-4 w-12 text-right">{holding.weight.toFixed(1)}%</p>
      </div>
      <div className="bg-slate-100 rounded-full h-2 overflow-hidden">
        <div
          className="holding-bar bg-gradient-to-r from-blue-500 to-cyan-500 h-full rounded-full"
          style={{ width: 0 }}
        />
      </div>
    </div>
  );
}

/* Sector Donut Chart Component */
function SectorDonutChart({ data, mounted }: { data: any[]; mounted: boolean }) {
  const colors = ['#0066FF', '#0084FF', '#2E9CFF', '#60B4FF', '#9BD4FF', '#D1E7FF'];
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (!mounted || !svgRef.current) return;

    const circles = svgRef.current.querySelectorAll('circle.segment');
    circles.forEach((circle) => {
      const dashArray = (circle as SVGCircleElement).style.strokeDasharray;
      gsap.set(circle, { strokeDashoffset: dashArray ? dashArray.split(' ')[0] : 0 });
    });

    const trigger = ScrollTrigger.create({
      trigger: svgRef.current,
      start: 'top 75%',
      onEnter: () => {
        circles.forEach((circle, index) => {
          gsap.to(circle, {
            strokeDashoffset: 0,
            duration: 0.8,
            delay: index * 0.1,
            ease: 'power2.out',
          });
        });
      },
    });

    return () => trigger.kill();
  }, [mounted]);

  let cumulativePercentage = 0;
  const radius = 60;
  const circumference = 2 * Math.PI * radius;

  const segments = data.map((item, index) => {
    const startPercentage = cumulativePercentage;
    const endPercentage = cumulativePercentage + item.percentage;
    cumulativePercentage = endPercentage;

    const offset = (startPercentage / 100) * circumference;
    const dashArray = (item.percentage / 100) * circumference;

    return { ...item, offset, dashArray };
  });

  return (
    <div className="flex flex-col items-center gap-6">
      <svg ref={svgRef} viewBox="0 0 140 140" className="w-40 h-40">
        {segments.map((segment, index) => (
          <circle
            key={index}
            className="segment transition-all hover:opacity-75"
            cx="70"
            cy="70"
            r={radius}
            fill="none"
            stroke={colors[index % colors.length]}
            strokeWidth="20"
            strokeDasharray={`${segment.dashArray} ${circumference}`}
            strokeDashoffset={-segment.offset}
            strokeLinecap="round"
          />
        ))}
      </svg>
      <div className="grid grid-cols-2 gap-3 text-sm">
        {data.map((item, index) => (
          <div key={item.name} className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: colors[index % colors.length] }} />
            <span className="text-slate-700">
              {item.name}: <span className="font-semibold">{item.percentage}%</span>
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
