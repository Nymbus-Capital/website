'use client';

import { useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Zap, BarChart3, Shield, Workflow, Code2 } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { ScrollReveal } from '@/components/animations/ScrollReveal';
import { cn } from '@/lib/utils';

gsap.registerPlugin(ScrollTrigger);

function PhilosophyCard({ icon: Icon, title, description }: { icon: any; title: string; description: string }) {
  return (
    <Card className="relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-blue-50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      <div className="relative p-8">
        <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
          <Icon className="w-6 h-6 text-blue-600" />
        </div>
        <h3 className="text-xl font-bold text-slate-900 mb-3">{title}</h3>
        <p className="text-slate-600 leading-relaxed">{description}</p>
      </div>
    </Card>
  );
}

function ProcessStep({
  number,
  title,
  description,
  icon: Icon,
}: {
  number: number;
  title: string;
  description: string;
  icon: any;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5 }}
      className="relative"
    >
      <Card className="h-full">
        <div className="p-8">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-blue-700 rounded-lg flex items-center justify-center text-white font-bold text-lg">
              {number}
            </div>
            <Icon className="w-6 h-6 text-blue-600" />
          </div>
          <h3 className="text-lg font-bold text-slate-900 mb-2">{title}</h3>
          <p className="text-slate-600">{description}</p>
        </div>
      </Card>
    </motion.div>
  );
}

function ProcessConnector() {
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    const svg = svgRef.current;
    if (!svg) return;

    const line = svg.querySelector('line');
    if (!line) return;

    gsap.from(line, {
      strokeDashoffset: 200,
      duration: 1.5,
      ease: 'power2.out',
      scrollTrigger: {
        trigger: svg,
        start: 'top 60%',
        toggleActions: 'play none none none',
      },
    });
  }, []);

  return (
    <svg
      ref={svgRef}
      className="w-1 h-20 mx-auto hidden md:block"
      viewBox="0 0 1 80"
      preserveAspectRatio="none"
    >
      <line
        x1="0.5"
        y1="0"
        x2="0.5"
        y2="80"
        stroke="url(#gradient)"
        strokeWidth="2"
        strokeDasharray="200"
        strokeLinecap="round"
      />
      <defs>
        <linearGradient id="gradient" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stopColor="#2563eb" stopOpacity="0" />
          <stop offset="50%" stopColor="#2563eb" />
          <stop offset="100%" stopColor="#2563eb" stopOpacity="0" />
        </linearGradient>
      </defs>
    </svg>
  );
}

function TechCard({ icon: Icon, title }: { icon: any; title: string }) {
  return (
    <motion.div
      whileHover={{ scale: 1.05 }}
      className="flex items-center gap-3 p-4 bg-slate-50 rounded-lg border border-slate-200 hover:border-blue-300 transition-colors"
    >
      <Icon className="w-5 h-5 text-blue-600" />
      <span className="font-semibold text-slate-900">{title}</span>
    </motion.div>
  );
}

function DotGrid() {
  return (
    <div className="absolute inset-0 bg-gradient-to-b from-white via-slate-50 to-white opacity-50 pointer-events-none">
      <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <pattern id="dots" x="40" y="40" width="80" height="80" patternUnits="userSpaceOnUse">
            <circle cx="40" cy="40" r="1" fill="#cbd5e1" opacity="0.5" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#dots)" />
      </svg>
    </div>
  );
}

export default function ApproachPage() {
  const philosophy = [
    {
      icon: Zap,
      title: 'Data-Driven',
      description: 'Every investment decision is grounded in rigorous quantitative analysis and historical data patterns.',
    },
    {
      icon: Workflow,
      title: 'Systematic',
      description: 'Our processes are rule-based and disciplined, removing emotion from investment decisions.',
    },
    {
      icon: Shield,
      title: 'Adaptive',
      description: 'Our strategies evolve continuously to incorporate new insights and respond to changing market conditions.',
    },
  ];

  const process = [
    {
      number: 1,
      title: 'Data Ingestion',
      description: 'We aggregate and process vast amounts of market data, fundamental information, and alternative datasets.',
      icon: BarChart3,
    },
    {
      number: 2,
      title: 'Signal Generation',
      description: 'Our quantitative models generate investment signals by identifying patterns and anomalies in the data.',
      icon: Zap,
    },
    {
      number: 3,
      title: 'Portfolio Construction',
      description: 'We optimize portfolio weights to balance expected returns with risk constraints and diversification.',
      icon: Workflow,
    },
    {
      number: 4,
      title: 'Risk Management',
      description: 'Real-time monitoring and stress testing ensure we maintain appropriate risk exposures across portfolios.',
      icon: Shield,
    },
    {
      number: 5,
      title: 'Execution',
      description: 'We execute trades systematically while minimizing market impact and transaction costs.',
      icon: Code2,
    },
  ];

  const technology = [
    'Machine Learning',
    'Statistical Modeling',
    'Real-Time Analytics',
    'Cloud Infrastructure',
    'API Integration',
    'Data Science',
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="py-20 md:py-32 bg-gradient-to-br from-blue-600 to-blue-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <ScrollReveal>
            <div className="text-center text-white">
              <h1 className="text-5xl md:text-6xl font-bold mb-6">Our Investment Approach</h1>
              <p className="text-xl text-blue-100 max-w-2xl mx-auto">
                A systematic, data-driven process that combines rigorous quantitative analysis with disciplined risk management.
              </p>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* Philosophy Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <ScrollReveal>
            <SectionHeader
              eyebrow="Core Philosophy"
              title="Three Pillars of Our Process"
              description="Our investment philosophy is built on three core principles that guide every decision we make."
            />
          </ScrollReveal>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-16">
            {philosophy.map((item, idx) => (
              <ScrollReveal key={item.title} delay={idx * 100}>
                <PhilosophyCard {...item} />
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* Process Section */}
      <section className="py-20 bg-slate-50 relative overflow-hidden">
        <DotGrid />
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <ScrollReveal>
            <SectionHeader
              eyebrow="Investment Pipeline"
              title="Our 5-Step Process"
              description="A systematic approach that transforms raw data into consistent investment performance."
            />
          </ScrollReveal>
          <div className="mt-20">
            {process.map((step, idx) => (
              <div key={step.number}>
                <div className="md:flex items-center gap-8">
                  <div className="md:flex-1">
                    <ProcessStep {...step} />
                  </div>
                </div>
                {idx < process.length - 1 && <ProcessConnector />}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Technology Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <ScrollReveal>
            <SectionHeader
              eyebrow="Technical Foundation"
              title="Our Technology Stack"
              description="We leverage cutting-edge technologies to power our systematic investment strategies."
            />
          </ScrollReveal>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-16">
            {technology.map((tech) => (
              <ScrollReveal key={tech}>
                <TechCard icon={Code2} title={tech} />
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* Track Record Section */}
      <section className="py-20 bg-gradient-to-r from-blue-600 to-blue-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center text-white mb-12">
            <h2 className="text-4xl font-bold mb-4">Proven Track Record</h2>
            <p className="text-lg text-blue-100">
              Our systematic approach has delivered consistent performance across market cycles.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { label: 'Strategies Launched', value: '4' },
              { label: 'Average Annual Return', value: '8.5%' },
              { label: 'Downside Capture Ratio', value: '60%' },
            ].map((stat) => (
              <ScrollReveal key={stat.label}>
                <div className="text-center">
                  <div className="text-4xl font-bold text-white mb-2">{stat.value}</div>
                  <p className="text-blue-100">{stat.label}</p>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}