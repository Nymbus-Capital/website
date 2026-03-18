'use client';

import FundDetailLayout from '@/components/FundDetailLayout';
import { fundBySlug } from '@/data/funds';
import { Card } from '@/components/ui/Card';
import { ScrollReveal } from '@/components/animations/ScrollReveal';
import { DollarSign, Shield, Clock, Leaf } from 'lucide-react';

export default function MonthlyIncomePage() {
  const fund = fundBySlug('sustainable-enhanced-short-term-bonds');
  if (!fund) return null;

  return (
    <FundDetailLayout
      fund={fund}
      extraSections={
        <section className="border-t border-slate-100 bg-white py-16 px-6">
          <div className="max-w-7xl mx-auto">
            <ScrollReveal>
              <div className="flex items-center gap-2 mb-8">
                <DollarSign className="w-5 h-5 text-blue-600" />
                <h3 className="text-xl font-bold text-slate-900">Monthly Income Advantages</h3>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                  { icon: DollarSign, title: 'Reliable Monthly Distributions', desc: 'Consistent monthly cash flow designed for income-oriented investors.' },
                  { icon: Shield, title: 'Capital Preservation', desc: 'Short-duration positioning minimizes interest rate sensitivity.' },
                  { icon: Clock, title: 'Low Duration Risk', desc: 'Average portfolio duration under 3 years for stability.' },
                  { icon: Leaf, title: 'ESG Integration', desc: 'Full ESG screening with sustainability overlay on all holdings.' },
                ].map((item) => (
                  <Card key={item.title} className="p-5 border border-slate-200">
                    <item.icon className="w-6 h-6 text-blue-600 mb-3" />
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