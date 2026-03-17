'use client';

import { SectionHeader } from '@/components/ui/SectionHeader';
import { Card } from '@/components/ui/Card';
import { ScrollReveal } from '@/components/animations/ScrollReveal';
import AnimatedCounter from '@/components/animations/AnimatedCounter';
import { motion } from 'framer-motion';
import { CheckCircle, Leaf, Zap, Users, Award } from 'lucide-react';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.2,
      delayChildren: 0.3,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5 },
  },
};

export default function SustainabilityPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-[#FAFAFA] to-white">
      {/* Hero Section */}
      <section className="py-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <ScrollReveal direction="up">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-slate-900 mb-6 tracking-tight">
              Modernity Meets Responsibility
            </h1>
            <p className="text-lg md:text-xl text-slate-600 mb-8">
              We integrate environmental, social, and governance principles into every investment
              decision, believing that responsible investing and strong returns are complementary.
            </p>
          </ScrollReveal>
        </div>
      </section>

      {/* ESG Integration Process */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-6xl mx-auto">
          <ScrollReveal direction="up">
            <SectionHeader
              eyebrow="OUR APPROACH"
              title="ESG Integration Framework"
              description="A systematic three-step process embedded across all strategies"
            />
          </ScrollReveal>

          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.3 }}
            className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8"
          >
            {[
              {
                step: '01',
                title: 'Assessment',
                desc: 'Comprehensive ESG data collection and materiality analysis for each holding',
                icon: Zap,
              },
              {
                step: '02',
                title: 'Integration',
                desc: 'Incorporate ESG factors into valuation models and risk frameworks',
                icon: Leaf,
              },
              {
                step: '03',
                title: 'Monitoring',
                desc: 'Continuous evaluation and engagement with portfolio companies',
                icon: Award,
              },
            ].map((item, idx) => {
              const Icon = item.icon;
              return (
                <motion.div key={idx} variants={itemVariants}>
                  <Card className="h-full p-8 flex flex-col">
                    <div className="text-5xl font-bold text-blue-100 mb-4">{item.step}</div>
                    <Icon className="w-8 h-8 text-[#4285F4] mb-4" />
                    <h3 className="text-2xl font-bold text-slate-900 mb-3">{item.title}</h3>
                    <p className="text-slate-600 leading-relaxed flex-grow">{item.desc}</p>
                  </Card>
                </motion.div>
              );
            })}
          </motion.div>
        </div>
      </section>

      {/* Impact Metrics */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <ScrollReveal direction="up">
            <SectionHeader
              eyebrow="PORTFOLIO IMPACT"
              title="Measurable ESG Performance"
              description="Our portfolios demonstrate meaningful environmental and social improvements"
            />
          </ScrollReveal>

          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.3 }}
            className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8"
          >
            {[
              {
                label: 'Carbon Intensity',
                nymbus: 14.1,
                benchmark: 116.2,
                unit: 'tons CO₂/$M',
                improvement: '88%',
                desc: 'Lower carbon footprint vs benchmark',
              },
              {
                label: 'Water Intensity',
                nymbus: 28.4,
                benchmark: 92.7,
                unit: 'm³/$M',
                improvement: '69%',
                desc: 'Reduced water consumption intensity',
              },
              {
                label: 'Board Diversity',
                nymbus: 42.3,
                benchmark: 35.8,
                unit: '%',
                improvement: '+18%',
                desc: 'Higher female board representation',
              },
            ].map((metric, idx) => (
              <motion.div key={idx} variants={itemVariants}>
                <Card className="p-8">
                  <p className="text-sm font-semibold text-[#4285F4] uppercase tracking-wide mb-6">
                    {metric.label}
                  </p>

                  <div className="space-y-6">
                    {/* Nymbus vs Benchmark */}
                    <div className="space-y-3">
                      <div className="flex justify-between items-baseline">
                        <span className="text-sm text-slate-600">Nymbus</span>
                        <div className="text-right">
                          <AnimatedCounter
                            target={metric.nymbus}
                            suffix={` ${metric.unit}`}
                            duration={2}
                            className="text-2xl font-bold text-[#4285F4]"
                          />
                        </div>
                      </div>
                      <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          whileInView={{ width: '75%' }}
                          transition={{ duration: 1.5, delay: 0.2 }}
                          viewport={{ once: true }}
                          className="h-full bg-[#4285F4]"
                        />
                      </div>
                    </div>

                    <div className="space-y-3">
                      <div className="flex justify-between items-baseline">
                        <span className="text-sm text-slate-600">Benchmark</span>
                        <div className="text-right">
                          <AnimatedCounter
                            target={metric.benchmark}
                            suffix={` ${metric.unit}`}
                            duration={2}
                            className="text-2xl font-bold text-slate-400"
                          />
                        </div>
                      </div>
                      <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          whileInView={{ width: '100%' }}
                          transition={{ duration: 1.5, delay: 0.2 }}
                          viewport={{ once: true }}
                          className="h-full bg-slate-300"
                        />
                      </div>
                    </div>

                    {/* Improvement Badge */}
                    <div className="pt-4 border-t border-slate-100">
                      <p className="text-sm text-slate-600 mb-2">{metric.desc}</p>
                      <p className="text-lg font-bold text-green-600">{metric.improvement}</p>
                    </div>
                  </div>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Commitments */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-6xl mx-auto">
          <ScrollReveal direction="up">
            <SectionHeader
              eyebrow="COMMITMENTS"
              title="Industry Leadership"
              description="We are committed to the highest standards of responsible investing"
            />
          </ScrollReveal>

          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.3 }}
            className="mt-16 space-y-6"
          >
            {[
              {
                title: 'UN Principles for Responsible Investment (PRI) Signatory',
                desc: 'Committed to integrating ESG factors into investment decision-making and active ownership practices across all asset classes.',
              },
              {
                title: 'Tobacco-Free Finance Pledge',
                desc: 'We do not invest in companies whose primary revenue source is tobacco production or distribution.',
              },
              {
                title: 'Net-Zero Carbon Commitment',
                desc: 'Target 50% reduction in portfolio carbon intensity by 2030, with a path to net-zero by 2050.',
              },
              {
                title: 'Climate Action Engagement',
                desc: 'Active engagement with portfolio companies on climate risk disclosure, transition planning, and sustainability initiatives.',
              },
            ].map((commitment, idx) => (
              <motion.div
                key={idx}
                variants={itemVariants}
                className="flex gap-6 p-6 bg-slate-50 rounded-lg border border-slate-100 hover:border-[#4285F4] transition-colors duration-200"
              >
                <CheckCircle className="w-6 h-6 text-green-500 flex-shrink-0 mt-1" />
                <div>
                  <h3 className="font-bold text-slate-900 mb-2">{commitment.title}</h3>
                  <p className="text-slate-600 leading-relaxed">{commitment.desc}</p>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Stakeholder Engagement */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <ScrollReveal direction="up">
            <SectionHeader
              eyebrow="ENGAGEMENT"
              title="Active Ownership"
              description="We believe in constructive engagement with portfolio companies to drive positive change"
            />
          </ScrollReveal>

          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.3 }}
            className="mt-16 grid grid-cols-1 md:grid-cols-2 gap-8"
          >
            {[
              {
                title: 'Shareholder Voting',
                desc: 'We vote proxies with consideration for ESG factors and actively participate in shareholder proposals related to sustainability.',
              },
              {
                title: 'Issuer Engagement',
                desc: 'Direct dialogue with portfolio companies to encourage improved ESG practices and disclosure.',
              },
              {
                title: 'Industry Collaboration',
                desc: 'Participation in industry initiatives and collaborative engagement programs to raise ESG standards.',
              },
              {
                title: 'Investor Reporting',
                desc: 'Transparent ESG reporting to stakeholders on portfolio impact and progress toward sustainability goals.',
              },
            ].map((item, idx) => (
              <motion.div key={idx} variants={itemVariants}>
                <Card className="p-8 h-full">
                  <Users className="w-8 h-8 text-[#4285F4] mb-4" />
                  <h3 className="text-xl font-bold text-slate-900 mb-3">{item.title}</h3>
                  <p className="text-slate-600 leading-relaxed">{item.desc}</p>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-slate-900 to-slate-800">
        <div className="max-w-4xl mx-auto text-center">
          <ScrollReveal direction="up">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
              Invest with Purpose
            </h2>
            <p className="text-lg text-slate-300 mb-8">
              Learn how our ESG-integrated strategies can align your portfolio with your values
              while delivering competitive returns.
            </p>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              viewport={{ once: true }}
            >
              <a
                href="/contact"
                className="inline-block px-8 py-3 bg-[#4285F4] text-white font-semibold rounded-lg hover:bg-blue-600 transition-colors duration-200"
              >
                Contact Us
              </a>
            </motion.div>
          </ScrollReveal>
        </div>
      </section>
    </div>
  );
}