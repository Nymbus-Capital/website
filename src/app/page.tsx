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
import { newsItems } from '@/data/news';
import { formatPercent } from '@/lib/utils';
import { useTranslation } from '@/lib/i18n';
import { TrendingUp, BarChart3, Shield, ArrowRight, Newspaper, Calendar, ChevronRight, Database, Zap, Layout, Lock } from 'lucide-react';
import gsap from 'gsap';


function InvestmentCapabilities() {
  const { t } = useTranslation();
  const capabilities = [
    { icon: Database, title: t('home.process.steps.dataTitle'), description: t('home.process.steps.dataDesc') },
    { icon: Zap, title: t('home.process.steps.signalTitle'), description: t('home.process.steps.signalDesc') },
    { icon: Layout, title: t('home.process.steps.constructionTitle'), description: t('home.process.steps.constructionDesc') },
    { icon: Lock, title: t('home.process.steps.riskTitle'), description: t('home.process.steps.riskDesc') }
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
  const { t } = useTranslation();
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
                      {t('home.news.readMore')} <ArrowRight className="w-4 h-4" />
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
                  <a href={newsItems[openArticle].link} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-700 font-medium text-sm inline-flex items-center gap-1.5">{t('home.news.readFullArticle')} <ArrowRight className="w-4 h-4" /></a>
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
  const { locale, t } = useTranslation();
  return (
    <main className="bg-white">
      <section className="min-h-[90vh] flex flex-col items-center justify-center px-6 py-20 relative overflow-hidden">
        <DotParticleCanvas />
        <div className="absolute inset-0 bg-gradient-to-b from-slate-50/50 to-white pointer-events-none" />
        <div className="max-w-3xl text-center relative z-10">
          <motion.h1 className="text-5xl md:text-7xl font-bold text-slate-900 mb-6 leading-tight" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.1 }}>
            <TypewriterEffect words={[t('home.hero.word1'), t('home.hero.word2'), t('home.hero.word3'), t('home.hero.word4')]} className="text-blue-600" />
          </motion.h1>
          <motion.p className="text-xl text-slate-600 mb-10 leading-relaxed max-w-2xl mx-auto" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.3 }}>
            {t('home.hero.subtitle')}
          </motion.p>
          <motion.div className="flex gap-4 justify-center flex-wrap" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.5 }}>
            <Link href="/strategies" className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-8 py-3.5 rounded-lg font-medium inline-flex items-center gap-2 transition-all shadow-lg hover:shadow-xl border border-blue-500/30">{t('home.hero.cta1')} <ArrowRight className="w-4 h-4" /></Link>
            <Link href="/solutions" className="border border-slate-200 text-slate-700 hover:border-slate-300 hover:bg-slate-50 px-8 py-3.5 rounded-lg font-medium inline-flex items-center gap-2 transition-all">{t('home.hero.cta2')}</Link>
          </motion.div>
        </div>
      </section>

      <section className="bg-white border-b border-slate-100">
        
      </section>

      <section className="bg-white border-y border-slate-100">
        <div className="max-w-7xl mx-auto px-6 py-14">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {[{ label: t('home.stats.aum'), value: 1.5, prefix: '$', suffix: 'B+' }, { label: t('home.stats.strategies'), value: 5, prefix: '', suffix: '' }, { label: t('home.stats.professionals'), value: 9, prefix: '', suffix: '' }, { label: t('home.stats.trackRecord'), value: 10, prefix: '', suffix: '+' }].map((stat, idx) => (
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
                <p className="text-sm font-semibold text-blue-600 mb-2 uppercase tracking-wide">{t('home.approach.label')}</p>
                <h2 className="text-4xl font-bold text-slate-900 mb-6 leading-tight">{t('home.approach.title')}</h2>
                <p className="text-lg text-slate-600 leading-relaxed mb-6">{t('home.approach.description')}</p>
                <Link href="/team" className="inline-flex items-center gap-2 text-blue-600 font-medium hover:text-blue-700 transition-colors">{t('home.approach.cta')} <ChevronRight className="w-4 h-4" /></Link>
              </div>
            </ScrollReveal>
            <ScrollReveal delay={200}>
              <div className="space-y-5">
                {[{ icon: TrendingUp, title: t('home.approach.research.title'), desc: t('home.approach.research.description') }, { icon: BarChart3, title: t('home.approach.construction.title'), desc: t('home.approach.construction.description') }, { icon: Shield, title: t('home.approach.risk.title'), desc: t('home.approach.risk.description') }].map((item) => (
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
                <p className="text-sm font-semibold text-blue-600 mb-3 uppercase tracking-wide">{t('home.strategies.label')}</p>
                <h2 className="text-4xl font-bold text-slate-900">{t('home.strategies.title')}</h2>
              </div>
              <Link href="/strategies" className="hidden md:inline-flex items-center gap-2 text-blue-600 font-medium hover:text-blue-700 transition-colors">{t('home.strategies.cta')} <ArrowRight className="w-4 h-4" /></Link>
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
                      <p className="text-sm text-slate-600 leading-relaxed mb-4 line-clamp-2">{locale === 'fr' && fund.descriptionFr ? fund.descriptionFr : fund.description}</p>
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
              <p className="text-sm font-semibold text-blue-600 mb-3 uppercase tracking-wide">{t('home.process.label')}</p>
              <h2 className="text-4xl font-bold text-slate-900 mb-2">{t('home.process.title')}</h2>
              <p className="text-lg text-slate-500">{t('home.process.subtitle')}</p>
            </div>
          </ScrollReveal>
          <ScrollReveal delay={200}><InvestmentCapabilities /></ScrollReveal>
        </div>
      </section>

      <section className="py-12 px-6 bg-white border-y border-slate-100">
        <div className="max-w-7xl mx-auto">
          <ScrollReveal><p className="text-center text-sm font-semibold text-slate-400 uppercase tracking-wide mb-8">{t('home.clients.title')}</p></ScrollReveal>
          <ScrollReveal delay={200}><InvestorLogoBar /></ScrollReveal>
        </div>
      </section>

      <section className="py-20 px-6 bg-white border-b border-slate-100">
        <div className="max-w-7xl mx-auto">
          <ScrollReveal>
            <div className="mb-12">
              <p className="text-sm font-semibold text-blue-600 mb-3 uppercase tracking-wide"><Newspaper className="w-4 h-4 inline-block mr-1 -mt-0.5" />{t('home.news.label')}</p>
              <h2 className="text-4xl font-bold text-slate-900">{t('home.news.title')}</h2>
            </div>
          </ScrollReveal>
          <ScrollReveal delay={200}><NewsCarousel /></ScrollReveal>
        </div>
      </section>

      <section className="py-20 px-6 bg-slate-900">
        <div className="max-w-3xl mx-auto text-center">
          <ScrollReveal>
            <motion.h2 className="text-4xl font-bold text-white mb-6" initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} viewport={{ once: true, margin: '-100px' }}>{t('home.cta.title')}</motion.h2>
            <motion.p className="text-lg text-slate-400 mb-8" initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.1 }} viewport={{ once: true, margin: '-100px' }}>{t('home.cta.description')}</motion.p>
            <motion.div className="flex gap-4 justify-center flex-wrap" initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.2 }} viewport={{ once: true, margin: '-100px' }}>
              <Link href="/contact" className="bg-white text-slate-900 hover:bg-slate-100 px-8 py-3.5 rounded-lg font-medium inline-flex items-center gap-2 transition-colors">{t('home.cta.button1')} <ArrowRight className="w-4 h-4" /></Link>
              <Link href="/solutions" className="border border-white/20 text-white hover:border-white/40 px-8 py-3.5 rounded-lg font-medium inline-flex items-center gap-2 transition-colors">{t('home.cta.button2')}</Link>
            </motion.div>
          </ScrollReveal>
        </div>
      </section>
    </main>
  );
}