'use client';

import { motion } from 'framer-motion';
import { CheckCircle, Leaf, Droplets, Users } from 'lucide-react';
import SectionHeader from '@/components/ui/SectionHeader';
import ScrollReveal from '@/components/animations/ScrollReveal';
import AnimatedCounter from '@/components/animations/AnimatedCounter';

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
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900">
      {/* Hero Section */}
      <section className="px-6 py-20 md:px-12">
        <SectionHeader
          title="Sustainability & ESG"
          subtitle="Integrating environmental, social, and governance principles into our investment process"
        />
      </section>

      {/* ESG Framework */}
      <section className="px-6 py-20 md:px-12">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-white mb-12 text-center">Our ESG Integration Framework</h2>
          
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
                description: 'Active incorporation of ESG metrics into portfolio construction and risk management'
              },
              {
                step: '03',
                title: 'Monitoring',
                description: 'Continuous tracking of ESG performance and engagement with portfolio companies'
              }
            ].map((item, index) => (
              <ScrollReveal key={index}>
                <div className="relative">
                  <div className="text-5xl font-bold text-amber-400/20 mb-4">{item.step}</div>
                  <h3 className="text-xl font-semibold text-white mb-3">{item.title}</h3>
                  <p className="text-gray-300">{item.description}</p>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* Impact Metrics */}
      <section className="px-6 py-20 md:px-12 bg-slate-800/50">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-white mb-12 text-center">Our Impact</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {impactMetrics.map((metric, index) => {
              const IconComponent = metric.icon;
              return (
                <ScrollReveal key={index}>
                  <div className="bg-slate-800 rounded-lg p-8 border border-slate-700">
                    <div className="flex items-center justify-between mb-6">
                      <h3 className="text-lg font-semibold text-white">{metric.title}</h3>
                      <IconComponent className="w-6 h-6 text-amber-400" />
                    </div>
                    
                    <div className="space-y-6">
                      <div>
                        <p className="text-sm text-gray-400 mb-2">Nymbus Funds</p>
                        <p className="text-3xl font-bold text-amber-400">
                          <AnimatedCounter value={metric.nymbus} />
                        </p>
                        <p className="text-xs text-gray-500 mt-1">{metric.unit}</p>
                      </div>
                      
                      <div className="border-t border-slate-700 pt-6">
                        <p className="text-sm text-gray-400 mb-2">Benchmark Average</p>
                        <p className="text-2xl font-semibold text-gray-400">
                          <AnimatedCounter value={metric.benchmark} />
                        </p>
                        <p className="text-xs text-gray-500 mt-1">{metric.unit}</p>
                      </div>
                      
                      <motion.div
                        className="bg-gradient-to-r from-amber-400/20 to-orange-500/20 rounded-lg p-4 border border-amber-400/30"
                        initial={{ scale: 0.9 }}
                        whileInView={{ scale: 1 }}
                        transition={{ delay: 0.2 }}
                      >
                        <p className="text-sm font-semibold text-amber-300">{metric.improvement}% better</p>
                      </motion.div>
                    </div>
                  </div>
                </ScrollReveal>
              );
            })}
          </div>
        </div>
      </section>

      {/* Commitments */}
      <section className="px-6 py-20 md:px-12">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-3xl font-bold text-white mb-12 text-center">Our Commitments</h2>
          
          <div className="space-y-4">
            {commitments.map((commitment, index) => (
              <motion.div
                key={index}
                className="flex items-center p-4 bg-slate-800/50 rounded-lg border border-slate-700"
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <CheckCircle className="w-6 h-6 text-amber-400 mr-4 flex-shrink-0" />
                <span className="text-gray-300">{commitment}</span>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Stakeholder Engagement */}
      <section className="px-6 py-20 md:px-12 bg-slate-800/50">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-white mb-6">Stakeholder Engagement</h2>
          <p className="text-gray-300 text-lg mb-8">
            We actively engage with portfolio companies, regulators, and stakeholders to promote sustainable business practices and drive meaningful environmental and social impact.
          </p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {['TCFD', 'SASB', 'PRI Signatory', 'ISO 14001'].map((cert, index) => (
              <div key={index} className="bg-slate-700/50 rounded-lg p-4 border border-slate-600">
                <p className="text-sm font-semibold text-amber-400">{cert}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default SustainabilityPage;
