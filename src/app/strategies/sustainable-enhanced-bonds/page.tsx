'use client';

import FundDetailLayout from '@/components/FundDetailLayout';
import { ScrollReveal } from '@/components/animations/ScrollReveal';
import { Card } from '@/components/ui/Card';
import { Leaf, Shield, Zap } from 'lucide-react';
import { fundBySlug } from '@/data/funds';

const fund = fundBySlug('sustainable-enhanced-bonds')!;

function ESGHighlightSection() {
  return (
    <div className="mt-12 space-y-8">
      <ScrollReveal>
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-slate-900">ESG Integration</h2>
          <p className="text-slate-500 mt-2">How sustainability shapes this fund</p>
        </div>
      </ScrollReveal>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          {
            icon: Shield,
            title: 'Exclusion Screening',
            description: 'Systematically excludes fossil fuel producers, tobacco companies, and controversial weapons manufacturers from the portfolio.',
          },
          {
            icon: Leaf,
            title: 'Green Bond Allocation',
            description: '8.5% of the portfolio is allocated to certified green bonds, funding environmental projects across Canada.',
          },
          {
            icon: Zap,
            title: 'ESG-Integrated Models',
            description: 'ESG scores are quantitatively embedded in our credit risk models, influencing security selection and portfolio construction.',
          },
        ].map((item, idx) => {
          const Icon = item.icon;
          return (
            <ScrollReveal key={item.title} delay={idx * 100}>
              <Card className="h-full">
                <div className="p-6">
                  <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center mb-4">
                    <Icon className="w-5 h-5 text-blue-600" />
                  </div>
                  <h3 className="text-lg font-bold text-slate-900 mb-2">{item.title}</h3>
                  <p className="text-slate-600 text-sm leading-relaxed">{item.description}</p>
                </div>
              </Card>
            </ScrollReveal>
          );
        })}
      </div>

      <ScrollReveal>
        <Card>
          <div className="p-6 md:p-8 bg-gradient-to-r from-blue-50 to-slate-50 rounded-xl">
            <h3 className="text-lg font-bold text-slate-900 mb-3">Partnership with Fondaction</h3>
            <p className="text-slate-600 leading-relaxed">
              This fund is managed in partnership with Fondaction, a leading Canadian investment fund focused on sustainable development. Our collaboration ensures the fund not only targets strong financial returns but also contributes meaningfully to environmental and social outcomes through rigorous ESG vetting of all holdings.
            </p>
          </div>
        </Card>
      </ScrollReveal>
    </div>
  );
}

export default function SustainableEnhancedBondsPage() {
  return (
    <FundDetailLayout
      fund={fund}
      themeName="blue"
      extraSections={<ESGHighlightSection />}
    />
  );
}