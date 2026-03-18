'use client';

import FundDetailLayout from '@/components/FundDetailLayout';
import { fundBySlug } from '@/data/funds';
import { Card } from '@/components/ui/Card';
import { ScrollReveal } from '@/components/animations/ScrollReveal';
import { Shield, TrendingDown, TrendingUp, Activity } from 'lucide-react';

export default function GlobalMinVolPage() {
  const fund = fundBySlug('global-minimum-volatility');
  if (!fund) return null;

  return (
    <FundDetailLayout
      fund={fund}
      extraSections={
        <section className="border-t border-slate-100 bg-white py-16 px-6">
          <div className="max-w-7xl mx-auto">
            <ScrollReveal>
              <div className="flex items-center gap-2 mb-8">
                <Shield className="w-5 h-5 text-blue-600" />
                <h3 className="text-xl font-bold text-slate-900">Low Volatility Advantage</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <Card className="p-6 border border-slate-200 text-center">
                  <TrendingDown className="w-8 h-8 text-green-600 mx-auto mb-3" />
                  <p className="text-3xl font-bold text-slate-900">38%</p>
                  <p className="text-sm text-slate-600 mt-1">Down Capture Ratio</p>
                  <p className="text-xs text-slate-500 mt-2">Captures only 38% of market declines</p>
                </Card>
                <Card className="p-6 border border-slate-200 text-center">
                  <TrendingUp className="w-8 h-8 text-blue-600 mx-auto mb-3" />
                  <p className="text-3xl font-bold text-slate-900">62%</p>
                  <p className="text-sm text-slate-600 mt-1">Up Capture Ratio</p>
                  <p className="text-xs text-slate-500 mt-2">Participates in 62% of market gains</p>
                </Card>
                <Card className="p-6 border border-slate-200 text-center">
                  <Activity className="w-8 h-8 text-amber-600 mx-auto mb-3" />
                  <p className="text-3xl font-bold text-slate-900">35%</p>
                  <p className="text-sm text-slate-600 mt-1">Volatility Reduction</p>
                  <p className="text-xs text-slate-500 mt-2">35% lower volatility than MSCI World</p>
                </Card>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {[
                  { title: 'Minimum Variance Optimization', desc: 'Quantitative portfolio construction targeting the lowest-risk combination of global equities.' },
                  { title: 'Fixed Income Overlay', desc: '25% allocation to investment-grade bonds to further dampen portfolio volatility.' },
                  { title: 'Currency Hedging', desc: 'Systematic hedging of non-CAD currency exposure to reduce FX-driven volatility.' },
                  { title: 'Derivatives Overlay', desc: 'Options-based strategies for tail risk protection and income enhancement.' },
                ].map((item) => (
                  <Card key={item.title} className="p-5 border border-slate-200">
                    <h4 className="font-semibold text-slate-900 text-sm mb-1">{item.title}</h4>
                    <p className="text-xs text-slate-600 leading-relaxed">{item.desc}</p>
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