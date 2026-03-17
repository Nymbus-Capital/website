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
  Globe,
  TrendingUp,
  Sliders,
  Shield,
  FileText,
  Download,
  ChevronLeft,
} from "lucide-react";

gsap.registerPlugin(ScrollTrigger);

type VolatilityOption = "3%" | "6%" | "9%";

interface VolatilityScenario {
  volatility: VolatilityOption;
  annualizedReturn: number;
  sharpeRatio: number;
  maxDrawdown: number;
  allocation: { name: string; percentage: number; color: string }[];
}

interface DocumentItem {
  name: string;
  lastUpdated: string;
  type: "pdf";
}

const volatilityScenarios: Record<VolatilityOption, VolatilityScenario> = {
  "3%": {
    volatility: "3%",
    annualizedReturn: 2.8,
    sharpeRatio: 0.93,
    maxDrawdown: -8.2,
    allocation: [
      { name: "Developed Market Equities", percentage: 42, color: "#FBBF24" },
      { name: "Emerging Market Equities", percentage: 8, color: "#F59E0B" },
      { name: "Fixed Income", percentage: 35, color: "#4285F4" },
      { name: "Alternatives", percentage: 15, color: "#6366F1" },
    ],
  },
  "6%": {
    volatility: "6%",
    annualizedReturn: 5.2,
    sharpeRatio: 0.87,
    maxDrawdown: -15.4,
    allocation: [
      { name: "Developed Market Equities", percentage: 52, color: "#FBBF24" },
      { name: "Emerging Market Equities", percentage: 12, color: "#F59E0B" },
      { name: "Fixed Income", percentage: 25, color: "#4285F4" },
      { name: "Alternatives", percentage: 11, color: "#6366F1" },
    ],
  },
  "9%": {
    volatility: "9%",
    annualizedReturn: 7.1,
    sharpeRatio: 0.79,
    maxDrawdown: -22.1,
    allocation: [
      { name: "Developed Market Equities", percentage: 62, color: "#FBBF24" },
      { name: "Emerging Market Equities", percentage: 16, color: "#F59E0B" },
      { name: "Fixed Income", percentage: 12, color: "#4285F4" },
      { name: "Alternatives", percentage: 10, color: "#6366F1" },
    ],
  },
};

const strategyFeatures = [
  {
    icon: Globe,
    title: "Global Diversification",
    description: "Exposure to developed and emerging markets across multiple asset classes, optimized to minimize volatility while maintaining growth potential.",
  },
  {
    icon: TrendingUp,
    title: "Systematic Optimization",
    description: "Quantitative models optimize portfolio construction to achieve target volatility levels with precise risk management.",
  },
  {
    icon: Sliders,
    title: "Flexible Customization",
    description: "Tailor volatility targets to your specific risk tolerance and investment objectives through our managed account structure.",
  },
  {
    icon: Shield,
    title: "Institutional Grade",
    description: "Designed for institutional investors seeking professional portfolio management with customized solutions and dedicated oversight.",
  },
];

const documents: DocumentItem[] = [
  { name: "Strategy Overview", lastUpdated: "Q1 2026", type: "pdf" },
  { name: "Investment Policy Statement", lastUpdated: "Q1 2026", type: "pdf" },
  { name: "Quarterly Report", lastUpdated: "Dec 2025", type: "pdf" },
  { name: "Annual Report", lastUpdated: "Dec 2025", type: "pdf" },
  { name: "Audited Financial Statements", lastUpdated: "Dec 2025", type: "pdf" },
  { name: "Tax Documents", lastUpdated: "Feb 2026", type: "pdf" },
];

function DonutChart({
  allocation,
  size = 300,
}: {
  allocation: VolatilityScenario["allocation"];
  size?: number;
}) {
  const radius = size / 2 - 20;
  const innerRadius = radius * 0.6;
  let currentAngle = -90;

  const segments = allocation.map((item) => {
    const sliceAngle = (item.percentage / 100) * 360;
    const startAngle = currentAngle;
    const endAngle = currentAngle + sliceAngle;
    const isLarge = sliceAngle > 180 ? 1 : 0;

    const startRad = (startAngle * Math.PI) / 180;
    const endRad = (endAngle * Math.PI) / 180;

    const outerX1 = size / 2 + radius * Math.cos(startRad);
    const outerY1 = size / 2 + radius * Math.sin(startRad);
    const outerX2 = size / 2 + radius * Math.cos(endRad);
    const outerY2 = size / 2 + radius * Math.sin(endRad);

    const innerX1 = size / 2 + innerRadius * Math.cos(startRad);
    const innerY1 = size / 2 + innerRadius * Math.sin(startRad);
    const innerX2 = size / 2 + innerRadius * Math.cos(endRad);
    const innerY2 = size / 2 + innerRadius * Math.sin(endRad);

    const pathData = `
      M ${outerX1} ${outerY1}
      A ${radius} ${radius} 0 ${isLarge} 1 ${outerX2} ${outerY2}
      L ${innerX2} ${innerY2}
      A ${innerRadius} ${innerRadius} 0 ${isLarge} 0 ${innerX1} ${innerY1}
      Z
    `;

    currentAngle = endAngle;

    return { item, pathData, color: item.color };
  });

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      {segments.map((segment, idx) => (
        <path
          key={idx}
          d={segment.pathData}
          fill={segment.color}
          opacity="0.85"
          style={{
            filter: "drop-shadow(0 2px 8px rgba(0,0,0,0.1))",
            transition: "opacity 0.3s ease",
          }}
        />
      ))}
    </svg>
  );
}

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
    <div className="flex items-center gap-3">
      <div
        className="w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-sm"
        style={{ backgroundColor: color }}
      >
        {initials}
      </div>
      <div>
        <p className="font-semibold text-slate-900">{name}</p>
        <p className="text-sm text-slate-600">Portfolio Manager</p>
      </div>
    </div>
  );
}

export default function GlobalMinimumVolatilityPage() {
  const fund = funds.find((f) => f.slug === "global-minimum-volatility");
  const [selectedVolatility, setSelectedVolatility] = useState<VolatilityOption>("6%");
  const [prevVolatility, setPrevVolatility] = useState<VolatilityOption>("6%");
  const chartRef = useRef<HTMLDivElement>(null);
  const metricsRefs = useRef<(HTMLDivElement | null)[]>([]);

  if (!fund) {
    return <div className="text-center py-20">Fund not found</div>;
  }

  const scenario = volatilityScenarios[selectedVolatility];
  const managers = fund.managers || [];

  const handleVolatilityChange = (vol: VolatilityOption) => {
    if (vol !== selectedVolatility) {
      setPrevVolatility(selectedVolatility);
      setSelectedVolatility(vol);

      // Animate chart
      if (chartRef.current) {
        gsap.to(chartRef.current, {
          opacity: 0.5,
          duration: 0.2,
          onComplete: () => {
            gsap.to(chartRef.current, { opacity: 1, duration: 0.3 });
          },
        });
      }

      // Animate metrics
      metricsRefs.current.forEach((ref) => {
        if (ref) {
          gsap.to(ref, {
            y: -10,
            opacity: 0,
            duration: 0.2,
            onComplete: () => {
              gsap.to(ref, { y: 0, opacity: 1, duration: 0.3 });
            },
          });
        }
      });
    }
  };

  // Get team members with fallback
  const getTeamMember = (name: string) => {
    const member = team.find((t) => t.name.toLowerCase() === name.toLowerCase());
    if (member) {
      return {
        name: member.name,
        initials: member.initials,
        color: member.color,
      };
    }
    // Fallback: generate initials from name
    const parts = name.split(" ");
    const initials = parts.map((p) => p[0]).join("").toUpperCase();
    const colors = ["#F59E0B", "#EF4444", "#3B82F6", "#10B981", "#8B5CF6"];
    const colorIdx = name.length % colors.length;
    return { name, initials, color: colors[colorIdx] };
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-amber-600/20 via-transparent to-slate-900/40" />
        <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
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

          <ScrollReveal direction="up">
            <div className="space-y-6">
              <div className="flex flex-col gap-4">
                <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold bg-gradient-to-r from-amber-400 via-amber-300 to-yellow-400 bg-clip-text text-transparent">
                  {fund.name}
                </h1>
                <div className="flex items-center gap-3 flex-wrap">
                  <span className="bg-gradient-to-r from-amber-500/20 to-amber-400/20 border border-amber-400/30 text-amber-300 px-4 py-2 rounded-full text-sm font-semibold backdrop-blur-sm">
                    Segregated Account
                  </span>
                  <span className="text-amber-200/60 text-sm">
                    Alternatives • Managed Account (DMA) • USD
                  </span>
                </div>
              </div>
              <p className="text-xl text-slate-300 max-w-2xl leading-relaxed">
                {fund.description}
              </p>
              <div className="pt-4 border-t border-amber-400/20">
                <p className="text-slate-400 text-sm mb-2">Minimum Investment</p>
                <p className="text-4xl font-bold text-amber-400">$5,000,000</p>
              </div>
            </div>
          </ScrollReveal>
        </div>
      </div>

      {/* Volatility Customizer */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <ScrollReveal direction="up" delay={0.1}>
          <div className="space-y-8">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-3">
                Customize Your Volatility Target
              </h2>
              <p className="text-slate-400 text-lg">
                Select your preferred downside volatility to view corresponding returns, Sharpe ratio, and allocation strategy
              </p>
            </div>

            {/* Toggle Buttons */}
            <div className="flex gap-4 flex-wrap">
              {(["3%", "6%", "9%"] as const).map((vol) => (
                <button
                  key={vol}
                  onClick={() => handleVolatilityChange(vol)}
                  className={cn(
                    "relative px-8 py-4 rounded-xl font-semibold text-lg transition-all duration-300 transform",
                    selectedVolatility === vol
                      ? "bg-gradient-to-r from-amber-500 to-amber-600 text-white shadow-xl shadow-amber-500/30 scale-105"
                      : "bg-slate-800/50 text-slate-300 hover:bg-slate-700/50 hover:text-white border border-slate-700/50"
                  )}
                >
                  <span className="relative z-10">{vol} Volatility</span>
                  {selectedVolatility === vol && (
                    <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 opacity-20 blur" />
                  )}
                </button>
              ))}
            </div>

            {/* Metrics Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[
                {
                  label: "Annualized Return",
                  subtitle: "(Gross of Fees)",
                  value: scenario.annualizedReturn,
                  format: "percent",
                  icon: "↗",
                },
                {
                  label: "Sharpe Ratio",
                  subtitle: "",
                  value: scenario.sharpeRatio,
                  format: "number",
                  icon: "⚖",
                },
                {
                  label: "Maximum Drawdown",
                  subtitle: "",
                  value: scenario.maxDrawdown,
                  format: "percent",
                  icon: "↘",
                  isDanger: true,
                },
              ].map((metric, idx) => (
                <div
                  key={idx}
                  ref={(el) => {
                    metricsRefs.current[idx] = el;
                  }}
                  className="relative group"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-amber-500/10 to-transparent rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  <Card className="p-6 bg-slate-800/40 border-slate-700/30 backdrop-blur-sm relative">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <p className="text-slate-400 text-sm">{metric.label}</p>
                        {metric.subtitle && (
                          <p className="text-slate-500 text-xs mt-1">{metric.subtitle}</p>
                        )}
                      </div>
                      <span className="text-2xl opacity-30">{metric.icon}</span>
                    </div>
                    <div
                      className={cn(
                        "text-4xl font-bold",
                        metric.isDanger ? "text-red-400" : "text-amber-400"
                      )}
                    >
                      {metric.format === "percent"
                        ? formatPercent(metric.value)
                        : metric.value.toFixed(2)}
                    </div>
                  </Card>
                </div>
              ))}
            </div>

            {/* Asset Allocation Visualization */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 pt-8">
              <div ref={chartRef} className="flex justify-center lg:justify-end">
                <DonutChart allocation={scenario.allocation} size={280} />
              </div>

              <div className="space-y-4">
                <h3 className="text-xl font-bold text-white mb-6">
                  {selectedVolatility} Volatility Allocation
                </h3>
                {scenario.allocation.map((item) => (
                  <div key={item.name} className="space-y-2">
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-3">
                        <div
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: item.color }}
                        />
                        <span className="font-medium text-slate-300">
                          {item.name}
                        </span>
                      </div>
                      <span className="font-bold text-amber-400">
                        {item.percentage}%
                      </span>
                    </div>
                    <div className="w-full bg-slate-700/30 rounded-full h-2 overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-500"
                        style={{
                          backgroundColor: item.color,
                          width: `${item.percentage}%`,
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </ScrollReveal>
      </div>

      {/* Strategy Features */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <ScrollReveal direction="up" delay={0.15}>
          <div className="space-y-12">
            <h2 className="text-4xl font-bold text-white">
              Why Choose Global Minimum Volatility
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {strategyFeatures.map((feature, idx) => {
                const Icon = feature.icon;
                return (
                  <Card
                    key={idx}
                    className="p-8 bg-slate-800/40 border-slate-700/30 backdrop-blur-sm hover:border-amber-400/30 hover:bg-slate-800/60 transition-all duration-300 transform hover:scale-105 cursor-pointer group"
                  >
                    <div className="flex gap-4">
                      <div className="flex-shrink-0">
                        <div className="flex items-center justify-center h-12 w-12 rounded-lg bg-gradient-to-br from-amber-500/20 to-amber-400/10 group-hover:from-amber-500/40 group-hover:to-amber-400/20 transition-colors">
                          <Icon className="w-6 h-6 text-amber-400" />
                        </div>
                      </div>
                      <div className="flex-1">
                        <h3 className="text-lg font-bold text-white mb-2">
                          {feature.title}
                        </h3>
                        <p className="text-slate-400 text-sm leading-relaxed">
                          {feature.description}
                        </p>
                      </div>
                    </div>
                  </Card>
                );
              })}
            </div>
          </div>
        </ScrollReveal>
      </div>

      {/* Management Team */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <ScrollReveal direction="up" delay={0.2}>
          <div className="space-y-12">
            <h2 className="text-4xl font-bold text-white">Management Team</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {managers.map((managerName) => {
                const member = getTeamMember(managerName);
                return (
                  <Card
                    key={managerName}
                    className="p-8 bg-slate-800/40 border-slate-700/30 backdrop-blur-sm hover:border-amber-400/30 hover:bg-slate-800/60 transition-all duration-300 transform hover:scale-105"
                  >
                    <TeamAvatar
                      name={member.name}
                      initials={member.initials}
                      color={member.color}
                    />
                  </Card>
                );
              })}
            </div>
          </div>
        </ScrollReveal>
      </div>

      {/* Strategy Documentation */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <ScrollReveal direction="up" delay={0.25}>
          <div className="space-y-12">
            <h2 className="text-4xl font-bold text-white">
              Strategy Documentation
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {documents.map((doc, idx) => (
                <Card
                  key={idx}
                  className="p-6 bg-slate-800/40 border-l-4 border-l-amber-400 border-slate-700/30 backdrop-blur-sm hover:bg-slate-800/60 hover:border-amber-300/50 transition-all duration-300 transform hover:scale-105 cursor-pointer group"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <FileText className="w-5 h-5 text-amber-400" />
                      <span className="text-xs font-semibold text-amber-400 uppercase tracking-wider">
                        {doc.type}
                      </span>
                    </div>
                    <Download className="w-5 h-5 text-slate-500 group-hover:text-amber-400 transition-colors" />
                  </div>
                  <h3 className="font-bold text-white mb-2 group-hover:text-amber-400 transition-colors">
                    {doc.name}
                  </h3>
                  <p className="text-sm text-slate-500">
                    Updated {doc.lastUpdated}
                  </p>
                </Card>
              ))}
            </div>
          </div>
        </ScrollReveal>
      </div>

      {/* CTA Section */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <ScrollReveal direction="up" delay={0.3}>
          <Card className="relative overflow-hidden p-12 md:p-16 bg-gradient-to-r from-amber-600/20 via-amber-500/10 to-transparent border border-amber-400/20 backdrop-blur-sm">
            <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-amber-500/10 to-transparent rounded-full blur-3xl -z-10" />

            <div className="text-center space-y-6 relative z-10">
              <h2 className="text-4xl md:text-5xl font-bold text-white">
                Ready to Optimize Your Portfolio?
              </h2>
              <p className="text-xl text-slate-300 max-w-2xl mx-auto">
                Contact our team to discuss how we can structure a customized segregated account tailored to your specific risk tolerance and investment objectives.
              </p>
              <Button
                size="lg"
                className="bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white font-semibold shadow-lg shadow-amber-500/30"
              >
                Schedule Consultation
              </Button>
            </div>
          </Card>
        </ScrollReveal>
      </div>

      {/* Footer Spacing */}
      <div className="h-20" />
    </div>
  );
}
