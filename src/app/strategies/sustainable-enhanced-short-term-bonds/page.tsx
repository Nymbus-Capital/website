'use client';

import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { ScrollReveal } from '@/components/animations/ScrollReveal';
import { formatPercent } from "@/lib/utils";
import { funds } from "@/data/funds";
import Link from "next/link";

export default function SustainableEnhancedShortTermBondsPage() {
  const fund = funds.find((f) => f.slug === "sustainable-enhanced-short-term-bonds");

  if (!fund) {
    return <div className="text-center py-20">Fund not found</div>;
  }

  const trailingReturns = [
    { period: "1M", return: 0.4 },
    { period: "3M", return: 0.7 },
    { period: "6M", return: 1.1 },
    { period: "YTD", return: 1.8 },
    { period: "1Y", return: 5.2 },
    { period: "3Y", return: 3.1 },
    { period: "SI", return: 3.8 },
  ];

  const calendarYearReturns = [
    { year: 2020, return: 3.2 },
    { year: 2021, return: 1.8 },
    { year: 2022, return: -2.1 },
    { year: 2023, return: 4.6 },
    { year: 2024, return: 2.9 },
    { year: 2025, return: 1.8 },
  ];

  const topHoldings = [
    { name: "Sagicor Group Jamaica", sector: "Insurance", weight: 14.6 },
    { name: "Government of Canada Bonds (3Y)", sector: "Government", weight: 11.2 },
    { name: "RBC Short-Term Bond ETF", sector: "Fixed Income", weight: 9.8 },
    { name: "Bank of Nova Scotia", sector: "Financials", weight: 8.3 },
    { name: "Toronto-Dominion Bank", sector: "Financials", weight: 7.9 },
    { name: "Manulife Financial", sector: "Insurance", weight: 7.2 },
    { name: "Canadian Imperial Bank", sector: "Financials", weight: 6.8 },
    { name: "Great-West Lifeco", sector: "Insurance", weight: 6.5 },
    { name: "Sun Life Financial", sector: "Insurance", weight: 5.9 },
    { name: "Government of Canada Bonds (1Y)", sector: "Government", weight: 4.8 },
  ];

  const sectorExposure = [
    { sector: "Insurance", percentage: 42.6 },
    { sector: "Government", percentage: 16.0 },
    { sector: "Financials", percentage: 23.0 },
    { sector: "Fixed Income Funds", percentage: 9.8 },
    { sector: "Other", percentage: 8.6 },
  ];

  const managers = fund.managers;

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <Link href="/strategies" className="inline-block mb-8">
          <Button variant="ghost" size="sm">
            ← Back to Strategies
          </Button>
        </Link>

        <ScrollReveal direction="up">
          <div className="space-y-4 mb-12">
            <div className="flex items-center gap-3 flex-wrap">
              <h1 className="text-4xl md:text-5xl font-bold text-slate-900">{fund.name}</h1>
              <span className="bg-blue-100 text-blue-600 px-3 py-1 rounded-full text-sm font-semibold">
                {fund.assetClass}
              </span>
              <span className="bg-slate-100 text-slate-700 px-3 py-1 rounded-full text-sm font-semibold">CAD</span>
            </div>
            <p className="text-lg text-slate-600">{fund.description}</p>
          </div>

          <Card className="p-6 mb-12">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <div>
                <p className="text-sm text-slate-600 mb-1">MER</p>
                <p className="text-2xl font-bold text-slate-900">{fund.mer || "—"}</p>
              </div>
              <div>
                <p className="text-sm text-slate-600 mb-1">Inception</p>
                <p className="text-2xl font-bold text-slate-900">{new Date(fund.inceptionDate).getFullYear()}</p>
              </div>
              <div>
                <p className="text-sm text-slate-600 mb-1">Sharpe Ratio</p>
                <p className="text-2xl font-bold text-slate-900">{fund.sharpe?.toFixed(2) || "—"}</p>
              </div>
              <div>
                <p className="text-sm text-slate-600 mb-1">Benchmark</p>
                <p className="text-lg font-semibold text-slate-900">FTSE Canada Short-Term</p>
              </div>
            </div>
          </Card>
        </ScrollReveal>

        <ScrollReveal direction="up" delay={0.1}>
          <div className="mb-12">
            <SectionHeader title="Performance" description="Trailing returns as of March 15, 2026" />
            <Card className="p-6 mt-8">
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
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

        <ScrollReveal direction="up" delay={0.2}>
          <div className="mb-12">
            <SectionHeader
              title="Top 10 Holdings"
              description="Insurance-focused portfolio with emphasis on quality short-term fixed income"
            />
            <Card className="p-6 mt-8">
              <div className="space-y-4">
                {topHoldings.map((holding, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <div className="flex-1">
                      <p className="font-semibold text-slate-900">{holding.name}</p>
                      <p className="text-sm text-slate-600">{holding.sector}</p>
                    </div>
                    <div className="flex items-center gap-4 ml-4">
                      <div className="w-32 bg-slate-100 rounded-full h-2">
                        <div
                          className="bg-blue-600 h-2 rounded-full"
                          style={{ width: `${holding.weight * 3}px` }}
                        />
                      </div>
                      <p className="font-semibold text-slate-900 w-12 text-right">{holding.weight.toFixed(1)}%</p>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        </ScrollReveal>

        <ScrollReveal direction="up" delay={0.25}>
          <div className="mb-12">
            <SectionHeader
              title="Sector Exposure"
              description="42.6% insurance exposure reflects strategic allocation to quality financial institutions"
            />
            <Card className="p-6 mt-8">
              <div className="space-y-3">
                {sectorExposure.map((item) => (
                  <div key={item.sector} className="flex items-center gap-4">
                    <div className="w-20 font-semibold text-slate-900">{item.sector}</div>
                    <div className="flex-1 bg-slate-100 rounded-full h-6">
                      <div
                        className="bg-gradient-to-r from-blue-400 to-blue-600 h-6 rounded-full flex items-center justify-end pr-3"
                        style={{ width: `${item.percentage * 2}px` }}
                      >
                        {item.percentage > 10 && (
                          <span className="text-white text-xs font-semibold">{item.percentage}%</span>
                        )}
                      </div>
                    </div>
                    <div className="w-12 text-right font-semibold text-slate-900">{item.percentage}%</div>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        </ScrollReveal>

        <ScrollReveal direction="up" delay={0.3}>
          <div className="mb-12">
            <SectionHeader title="Key Characteristics" />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
              <Card className="p-6">
                <h4 className="font-bold text-slate-900 mb-3">Low Duration Risk</h4>
                <p className="text-slate-600 text-sm">
                  Short-term maturity focus minimizes interest rate sensitivity while capturing yield opportunities in the Canadian bond market.
                </p>
              </Card>
              <Card className="p-6">
                <h4 className="font-bold text-slate-900 mb-3">Sustainability Integrated</h4>
                <p className="text-slate-600 text-sm">
                  ESG criteria embedded throughout the investment process to align returns with values and responsible investing principles.
                </p>
              </Card>
              <Card className="p-6">
                <h4 className="font-bold text-slate-900 mb-3">Insurance Exposure</h4>
                <p className="text-slate-600 text-sm">
                  Strategic overweight to insurance sector provides attractive yield and diversification while maintaining credit quality.
                </p>
              </Card>
              <Card className="p-6">
                <h4 className="font-bold text-slate-900 mb-3">Attractive Sharpe Ratio</h4>
                <p className="text-slate-600 text-sm">
                  1.12 Sharpe ratio reflects superior risk-adjusted returns among short-term fixed income strategies in the Canadian market.
                </p>
              </Card>
            </div>
          </div>
        </ScrollReveal>

        <ScrollReveal direction="up" delay={0.35}>
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

        <ScrollReveal direction="up" delay={0.4}>
          <Card className="p-8 bg-slate-50 border border-slate-200 text-center">
            <h3 className="text-2xl font-bold text-slate-900 mb-4">Short-Term Bond Solution</h3>
            <p className="text-slate-600 mb-6">Download the fund facts sheet for complete details on this CAD-focused short-term strategy.</p>
            <Button size="lg">Download Fund Facts</Button>
          </Card>
        </ScrollReveal>
      </div>
    </div>
  );
}