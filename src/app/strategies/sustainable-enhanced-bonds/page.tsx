'use client';

import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { ScrollReveal } from '@/components/animations/ScrollReveal';
import { formatPercent, formatCurrency, formatNumber } from '@/lib/utils';
import { funds } from '@/data/funds';
import Link from 'next/link';

export default function SustainableEnhancedBondsPage() {
  const fund = funds.find((f) => f.slug === "sustainable-enhanced-bonds");

  if (!fund) {
    return <div className="text-center py-20">Fund not found</div>;
  }

  const trailingReturns = [
    { period: "1M", return: 0.8 },
    { period: "3M", return: 1.1 },
    { period: "6M", return: 1.4 },
    { period: "YTD", return: 1.2 },
    { period: "1Y", return: 7.8 },
    { period: "3Y", return: 2.1 },
    { period: "5Y", return: 3.4 },
    { period: "SI", return: 4.2 },
  ];

  const calendarYearReturns = [
    { year: 2019, return: 6.2 },
    { year: 2020, return: 9.1 },
    { year: 2021, return: -1.5 },
    { year: 2022, return: -11.2 },
    { year: 2023, return: 5.8 },
    { year: 2024, return: 2.3 },
    { year: 2025, return: 1.2 },
  ];

  const topHoldings = [
    { name: "Government of Canada Bonds", sector: "Government", weight: 28.5 },
    { name: "Royal Bank of Canada", sector: "Financials", weight: 8.2 },
    { name: "Toronto-Dominion Bank", sector: "Financials", weight: 7.1 },
    { name: "Bank of Montreal", sector: "Financials", weight: 6.3 },
    { name: "Scotiabank", sector: "Financials", weight: 5.8 },
    { name: "Canadian Imperial Bank of Commerce", sector: "Financials", weight: 5.4 },
    { name: "Enbridge Inc.", sector: "Energy", weight: 4.6 },
    { name: "BCE Inc.", sector: "Telecom", weight: 4.2 },
    { name: "Fortis Inc.", sector: "Utilities", weight: 3.8 },
    { name: "Canadian National Railway", sector: "Transportation", weight: 3.1 },
  ];

  const creditQuality = [
    { rating: "AAA", percentage: 28.5 },
    { rating: "AA", percentage: 35.2 },
    { rating: "A", percentage: 22.1 },
    { rating: "BBB", percentage: 12.8 },
    { rating: "Below BBB", percentage: 1.4 },
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
            <div className="flex items-center gap-3">
              <h1 className="text-4xl md:text-5xl font-bold text-slate-900">{fund.name}</h1>
              <span className="bg-blue-100 text-blue-600 px-3 py-1 rounded-full text-sm font-semibold">
                {fund.assetClass}
              </span>
            </div>
            <p className="text-lg text-slate-600">{fund.description}</p>
          </div>

          <Card className="p-6 mb-12">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <div>
                <p className="text-sm text-slate-500 mb-1">AUM</p>
                <p className="text-2xl font-bold text-slate-900">{fund.aum || '—'}</p>
              </div>
              <div>
                <p className="text-sm text-slate-500 mb-1">MER</p>
                <p className="text-2xl font-bold text-slate-900">{fund.mer || '—'}</p>
              </div>
              <div>
                <p className="text-sm text-slate-500 mb-1">Inception</p>
                <p className="text-2xl font-bold text-slate-900">{new Date(fund.inceptionDate).getFullYear()}</p>
              </div>
              <div>
                <p className="text-sm text-slate-500 mb-1">Sharpe Ratio</p>
                <p className="text-2xl font-bold text-slate-900">{fund.sharpe?.toFixed(2) || '—'}</p>
              </div>
            </div>
          </Card>
        </ScrollReveal>

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
            <SectionHeader title="Top 10 Holdings" />
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
            <SectionHeader title="Credit Quality Breakdown" />
            <Card className="p-6 mt-8">
              <div className="space-y-3">
                {creditQuality.map((item) => (
                  <div key={item.rating} className="flex items-center gap-4">
                    <div className="w-12 font-semibold text-slate-900">{item.rating}</div>
                    <div className="flex-1 bg-slate-100 rounded-full h-6">
                      <div
                        className="bg-gradient-to-r from-blue-400 to-blue-600 h-6 rounded-full flex items-center justify-end pr-2"
                        style={{ width: `${item.percentage * 2}px` }}
                      >
                        {item.percentage > 8 && <span className="text-white text-xs font-semibold">{item.percentage}%</span>}
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

        <ScrollReveal direction="up" delay={0.35}>
          <Card className="p-8 bg-slate-50 border border-slate-200 text-center">
            <h3 className="text-2xl font-bold text-slate-900 mb-4">Ready to Invest?</h3>
            <p className="text-slate-600 mb-6">Download the fund facts sheet for complete details.</p>
            <Button size="lg">Download Fund Facts</Button>
          </Card>
        </ScrollReveal>
      </div>
    </div>
  );
}