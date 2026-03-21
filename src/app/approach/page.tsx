'use client';

import { useRef, useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Card } from '@/components/ui/Card';
import { ScrollReveal } from '@/components/animations/ScrollReveal';
import { useTranslation } from '@/lib/i18n';
import {
  Database, Zap, Layout, Lock, TrendingUp, Shield, Brain,
  BarChart3, ArrowRight, Target, Cpu, GitBranch, Layers,
} from 'lucide-react';

gsap.registerPlugin(ScrollTrigger);

const methodologySteps = [
  {
    icon: Database,
    title: 'Data & Research',
    titleFr: 'Données et recherche',
    subtitle: 'Foundation',
    subtitleFr: 'Fondation',
    description: 'We process vast quantities of public market data — pricing, fundamental credit metrics, macroeconomic indicators, and cross-asset relationships. Using statistical analysis and machine learning, we perform pattern recognition across billions of data points to find opportunities where humans cannot process the sheer volume of information, uncovering hidden relationships that help manage risk more precisely.',
    descriptionFr: 'Nous traitons d\'immenses volumes de données des marchés publics — prix, indicateurs de crédit fondamentaux, indicateurs macroéconomiques et relations inter-actifs. À l\'aide d\'analyses statistiques et d\'apprentissage automatique, nous effectuons de la reconnaissance de tendances sur des milliards de points de données pour trouver des occasions là où l\'humain ne peut traiter un tel volume d\'information, découvrant des relations cachées qui aident à gérer le risque avec plus de précision.',
    details: ['Proprietary credit scoring models', 'Real-time macro regime classification', 'Pattern recognition across billions of data points', 'Cross-asset correlation analysis'],
    detailsFr: ['Modèles propriétaires de notation de crédit', 'Classification macroéconomique en temps réel', 'Reconnaissance de tendances sur des milliards de points de données', 'Analyse de corrélation inter-actifs'],
  },
  {
    icon: Zap,
    title: 'Signal Generation',
    titleFr: 'Génération de signaux',
    subtitle: 'Alpha Discovery',
    subtitleFr: 'Découverte d\'alpha',
    description: 'Advanced machine learning models transform raw data into actionable investment signals. We employ ensemble methods that combine multiple signal sources to improve robustness and reduce the risk of overfitting to historical patterns.',
    descriptionFr: 'Des modèles avancés d\'apprentissage automatique transforment les données brutes en signaux d\'investissement exploitables. Nous utilisons des méthodes d\'ensemble combinant plusieurs sources de signaux pour améliorer la robustesse et réduire le risque de surajustement aux tendances historiques.',
    details: ['Gradient-boosted tree ensembles', 'Neural network regime classifiers', 'Cross-validation and walk-forward testing', 'Signal decay analysis and refresh cycles'],
    detailsFr: ['Ensembles d\'arbres à gradient boosté', 'Classificateurs de régime par réseaux neuronaux', 'Validation croisée et tests walk-forward', 'Analyse de déclin des signaux et cycles de rafraîchissement'],
  },
  {
    icon: Layout,
    title: 'Portfolio Construction',
    titleFr: 'Construction de portefeuille',
    subtitle: 'Optimization',
    subtitleFr: 'Optimisation',
    description: 'Signals feed into our portfolio optimizer, which constructs positions subject to risk budgets, concentration limits, liquidity constraints, and transaction cost models. The result is a systematically balanced portfolio that maximizes risk-adjusted returns.',
    descriptionFr: 'Les signaux alimentent notre optimiseur de portefeuille, qui construit des positions soumises à des budgets de risque, des limites de concentration, des contraintes de liquidité et des modèles de coûts de transaction. Le résultat est un portefeuille systématiquement équilibré qui maximise les rendements ajustés au risque.',
    details: ['Mean-variance with robust covariance estimation', 'Risk parity and factor-aware allocation', 'Transaction cost optimization', 'Rebalancing threshold calibration'],
    detailsFr: ['Moyenne-variance avec estimation robuste de covariance', 'Parité des risques et allocation factorielle', 'Optimisation des coûts de transaction', 'Calibration des seuils de rééquilibrage'],
  },
  {
    icon: Lock,
    title: 'Risk Management',
    titleFr: 'Gestion des risques',
    subtitle: 'Protection',
    subtitleFr: 'Protection',
    description: 'Continuous monitoring through our real-time risk engine tracks hundreds of metrics including VaR, stress tests, concentration, and liquidity. Dynamic hedging adjusts exposure based on market regime classification, proactively protecting capital in adverse conditions.',
    descriptionFr: 'La surveillance continue par notre moteur de risque en temps réel suit des centaines de métriques, notamment la VaR, les tests de résistance, la concentration et la liquidité. La couverture dynamique ajuste l\'exposition en fonction de la classification du régime de marché, protégeant proactivement le capital en conditions défavorables.',
    details: ['Real-time VaR and stress testing', 'ML-driven regime detection (risk-on/off)', 'Dynamic duration and credit hedging', 'Tail risk insurance via options overlays'],
    detailsFr: ['VaR et tests de résistance en temps réel', 'Détection de régime par apprentissage automatique', 'Couverture dynamique de duration et de crédit', 'Assurance contre le risque extrême via superpositions d\'options'],
  },
];

const philosophyPillars = [
  { icon: Brain, title: 'Systematic Over Discretionary', titleFr: 'Systématique plutôt que discrétionnaire', desc: 'Emotion-free decision-making through rules-based processes that are tested, validated, and continuously improved.', descFr: 'Prise de décision sans émotion grâce à des processus basés sur des règles, testés, validés et continuellement améliorés.' },
  { icon: Target, title: 'Risk-Adjusted Returns', titleFr: 'Rendements ajustés au risque', desc: 'We optimize for Sharpe and Sortino ratios, not raw returns. Every basis point of return is evaluated against its risk cost.', descFr: 'Nous optimisons les ratios de Sharpe et de Sortino, pas les rendements bruts. Chaque point de base de rendement est évalué par rapport à son coût en risque.' },
  { icon: Cpu, title: 'Technology-First', titleFr: 'La technologie d\'abord', desc: 'Purpose-built infrastructure processes data at scale, enabling real-time analytics and rapid strategy deployment.', descFr: 'Une infrastructure spécialement conçue traite les données à grande échelle, permettant des analyses en temps réel et un déploiement rapide des stratégies.' },
  { icon: GitBranch, title: 'Continuous Research', titleFr: 'Recherche continue', desc: 'Dedicated quantitative research team constantly exploring new signals, methods, and market structures.', descFr: 'Équipe de recherche quantitative dédiée explorant constamment de nouveaux signaux, méthodes et structures de marché.' },
  { icon: Shield, title: 'Capital Preservation', titleFr: 'Préservation du capital', desc: 'Downside protection is embedded in every strategy through systematic risk limits and dynamic hedging.', descFr: 'La protection contre les baisses est intégrée à chaque stratégie par des limites de risque systématiques et une couverture dynamique.' },
  { icon: Layers, title: 'Multi-Strategy Diversification', titleFr: 'Diversification multistratégie', desc: 'Combining uncorrelated return streams across asset classes and strategy types for smoother compounding.', descFr: 'Combiner des flux de rendement non corrélés à travers les classes d\'actifs et les types de stratégie pour une capitalisation plus régulière.' },
];

export default function ApproachPage() {
  const { locale } = useTranslation();
  const fr = locale === 'fr';
  const timelineRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.utils.toArray<HTMLElement>('.step-card').forEach((card, i) => {
        gsap.fromTo(card,
          { opacity: 0, x: i % 2 === 0 ? -30 : 30 },
          {
            opacity: 1, x: 0, duration: 0.8, ease: 'power2.out',
            scrollTrigger: { trigger: card, start: 'top 80%', toggleActions: 'play none none none' },
          }
        );
      });
    }, timelineRef);

    return () => ctx.revert();
  }, []);

  return (
    <main className="bg-white min-h-screen">
      {/* Hero */}
      <section className="bg-white border-b border-slate-100 pt-8 pb-16 px-6">
        <div className="max-w-7xl mx-auto">
          <ScrollReveal>
            <p className="text-sm font-semibold text-blue-600 uppercase tracking-wide mb-2">{fr ? 'Notre approche' : 'Our Approach'}</p>
            <h1 className="text-4xl md:text-5xl font-bold text-slate-900 mb-6 max-w-3xl leading-tight">
              {fr ? 'À l\'intersection de la technologie, des données et de la finance' : 'At the Intersection of Technology, Data & Finance'}
            </h1>
            <p className="text-lg text-slate-600 max-w-2xl leading-relaxed">
              {fr ? 'Nous croyons que les approches systématiques et quantitatives de l\'investissement offrent des rendements ajustés au risque supérieurs. Notre processus est transparent, reproductible et continuellement affiné par une recherche rigoureuse.' : 'We believe that systematic, quantitative approaches to investing deliver superior risk-adjusted returns. Our process is transparent, repeatable, and continuously refined through rigorous research.'}
            </p>
          </ScrollReveal>
        </div>
      </section>

      {/* Methodology Timeline */}
      <section className="py-20 px-6 bg-white" ref={timelineRef}>
        <div className="max-w-5xl mx-auto">
          <ScrollReveal>
            <h2 className="text-3xl font-bold text-slate-900 mb-4 text-center">{fr ? 'Méthodologie d\'investissement' : 'Investment Methodology'}</h2>
            <p className="text-slate-600 text-center mb-16 max-w-xl mx-auto">{fr ? 'Un pipeline systématique en quatre étapes qui transforme les données brutes en portefeuilles optimisés et gérés en fonction du risque.' : 'A systematic four-step pipeline that transforms raw data into optimized, risk-managed portfolios.'}</p>
          </ScrollReveal>

          <div className="relative">
            <div className="absolute left-1/2 top-0 bottom-0 w-px bg-slate-200 hidden md:block" />
            <div className="space-y-12">
              {methodologySteps.map((step, i) => {
                const Icon = step.icon;
                return (
                  <div key={step.title} className={`step-card flex flex-col md:flex-row items-start gap-8 ${i % 2 === 1 ? 'md:flex-row-reverse' : ''}`}>
                    <div className="flex-1">
                      <Card className="p-8 border border-slate-200">
                        <div className="flex items-center gap-3 mb-4">
                          <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center">
                            <Icon className="w-5 h-5 text-blue-600" />
                          </div>
                          <div>
                            <p className="text-xs font-semibold text-blue-600 uppercase tracking-wider">{fr ? step.subtitleFr : step.subtitle}</p>
                            <h3 className="text-xl font-bold text-slate-900">{fr ? step.titleFr : step.title}</h3>
                          </div>
                        </div>
                        <p className="text-slate-600 leading-relaxed mb-4">{fr ? step.descriptionFr : step.description}</p>
                        <ul className="space-y-2">
                          {(fr ? step.detailsFr : step.details).map((d) => (
                            <li key={d} className="flex items-start gap-2 text-sm text-slate-600">
                              <span className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-1.5 flex-shrink-0" />
                              {d}
                            </li>
                          ))}
                        </ul>
                      </Card>
                    </div>
                    <div className="hidden md:flex w-8 justify-center flex-shrink-0">
                      <div className="w-4 h-4 rounded-full bg-blue-600 border-4 border-white shadow-sm mt-10" />
                    </div>
                    <div className="flex-1 hidden md:block" />
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* Philosophy Pillars */}
      <section className="py-20 px-6 bg-slate-50 border-t border-slate-100">
        <div className="max-w-7xl mx-auto">
          <ScrollReveal>
            <h2 className="text-3xl font-bold text-slate-900 mb-4 text-center">{fr ? 'Philosophie d\'investissement' : 'Investment Philosophy'}</h2>
            <p className="text-slate-600 text-center mb-12 max-w-xl mx-auto">{fr ? 'Les principes fondamentaux qui guident chacune de nos décisions.' : 'The core principles that guide every decision we make.'}</p>
          </ScrollReveal>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {philosophyPillars.map((pillar, i) => {
              const Icon = pillar.icon;
              return (
                <ScrollReveal key={pillar.title} delay={i * 80}>
                  <Card className="p-6 border border-slate-200 bg-white h-full">
                    <Icon className="w-8 h-8 text-blue-600 mb-4" />
                    <h3 className="text-lg font-bold text-slate-900 mb-2">{fr ? pillar.titleFr : pillar.title}</h3>
                    <p className="text-sm text-slate-600 leading-relaxed">{fr ? pillar.descFr : pillar.desc}</p>
                  </Card>
                </ScrollReveal>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 px-6 bg-white border-t border-slate-100">
        <div className="max-w-3xl mx-auto text-center">
          <ScrollReveal>
            <h2 className="text-2xl font-bold text-slate-900 mb-4">{fr ? 'Voyez notre approche en action' : 'See Our Approach in Action'}</h2>
            <p className="text-slate-600 mb-8">{fr ? 'Explorez nos stratégies pour comprendre comment ces principes se traduisent en résultats d\'investissement concrets.' : 'Explore our strategies to understand how these principles translate into real investment outcomes.'}</p>
            <Link href="/strategies" className="inline-flex items-center gap-2 bg-slate-900 text-white px-8 py-3.5 rounded-lg font-medium hover:bg-slate-800 transition-colors">
              {fr ? 'Voir les stratégies' : 'View Strategies'} <ArrowRight className="w-4 h-4" />
            </Link>
          </ScrollReveal>
        </div>
      </section>
    </main>
  );
}