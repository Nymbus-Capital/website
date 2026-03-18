'use client';

import FundDetailLayout from '@/components/FundDetailLayout';
import { fundBySlug } from '@/data/funds';
import { Card } from '@/components/ui/Card';
import { ScrollReveal } from '@/components/animations/ScrollReveal';
import { Leaf, Shield, Zap } from 'lucide-react';

export default function SustainableEnhancedBondsPage() {
  const fund = fundBySlug('sustainable-enhanced-bonds');
  if (!fund) return null;

  return (
    <FundDetailLayout
      fund={fund}
      extraSections={
        <section className="border-t border-slate-100 bg-white py-16 px-6">
          <div className="max-w-7xl mx-auto">
            <ScrollReveal>
              <div className="flex items-center gap-2 mb-8">
                <Leaf className="w-5 h-5 text-green-600" />
                <h3 className="text-xl font-bold text-slate-900">ESG Integration</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="p-6 border border-slate-200">
                  <Shield className="w-8 h-8 text-green-600 mb-3" />
                  <h4 className="font-semibold text-slate-900 mb-2">Exclusion Screening</h4>
                  <p className="text-sm text-slate-600">Systematic exclusion of fossil fuel producers, tobacco, controversial weapons, and companies with poor ESG track records.</p>
                </Card>
                <Card className="p-6 border border-slate-200">
                  <Leaf className="w-8 h-8 text-green-600 mb-3" />
                  <h4 className="font-semibold text-slate-900 mb-2">Green Bond Allocation</h4>
                  <p className="text-sm text-slate-600">Minimum 5% allocation to certified green bonds financing renewable energy, clean transport, and sustainable infrastructure projects.</p>
                </Card>
                <Card className="p-6 border border-slate-200">
                  <Zap className="w-8 h-8 text-green-600 mb-3" />
                  <h4 className="font-semibold text-slate-900 mb-2">Fondaction Partnership</h4>
                  <p className="text-sm text-slate-600">Strategic collaboration with Fondaction to advance ESG-forward fixed income investing and responsible capital allocation.</p>
                </Card>
              </div>
            </ScrollReveal>
          </div>
        </section>
      }
    />
  );
}