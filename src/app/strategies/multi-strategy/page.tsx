'use client';

import FundDetailLayout from '@/components/FundDetailLayout';
import { fundBySlug } from '@/data/funds';
import { Card } from '@/components/ui/Card';
import { ScrollReveal } from '@/components/animations/ScrollReveal';
import { Layers, TrendingUp, BarChart3, Activity, Zap } from 'lucide-react';

export default function MultiStrategyPage() {
  const fund = fundBySlug('multi-strategy');
  if (!fund) return null;

  const subStrategies = [
    { name: 'Fixed Income Enhancement', weight: 35, icon: TrendingUp, desc: 'Systematic credit selection and duration management across Canadian fixed income markets.' },
    { name: 'Managed Futures (CTA)', weight: 22.5, icon: BarChart3, desc: 'Trend-following and mean-reversion models across global futures markets.' },
    { name: 'Equity Market Neutral', weight: 15, icon: Activity, desc: 'Long/short equity pairs with zero net market exposure.' },
    { name: 'Volatility Arbitrage', weight: 12.5, icon: Zap, desc: 'Capturing the spread between implied and realized volatility.' },
    { name: 'Dynamic Asset Allocation', weight: 10, icon: Layers, desc: 'Regime-based tactical allocation across asset classes.' },
  ];

  return (
    <FundDetailLayout
      fund={fund}
      extraSections={
        <section className="border-t border-slate-100 bg-white py-16 px-6">
          <div className="max-w-7xl mx-auto">
            <ScrollReveal>
              <div className="flex items-center gap-2 mb-8">
                <Layers className="w-5 h-5 text-blue-600" />
                <h3 className="text-xl font-bold text-slate-900">Sub-Strategy Breakdown</h3>
              </div>
              <div className="space-y-3">
                {subStrategies.map((s) => (
                  <Card key={s.name} className="p-5 border border-slate-200">
                    <div className="flex items-start gap-4">
                      <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center flex-shrink-0">
                        <s.icon className="w-5 h-5 text-blue-600" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-1">
                          <h4 className="font-semibold text-slate-900 text-sm">{s.name}</h4>
                          <span className="text-sm font-bold text-blue-600">{s.weight}%</span>
                        </div>
                        <p className="text-xs text-slate-600">{s.desc}</p>
                        <div className="mt-2 bg-slate-100 rounded-full h-1.5">
                          <div className="bg-blue-500 h-full rounded-full" style={{ width: `${s.weight * 2.5}%` }} />
                        </div>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </ScrollReveal>
          </div>
        </section>
      }
    />
  );
}