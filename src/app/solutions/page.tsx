'use client';

import { useState } from 'react';
import { useTranslation } from '@/lib/i18n';
import { AnimatePresence, motion } from 'framer-motion';

const solutionsData = {
  institutional: {
    titleFr: 'Clients institutionnels',
    benefits: ['Stratégies personnalisées', 'Gestion active', 'Rapports détaillés'],
    benefitsEn: ['Customized strategies', 'Active management', 'Detailed reporting'],
    minimumInvestment: '$5,000,000',
    recommendedStrategies: ['Canadian Fixed Income', 'Global Alternatives', 'Multi-Strategy']
  },
  'family-office': {
    titleFr: 'Bureaux familiaux',
    benefits: ['Gestion multigénérationnelle', 'Planification de patrimoine', 'Conseil en gouvernance'],
    benefitsEn: ['Multigenerational management', 'Wealth planning', 'Governance counsel'],
    minimumInvestment: '$10,000,000',
    recommendedStrategies: ['ESG Fixed Income', 'Credit Opportunities', 'Multi-Strategy']
  },
  advisor: {
    titleFr: 'Conseillers en placement',
    benefits: ['Gestion de portefeuille', 'Support au service à la clientèle', 'Outils de distribution'],
    benefitsEn: ['Portfolio management', 'Client service support', 'Distribution tools'],
    minimumInvestment: '$1,000,000',
    recommendedStrategies: ['Canadian Fixed Income', 'ESG Fixed Income', 'Global Alternatives']
  }
};

export default function SolutionsPage() {
  const { t, locale } = useTranslation();
  const [selectedType, setSelectedType] = useState<'institutional' | 'family-office' | 'advisor'>('institutional');

  const currentSolution = solutionsData[selectedType];
  const benefits = locale === 'fr' ? currentSolution.benefits : currentSolution.benefitsEn;

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Hero Section */}
      <section className="pt-24 pb-16 px-4">
        <div className="max-w-6xl mx-auto text-center">
          <h1 className="text-5xl md:text-6xl font-bold text-white mb-6">
            {t('solutions.title')}
          </h1>
          <p className="text-xl text-slate-300 mb-8 max-w-2xl mx-auto">
            {locale === 'fr'
              ? 'Solutions d\'investissement adaptées à chaque type de client.'
              : t('solutions.subtitle')}
          </p>
        </div>
      </section>

      {/* Investor Type Selector */}
      <section className="py-12 px-4 bg-slate-800/50">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-wrap gap-4 justify-center">
            <button
              onClick={() => setSelectedType('institutional')}
              className={`px-8 py-3 rounded-lg font-semibold transition-all ${
                selectedType === 'institutional'
                  ? 'bg-emerald-500 text-white'
                  : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
              }`}
            >
              {locale === 'fr' ? 'Institutionnel' : 'Institutional'}
            </button>
            <button
              onClick={() => setSelectedType('family-office')}
              className={`px-8 py-3 rounded-lg font-semibold transition-all ${
                selectedType === 'family-office'
                  ? 'bg-emerald-500 text-white'
                  : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
              }`}
            >
              {locale === 'fr' ? 'Bureau familial' : 'Family Office'}
            </button>
            <button
              onClick={() => setSelectedType('advisor')}
              className={`px-8 py-3 rounded-lg font-semibold transition-all ${
                selectedType === 'advisor'
                  ? 'bg-emerald-500 text-white'
                  : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
              }`}
            >
              {locale === 'fr' ? 'Conseillers' : 'Advisors'}
            </button>
          </div>
        </div>
      </section>

      {/* Solution Details */}
      <section className="py-16 px-4">
        <div className="max-w-6xl mx-auto">
          <AnimatePresence mode="wait">
            <motion.div
              key={selectedType}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="grid grid-cols-1 md:grid-cols-3 gap-8"
            >
              {/* Benefits Card */}
              <div className="bg-slate-700/50 rounded-lg p-8">
                <h3 className="text-2xl font-bold text-white mb-6">
                  {locale === 'fr' ? 'Avantages' : 'Benefits'}
                </h3>
                <ul className="space-y-4">
                  {benefits.map((benefit, index) => (
                    <li key={index} className="flex items-start">
                      <span className="text-emerald-400 font-bold mr-3 text-lg">✓</span>
                      <span className="text-slate-300">{benefit}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Minimum Investment Card */}
              <div className="bg-slate-700/50 rounded-lg p-8">
                <h3 className="text-2xl font-bold text-white mb-6">
                  {locale === 'fr' ? 'Investissement minimum' : 'Minimum Investment'}
                </h3>
                <p className="text-4xl font-bold text-emerald-400 mb-4">{currentSolution.minimumInvestment}</p>
                <p className="text-slate-300 text-sm">
                  {locale === 'fr'
                    ? 'Investissement initial requis pour débuter.'
                    : 'Initial investment required to get started.'}
                </p>
              </div>

              {/* Recommended Strategies Card */}
              <div className="bg-slate-700/50 rounded-lg p-8">
                <h3 className="text-2xl font-bold text-white mb-6">
                  {locale === 'fr' ? 'Stratégies recommandées' : 'Recommended Strategies'}
                </h3>
                <ul className="space-y-3">
                  {currentSolution.recommendedStrategies.map((strategy, index) => (
                    <li
                      key={index}
                      className="text-slate-300 bg-slate-600/50 rounded px-3 py-2 text-sm"
                    >
                      {strategy}
                    </li>
                  ))}
                </ul>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 px-4 bg-slate-800/50">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-white mb-6">
            {locale === 'fr'
              ? 'Prêt à commencer?'
              : 'Ready to get started?'}
          </h2>
          <p className="text-xl text-slate-300 mb-8">
            {locale === 'fr'
              ? 'Contactez notre équipe pour discuter de votre solution d\'investissement personnalisée.'
              : 'Contact our team to discuss your customized investment solution.'}
          </p>
          <button className="bg-emerald-500 hover:bg-emerald-600 text-white font-bold py-3 px-8 rounded-lg transition-all">
            {locale === 'fr' ? 'Nous contacter' : 'Get in Touch'}
          </button>
        </div>
      </section>
    </main>
  );
}