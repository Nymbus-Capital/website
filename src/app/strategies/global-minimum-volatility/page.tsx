'use client';

import FundDetailLayout from '@/components/FundDetailLayout';
import { ScrollReveal } from '@/components/animations/ScrollReveal';
import { Card } from '@/components/ui/Card';
import { Shield, TrendingUp, BarChart3 } from 'lucide-react';
import { fundBySlug } from '@/data/funds';

const fund = fundBySlug('global-minimum-volatility')!;

function VolatilityInsightsSection() {
  return (
    <div className="mt-12 space-y-8">
      <ScrollReveal>
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-slate-900">The Low Volatility Advantage</h2>
          <p className="text-slate-500 mt-2">Smoother returns, stronger compounding</p>
        </div>
      </ScrollReveal>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          {
            icon: Shield,
            title: 'Downside Protection',
            value: '38%',
            subtitle: 'Down Capture Ratio',
            description: 'Captures only 38% of benchmark declines, dramatically reducing drawdown risk during market sell-offs.',
          },
          {
            icon: TrendingUp,
            title: 'Upside Participation',
            value: '62%',
            subtitle: 'Up Capture Ratio',
            description: 'Participates in 62% of benchmark rallies while maintaining the asymmetric risk profile that drives superior compounding.',
          },
          {
            icon: BarChart3,
            title: 'Volatility Reduction',
            value: '~40%',
            subtitle: 'vs. MSCI World',
            description: 'The strategy targets 30-40% lower volatility than the MSCI World Index through quantitative minimum variance optimization.',
          },
        ].map((item, idx) => {
          const Icon = item.icon;
          return (
            <ScrollReveal key={item.title} delay={idx * 100}>
              <Card className="h-full">
                <div className="p-6">
                  <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center mb-4">
                    <Icon className="w-5 h-5 text-amber-600" />
                  </div>
                  <div className="text-3xl font-bold text-amber-600 mb-1">{item.value}</div>
                  <p className="text-xs text-slate-500 mb-3">{item.subtitle}</p>
                  <h3 className="text-base font-bold text-slate-900 mb-2">{item.title}</h3>
                  <p className="text-slate-600 text-sm leading-relaxed">{item.description}</p>
                </div>
              </Card>
            </ScrollReveal>
          );
        })}
      </div>

      {/* Strategy Components */}
      <ScrollReveal>
        <Card>
          <div className="p-6 md:p-8">
            <h3 className="text-lg font-bold text-slate-900 mb-6">Strategy Components</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {[
                {
                  title: 'Minimum Variance Equity Core',
                  weight: '42%',
                  description: 'Quantitatively optimized global equity portfolio targeting minimum portfolio variance through covariance matrix estimation and constrained optimization.',
                },
                {
                  title: 'Fixed Income Overlay',
                  weight: '25%',
                  description: 'Strategic allocation to high-quality fixed income to dampen portfolio volatility and provide a natural hedge against equity drawdowns.',
                },
                {
                  title: 'Currency Hedging Program',
                  weight: '12%',
                  description: 'Systematic hedging of foreign currency exposure to reduce uncompensated FX volatility in the global equity portfolio.',
                },
                {
                  title: 'Derivatives & Tail Risk',
                  weight: '11%',
                  description: 'Options-based strategies providing convex tail risk protection and systematic volatility selling to enhance risk-adjusted returns.',
                },
              ].map((component) => (
                <div key={component.title} className="p-4 bg-slate-50 rounded-xl">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-lg font-bold text-amber-600">{component.weight}</span>
                    <h4 className="font-semibold text-slate-900">{component.title}</h4>
                  </div>
                  <p className="text-sm text-slate-600 leading-relaxed">{component.description}</p>
                </div>
              ))}
            </div>
          </div>
        </Card>
      </ScrollReveal>

      <ScrollReveal>
        <Card>
          <div className="p-6 md:p-8 bg-gradient-to-r from-amber-50 to-slate-50 rounded-xl">
            <h3 className="text-lg font-bold text-slate-900 mb-3">Institutional Mandate</h3>
            <p className="text-slate-600 leading-relaxed">
              The Global Minimum Volatility strategy is available as a managed account for institutional investors with a minimum investment of $5,000,000 USD. The strategy is particularly suited for pension funds, endowments, and family offices seeking equity-like returns with meaningfully lower drawdown risk. Monthly liquidity and fully transparent reporting are standard features of all managed account mandates.
            </p>
          </div>
        </Card>
      </ScrollReveal>
    </div>
  );
}

export default function GlobalMinimumVolatilityPage() {
  return (
    <FundDetailLayout
      fund={fund}
      themeName="amber"
      extraSections={<VolatilityInsightsSection />}
    />
  );
}