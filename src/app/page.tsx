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
  { date: 'January 28, 2025', title: 'Mageska Capital and Nymbus Capital announce a partnership', category: 'Partnership', description: 'Mageska entrusts Nymbus with the management of a specific portion of the Mageska Fund to implement a portable alpha strategy.', image: 'https://www.nymbus.ca/wp-content/uploads/2025/01/2025-01_Mageska-1000x600.png', article: 'Mageska Capital Inc., an innovative investment management firm, announces today a partnership with Nymbus Capital Inc, an asset management firm recognized for its avant-garde systematic strategies and rigorous risk management.\n\nUnder this agreement, Mageska Capital entrusts Nymbus Capital with the management of a specific portion of the Mageska Fund to implement a portable alpha strategy. Thanks to Nymbus Capital\'s recognized expertise in low-volatility strategies uncorrelated with traditional indices, this collaboration aims to enhance the Fund\'s overall return potential while reducing its correlation with its benchmark index.\n\nBoth firms share a common vision of investment, combining innovation, technology and discipline to offer investors high-performing, sustainable solutions.', link: 'https://www.nymbus.ca/en/nouvelles/mageska-capital-and-nymbus-capital-announce-a-partnership/' },
  { date: 'April 23, 2024', title: 'Nymbus becomes a signatory of the Tobacco-Free Finance Pledge', category: 'ESG', description: 'Nymbus commits to excluding tobacco companies from all its portfolios.', image: 'https://www.nymbus.ca/wp-content/uploads/2024/04/Nouvelle-Site-Web-Signature-Tabacco-Free-Finance-Pledge-1000x600.png', article: 'We\'re proud to announce that Nymbus has become a signatory of the Tobacco-Free Finance Pledge led by Tobacco Free Portfolios and that we\'re committed to excluding tobacco companies from all its portfolios.\n\nPublic health programs around the world are spending billions every year treating cancer, emphysema, heart disease, and many other diseases linked to tobacco use. At Nymbus, we think that institutional investors and asset managers can play an active role in the global fight against tobacco.\n\nWith eight million deaths worldwide each year and one billion deaths projected this century due to tobacco-related illnesses, it is vital to build on global and multi-stakeholder collaboration to fight the devastating impact of tobacco on society, as well as on the environment.', link: 'https://www.nymbus.ca/en/nouvelles/nymbus-becomes-a-signatory-of-the-tobacco-free-finance-pledge/' },
  { date: 'November 16, 2023', title: 'Nymbus fixed income funds ranked in top percentiles', category: 'Recognition', description: 'All three fixed income strategies ranked in top percentiles of the RBC Fund Study.', image: 'https://www.nymbus.ca/wp-content/uploads/2024/02/2023-11-16_Classement-RBC-1000x600.png', article: 'Nymbus Capital is proud to announce that all three of its fixed income strategies managed by the firm have been ranked in the top percentiles of the RBC Fund Study, a comprehensive analysis of Canadian investment fund performance.\n\nThis recognition reflects the firm\'s disciplined quantitative approach to fixed income investing, combining systematic credit analysis with rigorous risk management. The consistent top-tier performance across all three strategies demonstrates the robustness of our investment methodology across different market conditions.', link: 'https://www.nymbus.ca/en/news/' },
  { date: 'October 3, 2023', title: 'Nymbus partners with Dans la rue', category: 'Community', description: 'Supporting at-risk youth — 20% of homeless people in Canada are between 13 and 24 years old.', image: 'https://www.nymbus.ca/wp-content/uploads/2024/02/2023-11-03_Dans-la-rue-1000x600.png', article: 'Nymbus Capital is proud to announce its partnership with Dans la rue, a Montreal-based organization dedicated to supporting homeless and at-risk youth.\n\nDid you know that 20% of homeless people in Canada are between 13 and 24 years old? Dans la rue has been working since 1988 to help young people in difficulty get off the streets and build a better future. The organization provides essential services including emergency shelter, food, counseling, and educational support.\n\nAt Nymbus, we believe in giving back to our community. This partnership represents our commitment to making a positive impact beyond the financial markets.', link: 'https://www.nymbus.ca/en/news/' },
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
  const allLogos = [...logos, ...logos, ...logos, ...logos];

  return (
    <div className="relative w-full overflow-hidden py-8">
      <div className="absolute left-0 top-0 bottom-0 w-32 bg-gradient-to-r from-white to-transparent pointer-events-none z-10" />
      <div className="absolute right-0 top-0 bottom-0 w-32 bg-gradient-to-l from-white to-transparent pointer-events-none z-10" />
      <div className="logo-marquee flex items-center gap-20">
        {allLogos.map((logo, idx) => (
          <div key={idx} className="flex-shrink-0 px-6">
            <img src={logo.url} alt={logo.name} className="h-10 md:h-12 w-auto object-contain transition-all duration-500 hover:scale-110" style={{ filter: 'brightness(0) opacity(0.5)' }} onMouseOver={(e) => (e.currentTarget.style.filter = 'brightness(0) opacity(0.8)')} onMouseOut={(e) => (e.currentTarget.style.filter = 'brightness(0) opacity(0.5)')} />
          </div>
        ))}
      </div>
      <style jsx>{`
        @keyframes logoMarquee { 0% { transform: translateX(0); } 100% { transform: translateX(-25%); } }
        .logo-marquee { animation: logoMarquee 30s linear infinite; }
        .logo-marquee:hover { animation-play-state: paused; }
      `}</style>
    </div>
  );
}

function NewsCarousel() {
  const [current, setCurrent] = useState(0);
  const [openArticle, setOpenArticle] = useState<number | null>(null);

  useEffect(() => {
    if (openArticle !== null) return;
    const timer = setInterval(() => {
      setCurrent((prev) => (prev + 1) % newsItems.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [openArticle]);

  return (
    <div className="w-full">
      <div className="relative">
        <button onClick={() => setCurrent((prev) => (prev - 1 + newsItems.length) % newsItems.length)} className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 lg:-translate-x-12 z-20 w-10 h-10 rounded-full bg-white border border-slate-200 shadow-md flex items-center justify-center hover:bg-slate-50 transition-colors" aria-label="Previous"><ArrowRight className="w-4 h-4 text-slate-600 rotate-180" /></button>
        <button onClick={() => setCurrent((prev) => (prev + 1) % newsItems.length)} className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 lg:translate-x-12 z-20 w-10 h-10 rounded-full bg-white border border-slate-200 shadow-md flex items-center justify-center hover:bg-slate-50 transition-colors" aria-label="Next"><ArrowRight className="w-4 h-4 text-slate-600" /></button>

        <div className="overflow-hidden rounded-xl">
          <AnimatePresence mode="wait">
            <motion.div key={current} initial={{ opacity: 0, x: 60 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -60 }} transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="aspect-[5/3] rounded-xl overflow-hidden bg-slate-100">
                  <img src={newsItems[current].image} alt={newsItems[current].title} className="w-full h-full object-cover" />
                </div>
                <div className="flex flex-col justify-center py-4">
                  <div className="flex items-center gap-3 mb-4">
                    <span className="px-3 py-1 bg-blue-50 text-blue-600 rounded-full text-xs font-bold uppercase tracking-wider">{newsItems[current].category}</span>
                    <span className="text-sm text-slate-400 flex items-center gap-1.5"><Calendar className="w-3.5 h-3.5" />{newsItems[current].date}</span>
                  </div>
                  <h3 className="text-2xl font-bold text-slate-900 mb-3 leading-tight">{newsItems[current].title}</h3>
                  <p className="text-slate-600 leading-relaxed">{newsItems[current].description}</p>
                  <div className="mt-6">
                    <button onClick={() => setOpenArticle(current)} className="text-blue-600 font-medium text-sm inline-flex items-center gap-1.5 hover:gap-2.5 transition-all cursor-pointer">
                      Read more <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>

        <div className="flex justify-center gap-2.5 mt-8">
          {newsItems.map((_, index) => (
            <button key={index} onClick={() => setCurrent(index)} className={`h-2 rounded-full transition-all duration-300 ${index === current ? 'bg-blue-600 w-8' : 'bg-slate-300 w-2 hover:bg-slate-400'}`} aria-label={`Go to slide ${index + 1}`} />
          ))}
        </div>
      </div>

      {/* Article Modal */}
      <AnimatePresence>
        {openArticle !== null && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50" onClick={() => setOpenArticle(null)}>
            <motion.div initial={{ scale: 0.9, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.9, opacity: 0, y: 20 }} transition={{ type: 'spring', damping: 25, stiffness: 300 }} className="bg-white rounded-2xl max-w-2xl w-full max-h-[85vh] overflow-y-auto relative" onClick={(e) => e.stopPropagation()}>
              <div className="aspect-[5/3] w-full overflow-hidden rounded-t-2xl">
                <img src={newsItems[openArticle].image} alt={newsItems[openArticle].title} className="w-full h-full object-cover" />
              </div>
              <button onClick={() => setOpenArticle(null)} className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/90 shadow-md flex items-center justify-center hover:bg-white transition-colors">
                <span className="text-slate-600 text-lg leading-none">&times;</span>
              </button>
              <div className="p-8">
                <div className="flex items-center gap-3 mb-4">
                  <span className="px-3 py-1 bg-blue-50 text-blue-600 rounded-full text-xs font-bold uppercase tracking-wider">{newsItems[openArticle].category}</span>
                  <span className="text-sm text-slate-400 flex items-center gap-1.5"><Calendar className="w-3.5 h-3.5" />{newsItems[openArticle].date}</span>
                </div>
                <h2 className="text-2xl font-bold text-slate-900 mb-4 leading-tight">{newsItems[openArticle].title}</h2>
                {newsItems[openArticle].article.split('\n\n').map((paragraph, i) => (
                  <p key={i} className="text-slate-600 leading-relaxed mb-3">{paragraph}</p>
                ))}
                <div className="pt-4 mt-2 border-t border-slate-100">
                  <a href={newsItems[openArticle].link} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-700 font-medium text-sm inline-flex items-center gap-1.5">Read full article on nymbus.ca <ArrowRight className="w-4 h-4" /></a>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
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
            {[{ label: 'Assets Under Management', value: 1.5, prefix: '$', suffix: 'B+' }, { label: 'Investment Strategies', value: 5, prefix: '', suffix: '' }, { label: 'Investment Professionals', value: 9, prefix: '', suffix: '' }, { label: 'Years of Track Record', value: 10, prefix: '', suffix: '+' }].map((stat, idx) => (
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