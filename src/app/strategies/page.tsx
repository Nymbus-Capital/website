"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { funds, Fund } from "@/data/funds";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { ScrollReveal } from '@/components/animations/ScrollReveal';
import { cn, formatPercent } from "@/lib/utils";

type AssetClassFilter = "All" | "Fixed Income" | "Alternatives" | "Multi-Asset";
type VehicleFilter = "All" | "Mutual Fund" | "Managed Account";
type SortField = "name" | "assetClass" | "vehicle" | "ytd" | "oneYear" | "sinceInception" | "sharpe";

export default function StrategiesPage() {
  const [assetClass, setAssetClass] = useState<AssetClassFilter>("All");
  const [vehicle, setVehicle] = useState<VehicleFilter>("All");
  const [sortField, setSortField] = useState<SortField>("name");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");

  const filteredAndSortedFunds = useMemo(() => {
    let filtered = funds.filter((fund) => {
      const matchAsset = assetClass === "All" || fund.assetClass === assetClass;
      const matchVehicle = vehicle === "All" || fund.vehicle === vehicle;
      return matchAsset && matchVehicle;
    });

    filtered.sort((a, b) => {
      let aValue: string | number = "";
      let bValue: string | number = "";

      switch (sortField) {
        case "name":
          aValue = a.name;
          bValue = b.name;
          break;
        case "assetClass":
          aValue = a.assetClass;
          bValue = b.assetClass;
          break;
        case "vehicle":
          aValue = a.vehicle;
          bValue = b.vehicle;
          break;
        case "ytd":
          aValue = a.returns.ytd;
          bValue = b.returns.ytd;
          break;
        case "oneYear":
          aValue = a.returns.oneYear;
          bValue = b.returns.oneYear;
          break;
        case "sinceInception":
          aValue = a.returns.sinceInception;
          bValue = b.returns.sinceInception;
          break;
        case "sharpe":
          aValue = a.sharpe ?? 0;
          bValue = b.sharpe ?? 0;
          break;
      }

      if (typeof aValue === "string") {
        return sortDirection === "asc" ? aValue.localeCompare(bValue as string) : (bValue as string).localeCompare(aValue);
      }

      return sortDirection === "asc" ? (aValue as number) - (bValue as number) : (bValue as number) - (aValue as number);
    });

    return filtered;
  }, [assetClass, vehicle, sortField, sortDirection]);

  const toggleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  const SortIcon = ({ field }: { field: SortField }) => {
    if (sortField !== field) return <span className="text-slate-300">↕</span>;
    return sortDirection === "asc" ? <span className="text-[#4285F4]">↑</span> : <span className="text-[#4285F4]">↓</span>;
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#F8FAFC] to-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <ScrollReveal direction="up">
          <SectionHeader
            eyebrow="Investment Solutions"
            title="Investment Strategies"
            description="Explore our systematically managed funds and strategies designed for institutional and individual investors."
          />
        </ScrollReveal>

        <div className="mt-12 space-y-6">
          {/* Filter Bar */}
          <ScrollReveal direction="up" delay={0.1}>
            <Card className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Asset Class Filter */}
                <div>
                  <label className="block text-sm font-semibold text-slate-900 mb-3">Asset Class</label>
                  <div className="flex flex-wrap gap-2">
                    {["All", "Fixed Income", "Alternatives", "Multi-Asset"].map((option) => (
                      <button
                        key={option}
                        onClick={() => setAssetClass(option as AssetClassFilter)}
                        className={cn(
                          "px-4 py-2 rounded-lg font-medium transition-all duration-200",
                          assetClass === option
                            ? "bg-[#4285F4] text-white"
                            : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                        )}
                      >
                        {option}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Vehicle Filter */}
                <div>
                  <label className="block text-sm font-semibold text-slate-900 mb-3">Vehicle</label>
                  <div className="flex flex-wrap gap-2">
                    {["All", "Mutual Fund", "Managed Account"].map((option) => (
                      <button
                        key={option}
                        onClick={() => setVehicle(option as VehicleFilter)}
                        className={cn(
                          "px-4 py-2 rounded-lg font-medium transition-all duration-200",
                          vehicle === option
                            ? "bg-[#4285F4] text-white"
                            : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                        )}
                      >
                        {option}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </Card>
          </ScrollReveal>

          {/* Funds Table */}
          <ScrollReveal direction="up" delay={0.2}>
            <Card className="overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-slate-50 border-b border-slate-200">
                    <tr>
                      <th className="px-6 py-4 text-left">
                        <button
                          onClick={() => toggleSort("name")}
                          className="flex items-center gap-2 font-semibold text-slate-900 hover:text-[#4285F4]"
                        >
                          Strategy Name
                          <SortIcon field="name" />
                        </button>
                      </th>
                      <th className="px-6 py-4 text-left">
                        <button
                          onClick={() => toggleSort("assetClass")}
                          className="flex items-center gap-2 font-semibold text-slate-900 hover:text-[#4285F4]"
                        >
                          Asset Class
                          <SortIcon field="assetClass" />
                        </button>
                      </th>
                      <th className="px-6 py-4 text-left">
                        <button
                          onClick={() => toggleSort("vehicle")}
                          className="flex items-center gap-2 font-semibold text-slate-900 hover:text-[#4285F4]"
                        >
                          Vehicle
                          <SortIcon field="vehicle" />
                        </button>
                      </th>
                      <th className="px-6 py-4 text-right">
                        <button
                          onClick={() => toggleSort("ytd")}
                          className="flex items-center justify-end gap-2 font-semibold text-slate-900 hover:text-[#4285F4] w-full"
                        >
                          YTD
                          <SortIcon field="ytd" />
                        </button>
                      </th>
                      <th className="px-6 py-4 text-right">
                        <button
                          onClick={() => toggleSort("oneYear")}
                          className="flex items-center justify-end gap-2 font-semibold text-slate-900 hover:text-[#4285F4] w-full"
                        >
                          1Y
                          <SortIcon field="oneYear" />
                        </button>
                      </th>
                      <th className="px-6 py-4 text-right">
                        <button
                          onClick={() => toggleSort("sinceInception")}
                          className="flex items-center justify-end gap-2 font-semibold text-slate-900 hover:text-[#4285F4] w-full"
                        >
                          SI Return
                          <SortIcon field="sinceInception" />
                        </button>
                      </th>
                      <th className="px-6 py-4 text-right">
                        <button
                          onClick={() => toggleSort("sharpe")}
                          className="flex items-center justify-end gap-2 font-semibold text-slate-900 hover:text-[#4285F4] w-full"
                        >
                          Sharpe
                          <SortIcon field="sharpe" />
                        </button>
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    <AnimatePresence mode="popLayout">
                      {filteredAndSortedFunds.map((fund, index) => (
                        <motion.tr
                          key={fund.slug}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -10 }}
                          transition={{ duration: 0.2, delay: index * 0.02 }}
                          className="border-b border-slate-100 hover:bg-slate-50 transition-colors"
                        >
                          <td className="px-6 py-4">
                            <Link href={`/strategies/${fund.slug}`} className="font-semibold text-[#4285F4] hover:underline">
                              {fund.name}
                            </Link>
                          </td>
                          <td className="px-6 py-4 text-slate-700">{fund.assetClass}</td>
                          <td className="px-6 py-4 text-slate-700">{fund.vehicle}</td>
                          <td className="px-6 py-4 text-right font-medium text-slate-900">
                            {formatPercent(fund.returns.ytd)}
                          </td>
                          <td className="px-6 py-4 text-right font-medium text-slate-900">
                            {formatPercent(fund.returns.oneYear)}
                          </td>
                          <td className="px-6 py-4 text-right font-medium text-slate-900">
                            {formatPercent(fund.returns.sinceInception)}
                          </td>
                          <td className="px-6 py-4 text-right font-medium text-slate-900">
                            {fund.sharpe ? fund.sharpe.toFixed(2) : "—"}
                          </td>
                        </motion.tr>
                      ))}
                    </AnimatePresence>
                  </tbody>
                </table>
              </div>
            </Card>
          </ScrollReveal>
        </div>

        {/* Why Systematic Section */}
        <div className="mt-20">
          <ScrollReveal direction="up">
            <SectionHeader
              eyebrow="Our Philosophy"
              title="Why Systematic?"
              description="Our data-driven approach removes emotion and behavioral bias from investing, delivering consistent, measurable results."
            />
          </ScrollReveal>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mt-12">
            {[
              {
                stat: "12.8%",
                label: "SI Return (Multi-Strategy)",
                description: "Delivering consistent long-term outperformance through disciplined systematic investing",
              },
              {
                stat: "0.82",
                label: "Sharpe Ratio (SEB)",
                description: "Risk-adjusted returns that prioritize downside protection and stability",
              },
              {
                stat: "0.65%",
                label: "Low MER",
                description: "Cost-efficient investing without compromising on quality and management",
              },
              {
                stat: "2014",
                label: "Since Inception",
                description: "Over a decade of proven systematic investment management and expertise",
              },
            ].map((item, index) => (
              <ScrollReveal key={index} direction="up" delay={0.1 * (index + 1)}>
                <Card className="p-6 text-center">
                  <div className="text-4xl font-bold text-[#4285F4] mb-2">{item.stat}</div>
                  <h3 className="font-semibold text-slate-900 mb-2">{item.label}</h3>
                  <p className="text-sm text-slate-600">{item.description}</p>
                </Card>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}