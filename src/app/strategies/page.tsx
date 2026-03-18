'use client';

import { useState } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { funds, Fund } from '@/data/funds';
import { Card } from '@/components/ui/Card';
import { ScrollReveal } from '@/components/animations/ScrollReveal';
import { ArrowRight, TrendingUp, Shield, BarChart3, Filter } from 'lucide-react';
import { cn, formatPercent } from '@/lib/utils';
import { BarChart, Bar, ResponsiveContainer, Cell } from 'recharts';

type FilterKey = 'All' | 'Fixed Income' | 'Alternatives' | 'Multi-Asset';

export default function StrategiesPage() {
  const [filter, setFilter] = useState<FilterKey>('All');
  const [hoveredFund, setHoveredFund] = useState<string | null>(null);

  const filters: FilterKey[] = ['All', 'Fixed Income', 'Alternatives', 'Multi-Asset'];
  const filtered = filter === 'All' ? funds : funds.filter((f) => f.assetClass === filter);

  return (
    <main className="bg-white min-h-screen">
      {/* Hero */}
      <section className="bg-white border-b border-slate-100 pt-8 pb-12 px-6">
        <div className="max-w-7xl mx-auto">
          <p className="text-sm font-semibold text-blue-600 uppercase tracking-wide mb-2">Investment Strategies</p>
          <h1 className="text-4xl font-bold text-slate-900 mb-4">Our Funds & Strategies</h1>
          <p className="text-lg text-slate-600 max-w-2xl">
            Systematic, quantitative approaches across fixed income, alternatives, and multi-asset classes. Each strategy is built on rigorous research and disciplined risk management.
          </p>
        </div>
      </section>

      {/* Filter Tabs */}
      <section className="sticky top-0 z-30 bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex items-center gap-1 py-3">
            <Filter className="w-4 h-4 text-slate-400 mr-2" />
            {filters.map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={cn(
                  'px-4 py-2 rounded-full text-sm font-medium transition-colors',
                  filter === f
                    ? 'bg-slate-900 text-white'
                    : 'text-slate-600 hover:bg-slate-100'
                )}
              >
                {f}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Fund Cards */}
      <section className="py-12 px-6">
        <div className="max-w-7xl mx-auto">
          <AnimatePresence mode="wait">
            <motion.div
              key={filter}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="grid grid-cols-1 lg:grid-cols-2 gap-6"
            >
              {filtered.map((fund, index) => (
                <ScrollReveal key={fund.slug} delay={index * 80}>
                  <Link href={`/strategies/${fund.slug}`}>
                    <Card
                      className="p-6 border border-slate-200 hover:border-blue-200 hover:shadow-lg transition-all cursor-pointer group h-full"
                      onMouseEnter={() => setHoveredFund(fund.slug)}
                      onMouseLeave={() => setHoveredFund(null)}
                    >
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <h3 className="text-lg font-bold text-slate-900 group-hover:text-blue-600 transition-colors">{fund.name}</h3>
                          <div className="flex gap-2 mt-1.5">
                            <span className="px-2 py-0.5 bg-blue-50 text-blue-700 rounded text-xs font-medium">{fund.assetClass}</span>
                            <span className="px-2 py-0.5 bg-slate-100 text-slate-600 rounded text-xs">{fund.vehicle}</span>
                          </div>
                        </div>
                        <ArrowRight className="w-5 h-5 text-slate-300 group-hover:text-blue-600 group-hover:translate-x-1 transition-all" />
                      </div>

                      <p className="text-sm text-slate-600 leading-relaxed mb-5 line-clamp-2">{fund.description}</p>

                      {/* Mini performance sparkline */}
                      {fund.calendarYearReturns && fund.calendarYearReturns.length > 0 && (
                        <div className="mb-5 h-12">
                          <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={fund.calendarYearReturns.slice(-5)}>
                              <Bar dataKey="fund" radius={[2, 2, 0, 0]} maxBarSize={16}>
                                {fund.calendarYearReturns.slice(-5).map((entry, i) => (
                                  <Cell key={i} fill={entry.fund >= 0 ? '#2563eb' : '#ef4444'} opacity={0.7} />
                                ))}
                              </Bar>
                            </BarChart>
                          </ResponsiveContainer>
                        </div>
                      )}

                      {/* Key metrics */}
                      <div className="grid grid-cols-4 gap-3 pt-4 border-t border-slate-100">
                        <div className="text-center">
                          <p className={cn('text-sm font-bold', fund.returns.ytd >= 0 ? 'text-green-600' : 'text-red-600')}>
                            {formatPercent(fund.returns.ytd)}
                          </p>
                          <p className="text-xs text-slate-500 mt-0.5">YTD</p>
                        </div>
                        <div className="text-center">
                          <p className={cn('text-sm font-bold', fund.returns.oneYear >= 0 ? 'text-green-600' : 'text-red-600')}>
                            {formatPercent(fund.returns.oneYear)}
                          </p>
                          <p className="text-xs text-slate-500 mt-0.5">1 Year</p>
                        </div>
                        <div className="text-center">
                          <p className="text-sm font-bold text-slate-900">{formatPercent(fund.returns.sinceInception)}</p>
                          <p className="text-xs text-slate-500 mt-0.5">Since Inception</p>
                        </div>
                        <div className="text-center">
                          <p className="text-sm font-bold text-slate-900">{fund.sharpe?.toFixed(2) ?? 'N/A'}</p>
                          <p className="text-xs text-slate-500 mt-0.5">Sharpe</p>
                        </div>
                      </div>
                    </Card>
                  </Link>
                </ScrollReveal>
              ))}
            </motion.div>
          </AnimatePresence>

          {filtered.length === 0 && (
            <div className="text-center py-20">
              <p className="text-slate-500">No strategies found for this category.</p>
            </div>
          )}
        </div>
      </section>

      {/* Comparison Table */}
      <section className="py-12 px-6 bg-slate-50 border-t border-slate-100">
        <div className="max-w-7xl mx-auto">
          <ScrollReveal>
            <h2 className="text-2xl font-bold text-slate-900 mb-8">Strategy Comparison</h2>
            <Card className="overflow-hidden border border-slate-200">
              <div className="overflow-x-auto">
                <table className="w-full fund-table">
                  <thead>
                    <tr>
                      <th>Strategy</th>
                      <th className="text-right">AUM</th>
                      <th className="text-right">YTD</th>
                      <th className="text-right">1Y</th>
                      <th className="text-right">SI</th>
                      <th className="text-right">Sharpe</th>
                      <th className="text-right">MER</th>
                    </tr>
                  </thead>
                  <tbody>
                    {funds.map((fund) => (
                      <tr key={fund.slug}>
                        <td>
                          <Link href={`/strategies/${fund.slug}`} className="font-semibold text-blue-600 hover:text-blue-700 transition-colors">
                            {fund.shortName}
                          </Link>
                        </td>
                        <td className="text-right">{fund.aum || '—'}</td>
                        <td className={cn('text-right font-semibold', fund.returns.ytd >= 0 ? 'text-green-600' : 'text-red-600')}>
                          {formatPercent(fund.returns.ytd)}
                        </td>
                        <td className={cn('text-right font-semibold', fund.returns.oneYear >= 0 ? 'text-green-600' : 'text-red-600')}>
                          {formatPercent(fund.returns.oneYear)}
                        </td>
                        <td className="text-right font-semibold">{formatPercent(fund.returns.sinceInception)}</td>
                        <td className="text-right">{fund.sharpe?.toFixed(2) ?? '—'}</td>
                        <td className="text-right">{fund.mer || '—'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          </ScrollReveal>
        </div>
      </section>
    </main>
  );
}