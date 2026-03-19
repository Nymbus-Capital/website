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
import gsap from 'gsap';

const newsItems = [
  { date: 'January 2025', title: 'Mageska Capital Partnership', category: 'Partnership', description: 'Mageska entrusts Nymbus with portable alpha strategy management for institutional clients.', color: 'from-blue-500 to-blue-600' },
  { date: 'April 2024', title: 'Tobacco-Free Finance Pledge', category: 'ESG', description: 'Nymbus commits to excluding tobacco companies from all portfolios globally.', color: 'from-emerald-500 to-emerald-600' },
  { date: 'November 2023', title: 'RBC Fund Ranking', category: 'Recognition', description: 'All three fixed income strategies ranked in top percentiles of the RBC Fund Study.', color: 'from-indigo-500 to-indigo-600' },
  { date: 'October 2023', title: 'Community Impact', category: 'Community', description: 'Nymbus partners with Dans la rue to support at-risk youth in Montreal.', color: 'from-slate-700 to-slate-800' },
  { date: 'March 2022', title: 'FMOQ Institutional Mandate', category: 'Growth', description: "Awarded mandate from the Quebec medical professionals' investment fund.", color: 'from-blue-600 to-blue-700' },
  { date: 'September 2020', title: 'Historic Three-Firm Merger', category: 'Milestone', description: 'Union of Nymbus Capital, Gestion de portefeuille Landry, and Perseus Capital.', color: 'from-slate-800 to-slate-900' },
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

function InvestorLogoBar() {
  const logos = [
    { name: 'FMOQ', url: 'https://www.nymbus.ca/wp-content/uploads/2024/01/logo-fmoq.png' },
    { name: 'PGEQ', url: 'https://www.nymbus.ca/wp-content/uploads/2024/01/logo-pgeq-fr.png' },
    { name: 'Fondaction', url: 'https://www.nymbus.ca/wp-content/uploads/2024/01/logo-fondaction.png' },
    { name: 'GardaWorld', url: 'https://www.nymbus.ca/wp-content/uploads/2024/01/logo-gardaworld.png' },
  ];

  return (
    <div className="w-full bg-white">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        {logos.map((logo, index) => (
          <motion.div
            key={index}
            whileHover={{ scale: 0.97 }}
            transition={{ duration: 0.3 }}
            className="h-full"
          >
            <div className="rounded-xl border border-slate-200 p-8 h-full flex items-center justify-center bg-white group hover:border-blue-400 hover:shadow-lg transition-all duration-300">
              <motion.div
                whileHover={{ filter: 'blur(4px)' }}
                transition={{ duration: 0.3 }}
                className="transition-all duration-300"
              >
                <img
                  src={logo.url}
                  alt={logo.name}
                  className="max-h-12 w-auto object-contain"
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = 'none';
                  }}
                />
              </motion.div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

function NewsCarousel() {
  return (
    <div className="w-full overflow-x-auto pb-4 scrollbar-hide">
      <div className="flex gap-6 min-w-min">
        {newsItems.map((item, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
            viewport={{ once: true, margin: '-50px' }}
            whileHover={{ scale: 1.02, y: -8 }}
            className="flex-shrink-0 min-w-[280px] md:min-w-[350px] max-w-[320px] md:max-w-[350px] snap-center"
          >
            <div className="h-full min-h-[300px] rounded-xl overflow-hidden bg-white border border-slate-200 shadow-md hover:shadow-xl transition-all duration-300 flex flex-col">
              {/* Colored gradient header */}
              <div className={`bg-gradient-to-br ${item.color} px-6 pt-8 pb-6 flex flex-col justify-end min-h-[40%]`}>
                <span className="text-white text-xs uppercase font-bold tracking-wider mb-3">{item.category}</span>
                <h3 className="text-white font-bold text-xl leading-tight">{item.title}</h3>
              </div>

              {/* White content area */}
              <div className="flex-1 p-6 flex flex-col justify-between bg-white">
                <div>
                  <p className="text-slate-500 text-sm font-medium mb-3">{item.date}</p>
                  <p className="text-slate-600 text-sm leading-relaxed">{item.description}</p>
                </div>
                <div className="mt-4 flex items-center text-slate-400 group-hover:text-blue-600 transition-colors">
                  <ArrowRight className="w-4 h-4" />
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      <style jsx>{`
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
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
            {funds.filter(f => f.slug !== 'multi-strategy-managed-account').slice(0, 4).map((fund, index) => (
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

      <section className="py-12 px-6 bg-white border-y border-slate-100">
        <div className="max-w-7xl mx-auto">
          <ScrollReveal><p className="text-center text-sm font-semibold text-slate-400 uppercase tracking-wide mb-8">Trusted by Canada's Leading Institutions</p></ScrollReveal>
          <ScrollReveal delay={200}><InvestorLogoBar /></ScrollReveal>
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
          <ScrollReveal delay={200}><NewsCarousel /></ScrollReveal>
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