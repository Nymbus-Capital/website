'use client';

import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { motion } from 'framer-motion';
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  Legend,
  XAxis,
  YAxis,
  CartesianGrid,
} from 'recharts';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { ScrollReveal } from '@/components/animations/ScrollReveal';
import AnimatedCounter from '@/components/animations/AnimatedCounter';
import { formatPercent, cn } from '@/lib/utils';
import { funds } from '@/data/funds';
import { team } from '@/data/team';
import Link from 'next/link';
import {
  FileText,
  Download,
  Calendar,
  Shield,
  TrendingUp,
  Droplet,
  BarChart3,
  Lock,
  Zap,
  Gauge,
  Target,
} from 'lucide-react';

gsap.registerPlugin(ScrollTrigger);

interface DocumentCard {
  title: string;
  category: string;
  updated: string;
  icon: React.ReactNode;
}

export default function MonthlyIncomeFundPage() {
  const fund = funds.find((f) => f.slug === 'sustainable-enhanced-short-term-bonds');

  useEffect(() => {
    return () => {
      ScrollTrigger.getAll().forEach((trigger) => trigger.kill());
    };
  }, []);

  if (!fund) {
    return <div className="text-center py-20">Fund not found</div>;
  }

  // Find managers from team data
  const fundManagers = team.filter((member) =>
    fund.managers.some((m) => m.toLowerCase() === member.name.toLowerCase())
  );

  const documents: DocumentCard[] = [
    {
      title: 'Fund Facts (Monthly)',
      category: 'Fund Facts',
      updated: 'Mar 2026',
      icon: <FileText className="w-6 h-6" />,
    },
    {
      title: 'Prospectus',
      category: 'Prospectus',
      updated: 'Jan 2024',
      icon: <Shield className="w-6 h-6" />,
    },
    {
      title: 'Annual Report 2025',
      category: 'Annual Report',
      updated: 'Dec 2025',
      icon: <Calendar className="w-6 h-6" />,
    },
    {
      title: 'Semi-Annual Report',
      category: 'Semi-Annual Report',
      updated: 'Sep 2025',
      icon: <Calendar className="w-6 h-6" />,
    },
  ];

  // Transform data for charts
  const monthlyData = (fund.monthlyReturns || []).map((item) => ({
    month: item.month,
    return: item.value,
  }));

  const quarterlyData = (fund.calendarYearReturns || []).map((item) => ({
    year: item.year.toString(),
    fund: item.fund,
    benchmark: item.benchmark || 0,
  }));

  const creditQualityData = (fund.creditQuality || []).map((item) => ({
    name: item.rating,
    value: item.weight,
  }));

  const chartColors = ['#10B981', '#34D399', '#6EE7B7', '#A7F3D0', '#D1FAE5'];

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <div className="relative overflow-hidden bg-gradient-to-br from-emerald-600 via-green-500 to-slate-900 pt-20 pb-32">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-10 w-72 h-72 bg-emerald-300 rounded-full mix-blend-multiply filter blur-3xl" />
          <div className="absolute -bottom-20 right-10 w-72 h-72 bg-green-400 rounded-full mix-blend-multiply filter blur-3xl" />
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
                    <Droplet className="w-8 h-8 text-emerald-300" />
                  </motion.div>
                  <div>
                    <h1 className="text-5xl md:text-6xl font-bold text-white mb-2">{fund.name}</h1>
                    <p className="text-emerald-100 text-lg">Conservative short-term fixed income strategy</p>
                  </div>
                </div>
              </div>

              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 }}
                className="flex gap-3 mt-2"
              >
                <span className="bg-emerald-400 text-slate-900 px-4 py-2 rounded-full text-sm font-semibold">
                  {fund.assetClass}
                </span>
                <span className="bg-green-400 text-slate-900 px-4 py-2 rounded-full text-sm font-semibold">
                  Monthly Income
                </span>
              </motion.div>
            </motion.div>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="text-emerald-50 text-lg max-w-2xl mb-12"
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
                <p className="text-emerald-100 text-sm font-medium mb-2">Assets Under Management</p>
                <p className="text-3xl font-bold text-white">{fund.aum || '—'}</p>
              </div>
              <div>
                <p className="text-emerald-100 text-sm font-medium mb-2">Management Expense Ratio</p>
                <p className="text-3xl font-bold text-white">{fund.mer || '—'}</p>
              </div>
              <div>
                <p className="text-emerald-100 text-sm font-medium mb-2">Inception Year</p>
                <p className="text-3xl font-bold text-white">{new Date(fund.inceptionDate).getFullYear()}</p>
              </div>
              <div>
                <p className="text-emerald-100 text-sm font-medium mb-2">Distribution Yield</p>
                <p className="text-3xl font-bold text-white">{fund.distribution?.yield?.toFixed(2)}%</p>
              </div>
            </motion.div>
          </ScrollReveal>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        {/* Key Features */}
        <ScrollReveal direction="up" delay={0.1}>
          <div className="mb-20">
            <SectionHeader title="Fund Strategy" description="Conservative approach to income generation" />
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
              {[
                {
                  icon: Lock,
                  title: 'Capital Preservation',
                  description: 'Focuses on protecting capital while generating monthly income through short-term securities',
                },
                {
                  icon: Gauge,
                  title: 'Low Volatility',
                  description: 'Invests in high-quality, short-duration bonds to minimize interest rate risk',
                },
                {
                  icon: Target,
                  title: 'ESG Integration',
                  description: 'Applies strict ESG screening to ensure holdings meet sustainability standards',
                },
              ].map((feature, idx) => {
                const Icon = feature.icon;
                return (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, y: 10 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.1 }}
                    viewport={{ once: true }}
                  >
                    <Card className="p-6 h-full">
                      <Icon className="w-8 h-8 text-emerald-600 mb-4" />
                      <h3 className="text-lg font-semibold text-slate-900 mb-2">{feature.title}</h3>
                      <p className="text-slate-600 text-sm">{feature.description}</p>
                    </Card>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </ScrollReveal>

        {/* Monthly Returns */}
        <ScrollReveal direction="up" delay={0.15}>
          <div className="mb-20">
            <SectionHeader title="Monthly Returns" description="YTD monthly performance" />
            <Card className="p-8 mt-8">
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={monthlyData}>
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
                  <Bar dataKey="return" fill="#10B981" name="Fund Return" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </Card>
          </div>
        </ScrollReveal>

        {/* Quarterly Returns vs Benchmark */}
        <ScrollReveal direction="up" delay={0.2}>
          <div className="mb-20">
            <SectionHeader title="Annual Returns" description="Fund vs benchmark performance" />
            <Card className="p-8 mt-8">
              <ResponsiveContainer width="100%" height={350}>
                <BarChart data={quarterlyData}>
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
                  <Bar dataKey="fund" fill="#10B981" name="Fund" radius={[8, 8, 0, 0]} />
                  <Bar dataKey="benchmark" fill="#D1D5DB" name="Benchmark" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </Card>
          </div>
        </ScrollReveal>

        {/* Credit Quality Distribution */}
        <ScrollReveal direction="up" delay={0.25}>
          <div className="mb-20">
            <SectionHeader title="Credit Quality Distribution" description="Portfolio breakdown by rating" />
            <Card className="p-8 mt-8 flex flex-col items-center">
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
                      <Cell key={`cell-${index}`} fill={chartColors[index % chartColors.length]} />
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
                      style={{ backgroundColor: chartColors[index % chartColors.length] }}
                    />
                    <span className="text-slate-700">
                      {item.name}: <span className="font-semibold">{item.value.toFixed(1)}%</span>
                    </span>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        </ScrollReveal>

        {/* Risk Metrics */}
        <ScrollReveal direction="up" delay={0.3}>
          <div className="mb-20">
            <SectionHeader title="Risk Metrics" description="Key risk indicators" />
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mt-8">
              {[
                { label: 'Sharpe Ratio', value: fund.riskMetrics?.sharpe?.toFixed(2), color: 'blue' },
                { label: 'Std Deviation', value: fund.riskMetrics?.standardDeviation?.toFixed(2), unit: '%', color: 'blue' },
                { label: 'Max Drawdown', value: fund.riskMetrics?.maxDrawdown?.toFixed(2), unit: '%', color: 'red' },
                { label: 'Beta', value: fund.riskMetrics?.beta?.toFixed(2), color: 'blue' },
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
                    <p className={cn('text-2xl font-bold', metric.color === 'blue' && 'text-emerald-600', metric.color === 'red' && 'text-red-600')}>
                      {metric.value || '—'}
                      <span className="text-sm text-slate-600 ml-1">{metric.unit || ''}</span>
                    </p>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>
        </ScrollReveal>

        {/* Distribution Details */}
        <ScrollReveal direction="up" delay={0.35}>
          <div className="mb-20">
            <SectionHeader title="Distribution Information" description="Monthly payment details" />
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
                  <p className="text-2xl font-bold text-slate-900">{fund.distribution?.yield?.toFixed(2)}%</p>
                </motion.div>
              </div>
            </Card>
          </div>
        </ScrollReveal>

        {/* Management Team */}
        <ScrollReveal direction="up" delay={0.4}>
          <div className="mb-20">
            <SectionHeader title="Management Team" description="Fund managers and their expertise" />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
              {fundManagers.map((manager, idx) => (
                <motion.div
                  key={manager.name}
                  initial={{ opacity: 0, y: 10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.1 }}
                  viewport={{ once: true }}
                >
                  <Card className="p-6 hover:shadow-lg transition-all cursor-pointer">
                    <div className="flex items-start gap-4">
                      <motion.div
                        whileHover={{ scale: 1.1 }}
                        className={`w-12 h-12 rounded-lg flex items-center justify-center text-white font-bold text-lg`}
                        style={{ backgroundColor: manager.color }}
                      >
                        {manager.initials}
                      </motion.div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-slate-900 text-lg">{manager.name}</h3>
                        <p className="text-slate-600 text-sm">{manager.title}</p>
                      </div>
                    </div>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>
        </ScrollReveal>

        {/* Fund Documentation */}
        <ScrollReveal direction="up" delay={0.45}>
          <div className="mb-20">
            <SectionHeader title="Fund Documentation" description="Access important fund documents" />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
              {documents.map((doc, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  viewport={{ once: true }}
                >
                  <Card className="p-6 border-l-4 border-l-emerald-600 hover:shadow-lg transition-all group cursor-pointer">
                    <div className="flex items-start justify-between mb-4">
                      <motion.div whileHover={{ scale: 1.1 }} className="p-3 bg-emerald-50 rounded-lg">
                        {doc.icon}
                      </motion.div>
                      <span className="bg-slate-200 text-slate-700 text-xs font-semibold px-2 py-1 rounded">
                        PDF
                      </span>
                    </div>
                    <h3 className="font-semibold text-slate-900 mb-1">{doc.title}</h3>
                    <p className="text-sm text-slate-600 mb-4">{doc.category}</p>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="w-full justify-center text-emerald-600 hover:bg-emerald-50"
                    >
                      <Download className="w-4 h-4 mr-2" />
                      Download
                    </Button>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>
        </ScrollReveal>

        {/* CTA Section */}
        <ScrollReveal direction="up" delay={0.5}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="bg-gradient-to-r from-emerald-600 to-green-500 rounded-2xl p-12 text-center"
          >
            <motion.div
              animate={{ y: [0, -8, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <TrendingUp className="w-12 h-12 text-white mx-auto mb-4" />
            </motion.div>
            <h2 className="text-3xl font-bold text-white mb-3">Generate Monthly Income</h2>
            <p className="text-emerald-100 mb-6 max-w-xl mx-auto">
              Build a sustainable income portfolio with our ESG-compliant short-term bond strategy.
            </p>
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button size="lg" className="bg-white text-emerald-600 hover:bg-emerald-50">
                Learn More
              </Button>
            </motion.div>
          </motion.div>
        </ScrollReveal>
      </div>
    </div>
  );
}