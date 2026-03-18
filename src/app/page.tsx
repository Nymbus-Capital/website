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
  { date: '2024', title: 'Nymbus Capital Reaches $1 Billion in Assets Under Management', category: 'Milestone', description: 'A significant milestone reflecting institutional trust and investment excellence.' },
  { date: '2023', title: 'Launch of Sustainable Bond Funds with Fondaction', category: 'Product Launch', description: 'New sustainable bond fund collaboration focused on ESG-forward fixed income investing.' },
  { date: '2023', title: 'Machine Learning Integration in Market Regime Classification', category: 'Innovation', description: 'Cutting-edge ML models now drive dynamic asset allocation across strategies.' },
  { date: '2023', title: 'Zero Fossil Fuel Achievement in Credit Portfolio', category: 'ESG', description: 'Full elimination of fossil fuel exposure from credit holdings, leading Canadian fixed income managers.' },
  { date: '2022', title: 'New Institutional Mandate with FMOQ', category: 'Growth', description: "Awarded mandate from the Quebec medical professionals' investment fund." },
  { date: '2020', title: 'Historic Three-Firm Merger', category: 'Milestone', description: 'Union of Nymbus Capital (2013), Gestion de portefeuille Landry (2002), and Perseus Capital (2005).' },
];

function InvestmentCapabilities() {
  const containerRef = useRef<HTMLDivElement>(null);
  const cardsRef = useRef<(HTMLDivElement | null)[]>([]);

  const capabilities = [
    { icon: Database, title: 'Data & Research', description: 'Deep analysis of market dynamics and fundamental data using proprietary frameworks' },
    { icon: Zap, title: 'Signal Generation', description: 'Advanced ML models to identify alpha-generating signals across asset classes' },
    { icon: Layout, title: 'Portfolio Construction', description: 'Optimized portfolio building using systematic allocation and rebalancing rules' },
    { icon: Lock, title: 'Risk Management', description: 'Continuous monitoring with dynamic hedging and regime-based adjustments' }
  ];

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          cardsRef.current.forEach((card, index) => {
            if (card) {
              gsap.fromTo(card, { opacity: 0, y: 40 }, { opacity: 1, y: 0, duration: 0.6, delay: index * 0.15, ease: 'power2.out' });
            }
          });
          observer.disconnect();
        }
      },
      { threshold: 0.2 }
    );
    if (containerRef.current) observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={containerRef} className="w-full">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        {capabilities.map((cap, index) => (
          <motion.div key={index} ref={(el) => { cardsRef.current[index] = el; }} className="relative" whileHover={{ y: -8 }} transition={{ type: 'spring', stiffness: 300, damping: 20 }}>
            <Card className="h-full p-6 border border-slate-200 bg-white hover:border-blue-300 hover:shadow-lg transition-all duration-300 group">
              <div className="w-12 h-12 rounded-lg bg-blue-50 flex items-center justify-center mb-4 group-hover:bg-blue-100 transition-colors">
                <cap.icon className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="text-lg font-semibold text-slate-900 mb-2">{cap.title}</h3>
              <p className="text-sm text-slate-600 leading-relaxed">{cap.description}</p>
              <div className="absolute bottom-0 left-0 h-1 bg-gradient-to-r from-blue-600 to-transparent w-0 group-hover:w-full transition-all duration-300" />
            </Card>
            {index < capabilities.length - 1 && (
              <div className="hidden lg:flex absolute top-1/2 -right-2 transform -translate-y-1/2 z-0">
                <svg width="40" height="40" viewBox="0 0 40 40" className="text-slate-300">
                  <defs><marker id={`arrowhead-${index}`} markerWidth="10" markerHeight="10" refX="9" refY="3" orient="auto"><polygon points="0 0, 10 3, 0 6" fill="currentColor" /></marker></defs>
                  <line x1="5" y1="20" x2="35" y2="20" stroke="currentColor" strokeWidth="2" markerEnd={`url(#arrowhead-${index})`} />
                </svg>
              </div>
            )}
          </motion.div>
        ))}
      </div>
    </div>
  );
}

function InvestorLogoBar() {
  const logos = [
    { name: 'CDPQ', w: 90 }, { name: 'PSP Investments', w: 130 }, { name: 'OMERS', w: 90 },
    { name: "Ontario Teachers'", w: 130 }, { name: 'BCI', w: 60 }, { name: 'AIMCo', w: 80 },
    { name: 'Desjardins', w: 100 }, { name: 'National Bank', w: 120 }, { name: 'Fiera Capital', w: 110 }, { name: 'iA Financial', w: 100 },
  ];

  return (
    <div className="relative w-full overflow-hidden py-8">
      <div className="absolute left-0 top-0 bottom-0 w-20 bg-gradient-to-r from-slate-50 to-transparent pointer-events-none z-10" />
      <div className="absolute right-0 top-0 bottom-0 w-20 bg-gradient-to-l from-slate-50 to-transparent pointer-events-none z-10" />
      <div className="flex gap-8 animate-scroll">
        {[...logos, ...logos].map((logo, idx) => (
          <div key={idx} className="flex-shrink-0 flex items-center justify-center">
            <svg width={logo.w} height="40" viewBox={`0 0 ${logo.w} 40`} className="drop-shadow-none hover:drop-shadow-md transition-all duration-300">
              <rect x="0" y="8" width={logo.w} height="24" rx="4" fill="#f1f5f9" />
              <text x={logo.w / 2} y="24" textAnchor="middle" fill="#475569" fontSize="11" fontWeight="600" fontFamily="Poppins, system-ui, sans-serif">{logo.name}</text>
            </svg>
          </div>
        ))}
      </div>
      <style jsx>{`
        @keyframes scroll { 0% { transform: translateX(0); } 100% { transform: translateX(calc(-50% - 16px)); } }
        .animate-scroll { animation: scroll 40s linear infinite; }
        .animate-scroll:hover { animation-play-state: paused; }
      `}</style>
    </div>
  );
}

function NewsCarousel() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [itemsToShow, setItemsToShow] = useState(3);

  useEffect(() => {
    const update = () => { setItemsToShow(window.innerWidth >= 1024 ? 3 : window.innerWidth >= 768 ? 2 : 1); };
    update();
    window.addEventListener('resize', update);
    return () => window.removeEventListener('resize', update);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => { setCurrentSlide((prev) => (prev + 1) % Math.ceil(newsItems.length / itemsToShow)); }, 5000);
    return () => clearInterval(interval);
  }, [itemsToShow]);

  const totalSlides = Math.ceil(newsItems.length / itemsToShow);

  return (
    <div className="w-full">
      <div className="relative">
        <div className="overflow-hidden">
          <div className="flex transition-transform duration-500 ease-out" style={{ transform: `translateX(-${currentSlide * 100}%)`, width: `${totalSlides * 100}%` }}>
            {newsItems.map((item, index) => (
              <div key={index} className="flex-shrink-0" style={{ width: `${100 / totalSlides}%` }}>
                <div className={`${itemsToShow === 1 ? 'px-0' : 'px-3'}`}>
                  <motion.div whileHover={{ scale: 1.02 }} transition={{ type: 'spring', stiffness: 300, damping: 20 }}>
                    <Card className="p-6 border border-slate-200 bg-white hover:border-blue-300 transition-all h-full group cursor-pointer relative overflow-hidden">
                      <div className="absolute inset-0 bg-gradient-to-br from-blue-50/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
                      <div className="relative z-10">
                        <div className="flex items-center gap-2 mb-3">
                          <span className="px-2 py-0.5 bg-blue-50 text-blue-600 rounded text-xs font-semibold">{item.category}</span>
                          <span className="text-slate-400 text-xs flex items-center gap-1"><Calendar className="w-3 h-3" /> {item.date}</span>
                        </div>
                        <h3 className="text-base font-bold text-slate-900 mb-2 leading-snug">{item.title}</h3>
                        <p className="text-slate-600 text-sm leading-relaxed">{item.description}</p>
                      </div>
                      <div className="absolute top-4 right-4 text-blue-600 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-x-2 group-hover:translate-x-0">
                        <ArrowRight className="w-5 h-5" />
                      </div>
                    </Card>
                  </motion.div>
                </div>
              </div>
            ))}
          </div>
        </div>
        <button onClick={() => setCurrentSlide((prev) => (prev - 1 + totalSlides) % totalSlides)} className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-12 lg:-translate-x-16 z-10 p-2 rounded-full hover:bg-slate-100 transition-colors" aria-label="Previous slide">
          <ArrowRight className="w-6 h-6 text-slate-400 rotate-180 hover:text-slate-600 transition-colors" />
        </button>
        <button onClick={() => setCurrentSlide((prev) => (prev + 1) % totalSlides)} className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-12 lg:translate-x-16 z-10 p-2 rounded-full hover:bg-slate-100 transition-colors" aria-label="Next slide">
          <ArrowRight className="w-6 h-6 text-slate-400 hover:text-slate-600 transition-colors" />
        </button>
      </div>
      <div className="flex justify-center gap-2 mt-8">
        {Array.from({ length: totalSlides }).map((_, index) => (
          <button key={index} onClick={() => setCurrentSlide(index)} className={`w-2 h-2 rounded-full transition-all duration-300 ${index === currentSlide ? 'bg-blue-600 w-8' : 'bg-slate-300 hover:bg-slate-400'}`} aria-label={`Go to slide ${index + 1}`} />
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
            Rigorous quantitative research and systematic strategies applied to fixed income and multi-asset investing. Built in Montreal for institutional investors worldwide.
          </motion.p>
          <motion.div className="flex gap-4 justify-center flex-wrap" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.5 }}>
            <Link href="/strategies" className="bg-slate-900 hover:bg-slate-800 text-white px-8 py-3.5 rounded-lg font-medium inline-flex items-center gap-2 transition-colors">Explore Strategies <ArrowRight className="w-4 h-4" /></Link>
            <Link href="/solutions" className="border border-slate-200 text-slate-700 hover:border-slate-300 hover:bg-slate-50 px-8 py-3.5 rounded-lg font-medium inline-flex items-center gap-2 transition-all">Investment Solutions</Link>
          </motion.div>
        </div>
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
          <ScrollReveal><p className="text-center text-sm font-semibold text-slate-400 uppercase tracking-wide mb-6">Trusted by Canada&apos;s Leading Institutions</p></ScrollReveal>
          <ScrollReveal delay={200}><InvestorLogoBar /></ScrollReveal>
        </div>
      </section>

      <section className="py-20 px-6 bg-white border-b border-slate-100">
        <div className="max-w-7xl mx-auto">
          <ScrollReveal>
            <div className="flex items-end justify-between mb-12">
              <div>
                <p className="text-sm font-semibold text-blue-600 mb-3 uppercase tracking-wide"><Newspaper className="w-4 h-4 inline-block mr-1 -mt-0.5" />News & Milestones</p>
                <h2 className="text-4xl font-bold text-slate-900">Recent Developments</h2>
              </div>
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
