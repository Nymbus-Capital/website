'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Building2, Users, Briefcase, Shield, TrendingUp, BarChart3, Target, Clock, FileText, ArrowRight, CheckCircle2, PieChart, Wallet } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { ScrollReveal } from '@/components/animations/ScrollReveal';
import { cn } from '@/lib/utils';

interface Solution {
  id: string;
  title: string;
  subtitle: string;
  icon: React.ComponentType<{ className?: string }>;
  heroDescription: string;
  whyNymbus: string[];
  capabilities: { title: string; description: string; icon: React.ComponentType<{ className?: string }> }[];
  investmentApproach: string;
  keyMetrics: { label: string; value: string }[];
  suitableStrategies: string[];
  minimumInvestment: string;
  contactEmail: string;
}

const solutions: Solution[] = [
  {
    id: 'institutional',
    title: 'Institutional Investors',
    subtitle: 'Pension Funds, Endowments & Sovereign Wealth',
    icon: Building2,
    heroDescription: 'Nymbus Capital provides institutional investors with customized, research-driven mandates designed to meet specific return objectives, risk tolerances, and ESG requirements. Our systematic approach delivers transparent, repeatable results with full portfolio attribution.',
    whyNymbus: [
      'Dedicated portfolio management with customized investment policy statements',
      'Full transparency through systematic, rules-based investment processes',
      'Proprietary risk management framework with real-time monitoring',
      'UN PRI signatory with integrated ESG scoring and zero fossil fuel options',
      'Experienced team with backgrounds at CDPQ, Ontario Teachers\', National Bank',
    ],
    capabilities: [
      { title: 'Segregated Accounts', description: 'Fully customized mandates tailored to your investment policy, benchmark, and ESG criteria.', icon: Shield },
      { title: 'Liability-Driven Investing', description: 'Duration-matched fixed income strategies designed to align with pension liabilities and cash flow requirements.', icon: Target },
      { title: 'Overlay Management', description: 'Systematic overlay strategies to enhance returns on existing portfolios without disrupting your core allocations.', icon: BarChart3 },
      { title: 'Risk Reporting', description: 'Comprehensive attribution, factor analysis, and risk decomposition delivered quarterly with full transparency.', icon: FileText },
    ],
    investmentApproach: 'Our institutional mandates leverage proprietary quantitative models for fixed income security selection, duration management, and credit analysis. We integrate machine learning-based market regime classification to dynamically adjust positioning, while maintaining strict risk limits aligned with your investment policy statement.',
    keyMetrics: [
      { label: 'Typical Mandate Size', value: '$25M+' },
      { label: 'Reporting Frequency', value: 'Monthly/Quarterly' },
      { label: 'ESG Integration', value: 'Full' },
      { label: 'Customization', value: 'Complete' },
    ],
    suitableStrategies: ['Sustainable Enhanced Bonds', 'Short-Term Bonds', 'Multi-Strategy', 'Custom Mandates'],
    minimumInvestment: '$10,000,000',
    contactEmail: 'marc@nymbus.ca',
  },
  {
    id: 'family',
    title: 'Family Offices & Private Wealth',
    subtitle: 'Multi-Generational Wealth Preservation',
    icon: Users,
    heroDescription: 'For family offices seeking sophisticated, institutional-quality investment management with a personal touch. Our multi-strategy approach combines fixed income stability with alternative return sources, designed for capital preservation and long-term growth across generations.',
    whyNymbus: [
      'Institutional-quality systematic strategies accessible to family offices',
      'Multi-strategy diversification across fixed income, alternatives, and overlay strategies',
      'Tax-efficient structures and flexible mandate design',
      'Direct access to portfolio managers and quantitative research team',
      'Proven track record in capital preservation during volatile markets',
    ],
    capabilities: [
      { title: 'Multi-Strategy Access', description: 'Diversified exposure across systematic fixed income, managed futures, and quantitative equity strategies in a single relationship.', icon: PieChart },
      { title: 'Capital Preservation', description: 'Quantitative risk management designed to protect wealth through market cycles with disciplined drawdown controls.', icon: Shield },
      { title: 'Custom Allocations', description: 'Tailored portfolio construction aligned with family-specific objectives, time horizons, and values-based criteria.', icon: Target },
      { title: 'Transparent Reporting', description: 'Clear, jargon-free performance and risk reporting that makes complex strategies understandable for all stakeholders.', icon: FileText },
    ],
    investmentApproach: 'We combine our core systematic fixed income capabilities with managed futures and dynamic asset allocation to build diversified portfolios that generate stable returns with low correlation to public equity markets. Our quantitative risk framework ensures disciplined position sizing and proactive hedging.',
    keyMetrics: [
      { label: 'Typical Allocation', value: '$5M+' },
      { label: 'Strategy Access', value: 'Full Suite' },
      { label: 'Reporting', value: 'Monthly' },
      { label: 'Relationship', value: 'Direct PM Access' },
    ],
    suitableStrategies: ['Multi-Strategy Fund', 'Sustainable Enhanced Bonds', 'Global Minimum Volatility'],
    minimumInvestment: '$5,000,000',
    contactEmail: 'xavier@nymbus.ca',
  },
  {
    id: 'advisors',
    title: 'Advisors & Individual Investors',
    subtitle: 'Mutual Funds & Managed Solutions',
    icon: Briefcase,
    heroDescription: 'Access Nymbus Capital\'s institutional-grade systematic strategies through mutual funds available on major Canadian platforms. Our funds provide advisors and their clients with professional quantitative management, sustainable investing, and competitive fee structures.',
    whyNymbus: [
      'Institutional-quality systematic management in accessible mutual fund format',
      'Available on Fundserv and major Canadian dealer platforms',
      'Competitive management expense ratios starting at 0.55%',
      'Sustainable investment options with full ESG integration',
      'Consistent risk-adjusted performance across market cycles',
    ],
    capabilities: [
      { title: 'Mutual Funds', description: 'Daily-liquidity mutual funds offering access to our systematic fixed income and multi-strategy capabilities through Fundserv.', icon: Wallet },
      { title: 'Advisor Support', description: 'Dedicated advisor relations team with educational materials, model portfolios, and co-branded marketing support.', icon: Users },
      { title: 'Portfolio Integration', description: 'Strategies designed as portfolio building blocks \u2014 use as core fixed income, satellite alternatives, or risk reduction overlays.', icon: PieChart },
      { title: 'Performance Tracking', description: 'Monthly factsheets, quarterly commentaries, and on-demand performance data for client reviews.', icon: TrendingUp },
    ],
    investmentApproach: 'Our mutual funds employ the same systematic models and quantitative processes used in our institutional mandates, providing retail investors with professional-grade portfolio management. Each fund targets specific risk-return outcomes and is managed with full ESG integration.',
    keyMetrics: [
      { label: 'Minimum Investment', value: '$1,000' },
      { label: 'Liquidity', value: 'Daily' },
      { label: 'MER Range', value: '0.55% \u2013 1.85%' },
      { label: 'Platform', value: 'Fundserv' },
    ],
    suitableStrategies: ['Sustainable Enhanced Bonds', 'Short-Term Bonds', 'Multi-Strategy Fund'],
    minimumInvestment: '$1,000',
    contactEmail: 'marc@nymbus.ca',
  },
];

export default function SolutionsPage() {
  const [activeSolution, setActiveSolution] = useState<string>('institutional');
  const currentSolution = solutions.find(s => s.id === activeSolution) || solutions[0];

  return (
    <div className="min-h-screen bg-white">
      {/* Hero */}
      <section className="px-6 py-20 md:py-28 md:px-12">
        <div className="max-w-6xl mx-auto">
          <ScrollReveal>
            <SectionHeader
              eyebrow="Solutions"
              title="Investment Solutions for Every Mandate"
              description="From institutional pension funds to individual investors, we deliver systematic, research-driven strategies tailored to your objectives."
            />
          </ScrollReveal>
        </div>
      </section>

      {/* Solution Tabs */}
      <section className="px-6 md:px-12 bg-slate-50 border-y border-slate-100 sticky top-16 z-30">
        <div className="max-w-7xl mx-auto">
          <div className="flex overflow-x-auto">
            {solutions.map((solution) => {
              const Icon = solution.icon;
              return (
                <button
                  key={solution.id}
                  onClick={() => setActiveSolution(solution.id)}
                  className={cn(
                    "flex items-center gap-3 px-6 py-5 text-sm font-medium whitespace-nowrap border-b-2 transition-all duration-200 flex-1 justify-center",
                    activeSolution === solution.id
                      ? 'border-blue-600 text-blue-600 bg-white'
                      : 'border-transparent text-slate-500 hover:text-slate-900 hover:bg-white/50'
                  )}
                >
                  <Icon className="w-5 h-5" />
                  <span className="hidden sm:inline">{solution.title}</span>
                  <span className="sm:hidden">{solution.id === 'institutional' ? 'Institutional' : solution.id === 'family' ? 'Family Office' : 'Advisors'}</span>
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* Solution Detail */}
      <section className="px-6 py-16 md:px-12">
        <div className="max-w-7xl mx-auto">
          {/* Solution Header */}
          <ScrollReveal>
            <div className="max-w-3xl mb-16">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center">
                  <currentSolution.icon className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-slate-900">{currentSolution.title}</h2>
                  <p className="text-slate-500 text-sm">{currentSolution.subtitle}</p>
                </div>
              </div>
              <p className="text-lg text-slate-700 leading-relaxed">{currentSolution.heroDescription}</p>
            </div>
          </ScrollReveal>

          {/* Key Metrics */}
          <ScrollReveal delay={100}>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-16">
              {currentSolution.keyMetrics.map((metric) => (
                <Card key={metric.label} className="p-5 text-center border border-slate-200">
                  <p className="text-2xl font-bold text-slate-900 mb-1">{metric.value}</p>
                  <p className="text-slate-500 text-xs font-medium">{metric.label}</p>
                </Card>
              ))}
            </div>
          </ScrollReveal>

          {/* Capabilities */}
          <ScrollReveal delay={200}>
            <h3 className="text-xl font-bold text-slate-900 mb-6">Capabilities</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-16">
              {currentSolution.capabilities.map((cap, index) => {
                const CapIcon = cap.icon;
                return (
                  <Card key={cap.title} className="p-6 border border-slate-200 hover:border-blue-200 transition-colors">
                    <div className="flex gap-4">
                      <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center flex-shrink-0">
                        <CapIcon className="w-5 h-5 text-blue-600" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-slate-900 mb-2">{cap.title}</h4>
                        <p className="text-slate-600 text-sm leading-relaxed">{cap.description}</p>
                      </div>
                    </div>
                  </Card>
                );
              })}
            </div>
          </ScrollReveal>

          {/* Two Column: Why + Approach */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-16">
            <ScrollReveal delay={100}>
              <h3 className="text-xl font-bold text-slate-900 mb-6">Why Nymbus Capital</h3>
              <div className="space-y-3">
                {currentSolution.whyNymbus.map((reason) => (
                  <div key={reason} className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-emerald-500 flex-shrink-0 mt-0.5" />
                    <p className="text-slate-700 text-sm leading-relaxed">{reason}</p>
                  </div>
                ))}
              </div>
            </ScrollReveal>

            <ScrollReveal delay={200}>
              <h3 className="text-xl font-bold text-slate-900 mb-6">Investment Approach</h3>
              <p className="text-slate-700 leading-relaxed mb-6">{currentSolution.investmentApproach}</p>
              <div>
                <h4 className="font-semibold text-slate-900 text-sm mb-3">Suitable Strategies</h4>
                <div className="flex flex-wrap gap-2">
                  {currentSolution.suitableStrategies.map((strategy) => (
                    <span key={strategy} className="px-3 py-1.5 bg-slate-100 text-slate-700 rounded-lg text-sm font-medium">
                      {strategy}
                    </span>
                  ))}
                </div>
              </div>
            </ScrollReveal>
          </div>

          {/* CTA */}
          <ScrollReveal delay={100}>
            <Card className="p-8 md:p-12 bg-slate-900 text-white border-0">
              <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                <div>
                  <h3 className="text-2xl font-bold mb-2">Ready to get started?</h3>
                  <p className="text-slate-400">
                    Minimum investment: {currentSolution.minimumInvestment}. Contact our team to discuss your mandate.
                  </p>
                </div>
                <a
                  href={`mailto:${currentSolution.contactEmail}`}
                  className="inline-flex items-center gap-2 bg-white text-slate-900 px-6 py-3 rounded-lg font-medium hover:bg-slate-100 transition-colors flex-shrink-0"
                >
                  Contact Us <ArrowRight className="w-4 h-4" />
                </a>
              </div>
            </Card>
          </ScrollReveal>
        </div>
      </section>

      {/* Process Section */}
      <section className="px-6 py-20 md:px-12 bg-slate-50 border-t border-slate-100">
        <div className="max-w-5xl mx-auto">
          <ScrollReveal>
            <SectionHeader
              eyebrow="Our Process"
              title="How We Work With You"
              description="A structured onboarding and relationship management process designed for institutional excellence."
            />
          </ScrollReveal>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {[
              { step: '01', title: 'Discovery', description: 'We begin with a deep understanding of your investment objectives, constraints, risk tolerance, and ESG requirements.' },
              { step: '02', title: 'Design', description: 'Our quantitative team designs a customized mandate or recommends fund solutions aligned with your investment policy.' },
              { step: '03', title: 'Implementation', description: 'Systematic portfolio construction using our proprietary models, with full transparency into the process and positioning.' },
              { step: '04', title: 'Partnership', description: 'Ongoing monitoring, quarterly reviews, and proactive communication to ensure your mandate evolves with your needs.' },
            ].map((item, index) => (
              <ScrollReveal key={item.step} delay={index * 100}>
                <div className="text-center">
                  <div className="text-4xl font-bold text-blue-600 mb-4">{item.step}</div>
                  <h3 className="font-bold text-slate-900 mb-2">{item.title}</h3>
                  <p className="text-slate-600 text-sm leading-relaxed">{item.description}</p>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
