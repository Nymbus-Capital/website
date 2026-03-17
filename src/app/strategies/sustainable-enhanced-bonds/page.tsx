'use client';

import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { ScrollReveal } from '@/components/animations/ScrollReveal';
import AnimatedCounter from '@/components/animations/AnimatedCounter';
import { formatPercent, cn } from '@/lib/utils';
import { funds } from '@/data/funds';
import { team } from '@/data/team';
import Link from 'next/link';
import { FileText, Download, Calendar, Shield, TrendingUp, Leaf, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import {
  BarChart,
  Bar,
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  LineChart,
  Line,
} from 'recharts';

gsap.registerPlugin(ScrollTrigger);

// Color palette for charts
const CHART_COLORS = {
  primary: '#0066FF',
  secondary: '#10B981',
  accent: '#06B6D4',
  danger: '#EF4444',
  warning: '#F59E0B',
};

const creditQualityColors = ['#0066FF', '#0084FF', '#2E9CFF', '#60B4FF', '#9BD4FF', '#D1E7FF'];
const sectorColors = ['#0066FF', '#0084FF', '#2E9CFF', '#60B4FF', '#9BD4FF', '#D1E7FF'];

export default function SustainableEnhancedBondsPage() {
  const fund = funds.find((f) => f.slug === 'sustainable-enhanced-bonds');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!fund) {
    return <div className="text-center py-20">Fund not found</div>;
  }

  const documents = [
    { title: 'Fund Facts (Monthly)', date: 'March 2026', icon: FileText, badge: 'PDF' },
    { title: 'Prospectus', date: 'Updated Jan 2024', icon: Shield, badge: 'PDF' },
    { title: 'Annual Report 2025', date: 'December 2025', icon: Calendar, badge: 'PDF' },
    { title: 'Semi-Annual Report', date: 'September 2025', icon: Calendar, badge: 'PDF' },
    { title: 'Audited Financial Statements', date: 'December 2025', icon: FileText, badge: 'PDF' },
    { title: 'Tax Documents (T3/T5)', date: 'February 2026', icon: Download, badge: 'PDF' },
  ];

  const managers = fund.managers;

  // Transform data for Recharts
  const monthlyReturnsData = (fund.monthlyReturns || []).map((item) => ({
    month: item.month,
    return: item.value,
  }));

  const calendarYearReturnsData = (fund.calendarYearReturns || []).map((item) => ({
    year: item.year.toString(),
    fund: item.fund,
    benchmark: item.benchmark || 0,
  }));

  const creditQualityData = (fund.creditQuality || []).map((item) => ({
    name: item.rating,
    value: item.weight,
  }));

  const sectorAllocationData = (fund.sectorAllocation || []).map((item) => ({
    name: item.sector,
    value: item.weight,
  }));

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <div className="relative overflow-hidden bg-gradient-to-br from-blue-600 via-blue-500 to-slate-900 pt-20 pb-32">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-10 w-72 h-72 bg-blue-300 rounded-full mix-blend-multiply filter blur-3xl" />
          <div className="absolute -bottom-20 right-10 w-72 h-72 bg-blue-400 rounded-full mix-blend-multiply filter blur-3xl" />
        </div>

        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <Link href="/strategies" className="inline-block mb-8">
            <Button variant="ghost" size="sm" className="text-white hover:bg-white/10">
              ← Back to Strategies
            </Button>
          </Link>

          <ScrollReveal direction="up">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="flex items-start justify-between mb-12"
            >
              <div className="flex-1">
                <div className="flex items-center gap-4 mb-6">
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.2, type: 'spring' }}
                    className="bg-white/10 backdrop-blur-md p-3 rounded-lg"
                  >
                    <Leaf className="w-8 h-8 text-emerald-300" />
                  </motion.div>
                  <div>
                    <h1 className="text-5xl md:text-6xl font-bold text-white mb-2">{fund.name}</h1>
                    <p className="text-blue-100 text-lg">ESG-compliant fixed income strategy</p>
                  </div>
                </div>
              </div>

              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 }}
                className="flex gap-3 mt-2"
              >
                <span className="bg-blue-400 text-white px-4 py-2 rounded-full text-sm font-semibold">
                  {fund.assetClass}
                </span>
                <span className="bg-emerald-400 text-slate-900 px-4 py-2 rounded-full text-sm font-semibold">
                  Fossil-Free
                </span>
              </motion.div>
            </motion.div>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="text-blue-50 text-lg max-w-2xl mb-12"
            >
              {fund.description}
            </motion.p>

            {/* Frosted Glass Stats Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-8 grid grid-cols-2 md:grid-cols-4 gap-8"
            >
              <div>
                <p className="text-blue-100 text-sm font-medium mb-2">Assets Under Management</p>
                <p className="text-3xl font-bold text-white">{fund.aum || '—'}</p>
              </div>
              <div>
                <p className="text-blue-100 text-sm font-medium mb-2">Management Expense Ratio</p>
                <p className="text-3xl font-bold text-white">{fund.mer || '—'}</p>
              </div>
              <div>
                <p className="text-blue-100 text-sm font-medium mb-2">Inception Year</p>
                <p className="text-3xl font-bold text-white">{new Date(fund.inceptionDate).getFullYear()}</p>
              </div>
              <div>
                <p className="text-blue-100 text-sm font-medium mb-2">Sharpe Ratio</p>
                <p className="text-3xl font-bold text-white">{fund.riskMetrics?.sharpe?.toFixed(2) || '—'}</p>
              </div>
            </motion.div>
          </ScrollReveal>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        {/* Portfolio Characteristics */}
        <ScrollReveal direction="up" delay={0.1}>
          <div className="mb-20">
            <SectionHeader title="Portfolio Characteristics" description="Key metrics and bond profile" />
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8">
              {[
                {
                  label: 'Duration',
                  value: fund.portfolioCharacteristics?.duration?.toFixed(2),
                  unit: 'years',
                },
                { label: 'Yield to Maturity', value: fund.portfolioCharacteristics?.yieldToMaturity?.toFixed(2), unit: '%' },
                { label: 'Avg Credit Rating', value: fund.portfolioCharacteristics?.avgCreditRating, unit: '' },
                { label: '# Holdings', value: fund.portfolioCharacteristics?.numberOfHoldings, unit: '' },
                { label: 'Avg Coupon', value: fund.portfolioCharacteristics?.avgCoupon?.toFixed(2), unit: '%' },
                { label: 'Current Yield', value: fund.portfolioCharacteristics?.currentYield?.toFixed(2), unit: '%' },
                { label: 'Modified Duration', value: fund.portfolioCharacteristics?.modifiedDuration?.toFixed(2), unit: '' },
                { label: 'WAL', value: fund.portfolioCharacteristics?.weightedAvgLife?.toFixed(2), unit: 'yrs' },
              ].map((metric, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  viewport={{ once: true }}
                >
                  <Card className="p-4 text-center">
                    <p className="text-sm text-slate-600 mb-2">{metric.label}</p>
                    <p className="text-2xl font-bold text-slate-900">
                      {metric.value || '—'}
                      <span className="text-sm text-slate-600 ml-1">{metric.unit}</span>
                    </p>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>
        </ScrollReveal>

        {/* Monthly Returns Chart */}
        <ScrollReveal direction="up" delay={0.15}>
          <div className="mb-20">
            <SectionHeader title="Monthly Returns" description="YTD monthly performance" />
            <Card className="p-8 mt-8">
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={monthlyReturnsData}>
                  <defs>
                    <linearGradient id="colorReturn" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={CHART_COLORS.primary} stopOpacity={0.3} />
                      <stop offset="95%" stopColor={CHART_COLORS.primary} stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis dataKey="month" stroke="#6b7280" />
                  <YAxis stroke="#6b7280" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#fff',
                      border: '1px solid #e5e7eb',
                      borderRadius: '8px',
                    }}
                    formatter={(value) => [formatPercent(Number(value)), 'Return']}
                  />
                  <Area
                    type="monotone"
                    dataKey="return"
                    stroke={CHART_COLORS.primary}
                    strokeWidth={2}
                    fillOpacity={1}
                    fill="url(#colorReturn)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </Card>
          </div>
        </ScrollReveal>

        {/* Calendar Year Returns Chart */}
        <ScrollReveal direction="up" delay={0.2}>
          <div className="mb-20">
            <SectionHeader title="Calendar Year Returns" description="Annual performance vs benchmark" />
            <Card className="p-8 mt-8">
              <ResponsiveContainer width="100%" height={350}>
                <BarChart data={calendarYearReturnsData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis dataKey="year" stroke="#6b7280" />
                  <YAxis stroke="#6b7280" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#fff',
                      border: '1px solid #e5e7eb',
                      borderRadius: '8px',
                    }}
                    formatter={(value) => [formatPercent(Number(value)), '']}
                  />
                  <Legend />
                  <Bar dataKey="fund" fill={CHART_COLORS.primary} name="Fund" radius={[8, 8, 0, 0]} />
                  <Bar dataKey="benchmark" fill={CHART_COLORS.accent} name="Benchmark" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </Card>
          </div>
        </ScrollReveal>

        {/* Top Holdings */}
        <ScrollReveal direction="up" delay={0.25}>
          <div className="mb-20">
            <SectionHeader title="Top Holdings" description="Current portfolio composition" />
            <Card className="p-8 mt-8">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-slate-200">
                      <th className="text-left font-semibold text-slate-900 pb-4">Holding</th>
                      <th className="text-right font-semibold text-slate-900 pb-4">Weight</th>
                      <th className="text-right font-semibold text-slate-900 pb-4">Coupon</th>
                      <th className="text-right font-semibold text-slate-900 pb-4">Maturity</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(fund.topHoldings || []).map((holding, idx) => (
                      <motion.tr
                        key={idx}
                        initial={{ opacity: 0 }}
                        whileInView={{ opacity: 1 }}
                        transition={{ delay: idx * 0.05 }}
                        viewport={{ once: true }}
                        className="border-b border-slate-100 hover:bg-slate-50 transition-colors"
                      >
                        <td className="py-4">
                          <div>
                            <p className="font-medium text-slate-900">{holding.name}</p>
                          </div>
                        </td>
                        <td className="text-right py-4">
                          <div className="flex items-center justify-end gap-2">
                            <div className="w-16 bg-slate-100 rounded h-2 overflow-hidden">
                              <motion.div
                                initial={{ width: 0 }}
                                whileInView={{ width: `${holding.weight}%` }}
                                transition={{ delay: idx * 0.05, duration: 0.6 }}
                                viewport={{ once: true }}
                                className="bg-gradient-to-r from-blue-500 to-blue-600 h-full rounded"
                              />
                            </div>
                            <span className="font-semibold text-slate-900 w-10 text-right">{holding.weight.toFixed(1)}%</span>
                          </div>
                        </td>
                        <td className="text-right py-4 text-slate-600">{holding.coupon || '—'}</td>
                        <td className="text-right py-4 text-slate-600">{holding.maturity || '—'}</td>
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          </div>
        </ScrollReveal>

        {/* Credit Quality & Sector Allocation */}
        <ScrollReveal direction="up" delay={0.3}>
          <div className="grid md:grid-cols-2 gap-8 mb-20">
            {/* Credit Quality - Pie Chart */}
            <div>
              <SectionHeader title="Credit Quality Distribution" description="Portfolio breakdown by rating" />
              <Card className="p-8 mt-6 flex flex-col items-center">
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={creditQualityData}
                      cx="50%"
                      cy="50%"
                      innerRadius={80}
                      outerRadius={110}
                      paddingAngle={2}
                      dataKey="value"
                    >
                      {creditQualityData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={creditQualityColors[index % creditQualityColors.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => `${Number(value).toFixed(1)}%`} />
                  </PieChart>
                </ResponsiveContainer>
                <div className="mt-6 grid grid-cols-2 gap-3 text-sm w-full">
                  {creditQualityData.map((item, index) => (
                    <div key={item.name} className="flex items-center gap-2">
                      <div
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: creditQualityColors[index % creditQualityColors.length] }}
                      />
                      <span className="text-slate-700">
                        {item.name}: <span className="font-semibold">{item.value.toFixed(1)}%</span>
                      </span>
                    </div>
                  ))}
                </div>
              </Card>
            </div>

            {/* Sector Allocation - Pie Chart */}
            <div>
              <SectionHeader title="Sector Allocation" description="Portfolio breakdown by sector" />
              <Card className="p-8 mt-6 flex flex-col items-center">
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={sectorAllocationData}
                      cx="50%"
                      cy="50%"
                      innerRadius={80}
                      outerRadius={110}
                      paddingAngle={2}
                      dataKey="value"
                    >
                      {sectorAllocationData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={sectorColors[index % sectorColors.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => `${Number(value).toFixed(1)}%`} />
                  </PieChart>
                </ResponsiveContainer>
                <div className="mt-6 grid grid-cols-2 gap-3 text-sm w-full">
                  {sectorAllocationData.map((item, index) => (
                    <div key={item.name} className="flex items-center gap-2">
                      <div
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: sectorColors[index % sectorColors.length] }}
                      />
                      <span className="text-slate-700">
                        {item.name}: <span className="font-semibold">{item.value.toFixed(1)}%</span>
                      </span>
                    </div>
                  ))}
                </div>
              </Card>
            </div>
          </div>
        </ScrollReveal>

        {/* Risk Metrics */}
        <ScrollReveal direction="up" delay={0.35}>
          <div className="mb-20">
            <SectionHeader title="Risk Metrics" description="Comprehensive risk analysis" />
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mt-8">
              {[
                { label: 'Sharpe Ratio', value: fund.riskMetrics?.sharpe?.toFixed(2), color: 'blue' },
                { label: 'Sortino Ratio', value: fund.riskMetrics?.sortino?.toFixed(2), color: 'blue' },
                { label: 'Max Drawdown', value: fund.riskMetrics?.maxDrawdown?.toFixed(2), unit: '%', color: 'red' },
                { label: 'Std Deviation', value: fund.riskMetrics?.standardDeviation?.toFixed(2), unit: '%', color: 'blue' },
                { label: 'Beta', value: fund.riskMetrics?.beta?.toFixed(2), color: 'blue' },
                { label: 'Alpha', value: fund.riskMetrics?.alpha?.toFixed(2), unit: '%', color: 'green' },
                { label: 'Tracking Error', value: fund.riskMetrics?.trackingError?.toFixed(2), unit: '%', color: 'blue' },
                { label: 'Information Ratio', value: fund.riskMetrics?.informationRatio?.toFixed(2), color: 'blue' },
                { label: 'Up Capture', value: fund.riskMetrics?.upCaptureRatio?.toFixed(0), unit: '%', color: 'green' },
                { label: 'Down Capture', value: fund.riskMetrics?.downCaptureRatio?.toFixed(0), unit: '%', color: 'green' },
              ].map((metric, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, scale: 0.95 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  transition={{ delay: idx * 0.05 }}
                  viewport={{ once: true }}
                >
                  <Card className="p-4">
                    <p className="text-xs text-slate-600 mb-2 uppercase tracking-wider">{metric.label}</p>
                    <p className={cn('text-2xl font-bold', metric.color === 'green' && 'text-emerald-600', metric.color === 'red' && 'text-red-600', metric.color === 'blue' && 'text-blue-600')}>
                      {metric.value || '—'}
                      <span className="text-sm text-slate-600 ml-1">{metric.unit || ''}</span>
                    </p>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>
        </ScrollReveal>

        {/* Distribution Info */}
        <ScrollReveal direction="up" delay={0.4}>
          <div className="mb-20">
            <SectionHeader title="Distribution Information" description="Income and dividend details" />
            <Card className="p-8 mt-8">
              <div className="grid md:grid-cols-3 gap-8">
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                  viewport={{ once: true }}
                >
                  <p className="text-sm text-slate-600 mb-2">Frequency</p>
                  <p className="text-2xl font-bold text-slate-900">{fund.distribution?.frequency || '—'}</p>
                </motion.div>
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  viewport={{ once: true }}
                >
                  <p className="text-sm text-slate-600 mb-2">Last Distribution</p>
                  <p className="text-2xl font-bold text-slate-900">{fund.distribution?.lastAmount || '—'}</p>
                </motion.div>
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  viewport={{ once: true }}
                >
                  <p className="text-sm text-slate-600 mb-2">Distribution Yield</p>
                  <p className="text-2xl font-bold text-slate-900">
                    {fund.distribution?.yield?.toFixed(2)}%
                  </p>
                </motion.div>
              </div>
            </Card>
          </div>
        </ScrollReveal>

        {/* Management Team */}
        <ScrollReveal direction="up" delay={0.45}>
          <div className="mb-20">
            <SectionHeader title="Management Team" description="Fund managers and their expertise" />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
              {managers.map((managerName, idx) => {
                const teamMember = team.find((t) => t.name === managerName);
                return (
                  <motion.div
                    key={managerName}
                    initial={{ opacity: 0, y: 10 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.1 }}
                    viewport={{ once: true }}
                  >
                    <Card className="p-6 hover:shadow-lg hover:scale-105 transition-all cursor-pointer">
                      <div className="flex items-start gap-4 mb-4">
                        <motion.div
                          whileHover={{ scale: 1.1 }}
                          className={`w-12 h-12 rounded-lg flex items-center justify-center text-white font-bold text-lg`}
                          style={{ backgroundColor: teamMember?.color || '#0066FF' }}
                        >
                          {teamMember?.initials || managerName[0]}
                        </motion.div>
                        <div className="flex-1">
                          <h3 className="font-semibold text-slate-900 text-lg">{managerName}</h3>
                          <p className="text-slate-600 text-sm">{teamMember?.title || 'Portfolio Manager'}</p>
                        </div>
                      </div>
                      {teamMember?.designations && teamMember.designations.length > 0 && (
                        <div className="flex flex-wrap gap-2">
                          {teamMember.designations.map((designation) => (
                            <span
                              key={designation}
                              className="bg-blue-50 text-blue-700 text-xs font-medium px-2 py-1 rounded"
                            >
                              {designation}
                            </span>
                          ))}
                        </div>
                      )}
                    </Card>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </ScrollReveal>

        {/* Fund Documentation */}
        <ScrollReveal direction="up" delay={0.5}>
          <div className="mb-20">
            <SectionHeader title="Fund Documentation & Reports" description="Access important fund documents" />
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">
              {documents.map((doc, index) => {
                const IconComponent = doc.icon;
                return (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 10 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    viewport={{ once: true }}
                  >
                    <Card className="p-6 border-l-4 border-l-blue-600 hover:shadow-lg hover:scale-105 transition-all group cursor-pointer">
                      <div className="flex items-start justify-between mb-4">
                        <motion.div
                          whileHover={{ scale: 1.1 }}
                          className="p-3 bg-blue-50 rounded-lg group-hover:bg-blue-100 transition-colors"
                        >
                          <IconComponent className="w-6 h-6 text-blue-600" />
                        </motion.div>
                        <span className="bg-slate-200 text-slate-700 text-xs font-semibold px-2 py-1 rounded">
                          {doc.badge}
                        </span>
                      </div>
                      <h3 className="font-semibold text-slate-900 mb-1">{doc.title}</h3>
                      <p className="text-sm text-slate-600 mb-4">{doc.date}</p>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="w-full justify-center text-blue-600 hover:bg-blue-50"
                      >
                        <Download className="w-4 h-4 mr-2" />
                        Download
                      </Button>
                    </Card>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </ScrollReveal>

        {/* CTA Section */}
        <ScrollReveal direction="up" delay={0.55}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="bg-gradient-to-r from-blue-600 to-blue-500 rounded-2xl p-12 text-center"
          >
            <motion.div
              animate={{ y: [0, -8, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <TrendingUp className="w-12 h-12 text-white mx-auto mb-4" />
            </motion.div>
            <h2 className="text-3xl font-bold text-white mb-3">Ready to Invest?</h2>
            <p className="text-blue-100 mb-6 max-w-xl mx-auto">
              Start building a sustainable fixed income portfolio aligned with your values.
            </p>
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button size="lg" className="bg-white text-blue-600 hover:bg-blue-50">
                Contact Our Team
              </Button>
            </motion.div>
          </motion.div>
        </ScrollReveal>
      </div>
    </div>
  );
}