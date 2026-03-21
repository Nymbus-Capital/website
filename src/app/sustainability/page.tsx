'use client';

import { Card } from '@/components/ui/Card';
import { ScrollReveal } from '@/components/animations/ScrollReveal';
import AnimatedCounter from '@/components/animations/AnimatedCounter';
import Link from 'next/link';
import { useTranslation } from '@/lib/i18n';
import {
  Leaf, Shield, Globe, TrendingDown, Wind, Ban, FileCheck,
  ArrowRight, BarChart3, Target, Award, Zap, Droplets,
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const esgMetrics = [
  { label: 'Carbon Intensity vs Benchmark', labelFr: 'Intensité carbone vs indice de référence', fund: 42, benchmark: 100, unit: 'tCO2e/$M' },
  { label: 'ESG Score (Weighted Avg)', labelFr: 'Score ESG (moyenne pondérée)', fund: 78, benchmark: 62, unit: '/100' },
  { label: 'Green Bond Allocation', labelFr: 'Allocation en obligations vertes', fund: 8.5, benchmark: 2.1, unit: '%' },
  { label: 'Fossil Fuel Exposure', labelFr: 'Exposition aux combustibles fossiles', fund: 0, benchmark: 8.4, unit: '%' },
];

const exclusions = [
  { category: 'Fossil Fuel Production', categoryFr: 'Production de combustibles fossiles', icon: Wind, desc: 'Companies deriving >5% revenue from coal, oil sands, or thermal coal power generation.', descFr: 'Sociétés tirant plus de 5 % de leurs revenus du charbon, des sables bitumineux ou de la production d\'énergie thermique au charbon.' },
  { category: 'Tobacco', categoryFr: 'Tabac', icon: Ban, desc: 'All tobacco manufacturers and distributors.', descFr: 'Tous les fabricants et distributeurs de tabac.' },
  { category: 'Controversial Weapons', categoryFr: 'Armes controversées', icon: Shield, desc: 'Cluster munitions, landmines, biological, chemical, and nuclear weapons manufacturers.', descFr: 'Fabricants de bombes à sous-munitions, mines terrestres, armes biologiques, chimiques et nucléaires.' },
  { category: 'Severe ESG Controversies', categoryFr: 'Controverses ESG sévères', icon: Target, desc: 'Companies rated "Severe" on MSCI ESG Controversies or equivalent.', descFr: 'Sociétés notées « Sévère » selon les controverses ESG de MSCI ou équivalent.' },
];

const greenBondData = [
  { year: '2020', allocation: 3.2 },
  { year: '2021', allocation: 4.8 },
  { year: '2022', allocation: 5.5 },
  { year: '2023', allocation: 7.2 },
  { year: '2024', allocation: 8.5 },
];

const priScorecard = [
  { principle: 'ESG in investment analysis', principleFr: 'ESG dans l\'analyse des placements', score: 95 },
  { principle: 'Active ownership policies', principleFr: 'Politiques d\'actionnariat actif', score: 82 },
  { principle: 'ESG disclosure by investees', principleFr: 'Divulgation ESG par les émetteurs', score: 88 },
  { principle: 'Industry acceptance of ESG', principleFr: 'Acceptation de l\'ESG par l\'industrie', score: 90 },
  { principle: 'Implementation effectiveness', principleFr: 'Efficacité de la mise en \u0153uvre', score: 85 },
  { principle: 'Reporting on ESG activities', principleFr: 'Rapports sur les activités ESG', score: 92 },
];

export default function SustainabilityPage() {
  const { locale } = useTranslation();
  const fr = locale === 'fr';

  return (
    <main className="bg-white min-h-screen">
      {/* Hero */}
      <section className="bg-white border-b border-slate-100 pt-8 pb-12 px-6">
        <div className="max-w-7xl mx-auto">
          <ScrollReveal>
            <p className="text-sm font-semibold text-green-600 uppercase tracking-wide mb-2">{fr ? 'Développement durable' : 'Sustainability'}</p>
            <h1 className="text-4xl font-bold text-slate-900 mb-4">{fr ? 'Investissement responsable' : 'Responsible Investing'}</h1>
            <p className="text-lg text-slate-600 max-w-2xl">
              {fr ? 'L\'intégration ESG est ancrée dans notre processus d\'investissement, pas ajoutée après coup. Nous croyons que les entreprises ayant de solides pratiques environnementales, sociales et de gouvernance offrent des rendements ajustés au risque supérieurs à long terme.' : 'ESG integration is embedded in our investment process, not bolted on. We believe that companies with strong environmental, social, and governance practices deliver superior long-term risk-adjusted returns.'}
            </p>
          </ScrollReveal>
        </div>
      </section>

      {/* ESG Metrics Dashboard */}
      <section className="py-16 px-6 bg-white">
        <div className="max-w-7xl mx-auto">
          <ScrollReveal>
            <h2 className="text-2xl font-bold text-slate-900 mb-8">{fr ? 'Tableau de bord des métriques ESG' : 'ESG Metrics Dashboard'}</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {esgMetrics.map((metric) => (
                <Card key={metric.label} className="p-5 border border-slate-200">
                  <p className="text-xs text-slate-500 font-medium mb-3">{fr ? metric.labelFr : metric.label}</p>
                  <div className="flex items-end gap-3">
                    <div>
                      <p className="text-xs text-slate-400">{fr ? 'Fonds' : 'Fund'}</p>
                      <p className="text-2xl font-bold text-green-600">{metric.fund}{metric.unit}</p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-400">{fr ? 'Indice' : 'Benchmark'}</p>
                      <p className="text-lg font-semibold text-slate-400">{metric.benchmark}{metric.unit}</p>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* Exclusion Policy */}
      <section className="py-16 px-6 bg-slate-50 border-t border-slate-100">
        <div className="max-w-7xl mx-auto">
          <ScrollReveal>
            <h2 className="text-2xl font-bold text-slate-900 mb-8">{fr ? 'Politique d\'exclusion' : 'Exclusion Policy'}</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {exclusions.map((ex) => {
                const Icon = ex.icon;
                return (
                  <Card key={ex.category} className="p-5 border border-slate-200 bg-white">
                    <div className="flex items-start gap-4">
                      <div className="w-10 h-10 rounded-lg bg-red-50 flex items-center justify-center flex-shrink-0">
                        <Icon className="w-5 h-5 text-red-500" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-slate-900 text-sm mb-1">{fr ? ex.categoryFr : ex.category}</h3>
                        <p className="text-xs text-slate-600 leading-relaxed">{fr ? ex.descFr : ex.desc}</p>
                      </div>
                    </div>
                  </Card>
                );
              })}
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* Green Bond Growth */}
      <section className="py-16 px-6 bg-white border-t border-slate-100">
        <div className="max-w-7xl mx-auto">
          <ScrollReveal>
            <h2 className="text-2xl font-bold text-slate-900 mb-2">{fr ? 'Allocation en obligations vertes au fil du temps' : 'Green Bond Allocation Over Time'}</h2>
            <p className="text-slate-600 mb-8">{fr ? 'Allocation croissante en obligations vertes certifiées finançant des projets à impact climatique positif.' : 'Growing allocation to certified green bonds financing climate-positive projects.'}</p>
            <Card className="p-6 border border-slate-200">
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={greenBondData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="year" tick={{ fontSize: 12, fill: '#64748b' }} />
                  <YAxis tick={{ fontSize: 12, fill: '#64748b' }} tickFormatter={(v: unknown) => `${v}%`} />
                  <Tooltip formatter={(v: unknown) => [`${v}%`, fr ? 'Obligations vertes %' : 'Green Bond %']} contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '13px' }} />
                  <Bar dataKey="allocation" fill="#22c55e" radius={[4, 4, 0, 0]} maxBarSize={40} />
                </BarChart>
              </ResponsiveContainer>
            </Card>
          </ScrollReveal>
        </div>
      </section>

      {/* Fondaction Partnership */}
      <section className="py-16 px-6 bg-slate-50 border-t border-slate-100">
        <div className="max-w-7xl mx-auto">
          <ScrollReveal>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <Award className="w-5 h-5 text-green-600" />
                  <p className="text-sm font-semibold text-green-600 uppercase tracking-wide">{fr ? 'Partenariat' : 'Partnership'}</p>
                </div>
                <h2 className="text-2xl font-bold text-slate-900 mb-4">{fr ? 'Collaboration avec Fondaction' : 'Fondaction Collaboration'}</h2>
                <p className="text-slate-600 leading-relaxed mb-4">
                  {fr ? 'Notre partenariat avec Fondaction représente un engagement commun à faire progresser l\'investissement responsable sur les marchés canadiens de titres à revenu fixe. Ensemble, nous avons développé des stratégies obligataires intégrant les critères ESG qui démontrent que durabilité et rendements solides ne sont pas mutuellement exclusifs.' : 'Our partnership with Fondaction represents a shared commitment to advancing responsible investing in Canadian fixed income markets. Together, we have developed ESG-integrated bond strategies that demonstrate sustainability and strong returns are not mutually exclusive.'}
                </p>
                <p className="text-slate-600 leading-relaxed">
                  {fr ? 'Fondaction, un fonds de travailleurs dédié à l\'impact économique, social et environnemental positif, a confié à Nymbus la gestion de mandats obligataires durables alignés sur sa mission d\'allocation responsable du capital.' : 'Fondaction, a labour-sponsored venture capital fund dedicated to positive economic, social, and environmental impact, has entrusted Nymbus with managing sustainable bond mandates that align with their mission of responsible capital allocation.'}
                </p>
              </div>
              <div>
                <Card className="p-6 border border-slate-200 bg-white">
                  <h3 className="font-bold text-slate-900 mb-4">{fr ? 'Scorecard d\'alignement PRI' : 'PRI Alignment Scorecard'}</h3>
                  <div className="space-y-4">
                    {priScorecard.map((p) => (
                      <div key={p.principle}>
                        <div className="flex justify-between text-sm mb-1">
                          <span className="text-slate-600">{fr ? p.principleFr : p.principle}</span>
                          <span className="font-semibold text-slate-900">{p.score}%</span>
                        </div>
                        <div className="bg-slate-100 rounded-full h-2">
                          <div className="bg-green-500 h-full rounded-full transition-all" style={{ width: `${p.score}%` }} />
                        </div>
                      </div>
                    ))}
                  </div>
                </Card>
              </div>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 px-6 bg-white border-t border-slate-100">
        <div className="max-w-3xl mx-auto text-center">
          <ScrollReveal>
            <h2 className="text-2xl font-bold text-slate-900 mb-4">{fr ? 'Investir de manière responsable' : 'Invest Responsibly'}</h2>
            <p className="text-slate-600 mb-8">{fr ? 'Découvrez nos fonds durables et apprenez comment l\'intégration ESG améliore la performance à long terme.' : 'Explore our sustainable fund offerings and learn how ESG integration enhances long-term performance.'}</p>
            <Link href="/strategies/sustainable-enhanced-bonds" className="inline-flex items-center gap-2 bg-green-600 text-white px-8 py-3.5 rounded-lg font-medium hover:bg-green-700 transition-colors">
              {fr ? 'Explorer les fonds durables' : 'Explore Sustainable Funds'} <ArrowRight className="w-4 h-4" />
            </Link>
          </ScrollReveal>
        </div>
      </section>
    </main>
  );
}