'use client';

import Link from 'next/link';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { ScrollReveal } from '@/components/animations/ScrollReveal';
import AnimatedCounter from '@/components/animations/AnimatedCounter';
import { InvestorLogos } from '@/components/animations/InvestorLogos';
import { funds } from '@/data/funds';
import { formatPercent } from '@/lib/utils';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { TrendingUp, BarChart3, Shield } from 'lucide-react';

// Generate mock performance data
const generatePerformanceData = () => {
  const data = [];
  let value = 10000;
  for (let i = 0; i <= 60; i++) {
    const month = i;
    const monthlyReturn = (Math.random() - 0.45) * 200 + 80;
    value += monthlyReturn;
    data.push({
      month,
      value: Math.round(value),
    });
  }
  return data;
};

const performanceData = generatePerformanceData();

export default function Home() {
  return (
    <main className="bg-white">
      <section className="min-h-screen flex flex-col items-center justify-center px-6 py-20">
        <div className="max-w-3xl text-center">
          <h1 className="text-6xl md:text-7xl font-bold text-slate-900 mb-6 leading-tight">
            Scientific Investing
          </h1>
          <p className="text-xl text-slate-700 mb-10 leading-relaxed max-w-2xl mx-auto">
            We apply rigorous quantitative research and systematic strategies to fixed income and multi-asset investing.
          </p>
          <div className="flex gap-4 justify-center flex-wrap">
            <Button asChild className="bg-slate-900 hover:bg-slate-800 text-white px-8 py-3 rounded-lg font-medium">
              <Link href="#strategies">Explore Strategies</Link>
            </Button>
          </div>
        </div>
      </section>

      <section className="bg-white border-t border-slate-100 border-b">
        <div className="max-w-7xl mx-auto px-6 py-16">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-0">
            <ScrollReveal>
              <div className="text-center lg:border-r lg:border-slate-200 lg:pr-8">
                <div className="text-4xl font-bold text-slate-900 mb-2">
                  <AnimatedCounter target={2} suffix="B+" duration={2000} />
                </div>
                <p className="text-sm text-slate-500 font-medium">AUM</p>
              </div>
            </ScrollReveal>
            <ScrollReveal delay={100}>
              <div className="text-center lg:border-r lg:border-slate-200 lg:px-8">
                <div className="text-4xl font-bold text-slate-900 mb-2">
                  <AnimatedCounter target={12} suffix="+" duration={2000} />
                </div>
                <p className="text-sm text-slate-500 font-medium">Years Experience</p>
              </div>
            </ScrollReveal>
            <ScrollReveal delay={200}>
              <div className="text-center lg:border-r lg:border-slate-200 lg:px-8">
                <div className="text-4xl font-bold text-slate-900 mb-2">
                  <AnimatedCounter target={14} suffix="" duration={2000} />
                </div>
                <p className="text-sm text-slate-500 font-medium">Professionals</p>
              </div>
            </ScrollReveal>
            <ScrollReveal delay={300}>
              <div className="text-center lg:pl-8">
                <div className="text-4xl font-bold text-slate-900 mb-2">
                  <AnimatedCounter target={4} suffix="" duration={2000} />
                </div>
                <p className="text-sm text-slate-500 font-medium">Strategies</p>
              </div>
            </ScrollReveal>
          </div>
        </div>
      </section>

      <section className="py-20 px-6 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">
            <ScrollReveal>
              <div>
                <p className="text-sm font-semibold text-blue-600 mb-2 uppercase tracking-wide">Our Approach</p>
                <h2 className="text-4xl font-bold text-slate-900 mb-6 leading-tight">
                  Systematic, Research-Driven
                </h2>
                <p className="text-lg text-slate-700 leading-relaxed">
                  We believe that systematic, quantitative approaches to fixed income and multi-asset investing deliver superior risk-adjusted returns. Our team combines decades of experience with rigorous research methodologies to construct disciplined portfolios that outperform benchmarks while managing downside risk.
                </p>
              </div>
            </ScrollReveal>
            <ScrollReveal delay={200}>
              <div className="space-y-6">
                <Card className="p-6 border border-slate-200 bg-white hover:border-slate-300 transition-colors">
                  <div className="flex gap-4">
                    <div className="flex-shrink-0 w-12 h-12 rounded-lg bg-slate-50 flex items-center justify-center">
                      <TrendingUp className="w-6 h-6 text-slate-900" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-slate-900 mb-2">Research</h3>
                      <p className="text-sm text-slate-600">
                        Deep quantitative analysis of market dynamics, credit fundamentals, and risk factors.
                      </p>
                    </div>
                  </div>
                </Card>
                <Card className="p-6 border border-slate-200 bg-white hover:border-slate-300 transition-colors">
                  <div className="flex gap-4">
                    <div className="flex-shrink-0 w-12 h-12 rounded-lg bg-slate-50 flex items-center justify-center">
                      <BarChart3 className="w-6 h-6 text-slate-900" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-slate-900 mb-2">Construction</h3>
                      <p className="text-sm text-slate-600">
                        Systematic portfolio building using optimization models and disciplined allocation rules.
                      </p>
                    </div>
                  </div>
                </Card>
                <Card className="p-6 border border-slate-200 bg-white hover:border-slate-300 transition-colors">
                  <div className="flex gap-4">
                    <div className="flex-shrink-0 w-12 h-12 rounded-lg bg-slate-50 flex items-center justify-center">
                      <Shield className="w-6 h-6 text-slate-900" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-slate-900 mb-2">Risk Management</h3>
                      <p className="text-sm text-slate-600">
                        Continuous monitoring and proactive hedging to protect capital in volatile markets.
                      </p>
                    </div>
                  </div>
                </Card>
              </div>
            </ScrollReveal>
          </div>
        </div>
      </section>

      <section id="strategies" className="py-20 px-6 bg-slate-50">
        <div className="max-w-7xl mx-auto">
          <ScrollReveal>
            <div className="mb-16">
              <p className="text-sm font-semibold text-blue-600 mb-3 uppercase tracking-wide">Strategies</p>
              <h2 className="text-4xl font-bold text-slate-900">Our Investment Solutions</h2>
            </div>
          </ScrollReveal>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {funds.slice(0, 4).map((fund, index) => (
              <ScrollReveal key={fund.slug} delay={index * 100}>
                <Link href={`/strategies/${fund.slug}`}>
                  <Card className="h-full p-8 border border-slate-200 bg-white hover:border-slate-300 hover:shadow-sm transition-all cursor-pointer">
                    <div className="mb-6">
                      <h3 className="text-xl font-bold text-slate-900 mb-2">{fund.name}</h3>
                      <p className="text-sm text-slate-600 leading-relaxed">
                        {fund.description.substring(0, 120)}...
                      </p>
                    </div>
                    <div className="border-t border-slate-100 pt-6">
                      <div className="grid grid-cols-3 gap-4 text-center">
                        <div>
                          <p className="text-sm font-semibold text-slate-900">
                            {formatPercent(fund.returns.oneYear)}
                          </p>
                          <p className="text-xs text-slate-500 mt-1">1-Year</p>
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-slate-900">
                            {formatPercent(fund.returns.sinceInception)}
                          </p>
                          <p className="text-xs text-slate-500 mt-1">Since Inception</p>
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-slate-900">
                            {fund.sharpe?.toFixed(2) ?? 'N/A'}
                          </p>
                          <p className="text-xs text-slate-500 mt-1">Sharpe Ratio</p>
                        </div>
                      </div>
                    </div>
                    <div className="mt-6 pt-6 border-t border-slate-100">
                      <span className="text-sm font-semibold text-blue-600 hover:text-blue-700 transition-colors">
                        View Details →
                      </span>
                    </div>
                  </Card>
                </Link>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 px-6 bg-white">
        <div className="max-w-7xl mx-auto">
          <ScrollReveal>
            <div className="mb-12">
              <p className="text-sm font-semibold text-blue-600 mb-3 uppercase tracking-wide">Performance</p>
              <h2 className="text-4xl font-bold text-slate-900 mb-2">Growth of $10,000</h2>
              <p className="text-lg text-slate-600">Illustrative 5-year cumulative performance</p>
            </div>
          </ScrollReveal>
          <ScrollReveal delay={200}>
            <Card className="p-8 border border-slate-200 bg-white">
              <ResponsiveContainer width="100%" height={400}>
                <LineChart data={performanceData} margin={{ top: 5, right: 30, left: 0, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis dataKey="month" stroke="#94a3b8" />
                  <YAxis stroke="#94a3b8" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#f8fafc',
                      border: '1px solid #e2e8f0',
                      borderRadius: '8px',
                    }}
                    formatter={(value) => value != null ? `$${Number(value).toLocaleString()}` : ''}
                  />
                  <Line
                    type="monotone"
                    dataKey="value"
                    stroke="#0066FF"
                    dot={false}
                    strokeWidth={2}
                    isAnimationActive={true}
                  />
                </LineChart>
              </ResponsiveContainer>
            </Card>
          </ScrollReveal>
        </div>
      </section>

      <section className="py-20 px-6 bg-slate-50 border-t border-slate-100">
        <div className="max-w-7xl mx-auto">
          <ScrollReveal>
            <div className="text-center mb-12">
              <p className="text-sm font-semibold text-slate-500 uppercase tracking-wide mb-4">
                Trusted by institutional investors
              </p>
            </div>
          </ScrollReveal>
          <ScrollReveal delay={200}>
            <InvestorLogos />
          </ScrollReveal>
        </div>
      </section>

      <section className="py-20 px-6 bg-white border-t border-slate-100">
        <div className="max-w-3xl mx-auto text-center">
          <ScrollReveal>
            <h2 className="text-4xl font-bold text-slate-900 mb-6">Ready to explore our strategies?</h2>
            <p className="text-lg text-slate-600 mb-8">
              Connect with our team to learn how our quantitative approach can deliver superior risk-adjusted returns.
            </p>
            <Button asChild className="bg-slate-900 hover:bg-slate-800 text-white px-8 py-3 rounded-lg font-medium">
              <Link href="#contact">Get in Touch</Link>
            </Button>
          </ScrollReveal>
        </div>
      </section>
    </main>
  );
}