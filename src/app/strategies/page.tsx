'use client';

import { useState } from 'react';
import { useTranslation } from '@/lib/i18n';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const strategiesData = [
  {
    name: 'Canadian Fixed Income',
    nameFr: 'Revenu fixe canadien',
    type: 'fixed-income',
    aum: '$450M',
    inception: '2015',
    ytd: 4.2,
    oneYear: 6.8,
    si: 5.4,
    sharpe: 1.8,
    sortino: 2.3
  },
  {
    name: 'Global Alternatives',
    nameFr: 'Placements alternatifs mondiaux',
    type: 'alternatives',
    aum: '$320M',
    inception: '2018',
    ytd: 7.1,
    oneYear: 9.2,
    si: 8.5,
    sharpe: 1.9,
    sortino: 2.5
  },
  {
    name: 'ESG Fixed Income',
    nameFr: 'Revenu fixe ESG',
    type: 'fixed-income',
    aum: '$180M',
    inception: '2020',
    ytd: 3.8,
    oneYear: 6.1,
    si: 5.2,
    sharpe: 1.7,
    sortino: 2.2
  },
  {
    name: 'Credit Opportunities',
    nameFr: 'Opportunités de crédit',
    type: 'fixed-income',
    aum: '$280M',
    inception: '2017',
    ytd: 5.3,
    oneYear: 7.9,
    si: 6.8,
    sharpe: 1.95,
    sortino: 2.6
  },
  {
    name: 'Multi-Strategy',
    nameFr: 'Multi-stratégie',
    type: 'alternatives',
    aum: '$220M',
    inception: '2019',
    ytd: 6.5,
    oneYear: 8.3,
    si: 7.8,
    sharpe: 2.0,
    sortino: 2.7
  }
];

export default function StrategiesPage() {
  const { t, locale } = useTranslation();
  const [activeFilter, setActiveFilter] = useState<string | null>(null);

  const filteredStrategies = activeFilter
    ? strategiesData.filter(s => s.type === activeFilter)
    : strategiesData;

  const chartData = filteredStrategies.map(s => ({
    name: locale === 'fr' ? s.nameFr : s.name,
    ytd: s.ytd,
    oneYear: s.oneYear,
    si: s.si
  }));

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Hero Section */}
      <section className="pt-24 pb-16 px-4">
        <div className="max-w-6xl mx-auto text-center">
          <h1 className="text-5xl md:text-6xl font-bold text-white mb-6">
            {t('strategies.title')}
          </h1>
          <p className="text-xl text-slate-300 mb-8 max-w-2xl mx-auto">
            {locale === 'fr'
              ? 'Stratégies d\'investissement diversifiées conçues pour atteindre les objectifs de rendement ajusté au risque.'
              : t('strategies.subtitle')}
          </p>
        </div>
      </section>

      {/* Filter Section */}
      <section className="py-8 px-4 bg-slate-800/50">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-wrap gap-4 justify-center">
            <button
              onClick={() => setActiveFilter(null)}
              className={`px-6 py-2 rounded-lg font-semibold transition-all ${
                activeFilter === null
                  ? 'bg-emerald-500 text-white'
                  : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
              }`}
            >
              {locale === 'fr' ? 'Tous' : 'All'}
            </button>
            <button
              onClick={() => setActiveFilter('fixed-income')}
              className={`px-6 py-2 rounded-lg font-semibold transition-all ${
                activeFilter === 'fixed-income'
                  ? 'bg-emerald-500 text-white'
                  : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
              }`}
            >
              {locale === 'fr' ? 'Revenu fixe' : 'Fixed Income'}
            </button>
            <button
              onClick={() => setActiveFilter('alternatives')}
              className={`px-6 py-2 rounded-lg font-semibold transition-all ${
                activeFilter === 'alternatives'
                  ? 'bg-emerald-500 text-white'
                  : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
              }`}
            >
              {locale === 'fr' ? 'Placements alternatifs' : 'Alternatives'}
            </button>
          </div>
        </div>
      </section>

      {/* Performance Chart */}
      <section className="py-16 px-4">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-white mb-8">
            {locale === 'fr' ? 'Rendement des stratégies' : 'Strategy Performance'}
          </h2>
          <div className="bg-slate-800/50 rounded-lg p-8">
            <ResponsiveContainer width="100%" height={400}>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#475569" />
                <XAxis dataKey="name" stroke="#94a3b8" />
                <YAxis stroke="#94a3b8" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1e293b',
                    border: '1px solid #475569'
                  }}
                  labelStyle={{ color: '#f1f5f9' }}
                />
                <Legend />
                <Bar dataKey="ytd" fill="#10b981" name={locale === 'fr' ? 'YTD' : 'YTD'} />
                <Bar dataKey="oneYear" fill="#3b82f6" name={locale === 'fr' ? '1 an' : '1Y'} />
                <Bar dataKey="si" fill="#f59e0b" name={locale === 'fr' ? 'Depuis création' : 'SI'} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </section>

      {/* Strategies Grid */}
      <section className="py-16 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {filteredStrategies.map((strategy, index) => (
              <div key={index} className="bg-slate-700/50 rounded-lg p-8 hover:bg-slate-600/50 transition-all">
                <h3 className="text-2xl font-bold text-white mb-4">
                  {locale === 'fr' ? strategy.nameFr : strategy.name}
                </h3>
                <div className="grid grid-cols-2 gap-4 mb-6 text-sm">
                  <div>
                    <p className="text-slate-400">{locale === 'fr' ? 'AUM' : 'AUM'}</p>
                    <p className="text-xl font-bold text-emerald-400">{strategy.aum}</p>
                  </div>
                  <div>
                    <p className="text-slate-400">{locale === 'fr' ? 'Inception' : 'Inception'}</p>
                    <p className="text-xl font-bold text-emerald-400">{strategy.inception}</p>
                  </div>
                </div>
                <div className="border-t border-slate-600 pt-4">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="text-slate-400">
                        <th className="text-left font-semibold">{locale === 'fr' ? 'Métrique' : 'Metric'}</th>
                        <th className="text-right font-semibold">{locale === 'fr' ? 'Valeur' : 'Value'}</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr className="border-t border-slate-700 text-slate-300">
                        <td>{locale === 'fr' ? 'YTD' : 'YTD'}</td>
                        <td className="text-right text-emerald-400 font-semibold">{strategy.ytd.toFixed(1)}%</td>
                      </tr>
                      <tr className="border-t border-slate-700 text-slate-300">
                        <td>{locale === 'fr' ? '1 an' : '1 Year'}</td>
                        <td className="text-right text-emerald-400 font-semibold">{strategy.oneYear.toFixed(1)}%</td>
                      </tr>
                      <tr className="border-t border-slate-700 text-slate-300">
                        <td>{locale === 'fr' ? 'Depuis création' : 'Since Inception'}</td>
                        <td className="text-right text-emerald-400 font-semibold">{strategy.si.toFixed(1)}%</td>
                      </tr>
                      <tr className="border-t border-slate-700 text-slate-300">
                        <td>{locale === 'fr' ? 'Ratio de Sharpe' : 'Sharpe Ratio'}</td>
                        <td className="text-right text-blue-400 font-semibold">{strategy.sharpe.toFixed(2)}</td>
                      </tr>
                      <tr className="border-t border-slate-700 text-slate-300">
                        <td>{locale === 'fr' ? 'Ratio de Sortino' : 'Sortino Ratio'}</td>
                        <td className="text-right text-blue-400 font-semibold">{strategy.sortino.toFixed(2)}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}