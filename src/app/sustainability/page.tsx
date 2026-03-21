'use client';

import { Card } from '@/components/ui/Card';
import { ScrollReveal } from '@/components/animations/ScrollReveal';
import AnimatedCounter from '@/components/animations/AnimatedCounter';
import Link from 'next/link';
import {
  Leaf, Shield, Globe, TrendingDown, Wind, Ban, FileCheck,
  ArrowRight, BarChart3, Target, Award, Zap, Droplets,
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const esgMetrics = [
  { label: 'Carbon Intensity vs Benchmark', fund: 42, benchmark: 100, unit: 'tCO2e/$M' },
  { label: 'ESG Score (Weighted Avg)', fund: 78, benchmark: 62, unit: '/100' },
  { label: 'Green Bond Allocation', fund: 8.5, benchmark: 2.1, unit: '%' },
  { label: 'Fossil Fuel Exposure', fund: 0, benchmark: 8.4, unit: '%' },
];

const exclusions = [
  { category: 'Fossil Fuel Production', icon: Wind, desc: 'Companies deriving >5% revenue from coal, oil sands, or thermal coal power generation.' },
  { category: 'Tobacco', icon: Ban, desc: 'All tobacco manufacturers and distributors.' },
  { category: 'Controversial Weapons', icon: Shield, desc: 'Cluster munitions, landmines, biological, chemical, and nuclear weapons manufacturers.' },
  { category: 'Severe ESG Controversies', icon: Target, desc: 'Companies rated "Severe" on MSCI ESG Controversies or equivalent.' },
];

const greenBondData = [
  { year: '2020', allocation: 3.2 },
  { year: '2021', allocation: 4.8 },
  { year: '2022', allocation: 5.5 },
  { year: '2023', allocation: 7.2 },
  { year: '2024', allocation: 8.5 },
];

export default function SustainabilityPage() {
  return (
    <main className="bg-white min-h-screen">
      {/* Hero */}
      <section className="bg-white border-b border-slate-100 pt-8 pb-12 px-6">
        <div className="max-w-7xl mx-auto">
          <ScrollReveal>
            <p className="text-sm font-semibold text-green-600 uppercase tracking-wide mb-2">Sustainability</p>
            <h1 className="text-4xl font-bold text-slate-900 mb-4">Responsible Investing</h1>
            <p className="text-lg text-slate-600 max-w-2xl">
              ESG integration is embedded in our investment process, not bolted on. We believe that companies with strong environmental, social, and governance practices deliver superior long-term risk-adjusted returns.
            </p>
          </ScrollReveal>
        </div>
      </section>

      {/* ESG Metrics Dashboard */}
      <section className="py-16 px-6 bg-white">
        <div className="max-w-7xl mx-auto">
          <ScrollReveal>
            <h2 className="text-2xl font-bold text-slate-900 mb-8">ESG Metrics Dashboard</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {esgMetrics.map((metric) => (
                <Card key={metric.label} className="p-5 border border-slate-200">
                  <p className="text-xs text-slate-500 font-medium mb-3">{metric.label}</p>
                  <div className="flex items-end gap-3">
                    <div>
                      <p className="text-xs text-slate-400">Fund</p>
                      <p className="text-2xl font-bold text-green-600">{metric.fund}{metric.unit}</p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-400">Benchmark</p>
                      <p className="text-lg font-semibold text-slate-400">{metric.benchmark}{metric.unit}</p>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* Exclusion Policy */}
      <section className="py-16 px-6 bg-slate-50 border-t border-slate-100">
        <div className="max-w-7xl mx-auto">
          <ScrollReveal>
            <h2 className="text-2xl font-bold text-slate-900 mb-8">Exclusion Policy</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {exclusions.map((ex) => {
                const Icon = ex.icon;
                return (
                  <Card key={ex.category} className="p-5 border border-slate-200 bg-white">
                    <div className="flex items-start gap-4">
                      <div className="w-10 h-10 rounded-lg bg-red-50 flex items-center justify-center flex-shrink-0">
                        <Icon className="w-5 h-5 text-red-500" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-slate-900 text-sm mb-1">{ex.category}</h3>
                        <p className="text-xs text-slate-600 leading-relaxed">{ex.desc}</p>
                      </div>
                    </div>
                  </Card>
                );
              })}
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* Green Bond Growth */}
      <section className="py-16 px-6 bg-white border-t border-slate-100">
        <div className="max-w-7xl mx-auto">
          <ScrollReveal>
            <h2 className="text-2xl font-bold text-slate-900 mb-2">Green Bond Allocation Over Time</h2>
            <p className="text-slate-600 mb-8">Growing allocation to certified green bonds financing climate-positive projects.</p>
            <Card className="p-6 border border-slate-200">
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={greenBondData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="year" tick={{ fontSize: 12, fill: '#64748b' }} />
                  <YAxis tick={{ fontSize: 12, fill: '#64748b' }} tickFormatter={(v: unknown) => `${v}%`} />
                  <Tooltip formatter={(v: unknown) => [`${v}%`, 'Green Bond %']} contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '13px' }} />
                  <Bar dataKey="allocation" fill="#22c55e" radius={[4, 4, 0, 0]} maxBarSize={40} />
                </BarChart>
              </ResponsiveContainer>
            </Card>
          </ScrollReveal>
        </div>
      </section>

      {/* Fondaction Partnership */}
      <section className="py-16 px-6 bg-slate-50 border-t border-slate-100">
        <div className="max-w-7xl mx-auto">
          <ScrollReveal>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <Award className="w-5 h-5 text-green-600" />
                  <p className="text-sm font-semibold text-green-600 uppercase tracking-wide">Partnership</p>
                </div>
                <h2 className="text-2xl font-bold text-slate-900 mb-4">Fondaction Collaboration</h2>
                <p className="text-slate-600 leading-relaxed mb-4">
                  Our partnership with Fondaction represents a shared commitment to advancing responsible investing in Canadian fixed income markets. Together, we have developed ESG-integrated bond strategies that demonstrate sustainability and strong returns are not mutually exclusive.
                </p>
                <p className="text-slate-600 leading-relaxed">
                  Fondaction, a labour-sponsored venture capital fund dedicated to positive economic, social, and environmental impact, has entrusted Nymbus with managing sustainable bond mandates that align with their mission of responsible capital allocation.
                </p>
              </div>
              <div>
                <Card className="p-6 border border-slate-200 bg-white">
                  <h3 className="font-bold text-slate-900 mb-4">PRI Alignment Scorecard</h3>
                  <div className="space-y-4">
                    {[
                      { principle: 'ESG in investment analysis', score: 95 },
                      { principle: 'Active ownership policies', score: 82 },
                      { principle: 'ESG disclosure by investees', score: 88 },
                      { principle: 'Industry acceptance of ESG', score: 90 },
                      { principle: 'Implementation effectiveness', score: 85 },
                      { principle: 'Reporting on ESG activities', score: 92 },
                    ].map((p) => (
                      <div key={p.principle}>
                        <div className="flex justify-between text-sm mb-1">
                          <span className="text-slate-600">{p.principle}</span>
                          <span className="font-semibold text-slate-900">{p.score}%</span>
                        </div>
                        <div className="bg-slate-100 rounded-full h-2">
                          <div className="bg-green-500 h-full rounded-full transition-all" style={{ width: `${p.score}%` }} />
                        </div>
                      </div>
                    ))}
                  </div>
                </Card>
              </div>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 px-6 bg-white border-t border-slate-100">
        <div className="max-w-3xl mx-auto text-center">
          <ScrollReveal>
            <h2 className="text-2xl font-bold text-slate-900 mb-4">Invest Responsibly</h2>
            <p className="text-slate-600 mb-8">Explore our sustainable fund offerings and learn how ESG integration enhances long-term performance.</p>
            <Link href="/strategies/sustainable-enhanced-bonds" className="inline-flex items-center gap-2 bg-green-600 text-white px-8 py-3.5 rounded-lg font-medium hover:bg-green-700 transition-colors">
              Explore Sustainable Funds <ArrowRight className="w-4 h-4" />
            </Link>
          </ScrollReveal>
        </div>
      </section>
    </main>
  );
}