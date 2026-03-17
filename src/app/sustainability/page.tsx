'use client';

import { useRef, useEffect, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Leaf, Zap, Award, Target, TrendingUp, Shield, Link as LinkIcon } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { ScrollReveal } from '@/components/animations/ScrollReveal';
import { cn } from '@/lib/utils';
import AnimatedCounter from '@/components/animations/AnimatedCounter';

gsap.registerPlugin(ScrollTrigger);

const esgStrategy = [
  {
    number: 1,
    title: 'Exclusion Screening',
    description: 'We systematically exclude securities from our portfolios based on strict ESG criteria.',
    items: [
      'Fossil Fuel Exclusion: No exposure to fossil fuel producers or extractors',
      'Tobacco Exclusion: Complete removal of tobacco companies',
      'Controversial Weapons: Exclusion of manufacturers of nuclear, biological & chemical weapons'
    ],
    icon: Shield,
  },
  {
    number: 2,
    title: 'Positive Screening',
    description: 'ESG metrics are integrated directly into our quantitative investment models.',
    items: [
      'ESG Scoring: Proprietary scoring system integrated into credit analysis',
      'Security Selection: ESG ratings weighted in portfolio optimization',
      'Multi-Factor Models: Environmental and governance metrics in alpha generation'
    ],
    icon: TrendingUp,
  },
  {
    number: 3,
    title: 'Quantitative ESG Integration',
    description: 'ESG metrics are quantitatively embedded into our credit models and systematic security selection process.',
    items: [
      'Credit Model Integration: ESG scores weighted in credit risk assessment and pricing models',
      'Factor-Based Selection: ESG factors used in multi-factor security selection and portfolio construction',
      'Risk Premia: Systematic capture of ESG-related risk premia in fixed income strategies'
    ],
    icon: Target,
  },
];

const commitments = [
  {
    title: 'UN PRI Signatory',
    year: 'Since 2018',
    description: 'We are a signatory of the United Nations Principles for Responsible Investment, committing to consider ESG factors in investment decisions and report annually on our progress.',
    icon: Award,
  },
  {
    title: 'Tobacco-Free Finance Pledge',
    year: 'Signed 2024',
    description: 'We have signed the Tobacco-Free Finance Pledge, divesting all tobacco companies from our portfolios and committing to a tobacco-free investment strategy.',
    icon: Leaf,
  },
  {
    title: 'Zero Fossil Fuel Portfolio',
    year: 'Achieved 2023',
    description: 'Our Sustainable Enhanced Bonds Fund became the first zero fossil fuel fixed income fund in Canada, eliminating direct exposure to coal, oil, and gas producers.',
    icon: Zap,
  },
];

const sustainableStrategies = [
  {
    name: 'Sustainable Enhanced Bonds Fund',
    description: 'Our fixed income strategy with full ESG integration and fossil fuel exclusion.',
    mrr: 'Low MER',
    features: ['Sustainable and green bonds focus', 'Fossil fuel-free portfolio', 'Daily liquidity'],
  },
  {
    name: 'Monthly Income Fund',
    description: 'Short-term fixed income strategy with enhanced ESG criteria and positive sustainability focus.',
    mrr: 'Ultra-low MER',
    features: ['Monthly distributions', 'ESG-integrated credit selection', 'Capital preservation', 'Daily liquidity'],
  },
];

function StrategyCard({ number, title, description, items, icon: Icon }: (typeof esgStrategy)[0]) {
  const cardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const card = cardRef.current;
    if (!card) return;

    gsap.from(card, {
      opacity: 0,
      y: 30,
      duration: 0.8,
      ease: 'power2.out',
      scrollTrigger: {
        trigger: card,
        start: 'top 80%',
        toggleActions: 'play none none none',
      },
    });
  }, []);

  return (
    <div ref={cardRef} className="relative">
      <Card className="h-full">
        <div className="p-8">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
              <Icon className="w-6 h-6 text-blue-600" />
            </div>
            <div className="text-3xl font-bold text-blue-600">{number}</div>
          </div>
          <h3 className="text-2xl font-bold text-slate-900 mb-2">{title}</h3>
          <p className="text-slate-600 mb-6">{description}</p>
          <ul className="space-y-3">
            {items.map((item, idx) => (
              <li key={idx} className="flex gap-3 text-sm">
                <span className="text-blue-600 font-bold flex-shrink-0">•</span>
                <span className="text-slate-700">{item}</span>
              </li>
            ))}
          </ul>
        </div>
      </Card>
    </div>
  );
}

function CommitmentCard({ title, year, description, icon: Icon }: (typeof commitments)[0]) {
  const cardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const card = cardRef.current;
    if (!card) return;

    const handleMouseEnter = () => {
      gsap.to(card, {
        y: -8,
        boxShadow: '0 20px 40px rgba(66, 133, 244, 0.15)',
        duration: 0.3,
        ease: 'power2.out',
      });
    };

    const handleMouseLeave = () => {
      gsap.to(card, {
        y: 0,
        boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
        duration: 0.3,
        ease: 'power2.out',
      });
    };

    card.addEventListener('mouseenter', handleMouseEnter);
    card.addEventListener('mouseleave', handleMouseLeave);

    return () => {
      card.removeEventListener('mouseenter', handleMouseEnter);
      card.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, []);

  return (
    <div ref={cardRef} className="bg-white border border-slate-100 rounded-xl transition-shadow duration-300 hover:shadow-md border-t-4 border-t-blue-600">
      <div className="p-6">
        <div className="flex items-center gap-3 mb-2">
          <Icon className="w-5 h-5 text-blue-600" />
          <h3 className="text-lg font-bold text-slate-900">{title}</h3>
        </div>
        <p className="text-sm text-blue-600 font-semibold mb-3">{year}</p>
        <p className="text-slate-600">{description}</p>
      </div>
    </div>
  );
}

function PhilosophySection() {
  return (
    <section className="py-20 bg-gradient-to-b from-white to-slate-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <ScrollReveal>
          <SectionHeader
            eyebrow="Our Philosophy"
            title="ESG as Core Investment Process"
            description="At Nymbus, responsible investing is embedded in our systematic investment process, not treated as a separate overlay. Every portfolio decision reflects our commitment to environmental, social, and governance principles."
          />
        </ScrollReveal>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-16">
          {[
            {
              title: 'Core Integration',
              description: 'ESG metrics are embedded in our quantitative models, not bolted on as an afterthought.',
            },
            {
              title: 'Transparency',
              description: 'We provide detailed reporting on our ESG practices and their impact on portfolio construction.',
            },
            {
              title: 'Accountability',
              description: 'As a UN PRI signatory since 2018, we report annually on our progress and commitments.',
            },
          ].map((point, idx) => (
            <ScrollReveal key={point.title} delay={idx * 100}>
              <Card>
                <div className="p-6">
                  <h3 className="text-lg font-bold text-slate-900 mb-2">{point.title}</h3>
                  <p className="text-slate-600">{point.description}</p>
                </div>
              </Card>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  );
}

function StrategySection() {
  return (
    <section className="py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <ScrollReveal>
          <SectionHeader
            eyebrow="Integration in Practice"
            title="How ESG Drives Our Investment Decisions"
            description="ESG integration happens through three complementary approaches: exclusion screening, positive ESG scoring, and quantitative ESG integration."
          />
        </ScrollReveal>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-16">
          {esgStrategy.map((strategy, idx) => (
            <StrategyCard key={strategy.title} {...strategy} />
          ))}
        </div>
      </div>
    </section>
  );
}

function SustainableStrategiesSection() {
  return (
    <section className="py-20 bg-slate-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <ScrollReveal>
          <SectionHeader
            eyebrow="Sustainable Solutions"
            title="Our Sustainable Strategies"
            description="We've developed institutional-quality sustainable investing solutions accessible to investors of all sizes."
          />
        </ScrollReveal>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-16">
          {sustainableStrategies.map((strategy, idx) => (
            <ScrollReveal key={strategy.name} delay={idx * 100}>
              <Card className="border-l-4 border-blue-600 flex flex-col h-full">
                <div className="p-8 flex-1">
                  <h3 className="text-2xl font-bold text-slate-900 mb-2">{strategy.name}</h3>
                  <p className="text-slate-600 mb-6">{strategy.description}</p>

                  <div className="mb-6">
                    <p className="text-sm font-semibold text-blue-600 mb-3">Key Features:</p>
                    <ul className="space-y-2">
                      {strategy.features.map((feature, idx) => (
                        <li key={idx} className="text-sm text-slate-600 flex items-center gap-2">
                          <span className="w-1.5 h-1.5 bg-blue-600 rounded-full"></span>
                          {feature}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <button className="inline-flex items-center gap-2 text-blue-600 font-semibold hover:gap-3 transition-all">
                    Learn more
                    <LinkIcon className="w-4 h-4" />
                  </button>
                </div>
              </Card>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  );
}

function CommitmentsSection() {
  return (
    <section className="py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <ScrollReveal>
          <SectionHeader
            eyebrow="Our Commitments"
            title="Measurable Pledges & Achievements"
            description="We're committed to responsible investing through industry-leading initiatives and transparent reporting."
          />
        </ScrollReveal>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-16">
          {commitments.map((commitment, idx) => (
            <ScrollReveal key={commitment.title} delay={idx * 100}>
              <CommitmentCard {...commitment} />
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  );
}

function ImpactSection() {
  return (
    <section className="py-20 bg-gradient-to-r from-blue-600 to-blue-700">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center text-white mb-12">
          <h2 className="text-4xl font-bold mb-6">Our ESG Impact</h2>
          <p className="text-xl text-blue-100 max-w-2xl mx-auto">
            Through responsible investing, we're contributing to a more sustainable future while delivering strong risk-adjusted returns.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {[
            { label: 'Years as PRI Signatory', value: 6 },
            { label: 'Zero Fossil Fuel Fund in Canada', value: 1, suffix: 'st' },
            { label: 'Sustainable Fund Mandates', value: 3, suffix: '+' },
            { label: 'ESG-Integrated Models', value: 100, suffix: '%' },
          ].map((stat, idx) => (
            <ScrollReveal key={stat.label} delay={idx * 100}>
              <div className="text-center">
                <div className="text-4xl md:text-5xl font-bold text-white mb-2">
                  <AnimatedCounter target={stat.value} suffix={stat.suffix || ''} />
                </div>
                <p className="text-blue-100">{stat.label}</p>
              </div>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  );
}

function FoundactionSection() {
  return (
    <section className="py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <ScrollReveal>
          <div className="bg-gradient-to-r from-blue-50 to-slate-50 rounded-2xl p-8 md:p-12 border border-slate-200">
            <div className="max-w-3xl">
              <h3 className="text-2xl md:text-3xl font-bold text-slate-900 mb-4">Partnership with Fondaction</h3>
              <p className="text-slate-600 mb-6 text-lg">
                We partner with Fondaction, a leading Canadian investment fund focused on sustainable development, to deliver innovative sustainable bond solutions. Our Sustainable Enhanced Bonds Fund leverages this partnership to provide investors with access to high-quality, ESG-vetted fixed income securities.
              </p>
              <p className="text-slate-600">
                This collaboration ensures our sustainable strategies are not only focused on financial returns but also contribute meaningfully to environmental and social outcomes.
              </p>
            </div>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}

export default function SustainabilityPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="py-20 md:py-32 bg-gradient-to-br from-blue-600 to-blue-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <ScrollReveal>
            <div className="text-center text-white">
              <h1 className="text-5xl md:text-6xl font-bold mb-6">
                Modernity Meets Responsibility
              </h1>
              <p className="text-xl text-blue-100 max-w-2xl mx-auto">
                Responsible investing is not a separate strategy at Nymbus—it's woven into the fabric of every investment decision we make.
              </p>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* Philosophy Section */}
      <PhilosophySection />

      {/* Integration Section */}
      <StrategySection />

      {/* Sustainable Strategies Section */}
      <SustainableStrategiesSection />

      {/* Commitments Section */}
      <CommitmentsSection />

      {/* Fondaction Partnership */}
      <FoundactionSection />

      {/* Impact Section */}
      <ImpactSection />
    </div>
  );
}
