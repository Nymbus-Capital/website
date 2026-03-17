"use client";

import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { ScrollReveal } from "@/components/animations/ScrollReveal";
import AnimatedCounter from "@/components/animations/AnimatedCounter";
import { formatPercent, cn } from "@/lib/utils";
import { funds } from "@/data/funds";
import { team } from "@/data/team";
import Link from "next/link";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import {
  FileText,
  Download,
  Calendar,
  Shield,
  TrendingUp,
  Zap,
  BarChart3,
  PieChart,
} from "lucide-react";

gsap.registerPlugin(ScrollTrigger);

export default function MultiStrategyPage() {
  const fund = funds.find((f) => f.slug === "multi-strategy");
  const [hoveredHeatmapCell, setHoveredHeatmapCell] = useState<{ row: number; col: number; value: number } | null>(null);

  if (!fund) {
    return <div className="text-center py-20">Fund not found</div>;
  }

  const trailingReturns = [
    { period: "1M", return: 1.2 },
    { period: "3M", return: 2.1 },
    { period: "6M", return: 2.8 },
    { period: "YTD", return: 3.2 },
    { period: "1Y", return: 8.5 },
    { period: "3Y", return: 5.1 },
    { period: "5Y", return: 7.2 },
    { period: "SI", return: 12.8 },
  ];

  const calendarYearReturns = [
    { year: 2019, return: 8.3 },
    { year: 2020, return: 12.7 },
    { year: 2021, return: 6.2 },
    { year: 2022, return: -8.5 },
    { year: 2023, return: 11.4 },
    { year: 2024, return: 7.6 },
    { year: 2025, return: 3.2 },
  ];

  const monthlyReturns = [
    [1.2, 0.8, 1.5, -0.3, 0.9, 1.1],
    [2.1, 1.8, 2.4, 0.6, 1.7, 2.3],
    [0.5, -0.2, 1.2, 2.1, -0.8, 1.4],
    [3.1, 2.6, 2.9, 3.5, 2.1, 3.4],
    [1.8, 1.5, 2.2, 1.9, 1.6, 2.5],
    [-0.5, -1.2, 0.3, -0.8, -0.1, 0.8],
  ];

  const years = [2020, 2021, 2022, 2023, 2024, 2025];
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun"];

  const allocation = [
    { name: "Cash & Equivalents", percentage: 36.1 },
    { name: "Fixed Income Enhancement", percentage: 28.4 },
    { name: "Managed Futures", percentage: 22.8 },
    { name: "Dynamic Allocation", percentage: 12.7 },
  ];

  const strategies = [
    {
      name: "Dynamic Allocation",
      description: "Adaptive positioning across asset classes",
      icon: TrendingUp,
    },
    {
      name: "Managed Futures",
      description: "Trend-following systematic strategies",
      icon: Zap,
    },
    {
      name: "Fixed Income Enhancement",
      description: "Optimized yield with limited duration",
      icon: BarChart3,
    },
    {
      name: "Cash Reserves",
      description: "Capital preservation and liquidity",
      icon: Shield,
    },
  ];

  const fundDocuments = [
    { name: "Fund Facts Sheet", category: "Fund Facts", updated: "Mar 2026", icon: FileText },
    { name: "Offering Memorandum", category: "Offering Memorandum", updated: "Feb 2026", icon: Download },
    { name: "Annual Report 2024", category: "Annual Report", updated: "Jan 2026", icon: Calendar },
    { name: "Semi-Annual Report 2025", category: "Semi-Annual Report", updated: "Jul 2025", icon: Calendar },
    { name: "Audited Financial Statements", category: "Audited Financial Statements", updated: "Dec 2024", icon: Shield },
    { name: "2024 Tax Documents", category: "Tax Documents", updated: "Feb 2025", icon: FileText },
  ];

  // Get team members for managers
  const getManagerDetails = (managerName: string) => {
    const member = team.find(
      (t) => t.name.toLowerCase() === managerName.toLowerCase()
    );
    return member || { name: managerName, initials: managerName.split(" ").map(n => n[0]).join(""), color: "bg-violet-600" };
  };

  // Color scale for heatmap
  const getHeatmapColor = (value: number): string => {
    if (value > 2) return "bg-green-700";
    if (value > 1.5) return "bg-green-600";
    if (value > 1) return "bg-green-400";
    if (value > 0.5) return "bg-green-200";
    if (value > 0) return "bg-emerald-100";
    if (value > -0.5) return "bg-orange-100";
    if (value > -1) return "bg-orange-300";
    if (value > -1.5) return "bg-red-400";
    return "bg-red-600";
  };

  // Calendar year chart
  const maxReturn = Math.max(...calendarYearReturns.map(r => Math.abs(r.return)));
  const maxHeight = 280;

  return (
    <div className="min-h-screen bg-slate-950 text-white overflow-hidden">
      {/* Hero Section with Gradient */}
      <div className="relative min-h-screen pt-20 pb-32 overflow-hidden">
        {/* Background gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-violet-950 via-slate-900 to-slate-950" />
        <div className="absolute inset-0 opacity-40">
          <div className="absolute top-0 right-0 w-96 h-96 bg-violet-600 rounded-full blur-3xl" />
          <div className="absolute bottom-20 left-20 w-72 h-72 bg-purple-500 rounded-full blur-3xl" />
        </div>

        <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 h-full flex flex-col justify-center">
          <Link href="/strategies" className="inline-block mb-8 w-fit">
            <Button variant="ghost" size="sm" className="text-white hover:bg-white/10">
              ← Back to Strategies
            </Button>
          </Link>

          <ScrollReveal direction="up">
            <div className="space-y-8">
              {/* Fund Header */}
              <div>
                <div className="flex items-center gap-4 mb-6">
                  <h1 className="text-6xl md:text-7xl font-bold text-white">{fund.name}</h1>
                  <span className="inline-block bg-violet-600/80 backdrop-blur text-white px-4 py-2 rounded-full text-sm font-semibold border border-violet-400/30">
                    {fund.assetClass}
                  </span>
                </div>
                <p className="text-xl md:text-2xl text-slate-300 max-w-3xl leading-relaxed">
                  {fund.description}
                </p>
              </div>

              {/* Frosted Glass Key Metrics */}
              <div className="mt-12 bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-8 md:p-10">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                  <div>
                    <p className="text-sm text-slate-300 mb-2 uppercase tracking-wide">SI Return</p>
                    <p className="text-4xl font-bold text-white">
                      <AnimatedCounter target={12.8} duration={2} suffix="%" />
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-slate-300 mb-2 uppercase tracking-wide">Std Dev</p>
                    <p className="text-4xl font-bold text-slate-200">17.8%</p>
                  </div>
                  <div>
                    <p className="text-sm text-slate-300 mb-2 uppercase tracking-wide">Max Drawdown</p>
                    <p className="text-4xl font-bold text-red-400">-30%</p>
                  </div>
                  <div>
                    <p className="text-sm text-slate-300 mb-2 uppercase tracking-wide">Sharpe Ratio</p>
                    <p className="text-4xl font-bold text-violet-300">0.65</p>
                  </div>
                </div>
              </div>
            </div>
          </ScrollReveal>
        </div>
      </div>

      {/* Main Content */}
      <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pb-32">
        {/* Trailing Returns */}
        <ScrollReveal direction="up" delay={0.1}>
          <div className="mb-20">
            <SectionHeader
              title="Performance Overview"
              description="Trailing returns as of March 16, 2026"
            />
            <Card className="p-8 mt-8 bg-slate-900/50 border-slate-800">
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4">
                {trailingReturns.map((item, idx) => (
                  <div
                    key={item.period}
                    className="text-center group"
                  >
                    <p className="text-xs font-semibold text-slate-400 mb-3 uppercase tracking-wide">
                      {item.period}
                    </p>
                    <div className="bg-gradient-to-b from-violet-600 to-violet-800 rounded-lg p-4 group-hover:shadow-lg group-hover:shadow-violet-600/50 transition-all duration-300">
                      <p className="text-2xl font-bold text-white">
                        {formatPercent(item.return)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        </ScrollReveal>

        {/* Calendar Year Returns Chart */}
        <ScrollReveal direction="up" delay={0.15}>
          <div className="mb-20">
            <SectionHeader
              title="Calendar Year Returns"
              description="Annual performance by year"
            />
            <Card className="p-8 mt-8 bg-slate-900/50 border-slate-800">
              <div className="flex items-end justify-between gap-3 h-96">
                {calendarYearReturns.map((item) => {
                  const heightPercent = (item.return / maxReturn) * 100;
                  const isNegative = item.return < 0;
                  return (
                    <div
                      key={item.year}
                      className="flex-1 flex flex-col items-center group cursor-pointer"
                    >
                      <div className="text-sm font-semibold text-slate-300 mb-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        {formatPercent(item.return)}
                      </div>
                      <div
                        className={cn(
                          "w-full rounded-t-lg transition-all duration-300 group-hover:shadow-lg",
                          isNegative
                            ? "bg-gradient-to-t from-red-600 to-red-500 group-hover:shadow-red-600/50"
                            : "bg-gradient-to-t from-green-600 to-green-500 group-hover:shadow-green-600/50"
                        )}
                        style={{ height: `${Math.abs(heightPercent)}%` }}
                      />
                      <div className="text-sm font-bold text-slate-200 mt-4">{item.year}</div>
                    </div>
                  );
                })}
              </div>
            </Card>
          </div>
        </ScrollReveal>

        {/* Monthly Returns Heatmap */}
        <ScrollReveal direction="up" delay={0.2}>
          <div className="mb-20">
            <SectionHeader
              title="Monthly Returns Heatmap"
              description="Performance by month and year"
            />
            <Card className="p-8 mt-8 bg-slate-900/50 border-slate-800">
              <div className="overflow-x-auto">
                <div className="min-w-max">
                  {/* Header row */}
                  <div className="flex gap-3 mb-4">
                    <div className="w-16" />
                    {years.map((year) => (
                      <div
                        key={year}
                        className="w-20 text-center text-sm font-semibold text-slate-300"
                      >
                        {year}
                      </div>
                    ))}
                  </div>

                  {/* Data rows */}
                  {months.map((month, rowIdx) => (
                    <div key={month} className="flex gap-3 mb-3 items-center">
                      <div className="w-16 text-sm font-semibold text-slate-300">
                        {month}
                      </div>
                      {monthlyReturns[rowIdx].map((value, colIdx) => {
                        const isHovered =
                          hoveredHeatmapCell?.row === rowIdx && hoveredHeatmapCell?.col === colIdx;
                        return (
                          <div
                            key={`${rowIdx}-${colIdx}`}
                            className={cn(
                              "w-20 h-16 rounded-lg flex items-center justify-center font-semibold text-sm transition-all duration-200 cursor-pointer",
                              getHeatmapColor(value),
                              isHovered ? "ring-2 ring-white scale-105 shadow-lg" : ""
                            )}
                            onMouseEnter={() => setHoveredHeatmapCell({ row: rowIdx, col: colIdx, value })}
                            onMouseLeave={() => setHoveredHeatmapCell(null)}
                            title={`${month} ${years[colIdx]}: ${value > 0 ? "+" : ""}${value.toFixed(1)}%`}
                          >
                            {isHovered && (
                              <span className="text-white">
                                {value > 0 ? "+" : ""}
                                {value.toFixed(1)}%
                              </span>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  ))}
                </div>
              </div>
            </Card>
          </div>
        </ScrollReveal>

        {/* Asset Allocation */}
        <ScrollReveal direction="up" delay={0.25}>
          <div className="mb-20">
            <SectionHeader title="Asset Allocation" description="Current fund composition" />
            <Card className="p-8 mt-8 bg-slate-900/50 border-slate-800">
              <div className="space-y-6">
                {allocation.map((item) => (
                  <div key={item.name}>
                    <div className="flex justify-between items-center mb-2">
                      <p className="font-semibold text-slate-100">{item.name}</p>
                      <span className="text-lg font-bold text-violet-400">{item.percentage}%</span>
                    </div>
                    <div className="h-3 bg-slate-700 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-violet-600 to-violet-400 rounded-full transition-all duration-500"
                        style={{ width: `${item.percentage}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        </ScrollReveal>

        {/* Strategies */}
        <ScrollReveal direction="up" delay={0.3}>
          <div className="mb-20">
            <SectionHeader
              title="Investment Strategies"
              description="Multi-alpha approach with dynamic positioning"
            />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
              {strategies.map((strategy) => {
                const IconComponent = strategy.icon;
                return (
                  <Card
                    key={strategy.name}
                    className="p-6 bg-slate-900/50 border-slate-800 hover:border-violet-600/50 hover:bg-slate-900/80 transition-all duration-300 group"
                  >
                    <div className="flex items-start gap-4">
                      <div className="p-3 bg-violet-600/20 rounded-lg group-hover:bg-violet-600/40 transition-colors">
                        <IconComponent className="w-6 h-6 text-violet-400" />
                      </div>
                      <div>
                        <h4 className="font-bold text-white mb-1">{strategy.name}</h4>
                        <p className="text-sm text-slate-400">{strategy.description}</p>
                      </div>
                    </div>
                  </Card>
                );
              })}
            </div>
          </div>
        </ScrollReveal>

        {/* Management Team */}
        <ScrollReveal direction="up" delay={0.35}>
          <div className="mb-20">
            <SectionHeader title="Management Team" description="Expert portfolio managers" />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
              {fund.managers.map((managerName) => {
                const manager = getManagerDetails(managerName);
                return (
                  <Card
                    key={managerName}
                    className="p-6 bg-slate-900/50 border-slate-800 hover:border-violet-600/50 transition-all duration-300"
                  >
                    <div className="flex items-center gap-4">
                      <div
                        className={cn(
                          "w-16 h-16 rounded-full flex items-center justify-center text-white font-bold text-lg",
                          manager.color || "bg-violet-600"
                        )}
                      >
                        {manager.initials}
                      </div>
                      <div>
                        <p className="font-bold text-white">{manager.name}</p>
                        <p className="text-sm text-slate-400">
                          {(manager as any).title || "Portfolio Manager"}
                        </p>
                        {(manager as any).designations && (
                          <p className="text-xs text-slate-500 mt-1">
                            {(manager as any).designations}
                          </p>
                        )}
                      </div>
                    </div>
                  </Card>
                );
              })}
            </div>
          </div>
        </ScrollReveal>

        {/* Fund Documentation */}
        <ScrollReveal direction="up" delay={0.4}>
          <div className="mb-20">
            <SectionHeader
              title="Fund Documentation & Reports"
              description="Access fund facts, reports, and regulatory documents"
            />
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">
              {fundDocuments.map((doc) => {
                const Icon = doc.icon;
                return (
                  <Card
                    key={doc.name}
                    className="p-6 bg-slate-900/50 border-l-4 border-l-violet-600 border-slate-800 hover:border-slate-700 hover:bg-slate-900/80 transition-all duration-300 group"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <Icon className="w-8 h-8 text-violet-400" />
                      <span className="text-xs font-semibold text-violet-300 bg-violet-600/20 px-2 py-1 rounded">
                        PDF
                      </span>
                    </div>
                    <h4 className="font-bold text-white mb-2">{doc.name}</h4>
                    <p className="text-sm text-slate-400 mb-4">{doc.category}</p>
                    <div className="flex items-center justify-between pt-4 border-t border-slate-800">
                      <span className="text-xs text-slate-500">Updated: {doc.updated}</span>
                      <button className="text-violet-400 hover:text-violet-300 transition-colors">
                        <Download className="w-4 h-4" />
                      </button>
                    </div>
                  </Card>
                );
              })}
            </div>
          </div>
        </ScrollReveal>

        {/* CTA */}
        <ScrollReveal direction="up" delay={0.45}>
          <Card className="p-12 bg-gradient-to-r from-violet-600 to-purple-600 border-violet-500/50 text-center">
            <h3 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Ready to Invest?
            </h3>
            <p className="text-lg text-violet-100 mb-8 max-w-2xl mx-auto">
              Start your journey with diversified returns and expert portfolio management.
            </p>
            <Button
              size="lg"
              className="bg-white text-violet-600 hover:bg-slate-100"
            >
              Schedule a Consultation
            </Button>
          </Card>
        </ScrollReveal>
      </div>
    </div>
  );
}
