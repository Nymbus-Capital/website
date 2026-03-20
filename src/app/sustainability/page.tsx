'use client';

import { useEffect, useRef } from 'react';
import { useTranslation } from '@/lib/i18n';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import AnimatedCounter from '@/components/AnimatedCounter';

gsap.registerPlugin(ScrollTrigger);

const strategies = [
  {
    title: 'Exclusion Screening',
    titleFr: 'Filtrage d\'exclusion',
    features: ['Tobacco-Free', 'Weapons-Free', 'Controversial Business']
  },
  {
    title: 'Positive Screening',
    titleFr: 'Filtrage positif',
    features: ['ESG Leaders', 'Sustainable Business', 'Impact Focus']
  },
  {
    title: 'Quantitative ESG Integration',
    titleFr: 'Intégration ESG quantitative',
    features: ['Data-Driven Analysis', 'Risk Assessment', 'Performance Impact']
  }
];

const commitments = [
  {
    title: 'UN PRI Signatory',
    titleFr: 'Signataire des PRI des Nations Unies',
    description: 'Committed to responsible investment principles'
  },
  {
    title: 'Tobacco-Free Finance Pledge',
    titleFr: 'Engagement sans tabac',
    description: 'Zero investment in tobacco products'
  },
  {
    title: 'Zero Fossil Fuel Portfolio',
    titleFr: 'Portefeuille zéro carbone',
    description: 'Divested from fossil fuel extraction'
  }
];

export default function SustainabilityPage() {
  const { t, locale } = useTranslation();
  const cardRefs = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    cardRefs.current.forEach((card, index) => {
      if (card) {
        gsap.fromTo(
          card,
          { opacity: 0, y: 50 },
          {
            opacity: 1,
            y: 0,
            duration: 0.8,
            delay: index * 0.15,
            scrollTrigger: {
              trigger: card,
              start: 'top 80%',
              markers: false
            }
          }
        );
      }
    });
  }, []);

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Hero Section */}
      <section className="pt-24 pb-16 px-4">
        <div className="max-w-6xl mx-auto text-center">
          <h1 className="text-5xl md:text-6xl font-bold text-white mb-6">
            {t('sustainability.title')}
          </h1>
          <p className="text-xl text-slate-300 mb-8 max-w-2xl mx-auto">
            {locale === 'fr'
              ? 'Intégration des principes ESG dans toutes nos stratégies d\'investissement.'
              : t('sustainability.subtitle')}
          </p>
        </div>
      </section>

      {/* ESG Philosophy */}
      <section className="py-16 px-4 bg-slate-800/50">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-white text-center mb-12">
            {locale === 'fr' ? 'Philosophie ESG' : 'ESG Philosophy'}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-slate-700/50 rounded-lg p-8">
              <h3 className="text-2xl font-bold text-emerald-400 mb-4">
                {locale === 'fr' ? 'Intégration fondamentale' : 'Core Integration'}
              </h3>
              <p className="text-slate-300">
                {locale === 'fr'
                  ? 'Les facteurs ESG sont intégrés dans tous les processus d\'analyse et de prise de décision d\'investissement.'
                  : 'ESG factors are integrated into all investment analysis and decision-making processes.'}
              </p>
            </div>
            <div className="bg-slate-700/50 rounded-lg p-8">
              <h3 className="text-2xl font-bold text-emerald-400 mb-4">
                {locale === 'fr' ? 'Transparence' : 'Transparency'}
              </h3>
              <p className="text-slate-300">
                {locale === 'fr'
                  ? 'Rapports détaillés et communication claire sur nos activités ESG et notre impact.'
                  : 'Detailed reporting and clear communication on our ESG activities and impact.'}
              </p>
            </div>
            <div className="bg-slate-700/50 rounded-lg p-8">
              <h3 className="text-2xl font-bold text-emerald-400 mb-4">
                {locale === 'fr' ? 'Responsabilité' : 'Accountability'}
              </h3>
              <p className="text-slate-300">
                {locale === 'fr'
                  ? 'Engagement envers l\'amélioration continue et la responsabilité en matière de durabilité.'
                  : 'Commitment to continuous improvement and sustainability accountability.'}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Strategies */}
      <section className="py-16 px-4">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-white text-center mb-12">
            {locale === 'fr' ? 'Approches stratégiques' : 'Strategic Approaches'}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {strategies.map((strategy, index) => (
              <div
                key={index}
                ref={el => {
                  cardRefs.current[index] = el;
                }}
                className="bg-slate-700/50 rounded-lg p-8 hover:bg-slate-600/50 transition-all"
              >
                <h3 className="text-2xl font-bold text-white mb-4">
                  {locale === 'fr' ? strategy.titleFr : strategy.title}
                </h3>
                <ul className="space-y-3">
                  {strategy.features.map((feature, idx) => (
                    <li key={idx} className="flex items-start text-slate-300">
                      <span className="text-emerald-400 mr-3 font-bold">•</span>
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Commitments */}
      <section className="py-16 px-4 bg-slate-800/50">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-white text-center mb-12">
            {locale === 'fr' ? 'Engagements' : 'Our Commitments'}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {commitments.map((commitment, index) => (
              <div
                key={index}
                className="bg-slate-700/50 rounded-lg p-8 border-l-4 border-emerald-500"
              >
                <h3 className="text-xl font-bold text-emerald-400 mb-3">
                  {locale === 'fr' ? commitment.titleFr : commitment.title}
                </h3>
                <p className="text-slate-300">{commitment.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Impact Metrics */}
      <section className="py-16 px-4">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-white text-center mb-12">
            {locale === 'fr' ? 'Métriques d\'impact' : 'Impact Metrics'}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="text-4xl font-bold text-emerald-400 mb-2">
                <AnimatedCounter to={180} />M
              </div>
              <p className="text-slate-300">{locale === 'fr' ? 'Capital ESG géré' : 'ESG Capital Managed'}</p>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-emerald-400 mb-2">
                <AnimatedCounter to={95} />%
              </div>
              <p className="text-slate-300">{locale === 'fr' ? 'Sans carbone' : 'Carbon-Free Portfolio'}</p>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-emerald-400 mb-2">
                <AnimatedCounter to={100} />%
              </div>
              <p className="text-slate-300">{locale === 'fr' ? 'Sans tabac' : 'Tobacco-Free'}</p>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-emerald-400 mb-2">
                <AnimatedCounter to={2024} />
              </div>
              <p className="text-slate-300">{locale === 'fr' ? 'Signataire PRI ONU' : 'UN PRI Signatory'}</p>
            </div>
          </div>
        </div>
      </section>

      {/* Partnership Section */}
      <section className="py-16 px-4 bg-slate-800/50">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-white mb-6">
            {locale === 'fr' ? 'Partenariat Fondaction' : 'Fondaction Partnership'}
          </h2>
          <p className="text-xl text-slate-300 mb-6">
            {locale === 'fr'
              ? 'Nous collaborons avec Fondaction pour offrir des obligations de développement durable qui soutiennent les entreprises durables au Québec.'
              : 'We partner with Fondaction to offer sustainable development bonds that support sustainable enterprises in Quebec.'}
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-8">
            <div className="bg-slate-700/50 rounded-lg p-6">
              <h3 className="text-lg font-bold text-emerald-400 mb-3">
                {locale === 'fr' ? 'Impact économique' : 'Economic Impact'}
              </h3>
              <p className="text-slate-300 text-sm">
                {locale === 'fr'
                  ? 'Soutenir la création d\'emplois durables et la croissance économique au Québec.'
                  : 'Support sustainable job creation and economic growth in Quebec.'}
              </p>
            </div>
            <div className="bg-slate-700/50 rounded-lg p-6">
              <h3 className="text-lg font-bold text-emerald-400 mb-3">
                {locale === 'fr' ? 'Impact environnemental' : 'Environmental Impact'}
              </h3>
              <p className="text-slate-300 text-sm">
                {locale === 'fr'
                  ? 'Financer les entreprises qui réduisent leur empreinte carbone et environnementale.'
                  : 'Finance companies reducing their carbon and environmental footprint.'}
              </p>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}