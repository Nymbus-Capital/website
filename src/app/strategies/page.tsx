'use client';

import { useRef, useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { TrendingUp, BarChart3, PieChart } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { ScrollReveal } from '@/components/animations/ScrollReveal';
import { cn } from '@/lib/utils';

gsap.registerPlugin(ScrollTrigger);

interface Fund {
  name: string;
  performance: { yTD: number; oneYear: number; sinceInception: number };
  sharpeRatio: number;
  downside: number;
  sparklineData: number[];
}

const funds: Record<string, Fund[]> = {
  'Fixed Income': [
    {
      name: 'Sustainable Enhanced Bonds Fund',
      performance: { yTD: 5.2, oneYear: 8.3, sinceInception: 7.1 },
      sharpeRatio: 1.23,
      downside: 2.8,
      sparklineData: [3, 3.5, 3.2, 4.1, 4.5, 5.2],
    },
    {
      name: 'Monthly Income Fund',
      performance: { yTD: 3.8, oneYear: 6.5, sinceInception: 5.9 },
      sharpeRatio: 1.45,
      downside: 1.9,
      sparklineData: [2.5, 2.8, 3.1, 3.4, 3.8, 3.8],
    },
  ],
  Alternatives: [
    {
      name: 'Hedged Strategies Fund',
      performance: { yTD: 7.2, oneYear: 9.8, sinceInception: 8.2 },
      sharpeRatio: 1.56,
      downside: 3.2,
      sparklineData: [4, 4.8, 5.5, 6.2, 7.2, 7.2],
    },
    {
      name: 'Volatility Arbitrage Fund',
      performance: { yTD: 6.5, oneYear: 8.9, sinceInception: 7.5 },
      sharpeRatio: 1.34,
      downside: 2.5,
      sparklineData: [3.5, 4.2, 5.0, 5.8, 6.5, 6.5],
    },
  ],
};

function DownsideVolatilityScatter() {
  return (
    <svg className="w-full h-64" viewBox="0 0 400 200" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="scatterGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#dbeafe" />
          <stop offset="100%" stopColor="#bfdbfe" />
        </linearGradient>
      </defs>
      <rect width="400" height="200" fill="url(#scatterGradient)" opacity="0.3" />
      <line x1="50" y1="180" x2="380" y2="180" stroke="#cbd5e1" strokeWidth="1" />
      <line x1="50" y1="180" x2="50" y2="20" stroke="#cbd5e1" strokeWidth="1" />
      <text x="20" y="190" fontSize="10" fill="#64748b">Volatility</text>
      <text x="360" y="15" fontSize="10" fill="#64748b">Return</text>
      {[
        { x: 80, y: 120 },
        { x: 120, y: 100 },
        { x: 160, y: 80 },
        { x: 200, y: 60 },
        { x: 240, y: 50 },
        { x: 280, y: 70 },
        { x: 320, y: 90 },
      ].map((point, idx) => (
        <g key={idx}>
          <circle
            cx={point.x}
            cy={point.y}
            r="5"
            fill="#2563eb"
            opacity="0.7"
            className="hover:opacity-100 transition-opacity cursor-pointer"
          />
          <circle cx={point.x} cy={point.y} r="8" fill="#2563eb" opacity="0.2" />
        </g>
      ))}
      <text x="200" y="195" fontSize="9" fill="#94a3b8" textAnchor="middle">
        Risk-Return Profile
      </text>
    </svg>
  );
}

function Sparkline({ data }: { data: number[] }) {
  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;
  const points = data
    .map((val, idx) => {
      const x = (idx / (data.length - 1)) * 80 + 10;
      const y = 30 - ((val - min) / range) * 25;
      return `${x},${y}`;
    })
    .join(' ');

  return (
    <svg className="w-full h-12" viewBox="0 0 100 40" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="fillGradient" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#2563eb" stopOpacity="0.3" />
          <stop offset="100%" stopColor="#2563eb" stopOpacity="0.05" />
        </linearGradient>
      </defs>
      <polyline points={points} fill="none" stroke="#2563eb" strokeWidth="1.5" />
      <polyline points={`10,30 ${points.split(' ').slice(1).join(' ')} 90,30`} fill="url(#fillGradient)" stroke="none" />
    </svg>
  );
}

function AnimatedProgressBar({ value, label }: { value: number; label: string }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (ref.current) {
      gsap.from(ref.current.querySelector('.progress-fill'), {
        width: 0,
        duration: 1,
        ease: 'power2.out',
        scrollTrigger: {
          trigger: ref.current,
          start: 'top 80%',
          toggleActions: 'play none none none',
        },
      });
    }
  }, []);

  return (
    <div ref={ref}>
      <div className="flex justify-between items-center mb-2">
        <p className="text-sm font-semibold text-slate-900">{label}</p>
        <p className="text-sm text-blue-600 font-bold">{value.toFixed(2)}%</p>
      </div>
      <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
        <div
          className="progress-fill bg-gradient-to-r from-blue-600 to-blue-400 h-full rounded-full"
          style={{ width: `${value}%` }}
        />
      </div>
    </div>
  );
}

function PerformanceComparisonSection() {
  const [assetClass, setAssetClass] = useState('Fixed Income');

  const selectedFunds = funds[assetClass];
  const avgPerformance = {
    yTD: selectedFunds.reduce((sum, f) => sum + f.performance.yTD, 0) / selectedFunds.length,
    oneYear: selectedFunds.reduce((sum, f) => sum + f.performance.oneYear, 0) / selectedFunds.length,
    sinceInception: selectedFunds.reduce((sum, f) => sum + f.performance.sinceInception, 0) / selectedFunds.length,
  };

  return (
    <section className="py-20 bg-slate-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <ScrollReveal>
          <SectionHeader
            eyebrow="Performance Analytics"
            title="Fund Performance Comparison"
            description="Compare our strategies across key performance metrics."
          />
        </ScrollReveal>

        <div className="mt-12">
          <div className="flex gap-3 mb-8">
            {Object.keys(funds).map((ac) => (
              <motion.button
                key={ac}
                onClick={() => setAssetClass(ac)}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className={cn(
                  'px-6 py-2 rounded-lg font-semibold transition-all',
                  assetClass === ac
                    ? 'bg-blue-600 text-white'
                    : 'bg-white text-slate-900 border border-slate-300 hover:border-blue-600'
                )}
              >
                {ac}
              </motion.button>
            ))}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            <ScrollReveal>
              <Card>
                <div className="p-6">
                  <h3 className="text-sm font-semibold text-slate-600 mb-4">Annual Return</h3>
                  <div className="space-y-4">
                    <AnimatedProgressBar value={avgPerformance.oneYear} label="Average 1Y Return" />
                  </div>
                </div>
              </Card>
            </ScrollReveal>
            <ScrollReveal>
              <Card>
                <div className="p-6">
                  <h3 className="text-sm font-semibold text-slate-600 mb-4">Risk Metrics</h3>
                  <p className="text-3xl font-bold text-blue-600">
                    {(selectedFunds.reduce((sum, f) => sum + f.sharpeRatio, 0) / selectedFunds.length).toFixed(2)}
                  </p>
                  <p className="text-sm text-slate-600 mt-2">Average Sharpe Ratio</p>
                </div>
              </Card>
            </ScrollReveal>
            <ScrollReveal>
              <Card>
                <div className="p-6">
                  <h3 className="text-sm font-semibold text-slate-600 mb-4">Downside Risk</h3>
                  <p className="text-3xl font-bold text-blue-600">
                    {(selectedFunds.reduce((sum, f) => sum + f.downside, 0) / selectedFunds.length).toFixed(2)}%
                  </p>
                  <p className="text-sm text-slate-600 mt-2">Average Downside Volatility</p>
                </div>
              </Card>
            </ScrollReveal>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {selectedFunds.map((fund) => (
              <ScrollReveal key={fund.name}>
                <Card>
                  <div className="p-8">
                    <h3 className="text-xl font-bold text-slate-900 mb-6">{fund.name}</h3>
                    <div className="mb-6">
                      <h4 className="text-sm font-semibold text-slate-600 mb-3">Performance</h4>
                      <Sparkline data={fund.sparklineData} />
                    </div>
                    <div className="grid grid-cols-3 gap-4 mb-6">
                      <div>
                        <p className="text-xs text-slate-600 mb-1">YTD</p>
                        <p className="text-lg font-bold text-blue-600">{fund.performance.yTD.toFixed(1)}%</p>
                      </div>
                      <div>
                        <p className="text-xs text-slate-600 mb-1">1Y</p>
                        <p className="text-lg font-bold text-blue-600">{fund.performance.oneYear.toFixed(1)}%</p>
                      </div>
                      <div>
                        <p className="text-xs text-slate-600 mb-1">SI</p>
                        <p className="text-lg font-bold text-blue-600">{fund.performance.sinceInception.toFixed(1)}%</p>
                      </div>
                    </div>
                    <div className="space-y-4 pt-4 border-t border-slate-200">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-slate-600">Sharpe Ratio</span>
                        <span className="font-bold text-slate-900">{fund.sharpeRatio.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-slate-600">Downside Vol</span>
                        <span className="font-bold text-slate-900">{fund.downside.toFixed(1)}%</span>
                      </div>
                    </div>
                  </div>
                </Card>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

export default function StrategiesPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="py-20 md:py-32 bg-gradient-to-br from-blue-600 to-blue-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <ScrollReveal>
            <div className="text-center text-white">
              <h1 className="text-5xl md:text-6xl font-bold mb-6">Investment Strategies</h1>
              <p className="text-xl text-blue-100 max-w-2xl mx-auto">
                Systematic, rule-based strategies designed to deliver consistent returns with controlled risk.
              </p>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* Risk-Return Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <ScrollReveal>
            <SectionHeader
              eyebrow="Portfolio Positioning"
              title="Risk-Return Profile"
              description="Our strategies are positioned across the efficient frontier to serve different investor objectives."
            />
          </ScrollReveal>
          <ScrollReveal>
            <Card className="mt-12">
              <div className="p-8">
                <DownsideVolatilityScatter />
              </div>
            </Card>
          </ScrollReveal>
        </div>
      </section>

      {/* Performance Comparison */}
      <PerformanceComparisonSection />

      {/* Key Characteristics */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <ScrollReveal>
            <SectionHeader
              eyebrow="Strategy Details"
              title="Key Characteristics"
              description="What sets our strategies apart from traditional investment approaches."
            />
          </ScrollReveal>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-16">
            {[
              {
                icon: TrendingUp,
                title: 'Systematic Process',
                description: 'Rule-based investment processes that remove emotion and ensure consistent execution.',
              },
              {
                icon: BarChart3,
                title: 'Quantitative Models',
                description: 'Advanced mathematical models that identify patterns and generate alpha across asset classes.',
              },
              {
                icon: PieChart,
                title: 'Diversification',
                description: 'Multi-factor exposure and dynamic rebalancing to optimize risk-adjusted returns.',
              },
            ].map((item, idx) => {
              const Icon = item.icon;
              return (
                <ScrollReveal key={item.title} delay={idx * 100}>
                  <Card>
                    <div className="p-8">
                      <Icon className="w-8 h-8 text-blue-600 mb-4" />
                      <h3 className="text-lg font-bold text-slate-900 mb-2">{item.title}</h3>
                      <p className="text-slate-600">{item.description}</p>
                    </div>
                  </Card>
                </ScrollReveal>
              );
            })}
          </div>
        </div>
      </section>
    </div>
  );
}