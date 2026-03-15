"use client";

import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { ScrollReveal } from '@/components/animations/ScrollReveal';
import { formatPercent } from "@/lib/utils";
import { funds } from "@/data/funds";
import Link from "next/link";

export default function MultiStrategyPage() {
  const fund = funds.find((f) => f.slug === "multi-strategy");

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

  // Monthly returns heatmap data
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

  const getHeatmapColor = (value: number) => {
    if (value > 2) return "bg-green-400";
    if (value > 1) return "bg-green-200";
    if (value > 0) return "bg-blue-100";
    if (value > -1) return "bg-orange-100";
    return "bg-red-300";
  };

  const allocation = [
    { name: "Cash & Equivalents", percentage: 36.1 },
    { name: "Fixed Income Enhancement", percentage: 28.4 },
    { name: "Managed Futures", percentage: 22.8 },
    { name: "Dynamic Allocation", percentage: 12.7 },
  ];

  const managers = fund.managers;

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#F8FAFC] to-white">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <Link href="/strategies" className="inline-block mb-8">
          <Button variant="ghost" size="sm">
            ← Back to Strategies
          </Button>
        </Link>

        {/* Hero Section */}
        <ScrollReveal direction="up">
          <div className="space-y-4 mb-12">
            <div className="flex items-center gap-3">
              <h1 className="text-4xl md:text-5xl font-bold text-slate-900">{fund.name}</h1>
              <span className="bg-purple-100 text-purple-700 px-3 py-1 rounded-full text-sm font-semibold">
                {fund.assetClass}
              </span>
            </div>
            <p className="text-lg text-slate-600">{fund.description}</p>
          </div>

          {/* Key Metrics Strip */}
          <Card className="p-6 mb-12">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <div>
                <p className="text-sm text-slate-600 mb-1">SI Return</p>
                <p className="text-2xl font-bold text-slate-900">12.8%</p>
              </div>
              <div>
                <p className="text-sm text-slate-600 mb-1">Std Dev</p>
                <p className="text-2xl font-bold text-slate-900">17.8%</p>
              </div>
              <div>
                <p className="text-sm text-slate-600 mb-1">Max Drawdown</p>
                <p className="text-2xl font-bold text-red-600">-30%</p>
              </div>
              <div>
                <p className="text-sm text-slate-600 mb-1">Sharpe Ratio</p>
                <p className="text-2xl font-bold text-slate-900">0.65</p>
              </div>
            </div>
          </Card>
        </ScrollReveal>

        {/* Trailing Returns Section */}
        <ScrollReveal direction="up" delay={0.1}>
          <div className="mb-12">
            <SectionHeader title="Performance" description="Trailing returns as of March 15, 2026" />
            <Card className="p-6 mt-8">
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4">
                {trailingReturns.map((item) => (
                  <div key={item.period} className="text-center">
                    <p className="text-xs font-semibold text-slate-600 mb-2">{item.period}</p>
                    <p className="text-lg font-bold text-slate-900">{formatPercent(item.return)}</p>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        </ScrollReveal>

        {/* Calendar Year Returns */}
        <ScrollReveal direction="up" delay={0.15}>
          <div className="mb-12">
            <SectionHeader title="Calendar Year Returns" />
            <Card className="p-6 mt-8">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <tbody>
                    <tr className="border-b border-slate-200">
                      {calendarYearReturns.map((item) => (
                        <td key={item.year} className="px-4 py-3 text-center text-sm">
                          <p className="font-semibold text-slate-600 mb-1">{item.year}</p>
                          <p className={`font-bold ${item.return >= 0 ? "text-green-600" : "text-red-600"}`}>
                            {formatPercent(item.return)}
                          </p>
                        </td>
                      ))}
                    </tr>
                  </tbody>
                </table>
              </div>
            </Card>
          </div>
        </ScrollReveal>

        {/* Monthly Returns Heatmap */}
        <ScrollReveal direction="up" delay={0.2}>
          <div className="mb-12">
            <SectionHeader title="Monthly Returns Heatmap" description="Returns by month and year" />
            <Card className="p-6 mt-8 overflow-x-auto">
              <div className="min-w-max">
                <table className="w-full border-collapse">
                  <thead>
                    <tr>
                      <th className="px-4 py-2 text-left font-semibold text-slate-600 bg-slate-50">Month</th>
                      {years.map((year) => (
                        <th key={year} className="px-4 py-2 text-center font-semibold text-slate-600 bg-slate-50">
                          {year}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {months.map((month, idx) => (
                      <tr key={month}>
                        <td className="px-4 py-3 font-semibold text-slate-900 bg-slate-50">{month}</td>
                        {monthlyReturns[idx].map((value, yearIdx) => (
                          <td key={yearIdx} className={`px-4 py-3 text-center font-semibold ${getHeatmapColor(value)}`}>
                            {value > 0 ? "+" : ""}
                            {value.toFixed(1)}%
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          </div>
        </ScrollReveal>

        {/* Allocation */}
        <ScrollReveal direction="up" delay={0.25}>
          <div className="mb-12">
            <SectionHeader title="Asset Allocation" />
            <Card className="p-6 mt-8">
              <div className="space-y-4">
                {allocation.map((item) => (
                  <div key={item.name} className="flex items-center gap-4">
                    <div className="flex-1">
                      <p className="font-semibold text-slate-900">{item.name}</p>
                    </div>
                    <div className="w-40 bg-slate-100 rounded-full h-2">
                      <div
                        className="bg-gradient-to-r from-purple-400 to-purple-600 h-2 rounded-full"
                        style={{ width: `${item.percentage * 1.5}px` }}
                      />
                    </div>
                    <div className="w-16 text-right font-semibold text-slate-900">{item.percentage}%</div>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        </ScrollReveal>

        {/* Management Team */}
        <ScrollReveal direction="up" delay={0.3}>
          <div className="mb-12">
            <SectionHeader title="Management Team" />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
              {managers.map((manager) => (
                <Card key={manager} className="p-6">
                  <p className="font-semibold text-slate-900">{manager}</p>
                  <p className="text-sm text-slate-600 mt-1">Portfolio Manager</p>
                </Card>
              ))}
            </div>
          </div>
        </ScrollReveal>

        {/* CTA Section */}
        <ScrollReveal direction="up" delay={0.35}>
          <Card className="p-8 bg-gradient-to-r from-purple-50 to-slate-50 border border-purple-100 text-center">
            <h3 className="text-2xl font-bold text-slate-900 mb-4">Explore Diversified Returns</h3>
            <p className="text-slate-600 mb-6">Download the fund facts sheet for complete strategy details.</p>
            <Button size="lg">Download Fund Facts</Button>
          </Card>
        </ScrollReveal>
      </div>
    </div>
  );
}