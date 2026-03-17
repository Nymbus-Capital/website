"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { ScrollReveal } from '@/components/animations/ScrollReveal';
import { formatPercent, cn } from "@/lib/utils";
import { funds } from "@/data/funds";
import Link from "next/link";

type VolatilityOption = "3%" | "6%" | "9%";

interface VolatilityScenario {
  volatility: VolatilityOption;
  annualizedReturn: number;
  sharpeRatio: number;
  maxDrawdown: number;
  allocation: { name: string; percentage: number }[];
}

const volatilityScenarios: Record<VolatilityOption, VolatilityScenario> = {
  "3%": {
    volatility: "3%",
    annualizedReturn: 2.8,
    sharpeRatio: 0.93,
    maxDrawdown: -8.2,
    allocation: [
      { name: "Developed Market Equities", percentage: 42 },
      { name: "Emerging Market Equities", percentage: 8 },
      { name: "Fixed Income", percentage: 35 },
      { name: "Alternatives", percentage: 15 },
    ],
  },
  "6%": {
    volatility: "6%",
    annualizedReturn: 5.2,
    sharpeRatio: 0.87,
    maxDrawdown: -15.4,
    allocation: [
      { name: "Developed Market Equities", percentage: 52 },
      { name: "Emerging Market Equities", percentage: 12 },
      { name: "Fixed Income", percentage: 25 },
      { name: "Alternatives", percentage: 11 },
    ],
  },
  "9%": {
    volatility: "9%",
    annualizedReturn: 7.1,
    sharpeRatio: 0.79,
    maxDrawdown: -22.1,
    allocation: [
      { name: "Developed Market Equities", percentage: 62 },
      { name: "Emerging Market Equities", percentage: 16 },
      { name: "Fixed Income", percentage: 12 },
      { name: "Alternatives", percentage: 10 },
    ],
  },
};

export default function GlobalMinimumVolatilityPage() {
  const fund = funds.find((f) => f.slug === "global-minimum-volatility");
  const [selectedVolatility, setSelectedVolatility] = useState<VolatilityOption>("6%");

  if (!fund) {
    return <div className="text-center py-20">Fund not found</div>;
  }

  const scenario = volatilityScenarios[selectedVolatility];
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
              <span className="bg-amber-100 text-amber-700 px-3 py-1 rounded-full text-sm font-semibold">
                Segregated Account
              </span>
            </div>
            <p className="text-lg text-slate-600">{fund.description}</p>
            <p className="text-base text-slate-600 font-semibold">
              Minimum Investment: <span className="text-[#4285F4]">$5,000,000</span>
            </p>
          </div>
        </ScrollReveal>

        {/* Volatility Toggle */}
        <ScrollReveal direction="up" delay={0.1}>
          <Card className="p-8 mb-12">
            <h3 className="text-xl font-bold text-slate-900 mb-6">Customize Your Downside Volatility</h3>
            <p className="text-slate-600 mb-6">
              Select your preferred downside volatility target to view corresponding returns and allocation
            </p>

            <div className="flex flex-wrap gap-4 mb-10">
              {(["3%", "6%", "9%"] as const).map((vol) => (
                <button
                  key={vol}
                  onClick={() => setSelectedVolatility(vol)}
                  className={cn(
                    "px-6 py-3 rounded-lg font-semibold transition-all duration-200",
                    selectedVolatility === vol
                      ? "bg-[#4285F4] text-white shadow-lg"
                      : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                  )}
                >
                  {vol} Volatility
                </button>
              ))}
            </div>

            {/* Key Metrics for Selected Volatility */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 p-6 bg-gradient-to-r from-blue-50 to-slate-50 rounded-lg border border-blue-100">
              <div>
                <p className="text-sm text-slate-600 mb-2">Annualized Return (Gross of Fees)</p>
                <p className="text-3xl font-bold text-slate-900">{formatPercent(scenario.annualizedReturn)}</p>
              </div>
              <div>
                <p className="text-sm text-slate-600 mb-2">Sharpe Ratio</p>
                <p className="text-3xl font-bold text-slate-900">{scenario.sharpeRatio.toFixed(2)}</p>
              </div>
              <div>
                <p className="text-sm text-slate-600 mb-2">Maximum Drawdown</p>
                <p className="text-3xl font-bold text-red-600">{formatPercent(scenario.maxDrawdown)}</p>
              </div>
            </div>
          </Card>
        </ScrollReveal>

        {/* Asset Allocation */}
        <ScrollReveal direction="up" delay={0.15}>
          <div className="mb-12">
            <SectionHeader
              title="Asset Allocation"
              description={`Strategic allocation for ${selectedVolatility} downside volatility target`}
            />
            <Card className="p-6 mt-8">
              <div className="space-y-5">
                {scenario.allocation.map((item) => (
                  <div key={item.name}>
                    <div className="flex justify-between items-center mb-2">
                      <p className="font-semibold text-slate-900">{item.name}</p>
                      <p className="font-bold text-slate-900">{item.percentage}%</p>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-3">
                      <div
                        className="bg-gradient-to-r from-amber-400 to-[#4285F4] h-3 rounded-full"
                        style={{ width: `${item.percentage}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        </ScrollReveal>

        {/* Strategy Information */}
        <ScrollReveal direction="up" delay={0.2}>
          <div className="mb-12">
            <SectionHeader title="Strategy Overview" />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
              <Card className="p-6">
                <h4 className="font-bold text-slate-900 mb-3">Global Diversification</h4>
                <p className="text-slate-600 text-sm">
                  Exposure to developed and emerging markets across multiple asset classes, optimized to minimize volatility
                  while maintaining growth potential.
                </p>
              </Card>
              <Card className="p-6">
                <h4 className="font-bold text-slate-900 mb-3">Systematic Optimization</h4>
                <p className="text-slate-600 text-sm">
                  Quantitative models optimize portfolio construction to achieve target volatility levels with precise risk
                  management.
                </p>
              </Card>
              <Card className="p-6">
                <h4 className="font-bold text-slate-900 mb-3">Flexible Customization</h4>
                <p className="text-slate-600 text-sm">
                  Tailor volatility targets to your specific risk tolerance and investment objectives through our managed
                  account structure.
                </p>
              </Card>
              <Card className="p-6">
                <h4 className="font-bold text-slate-900 mb-3">Institutional Grade</h4>
                <p className="text-slate-600 text-sm">
                  Designed for institutional investors seeking professional portfolio management with customized solutions and
                  dedicated oversight.
                </p>
              </Card>
            </div>
          </div>
        </ScrollReveal>

        {/* Management Team */}
        <ScrollReveal direction="up" delay={0.25}>
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
        <ScrollReveal direction="up" delay={0.3}>
          <Card className="p-8 bg-gradient-to-r from-amber-50 to-slate-50 border border-amber-100 text-center">
            <h3 className="text-2xl font-bold text-slate-900 mb-4">Institutional Grade Portfolio Management</h3>
            <p className="text-slate-600 mb-6">Contact our team to discuss how we can structure a customized segregated account for your organization.</p>
            <Button size="lg">Schedule Consultation</Button>
          </Card>
        </ScrollReveal>
      </div>
    </div>
  );
}