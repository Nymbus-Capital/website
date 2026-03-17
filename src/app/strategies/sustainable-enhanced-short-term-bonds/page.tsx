'use client';

import FundDetailLayout from '@/components/FundDetailLayout';
import { ScrollReveal } from '@/components/animations/ScrollReveal';
import { Card } from '@/components/ui/Card';
import { Shield, Clock, TrendingUp, DollarSign } from 'lucide-react';
import { fundBySlug } from '@/data/funds';

const fund = fundBySlug('sustainable-enhanced-short-term-bonds')!;

function MonthlyIncomeSection() {
  return (
    <div className="mt-12 space-y-8">
      <ScrollReveal>
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-slate-900">Why Monthly Income?</h2>
          <p className="text-slate-500 mt-2">Designed for investors who value stability and regular cash flow</p>
        </div>
      </ScrollReveal>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          {
            icon: DollarSign,
            title: 'Monthly Distributions',
            description: 'Consistent monthly cash flow from a diversified portfolio of short-term bonds.',
          },
          {
            icon: Shield,
            title: 'Capital Preservation',
            description: 'Short duration portfolio with lower interest rate sensitivity and high credit quality.',
          },
          {
            icon: Clock,
            title: 'Low Duration Risk',
            description: 'Average portfolio duration of 2.4 years minimizes exposure to rate movements.',
          },
          {
            icon: TrendingUp,
            title: 'ESG Integration',
            description: 'Full ESG screening ensures alignment with sustainability principles without sacrificing returns.',
          },
        ].map((item, idx) => {
          const Icon = item.icon;
          return (
            <ScrollReveal key={item.title} delay={idx * 80}>
              <Card className="h-full">
                <div className="p-6">
                  <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center mb-4">
                    <Icon className="w-5 h-5 text-emerald-600" />
                  </div>
                  <h3 className="text-base font-bold text-slate-900 mb-2">{item.title}</h3>
                  <p className="text-slate-600 text-sm leading-relaxed">{item.description}</p>
                </div>
              </Card>
            </ScrollReveal>
          );
        })}
      </div>

      <ScrollReveal>
        <Card>
          <div className="p-6 md:p-8 bg-gradient-to-r from-emerald-50 to-slate-50 rounded-xl">
            <h3 className="text-lg font-bold text-slate-900 mb-3">Ideal For</h3>
            <p className="text-slate-600 leading-relaxed">
              The Monthly Income Fund is designed for investors seeking a low-volatility, income-generating solution that prioritizes capital preservation. Its short-duration profile makes it particularly suitable as a cash management tool, a core fixed income allocation for conservative portfolios, or a parking spot for capital awaiting deployment into longer-duration strategies.
            </p>
          </div>
        </Card>
      </ScrollReveal>
    </div>
  );
}

export default function MonthlyIncomePage() {
  return (
    <FundDetailLayout
      fund={fund}
      themeName="emerald"
      extraSections={<MonthlyIncomeSection />}
    />
  );
}