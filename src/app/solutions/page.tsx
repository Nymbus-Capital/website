'use client';

import { useState } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { Card } from '@/components/ui/Card';
import { ScrollReveal } from '@/components/animations/ScrollReveal';
import { cn } from '@/lib/utils';
import { funds } from '@/data/funds';
import { formatPercent } from '@/lib/utils';
import { useTranslation } from '@/lib/i18n';
import {
  Building2, Users, Briefcase, ArrowRight, Shield, TrendingUp,
  DollarSign, Globe, CheckCircle, ChevronRight, Target,
} from 'lucide-react';

type InvestorType = 'institutional' | 'family-office' | 'advisor';

const investorTypes = [
  { key: 'institutional' as const, label: 'Institutional Investors', labelFr: 'Investisseurs institutionnels', icon: Building2, desc: 'Pension funds, endowments, foundations, and insurance companies.', descFr: 'Caisses de retraite, fonds de dotation, fondations et compagnies d\'assurance.' },
  { key: 'family-office' as const, label: 'Family Offices', labelFr: 'Bureaux familiaux', icon: Users, desc: 'Single and multi-family offices seeking sophisticated investment solutions.', descFr: 'Bureaux unifamiliaux et multifamiliaux recherchant des solutions d\'investissement sophistiquées.' },
  { key: 'advisor' as const, label: 'Investment Advisors', labelFr: 'Conseillers en placement', icon: Briefcase, desc: 'IIROC and CSA registered advisors building client portfolios.', descFr: 'Conseillers inscrits auprès de l\'OCRI et des ACVM construisant des portefeuilles clients.' },
];

const solutions: Record<InvestorType, { title: string; titleFr: string; benefits: string[]; benefitsFr: string[]; minInvestment: string; vehicles: string[]; vehiclesFr: string[]; strategies: string[] }> = {
  institutional: {
    title: 'Institutional Solutions',
    titleFr: 'Solutions institutionnelles',
    benefits: ['Customized mandates tailored to IPS requirements', 'Dedicated portfolio management team', 'Comprehensive risk reporting and attribution', 'ESG integration and exclusion customization', 'Quarterly investment committee presentations'],
    benefitsFr: ['Mandats personnalisés adaptés aux exigences de l\'ÉPS', 'Équipe dédiée de gestion de portefeuille', 'Rapports de risque et attribution complets', 'Intégration ESG et personnalisation des exclusions', 'Présentations trimestrielles au comité de placement'],
    minInvestment: '$5,000,000',
    vehicles: ['Managed Account', 'Pooled Fund', 'Custom Mandate'],
    vehiclesFr: ['Compte géré', 'Fonds commun', 'Mandat personnalisé'],
    strategies: ['sustainable-enhanced-short-term-bonds', 'sustainable-enhanced-bonds', 'multi-strategy', 'global-minimum-volatility'],
  },
  'family-office': {
    title: 'Family Office Solutions',
    titleFr: 'Solutions pour bureaux familiaux',
    benefits: ['Multi-strategy diversification across asset classes', 'Absolute return focus with downside protection', 'Tax-efficient structure optimization', 'Direct CIO access and transparent reporting', 'Co-investment opportunities in select strategies'],
    benefitsFr: ['Diversification multistratégie à travers les classes d\'actifs', 'Rendement absolu avec protection contre les baisses', 'Optimisation de la structure fiscale', 'Accès direct au CIO et rapports transparents', 'Occasions de co-investissement dans des stratégies sélectionnées'],
    minInvestment: '$1,000,000',
    vehicles: ['Managed Account', 'Pooled Fund', 'Mutual Fund'],
    vehiclesFr: ['Compte géré', 'Fonds commun', 'Fonds commun de placement'],
    strategies: ['multi-strategy', 'sustainable-enhanced-short-term-bonds', 'sustainable-enhanced-bonds', 'global-minimum-volatility'],
  },
  advisor: {
    title: 'Advisor Solutions',
    titleFr: 'Solutions pour conseillers',
    benefits: ['Mutual fund access for client portfolios', 'Model portfolio integration support', 'Marketing and educational materials', 'Dedicated advisor support team', 'Due diligence documentation on demand'],
    benefitsFr: ['Accès aux fonds communs pour les portefeuilles clients', 'Soutien à l\'intégration de portefeuilles modèles', 'Matériel marketing et éducatif', 'Équipe de soutien dédiée aux conseillers', 'Documentation de vérification diligente sur demande'],
    minInvestment: '$1,000',
    vehicles: ['Mutual Fund (Series F)', 'Managed Account (qualified)'],
    vehiclesFr: ['Fonds commun de placement (Série F)', 'Compte géré (qualifié)'],
    strategies: ['sustainable-enhanced-short-term-bonds', 'sustainable-enhanced-bonds'],
  },
};

const fundNamesFr: Record<string, string> = {
  'SEB': 'ODB',
  'Monthly Income': 'Revenu Mensuel',
  'Multi-Strat': 'Multi-stratégies',
  'GMV': 'GMV',
};

const assetClassFr: Record<string, string> = {
  'Fixed Income': 'Revenu fixe',
  'Alternatives': 'Alternatif',
};

export default function SolutionsPage() {
  const { locale } = useTranslation();
  const fr = locale === 'fr';
  const [activeType, setActiveType] = useState<InvestorType>('institutional');
  const sol = solutions[activeType];

  return (
    <main className="bg-white min-h-screen">
      {/* Hero */}
      <section className="bg-white border-b border-slate-100 pt-8 pb-12 px-6">
        <div className="max-w-7xl mx-auto">
          <ScrollReveal>
            <p className="text-sm font-semibold text-blue-600 uppercase tracking-wide mb-2">{fr ? 'Solutions d\'investissement' : 'Investment Solutions'}</p>
            <h1 className="text-4xl font-bold text-slate-900 mb-4">{fr ? 'Solutions adaptées à vos besoins' : 'Solutions Tailored to Your Needs'}</h1>
            <p className="text-lg text-slate-600 max-w-2xl">
              {fr ? 'Que vous gériez du capital institutionnel, dirigiez un bureau familial ou conseilliez des investisseurs individuels, nous avons des solutions d\'investissement systématiques conçues pour votre mandat.' : 'Whether you manage institutional capital, run a family office, or advise individual investors, we have systematic investment solutions designed for your mandate.'}
            </p>
          </ScrollReveal>
        </div>
      </section>

      {/* Investor Type Selector */}
      <section className="py-12 px-6 bg-white">
        <div className="max-w-7xl mx-auto">
          <ScrollReveal>
            <h2 className="text-xl font-bold text-slate-900 mb-6">{fr ? 'Quel type d\'investisseur êtes-vous?' : 'What type of investor are you?'}</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-12">
              {investorTypes.map((type) => {
                const Icon = type.icon;
                return (
                  <button
                    key={type.key}
                    onClick={() => setActiveType(type.key)}
                    className={cn(
                      'text-left p-6 rounded-xl border-2 transition-all',
                      activeType === type.key
                        ? 'border-blue-600 bg-blue-50'
                        : 'border-slate-200 bg-white hover:border-slate-300'
                    )}
                  >
                    <Icon className={cn('w-8 h-8 mb-3', activeType === type.key ? 'text-blue-600' : 'text-slate-400')} />
                    <h3 className="font-bold text-slate-900 mb-1">{fr ? type.labelFr : type.label}</h3>
                    <p className="text-sm text-slate-600">{fr ? type.descFr : type.desc}</p>
                  </button>
                );
              })}
            </div>
          </ScrollReveal>

          {/* Solution Details */}
          <AnimatePresence mode="wait">
            <motion.div
              key={activeType}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.25 }}
            >
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Benefits */}
                <div className="lg:col-span-2">
                  <Card className="p-8 border border-slate-200">
                    <h3 className="text-xl font-bold text-slate-900 mb-6">{fr ? sol.titleFr : sol.title}</h3>
                    <div className="space-y-3">
                      {(fr ? sol.benefitsFr : sol.benefits).map((benefit) => (
                        <div key={benefit} className="flex items-start gap-3">
                          <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                          <p className="text-slate-700">{benefit}</p>
                        </div>
                      ))}
                    </div>
                  </Card>
                </div>

                {/* Quick Facts */}
                <div className="space-y-4">
                  <Card className="p-5 border border-slate-200">
                    <p className="text-xs uppercase tracking-wider text-slate-500 font-semibold mb-1">{fr ? 'Investissement minimum' : 'Minimum Investment'}</p>
                    <p className="text-2xl font-bold text-slate-900">{sol.minInvestment}</p>
                  </Card>
                  <Card className="p-5 border border-slate-200">
                    <p className="text-xs uppercase tracking-wider text-slate-500 font-semibold mb-2">{fr ? 'Véhicules disponibles' : 'Available Vehicles'}</p>
                    <div className="space-y-1">
                      {(fr ? sol.vehiclesFr : sol.vehicles).map((v) => (
                        <p key={v} className="text-sm text-slate-700 flex items-center gap-2">
                          <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                          {v}
                        </p>
                      ))}
                    </div>
                  </Card>
                </div>
              </div>

              {/* Recommended Strategies */}
              <div className="mt-8">
                <h3 className="text-lg font-bold text-slate-900 mb-4">{fr ? 'Stratégies recommandées' : 'Recommended Strategies'}</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {sol.strategies.map((slug) => {
                    const fund = funds.find((f) => f.slug === slug);
                    if (!fund) return null;
                    return (
                      <Link key={slug} href={`/strategies/${slug}`}>
                        <Card className="p-5 border border-slate-200 hover:border-blue-200 hover:shadow-md transition-all cursor-pointer group h-full">
                          <h4 className="font-bold text-slate-900 group-hover:text-blue-600 transition-colors mb-1">{fr ? fundNamesFr[fund.shortName] || fund.shortName : fund.shortName}</h4>
                          <p className="text-xs text-slate-500 mb-3">{fr ? assetClassFr[fund.assetClass] || fund.assetClass : fund.assetClass} · {fund.vehicle}</p>
                          <div className="flex items-center justify-between pt-3 border-t border-slate-100">
                            <span className={cn('text-sm font-bold', fund.returns.sinceInception >= 0 ? 'text-green-600' : 'text-red-600')}>
                              {formatPercent(fund.returns.sinceInception)} SI
                            </span>
                            <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-blue-600 transition-colors" />
                          </div>
                        </Card>
                      </Link>
                    );
                  })}
                </div>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 px-6 bg-slate-50 border-t border-slate-100">
        <div className="max-w-3xl mx-auto text-center">
          <ScrollReveal>
            <h2 className="text-2xl font-bold text-slate-900 mb-4">{fr ? 'Prêt à commencer?' : 'Ready to Get Started?'}</h2>
            <p className="text-slate-600 mb-8">{fr ? 'Notre équipe est disponible pour discuter de vos objectifs d\'investissement et vous recommander les solutions adaptées à votre mandat.' : 'Our team is available to discuss your investment objectives and recommend the right solutions for your mandate.'}</p>
            <Link href="/contact" className="inline-flex items-center gap-2 bg-slate-900 text-white px-8 py-3.5 rounded-lg font-medium hover:bg-slate-800 transition-colors">
              {fr ? 'Planifier une consultation' : 'Schedule a Consultation'} <ArrowRight className="w-4 h-4" />
            </Link>
          </ScrollReveal>
        </div>
      </section>
    </main>
  );
}