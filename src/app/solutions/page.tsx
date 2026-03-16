'use client';

import { useState } from 'react';
import { TrendingUp, Users, DollarSign, Mail } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { ScrollReveal } from '@/components/animations/ScrollReveal';

const SolutionsPage = () => {
  const [expandedSolution, setExpandedSolution] = useState<string | null>('institutional');

  const solutions = [
    {
      id: 'institutional',
      title: 'Institutional Solutions',
      subtitle: 'Segregated Accounts',
      description:
        'Customized investment mandates designed specifically for institutional clients with dedicated portfolio management.',
      icon: TrendingUp,
      features: [
        'Personalized mandate agreements',
        'Dedicated portfolio managers',
        'Quarterly performance reviews',
        'Flexible fee structures'
      ],
      contact: 'marc@nymbus.com'
    },
    {
      id: 'family',
      title: 'Family Office Solutions',
      subtitle: 'Managed Futures Overlays',
      description:
        'Sophisticated multi-strategy approach combining traditional allocations with managed futures for enhanced diversification.',
      icon: Users,
      features: [
        'Diversified strategy mix',
        'Risk management overlays',
        'Tax optimization strategies',
        'Generational wealth planning'
      ],
      contact: 'xavier@nymbus.com'
    },
    {
      id: 'advisors',
      title: 'Advisor Solutions',
      subtitle: 'Mutual Funds & ETFs',
      description:
        'Accessible investment vehicles for advisors and their clients seeking professional active management.',
      icon: DollarSign,
      features: [
        'Multiple asset classes',
        'Flexible investment vehicles',
        'Advisor support tools',
        'Comprehensive reporting'
      ],
      contact: 'marc@nymbus.com'
    }
  ];

  const fundsData = [
    { name: 'Sustainable Enhanced Bonds Fund', ldm: 'MUN 1234', contact: 'marc@nymbus.com' },
    { name: 'Sustainable Enhanced Short-Term Bonds Fund', ldm: 'MUN 1235', contact: 'xavier@nymbus.com' },
    { name: 'Multi-Strategy Fund', ldm: 'MUN 1236', contact: 'marc@nymbus.com' },
    { name: 'Global Minimum Volatility Fund', ldm: 'MUN 1237', contact: 'xavier@nymbus.com' }
  ];

  return (
    <div className="min-h-screen bg-white">
      <section className="px-6 py-20 md:px-12">
        <div className="max-w-6xl mx-auto">
          <ScrollReveal direction="up">
            <SectionHeader
              eyebrow="Solutions"
              title="Solutions for Every Investor"
              description="Tailored investment strategies designed to meet diverse client needs"
            />
          </ScrollReveal>
        </div>
      </section>

      <section className="px-6 py-20 md:px-12 bg-slate-50">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-7xl mx-auto">
          {solutions.map((solution, index) => {
            const IconComponent = solution.icon;
            return (
              <ScrollReveal key={solution.id} direction="up" delay={0.1 * (index + 1)}>
                <Card
                  className="cursor-pointer transition-all duration-200 hover:shadow-lg"
                  onClick={() =>
                    setExpandedSolution(expandedSolution === solution.id ? null : solution.id)
                  }
                >
                  <div className="p-6">
                    <div className="mb-4 flex items-center justify-center">
                      <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                        <IconComponent className="w-6 h-6 text-blue-600" />
                      </div>
                    </div>
                    <h3 className="text-lg font-semibold text-slate-900 mb-1 text-center">
                      {solution.title}
                    </h3>
                    <p className="text-sm text-blue-600 mb-3 text-center font-medium">
                      {solution.subtitle}
                    </p>
                    <p className="text-slate-600 mb-4 text-center text-sm">{solution.description}</p>
                    {expandedSolution === solution.id && (
                      <div className="border-t border-slate-200 pt-4 mt-4">
                        <ul className="space-y-2 mb-4">
                          {solution.features.map((feature) => (
                            <li key={feature} className="text-sm text-slate-600 flex items-center">
                              <span className="w-1.5 h-1.5 bg-blue-600 rounded-full mr-2 flex-shrink-0" />
                              {feature}
                            </li>
                          ))}
                        </ul>
                        <Button
                          size="sm"
                          className="w-full"
                          onClick={(e) => {
                            e.stopPropagation();
                            window.location.href = `mailto:${solution.contact}`;
                          }}
                        >
                          <Mail className="w-4 h-4 mr-2" />
                          Contact Us
                        </Button>
                      </div>
                    )}
                  </div>
                </Card>
              </ScrollReveal>
            );
          })}
        </div>
      </section>

      <section className="px-6 py-20 md:px-12">
        <div className="max-w-4xl mx-auto">
          <ScrollReveal direction="up">
            <SectionHeader
              eyebrow="Vehicles"
              title="Available Investment Vehicles"
              description="Access our strategies through mutual funds, ETFs, or segregated accounts"
            />
          </ScrollReveal>
          <div className="mt-12 overflow-x-auto">
            <Card className="overflow-hidden">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50">
                    <th className="text-left py-4 px-6 text-sm font-semibold text-slate-900">
                      Fund Name
                    </th>
                    <th className="text-left py-4 px-6 text-sm font-semibold text-slate-900">
                      Code
                    </th>
                    <th className="text-left py-4 px-6 text-sm font-semibold text-slate-900">
                      Contact
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {fundsData.map((fund, index) => (
                    <tr key={index} className="border-b border-slate-100 hover:bg-slate-50">
                      <td className="py-4 px-6 text-slate-700 text-sm">{fund.name}</td>
                      <td className="py-4 px-6 text-blue-600 font-medium text-sm">{fund.ldm}</td>
                      <td className="py-4 px-6">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => (window.location.href = `mailto:${fund.contact}`)}
                        >
                          <Mail className="w-4 h-4 mr-1" />
                          Email
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </Card>
          </div>
          <div className="mt-8 p-6 bg-slate-50 rounded-lg border border-slate-200">
            <p className="text-slate-600 mb-4 text-sm">Find our funds on major platforms:</p>
            <Button href="https://www.fundserv.com">View on Fundserv</Button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default SolutionsPage;