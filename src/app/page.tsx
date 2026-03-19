'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { Card } from '@/components/ui/Card';
import { ScrollReveal } from '@/components/animations/ScrollReveal';
import TypewriterEffect from '@/components/animations/TypewriterEffect';
import AnimatedCounter from '@/components/animations/AnimatedCounter';
import DotParticleCanvas from '@/components/animations/DotParticleCanvas';
import { funds } from '@/data/funds';
import { formatPercent } from '@/lib/utils';
import { TrendingUp, BarChart3, Shield, ArrowRight, Newspaper, Calendar, ChevronRight, Database, Zap, Layout, Lock } from 'lucide-react';
import Image from 'next/image';
import gsap from 'gsap';

const newsItems = [
  { date: 'Jan 2025', title: 'Mageska Capital Partnership', summary: 'Mageska entrusts Nymbus with portable alpha strategy management' },
  { date: 'Apr 2024', title: 'Tobacco-Free Finance Pledge', summary: 'Nymbus commits to excluding tobacco companies from all portfolios' },
  { date: 'Nov 2023', title: 'RBC Fund Ranking', summary: 'All three fixed income strategies ranked in top percentiles' },
  { date: 'Oct 2023', title: 'Community Impact', summary: 'Nymbus partners with Dans la rue to support at-risk youth' },
];

const performanceMetrics = [
  '$1.3B+ AUM',
  'Top Percentile Rankings',
  '8+ Year Track Record',
  '100% Systematic',
  'ESG Integrated',
  '4 Strategies',
];

function InvestmentCapabilities() {
  const capabilities = [
    { icon: Database, title: 'Data & Research', description: 'Deep analysis of market dynamics and fundamental data using proprietary frameworks to uncover persistent return drivers.' },
    { icon: Zap, title: 'Signal Generation', description: 'Advanced ML models to identify alpha-generating signals across asset classes with rigorous statistical validation.' },
    { icon: Layout, title: 'Portfolio Construction', description: 'Optimized portfolio building using systematic allocation and rebalancing rules with disciplined risk controls.' },
    { icon: Lock, title: 'Risk Management', description: 'Continuous monitoring with dynamic hedging and regime-based adjustments to protect capital across market cycles.' }
  ];

  return (
    <div className="w-full">
      <div className="space-y-12 max-w-4xl">
        {capabilities.map((cap, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: index * 0.1 }}
            viewport={{ once: true, margin: '-100px' }}
            className="relative"
          >
            <div className="flex gap-8 items-start">
              {/* Left side - numbered circle and line */}
              <div className="flex flex-col items-center flex-shrink-0">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-600 to-blue-700 flex items-center justify-center text-white font-bold text-2xl shadow-lg relative z-10">
                  {index + 1}
                </div>
                {index < capabilities.length - 1 && (
                  <div className="w-1 h-20 mt-4 bg-gradient-to-b from-blue-600 via-blue-400 to-transparent relative">
                    <div className="absolute inset-0 bg-gradient-to-b from-blue-400 to-transparent opacity-50 blur-sm"></div>
                  </div>
                )}
              </div>

              {/* Right side - content */}
              <div className="flex-1 pt-2">
                <div className="flex gap-4">
                  <div className="flex-shrink-0 w-12 h-12 rounded-lg bg-blue-50 flex items-center justify-center">
                    <cap.icon className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-slate-900 mb-2">{cap.title}</h3>
                    <p className="text-slate-600 leading-relaxed">{cap.description}</p>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

function ClientLogos() {
  const clients = [
    { name: 'FMOQ', url: 'https://www.nymbus.ca/wp-content/uploads/2024/01/logo-fmoq.png' },
    { name: 'PGEQ', url: 'https://www.nymbus.ca/wp-content/uploads/2024/01/logo-pgeq-fr.png' },
    { name: 'Fondaction', url: 'https://www.nymbus.ca/wp-content/uploads/2024/01/logo-fondaction.png' },
    { name: 'GardaWorld', url: 'https://www.nymbus.ca/wp-content/uploads/2024/01/logo-gardaworld.png' },
  ];

  return (
    <div className="relative w-full overflow-hidden py-8">
      <div className="absolute left-0 top-0 bottom-0 w-20 bg-gradient-to-r from-slate-50 to-transparent pointer-events-none z-10" />
      <div className="absolute right-0 top-0 bottom-0 w-20 bg-gradient-to-l from-slate-50 to-transparent pointer-events-none z-10" />
      <div className="flex gap-16 animate-scroll">
        {[...clients, ...clients].map((client, idx) => (
          <motion.div
            key={idx}
            className="flex-shrink-0 flex items-center justify-center h-16"
            whileHover={{ scale: 1.05 }}
            transition={{ duration: 0.3 }}
          >
            <img
              src={client.url}
              alt={client.name}
              className="h-12 w-auto grayscale hover:grayscale-0 transition-all duration-300 opacity-70 hover:opacity-100"
              onError={(e) => {
                (e.target as HTMLImageElement).style.display = 'none';
              }}
            />
          </motion.div>
        ))}
      </div>
      <style jsx>{`
        @keyframes scroll { 0% { transform: translateX(0); } 100% { transform: translateX(calc(-50% - 32px)); } }
        .animate-scroll { animation: scroll 40s linear infinite; }
        .animate-scroll:hover { animation-play-state: paused; }
      `}</style>
    </div>
  );
}

function PerformanceTicker() {
  return (
    <div className="relative w-full overflow-hidden py-6 bg-gradient-to-r from-blue-50 via-white to-blue-50">
      <div className="absolute left-0 top-0 bottom-0 w-16 bg-gradient-to-r from-white to-transparent pointer-events-none z-10" />
      <div className="absolute right-0 top-0 bottom-0 w-16 bg-gradient-to-l from-white to-transparent pointer-events-none z-10" />
      <div className="flex gap-12 animate-scroll items-center">
        {[...performanceMetrics, ...performanceMetrics].map((metric, idx) => (
          <div key={idx} className="flex-shrink-0 flex items-center justify-center">
            <span className="text-base font-semibold text-slate-700 whitespace-nowrap">{metric}</span>
            {idx % performanceMetrics.length !== performanceMetrics.length - 1 && (
              <span className="ml-12 w-1 h-1 rounded-full bg-blue-400" />
            )}
          </div>
        ))}
      </div>
      <style jsx>{`
        @keyframes scroll { 0% { transform: translateX(0); } 100% { transform: translateX(calc(-50% - 24px)); } }
        .animate-scroll { animation: scroll 50s linear infinite; }
        .animate-scroll:hover { animation-play-state: paused; }
      `}</style>
    </div>
  );
}

function NewsTimeline() {
  return (
    <div className="relative w-full overflow-x-auto pb-4">
      <div className="absolute left-0 top-0 bottom-0 w-12 bg-gradient-to-r from-white via-white to-transparent pointer-events-none z-10" />
      <div className="absolute right-0 top-0 bottom-0 w-12 bg-gradient-to-l from-white via-white to-transparent pointer-events-none z-10" />

      <div className="flex gap-6 min-w-min px-4">
        {newsItems.map((item, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
            viewport={{ once: true, margin: '-50px' }}
            className="flex-shrink-0 w-80"
          >
            <div className="group cursor-pointer relative h-full">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-transparent to-blue-50/20 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <div className="relative p-6 border border-slate-200 rounded-lg bg-white group-hover:border-blue-300 transition-all duration-300 h-full flex flex-col">
                <div className="inline-flex items-center gap-2 mb-4">
                  <span className="px-3 py-1 bg-blue-600 text-white rounded-full text-sm font-bold">{item.date}</span>
                </div>
                <h3 className="text-lg font-bold text-slate-900 mb-2 group-hover:text-blue-600 transition-colors">{item.title}</h3>
                <p className="text-slate-600 text-sm leading-relaxed flex-grow">{item.summary}</p>
                <div className="mt-4 flex items-center text-blue-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <ArrowRight className="w-4 h-4" />
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

export default function Home() {
  return (
    <main className="bg-white">
      <section className="min-h-[90vh] flex flex-col items-center justify-center px-6 py-20 relative overflow-hidden">
        <DotParticleCanvas />
        <div className="absolute inset-0 bg-gradient-to-b from-slate-50/50 to-white pointer-events-none" />
        <div className="max-w-3xl text-center relative z-10">
          <motion.h1 className="text-5xl md:text-7xl font-bold text-slate-900 mb-6 leading-tight" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.1 }}>
            <TypewriterEffect words={['Scientific Investing', 'Systematic Alpha', 'Quantitative Edge', 'Data-Driven Returns']} className="text-blue-600" />
          </motion.h1>
          <motion.p className="text-xl text-slate-600 mb-10 leading-relaxed max-w-2xl mx-auto" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.3 }}>
            Institutional-grade quantitative strategies delivering superior risk-adjusted returns through rigorous research and systematic portfolio construction.
          </motion.p>
          <motion.div className="flex gap-4 justify-center flex-wrap" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.5 }}>
            <Link href="/strategies" className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-8 py-3.5 rounded-lg font-medium inline-flex items-center gap-2 transition-all shadow-lg hover:shadow-xl border border-blue-500/30">Explore Strategies <ArrowRight className="w-4 h-4" /></Link>
            <Link href="/solutions" className="border border-slate-200 text-slate-700 hover:border-slate-300 hover:bg-slate-50 px-8 py-3.5 rounded-lg font-medium inline-flex items-center gap-2 transition-all">Investment Solutions</Link>
          </motion.div>
        </div>
      </section>

      <section className="bg-white border-b border-slate-100">
        <PerformanceTicker />
      </section>

      <section className="bg-white border-y border-slate-100">
        <div className="max-w-7xl mx-auto px-6 py-14">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {[{ label: 'Assets Under Management', value: 1.5, prefix: '$', suffix: 'B+' }, { label: 'Investment Strategies', value: 4, prefix: '', suffix: '' }, { label: 'Investment Professionals', value: 14, prefix: '', suffix: '' }, { label: 'Years of Track Record', value: 10, prefix: '', suffix: '+' }].map((stat, idx) => (
              <motion.div key={stat.label} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: idx * 0.1 }} viewport={{ once: true, margin: '-100px' }}>
                <ScrollReveal delay={idx * 100}>
                  <div className="text-center">
                    <div className="text-4xl font-bold text-slate-900 mb-2">{stat.prefix}<AnimatedCounter target={stat.value} suffix={stat.suffix} duration={2000} /></div>
                    <p className="text-sm text-slate-500 font-medium">{stat.label}</p>
                  </div>
                </ScrollReveal>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 px-6 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">
            <ScrollReveal>
              <div>
                <p className="text-sm font-semibold text-blue-600 mb-2 uppercase tracking-wide">Our Approach</p>
                <h2 className="text-4xl font-bold text-slate-900 mb-6 leading-tight">At the Intersection of Technology, Data & Finance</h2>
                <p className="text-lg text-slate-600 leading-relaxed mb-6">We believe that systematic, quantitative approaches to investing deliver superior risk-adjusted returns. Our team combines decades of institutional experience with cutting-edge research in machine learning, signal processing, and portfolio optimization.</p>
                <Link href="/team" className="inline-flex items-center gap-2 text-blue-600 font-medium hover:text-blue-700 transition-colors">Meet our team <ChevronRight className="w-4 h-4" /></Link>
              </div>
            </ScrollReveal>
            <ScrollReveal delay={200}>
              <div className="space-y-5">
                {[{ icon: TrendingUp, title: 'Quantitative Research', desc: 'Deep analysis of market dynamics, credit fundamentals, and risk factors using proprietary models and ML.' }, { icon: BarChart3, title: 'Systematic Construction', desc: 'Rules-based portfolio building using optimization models with disciplined allocation and rebalancing.' }, { icon: Shield, title: 'Dynamic Risk Management', desc: 'Continuous monitoring with ML-driven regime classification and proactive hedging strategies.' }].map((item) => (
                  <Card key={item.title} className="p-6 border border-slate-200 bg-white hover:border-blue-200 transition-colors">
                    <div className="flex gap-4">
                      <div className="flex-shrink-0 w-12 h-12 rounded-lg bg-blue-50 flex items-center justify-center"><item.icon className="w-6 h-6 text-blue-600" /></div>
                      <div><h3 className="text-lg font-semibold text-slate-900 mb-2">{item.title}</h3><p className="text-sm text-slate-600 leading-relaxed">{item.desc}</p></div>
                    </div>
                  </Card>
                ))}
              </div>
            </ScrollReveal>
          </div>
        </div>
      </section>

      <section className="py-20 px-6 bg-slate-50 border-t border-slate-100">
        <div className="max-w-7xl mx-auto">
          <ScrollReveal>
            <div className="flex items-end justify-between mb-12">
              <div>
                <p className="text-sm font-semibold text-blue-600 mb-3 uppercase tracking-wide">Strategies</p>
                <h2 className="text-4xl font-bold text-slate-900">Our Investment Solutions</h2>
              </div>
              <Link href="/strategies" className="hidden md:inline-flex items-center gap-2 text-blue-600 font-medium hover:text-blue-700 transition-colors">View all strategies <ArrowRight className="w-4 h-4" /></Link>
            </div>
          </ScrollReveal>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {funds.slice(0, 4).map((fund, index) => (
              <ScrollReveal key={fund.slug} delay={index * 100}>
                <Link href={`/strategies/${fund.slug}`}>
                  <motion.div whileHover={{ y: -4, scale: 1.01 }} whileTap={{ scale: 0.99 }} transition={{ type: 'spring', stiffness: 300, damping: 20 }}>
                    <Card className="h-full p-6 border border-slate-200 bg-white hover:border-blue-200 hover:shadow-md transition-all cursor-pointer group">
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <h3 className="text-lg font-bold text-slate-900 group-hover:text-blue-600 transition-colors">{fund.name}</h3>
                          <div className="flex gap-2 mt-1">
                            <span className="px-2 py-0.5 bg-slate-100 text-slate-600 rounded text-xs">{fund.assetClass}</span>
                            <span className="px-2 py-0.5 bg-slate-100 text-slate-600 rounded text-xs">{fund.vehicle}</span>
                          </div>
                        </div>
                        <ArrowRight className="w-5 h-5 text-slate-300 group-hover:text-blue-600 transition-colors" />
                      </div>
                      <p className="text-sm text-slate-600 leading-relaxed mb-4 line-clamp-2">{fund.description}</p>
                      <div className="grid grid-cols-3 gap-4 pt-4 border-t border-slate-100 text-center">
                        <div><p className="text-sm font-bold text-slate-900">{formatPercent(fund.returns.oneYear)}</p><p className="text-xs text-slate-500 mt-1">1-Year</p></div>
                        <div><p className="text-sm font-bold text-slate-900">{formatPercent(fund.returns.sinceInception)}</p><p className="text-xs text-slate-500 mt-1">Since Inception</p></div>
                        <div><p className="text-sm font-bold text-slate-900">{fund.sharpe?.toFixed(2) ?? 'N/A'}</p><p className="text-xs text-slate-500 mt-1">Sharpe</p></div>
                      </div>
                    </Card>
                  </motion.div>
                </Link>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 px-6 bg-white">
        <div className="max-w-7xl mx-auto">
          <ScrollReveal>
            <div className="mb-12">
              <p className="text-sm font-semibold text-blue-600 mb-3 uppercase tracking-wide">Our Investment Process</p>
              <h2 className="text-4xl font-bold text-slate-900 mb-2">Investment Capabilities</h2>
              <p className="text-lg text-slate-500">A systematic pipeline approach that defines our entire investment methodology</p>
            </div>
          </ScrollReveal>
          <ScrollReveal delay={200}><InvestmentCapabilities /></ScrollReveal>
        </div>
      </section>

      <section className="py-12 px-6 bg-slate-50 border-y border-slate-100">
        <div className="max-w-7xl mx-auto">
          <ScrollReveal><p className="text-center text-sm font-semibold text-slate-400 uppercase tracking-wide mb-8">Trusted by Canada's Leading Institutions</p></ScrollReveal>
          <ScrollReveal delay={200}><ClientLogos /></ScrollReveal>
        </div>
      </section>

      <section className="py-20 px-6 bg-white border-b border-slate-100">
        <div className="max-w-7xl mx-auto">
          <ScrollReveal>
            <div className="mb-12">
              <p className="text-sm font-semibold text-blue-600 mb-3 uppercase tracking-wide"><Newspaper className="w-4 h-4 inline-block mr-1 -mt-0.5" />News & Milestones</p>
              <h2 className="text-4xl font-bold text-slate-900">Recent Developments</h2>
            </div>
          </ScrollReveal>
          <ScrollReveal delay={200}><NewsTimeline /></ScrollReveal>
        </div>
      </section>

      <section className="py-20 px-6 bg-slate-900">
        <div className="max-w-3xl mx-auto text-center">
          <ScrollReveal>
            <motion.h2 className="text-4xl font-bold text-white mb-6" initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} viewport={{ once: true, margin: '-100px' }}>Ready to explore systematic investing?</motion.h2>
            <motion.p className="text-lg text-slate-400 mb-8" initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.1 }} viewport={{ once: true, margin: '-100px' }}>Connect with our team to learn how our quantitative approach can deliver superior risk-adjusted returns for your portfolio.</motion.p>
            <motion.div className="flex gap-4 justify-center flex-wrap" initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.2 }} viewport={{ once: true, margin: '-100px' }}>
              <Link href="/contact" className="bg-white text-slate-900 hover:bg-slate-100 px-8 py-3.5 rounded-lg font-medium inline-flex items-center gap-2 transition-colors">Get in Touch <ArrowRight className="w-4 h-4" /></Link>
              <Link href="/solutions" className="border border-white/20 text-white hover:border-white/40 px-8 py-3.5 rounded-lg font-medium inline-flex items-center gap-2 transition-colors">View Solutions</Link>
            </motion.div>
          </ScrollReveal>
        </div>
      </section>
    </main>
  );
}