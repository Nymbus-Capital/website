'use client';

import { useRef, useEffect, useState, ReactNode } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from '@/lib/i18n';
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis,
  CartesianGrid, Tooltip, ResponsiveContainer, Legend, Cell,
} from 'recharts';
import {
  ArrowLeft, TrendingUp, Shield, Calendar, FileText, Download,
  Info, DollarSign, BarChart3, Clock, Target, Award, Building2,
  Globe, Percent, Users, ChevronDown, ArrowUpRight, ArrowDownRight,
  BookOpen, PieChart as PieChartIcon,
} from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { ScrollReveal } from '@/components/animations/ScrollReveal';
import { cn } from '@/lib/utils';
import type { Fund } from '@/data/funds';

/* ================================================================
 * FUND DETAIL LAYOUT — Clean white design, Lysander-style depth
 * ================================================================ */

interface FundDetailLayoutProps {
  fund: Fund;
  extraSections?: ReactNode;
}

const tabKeys = ['overview', 'portfolio', 'performance', 'distributions', 'documents'] as const;
type TabKey = 'overview' | 'portfolio' | 'performance' | 'distributions' | 'documents';

export default function FundDetailLayout({ fund, extraSections }: FundDetailLayoutProps) {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState<TabKey>('overview');
  const tabBarRef = useRef<HTMLDivElement>(null);

  return (
    <div className="min-h-screen bg-white">
      {/* ── Hero ── */}
      <HeroSection fund={fund} />

      {/* ── Sticky Tabs ── */}
      <div ref={tabBarRef} className="sticky top-0 z-40 bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8">
          <div className="flex items-center gap-1 overflow-x-auto no-scrollbar">
            {tabKeys.map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={cn(
                  'px-3 py-2.5 text-sm font-medium whitespace-nowrap transition-colors',
                  activeTab === tab
                    ? 'text-slate-900 border-b-2 border-slate-900'
                    : 'text-slate-500 hover:text-slate-700'
                )}
              >
                {t(`fund.tabs.${tab}`)}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ── Tab Content ── */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.2 }}
        >
          {activeTab === 'overview' && <OverviewTab fund={fund} />}
          {activeTab === 'portfolio' && <PortfolioTab fund={fund} />}
          {activeTab === 'performance' && <PerformanceTab fund={fund} />}
          {activeTab === 'distributions' && <DistributionsTab fund={fund} />}
          {activeTab === 'documents' && <DocumentsTab fund={fund} />}
        </motion.div>
      </AnimatePresence>

      {/* ── Extra Sections ── */}
      {extraSections}
    </div>
  );
}

/* ================================================================
 * HERO SECTION
 * ================================================================ */

function HeroSection({ fund }: { fund: Fund }) {
  const { t } = useTranslation();
  return (
    <div className="relative bg-white border-b border-slate-100">
      <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8 py-8 md:py-12">
        <div className="flex items-start justify-between mb-6">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-slate-900 mb-2">
              {t(`funds.${fund.id}.name`)}
            </h1>
            <p className="text-slate-600">
              {t(`funds.${fund.id}.shortDescription`)}
            </p>
          </div>
          <Link
            href="/funds"
            className="flex items-center gap-2 px-3 py-2 text-slate-600 hover:text-slate-900 transition-colors"
          >
            <ArrowLeft size={18} />
            {t('common.back')}
          </Link>
        </div>

        {/* Key metrics */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="p-4 bg-slate-50 rounded-lg">
            <p className="text-xs text-slate-600 mb-1">{t('fund.inceptionDate')}</p>
            <p className="text-sm font-semibold text-slate-900">
              {new Date(fund.inceptionDate).toLocaleDateString(undefined, {
                year: 'numeric',
                month: 'short',
              })}
            </p>
          </div>
          <div className="p-4 bg-slate-50 rounded-lg">
            <p className="text-xs text-slate-600 mb-1">{t('fund.fundType')}</p>
            <p className="text-sm font-semibold text-slate-900">
              {t(`funds.${fund.id}.type`)}
            </p>
          </div>
          <div className="p-4 bg-slate-50 rounded-lg">
            <p className="text-xs text-slate-600 mb-1">{t('fund.strategy')}</p>
            <p className="text-sm font-semibold text-slate-900">
              {t(`funds.${fund.id}.strategy`)}
            </p>
          </div>
          <div className="p-4 bg-slate-50 rounded-lg">
            <p className="text-xs text-slate-600 mb-1">{t('fund.status')}</p>
            <p className="text-sm font-semibold text-slate-900">
              {t(`funds.${fund.id}.status`)}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ================================================================
 * OVERVIEW TAB
 * ================================================================ */

function OverviewTab({ fund }: { fund: Fund }) {
  const { t } = useTranslation();
  return (
    <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8 py-8 md:py-12">
      <ScrollReveal>
        <div className="grid md:grid-cols-2 gap-8">
          {/* Left column */}
          <div className="space-y-6">
            {/* Description */}
            <Card>
              <div className="flex items-start gap-3 mb-4">
                <FileText className="w-5 h-5 text-slate-700 flex-shrink-0 mt-1" />
                <div>
                  <h3 className="text-sm font-semibold text-slate-900">
                    {t('fund.description')}
                  </h3>
                  <p className="text-sm text-slate-600 mt-2">
                    {t(`funds.${fund.id}.description`)}
                  </p>
                </div>
              </div>
            </Card>

            {/* Investment Objective */}
            <Card>
              <div className="flex items-start gap-3 mb-4">
                <Target className="w-5 h-5 text-slate-700 flex-shrink-0 mt-1" />
                <div>
                  <h3 className="text-sm font-semibold text-slate-900">
                    {t('fund.investmentObjective')}
                  </h3>
                  <p className="text-sm text-slate-600 mt-2">
                    {t(`funds.${fund.id}.investmentObjective`)}
                  </p>
                </div>
              </div>
            </Card>

            {/* Risk Profile */}
            <Card>
              <div className="flex items-start gap-3 mb-4">
                <Shield className="w-5 h-5 text-slate-700 flex-shrink-0 mt-1" />
                <div>
                  <h3 className="text-sm font-semibold text-slate-900">
                    {t('fund.riskProfile')}
                  </h3>
                  <p className="text-sm text-slate-600 mt-2">
                    {t(`funds.${fund.id}.riskProfile`)}
                  </p>
                </div>
              </div>
            </Card>
          </div>

          {/* Right column */}
          <div className="space-y-6">
            {/* Key Facts */}
            <Card>
              <h3 className="text-sm font-semibold text-slate-900 mb-4">
                {t('fund.keyFacts')}
              </h3>
              <div className="space-y-3">
                {[
                  {
                    icon: <DollarSign size={16} />,
                    label: t('fund.aum'),
                    value: `$${(fund.aum / 1000000).toFixed(1)}M`,
                  },
                  {
                    icon: <Percent size={16} />,
                    label: t('fund.managementFee'),
                    value: `${fund.managementFee}%`,
                  },
                  {
                    icon: <Users size={16} />,
                    label: t('fund.investors'),
                    value: fund.investors?.toString() || 'N/A',
                  },
                  {
                    icon: <Globe size={16} />,
                    label: t('fund.focus'),
                    value: t(`funds.${fund.id}.geographicFocus`),
                  },
                ].map((fact, idx) => (
                  <div key={idx} className="flex items-center gap-3 py-2 border-b border-slate-100 last:border-b-0">
                    <div className="text-slate-400">{fact.icon}</div>
                    <div className="flex-1">
                      <p className="text-xs text-slate-500">{fact.label}</p>
                      <p className="text-sm font-semibold text-slate-900">{fact.value}</p>
                    </div>
                  </div>
                ))}
              </div>
            </Card>

            {/* Manager Bio */}
            <Card>
              <h3 className="text-sm font-semibold text-slate-900 mb-4">
                {t('fund.fundManager')}
              </h3>
              <div className="flex gap-3">
                <div className="w-12 h-12 bg-gradient-to-br from-slate-200 to-slate-300 rounded-full flex-shrink-0" />
                <div className="flex-1">
                  <p className="text-sm font-semibold text-slate-900">
                    {t(`funds.${fund.id}.managerName`)}
                  </p>
                  <p className="text-xs text-slate-600 mt-1">
                    {t(`funds.${fund.id}.managerBio`)}
                  </p>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </ScrollReveal>
    </div>
  );
}

/* ================================================================
 * PORTFOLIO TAB
 * ================================================================ */

function PortfolioTab({ fund }: { fund: Fund }) {
  const { t } = useTranslation();

  if (!fund.portfolio || fund.portfolio.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8 py-8 md:py-12">
        <p className="text-slate-600">{t('fund.noPortfolioData')}</p>
      </div>
    );
  }

  const totalValue = fund.portfolio.reduce((sum, pos) => sum + pos.value, 0);

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8 py-8 md:py-12">
      <ScrollReveal>
        <div className="grid md:grid-cols-3 gap-8">
          {/* Holdings list */}
          <div className="md:col-span-2">
            <Card>
              <h3 className="text-sm font-semibold text-slate-900 mb-4">
                {t('fund.holdings')}
              </h3>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-slate-200">
                      <th className="text-left py-2 px-3 font-semibold text-slate-700">{t('fund.holding')}</th>
                      <th className="text-right py-2 px-3 font-semibold text-slate-700">{t('fund.value')}</th>
                      <th className="text-right py-2 px-3 font-semibold text-slate-700">{t('fund.allocation')}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {fund.portfolio.map((position, idx) => (
                      <tr key={idx} className="border-b border-slate-100 hover:bg-slate-50 transition">
                        <td className="py-2 px-3 text-slate-900">{position.name}</td>
                        <td className="text-right py-2 px-3 text-slate-700">
                          ${(position.value / 1000000).toFixed(1)}M
                        </td>
                        <td className="text-right py-2 px-3 text-slate-700">
                          {((position.value / totalValue) * 100).toFixed(1)}%
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          </div>

          {/* Pie chart */}
          <div>
            <Card>
              <h3 className="text-sm font-semibold text-slate-900 mb-4">
                {t('fund.allocation')}
              </h3>
              <ResponsiveContainer width="100%" height={200}>
                <PieChartIcon size={200} className="text-slate-300" />
              </ResponsiveContainer>
              <p className="text-xs text-slate-500 text-center mt-4">
                {t('fund.allocations', { count: fund.portfolio.length })}
              </p>
            </Card>
          </div>
        </div>
      </ScrollReveal>
    </div>
  );
}

/* ================================================================
 * PERFORMANCE TAB
 * ================================================================ */

function PerformanceTab({ fund }: { fund: Fund }) {
  const { t } = useTranslation();

  if (!fund.performance || fund.performance.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8 py-8 md:py-12">
        <p className="text-slate-600">{t('fund.noPerformanceData')}</p>
      </div>
    );
  }

  const returns = generateReturnsData(fund);

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8 py-8 md:py-12">
      <ScrollReveal>
        <div className="space-y-8">
          {/* Returns Chart */}
          <Card>
            <h3 className="text-sm font-semibold text-slate-900 mb-4">
              {t('fund.returnsVsBenchmark')}
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={returns}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="date" stroke="#94a3b8" />
                <YAxis stroke="#94a3b8" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1e293b',
                    border: 'none',
                    borderRadius: '8px',
                    color: '#f1f5f9',
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="value"
                  stroke="#0f172a"
                  fill="#f1f5f9"
                  isAnimationActive={false}
                />
              </AreaChart>
            </ResponsiveContainer>
          </Card>

          {/* Performance Table */}
          <Card>
            <h3 className="text-sm font-semibold text-slate-900 mb-4">
              {t('fund.annualReturns')}
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-200">
                    <th className="text-left py-2 px-3 font-semibold text-slate-700">{t('fund.year')}</th>
                    <th className="text-right py-2 px-3 font-semibold text-slate-700">
                      {t(`funds.${fund.id}.name`)}
                    </th>
                    <th className="text-right py-2 px-3 font-semibold text-slate-700">
                      {t('fund.benchmark')}
                    </th>
                    <th className="text-right py-2 px-3 font-semibold text-slate-700">
                      {t('fund.outperformance')}
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {fund.performance.map((perf, idx) => {
                    const benchmark = perf.benchmark || 0;
                    const outperformance = perf.fund - benchmark;
                    return (
                      <tr key={idx} className="border-b border-slate-100 hover:bg-slate-50 transition">
                        <td className="py-2 px-3 font-semibold text-slate-900">{perf.year}</td>
                        <td className="text-right py-2 px-3">
                          <span
                            className={cn(
                              'font-semibold inline-flex items-center gap-1',
                              perf.fund >= 0 ? 'text-emerald-600' : 'text-red-600'
                            )}
                          >
                            {perf.fund >= 0 ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
                            {Math.abs(perf.fund).toFixed(2)}%
                          </span>
                        </td>
                        <td className="text-right py-2 px-3 text-slate-600">
                          {benchmark.toFixed(2)}%
                        </td>
                        <td className="text-right py-2 px-3">
                          <span
                            className={cn(
                              'font-semibold inline-flex items-center gap-1',
                              outperformance >= 0 ? 'text-emerald-600' : 'text-red-600'
                            )}
                          >
                            {outperformance >= 0 ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
                            {Math.abs(outperformance).toFixed(2)}%
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </Card>

          {/* Key Metrics */}
          <div className="grid md:grid-cols-3 gap-4">
            {[
              {
                icon: <TrendingUp size={18} />,
                label: t('fund.ytdReturn'),
                value: `${fund.performance[fund.performance.length - 1].fund.toFixed(2)}%`,
              },
              {
                icon: <BarChart3 size={18} />,
                label: t('fund.1yearReturn'),
                value: `${(
                  fund.performance.slice(-1)[0].fund *
                  (1 + fund.performance.slice(-2, -1)[0]?.fund / 100)
                ).toFixed(2)}%`,
              },
              {
                icon: <Award size={18} />,
                label: t('fund.avgAnnualReturn'),
                value: `${(
                  fund.performance.reduce((sum, p) => sum + p.fund, 0) / fund.performance.length
                ).toFixed(2)}%`,
              },
            ].map((metric, idx) => (
              <Card key={idx}>
                <div className="flex items-center gap-3">
                  <div className="text-slate-400">{metric.icon}</div>
                  <div>
                    <p className="text-xs text-slate-600">{metric.label}</p>
                    <p className="text-lg font-bold text-slate-900">{metric.value}</p>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </ScrollReveal>
    </div>
  );
}

/* ================================================================
 * DISTRIBUTIONS TAB
 * ================================================================ */

function DistributionsTab({ fund }: { fund: Fund }) {
  const { t } = useTranslation();

  if (!fund.distributions || fund.distributions.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8 py-8 md:py-12">
        <p className="text-slate-600">{t('fund.noDistributionData')}</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8 py-8 md:py-12">
      <ScrollReveal>
        <Card>
          <h3 className="text-sm font-semibold text-slate-900 mb-4">
            {t('fund.distributionHistory')}
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-200">
                  <th className="text-left py-2 px-3 font-semibold text-slate-700">{t('fund.date')}</th>
                  <th className="text-right py-2 px-3 font-semibold text-slate-700">{t('fund.distribution')}</th>
                  <th className="text-right py-2 px-3 font-semibold text-slate-700">{t('fund.frequency')}</th>
                </tr>
              </thead>
              <tbody>
                {fund.distributions.map((dist, idx) => (
                  <tr key={idx} className="border-b border-slate-100 hover:bg-slate-50 transition">
                    <td className="py-2 px-3 text-slate-900 font-semibold">
                      {new Date(dist.date).toLocaleDateString()}
                    </td>
                    <td className="text-right py-2 px-3 text-slate-700">
                      ${dist.amount.toFixed(2)}
                    </td>
                    <td className="text-right py-2 px-3 text-slate-600">
                      {t(`fund.frequency.${dist.frequency || 'quarterly'}`)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </ScrollReveal>
    </div>
  );
}

/* ================================================================
 * DOCUMENTS TAB
 * ================================================================ */

function DocumentsTab({ fund }: { fund: Fund }) {
  const { t } = useTranslation();

  const documents = [
    {
      type: 'prospectus',
      icon: FileText,
      label: t('fund.prospectus'),
    },
    {
      type: 'factSheet',
      icon: BarChart3,
      label: t('fund.factSheet'),
    },
    {
      type: 'auditedReport',
      icon: Award,
      label: t('fund.auditedReport'),
    },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8 py-8 md:py-12">
      <ScrollReveal>
        <div className="space-y-4">
          {documents.map((doc, idx) => {
            const Icon = doc.icon;
            const url = fund[doc.type as keyof Fund] as string | undefined;

            return (
              <Card key={idx}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Icon size={20} className="text-slate-700" />
                    <span className="text-sm font-semibold text-slate-900">{doc.label}</span>
                  </div>
                  {url ? (
                    <a
                      href={url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 px-3 py-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded transition"
                    >
                      <Download size={16} />
                      {t('common.download')}
                    </a>
                  ) : (
                    <span className="text-xs text-slate-400">{t('common.notAvailable')}</span>
                  )}
                </div>
              </Card>
            );
          })}
        </div>
      </ScrollReveal>
    </div>
  );
}

/* ================================================================
 * HELPER FUNCTIONS
 * ================================================================ */

function generateReturnsData(fund: Fund) {
  if (!fund.performance || fund.performance.length === 0) {
    return [];
  }

  const annualReturn = (fund.performance.reduce((sum, p) => sum + p.fund, 0) / fund.performance.length) / 100;
  const inceptionYear = new Date(fund.inceptionDate).getFullYear();
  const currentYear = new Date().getFullYear();
  const years = currentYear - inceptionYear;

  function generateProjection() {
    return Array.from({ length: years + 1 }, (_, i) => ({
      date: `${new Date(fund.inceptionDate).getFullYear() + i}`,
      value: Math.round(10000 * Math.pow(1 + annualReturn, i)),
    }));
  }

  const sorted = [...(fund.performance || [])].sort((a, b) => a.year - b.year);
  let value = 10000;
  const data = [{ date: `${sorted[0].year - 1}`, value: 10000 }];
  for (const yr of sorted) {
    value = Math.round(value * (1 + yr.fund / 100));
    data.push({ date: `${yr.year}`, value });
  }
  return data;
}