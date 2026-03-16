'use client';

import { CheckCircle, Leaf, Droplets, Users } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { ScrollReveal } from '@/components/animations/ScrollReveal';

const SustainabilityPage = () => {
  const impactMetrics = [
    {
      title: 'Carbon Intensity',
      unit: 'tons CO2/$M',
      nymbus: 14.1,
      benchmark: 116.2,
      improvement: 88,
      icon: Leaf
    },
    {
      title: 'Water Intensity',
      unit: 'm³/$M',
      nymbus: 28.4,
      benchmark: 92.7,
      improvement: 69,
      icon: Droplets
    },
    {
      title: 'Board Diversity',
      unit: '%',
      nymbus: 42.3,
      benchmark: 35.8,
      improvement: 18,
      icon: Users
    }
  ];

  const commitments = [
    'Net-zero emissions target by 2050',
    'ESG integration in all investment decisions',
    'Transparent sustainability reporting',
    'Active engagement with portfolio companies',
    'Support for climate transition initiatives'
  ];

  return (
    <div className="min-h-screen bg-white">
      <section className="px-6 py-20 md:px-12">
        <div className="max-w-6xl mx-auto">
          <ScrollReveal direction="up">
            <SectionHeader
              eyebrow="Sustainability"
              title="Sustainability & ESG"
              description="Integrating environmental, social, and governance principles into our investment process"
            />
          </ScrollReveal>
        </div>
      </section>

      <section className="px-6 py-20 md:px-12 bg-slate-50">
        <div className="max-w-4xl mx-auto">
          <ScrollReveal direction="up">
            <h2 className="text-3xl font-bold text-slate-900 mb-12 text-center">Our ESG Integration Framework</h2>
          </ScrollReveal>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                step: '01',
                title: 'Assessment',
                description: 'Comprehensive evaluation of ESG factors across all potential investments'
              },
              {
                step: '02',
                title: 'Integration',
                description: 'Systematic incorporation of ESG insights into portfolio construction and risk management'
              },
              {
                step: '03',
                title: 'Engagement',
                description: 'Active dialogue with portfolio companies to drive sustainable business practices'
              },
            ].map((item, idx) => (
              <ScrollReveal key={idx} direction="up" delay={0.1 * (idx + 1)}>
                <Card className="p-8">
                  <div className="text-3xl font-bold text-blue-600 mb-4">{item.step}</div>
                  <h3 className="text-lg font-semibold text-slate-900 mb-3">{item.title}</h3>
                  <p className="text-slate-600">{item.description}</p>
                </Card>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      <section className="px-6 py-20 md:px-12">
        <div className="max-w-6xl mx-auto">
          <ScrollReveal direction="up">
            <h2 className="text-3xl font-bold text-slate-900 mb-12 text-center">Impact Metrics</h2>
          </ScrollReveal>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {impactMetrics.map((metric, idx) => {
              const IconComponent = metric.icon;
              return (
                <ScrollReveal key={idx} direction="up" delay={0.1 * (idx + 1)}>
                  <Card className="p-8">
                    <div className="flex items-center gap-3 mb-6">
                      <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                        <IconComponent className="w-6 h-6 text-blue-600" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-slate-900">{metric.title}</h3>
                        <p className="text-xs text-slate-500">{metric.unit}</p>
                      </div>
                    </div>
                    <div className="space-y-4">
                      <div>
                        <p className="text-xs text-slate-500 mb-1">Nymbus</p>
                        <p className="text-2xl font-bold text-blue-600">{metric.nymbus}</p>
                      </div>
                      <div>
                        <p className="text-xs text-slate-500 mb-1">Benchmark</p>
                        <p className="text-xl text-slate-600">{metric.benchmark}</p>
                      </div>
                      <div className="pt-4 border-t border-slate-200">
                        <p className="text-sm font-semibold text-green-600">+{metric.improvement}% Better</p>
                      </div>
                    </div>
                  </Card>
                </ScrollReveal>
              );
            })}
          </div>
        </div>
      </section>

      <section className="px-6 py-20 md:px-12 bg-slate-50">
        <div className="max-w-3xl mx-auto">
          <ScrollReveal direction="up">
            <SectionHeader
              eyebrow="Commitments"
              title="Our Sustainability Commitments"
              description="Advancing environmental and social progress through responsible investment"
            />
          </ScrollReveal>

          <ScrollReveal direction="up" delay={0.1}>
            <Card className="p-8 mt-8">
              <ul className="space-y-4">
                {commitments.map((commitment, idx) => (
                  <li key={idx} className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-1" />
                    <span className="text-slate-700">{commitment}</span>
                  </li>
                ))}
              </ul>
            </Card>
          </ScrollReveal>
        </div>
      </section>
    </div>
  );
};

export default SustainabilityPage;