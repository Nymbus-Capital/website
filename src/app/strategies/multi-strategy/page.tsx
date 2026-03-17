"use client";

import { useRef } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { ScrollReveal } from "@/components/animations/ScrollReveal";
import AnimatedCounter from "@/components/animations/AnimatedCounter";
import { formatPercent, cn } from "@/lib/utils";
import { funds } from "@/data/funds";
import { team } from "@/data/team";
import Link from "next/link";
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  AreaChart,
  Area,
} from "recharts";
import { FileText, Download, Calendar } from "lucide-react";

export default function MultiStrategyPage() {
  const fund = funds.find((f) => f.slug === "multi-strategy");
  const containerRef = useRef<HTMLDivElement>(null);

  if (!fund) {
    return <div className="text-center py-20">Fund not found</div>;
  }

  // Prepare data for charts
  const strategyData = (fund.sectorAllocation || []).map((s) => ({
    name: s.sector,
    value: s.weight,
  }));

  const calendarYearData = (fund.calendarYearReturns || []).map((d) => ({
    year: d.year.toString(),
    fund: d.fund,
    benchmark: d.benchmark,
  }));

  const monthlyData = (fund.monthlyReturns || []).map((m) => ({
    month: m.month,
    return: m.value,
  }));

  const fundDocuments = [
    { name: "Fund Facts Sheet", category: "Fund Facts", updated: "Mar 2026", icon: FileText },
    { name: "Offering Memorandum", category: "Offering Memorandum", updated: "Feb 2026", icon: Download },
    { name: "Annual Report 2024", category: "Annual Report", updated: "Jan 2026", icon: Calendar },
    { name: "Semi-Annual Report 2025", category: "Semi-Annual Report", updated: "Jul 2025", icon: Calendar },
    { name: "Audited Financial Statements", category: "Audited Financial Statements", updated: "Dec 2024", icon: FileText },
    { name: "2024 Tax Documents", category: "Tax Documents", updated: "Feb 2025", icon: FileText },
  ];

  // Get team members for managers
  const getManagerDetails = (managerName: string) => {
    const member = team.find(
      (t) => t.name.toLowerCase() === managerName.toLowerCase()
    );
    return member || { name: managerName, initials: managerName.split(" ").map((n) => n[0]).join(""), color: "bg-violet-600" };
  };

  // Colors for charts
  const chartColors = ["#7c3aed", "#8b5cf6", "#a78bfa", "#c4b5fd", "#ddd6fe", "#f3e8ff"];
  const pieColors = ["#7c3aed", "#8b5cf6", "#a78bfa", "#c4b5fd", "#ddd6fe", "#f3e8ff"];

  return (
    <div ref={containerRef} className="min-h-screen bg-slate-950 text-white overflow-hidden">
      {/* Hero Section */}
      <div className="relative min-h-screen pt-20 pb-32 overflow-hidden">
        {/* Background gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-violet-950 via-slate-900 to-slate-950" />
        <motion.div
          className="absolute inset-0 opacity-30"
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.3 }}
          transition={{ duration: 1.5 }}
        >
          <div className="absolute top-0 right-0 w-96 h-96 bg-violet-600 rounded-full blur-3xl" />
          <div className="absolute bottom-20 left-20 w-72 h-72 bg-purple-500 rounded-full blur-3xl" />
        </motion.div>

        <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 h-full flex flex-col justify-center">
          <Link href="/strategies" className="inline-block mb-8 w-fit">
            <Button variant="ghost" size="sm" className="text-white hover:bg-white/10">
              ← Back to Strategies
            </Button>
          </Link>

          <ScrollReveal direction="up">
            <motion.div className="space-y-8" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.6 }}>
              {/* Fund Header */}
              <div>
                <motion.div className="flex flex-wrap items-center gap-4 mb-6" initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.1 }}>
                  <h1 className="text-6xl md:text-7xl font-bold text-white">{fund.name}</h1>
                  <motion.span
                    className="inline-block bg-violet-600/80 backdrop-blur text-white px-4 py-2 rounded-full text-sm font-semibold border border-violet-400/30"
                    whileHover={{ scale: 1.05, backgroundColor: "rgba(124, 58, 237, 0.95)" }}
                  >
                    {fund.assetClass}
                  </motion.span>
                  <motion.span
                    className="inline-block bg-purple-600/80 backdrop-blur text-white px-4 py-2 rounded-full text-sm font-semibold border border-purple-400/30"
                    whileHover={{ scale: 1.05, backgroundColor: "rgba(147, 51, 234, 0.95)" }}
                  >
                    {fund.vehicle}
                  </motion.span>
                </motion.div>
                <motion.p
                  className="text-xl md:text-2xl text-slate-300 max-w-3xl leading-relaxed"
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.2 }}
                >
                  {fund.description}
                </motion.p>
              </div>

              {/* Key Metrics */}
              <motion.div
                className="mt-12 bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-8 md:p-10"
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.3 }}
                whileHover={{ borderColor: "rgba(124, 58, 237, 0.5)" }}
              >
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8">
                  <motion.div whileHover={{ scale: 1.05 }}>
                    <p className="text-sm text-slate-300 mb-2 uppercase tracking-wide">AUM</p>
                    <p className="text-3xl md:text-4xl font-bold text-white">{fund.aum}</p>
                  </motion.div>
                  <motion.div whileHover={{ scale: 1.05 }}>
                    <p className="text-sm text-slate-300 mb-2 uppercase tracking-wide">MER</p>
                    <p className="text-3xl md:text-4xl font-bold text-violet-300">{fund.mer}</p>
                  </motion.div>
                  <motion.div whileHover={{ scale: 1.05 }}>
                    <p className="text-sm text-slate-300 mb-2 uppercase tracking-wide">Inception</p>
                    <p className="text-3xl md:text-4xl font-bold text-slate-200">2014</p>
                  </motion.div>
                  <motion.div whileHover={{ scale: 1.05 }}>
                    <p className="text-sm text-slate-300 mb-2 uppercase tracking-wide">Sharpe</p>
                    <p className="text-3xl md:text-4xl font-bold text-violet-300">
                      <AnimatedCounter target={0.65} duration={2} />
                    </p>
                  </motion.div>
                </div>
              </motion.div>
            </motion.div>
          </ScrollReveal>
        </div>
      </div>

      {/* Main Content */}
      <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pb-32 space-y-20">
        {/* Strategy Allocation - Pie Chart */}
        <ScrollReveal direction="up" delay={0.1}>
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <SectionHeader title="Strategy Allocation" description="Current diversification across six strategy buckets" />
            <Card className="p-8 mt-8 bg-slate-900/50 border-slate-800">
              <ResponsiveContainer width="100%" height={400}>
                <PieChart>
                  <Pie data={strategyData} cx="50%" cy="50%" labelLine={false} label={({ name, value }) => `${name}: ${value}%`} outerRadius={120} fill="#8b5cf6" dataKey="value">
                    {strategyData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={pieColors[index % pieColors.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => `${value}%`} contentStyle={{ backgroundColor: "#1e293b", border: "1px solid #7c3aed" }} />
                </PieChart>
              </ResponsiveContainer>
            </Card>
          </motion.div>
        </ScrollReveal>

        {/* Calendar Year Returns - Bar Chart */}
        <ScrollReveal direction="up" delay={0.15}>
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <SectionHeader title="Calendar Year Returns" description="Fund vs benchmark performance over 10 years" />
            <Card className="p-8 mt-8 bg-slate-900/50 border-slate-800">
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={calendarYearData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                  <XAxis dataKey="year" stroke="#94a3b8" />
                  <YAxis stroke="#94a3b8" />
                  <Tooltip contentStyle={{ backgroundColor: "#1e293b", border: "1px solid #7c3aed" }} />
                  <Legend />
                  <Bar dataKey="fund" fill="#7c3aed" radius={[8, 8, 0, 0]} />
                  <Bar dataKey="benchmark" fill="#a78bfa" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </Card>
          </motion.div>
        </ScrollReveal>

        {/* Monthly Returns - Area Chart */}
        <ScrollReveal direction="up" delay={0.2}>
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <SectionHeader title="Monthly Returns" description="Performance by month" />
            <Card className="p-8 mt-8 bg-slate-900/50 border-slate-800">
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={monthlyData}>
                  <defs>
                    <linearGradient id="colorReturn" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#7c3aed" stopOpacity={0.8} />
                      <stop offset="95%" stopColor="#7c3aed" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                  <XAxis dataKey="month" stroke="#94a3b8" />
                  <YAxis stroke="#94a3b8" />
                  <Tooltip contentStyle={{ backgroundColor: "#1e293b", border: "1px solid #7c3aed" }} />
                  <Area type="monotone" dataKey="return" stroke="#8b5cf6" fillOpacity={1} fill="url(#colorReturn)" />
                </AreaChart>
              </ResponsiveContainer>
            </Card>
          </motion.div>
        </ScrollReveal>

        {/* Risk Metrics Grid */}
        <ScrollReveal direction="up" delay={0.25}>
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <SectionHeader title="Risk Metrics" description="Comprehensive risk analysis" />
            <div className="grid grid-cols-2 md:grid-cols-3 gap-6 mt-8">
              {[
                { label: "Sharpe Ratio", value: fund.riskMetrics?.sharpe },
                { label: "Sortino Ratio", value: fund.riskMetrics?.sortino },
                { label: "Max Drawdown", value: `${fund.riskMetrics?.maxDrawdown}%` },
                { label: "Std Deviation", value: `${fund.riskMetrics?.standardDeviation}%` },
                { label: "Beta", value: fund.riskMetrics?.beta },
                { label: "Alpha", value: `${fund.riskMetrics?.alpha}%` },
                { label: "Up Capture", value: `${fund.riskMetrics?.upCaptureRatio}%` },
                { label: "Down Capture", value: `${fund.riskMetrics?.downCaptureRatio}%` },
              ].map((metric, idx) => (
                <motion.div key={metric.label} whileHover={{ scale: 1.05 }} transition={{ type: "spring", stiffness: 300 }}>
                  <Card className="p-6 bg-gradient-to-br from-violet-600/20 to-purple-600/20 border-violet-600/30">
                    <p className="text-sm text-slate-300 uppercase tracking-wide mb-2">{metric.label}</p>
                    <p className="text-3xl font-bold text-violet-300">{metric.value}</p>
                  </Card>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </ScrollReveal>

        {/* Performance Highlights with Animated Counters */}
        <ScrollReveal direction="up" delay={0.3}>
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <SectionHeader title="Key Performance Highlights" description="Standout metrics since inception" />
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
              <motion.div whileHover={{ scale: 1.05 }}>
                <Card className="p-8 text-center bg-gradient-to-br from-violet-600 to-purple-600 border-violet-500/50">
                  <p className="text-sm text-violet-200 uppercase tracking-wide mb-3">SI Return</p>
                  <p className="text-4xl font-bold text-white">
                    <AnimatedCounter target={12.8} duration={2} suffix="%" />
                  </p>
                </Card>
              </motion.div>
              <motion.div whileHover={{ scale: 1.05 }}>
                <Card className="p-8 text-center bg-gradient-to-br from-violet-600 to-purple-600 border-violet-500/50">
                  <p className="text-sm text-violet-200 uppercase tracking-wide mb-3">Beta</p>
                  <p className="text-4xl font-bold text-white">
                    <AnimatedCounter target={0.18} duration={2} />
                  </p>
                </Card>
              </motion.div>
              <motion.div whileHover={{ scale: 1.05 }}>
                <Card className="p-8 text-center bg-gradient-to-br from-violet-600 to-purple-600 border-violet-500/50">
                  <p className="text-sm text-violet-200 uppercase tracking-wide mb-3">Capture Ratio</p>
                  <p className="text-4xl font-bold text-white">
                    <AnimatedCounter target={45} duration={2} />
                    <span className="text-lg"> / </span>
                    <AnimatedCounter target={12} duration={2} />
                  </p>
                </Card>
              </motion.div>
            </div>
          </motion.div>
        </ScrollReveal>

        {/* Distribution */}
        <ScrollReveal direction="up" delay={0.35}>
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <SectionHeader title="Distribution" description="Annual distribution details" />
            <Card className="p-8 mt-8 bg-slate-900/50 border-slate-800">
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <p className="text-slate-300">Frequency</p>
                  <p className="text-2xl font-bold text-white">{fund.distribution?.frequency}</p>
                </div>
                <div className="flex justify-between items-center border-t border-slate-700 pt-4">
                  <p className="text-slate-300">Last Distribution</p>
                  <p className="text-2xl font-bold text-violet-300">{fund.distribution?.lastAmount}</p>
                </div>
              </div>
            </Card>
          </motion.div>
        </ScrollReveal>

        {/* Management Team */}
        <ScrollReveal direction="up" delay={0.4}>
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <SectionHeader title="Management Team" description="Expert portfolio managers" />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
              {fund.managers.map((managerName) => {
                const manager = getManagerDetails(managerName);
                return (
                  <motion.div key={managerName} whileHover={{ scale: 1.05 }} transition={{ type: "spring", stiffness: 300 }}>
                    <Card className="p-6 bg-slate-900/50 border-slate-800 hover:border-violet-600/50 transition-all duration-300">
                      <div className="flex items-center gap-4">
                        <motion.div
                          className={cn("w-16 h-16 rounded-full flex items-center justify-center text-white font-bold text-lg", manager.color || "bg-violet-600")}
                          whileHover={{ scale: 1.1 }}
                        >
                          {manager.initials}
                        </motion.div>
                        <div>
                          <p className="font-bold text-white">{manager.name}</p>
                          <p className="text-sm text-slate-400">{(manager as any).title || "Portfolio Manager"}</p>
                          {(manager as any).designations && <p className="text-xs text-slate-500 mt-1">{(manager as any).designations}</p>}
                        </div>
                      </div>
                    </Card>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>
        </ScrollReveal>

        {/* Fund Documentation */}
        <ScrollReveal direction="up" delay={0.45}>
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <SectionHeader title="Fund Documentation & Reports" description="Access fund facts, reports, and regulatory documents" />
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">
              {fundDocuments.map((doc) => {
                const Icon = doc.icon;
                return (
                  <motion.div key={doc.name} whileHover={{ scale: 1.05 }} transition={{ type: "spring", stiffness: 300 }}>
                    <Card className="p-6 bg-slate-900/50 border-l-4 border-l-violet-600 border-slate-800 hover:border-slate-700 hover:bg-slate-900/80 transition-all duration-300">
                      <div className="flex items-start justify-between mb-3">
                        <Icon className="w-8 h-8 text-violet-400" />
                        <span className="text-xs font-semibold text-violet-300 bg-violet-600/20 px-2 py-1 rounded">PDF</span>
                      </div>
                      <h4 className="font-bold text-white mb-2">{doc.name}</h4>
                      <p className="text-sm text-slate-400 mb-4">{doc.category}</p>
                      <div className="flex items-center justify-between pt-4 border-t border-slate-800">
                        <span className="text-xs text-slate-500">Updated: {doc.updated}</span>
                        <motion.button className="text-violet-400 hover:text-violet-300 transition-colors" whileHover={{ scale: 1.2 }}>
                          <Download className="w-4 h-4" />
                        </motion.button>
                      </div>
                    </Card>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>
        </ScrollReveal>

        {/* CTA Section */}
        <ScrollReveal direction="up" delay={0.5}>
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <Card className="p-12 bg-gradient-to-r from-violet-600 via-purple-600 to-indigo-600 border-violet-500/50 text-center">
              <motion.h3 className="text-3xl md:text-4xl font-bold text-white mb-4" initial={{ scale: 0.95, opacity: 0 }} whileInView={{ scale: 1, opacity: 1 }} transition={{ delay: 0.1 }}>
                Ready to Invest?
              </motion.h3>
              <motion.p className="text-lg text-violet-100 mb-8 max-w-2xl mx-auto" initial={{ scale: 0.95, opacity: 0 }} whileInView={{ scale: 1, opacity: 1 }} transition={{ delay: 0.2 }}>
                Start your journey with diversified returns and expert portfolio management.
              </motion.p>
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button size="lg" variant="primary" className="bg-white text-violet-600 hover:bg-slate-100">
                  Schedule a Consultation
                </Button>
              </motion.div>
            </Card>
          </motion.div>
        </ScrollReveal>
      </div>
    </div>
  );
}