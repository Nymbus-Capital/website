'use client';

import FundDetailLayout from '@/components/FundDetailLayout';
import { ScrollReveal } from '@/components/animations/ScrollReveal';
import { Card } from '@/components/ui/Card';
import AnimatedCounter from '@/components/animations/AnimatedCounter';
import { fundBySlug } from '@/data/funds';

const fund = fundBySlug('multi-strategy')!;

function SubStrategiesSection() {
  const subStrategies = [
    {
      name: 'Fixed Income Enhancement',
      weight: 35,
      description: 'Systematic credit strategies capturing risk premia in investment-grade and high-yield bonds through quantitative security selection.',
      color: '#7c3aed',
    },
    {
      name: 'Managed Futures (CTA)',
      weight: 22.5,
      description: 'Trend-following and momentum strategies across global futures markets including equities, fixed income, currencies, and commodities.',
      color: '#8b5cf6',
    },
    {
      name: 'Equity Market Neutral',
      weight: 15,
      description: 'Long/short equity strategies designed to generate alpha independent of market direction through factor-based selection.',
      color: '#a78bfa',
    },
    {
      name: 'Volatility Arbitrage',
      weight: 12.5,
      description: 'Strategies that capture the spread between implied and realized volatility across equity and fixed income derivatives.',
      color: '#c4b5fd',
    },
    {
      name: 'Dynamic Asset Allocation',
      weight: 10,
      description: 'Tactical allocation across asset classes based on quantitative regime detection and risk parity frameworks.',
      color: '#ddd6fe',
    },
  ];

  return (
    <div className="mt-12 space-y-8">
      <ScrollReveal>
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-slate-900">Sub-Strategy Breakdown</h2>
          <p className="text-slate-500 mt-2">Five complementary return engines working in concert</p>
        </div>
      </ScrollReveal>

      <div className="space-y-4">
        {subStrategies.map((strategy, idx) => (
          <ScrollReveal key={strategy.name} delay={idx * 80}>
            <Card>
              <div className="p-6">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0" style={{ backgroundColor: `${strategy.color}20` }}>
                    <span className="text-lg font-bold" style={{ color: strategy.color }}>{strategy.weight}%</span>
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-bold text-slate-900 mb-1">{strategy.name}</h3>
                    <p className="text-slate-600 text-sm leading-relaxed">{strategy.description}</p>
                  </div>
                </div>
              </div>
            </Card>
          </ScrollReveal>
        ))}
      </div>

      {/* Key Metrics */}
      <ScrollReveal>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-8">
          {[
            { label: 'Beta to S&P 500', value: 0.18, decimals: 2 },
            { label: 'Annualized Since Inception', value: 12.8, suffix: '%', decimals: 1 },
            { label: 'Down Capture Ratio', value: 12, suffix: '%', decimals: 0 },
            { label: 'Positive Months', value: 82, suffix: '%', decimals: 0 },
          ].map((stat) => (
            <Card key={stat.label}>
              <div className="p-6 text-center">
                <div className="text-3xl font-bold text-violet-600 mb-1">
                  <AnimatedCounter target={stat.value} suffix={stat.suffix || ''} decimals={stat.decimals} />
                </div>
                <p className="text-sm text-slate-500">{stat.label}</p>
              </div>
            </Card>
          ))}
        </div>
      </ScrollReveal>

      <ScrollReveal>
        <Card>
          <div className="p-6 md:p-8 bg-gradient-to-r from-violet-50 to-slate-50 rounded-xl">
            <h3 className="text-lg font-bold text-slate-900 mb-3">Institutional-Grade Alternatives, Accessible to All</h3>
            <p className="text-slate-600 leading-relaxed">
              The Multi-Strategy Fund brings hedge fund-caliber diversification to everyday investors. With a $1,000 minimum investment and daily liquidity, this fund democratizes access to alternative strategies that have historically been reserved for large institutional allocators. The fund has delivered positive returns in every calendar year since inception, including 2022 when global equities and bonds both declined significantly.
            </p>
          </div>
        </Card>
      </ScrollReveal>
    </div>
  );
}

export default function MultiStrategyPage() {
  return (
    <FundDetailLayout
      fund={fund}
      themeName="violet"
      extraSections={<SubStrategiesSection />}
    />
  );
}