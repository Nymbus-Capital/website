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
    primaryDark: '#047857',
    gradient: 'from-emerald-600 to-emerald-800',
    chartColors: ['#059669', '#10b981', '#34d399', '#6ee7b7', '#a7f3d0', '#d1fae5'],
    accentText: 'text-emerald-600',
    accentBg: 'bg-emerald-600',
    accentBorder: 'border-emerald-600',
    accentRing: 'ring-emerald-600',
  },
  amber: {
    primary: '#d97706',
    primaryLight: '#fef3c7',
    primaryDark: '#b45309',
    gradient: 'from-amber-600 to-amber-800',
    chartColors: ['#d97706', '#f59e0b', '#fbbf24', '#fcd34d', '#fde68a', '#fef3c7'],
    accentText: 'text-amber-600',
    accentBg: 'bg-amber-600',
    accentBorder: 'border-amber-600',
    accentRing: 'ring-amber-600',
  },
  rose: {
    primary: '#e11d48',
    primaryLight: '#ffe4e6',
    primaryDark: '#be123c',
    gradient: 'from-rose-600 to-rose-800',
    chartColors: ['#e11d48', '#f43f5e', '#fb7185', '#fca5b0', '#fbcfe8', '#ffe4e6'],
    accentText: 'text-rose-600',
    accentBg: 'bg-rose-600',
    accentBorder: 'border-rose-600',
    accentRing: 'ring-rose-600',
  },
};

export type FundThemeKey = keyof typeof themes;

interface FundDetailLayoutProps {
  fund: Fund;
  themeKey?: FundThemeKey;
  children?: ReactNode;
}

export default function FundDetailLayout({
  fund,
  themeKey = 'blue',
  children,
}: FundDetailLayoutProps) {
  const theme = themes[themeKey];
  const containerRef = useRef<HTMLDivElement>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'performance' | 'documents'>('overview');

  return (
    <div ref={containerRef} className="min-h-screen bg-slate-50">
      {/* Hero Section */}
      <HeroSection fund={fund} theme={theme} />

      {/* Sticky Navigation Tabs */}
      <div className="sticky top-0 z-40 bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8 flex items-center h-16 gap-8">
          {(['overview', 'performance', 'documents'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={cn(
                'text-sm font-medium transition-colors relative h-16 flex items-center',
                activeTab === tab
                  ? 'text-slate-900'
                  : 'text-slate-600 hover:text-slate-900'
              )}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
              {activeTab === tab && (
                <div
                  className={`absolute bottom-0 left-0 right-0 h-1 ${theme.accentBg}`}
                />
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Content Sections */}
      <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8 py-16">
        <AnimatePresence mode="wait">
          {activeTab === 'overview' && (
            <motion.div
              key="overview"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
              className="space-y-16"
            >
              <OverviewSection fund={fund} theme={theme} />
              <MetricsGrid fund={fund} theme={theme} />
              <AllocationChart fund={fund} theme={theme} />
            </motion.div>
          )}

          {activeTab === 'performance' && (
            <motion.div
              key="performance"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
              className="space-y-16"
            >
              <PerformanceCharts fund={fund} theme={theme} />
              <ReturnsTable fund={fund} theme={theme} />
            </motion.div>
          )}

          {activeTab === 'documents' && (
            <motion.div
              key="documents"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
            >
              <DocumentsSection fund={fund} theme={theme} />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {children}
    </div>
  );
}

function HeroSection({
  fund,
  theme,
}: {
  fund: Fund;
  theme: FundTheme;
}) {
  const titleRef = useRef<HTMLHeadingElement>(null);
  const descRef = useRef<HTMLParagraphElement>(null);

  useEffect(() => {
    if (titleRef.current) {
      gsap.from(titleRef.current, {
        opacity: 0,
        y: 20,
        duration: 0.8,
        ease: 'power2.out',
      });
    }
    if (descRef.current) {
      gsap.from(descRef.current, {
        opacity: 0,
        y: 20,
        duration: 0.8,
        delay: 0.2,
        ease: 'power2.out',
      });
    }
  }, []);

  return (
    <div
      className={`relative bg-gradient-to-br ${theme.gradient} text-white py-24 md:py-32 overflow-hidden`}
    >
      {/* Background gradient orb */}
      <div className="absolute -top-1/2 -right-1/4 w-96 h-96 rounded-full opacity-10 blur-3xl"
        style={{ backgroundColor: theme.primary }}
      />

      <div className="relative max-w-7xl mx-auto px-4 md:px-6 lg:px-8">
        <div className="flex items-center gap-2 mb-6">
          <span className="inline-block w-2 h-2 rounded-full" style={{ backgroundColor: theme.primaryLight }} />
          <p className="text-sm font-semibold" style={{ color: theme.primaryLight }}>
            {fund.assetClass}
          </p>
        </div>

        <h1
          ref={titleRef}
          className="text-5xl md:text-6xl font-bold mb-6 leading-tight"
        >
          {fund.name}
        </h1>

        <p
          ref={descRef}
          className="text-xl text-white/80 max-w-3xl leading-relaxed mb-12"
        >
          {fund.description}
        </p>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          <div>
            <p className="text-xs uppercase tracking-widest font-semibold text-white/60 mb-2">
              Inception
            </p>
            <p className="text-lg font-semibold">
              {new Date(fund.inceptionDate).toLocaleDateString('en-CA', {
                year: 'numeric',
                month: 'short',
              })}
            </p>
          </div>
          <div>
            <p className="text-xs uppercase tracking-widest font-semibold text-white/60 mb-2">
              Currency
            </p>
            <p className="text-lg font-semibold">{fund.currency}</p>
          </div>
          {fund.mer && (
            <div>
              <p className="text-xs uppercase tracking-widest font-semibold text-white/60 mb-2">
                MER
              </p>
              <p className="text-lg font-semibold">{fund.mer}</p>
            </div>
          )}
          <div>
            <p className="text-xs uppercase tracking-widest font-semibold text-white/60 mb-2">
              Min Investment
            </p>
            <p className="text-lg font-semibold">{fund.minInvestment}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

function OverviewSection({
  fund,
  theme,
}: {
  fund: Fund;
  theme: FundTheme;
}) {
  return (
    <ScrollReveal>
      <div>
        <h2 className="text-3xl font-semibold text-slate-900 mb-12">Fund Overview</h2>
        <p className="text-lg text-slate-600 leading-relaxed max-w-3xl">
          {fund.description}
        </p>
      </div>
    </ScrollReveal>
  );
}

function MetricsGrid({
  fund,
  theme,
}: {
  fund: Fund;
  theme: FundTheme;
}) {
  const metrics = [
    {
      label: 'Since Inception',
      value: `${fund.returns.sinceInception.toFixed(2)}%`,
      icon: TrendingUp,
    },
    {
      label: 'YTD Return',
      value: `${fund.returns.ytd.toFixed(2)}%`,
      icon: BarChart3,
    },
    {
      label: '1 Year Return',
      value: `${fund.returns.oneYear.toFixed(2)}%`,
      icon: Calendar,
    },
    {
      label: 'Sharpe Ratio',
      value: fund.sharpe ? fund.sharpe.toFixed(2) : 'N/A',
      icon: Shield,
    },
  ];

  return (
    <ScrollReveal>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {metrics.map((metric) => {
          const Icon = metric.icon;
          return (
            <Card key={metric.label} className="p-6 bg-white">
              <div className="flex items-center gap-3 mb-4">
                <div
                  className="p-2 rounded-lg"
                  style={{ backgroundColor: theme.primaryLight }}
                >
                  <Icon
                    className="w-5 h-5"
                    style={{ color: theme.primary }}
                  />
                </div>
              </div>
              <p className="text-xs uppercase tracking-widest font-semibold text-slate-500 mb-2">
                {metric.label}
              </p>
              <p className="text-2xl font-bold text-slate-900">{metric.value}</p>
            </Card>
          );
        })}
      </div>
    </ScrollReveal>
  );
}

function AllocationChart({
  fund,
  theme,
}: {
  fund: Fund;
  theme: FundTheme;
}) {
  const data = fund.allocation || [];

  return (
    <ScrollReveal>
      <div>
        <h3 className="text-2xl font-semibold text-slate-900 mb-8">Asset Allocation</h3>
        <Card className="p-8 bg-white">
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, value }) => `${name} ${value}%`}
                outerRadius={100}
                fill={theme.primary}
                dataKey="value"
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={theme.chartColors[index % theme.chartColors.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </Card>
      </div>
    </ScrollReveal>
  );
}

function PerformanceCharts({
  fund,
  theme,
}: {
  fund: Fund;
  theme: FundTheme;
}) {
  return (
    <ScrollReveal>
      <div>
        <h2 className="text-3xl font-semibold text-slate-900 mb-8">Performance</h2>
        <Card className="p-8 bg-white">
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={generateChartData()}>
              <defs>
                <linearGradient id="colorGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={theme.primary} stopOpacity={0.3} />
                  <stop offset="95%" stopColor={theme.primary} stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Area
                type="monotone"
                dataKey="value"
                stroke={theme.primary}
                fillOpacity={1}
                fill="url(#colorGrad)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </Card>
      </div>
    </ScrollReveal>
  );
}

function ReturnsTable({
  fund,
  theme,
}: {
  fund: Fund;
  theme: FundTheme;
}) {
  const periods = [
    { label: 'YTD', value: fund.returns.ytd },
    { label: '1Y', value: fund.returns.oneYear },
    { label: '3Y', value: fund.returns.threeYear || 0 },
    { label: 'Since Inception', value: fund.returns.sinceInception },
  ];

  return (
    <ScrollReveal>
      <div>
        <h3 className="text-2xl font-semibold text-slate-900 mb-8">Returns Summary</h3>
        <Card className="p-8 bg-white overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-200">
                <th className="text-left py-4 px-4 font-semibold text-slate-700">Period</th>
                <th className="text-right py-4 px-4 font-semibold text-slate-700">Return</th>
              </tr>
            </thead>
            <tbody>
              {periods.map((period) => {
                const isPositive = period.value >= 0;
                return (
                  <tr key={period.label} className="border-b border-slate-100 hover:bg-slate-50">
                    <td className="py-4 px-4 font-medium text-slate-900">{period.label}</td>
                    <td
                      className={cn(
                        'text-right py-4 px-4 font-semibold',
                        isPositive ? 'text-green-600' : 'text-red-600'
                      )}
                    >
                      {isPositive ? '+' : ''}{period.value.toFixed(2)}%
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </Card>
      </div>
    </ScrollReveal>
  );
}

function DocumentsSection({
  fund,
  theme,
}: {
  fund: Fund;
  theme: FundTheme;
}) {
  const documents = [
    { title: 'Fund Facts', icon: FileText },
    { title: 'Prospectus', icon: FileText },
    { title: 'Financial Statements', icon: FileText },
  ];

  return (
    <ScrollReveal>
      <div>
        <h2 className="text-3xl font-semibold text-slate-900 mb-8">Documents</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {documents.map((doc) => {
            const Icon = doc.icon;
            return (
              <Card key={doc.title} className="p-6 bg-white">
                <div className="flex items-center gap-3 mb-4">
                  <div
                    className="p-2 rounded-lg"
                    style={{ backgroundColor: theme.primaryLight }}
                  >
                    <Icon
                      className="w-5 h-5"
                      style={{ color: theme.primary }}
                    />
                  </div>
                </div>
                <h3 className="font-semibold text-slate-900 mb-2">{doc.title}</h3>
                <a
                  href="#"
                  className="text-sm font-medium transition-colors flex items-center gap-2"
                  style={{ color: theme.primary }}
                >
                  Download <Download className="w-4 h-4" />
                </a>
              </Card>
            );
          })}
        </div>
      </div>
    </ScrollReveal>
  );
}

function generateChartData() {
  return Array.from({ length: 12 }, (_, i) => ({
    name: `Month ${i + 1}`,
    value: 10000 + Math.random() * 5000 + i * 300,
  }));
}