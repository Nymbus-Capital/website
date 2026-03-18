'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { ArrowRight, TrendingUp } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { ScrollReveal } from '@/components/animations/ScrollReveal';
import { cn } from '@/lib/utils';
import DotParticleCanvas from '@/components/animations/DotParticleCanvas';
import AnimatedCounter from '@/components/animations/AnimatedCounter';
import TypewriterEffect from '@/components/animations/TypewriterEffect';

function HeroSection() {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-to-br from-blue-900 via-blue-800 to-blue-900">
      <DotParticleCanvas />
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <ScrollReveal>
          <div className="text-center">
            <h1 className="text-6xl md:text-7xl font-bold text-white mb-6 leading-tight">
              Systematic Investing
              <br />
              <span className="text-blue-300">
                <TypewriterEffect />
              </span>
            </h1>
            <p className="text-xl text-blue-100 max-w-2xl mx-auto mb-8">
              Proprietary quantitative strategies designed to deliver consistent returns across market cycles.
            </p>
            <div className="flex gap-4 justify-center flex-wrap">
              <Link href="/strategies">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="px-8 py-3 bg-white text-blue-600 font-semibold rounded-lg hover:bg-blue-50 transition-colors"
                >
                  Explore Strategies
                </motion.button>
              </Link>
              <Link href="/contact">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="px-8 py-3 border-2 border-white text-white font-semibold rounded-lg hover:bg-white hover:text-blue-600 transition-colors"
                >
                  Get in Touch
                </motion.button>
              </Link>
            </div>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}

function StatsBar() {
  return (
    <section className="bg-white border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {[
            { label: 'Assets Under Management', value: 1.5, suffix: 'B' },
            { label: 'Investment Strategies', value: 4, suffix: '' },
            { label: 'Professionals', value: 14, suffix: '' },
            { label: 'Years Track Record', value: 10, suffix: '+' },
          ].map((stat, idx) => (
            <ScrollReveal key={stat.label} delay={idx * 100}>
              <div className="text-center">
                <div className="text-4xl font-bold text-blue-600 mb-2">
                  <AnimatedCounter target={stat.value} suffix={stat.suffix} />
                </div>
                <p className="text-slate-600 font-medium">{stat.label}</p>
              </div>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  );
}

function ApproachSection() {
  return (
    <section className="py-20 bg-slate-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <ScrollReveal>
          <SectionHeader
            eyebrow="Our Approach"
            title="Data-Driven Investment Philosophy"
            description="We combine rigorous quantitative analysis with disciplined risk management to create systematic investment strategies that adapt to changing market conditions."
          />
        </ScrollReveal>
        <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            {
              title: 'Systematic',
              description: 'Rule-based investment processes remove emotion and ensure consistency.',
            },
            {
              title: 'Adaptive',
              description: 'Our models continuously evolve to incorporate new market insights and data.',
            },
            {
              title: 'Transparent',
              description: 'Clear reporting and regular communication about strategy performance and positioning.',
            },
          ].map((item, idx) => (
            <ScrollReveal key={item.title} delay={idx * 100}>
              <Card>
                <div className="p-8">
                  <h3 className="text-xl font-bold text-slate-900 mb-3">{item.title}</h3>
                  <p className="text-slate-600">{item.description}</p>
                </div>
              </Card>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  );
}

function InvestmentCapabilities() {
  const capabilities = [
    {
      title: 'Fixed Income',
      description: 'Multi-sector bond strategies with active credit selection and rate risk management.',
      metrics: ['Low volatility', 'Monthly income', 'ESG integration'],
    },
    {
      title: 'Alternatives',
      description: 'Diversified alternatives strategies designed to enhance risk-adjusted returns.',
      metrics: ['Downside protection', 'Non-correlated', 'Active hedging'],
    },
    {
      title: 'Equities',
      description: 'Systematic equity strategies leveraging quantitative models and factor analysis.',
      metrics: ['Factor exposure', 'Dynamic sizing', 'Risk parity'],
    },
    {
      title: 'Derivatives',
      description: 'Sophisticated derivative strategies for portfolio optimization and hedging.',
      metrics: ['Volatility strategies', 'Tail hedging', 'Enhanced returns'],
    },
  ];

  return (
    <section className="py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <ScrollReveal>
          <SectionHeader
            eyebrow="Investment Pipeline"
            title="Our Core Capabilities"
            description="Across multiple asset classes, we deploy proprietary quantitative strategies backed by rigorous research and discipline."
          />
        </ScrollReveal>
        <div className="mt-16 grid grid-cols-1 md:grid-cols-2 gap-8">
          {capabilities.map((capability, idx) => (
            <ScrollReveal key={capability.title} delay={idx * 100}>
              <Card className="border-l-4 border-blue-600">
                <div className="p-8">
                  <h3 className="text-2xl font-bold text-slate-900 mb-2">{capability.title}</h3>
                  <p className="text-slate-600 mb-6">{capability.description}</p>
                  <div className="flex flex-wrap gap-2">
                    {capability.metrics.map((metric) => (
                      <span
                        key={metric}
                        className="text-xs font-semibold px-3 py-1 bg-blue-100 text-blue-700 rounded-full"
                      >
                        {metric}
                      </span>
                    ))}
                  </div>
                </div>
              </Card>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  );
}

function InvestorLogoBar() {
  const logos = [
    { name: 'Institutional Partner 1', initials: 'IP1' },
    { name: 'Institutional Partner 2', initials: 'IP2' },
    { name: 'Institutional Partner 3', initials: 'IP3' },
    { name: 'Institutional Partner 4', initials: 'IP4' },
    { name: 'Institutional Partner 5', initials: 'IP5' },
  ];

  return (
    <section className="py-12 bg-white border-y border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <p className="text-center text-slate-600 font-semibold mb-8">Trusted by leading institutions worldwide</p>
        <div className="flex justify-center items-center gap-8 flex-wrap">
          {logos.map((logo) => (
            <div
              key={logo.name}
              className="flex items-center justify-center w-24 h-24 bg-slate-100 rounded-lg hover:bg-slate-200 transition-colors"
            >
              <span className="font-bold text-slate-600">{logo.initials}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function NewsCarousel() {
  const [currentIndex, setCurrentIndex] = useState(0);

  const news = [
    {
      title: 'Fixed Income Strategy Exceeds Benchmarks in Q4',
      date: 'December 2024',
      excerpt: 'Our Sustainable Enhanced Bonds Fund delivered 8.2% returns, outperforming the composite benchmark.',
    },
    {
      title: 'New Alternatives Strategy Launch',
      date: 'November 2024',
      excerpt: 'We announce the launch of our latest alternatives strategy targeting enhanced returns with downside protection.',
    },
    {
      title: 'Nymbus Joins Net Zero Initiative',
      date: 'October 2024',
      excerpt: 'We commit to achieving net-zero emissions across our investment portfolio by 2050.',
    },
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % news.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  return (
    <section className="py-20 bg-slate-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <ScrollReveal>
          <SectionHeader eyebrow="Latest News" title="What's Happening" />
        </ScrollReveal>
        <div className="mt-12">
          <motion.div
            key={currentIndex}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.5 }}
            className="bg-white rounded-xl p-8 md:p-12 border border-slate-200"
          >
            <div className="mb-4 flex items-center gap-2">
              <span className="text-sm font-semibold text-blue-600">{news[currentIndex].date}</span>
            </div>
            <h3 className="text-3xl font-bold text-slate-900 mb-4">{news[currentIndex].title}</h3>
            <p className="text-slate-600 text-lg mb-6">{news[currentIndex].excerpt}</p>
            <div className="flex gap-2">
              {news.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setCurrentIndex(idx)}
                  className={cn('h-2 rounded-full transition-all', idx === currentIndex ? 'bg-blue-600 w-8' : 'bg-slate-300 w-2')}
                />
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

function CTASection() {
  return (
    <section className="py-20 bg-gradient-to-r from-blue-600 to-blue-700">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <ScrollReveal>
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">Ready to invest systematically?</h2>
          <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
            Learn how our quantitative strategies can help you achieve your investment objectives.
          </p>
          <div className="flex gap-4 justify-center flex-wrap">
            <Link href="/strategies">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-8 py-3 bg-white text-blue-600 font-semibold rounded-lg hover:bg-blue-50 transition-colors inline-flex items-center gap-2"
              >
                Explore Strategies <ArrowRight className="w-4 h-4" />
              </motion.button>
            </Link>
            <Link href="/contact">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-8 py-3 border-2 border-white text-white font-semibold rounded-lg hover:bg-white hover:text-blue-600 transition-colors"
              >
                Contact Us
              </motion.button>
            </Link>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}

export default function Home() {
  return (
    <div className="min-h-screen bg-white">
      <HeroSection />
      <StatsBar />
      <ApproachSection />
      <InvestmentCapabilities />
      <InvestorLogoBar />
      <NewsCarousel />
      <CTASection />
    </div>
  );
}