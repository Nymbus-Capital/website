'use client';

import { useRef, useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Card } from '@/components/ui/Card';
import { ScrollReveal } from '@/components/animations/ScrollReveal';
import {
  Database, Zap, Layout, Lock, TrendingUp, Shield, Brain,
  BarChart3, ArrowRight, Target, Cpu, GitBranch, Layers,
} from 'lucide-react';

gsap.registerPlugin(ScrollTrigger);

const methodologySteps = [
  {
    icon: Database,
    title: 'Data & Research',
    subtitle: 'Foundation',
    description: 'We ingest and process vast quantities of market data — tick-by-tick pricing, fundamental credit metrics, macroeconomic indicators, and alternative datasets. Our proprietary research frameworks identify persistent patterns and anomalies across fixed income and multi-asset markets.',
    details: ['Proprietary credit scoring models', 'Real-time macro regime classification', 'Alternative data integration (NLP, satellite)', 'Cross-asset correlation analysis'],
  },
  {
    icon: Zap,
    title: 'Signal Generation',
    subtitle: 'Alpha Discovery',
    description: 'Advanced machine learning models transform raw data into actionable investment signals. We employ ensemble methods that combine multiple signal sources to improve robustness and reduce the risk of overfitting to historical patterns.',
    details: ['Gradient-boosted tree ensembles', 'Neural network regime classifiers', 'Cross-validation and walk-forward testing', 'Signal decay analysis and refresh cycles'],
  },
  {
    icon: Layout,
    title: 'Portfolio Construction',
    subtitle: 'Optimization',
    description: 'Signals feed into our portfolio optimizer, which constructs positions subject to risk budgets, concentration limits, liquidity constraints, and transaction cost models. The result is a systematically balanced portfolio that maximizes risk-adjusted returns.',
    details: ['Mean-variance with robust covariance estimation', 'Risk parity and factor-aware allocation', 'Transaction cost optimization', 'Rebalancing threshold calibration'],
  },
  {
    icon: Lock,
    title: 'Risk Management',
    subtitle: 'Protection',
    description: 'Continuous monitoring through our real-time risk engine tracks hundreds of metrics including VaR, stress tests, concentration, and liquidity. Dynamic hedging adjusts exposure based on market regime classification, proactively protecting capital in adverse conditions.',
    details: ['Real-time VaR and stress testing', 'ML-driven regime detection (risk-on/off)', 'Dynamic duration and credit hedging', 'Tail risk insurance via options overlays'],
  },
];

const philosophyPillars = [
  { icon: Brain, title: 'Systematic Over Discretionary', desc: 'Emotion-free decision-making through rules-based processes that are tested, validated, and continuously improved.' },
  { icon: Target, title: 'Risk-Adjusted Returns', desc: 'We optimize for Sharpe and Sortino ratios, not raw returns. Every basis point of return is evaluated against its risk cost.' },
  { icon: Cpu, title: 'Technology-First', desc: 'Purpose-built infrastructure processes data at scale, enabling real-time analytics and rapid strategy deployment.' },
  { icon: GitBranch, title: 'Continuous Research', desc: 'Dedicated quantitative research team constantly exploring new signals, methods, and market structures.' },
  { icon: Shield, title: 'Capital Preservation', desc: 'Downside protection is embedded in every strategy through systematic risk limits and dynamic hedging.' },
  { icon: Layers, title: 'Multi-Strategy Diversification', desc: 'Combining uncorrelated return streams across asset classes and strategy types for smoother compounding.' },
];

export default function ApproachPage() {
  const timelineRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.utils.toArray<HTMLElement>('.step-card').forEach((card, i) => {
        gsap.fromTo(card,
          { opacity: 0, x: i % 2 === 0 ? -30 : 30 },
          {
            opacity: 1, x: 0, duration: 0.8, ease: 'power2.out',
            scrollTrigger: { trigger: card, start: 'top 80%', toggleActions: 'play none none none' },
          }
        );
      });
    }, timelineRef);

    return () => ctx.revert();
  }, []);

  return (
    <main className="bg-white min-h-screen">
      {/* Hero */}
      <section className="bg-white border-b border-slate-100 pt-8 pb-16 px-6">
        <div className="max-w-7xl mx-auto">
          <ScrollReveal>
            <p className="text-sm font-semibold text-blue-600 uppercase tracking-wide mb-2">Our Approach</p>
            <h1 className="text-4xl md:text-5xl font-bold text-slate-900 mb-6 max-w-3xl leading-tight">
              At the Intersection of Technology, Data & Finance
            </h1>
            <p className="text-lg text-slate-600 max-w-2xl leading-relaxed">
              We believe that systematic, quantitative approaches to investing deliver superior risk-adjusted returns. Our process is transparent, repeatable, and continuously refined through rigorous research.
            </p>
          </ScrollReveal>
        </div>
      </section>

      {/* Methodology Timeline */}
      <section className="py-20 px-6 bg-white" ref={timelineRef}>
        <div className="max-w-5xl mx-auto">
          <ScrollReveal>
            <h2 className="text-3xl font-bold text-slate-900 mb-4 text-center">Investment Methodology</h2>
            <p className="text-slate-600 text-center mb-16 max-w-xl mx-auto">A systematic four-step pipeline that transforms raw data into optimized, risk-managed portfolios.</p>
          </ScrollReveal>

          <div className="relative">
            {/* Vertical line */}
            <div className="absolute left-1/2 top-0 bottom-0 w-px bg-slate-200 hidden md:block" />

            <div className="space-y-12">
              {methodologySteps.map((step, i) => {
                const Icon = step.icon;
                return (
                  <div key={step.title} className={`step-card flex flex-col md:flex-row items-start gap-8 ${i % 2 === 1 ? 'md:flex-row-reverse' : ''}`}>
                    <div className="flex-1">
                      <Card className="p-8 border border-slate-200">
                        <div className="flex items-center gap-3 mb-4">
                          <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center">
                            <Icon className="w-5 h-5 text-blue-600" />
                          </div>
                          <div>
                            <p className="text-xs font-semibold text-blue-600 uppercase tracking-wider">{step.subtitle}</p>
                            <h3 className="text-xl font-bold text-slate-900">{step.title}</h3>
                          </div>
                        </div>
                        <p className="text-slate-600 leading-relaxed mb-4">{step.description}</p>
                        <ul className="space-y-2">
                          {step.details.map((d) => (
                            <li key={d} className="flex items-start gap-2 text-sm text-slate-600">
                              <span className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-1.5 flex-shrink-0" />
                              {d}
                            </li>
                          ))}
                        </ul>
                      </Card>
                    </div>
                    {/* Center dot */}
                    <div className="hidden md:flex w-8 justify-center flex-shrink-0">
                      <div className="w-4 h-4 rounded-full bg-blue-600 border-4 border-white shadow-sm mt-10" />
                    </div>
                    <div className="flex-1 hidden md:block" />
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* Philosophy Pillars */}
      <section className="py-20 px-6 bg-slate-50 border-t border-slate-100">
        <div className="max-w-7xl mx-auto">
          <ScrollReveal>
            <h2 className="text-3xl font-bold text-slate-900 mb-4 text-center">Investment Philosophy</h2>
            <p className="text-slate-600 text-center mb-12 max-w-xl mx-auto">The core principles that guide every decision we make.</p>
          </ScrollReveal>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {philosophyPillars.map((pillar, i) => {
              const Icon = pillar.icon;
              return (
                <ScrollReveal key={pillar.title} delay={i * 80}>
                  <Card className="p-6 border border-slate-200 bg-white h-full">
                    <Icon className="w-8 h-8 text-blue-600 mb-4" />
                    <h3 className="text-lg font-bold text-slate-900 mb-2">{pillar.title}</h3>
                    <p className="text-sm text-slate-600 leading-relaxed">{pillar.desc}</p>
                  </Card>
                </ScrollReveal>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 px-6 bg-white border-t border-slate-100">
        <div className="max-w-3xl mx-auto text-center">
          <ScrollReveal>
            <h2 className="text-2xl font-bold text-slate-900 mb-4">See Our Approach in Action</h2>
            <p className="text-slate-600 mb-8">Explore our strategies to understand how these principles translate into real investment outcomes.</p>
            <Link href="/strategies" className="inline-flex items-center gap-2 bg-slate-900 text-white px-8 py-3.5 rounded-lg font-medium hover:bg-slate-800 transition-colors">
              View Strategies <ArrowRight className="w-4 h-4" />
            </Link>
          </ScrollReveal>
        </div>
      </section>
    </main>
  );
}