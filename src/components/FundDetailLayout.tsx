'use client';

import { useRef, useEffect, useState, useMemo, ReactNode } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis,
  CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from 'recharts';
import {
  ArrowUpRight, ArrowDownRight, TrendingUp, Shield, Calendar,
  FileText, Download, ChevronRight, Info, DollarSign, BarChart3,
  PieChart as PieChartIcon, Clock, Target, Award, Building2,
  Globe, CreditCard, Percent, Users,
} from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { ScrollReveal } from '@/components/animations/ScrollReveal';
import AnimatedCounter from '@/components/animations/AnimatedCounter';
import { cn } from '@/lib/utils';
import type { Fund } from '@/data/funds';

gsap.registerPlugin(ScrollTrigger);

/* ──────────────────────────────────────────────────────────────
 * COLOR THEMES
 * ────────────────────────────────────────────────────────────── */
export interface FundTheme {
  primary: string;       // e.g. '#2563eb'
  primaryLight: string;  // e.g. '#dbeafe'
  primaryDark: string;   // e.g. '#1e40af'
  gradient: string;      // tailwind gradient class
  chartColors: string[];
  accentText: string;    // tailwind text class
  accentBg: string;      // tailwind bg class
  accentBorder: string;  // tailwind border class
  accentRing: string;    // tailwind ring class
}

export const themes: Record<string, FundTheme> = {
  blue: {
    primary: '#2563eb',
    primaryLight: '#dbeafe',
    primaryDark: '#1e40af',
    gradient: 'from-blue-600 to-blue-800',
    chartColors: ['#2563eb', '#3b82f6', '#60a5fa', '#93c5fd', '#bfdbfe', '#dbeafe'],
    accentText: 'text-blue-600',
    accentBg: 'bg-blue-600',
    accentBorder: 'border-blue-600',
    accentRing: 'ring-blue-600',
  },
  emerald: {
    primary: '#059669',
    primaryLight: '#d1fae5',
    primaryDark: '#065f46',
    gradient: 'from-emerald-600 to-emerald-800',
    chartColors: ['#059669', '#10b981', '#34d399', '#6ee7b7', '#a7f3d0', '#d1fae5'],
    accentText: 'text-emerald-600',
    accentBg: 'bg-emerald-600',
    accentBorder: 'border-emerald-600',
    accentRing: 'ring-emerald-600',
  },
  violet: {
    primary: '#7c3aed',
    primaryLight: '#ede9fe',
    primaryDark: '#5b21b6',
    gradient: 'from-violet-600 to-violet-800',
    chartColors: ['#7c3aed', '#8b5cf6', '#a78bfa', '#c4b5fd', '#ddd6fe', '#ede9fe'],
    accentText: 'text-violet-600',
    accentBg: 'bg-violet-600',
    accentBorder: 'border-violet-600',
    accentRing: 'ring-violet-600',
  },
  amber: {
    primary: '#b45309',
    primaryLight: '#fef3c7',
    primaryDark: '#78350f',
    gradient: 'from-amber-600 to-amber-800',
    chartColors: ['#b45309', '#d97706', '#f59e0b', '#fbbf24', '#fcd34d', '#fef3c7'],
    accentText: 'text-amber-600',
    accentBg: 'bg-amber-600',
    accentBorder: 'border-amber-600',
    accentRing: 'ring-amber-600',
  },
};

/* ──────────────────────────────────────────────────────────────
 * STICKY TABS SECTION
 * ────────────────────────────────────────────────────────────── */
interface TabDefinition {
  id: string;
  label: string;
  icon: React.ReactNode;
}

const TAB_DEFINITIONS: TabDefinition[] = [
  { id: 'overview', label: 'Overview', icon: <TrendingUp className="w-4 h-4" /> },
  { id: 'performance', label: 'Performance', icon: <BarChart3 className="w-4 h-4" /> },
  { id: 'holdings', label: 'Holdings', icon: <PieChartIcon className="w-4 h-4" /> },
  { id: 'characteristics', label: 'Characteristics', icon: <Target className="w-4 h-4" /> },
  { id: 'documents', label: 'Documents', icon: <FileText className="w-4 h-4" /> },
];

function StickyTabNavigation({ activeTab, onTabChange, theme }: {
  activeTab: string;
  onTabChange: (tabId: string) => void;
  theme: FundTheme;
}) {
  return (
    <div
      className="sticky top-0 z-30 bg-white border-b border-slate-200 shadow-sm"
      style={{
        backgroundImage: `linear-gradient(135deg, rgba(255,255,255,0.98) 0%, rgba(${parseInt(theme.primaryLight.slice(1, 3), 16)},${parseInt(theme.primaryLight.slice(3, 5), 16)},${parseInt(theme.primaryLight.slice(5, 7), 16)},0.03) 100%)`,
      }}
    >
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex gap-8 overflow-x-auto">
          {TAB_DEFINITIONS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={cn(
                'relative flex items-center gap-2 py-4 px-1 text-sm font-medium transition-colors duration-200',
                activeTab === tab.id
                  ? `${theme.accentText}`
                  : 'text-slate-500 hover:text-slate-700'
              )}
            >
              {tab.icon}
              {tab.label}
              {activeTab === tab.id && (
                <motion.div
                  layoutId="activeTab"
                  className={`absolute bottom-0 left-0 right-0 h-0.5 ${theme.accentBg}`}
                  transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                />
              )}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ──────────────────────────────────────────────────────────────
 * TAB CONTENT COMPONENTS
 * ────────────────────────────────────────────────────────────── */

function OverviewTab({ fund, theme }: { fund: Fund; theme: FundTheme }) {
  return (
    <div className="space-y-8">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'AUM', value: fund.aum, icon: DollarSign },
          { label: 'Risk Rating', value: fund.riskRating, icon: Shield },
          { label: 'Inception', value: fund.inceptionDate, icon: Calendar },
          { label: 'Liquidity', value: fund.liquidity, icon: Clock },
        ].map((item) => {
          const Icon = item.icon;
          return (
            <Card key={item.label}>
              <div className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm text-slate-500">{item.label}</p>
                  <Icon className="w-4 h-4 text-slate-400" />
                </div>
                <p className="text-lg font-semibold text-slate-900">{item.value}</p>
              </div>
            </Card>
          );
        })}
      </div>

      <Card>
        <div className="p-6">
          <h3 className="text-lg font-bold text-slate-900 mb-3">Investment Objective</h3>
          <p className="text-slate-600 leading-relaxed">{fund.objectives}</p>
        </div>
      </Card>

      <Card>
        <div className="p-6">
          <h3 className="text-lg font-bold text-slate-900 mb-3">Investment Focus</h3>
          <p className="text-slate-600 leading-relaxed">{fund.investmentFocus}</p>
        </div>
      </Card>
    </div>
  );
}

function PerformanceTab({ fund, theme }: { fund: Fund; theme: FundTheme }) {
  if (!fund.compoundReturns) return <div>No performance data available</div>;

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
        {[
          { label: 'YTD', value: fund.compoundReturns.ytd },
          { label: '1 Year', value: fund.compoundReturns.oneYear },
          { label: '3 Year', value: fund.compoundReturns.threeYear },
          { label: '5 Year', value: fund.compoundReturns.fiveYear },
          { label: '10 Year', value: fund.compoundReturns.tenYear },
          { label: 'Since Inception', value: fund.compoundReturns.sinceInception },
        ].map((period) => (
          fund.compoundReturns![period.label.toLowerCase().replace(/\s+/g, '') as keyof typeof fund.compoundReturns] !== undefined && (
            <Card key={period.label}>
              <div className="p-4 text-center">
                <p className="text-sm text-slate-500 mb-2">{period.label}</p>
                <p className={`text-2xl font-bold ${period.value >= 0 ? theme.accentText : 'text-red-600'}`}>
                  <AnimatedCounter target={period.value} suffix="%" decimals={1} />
                </p>
              </div>
            </Card>
          )
        ))}
      </div>

      {fund.calendarYearReturns && (
        <Card>
          <div className="p-6">
            <h3 className="text-lg font-bold text-slate-900 mb-4">Calendar Year Returns</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={fund.calendarYearReturns}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="year" stroke="#64748b" />
                <YAxis stroke="#64748b" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1e293b',
                    border: `2px solid ${theme.primary}`,
                    borderRadius: '8px',
                  }}
                  formatter={(value: number) => `${value.toFixed(1)}%`}
                />
                <Legend />
                <Bar dataKey="fund" fill={theme.primary} name="Fund" radius={[8, 8, 0, 0]} />
                {fund.calendarYearReturns[0].benchmark !== undefined && (
                  <Bar dataKey="benchmark" fill={theme.primaryLight} name="Benchmark" radius={[8, 8, 0, 0]} />
                )}
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      )}
    </div>
  );
}

function HoldingsTab({ fund, theme }: { fund: Fund; theme: FundTheme }) {
  if (!fund.topHoldings || fund.topHoldings.length === 0) {
    return <div>No holdings data available</div>;
  }

  const chartData = fund.topHoldings.slice(0, 8).map((h) => ({ name: h.name, value: h.weight }));

  return (
    <div className="space-y-8">
      <div className="grid md:grid-cols-2 gap-8">
        <Card>
          <div className="p-6">
            <h3 className="text-lg font-bold text-slate-900 mb-4">Top Holdings by Weight</h3>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={chartData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  outerRadius={100}
                  fill={theme.primary}
                  dataKey="value"
                  label={(entry) => `${entry.value.toFixed(1)}%`}
                >
                  {chartData.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={theme.chartColors[index % theme.chartColors.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value: number) => `${value.toFixed(1)}%`} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card>
          <div className="p-6">
            <h3 className="text-lg font-bold text-slate-900 mb-4">Holdings List</h3>
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {fund.topHoldings.map((holding, idx) => (
                <div key={idx} className="flex items-center justify-between p-3 rounded-lg bg-slate-50">
                  <div className="flex-1">
                    <p className="text-sm font-medium text-slate-900">{holding.name}</p>
                    {holding.coupon && <p className="text-xs text-slate-500">Coupon: {holding.coupon}</p>}
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold text-slate-900">{holding.weight.toFixed(2)}%</p>
                    {holding.rating && <p className="text-xs text-slate-500">{holding.rating}</p>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </Card>
      </div>

      {fund.sectorAllocation && (
        <Card>
          <div className="p-6">
            <h3 className="text-lg font-bold text-slate-900 mb-4">Sector Allocation</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={fund.sectorAllocation}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="sector" angle={-45} textAnchor="end" height={100} stroke="#64748b" />
                <YAxis stroke="#64748b" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1e293b',
                    border: `2px solid ${theme.primary}`,
                    borderRadius: '8px',
                  }}
                  formatter={(value: number) => `${value.toFixed(1)}%`}
                />
                <Bar dataKey="weight" fill={theme.primary} radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      )}
    </div>
  );
}

function CharacteristicsTab({ fund, theme }: { fund: Fund; theme: FundTheme }) {
  return (
    <div className="space-y-8">
      {fund.portfolioCharacteristics && (
        <div className="grid md:grid-cols-3 gap-4">
          {[
            { label: 'Duration', value: fund.portfolioCharacteristics.duration, unit: 'years' },
            { label: 'Yield to Maturity', value: fund.portfolioCharacteristics.yieldToMaturity, unit: '%' },
            { label: 'Avg Credit Rating', value: fund.portfolioCharacteristics.avgCreditRating },
            { label: 'Number of Holdings', value: fund.portfolioCharacteristics.numberOfHoldings },
            { label: 'Avg Coupon', value: fund.portfolioCharacteristics.avgCoupon, unit: '%' },
            { label: 'Current Yield', value: fund.portfolioCharacteristics.currentYield, unit: '%' },
          ].map((char) => (
            <Card key={char.label}>
              <div className="p-4">
                <p className="text-sm text-slate-500 mb-2">{char.label}</p>
                <p className={`text-xl font-bold ${theme.accentText}`}>
                  {char.value}{char.unit ? ` ${char.unit}` : ''}
                </p>
              </div>
            </Card>
          ))}
        </div>
      )}

      {fund.riskMetrics && (
        <Card>
          <div className="p-6">
            <h3 className="text-lg font-bold text-slate-900 mb-4">Risk Metrics</h3>
            <div className="grid md:grid-cols-2 gap-6">
              {[
                { label: 'Sharpe Ratio', value: fund.riskMetrics.sharpe, decimals: 2 },
                { label: 'Sortino Ratio', value: fund.riskMetrics.sortino, decimals: 2 },
                { label: 'Max Drawdown', value: fund.riskMetrics.maxDrawdown, suffix: '%', decimals: 1 },
                { label: 'Std. Deviation', value: fund.riskMetrics.standardDeviation, suffix: '%', decimals: 1 },
                { label: 'Beta', value: fund.riskMetrics.beta, decimals: 2 },
                { label: 'Alpha', value: fund.riskMetrics.alpha, suffix: '%', decimals: 2 },
              ].map((metric) => (
                metric.value !== undefined && (
                  <div key={metric.label} className="flex items-center justify-between p-4 rounded-lg bg-slate-50">
                    <p className="text-sm font-medium text-slate-700">{metric.label}</p>
                    <p className="text-lg font-bold text-slate-900">
                      {metric.value.toFixed(metric.decimals || 2)}{metric.suffix || ''}
                    </p>
                  </div>
                )
              ))}
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}

function DocumentsTab({ fund, theme }: { fund: Fund; theme: FundTheme }) {
  if (!fund.fundDocuments || fund.fundDocuments.length === 0) {
    return <div>No documents available</div>;
  }

  return (
    <div className="space-y-4">
      {fund.fundDocuments.map((doc, idx) => (
        <Card key={idx}>
          <div className="p-4 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className={`w-10 h-10 rounded-lg ${theme.accentBg} flex items-center justify-center`}>
                <FileText className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="font-medium text-slate-900">{doc.name}</p>
                <p className="text-sm text-slate-500">{doc.type} · {doc.date}</p>
              </div>
            </div>
            <Download className="w-5 h-5 text-slate-400" />
          </div>
        </Card>
      ))}
    </div>
  );
}

/* ──────────────────────────────────────────────────────────────
 * HERO SECTION
 * ────────────────────────────────────────────────────────────── */
function HeroSection({ fund, theme }: { fund: Fund; theme: FundTheme }) {
  return (
    <div
      className="relative py-16 md:py-24 overflow-hidden"
      style={{
        backgroundImage: `linear-gradient(135deg, ${theme.primary}20 0%, ${theme.primary}10 100%)`,
        backgroundColor: theme.primaryLight,
      }}
    >
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          className="absolute w-96 h-96 rounded-full"
          style={{
            background: `radial-gradient(circle, ${theme.primary}10, transparent)`,
          }}
          animate={{ x: [0, 30, 0], y: [0, 20, 0] }}
          transition={{ duration: 8, repeat: Infinity }}
        />
      </div>

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <div className="max-w-3xl">
          <ScrollReveal>
            <div className="inline-block px-3 py-1 mb-4 rounded-full bg-white border border-slate-200">
              <p className={`text-sm font-medium ${theme.accentText}`}>{fund.assetClass}</p>
            </div>
          </ScrollReveal>

          <ScrollReveal>
            <h1 className="text-4xl md:text-5xl font-bold text-slate-900 mb-4">{fund.name}</h1>
          </ScrollReveal>

          <ScrollReveal>
            <p className="text-lg text-slate-600 mb-8">{fund.description}</p>
          </ScrollReveal>

          <ScrollReveal>
            <div className="flex flex-wrap gap-6">
              {[
                { label: 'Inception', value: fund.inceptionDate },
                { label: 'NAV', value: fund.navPerUnit },
                { label: 'MER', value: fund.mer },
              ].map((item) => (
                item.value && (
                  <div key={item.label}>
                    <p className="text-sm text-slate-500">{item.label}</p>
                    <p className="text-lg font-semibold text-slate-900">{item.value}</p>
                  </div>
                )
              ))}
            </div>
          </ScrollReveal>
        </div>
      </div>
    </div>
  );
}

/* ──────────────────────────────────────────────────────────────
 * MAIN COMPONENT
 * ────────────────────────────────────────────────────────────── */
export interface FundDetailLayoutProps {
  fund: Fund;
  themeName: keyof typeof themes;
  extraSections?: ReactNode;
}

export default function FundDetailLayout({
  fund,
  themeName,
  extraSections,
}: FundDetailLayoutProps) {
  const theme = themes[themeName];
  const [activeTab, setActiveTab] = useState<string>('overview');
  const mainRef = useRef<HTMLDivElement>(null);

  const tabContent = useMemo(() => {
    switch (activeTab) {
      case 'overview':
        return <OverviewTab fund={fund} theme={theme} />;
      case 'performance':
        return <PerformanceTab fund={fund} theme={theme} />;
      case 'holdings':
        return <HoldingsTab fund={fund} theme={theme} />;
      case 'characteristics':
        return <CharacteristicsTab fund={fund} theme={theme} />;
      case 'documents':
        return <DocumentsTab fund={fund} theme={theme} />;
      default:
        return null;
    }
  }, [activeTab, fund, theme]);

  return (
    <div ref={mainRef} className="min-h-screen bg-white">
      <HeroSection fund={fund} theme={theme} />
      <StickyTabNavigation activeTab={activeTab} onTabChange={setActiveTab} theme={theme} />

      <div className="max-w-7xl mx-auto px-6 py-16">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
          >
            {tabContent}
          </motion.div>
        </AnimatePresence>

        {extraSections}
      </div>
    </div>
  );
}