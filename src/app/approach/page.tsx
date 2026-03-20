'use client';

import { useEffect, useRef } from 'react';
import { useTranslation } from '@/lib/i18n';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

const methodology = [
  {
    step: 1,
    title: 'Data & Research',
    titleFr: 'Données et recherche',
    description: 'Comprehensive data gathering and proprietary research frameworks.',
    descriptionFr: 'Collecte de données complète et cadres de recherche propriétaires.'
  },
  {
    step: 2,
    title: 'Signal Generation',
    titleFr: 'Génération de signaux',
    description: 'Advanced analytics to identify investment opportunities.',
    descriptionFr: 'Analyse avancée pour identifier les opportunités d\'investissement.'
  },
  {
    step: 3,
    title: 'Portfolio Construction',
    titleFr: 'Construction de portefeuille',
    description: 'Optimized portfolio assembly with risk constraints.',
    descriptionFr: 'Assemblage de portefeuille optimisé avec contraintes de risque.'
  },
  {
    step: 4,
    title: 'Risk Management',
    titleFr: 'Gestion des risques',
    description: 'Continuous monitoring and adaptive risk controls.',
    descriptionFr: 'Surveillance continue et contrôles de risque adaptatifs.'
  }
];

const philosophy = [
  { title: 'Systematic', titleFr: 'Systématique', icon: '⚙️' },
  { title: 'Risk-Adjusted', titleFr: 'Ajusté au risque', icon: '📊' },
  { title: 'Technology-First', titleFr: 'Technologie d\'abord', icon: '💻' },
  { title: 'Continuous Research', titleFr: 'Recherche continue', icon: '🔬' },
  { title: 'Capital Preservation', titleFr: 'Préservation du capital', icon: '🛡️' },
  { title: 'Diversification', titleFr: 'Diversification', icon: '🌍' }
];

export default function ApproachPage() {
  const { t, locale } = useTranslation();
  const timelineRef = useRef(null);

  useEffect(() => {
    const cards = document.querySelectorAll('[data-timeline-card]');
    cards.forEach((card, index) => {
      gsap.fromTo(
        card,
        { opacity: 0, y: 50 },
        {
          opacity: 1,
          y: 0,
          duration: 0.8,
          delay: index * 0.2,
          scrollTrigger: {
            trigger: card,
            start: 'top 80%',
            markers: false
          }
        }
      );
    });
  }, []);

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Hero Section */}
      <section className="pt-24 pb-16 px-4">
        <div className="max-w-6xl mx-auto text-center">
          <h1 className="text-5xl md:text-6xl font-bold text-white mb-6">
            {t('approach.title')}
          </h1>
          <p className="text-xl text-slate-300 mb-8 max-w-2xl mx-auto">
            {locale === 'fr'
              ? 'Une approche systématique et fondée sur la technologie pour la gestion des investissements.'
              : t('approach.subtitle')}
          </p>
        </div>
      </section>

      {/* Methodology Timeline */}
      <section className="py-20 px-4" ref={timelineRef}>
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-white text-center mb-16">
            {locale === 'fr' ? 'Notre méthodologie' : 'Our Methodology'}
          </h2>
          <div className="space-y-8">
            {methodology.map((item, index) => (
              <div
                key={index}
                data-timeline-card
                className="bg-slate-700/50 rounded-lg p-8 border-l-4 border-emerald-500 hover:bg-slate-600/50 transition-all"
              >
                <div className="flex items-start">
                  <div className="flex-shrink-0 w-12 h-12 rounded-full bg-emerald-500/20 flex items-center justify-center mr-6 border-2 border-emerald-500">
                    <span className="text-xl font-bold text-emerald-400">{item.step}</span>
                  </div>
                  <div className="flex-1">
                    <h3 className="text-2xl font-bold text-white mb-2">
                      {locale === 'fr' ? item.titleFr : item.title}
                    </h3>
                    <p className="text-slate-300 text-lg">
                      {locale === 'fr' ? item.descriptionFr : item.description}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Philosophy Pillars */}
      <section className="py-20 px-4 bg-slate-800/50">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-white text-center mb-16">
            {locale === 'fr' ? 'Principes fondamentaux' : 'Core Philosophy'}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {philosophy.map((item, index) => (
              <div
                key={index}
                className="bg-slate-700/50 rounded-lg p-8 text-center hover:bg-slate-600/50 transition-all"
              >
                <div className="text-4xl mb-4">{item.icon}</div>
                <h3 className="text-xl font-bold text-white">
                  {locale === 'fr' ? item.titleFr : item.title}
                </h3>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Investment Process Details */}
      <section className="py-20 px-4">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-white text-center mb-12">
            {locale === 'fr' ? 'Processus d\'investissement' : 'Investment Process'}
          </h2>
          <div className="bg-slate-700/50 rounded-lg p-8 text-slate-300 space-y-4">
            <p>
              {locale === 'fr'
                ? 'Notre approche systématique combine la recherche fondamentale et l\'analyse quantitative pour identifier les opportunités d\'investissement à long terme.'
                : 'Our systematic approach combines fundamental research with quantitative analysis to identify long-term investment opportunities.'}
            </p>
            <p>
              {locale === 'fr'
                ? 'Chaque décision d\'investissement est fondée sur des données rigoureuses et évaluée par rapport à nos critères de risque ajusté au rendement.'
                : 'Each investment decision is grounded in rigorous data and evaluated against our risk-adjusted return criteria.'}
            </p>
            <p>
              {locale === 'fr'
                ? 'Nous maintenons une discipline stricte en matière de gestion des risques, en mettant en œuvre des contrôles continus et des ajustements de portefeuille.'
                : 'We maintain strict discipline in risk management, implementing continuous monitoring and portfolio adjustments.'}
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}