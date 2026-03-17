"use client";

import { useRef } from "react";
import { motion } from "framer-motion";
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
} from "recharts";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { ScrollReveal } from "@/components/animations/ScrollReveal";
import AnimatedCounter from "@/components/animations/AnimatedCounter";
import { formatPercent, cn } from "@/lib/utils";
import { funds } from "@/data/funds";
import { team } from "@/data/team";
import Link from "next/link";
import {
  Globe,
  TrendingUp,
  Shield,
  ArrowRight,
  ChevronLeft,
  Zap,
} from "lucide-react";

const ambientColors = {
  amber: "#d97706",
  amberLight: "#f59e0b",
  amberDark: "#b45309",
  amberXDark: "#92400e",
};

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: "easeOut" as const },
  },
};

function TeamAvatar({
  name,
  initials,
  color,
}: {
  name: string;
  initials: string;
  color: string;
}) {
  return (
    <motion.div
      className="flex items-center gap-3"
      whileHover={{ x: 4 }}
      transition={{ duration: 0.3 }}
    >
      <div
        className="w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-sm"
        style={{ backgroundColor: color }}
      >
        {initials}
      </div>
      <div>
        <p className="font-semibold text-white">{name}</p>
        <p className="text-sm text-slate-400">Portfolio Manager</p>
      </div>
    </motion.div>
  );
}

export default function GlobalMinimumVolatilityPage() {
  const fund = funds.find((f) => f.slug === "global-minimum-volatility");

  if (!fund) {
    return <div className="text-center py-20">Fund not found</div>;
  }

  const managers = fund.managers || [];
  const riskMetrics = fund.riskMetrics ?? {
    sharpe: 0, sortino: 0, maxDrawdown: 0, standardDeviation: 0,
    beta: 0, alpha: 0, downsideDeviation: 0, upCaptureRatio: 0, downCaptureRatio: 0,
  };
  const sectorData =
    fund.sectorAllocation?.map((s) => ({
      name: s.sector,
      value: s.weight,
    })) || [];
  const calendarReturns = fund.calendarYearReturns || [];
  const monthlyReturns = fund.monthlyReturns || [];

  const getTeamMember = (name: string) => {
    const member = team.find((t) => t.name.toLowerCase() === name.toLowerCase());
    if (member) {
      return {
        name: member.name,
        initials: member.initials,
        color: member.color,
      };
    }
    const parts = name.split(" ");
    const initials = parts.map((p) => p[0]).join("").toUpperCase();
    const colors = [ambientColors.amberLight, "#EF4444", "#3B82F6", "#10B981", "#8B5CF6"];
    const colorIdx = name.length % colors.length;
    return { name, initials, color: colors[colorIdx] };
  };

  const pieColors = [
    ambientColors.amber,
    ambientColors.amberLight,
    "#fbbf24",
    "#fcd34d",
    "#fce7a0",
    "#f3e8d3",
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-amber-900/30 via-transparent to-slate-900/40" />
        <motion.div
          className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-amber-600/15 to-transparent rounded-full blur-3xl"
          animate={{ x: [0, 20, 0], y: [0, 20, 0] }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        />

        <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <Link href="/strategies" className="inline-block mb-8">
              <Button
                variant="ghost"
                size="sm"
                className="text-amber-400 hover:text-amber-300"
              >
                <ChevronLeft className="w-4 h-4" />
                Back to Strategies
              </Button>
            </Link>
          </motion.div>

          <ScrollReveal direction="up">
            <motion.div className="space-y-6" variants={containerVariants} initial="hidden" animate="visible">
              <motion.div className="flex flex-col gap-4" variants={itemVariants}>
                <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold bg-gradient-to-r from-amber-400 via-amber-300 to-yellow-400 bg-clip-text text-transparent">
                  {fund.name}
                </h1>
                <div className="flex items-center gap-3 flex-wrap">
                  <motion.span
                    className="bg-gradient-to-r from-amber-500/20 to-amber-400/20 border border-amber-400/30 text-amber-300 px-4 py-2 rounded-full text-sm font-semibold backdrop-blur-sm"
                    whileHover={{ borderColor: ambientColors.amberLight, scale: 1.05 }}
                  >
                    Alternatives
                  </motion.span>
                  <motion.span
                    className="bg-gradient-to-r from-amber-500/20 to-amber-400/20 border border-amber-400/30 text-amber-300 px-4 py-2 rounded-full text-sm font-semibold backdrop-blur-sm"
                    whileHover={{ borderColor: ambientColors.amberLight, scale: 1.05 }}
                  >
                    Managed Account
                  </motion.span>
                  <span className="text-amber-200/60 text-sm">USD</span>
                </div>
              </motion.div>
              <motion.p className="text-xl text-slate-300 max-w-2xl leading-relaxed" variants={itemVariants}>
                {fund.description}
              </motion.p>
              <motion.div className="pt-4 border-t border-amber-400/20 space-y-2" variants={itemVariants}>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <p className="text-slate-400 text-xs uppercase tracking-wider">AUM</p>
                    <p className="text-2xl font-bold text-amber-400">{fund.aum}</p>
                  </div>
                  <div>
                    <p className="text-slate-400 text-xs uppercase tracking-wider">Inception</p>
                    <p className="text-2xl font-bold text-amber-400">2015</p>
                  </div>
                  <div>
                    <p className="text-slate-400 text-xs uppercase tracking-wider">Min Investment</p>
                    <p className="text-2xl font-bold text-amber-400">{fund.minInvestment}</p>
                  </div>
                  <div>
                    <p className="text-slate-400 text-xs uppercase tracking-wider">Sharpe Ratio</p>
                    <p className="text-2xl font-bold text-amber-400">{riskMetrics.sharpe?.toFixed(2)}</p>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          </ScrollReveal>
        </div>
      </div>

      {/* Strategy Allocation - Pie Chart */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <ScrollReveal direction="up" delay={0.1}>
          <motion.div className="space-y-8" variants={containerVariants} initial="hidden" animate="visible">
            <motion.div variants={itemVariants}>
              <h2 className="text-4xl font-bold text-white mb-2">Strategy Allocation</h2>
              <p className="text-slate-400 text-lg">Portfolio composition across key asset classes</p>
            </motion.div>

            <motion.div className="grid grid-cols-1 lg:grid-cols-2 gap-8" variants={itemVariants}>
              <motion.div className="flex justify-center" whileHover={{ scale: 1.02 }} transition={{ duration: 0.3 }}>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={sectorData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, value }: { name?: string; value?: number }) => `${(name || "").split(" ")[0]} ${value}%`}
                      outerRadius={100}
                      innerRadius={60}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {sectorData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={pieColors[index % pieColors.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => `${value}%`} />
                  </PieChart>
                </ResponsiveContainer>
              </motion.div>

              <motion.div className="space-y-3" variants={containerVariants} initial="hidden" animate="visible">
                {sectorData.map((sector, idx) => (
                  <motion.div
                    key={sector.name}
                    className="flex items-center justify-between p-3 rounded-lg bg-slate-800/30 hover:bg-slate-800/50 transition-colors"
                    variants={itemVariants}
                    whileHover={{ x: 4 }}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: pieColors[idx % pieColors.length] }}
                      />
                      <span className="text-slate-300 text-sm">{sector.name}</span>
                    </div>
                    <span className="font-bold text-amber-400">{sector.value}%</span>
                  </motion.div>
                ))}
              </motion.div>
            </motion.div>
          </motion.div>
        </ScrollReveal>
      </div>

      {/* Calendar Year Returns - Bar Chart */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <ScrollReveal direction="up" delay={0.15}>
          <motion.div className="space-y-8" variants={containerVariants} initial="hidden" animate="visible">
            <motion.div variants={itemVariants}>
              <h2 className="text-4xl font-bold text-white mb-2">Calendar Year Performance</h2>
              <p className="text-slate-400 text-lg">Fund vs MSCI World Minimum Volatility Index</p>
            </motion.div>

            <motion.div className="bg-slate-800/30 p-6 rounded-xl" variants={itemVariants} whileHover={{ scale: 1.01 }}>
              <ResponsiveContainer width="100%" height={350}>
                <BarChart data={calendarReturns}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                  <XAxis dataKey="year" stroke="#94a3b8" />
                  <YAxis stroke="#94a3b8" />
                  <Tooltip
                    contentStyle={{ backgroundColor: "#1e293b", border: "1px solid #475569" }}
                    formatter={(value) => `${Number(value).toFixed(1)}%`}
                  />
                  <Legend />
                  <Bar dataKey="fund" fill={ambientColors.amberLight} name="Fund" radius={[8, 8, 0, 0]} />
                  <Bar dataKey="benchmark" fill="#4b5563" name="Benchmark" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </motion.div>
          </motion.div>
        </ScrollReveal>
      </div>

      {/* Monthly Returns - Area Chart */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <ScrollReveal direction="up" delay={0.2}>
          <motion.div className="space-y-8" variants={containerVariants} initial="hidden" animate="visible">
            <motion.div variants={itemVariants}>
              <h2 className="text-4xl font-bold text-white mb-2">Monthly Returns Distribution</h2>
              <p className="text-slate-400 text-lg">Historical monthly performance</p>
            </motion.div>

            <motion.div className="bg-slate-800/30 p-6 rounded-xl" variants={itemVariants} whileHover={{ scale: 1.01 }}>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={monthlyReturns}>
                  <defs>
                    <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={ambientColors.amberLight} stopOpacity={0.8} />
                      <stop offset="95%" stopColor={ambientColors.amberLight} stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                  <XAxis dataKey="month" stroke="#94a3b8" />
                  <YAxis stroke="#94a3b8" />
                  <Tooltip
                    contentStyle={{ backgroundColor: "#1e293b", border: "1px solid #475569" }}
                    formatter={(value) => `${Number(value).toFixed(2)}%`}
                  />
                  <Area
                    type="monotone"
                    dataKey="value"
                    stroke={ambientColors.amberLight}
                    fillOpacity={1}
                    fill="url(#colorValue)"
                    name="Return %"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </motion.div>
          </motion.div>
        </ScrollReveal>
      </div>

      {/* Risk Metrics */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <ScrollReveal direction="up" delay={0.25}>
          <motion.div className="space-y-8" variants={containerVariants} initial="hidden" animate="visible">
            <motion.div variants={itemVariants}>
              <h2 className="text-4xl font-bold text-white mb-2">Risk Metrics</h2>
              <p className="text-slate-400 text-lg">Comprehensive risk and performance analysis</p>
            </motion.div>

            <motion.div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4" variants={containerVariants} initial="hidden" animate="visible">
              {[
                { label: "Sharpe Ratio", value: riskMetrics.sharpe, format: "number", icon: "⚖" },
                { label: "Sortino Ratio", value: riskMetrics.sortino, format: "number", icon: "📈" },
                { label: "Max Drawdown", value: riskMetrics.maxDrawdown, format: "percent", icon: "📉", isDanger: true },
                { label: "Std Deviation", value: riskMetrics.standardDeviation, format: "percent", icon: "📊" },
                { label: "Beta", value: riskMetrics.beta, format: "number", icon: "🎯" },
                { label: "Alpha", value: riskMetrics.alpha, format: "percent", icon: "✨" },
                { label: "Up Capture", value: riskMetrics.upCaptureRatio, format: "number", icon: "📈" },
                { label: "Down Capture", value: riskMetrics.downCaptureRatio, format: "number", icon: "📉" },
              ].map((metric, idx) => (
                <motion.div key={idx} variants={itemVariants} whileHover={{ scale: 1.05 }} transition={{ duration: 0.3 }}>
                  <Card className="p-4 bg-slate-800/40 border-slate-700/30 backdrop-blur-sm hover:border-amber-400/30 h-full">
                    <div className="flex items-start justify-between mb-3">
                      <p className="text-slate-400 text-xs uppercase tracking-wider">{metric.label}</p>
                      <span className="text-lg opacity-50">{metric.icon}</span>
                    </div>
                    <div className={cn(
                      "text-3xl font-bold",
                      metric.isDanger ? "text-red-400" : "text-amber-400"
                    )}>
                      {metric.format === "percent"
                        ? formatPercent(metric.value || 0)
                        : metric.value?.toFixed(2) || "N/A"}
                    </div>
                  </Card>
                </motion.div>
              ))}
            </motion.div>
          </motion.div>
        </ScrollReveal>
      </div>

      {/* Volatility Comparison - Key Feature */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <ScrollReveal direction="up" delay={0.3}>
          <motion.div className="space-y-8" variants={containerVariants} initial="hidden" animate="visible">
            <motion.div variants={itemVariants}>
              <h2 className="text-4xl font-bold text-white mb-2">Volatility Advantage</h2>
              <p className="text-slate-400 text-lg">How GMV reduces downside while capturing upside</p>
            </motion.div>

            <motion.div className="grid grid-cols-1 md:grid-cols-3 gap-6" variants={containerVariants} initial="hidden" animate="visible">
              <motion.div
                variants={itemVariants}
                className="relative group cursor-pointer"
                whileHover={{ y: -4 }}
              >
                <div className="absolute inset-0 bg-gradient-to-br from-amber-500/20 to-transparent rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <Card className="p-8 bg-slate-800/40 border-slate-700/30 backdrop-blur-sm relative">
                  <Zap className="w-8 h-8 text-amber-400 mb-4" />
                  <h3 className="text-xl font-bold text-white mb-3">Reduced Drawdowns</h3>
                  <p className="text-slate-400 text-sm">
                    Maximum drawdown of -8.2% versus -22% for broad market, protecting capital during downturns.
                  </p>
                  <p className="text-amber-400 font-semibold mt-4">62% capture ratio</p>
                </Card>
              </motion.div>

              <motion.div
                variants={itemVariants}
                className="relative group cursor-pointer"
                whileHover={{ y: -4 }}
              >
                <div className="absolute inset-0 bg-gradient-to-br from-amber-500/20 to-transparent rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <Card className="p-8 bg-slate-800/40 border-slate-700/30 backdrop-blur-sm relative">
                  <TrendingUp className="w-8 h-8 text-amber-400 mb-4" />
                  <h3 className="text-xl font-bold text-white mb-3">Smooth Returns</h3>
                  <p className="text-slate-400 text-sm">
                    Standard deviation of 6.8% versus 13%+ for global equities, with consistent performance.
                  </p>
                  <p className="text-amber-400 font-semibold mt-4">0.91 Sharpe ratio</p>
                </Card>
              </motion.div>

              <motion.div
                variants={itemVariants}
                className="relative group cursor-pointer"
                whileHover={{ y: -4 }}
              >
                <div className="absolute inset-0 bg-gradient-to-br from-amber-500/20 to-transparent rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <Card className="p-8 bg-slate-800/40 border-slate-700/30 backdrop-blur-sm relative">
                  <Shield className="w-8 h-8 text-amber-400 mb-4" />
                  <h3 className="text-xl font-bold text-white mb-3">Downside Protection</h3>
                  <p className="text-slate-400 text-sm">
                    Down capture ratio of 38% minimizes losses in declining markets while beta of 0.52 limits volatility.
                  </p>
                  <p className="text-amber-400 font-semibold mt-4">38% down capture</p>
                </Card>
              </motion.div>
            </motion.div>
          </motion.div>
        </ScrollReveal>
      </div>

      {/* Management Team */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <ScrollReveal direction="up" delay={0.35}>
          <motion.div className="space-y-8" variants={containerVariants} initial="hidden" animate="visible">
            <motion.div variants={itemVariants}>
              <h2 className="text-4xl font-bold text-white">Management Team</h2>
            </motion.div>

            <motion.div className="grid grid-cols-1 md:grid-cols-2 gap-6" variants={containerVariants} initial="hidden" animate="visible">
              {managers.map((managerName) => {
                const member = getTeamMember(managerName);
                return (
                  <motion.div
                    key={managerName}
                    variants={itemVariants}
                    whileHover={{ scale: 1.02, y: -4 }}
                    transition={{ duration: 0.3 }}
                  >
                    <Card className="p-8 bg-slate-800/40 border-slate-700/30 backdrop-blur-sm hover:border-amber-400/30">
                      <TeamAvatar
                        name={member.name}
                        initials={member.initials}
                        color={member.color}
                      />
                    </Card>
                  </motion.div>
                );
              })}
            </motion.div>
          </motion.div>
        </ScrollReveal>
      </div>

      {/* CTA Section */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <ScrollReveal direction="up" delay={0.4}>
          <motion.div
            className="relative overflow-hidden p-12 md:p-16 bg-gradient-to-r from-amber-600/20 via-amber-500/10 to-transparent border border-amber-400/20 backdrop-blur-sm rounded-2xl"
            whileHover={{ scale: 1.02 }}
            transition={{ duration: 0.3 }}
          >
            <motion.div
              className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-amber-500/15 to-transparent rounded-full blur-3xl -z-10"
              animate={{ x: [0, 30, 0], y: [0, 30, 0] }}
              transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
            />

            <motion.div
              className="text-center space-y-6 relative z-10"
              variants={containerVariants}
              initial="hidden"
              animate="visible"
            >
              <motion.h2 className="text-4xl md:text-5xl font-bold text-white" variants={itemVariants}>
                Ready to Optimize Your Portfolio?
              </motion.h2>
              <motion.p className="text-xl text-slate-300 max-w-2xl mx-auto" variants={itemVariants}>
                Contact our team to discuss how we can structure a customized segregated account tailored to your risk profile and investment objectives.
              </motion.p>
              <motion.div variants={itemVariants} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button
                  size="lg"
                  className="bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white font-semibold shadow-lg shadow-amber-500/30"
                >
                  Schedule Consultation
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </motion.div>
            </motion.div>
          </motion.div>
        </ScrollReveal>
      </div>

      <div className="h-20" />
    </div>
  );
}