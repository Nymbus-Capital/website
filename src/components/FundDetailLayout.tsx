
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
                  'relative px-4 py-4 text-sm font-medium whitespace-nowrap transition-colors',
                  activeTab === tab ? 'text-blue-600' : 'text-slate-500 hover:text-slate-900'
                )}
              >
                {t(`fund.tabs.${tab}`)}
                {activeTab === tab && (
                  <motion.div
                    layoutId="tab-indicator"
                    className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600 tab-indicator"
                  />
                )}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ── Content ── */}
      <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8 py-12">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.25 }}
          >
            {activeTab === 'overview' && <OverviewTab fund={fund} />}
            {activeTab === 'portfolio' && <PortfolioTab fund={fund} />}
            {activeTab === 'performance' && <PerformanceTab fund={fund} />}
            {activeTab === 'distributions' && <DistributionsTab fund={fund} />}
            {activeTab === 'documents' && <DocumentsTab fund={fund} />}
          </motion.div>
        </AnimatePresence>
      </div>

      {extraSections}

      {/* CTA */}
      <section className="border-t border-slate-100 bg-slate-50 py-16 px-6">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-2xl font-bold text-slate-900 mb-3">{t('fund.cta.title')}</h2>
          <p className="text-slate-600 mb-8">
            {t('fund.cta.description')}
          </p>
          <Link
            href="/contact"
            className="inline-flex items-center gap-2 bg-slate-900 text-white px-8 py-3 rounded-lg font-medium hover:bg-slate-800 transition-colors"
          >
            {t('fund.cta.button')} <ArrowUpRight className="w-4 h-4" />
          </Link>
        </div>
      </section>
    </div>
  );
}

/* ────────────────────────────────────────────────────────────────
 * HERO SECTION — Clean white with subtle accent
 * ──────────────────────────────────────────────────────────────── */
function HeroSection({ fund }: { fund: Fund }) {
  const { t } = useTranslation();
  return (
    <section className="bg-white border-b border-slate-100">
      <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8 pt-8 pb-12">
        <Link href="/strategies" className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-blue-600 transition-colors mb-8">
          <ArrowLeft className="w-4 h-4" /> {t('fund.backToStrategies')}
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 items-start">
          {/* Left: Title + description */}
          <div className="lg:col-span-2">
            <div className="flex flex-wrap items-center gap-2 mb-3">
              <span className="px-2.5 py-0.5 bg-blue-50 text-blue-700 text-xs font-semibold rounded-full">{fund.assetClass}</span>
              {fund.vehicle && <span className="px-2.5 py-0.5 bg-slate-100 text-slate-600 text-xs font-medium rounded-full">{fund.vehicle}</span>}
              {fund.riskRating && <span className="px-2.5 py-0.5 bg-slate-100 text-slate-600 text-xs font-medium rounded-full">Risk: {fund.riskRating}</span>}
            </div>
            <h1 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">{fund.name}</h1>
            <p className="text-slate-600 leading-relaxed max-w-2xl">{fund.description}</p>
          </div>

          {/* Right: NAV card */}
          <Card className="p-6 bg-white border border-slate-200">
            {fund.navPerUnit && (
              <div className="mb-4">
                <p className="text-xs uppercase tracking-wider text-slate-500 font-semibold mb-1">{t('fund.navPerUnit')}</p>
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-bold text-slate-900">{fund.navPerUnit}</span>
                  {fund.navChange && (
                    <span className={cn('text-sm font-semibold flex items-center gap-0.5', fund.navChange.percent >= 0 ? 'text-green-600' : 'text-red-600')}>
                      {fund.navChange.percent >= 0 ? <ArrowUpRight className="w-3.5 h-3.5" /> : <ArrowDownRight className="w-3.5 h-3.5" />}
                      {fund.navChange.percent >= 0 ? '+' : ''}{fund.navChange.percent.toFixed(2)}%
                    </span>
                  )}
                </div>
                {fund.navChange && <p className="text-xs text-slate-400 mt-1">As of {fund.navChange.date}</p>}
              </div>
            )}
            <div className="grid grid-cols-2 gap-4 pt-4 border-t border-slate-100">
              {fund.aum && <Stat label={t('fund.aum')} value={fund.aum} />}
              {fund.mer && <Stat label={t('fund.mer')} value={fund.mer} />}
              <Stat label={t('fund.inception')} value={new Date(fund.inceptionDate).toLocaleDateString('en-CA', { year: 'numeric', month: 'short' })} />
              <Stat label={t('fund.currency')} value={fund.currency} />
            </div>
          </Card>
        </div>

        {/* Quick return bar */}
        <div className="mt-8 grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-4">
          {fund.compoundReturns ? (
            <>
              {fund.compoundReturns.oneMonth != null && <ReturnBadge label="1M" value={fund.compoundReturns.oneMonth} />}
              {fund.compoundReturns.threeMonth != null && <ReturnBadge label="3M" value={fund.compoundReturns.threeMonth} />}
              {fund.compoundReturns.sixMonth != null && <ReturnBadge label="6M" value={fund.compoundReturns.sixMonth} />}
              <ReturnBadge label="YTD" value={fund.compoundReturns.ytd} />
              <ReturnBadge label="1Y" value={fund.compoundReturns.oneYear} />
              {fund.compoundReturns.threeYear != null && <ReturnBadge label="3Y" value={fund.compoundReturns.threeYear} />}
              <ReturnBadge label="SI" value={fund.compoundReturns.sinceInception} />
            </>
          ) : (
            <>
              <ReturnBadge label="YTD" value={fund.returns.ytd} />
              <ReturnBadge label="1Y" value={fund.returns.oneYear} />
              {fund.returns.threeYear != null && <ReturnBadge label="3Y" value={fund.returns.threeYear} />}
              <ReturnBadge label="SI" value={fund.returns.sinceInception} />
            </>
          )}
        </div>
      </div>
    </section>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs text-slate-500 font-medium">{label}</p>
      <p className="text-sm font-semibold text-slate-900">{value}</p>
    </div>
  );
}

function ReturnBadge({ label, value }: { label: string; value: number }) {
  const positive = value >= 0;
  return (
    <div className="bg-slate-50 rounded-lg px-3 py-2 text-center">
      <p className="text-xs text-slate-500 font-medium mb-0.5">{label}</p>
      <p className={cn('text-sm font-bold', positive ? 'text-green-600' : 'text-red-600')}>
        {positive ? '+' : ''}{value.toFixed(2)}%
      </p>
    </div>
  );
}

/* ────────────────────────────────────────────────────────────────
 * OVERVIEW TAB
 * ──────────────────────────────────────────────────────────────── */
function OverviewTab({ fund }: { fund: Fund }) {
  const { t } = useTranslation();
  return (
    <div className="space-y-12">
      {/* Objectives */}
      {fund.objectives && (
        <ScrollReveal>
          <div>
            <SectionTitle icon={Target} title={t('fund.overview.objectives')} />
            <p className="text-slate-600 leading-relaxed max-w-3xl">{fund.objectives}</p>
          </div>
        </ScrollReveal>
      )}

      {/* Investment Focus */}
      {fund.investmentFocus && (
        <ScrollReveal>
          <div>
            <SectionTitle icon={Info} title={t('fund.overview.focus')} />
            <p className="text-slate-600 leading-relaxed max-w-3xl">{fund.investmentFocus}</p>
          </div>
        </ScrollReveal>
      )}

      {/* Fund Facts Table */}
      <ScrollReveal>
        <div>
          <SectionTitle icon={BookOpen} title={t('fund.overview.facts')} />
          <Card className="overflow-hidden border border-slate-200">
            <table className="w-full fund-table">
              <tbody>
                <FactRow label="Fund Name" value={fund.name} />
                {fund.fundCode && <FactRow label="Fund Code" value={fund.fundCode} />}
                {fund.cusip && <FactRow label="CUSIP" value={fund.cusip} />}
                {fund.series && <FactRow label="Series" value={fund.series} />}
                <FactRow label="Asset Class" value={fund.assetClass} />
                <FactRow label="Vehicle" value={fund.vehicle} />
                {fund.benchmark && <FactRow label="Benchmark" value={fund.benchmark} />}
                <FactRow label="Inception Date" value={new Date(fund.inceptionDate).toLocaleDateString('en-CA', { year: 'numeric', month: 'long', day: 'numeric' })} />
                {fund.aum && <FactRow label="Assets Under Management" value={fund.aum} />}
                <FactRow label="Currency" value={fund.currency} />
                <FactRow label="Minimum Investment" value={fund.minInvestment} />
                {fund.minSubsequentInvestment && <FactRow label="Min. Subsequent Investment" value={fund.minSubsequentInvestment} />}
                {fund.riskRating && <FactRow label="Risk Rating" value={fund.riskRating} />}
                {fund.liquidity && <FactRow label="Liquidity" value={fund.liquidity} />}
                {fund.rspEligible !== undefined && <FactRow label="RSP Eligible" value={fund.rspEligible ? 'Yes' : 'No'} />}
                {fund.distribution && <FactRow label="Distribution Frequency" value={fund.distribution.frequency} />}
                {fund.distribution?.yield != null && <FactRow label="Distribution Yield" value={`${fund.distribution.yield.toFixed(2)}%`} />}
              </tbody>
            </table>
          </Card>
        </div>
      </ScrollReveal>

      {/* Fees */}
      {fund.fees && (
        <ScrollReveal>
          <div>
            <SectionTitle icon={Percent} title={t('fund.overview.fees')} />
            <Card className="overflow-hidden border border-slate-200">
              <table className="w-full fund-table">
                <tbody>
                  <FactRow label="Management Fee" value={fund.fees.managementFee} />
                  {fund.fees.mer && <FactRow label="Management Expense Ratio (MER)" value={fund.fees.mer} />}
                  {fund.fees.tradingExpenseRatio && <FactRow label="Trading Expense Ratio" value={fund.fees.tradingExpenseRatio} />}
                  {fund.fees.performanceFee && <FactRow label="Performance Fee" value={fund.fees.performanceFee} />}
                </tbody>
              </table>
            </Card>
          </div>
        </ScrollReveal>
      )}

      {/* Compound Returns Table */}
      {fund.compoundReturns && (
        <ScrollReveal>
          <div>
            <SectionTitle icon={TrendingUp} title={t('fund.overview.returns')} />
            <Card className="overflow-hidden border border-slate-200">
              <table className="w-full fund-table">
                <thead>
                  <tr>
                    <th>Period</th>
                    <th className="text-right">Return</th>
                  </tr>
                </thead>
                <tbody>
                  {fund.compoundReturns.oneMonth != null && <ReturnRow label="1 Month" value={fund.compoundReturns.oneMonth} />}
                  {fund.compoundReturns.threeMonth != null && <ReturnRow label="3 Months" value={fund.compoundReturns.threeMonth} />}
                  {fund.compoundReturns.sixMonth != null && <ReturnRow label="6 Months" value={fund.compoundReturns.sixMonth} />}
                  <ReturnRow label="Year-to-Date" value={fund.compoundReturns.ytd} />
                  <ReturnRow label="1 Year" value={fund.compoundReturns.oneYear} />
                  {fund.compoundReturns.threeYear != null && <ReturnRow label="3 Years" value={fund.compoundReturns.threeYear} />}
                  {fund.compoundReturns.fiveYear != null && <ReturnRow label="5 Years" value={fund.compoundReturns.fiveYear} />}
                  {fund.compoundReturns.tenYear != null && <ReturnRow label="10 Years" value={fund.compoundReturns.tenYear} />}
                  <ReturnRow label="Since Inception" value={fund.compoundReturns.sinceInception} highlight />
                </tbody>
              </table>
            </Card>
          </div>
        </ScrollReveal>
      )}

      {/* Management Team */}
      <ScrollReveal>
        <div>
          <SectionTitle icon={Users} title={t('fund.overview.team')} />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {fund.managers.map((manager) => (
              <Card key={manager} className="p-5 border border-slate-200">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 font-bold text-sm">
                    {manager.split(' ').map(n => n[0]).join('')}
                  </div>
                  <div>
                    <p className="font-semibold text-slate-900">{manager}</p>
                    <p className="text-sm text-slate-500">{t('fund.manager.title')}</p>
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

/* ────────────────────────────────────────────────────────────────
 * PORTFOLIO TAB
 * ──────────────────────────────────────────────────────────────── */
function PortfolioTab({ fund }: { fund: Fund }) {
  const { t } = useTranslation();
  return (
    <div className="space-y-12">
      {/* Portfolio Characteristics */}
      {fund.portfolioCharacteristics && (
        <ScrollReveal>
          <div>
            <SectionTitle icon={BarChart3} title={t('fund.portfolio.characteristics')} />
            <Card className="overflow-hidden border border-slate-200">
              <table className="w-full fund-table">
                <tbody>
                  {fund.portfolioCharacteristics.duration != null && <FactRow label="Duration" value={`${fund.portfolioCharacteristics.duration} years`} />}
                  {fund.portfolioCharacteristics.modifiedDuration != null && <FactRow label="Modified Duration" value={`${fund.portfolioCharacteristics.modifiedDuration}`} />}
                  {fund.portfolioCharacteristics.yieldToMaturity != null && <FactRow label="Yield to Maturity" value={`${fund.portfolioCharacteristics.yieldToMaturity}%`} />}
                  {fund.portfolioCharacteristics.currentYield != null && <FactRow label="Current Yield" value={`${fund.portfolioCharacteristics.currentYield}%`} />}
                  {fund.portfolioCharacteristics.avgCreditRating && <FactRow label="Avg. Credit Rating" value={fund.portfolioCharacteristics.avgCreditRating} />}
                  {fund.portfolioCharacteristics.avgCoupon != null && <FactRow label="Avg. Coupon" value={`${fund.portfolioCharacteristics.avgCoupon}%`} />}
                  {fund.portfolioCharacteristics.numberOfHoldings != null && <FactRow label="Number of Holdings" value={`${fund.portfolioCharacteristics.numberOfHoldings}`} />}
                  {fund.portfolioCharacteristics.weightedAvgLife != null && <FactRow label="Weighted Avg. Life" value={`${fund.portfolioCharacteristics.weightedAvgLife} years`} />}
                </tbody>
              </table>
            </Card>
          </div>
        </ScrollReveal>
      )}

      {/* Credit Quality */}
      {fund.creditQuality && fund.creditQuality.length > 0 && (
        <ScrollReveal>
          <div>
            <SectionTitle icon={Shield} title={t('fund.portfolio.creditQuality')} />
            <Card className="p-6 border border-slate-200">
              <div className="space-y-3">
                {fund.creditQuality.map((cq) => (
                  <div key={cq.rating} className="flex items-center gap-4">
                    <span className="w-16 text-sm font-semibold text-slate-700">{cq.rating}</span>
                    <div className="flex-1 bg-slate-100 rounded-full h-5 overflow-hidden">
                      <motion.div
                        className="h-full bg-blue-500 rounded-full"
                        initial={{ width: 0 }}
                        whileInView={{ width: `${cq.weight}%` }}
                        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                        viewport={{ once: true }}
                      />
                    </div>
                    <span className="w-14 text-right text-sm font-semibold text-slate-900">{cq.weight.toFixed(1)}%</span>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        </ScrollReveal>
      )}

      {/* Sector Allocation */}
      {fund.sectorAllocation && fund.sectorAllocation.length > 0 && (
        <ScrollReveal>
          <div>
            <SectionTitle icon={PieChartIcon} title={t('fund.portfolio.sectorAllocation')} />
            <Card className="p-6 border border-slate-200">
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={fund.sectorAllocation} layout="vertical" margin={{ left: 20, right: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" horizontal={false} />
                  <XAxis type="number" tick={{ fontSize: 12, fill: '#64748b' }} tickFormatter={(v: unknown) => `${v}%`} />
                  <YAxis type="category" dataKey="sector" width={150} tick={{ fontSize: 12, fill: '#334155' }} />
                  <Tooltip formatter={(v: unknown) => [`${v}%`, 'Weight']} contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '13px' }} />
                  <Bar dataKey="weight" radius={[0, 4, 4, 0]} maxBarSize={24}>
                    {fund.sectorAllocation.map((_, i) => (
                      <Cell key={i} fill={sectorColors[i % sectorColors.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </Card>
          </div>
        </ScrollReveal>
      )}

      {/* Geographic Breakdown */}
      {fund.geographicBreakdown && fund.geographicBreakdown.length > 0 && (
        <ScrollReveal>
          <div>
            <SectionTitle icon={Globe} title={t('fund.portfolio.geography')} />
            <Card className="p-6 border border-slate-200">
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
                {fund.geographicBreakdown.map((geo) => (
                  <div key={geo.region} className="text-center p-4 rounded-lg bg-slate-50">
                    <p className="text-2xl font-bold text-slate-900">{geo.weight.toFixed(1)}%</p>
                    <p className="text-xs text-slate-500 font-medium mt-1">{geo.region}</p>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        </ScrollReveal>
      )}

      {/* Top Holdings */}
      {fund.topHoldings && fund.topHoldings.length > 0 && (
        <ScrollReveal>
          <div>
            <SectionTitle icon={Building2} title={t('fund.portfolio.holdings')} />
            <Card className="overflow-hidden border border-slate-200">
              <div className="overflow-x-auto">
                <table className="w-full fund-table">
                  <thead>
                    <tr>
                      <th>#</th>
                      <th>Name</th>
                      {fund.topHoldings[0]?.coupon && <th>Coupon</th>}
                      {fund.topHoldings[0]?.maturity && <th>Maturity</th>}
                      {fund.topHoldings[0]?.rating && <th>Rating</th>}
                      <th className="text-right">Weight</th>
                    </tr>
                  </thead>
                  <tbody>
                    {fund.topHoldings.map((h, i) => (
                      <tr key={h.name}>
                        <td className="font-medium text-slate-400">{i + 1}</td>
                        <td className="font-medium text-slate-900">{h.name}</td>
                        {fund.topHoldings![0]?.coupon !== undefined && <td>{h.coupon || '—'}</td>}
                        {fund.topHoldings![0]?.maturity !== undefined && <td>{h.maturity || '—'}</td>}
                        {fund.topHoldings![0]?.rating !== undefined && <td>{h.rating || '—'}</td>}
                        <td className="text-right font-semibold text-slate-900">{h.weight.toFixed(1)}%</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          </div>
        </ScrollReveal>
      )}

      {/* Risk Metrics */}
      {fund.riskMetrics && (
        <ScrollReveal>
          <div>
            <SectionTitle icon={Shield} title={t('fund.portfolio.riskMetrics')} />
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              <MetricCard label="Sharpe Ratio" value={fund.riskMetrics.sharpe.toFixed(2)} />
              {fund.riskMetrics.sortino != null && <MetricCard label="Sortino Ratio" value={fund.riskMetrics.sortino.toFixed(2)} />}
              {fund.riskMetrics.maxDrawdown != null && <MetricCard label="Max Drawdown" value={`${fund.riskMetrics.maxDrawdown.toFixed(1)}%`} negative />}
              {fund.riskMetrics.standardDeviation != null && <MetricCard label="Std. Deviation" value={`${fund.riskMetrics.standardDeviation.toFixed(1)}%`} />}
              {fund.riskMetrics.beta != null && <MetricCard label="Beta" value={fund.riskMetrics.beta.toFixed(2)} />}
              {fund.riskMetrics.alpha != null && <MetricCard label="Alpha" value={`${fund.riskMetrics.alpha.toFixed(2)}%`} />}
              {fund.riskMetrics.trackingError != null && <MetricCard label="Tracking Error" value={`${fund.riskMetrics.trackingError.toFixed(2)}%`} />}
              {fund.riskMetrics.informationRatio != null && <MetricCard label="Information Ratio" value={fund.riskMetrics.informationRatio.toFixed(2)} />}
              {fund.riskMetrics.upCaptureRatio != null && <MetricCard label="Up Capture" value={`${fund.riskMetrics.upCaptureRatio}%`} />}
              {fund.riskMetrics.downCaptureRatio != null && <MetricCard label="Down Capture" value={`${fund.riskMetrics.downCaptureRatio}%`} />}
            </div>
          </div>
        </ScrollReveal>
      )}
    </div>
  );
}

/* ────────────────────────────────────────────────────────────────
 * PERFORMANCE TAB
 * ──────────────────────────────────────────────────────────────── */
function PerformanceTab({ fund }: { fund: Fund }) {
  const { t } = useTranslation();
  // Growth of $10K chart data
  const growthData = buildGrowthData(fund);
  const calYears = fund.calendarYearReturns || [];

  return (
    <div className="space-y-12">
      {/* Growth of $10,000 */}
      <ScrollReveal>
        <div>
          <SectionTitle icon={TrendingUp} title={t('fund.performance.growth')} />
          <Card className="p-6 border border-slate-200">
            <ResponsiveContainer width="100%" height={350}>
              <AreaChart data={growthData} margin={{ top: 10, right: 10, bottom: 0, left: 10 }}>
                <defs>
                  <linearGradient id="growthGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#2563eb" stopOpacity={0.15} />
                    <stop offset="95%" stopColor="#2563eb" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="date" tick={{ fontSize: 12, fill: '#64748b' }} />
                <YAxis tick={{ fontSize: 12, fill: '#64748b' }} tickFormatter={(v: unknown) => `$${(Number(v) / 1000).toFixed(0)}k`} />
                <Tooltip
                  formatter={(v: unknown) => [`$${Number(v).toLocaleString('en-CA', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`, 'Value']}
                  contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '13px' }}
                />
                <Area type="monotone" dataKey="value" stroke="#2563eb" strokeWidth={2} fill="url(#growthGrad)" />
              </AreaChart>
            </ResponsiveContainer>
          </Card>
        </div>
      </ScrollReveal>

      {/* Calendar Year Returns */}
      {calYears.length > 0 && (
        <ScrollReveal>
          <div>
            <SectionTitle icon={Calendar} title={t('fund.performance.calendarReturns')} />
            <Card className="p-6 border border-slate-200">
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={calYears} margin={{ top: 10, right: 10, bottom: 0, left: 10 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="year" tick={{ fontSize: 12, fill: '#64748b' }} />
                  <YAxis tick={{ fontSize: 12, fill: '#64748b' }} tickFormatter={(v: unknown) => `${v}%`} />
                  <Tooltip
                    formatter={(v: unknown) => [`${Number(v).toFixed(1)}%`]}
                    contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '13px' }}
                  />
                  <Legend />
                  <Bar dataKey="fund" name="Fund" radius={[4, 4, 0, 0]} maxBarSize={32}>
                    {calYears.map((entry, i) => (
                      <Cell key={i} fill={entry.fund >= 0 ? '#2563eb' : '#ef4444'} />
                    ))}
                  </Bar>
                  {calYears[0]?.benchmark != null && (
                    <Bar dataKey="benchmark" name="Benchmark" radius={[4, 4, 0, 0]} maxBarSize={32} fill="#94a3b8" />
                  )}
                </BarChart>
              </ResponsiveContainer>
            </Card>
          </div>
        </ScrollReveal>
      )}

      {/* Monthly Returns Heatmap */}
      {fund.monthlyReturns && fund.monthlyReturns.length > 0 && (
        <ScrollReveal>
          <div>
            <SectionTitle icon={Calendar} title={t('fund.performance.monthlyReturns')} />
            <Card className="p-6 border border-slate-200">
              <div className="grid grid-cols-6 sm:grid-cols-12 gap-2">
                {fund.monthlyReturns.map((mr) => (
                  <div
                    key={mr.month}
                    className="aspect-square flex flex-col items-center justify-center rounded-lg text-center"
                    style={{
                      backgroundColor: mr.value >= 0
                        ? `rgba(37, 99, 235, ${Math.min(mr.value / 2, 1) * 0.3 + 0.05})`
                        : `rgba(239, 68, 68, ${Math.min(Math.abs(mr.value) / 2, 1) * 0.3 + 0.05})`,
                    }}
                  >
                    <span className="text-[10px] text-slate-500 font-medium">{mr.month}</span>
                    <span className={cn('text-xs font-bold', mr.value >= 0 ? 'text-blue-700' : 'text-red-600')}>
                      {mr.value >= 0 ? '+' : ''}{mr.value.toFixed(1)}%
                    </span>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        </ScrollReveal>
      )}

      {/* Compound Returns Table */}
      {fund.compoundReturns && (
        <ScrollReveal>
          <div>
            <SectionTitle icon={BarChart3} title={t('fund.performance.compoundReturns')} />
            <Card className="overflow-hidden border border-slate-200">
              <table className="w-full fund-table">
                <thead>
                  <tr>
                    <th>Period</th>
                    <th className="text-right">Fund</th>
                  </tr>
                </thead>
                <tbody>
                  {fund.compoundReturns.oneMonth != null && <ReturnRow label="1 Month" value={fund.compoundReturns.oneMonth} />}
                  {fund.compoundReturns.threeMonth != null && <ReturnRow label="3 Months" value={fund.compoundReturns.threeMonth} />}
                  {fund.compoundReturns.sixMonth != null && <ReturnRow label="6 Months" value={fund.compoundReturns.sixMonth} />}
                  <ReturnRow label="YTD" value={fund.compoundReturns.ytd} />
                  <ReturnRow label="1 Year" value={fund.compoundReturns.oneYear} />
                  {fund.compoundReturns.threeYear != null && <ReturnRow label="3 Years" value={fund.compoundReturns.threeYear} />}
                  {fund.compoundReturns.fiveYear != null && <ReturnRow label="5 Years" value={fund.compoundReturns.fiveYear} />}
                  {fund.compoundReturns.tenYear != null && <ReturnRow label="10 Years" value={fund.compoundReturns.tenYear} />}
                  <ReturnRow label="Since Inception" value={fund.compoundReturns.sinceInception} highlight />
                </tbody>
              </table>
            </Card>
          </div>
        </ScrollReveal>
      )}
    </div>
  );
}

/* ────────────────────────────────────────────────────────────────
 * DISTRIBUTIONS TAB
 * ──────────────────────────────────────────────────────────────── */
function DistributionsTab({ fund }: { fund: Fund }) {
  const { t } = useTranslation();
  const dist = fund.distribution;
  const history = fund.distributionHistory || [];

  return (
    <div className="space-y-12">
      {/* Distribution Summary */}
      {dist && (
        <ScrollReveal>
          <div>
            <SectionTitle icon={DollarSign} title={t('fund.distributions.summary')} />
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <Card className="p-5 border border-slate-200 text-center">
                <p className="text-xs uppercase tracking-wider text-slate-500 font-semibold mb-1">{t('fund.distributions.frequency')}</p>
                <p className="text-xl font-bold text-slate-900">{dist.frequency}</p>
              </Card>
              {dist.lastAmount && (
                <Card className="p-5 border border-slate-200 text-center">
                  <p className="text-xs uppercase tracking-wider text-slate-500 font-semibold mb-1">{t('fund.distributions.lastAmount')}</p>
                  <p className="text-xl font-bold text-slate-900">{dist.lastAmount}</p>
                </Card>
              )}
              {dist.yield != null && (
                <Card className="p-5 border border-slate-200 text-center">
                  <p className="text-xs uppercase tracking-wider text-slate-500 font-semibold mb-1">{t('fund.distributions.yield')}</p>
                  <p className="text-xl font-bold text-blue-600">{dist.yield.toFixed(2)}%</p>
                </Card>
              )}
            </div>
          </div>
        </ScrollReveal>
      )}

      {/* Distribution History Table */}
      {history.length > 0 && (
        <ScrollReveal>
          <div>
            <SectionTitle icon={Calendar} title={t('fund.distributions.history')} />
            <Card className="overflow-hidden border border-slate-200">
              <div className="overflow-x-auto">
                <table className="w-full fund-table">
                  <thead>
                    <tr>
                      <th>Ex-Date</th>
                      <th>Pay Date</th>
                      <th className="text-right">Total</th>
                      {history[0]?.interest != null && <th className="text-right">Interest</th>}
                      {history[0]?.capitalGains != null && <th className="text-right">Capital Gains</th>}
                      {history[0]?.returnOfCapital != null && <th className="text-right">Return of Capital</th>}
                    </tr>
                  </thead>
                  <tbody>
                    {history.map((d, i) => (
                      <tr key={i}>
                        <td>{d.exDate}</td>
                        <td>{d.payDate}</td>
                        <td className="text-right font-semibold">${d.amount.toFixed(3)}</td>
                        {d.interest != null && <td className="text-right">${d.interest.toFixed(3)}</td>}
                        {d.capitalGains != null && <td className="text-right">${d.capitalGains.toFixed(3)}</td>}
                        {d.returnOfCapital != null && <td className="text-right">${d.returnOfCapital.toFixed(3)}</td>}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          </div>
        </ScrollReveal>
      )}

      {/* Distribution Trend Chart */}
      {history.length > 2 && (
        <ScrollReveal>
          <div>
            <SectionTitle icon={BarChart3} title={t('fund.distributions.trend')} />
            <Card className="p-6 border border-slate-200">
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={[...history].reverse()} margin={{ top: 10, right: 10, bottom: 0, left: 10 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="payDate" tick={{ fontSize: 11, fill: '#64748b' }} />
                  <YAxis tick={{ fontSize: 12, fill: '#64748b' }} tickFormatter={(v: unknown) => `$${v}`} />
                  <Tooltip
                    formatter={(v: unknown) => [`$${Number(v).toFixed(3)}`, 'Amount']}
                    contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '13px' }}
                  />
                  <Bar dataKey="amount" fill="#2563eb" radius={[4, 4, 0, 0]} maxBarSize={28} />
                </BarChart>
              </ResponsiveContainer>
            </Card>
          </div>
        </ScrollReveal>
      )}
    </div>
  );
}

/* ────────────────────────────────────────────────────────────────
 * DOCUMENTS TAB
 * ──────────────────────────────────────────────────────────────── */
function DocumentsTab({ fund }: { fund: Fund }) {
  const { t } = useTranslation();
  const docs = fund.fundDocuments || [];

  return (
    <div className="space-y-12">
      <ScrollReveal>
        <div>
          <SectionTitle icon={FileText} title={t('fund.documents.title')} />
          {docs.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {docs.map((doc, i) => (
                <Card key={i} className="p-5 border border-slate-200 hover:border-blue-200 transition-colors group cursor-pointer">
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-lg bg-red-50 flex items-center justify-center flex-shrink-0">
                      <FileText className="w-5 h-5 text-red-500" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-slate-900 text-sm mb-1">{doc.name}</p>
                      <p className="text-xs text-slate-500">{doc.type} &middot; {doc.date}</p>
                    </div>
                    <Download className="w-4 h-4 text-slate-300 group-hover:text-blue-500 transition-colors flex-shrink-0 mt-1" />
                  </div>
                </Card>
              ))}
            </div>
          ) : (
            <Card className="p-8 border border-slate-200 text-center">
              <FileText className="w-8 h-8 text-slate-300 mx-auto mb-3" />
              <p className="text-slate-500">{t('fund.documents.empty')}</p>
            </Card>
          )}
        </div>
      </ScrollReveal>
    </div>
  );
}

/* ────────────────────────────────────────────────────────────────
 * SHARED COMPONENTS
 * ──────────────────────────────────────────────────────────────── */
function SectionTitle({ icon: Icon, title }: { icon: React.ComponentType<{ className?: string }>; title: string }) {
  return (
    <div className="flex items-center gap-2 mb-6">
      <Icon className="w-5 h-5 text-blue-600" />
      <h3 className="text-xl font-bold text-slate-900">{title}</h3>
    </div>
  );
}

function FactRow({ label, value }: { label: string; value: string }) {
  return (
    <tr>
      <td className="font-medium text-slate-500 !text-sm">{label}</td>
      <td className="text-right font-semibold text-slate-900 !text-sm">{value}</td>
    </tr>
  );
}

function ReturnRow({ label, value, highlight }: { label: string; value: number; highlight?: boolean }) {
  const positive = value >= 0;
  return (
    <tr className={highlight ? 'bg-blue-50/50' : ''}>
      <td className={cn('font-medium', highlight ? 'text-slate-900 !font-bold' : 'text-slate-700')}>{label}</td>
      <td className={cn('text-right font-semibold', positive ? 'text-green-600' : 'text-red-600', highlight && '!font-bold')}>
        {positive ? '+' : ''}{value.toFixed(2)}%
      </td>
    </tr>
  );
}

function MetricCard({ label, value, negative }: { label: string; value: string; negative?: boolean }) {
  return (
    <Card className="p-4 border border-slate-200 text-center">
      <p className="text-xs text-slate-500 font-medium mb-1">{label}</p>
      <p className={cn('text-lg font-bold', negative ? 'text-red-600' : 'text-slate-900')}>{value}</p>
    </Card>
  );
}

/* ────────────────────────────────────────────────────────────────
 * HELPERS
 * ──────────────────────────────────────────────────────────────── */
const sectorColors = ['#2563eb', '#3b82f6', '#60a5fa', '#93c5fd', '#818cf8', '#a78bfa', '#c4b5fd', '#e2e8f0'];

function buildGrowthData(fund: Fund) {
  const calYears = fund.calendarYearReturns || [];
  if (calYears.length === 0) {
    // Fallback: generate synthetic data from since inception return
    const years = Math.max(3, Math.floor((Date.now() - new Date(fund.inceptionDate).getTime()) / (365.25 * 24 * 60 * 60 * 1000)));
    const annualReturn = fund.returns.sinceInception / 100;
    return Array.from({ length: years + 1 }, (_, i) => ({
      date: `${new Date(fund.inceptionDate).getFullYear() + i}`,
      value: Math.round(10000 * Math.pow(1 + annualReturn, i)),
    }));
  }

  const sorted = [...calYears].sort((a, b) => a.year - b.year);
  let value = 10000;
  const data = [{ date: `${sorted[0].year - 1}`, value: 10000 }];
  for (const yr of sorted) {
    value = Math.round(value * (1 + yr.fund / 100));
    data.push({ date: `${yr.year}`, value });
  }
  return data;
}
