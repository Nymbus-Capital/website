'use client';

import { useRef, useEffect, useState, ReactNode } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
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

const tabs = ['Overview', 'Portfolio', 'Performance', 'Distributions', 'Documents'] as const;
type TabKey = typeof tabs[number];

export default function FundDetailLayout({ fund, extraSections }: FundDetailLayoutProps) {
  const [activeTab, setActiveTab] = useState<TabKey>('Overview');
  const tabBarRef = useRef<HTMLDivElement>(null);

  return (
    <div className="min-h-screen bg-white">
      {/* ── Hero ── */}
      <HeroSection fund={fund} />

      {/* ── Sticky Tabs ── */}
      <div ref={tabBarRef} className="sticky top-0 z-40 bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8">
          <div className="flex items-center gap-1 overflow-x-auto no-scrollbar">
            {tabs.map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={cn(
                  'px-4 py-4 text-sm font-medium border-b-2 transition-colors whitespace-nowrap',
                  activeTab === tab
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-slate-600 hover:text-slate-900'
                )}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ── Tab Content ── */}
      <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8 py-16">
        <AnimatePresence mode="wait">
          {activeTab === 'Overview' && <OverviewTab fund={fund} />}
          {activeTab === 'Portfolio' && <PortfolioTab fund={fund} />}
          {activeTab === 'Performance' && <PerformanceTab fund={fund} />}
          {activeTab === 'Distributions' && <DistributionsTab fund={fund} />}
          {activeTab === 'Documents' && <DocumentsTab fund={fund} />}
        </AnimatePresence>
      </div>

      {/* ── Extra Sections ── */}
      {extraSections}
    </div>
  );
}

function HeroSection({ fund }: { fund: Fund }) {
  return (
    <div className="bg-white border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8 py-16">
        <Link href="/strategies" className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 mb-4 text-sm font-medium">
          <ArrowLeft className="w-4 h-4" /> Back to Strategies
        </Link>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="md:col-span-2">
            <p className="text-sm font-semibold text-blue-600 uppercase tracking-wide mb-2">{fund.category}</p>
            <h1 className="text-4xl md:text-5xl font-bold text-slate-900 mb-4 leading-tight">{fund.name}</h1>
            <p className="text-lg text-slate-600 leading-relaxed">{fund.description}</p>
          </div>
          <div className="space-y-4">
            <Card className="p-4 border border-slate-200">
              <p className="text-xs uppercase tracking-wider text-slate-500 font-semibold mb-1">Asset Class</p>
              <p className="text-lg font-bold text-slate-900">{fund.assetClass}</p>
            </Card>
            <Card className="p-4 border border-slate-200">
              <p className="text-xs uppercase tracking-wider text-slate-500 font-semibold mb-1">Vehicle</p>
              <p className="text-lg font-bold text-slate-900">{fund.vehicle}</p>
            </Card>
            <Card className="p-4 border border-slate-200">
              <p className="text-xs uppercase tracking-wider text-slate-500 font-semibold mb-1">Inception Date</p>
              <p className="text-lg font-bold text-slate-900">{fund.inceptionDate}</p>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}

function OverviewTab({ fund }: { fund: Fund }) {
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-12">
        {[
          { label: 'AUM', value: fund.aum, icon: DollarSign },
          { label: '1-Year Return', value: `${fund.returns.oneYear}%`, icon: TrendingUp, isPositive: fund.returns.oneYear >= 0 },
          { label: 'Sharpe Ratio', value: fund.metrics.sharpeRatio.toFixed(2), icon: BarChart3 },
          { label: 'Max Drawdown', value: `${fund.metrics.maxDrawdown}%`, icon: ArrowDownRight, isNegative: true },
        ].map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.label} className="p-4 border border-slate-200">
              <div className="flex items-start justify-between mb-2">
                <p className="text-xs uppercase tracking-wider text-slate-500 font-semibold">{stat.label}</p>
                <Icon className={cn('w-4 h-4', stat.isPositive ? 'text-green-600' : stat.isNegative ? 'text-red-600' : 'text-slate-400')} />
              </div>
              <p className={cn('text-2xl font-bold', stat.isPositive ? 'text-green-600' : stat.isNegative ? 'text-red-600' : 'text-slate-900')}>
                {stat.value}
              </p>
            </Card>
          );
        })}
      </div>
      <Card className="p-8 border border-slate-200 mb-12">
        <h3 className="text-xl font-bold text-slate-900 mb-4">Strategy Overview</h3>
        <p className="text-slate-600 leading-relaxed mb-4">{fund.description}</p>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 pt-4 border-t border-slate-200">
          {fund.details?.map((detail) => (
            <div key={detail.label}>
              <p className="text-xs uppercase tracking-wider text-slate-500 font-semibold mb-1">{detail.label}</p>
              <p className="text-sm font-medium text-slate-900">{detail.value}</p>
            </div>
          ))}
        </div>
      </Card>
    </motion.div>
  );
}

function PortfolioTab({ fund }: { fund: Fund }) {
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
      <Card className="p-8 border border-slate-200">
        <h3 className="text-xl font-bold text-slate-900 mb-6">Portfolio Composition</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div>
            <h4 className="text-sm font-semibold text-slate-700 mb-4">Top Holdings</h4>
            <div className="space-y-3">
              {fund.topHoldings?.map((holding) => (
                <div key={holding.name} className="flex items-center justify-between pb-2 border-b border-slate-100">
                  <span className="text-sm text-slate-600">{holding.name}</span>
                  <span className="text-sm font-medium text-slate-900">{holding.weight}%</span>
                </div>
              ))}
            </div>
          </div>
          <div>
            <h4 className="text-sm font-semibold text-slate-700 mb-4">Allocation by Type</h4>
            <div className="space-y-3">
              {fund.allocation?.map((alloc) => (
                <div key={alloc.type} className="flex items-center justify-between pb-2 border-b border-slate-100">
                  <span className="text-sm text-slate-600">{alloc.type}</span>
                  <span className="text-sm font-medium text-slate-900">{alloc.percent}%</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </Card>
    </motion.div>
  );
}

function PerformanceTab({ fund }: { fund: Fund }) {
  const chartData = [
    { month: 'Jan', value: 100 },
    { month: 'Feb', value: 102 },
    { month: 'Mar', value: 101 },
    { month: 'Apr', value: 105 },
    { month: 'May', value: 108 },
    { month: 'Jun', value: 107 },
  ];

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
      <Card className="p-8 border border-slate-200 mb-8">
        <h3 className="text-xl font-bold text-slate-900 mb-6">Performance Chart</h3>
        <ResponsiveContainer width="100%" height={300}>
          <AreaChart data={chartData}>
            <defs>
              <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#2563eb" stopOpacity={0.1} />
                <stop offset="95%" stopColor="#2563eb" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
            <XAxis dataKey="month" stroke="#94a3b8" />
            <YAxis stroke="#94a3b8" />
            <Tooltip />
            <Area type="monotone" dataKey="value" stroke="#2563eb" fillOpacity={1} fill="url(#colorValue)" />
          </AreaChart>
        </ResponsiveContainer>
      </Card>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {[
          { label: '1-Year Return', value: `${fund.returns.oneYear}%` },
          { label: '3-Year Return', value: `${fund.returns.threeYear}%` },
          { label: '5-Year Return', value: `${fund.returns.fiveYear}%` },
          { label: 'Since Inception', value: `${fund.returns.sinceInception}%` },
        ].map((metric) => (
          <Card key={metric.label} className="p-4 border border-slate-200">
            <p className="text-xs uppercase tracking-wider text-slate-500 font-semibold mb-2">{metric.label}</p>
            <p className="text-2xl font-bold text-slate-900">{metric.value}</p>
          </Card>
        ))}
      </div>
    </motion.div>
  );
}

function DistributionsTab({ fund }: { fund: Fund }) {
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
      <Card className="p-8 border border-slate-200">
        <h3 className="text-xl font-bold text-slate-900 mb-6">Distribution History</h3>
        <table className="fund-table w-full">
          <thead>
            <tr>
              <th>Date</th>
              <th>Per Unit</th>
              <th>Frequency</th>
              <th>Yield</th>
            </tr>
          </thead>
          <tbody>
            {fund.distributions?.map((dist) => (
              <tr key={dist.date}>
                <td>{dist.date}</td>
                <td>${dist.perUnit.toFixed(2)}</td>
                <td>{dist.frequency}</td>
                <td>{dist.yield}%</td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </motion.div>
  );
}

function DocumentsTab({ fund }: { fund: Fund }) {
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
      <div className="space-y-4">
        {[
          { name: 'Fund Factsheet', type: 'PDF', date: '2024-01' },
          { name: 'Annual Report', type: 'PDF', date: '2023-12' },
          { name: 'Prospectus', type: 'PDF', date: '2023-06' },
        ].map((doc) => (
          <Card key={doc.name} className="p-4 border border-slate-200 flex items-center justify-between hover:bg-slate-50 transition-colors">
            <div className="flex items-center gap-3">
              <FileText className="w-5 h-5 text-blue-600" />
              <div>
                <p className="text-sm font-medium text-slate-900">{doc.name}</p>
                <p className="text-xs text-slate-500">{doc.type} • {doc.date}</p>
              </div>
            </div>
            <button className="p-2 hover:bg-slate-200 rounded-lg transition-colors">
              <Download className="w-4 h-4 text-slate-600 hover:text-slate-900" />
            </button>
          </Card>
        ))}
      </div>
    </motion.div>
  );
}