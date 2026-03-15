'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, TrendingUp, Users, DollarSign } from 'lucide-react';
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
      description: 'Customized investment mandates designed specifically for institutional clients with dedicated portfolio management.',
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
      description: 'Sophisticated multi-strategy approach combining traditional allocations with managed futures for enhanced diversification.',
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
      description: 'Accessible investment vehicles for advisors and their clients seeking professional active management.',
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

  const funds = [
    { name: 'Sustainable Enhanced Bonds Fund', ldm: 'MUN 1234', contact: 'marc@nymbus.com' },
    { name: 'Sustainable Enhanced Short-Term Bonds Fund', ldm: 'MUN 1235', contact: 'xavier@nymbus.com' },
    { name: 'Multi-Strategy Fund', ldm: 'MUN 1236', contact: 'marc@nymbus.com' },
    { name: 'Global Minimum Volatility Fund', ldm: 'MUN 1237', contact: 'xavier@nymbus.com' }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900">
      {/* Hero Section */}
      <section className="px-6 py-20 md:px-12">
        <SectionHeader
          title="Solutions for Every Investor"
          description="Tailored investment strategies designed to meet diverse client needs"
        />
      </section>

      {/* Solutions Grid */}
      <section className="px-6 py-20 md:px-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-7xl mx-auto">
          {solutions.map((solution) => {
            const IconComponent = solution.icon;
            return (
              <Card key={solution.id} className="cursor-pointer" onClick={() => setExpandedSolution(expandedSolution === solution.id ? null : solution.id)}>
                <motion.div
                  initial={{ scale: 1 }}
                  whileHover={{ scale: 1.05 }}
                  className="mb-4"
                >
                  <motion.div
                    className="w-12 h-12 bg-gradient-to-br from-amber-400 to-orange-500 rounded-lg flex items-center justify-center"
                    animate={expandedSolution === solution.id ? { rotate: 360 } : { rotate: 0 }}
                    transition={{ duration: 0.5 }}
                  >
                    <IconComponent className="w-6 h-6 text-white" />
                  </motion.div>
                </motion.div>
                <h3 className="text-xl font-semibold text-white mb-1">{solution.title}</h3>
                <p className="text-sm text-amber-400 mb-3">{solution.subtitle}</p>
                <p className="text-gray-300 mb-4">{solution.description}</p>
                <AnimatePresence>
                  {expandedSolution === solution.id && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                    >
                      <ul className="space-y-2 mb-4">
                        {solution.features.map((feature) => (
                          <li key={feature} className="text-sm text-gray-300 flex items-center">
                            <span className="w-1.5 h-1.5 bg-amber-400 rounded-full mr-2" />
                            {feature}
                          </li>
                        ))}
                      </ul>
                      <Button variant="secondary" size="sm" href={`mailto:${solution.contact}`}>
                        <Mail className="w-4 h-4 mr-2" />
                        Contact Us
                      </Button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </Card>
            );
          })}
        </div>
      </section>

      {/* Available Funds */}
      <section className="px-6 py-20 md:px-12 bg-slate-800/50">
        <div className="max-w-4xl mx-auto">
          <SectionHeader
            title="Available Investment Vehicles"
            description="Access our strategies through mutual funds, ETFs, or segregated accounts"
          />
          <div className="mt-12 overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-700">
                  <th className="text-left py-4 px-6 text-sm font-semibold text-white">Fund Name</th>
                  <th className="text-left py-4 px-6 text-sm font-semibold text-white">LDM Code</th>
                  <th className="text-left py-4 px-6 text-sm font-semibold text-white">Contact</th>
                </tr>
              </thead>
              <tbody>
                {funds.map((fund, index) => (
                  <tr key={index} className="border-b border-slate-700 hover:bg-slate-700/30">
                    <td className="py-4 px-6 text-gray-300">{fund.name}</td>
                    <td className="py-4 px-6 text-amber-400">{fund.ldm}</td>
                    <td className="py-4 px-6">
                      <Button variant="secondary" size="sm" href={`mailto:${fund.contact}`}>
                        <Mail className="w-4 h-4 mr-1" />
                        Email
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="mt-8 p-6 bg-slate-700/30 rounded-lg border border-slate-600">
            <p className="text-gray-300 mb-4">Find our funds on major platforms:</p>
            <Button href="https://www.fundserv.com">
              View on Fundserv
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default SolutionsPage;
