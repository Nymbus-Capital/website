'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { Card } from '@/components/ui/Card';
import { ScrollReveal } from '@/components/animations/ScrollReveal';
import TypewriterEffect from '@/components/animations/TypewriterEffect';
import AnimatedCounter from '@/components/animations/AnimatedCounter';
import { funds } from '@/data/funds';
import { formatPercent } from '@/lib/utils';
import { TrendingUp, BarChart3, Shield, ArrowRight, Newspaper, Calendar, ChevronRight, Database, Zap, Layout, Lock } from 'lucide-react';
import gsap from 'gsap';

const newsItems = [
  { date: '2024', title: 'Nymbus Capital Reaches $1 Billion in Assets Under Management', category: 'Milestone', description: 'A significant milestone reflecting institutional trust and investment excellence.' },
  { date: '2023', title: 'Launch of Sustainable Bond Funds with Fondaction', category: 'Product Launch', description: 'New sustainable bond fund collaboration focused on ESG-forward fixed income investing.' },
  { date: '2023', title: 'Machine Learning Integration in Market Regime Classification', category: 'Innovation', description: 'Cutting-edge ML models now drive dynamic asset allocation across strategies.' },
  { date: '2023', title: 'Zero Fossil Fuel Achievement in Credit Portfolio', category: 'ESG', description: 'Full elimination of fossil fuel exposure from credit holdings, leading Canadian fixed income managers.' },
  { date: '2022', title: 'New Institutional Mandate with FMOQ', category: 'Growth', description: "Awarded mandate from the Quebec medical professionals' investment fund." },
  { date: '2020', title: 'Historic Three-Firm Merger', category: 'Milestone', description: 'Union of Nymbus Capital (2013), Gestion de portefeuille Landry (2002), and Perseus Capital (2005).' },
];

// Investment Capabilities Pipeline Component
function InvestmentCapabilities() {
  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <ScrollReveal>
          <div>
            <p className="text-sm font-semibold text-blue-600 mb-2 uppercase tracking-wide">How We Work</p>
            <h2 className="text-4xl font-bold text-slate-900 mb-6">Our Investment Process</h2>
            <p className="text-lg text-slate-600 mb-12">
              Systematic investing driven by quantitative models, disciplined risk management, and continuous research innovation.
            </p>
          </div>
        </ScrollReveal>
        
        <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
          {[
            { number: 1, title: 'Data Ingestion', description: 'Raw market data aggregation and normalization', icon: Database },
            { number: 2, title: 'Signal Generation', description: 'Quantitative model development and backtesting', icon: Zap },
            { number: 3, title: 'Portfolio Construction', description: 'Multi-factor optimization and diversification', icon: Layout },
            { number: 4, title: 'Risk Management', description: 'Real-time monitoring and stress testing', icon: Shield },
            { number: 5, title: 'Execution', description: 'Smart order routing and settlement', icon: Lock },
          ].map((step, idx) => {
            const Icon = step.icon;
            return (
              <ScrollReveal key={step.number} delay={idx * 100}>
                <motion.div
                  whileHover={{ y: -4 }}
                  transition={{ duration: 0.2 }}
                >
                  <Card className="h-full border-t-4 border-t-blue-600">
                    <div className="p-6">
                      <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center mb-4">
                        <Icon className="w-6 h-6 text-blue-600" />
                      </div>
                      <h3 className="text-lg font-bold text-slate-900 mb-2">{step.title}</h3>
                      <p className="text-slate-600 text-sm">{step.description}</p>
                    </div>
                  </Card>
                </motion.div>
              </ScrollReveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}

function NewsSection() {
  const [expandedIdx, setExpandedIdx] = useState<number | null>(null);
  const cardsRef = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    cardsRef.current.forEach((card, idx) => {
      if (!card) return;
      gsap.from(card, {
        opacity: 0,
        y: 20,
        duration: 0.6,
        delay: idx * 0.05,
        ease: 'power2.out',
        scrollTrigger: {
          trigger: card,
          start: 'top 85%',
          toggleActions: 'play none none none',
        },
      });
    });
  }, []);

  return (
    <section className="py-20 bg-slate-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <ScrollReveal>
          <div className="mb-12">
            <p className="text-sm font-semibold text-blue-600 mb-2 uppercase tracking-wide">News & Updates</p>
            <h2 className="text-4xl font-bold text-slate-900">Latest From Nymbus</h2>
          </div>
        </ScrollReveal>

        <div className="space-y-4">
          {newsItems.map((item, idx) => (
            <motion.div
              key={idx}
              ref={(el) => { cardsRef.current[idx] = el; }}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              whileHover={{ x: 4 }}
              transition={{ duration: 0.2 }}
              className="cursor-pointer"
              onClick={() => setExpandedIdx(expandedIdx === idx ? null : idx)}
            >
              <Card className="border-l-4 border-l-blue-600 transition-all duration-300 hover:shadow-md">
                <div className="p-6">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-bold text-blue-600 px-2 py-1 bg-blue-50 rounded">{item.date}</span>
                      <span className="text-xs font-semibold text-slate-600 bg-slate-200 px-2 py-1 rounded uppercase tracking-wide">{item.category}</span>
                    </div>
                    <ChevronRight
                      className={`w-5 h-5 text-slate-400 transition-transform duration-300 ${
                        expandedIdx === idx ? 'rotate-90' : ''
                      }`}
                    />
                  </div>
                  <h3 className="text-lg font-bold text-slate-900 mb-1">{item.title}</h3>
                  <AnimatePresence>
                    {expandedIdx === idx && (
                      <motion.p
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.2 }}
                        className="text-slate-600 mt-3"
                      >
                        {item.description}
                      </motion.p>
                    )}
                  </AnimatePresence>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

function FeaturedStrategiesSection() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;
    
    const cards = containerRef.current.querySelectorAll('.strategy-card');
    gsap.fromTo(cards,
      { opacity: 0, y: 30 },
      {
        opacity: 1,
        y: 0,
        duration: 0.8,
        stagger: 0.15,
        ease: 'power2.out',
        scrollTrigger: {
          trigger: containerRef.current,
          start: 'top 70%',
          toggleActions: 'play none none none',
        },
      }
    );
  }, []);

  return (
    <section className="py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <ScrollReveal>
          <div className="mb-12">
            <p className="text-sm font-semibold text-blue-600 mb-2 uppercase tracking-wide">Strategies</p>
            <h2 className="text-4xl font-bold text-slate-900 mb-4">Our Investment Strategies</h2>
            <p className="text-lg text-slate-600 max-w-2xl">Institutional-quality systematic strategies across multiple asset classes.</p>
          </div>
        </ScrollReveal>

        <div ref={containerRef} className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {funds.slice(0, 4).map((fund, idx) => (
            <Link key={fund.slug} href={`/strategies/${fund.slug}`}>
              <motion.div
                className="strategy-card"
                whileHover={{ y: -6 }}
                transition={{ duration: 0.3 }}
              >
                <Card className="border-l-4 border-blue-600 h-full hover:shadow-lg transition-shadow duration-300 cursor-pointer">
                  <div className="p-6">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h3 className="text-xl font-bold text-slate-900">{fund.name}</h3>
                        <p className="text-sm text-slate-500 mt-1">{fund.vehicle}</p>
                      </div>
                      <TrendingUp className="w-6 h-6 text-blue-600" />
                    </div>
                    <p className="text-slate-600 text-sm mb-4">{fund.description}</p>
                    <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                      <div className="text-right">
                        <p className="text-sm text-slate-500">Since Inception</p>
                        <p className="text-lg font-bold text-slate-900">{formatPercent(fund.returns.sinceInception)}</p>
                      </div>
                      <ArrowRight className="w-5 h-5 text-blue-600" />
                    </div>
                  </div>
                </Card>
              </motion.div>
            </Link>
          ))}
        </div>

        <div className="text-center mt-10">
          <Link href="/strategies">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors"
            >
              View all strategies
              <ArrowRight className="w-5 h-5" />
            </motion.button>
          </Link>
        </div>
      </div>
    </section>
  );
}

function HeroSection() {
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    setIsLoaded(true);
  }, []);

  return (
    <section className="relative pt-20 pb-32 bg-gradient-to-br from-blue-600 to-blue-700 overflow-hidden">
      {/* Animated background shapes */}
      <div className="absolute inset-0 overflow-hidden">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={isLoaded ? { opacity: 0.1, scale: 1 } : {}}
          transition={{ duration: 1 }}
          className="absolute top-0 right-0 w-96 h-96 bg-blue-500 rounded-full blur-3xl"
        />
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={isLoaded ? { opacity: 0.1, scale: 1 } : {}}
          transition={{ duration: 1, delay: 0.2 }}
          className="absolute bottom-0 left-0 w-96 h-96 bg-blue-400 rounded-full blur-3xl"
        />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <ScrollReveal>
          <div className="max-w-3xl">
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={isLoaded ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.8 }}
              className="text-5xl md:text-6xl font-bold text-white mb-6 leading-tight"
            >
              Systematic Investing,<br />
              <span className="inline-block">
                <TypewriterEffect text="Delivered with Precision" color="#60a5fa" />
              </span>
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={isLoaded ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="text-xl text-blue-100 mb-8 leading-relaxed"
            >
              Nymbus Capital is a systematic investment manager specializing in quantitatively-driven, risk-managed strategies. We blend data science, rigorous research, and disciplined execution to deliver consistent, risk-adjusted returns.
            </motion.p>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={isLoaded ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="flex flex-wrap gap-4"
            >
              <Link href="/strategies">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="px-8 py-3 bg-white text-blue-600 font-semibold rounded-lg hover:bg-blue-50 transition-colors"
                >
                  Explore Strategies
                </motion.button>
              </Link>
              <Link href="/approach">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="px-8 py-3 border-2 border-white text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Our Approach
                </motion.button>
              </Link>
            </motion.div>
          </div>
        </ScrollReveal>

        {/* Stats Section */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-20">
          {[
            { number: 1.5, label: 'B+ AUM', suffix: '' },
            { number: 10, label: 'Years Experience', suffix: '+' },
            { number: 4, label: 'Active Strategies', suffix: '' },
            { number: 15, label: 'Team Members', suffix: '+' },
          ].map((stat, idx) => (
            <ScrollReveal key={stat.label} delay={idx * 100}>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
              >
                <div className="text-center">
                  <div className="text-4xl font-bold text-white mb-2">
                    {typeof stat.number === 'number' && stat.number % 1 !== 0 ? (
                      <AnimatedCounter target={stat.number} suffix={stat.suffix} />
                    ) : (
                      <>
                        <AnimatedCounter target={Math.floor(stat.number)} suffix={stat.suffix} />
                      </>
                    )}
                  </div>
                  <p className="text-blue-100">{stat.label}</p>
                </div>
              </motion.div>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  );
}

export default function HomePage() {
  return (
    <div className="min-h-screen bg-white">
      <HeroSection />
      <InvestmentCapabilities />
      <FeaturedStrategiesSection />
      <NewsSection />
    </div>
  );
}