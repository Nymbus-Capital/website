'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { Card } from '@/components/ui/Card';
import { ScrollReveal } from '@/components/animations/ScrollReveal';
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

// Lightweight Charts performance component
function PerformanceChart() {
  const containerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<any>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const loadChart = async () => {
      const { createChart, ColorType, LineStyle, AreaSeries } = await import('lightweight-charts');

      if (chartRef.current) {
        chartRef.current.remove();
        chartRef.current = null;
      }

      const chart = createChart(containerRef.current!, {
        width: containerRef.current!.clientWidth,
        height: 400,
        layout: {
          background: { type: ColorType.Solid, color: '#ffffff' },
          textColor: '#64748b',
          fontFamily: "'Poppins', system-ui, sans-serif",
          fontSize: 11,
        },
        grid: {
          vertLines: { color: '#f1f5f9' },
          horzLines: { color: '#f1f5f9' },
        },
        rightPriceScale: { borderColor: '#e2e8f0' },
        timeScale: { borderColor: '#e2e8f0', timeVisible: false },
        crosshair: {
          vertLine: { color: '#94a3b8', width: 1, style: LineStyle.Dashed },
          horzLine: { color: '#94a3b8', width: 1, style: LineStyle.Dashed },
        },
      });
      chartRef.current = chart;

      // Benchmark
      const benchSeries = chart.addSeries(AreaSeries, {
        lineColor: '#94a3b8',
        topColor: 'rgba(148, 163, 184, 0.06)',
        bottomColor: 'rgba(148, 163, 184, 0)',
        lineWidth: 1,
        lineStyle: LineStyle.Dashed,
        priceFormat: { type: 'custom', formatter: (p: number) => '$' + p.toLocaleString() },
      });
      benchSeries.setData(performanceData.map(d => ({ time: d.time, value: d.benchmark })));

      // Fund
      const fundSeries = chart.addSeries(AreaSeries, {
        lineColor: '#0066FF',
        topColor: 'rgba(0, 102, 255, 0.12)',
        bottomColor: 'rgba(0, 102, 255, 0)',
        lineWidth: 2,
        priceFormat: { type: 'custom', formatter: (p: number) => '$' + p.toLocaleString() },
      });
      fundSeries.setData(performanceData.map(d => ({ time: d.time, value: d.fund })));

      chart.timeScale().fitContent();

      const ro = new ResizeObserver(() => {
        if (containerRef.current && chartRef.current) {
          chartRef.current.applyOptions({ width: containerRef.current.clientWidth });
        }
      });
      ro.observe(containerRef.current!);

      return () => ro.disconnect();
    };

    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        loadChart();
        observer.disconnect();
      }
    }, { threshold: 0.2 });
    observer.observe(containerRef.current);

    return () => {
      observer.disconnect();
      if (chartRef.current) { chartRef.current.remove(); chartRef.current = null; }
    };
  }, []);

  return <div ref={containerRef} className="w-full" style={{ height: 400 }} />;
}

// SVG Logo Components for institutional investors
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
    <div className="overflow-hidden py-8">
      <div className="flex overflow-x-hidden">
        <div className="flex gap-16 animate-marquee items-center">
          {[...logos, ...logos].map((logo, idx) => (
            <div key={idx} className="flex-shrink-0 flex items-center justify-center" style={{ minWidth: logo.w }}>
              <svg width={logo.w} height="40" viewBox={`0 0 ${logo.w} 40`}>
                <rect x="0" y="8" width={logo.w} height="24" rx="4" fill="#f1f5f9" />
                <text x={logo.w / 2} y="24" textAnchor="middle" fill="#475569" fontSize="11" fontWeight="600" fontFamily="Poppins, system-ui, sans-serif">
                  {logo.name}
                </text>
              </svg>
            </div>
          ))}
        </div>
      </div>
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
        <div className="absolute inset-0 bg-gradient-to-b from-slate-50/50 to-white pointer-events-none" />
        <div className="max-w-3xl text-center relative z-10">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-blue-50 text-blue-600 rounded-full text-sm font-medium mb-8">
            <span className="w-2 h-2 rounded-full bg-blue-600 animate-pulse" />
            $1.5B+ Assets Under Management
          </div>
          <h1 className="text-5xl md:text-7xl font-bold text-slate-900 mb-6 leading-tight">
            Scientific<br />Investing
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
                  <AnimatedCounter target={300} suffix="+" duration={2000} />
                </div>
                <p className="text-sm text-slate-500 font-medium">Institutional Clients</p>
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
                  <AnimatedCounter target={12} suffix="+" duration={2000} />
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

      {/* Performance Chart - TradingView Lightweight Charts */}
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
                  <Card className="p-6 border border-slate-200 hover:border-blue-200 hover:shadow-md transition-all h-full">
                    <div className="flex items-center gap-2 mb-3">
                      <span className="px-2 py-0.5 bg-blue-50 text-blue-600 rounded text-xs font-semibold">{item.category}</span>
                      <span className="text-slate-400 text-xs flex items-center gap-1">
                        <Calendar className="w-3 h-3" /> {item.date}
                      </span>
                    </div>
                    <h3 className="text-base font-bold text-slate-900 mb-2 leading-snug">{item.title}</h3>
                    <p className="text-slate-600 text-sm leading-relaxed">{item.description}</p>
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
