'use client';

import { useRef, useEffect } from 'react';
import gsap from 'gsap';
import { ArrowUpRight, Brain, Zap, TrendingUp, Code2, Network, Microscope, Database } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { ScrollReveal } from '@/components/animations/ScrollReveal';
import { cn } from '@/lib/utils';

// Philosophy Card Component
const PhilosophyCard = ({
  icon: Icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) => {
  const cardRef = useRef<HTMLDivElement>(null);

  const handleHover = () => {
    if (!cardRef.current) return;
    gsap.to(cardRef.current, {
      y: -12,
      rotationX: 5,
      duration: 0.4,
      ease: 'power2.out',
    });
  };

  const handleHoverEnd = () => {
    if (!cardRef.current) return;
    gsap.to(cardRef.current, {
      y: 0,
      rotationX: 0,
      duration: 0.4,
      ease: 'power2.out',
    });
  };

  return (
    <div
      ref={cardRef}
      onMouseEnter={handleHover}
      onMouseLeave={handleHoverEnd}
      className="p-8 rounded-2xl bg-gradient-to-br from-gray-50 to-gray-100 border border-gray-200 hover:border-blue-500 cursor-pointer transition-all duration-300 group"
      style={{ perspective: '1000px' }}
    >
      <div className="flex items-start gap-4 mb-4">
        <div className="w-12 h-12 rounded-lg bg-blue-500 flex items-center justify-center flex-shrink-0 text-white group-hover:bg-blue-600 transition-colors">
          {Icon}
        </div>
      </div>
      <h3 className="text-2xl font-bold text-gray-900 mb-3">{title}</h3>
      <p className="text-gray-600 leading-relaxed">{description}</p>
    </div>
  );
};

// Process Step Component
const ProcessStep = ({
  number,
  title,
  bullets,
  icon: Icon,
}: {
  number: number;
  title: string;
  bullets: string[];
  icon: React.ReactNode;
}) => {
  return (
    <div className="relative">
      <div className="p-6 rounded-xl bg-white border border-gray-200 hover:border-blue-500 transition-colors">
        <div className="absolute -top-5 -left-5 w-10 h-10 rounded-full bg-blue-500 text-white flex items-center justify-center font-bold text-sm">
          {number}
        </div>
        <div className="flex items-start gap-3 mb-4">
          <div className="w-8 h-8 text-blue-500 flex-shrink-0">{Icon}</div>
          <h4 className="text-lg font-semibold text-gray-900">{title}</h4>
        </div>
        <ul className="space-y-2">
          {bullets.map((bullet, i) => (
            <li key={i} className="text-sm text-gray-600 flex items-start gap-2">
              <span className="text-blue-500 mt-1">•</span>
              <span>{bullet}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

// Animated connecting lines between process steps
const ProcessConnector = () => {
  const svgRef = useRef<SVGSVGElement>(null);
  const pathRef = useRef<SVGPathElement>(null);

  useEffect(() => {
    if (!pathRef.current || !svgRef.current) return;

    // Calculate line animation
    const length = pathRef.current.getTotalLength();
    gsap.fromTo(
      pathRef.current,
      { strokeDashoffset: length, strokeDasharray: length },
      {
        strokeDashoffset: 0,
        duration: 2,
        ease: 'power2.inOut',
      }
    );
  }, []);

  return (
    <svg
      ref={svgRef}
      className="absolute top-0 left-0 w-full h-full pointer-events-none"
      style={{ height: '200px' }}
      preserveAspectRatio="none"
    >
      <path
        ref={pathRef}
        d="M 0,100 Q 100,50 200,100 T 400,100 T 600,100 T 800,100"
        stroke="url(#gradient)"
        strokeWidth="2"
        fill="none"
      />
      <defs>
        <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#4285f4" stopOpacity="0" />
          <stop offset="50%" stopColor="#4285f4" stopOpacity="1" />
          <stop offset="100%" stopColor="#4285f4" stopOpacity="0" />
        </linearGradient>
      </defs>
    </svg>
  );
};

// Technology Stack Card
const TechCard = ({
  title,
  description,
  icon: Icon,
}: {
  title: string;
  description: string;
  icon: React.ReactNode;
}) => {
  const cardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && cardRef.current) {
          gsap.to(cardRef.current, {
            opacity: 1,
            y: 0,
            duration: 0.8,
            ease: 'power2.out',
          });
        }
      },
      { threshold: 0.1 }
    );

    if (cardRef.current) {
      observer.observe(cardRef.current);
    }

    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={cardRef}
      className="p-8 rounded-xl bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200 opacity-0"
      style={{ transform: 'translateY(20px)' }}
    >
      <div className="flex items-center gap-3 mb-3">
        <div className="w-8 h-8 text-blue-600">{Icon}</div>
        <h4 className="font-semibold text-gray-900">{title}</h4>
      </div>
      <p className="text-sm text-gray-700">{description}</p>
    </div>
  );
};

// Dot grid background
const DotGrid = () => {
  return (
    <div className="absolute inset-0 opacity-10 pointer-events-none">
      <div
        className="w-full h-full"
        style={{
          backgroundImage:
            'radial-gradient(circle, #4285f4 1px, transparent 1px)',
          backgroundSize: '40px 40px',
        }}
      />
    </div>
  );
};

export default function ApproachPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="relative py-28 md:py-36 px-4 sm:px-6 lg:px-8 overflow-hidden">
        <DotGrid />

        {/* Floating particles */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {Array.from({ length: 5 }).map((_, i) => (
            <div
              key={i}
              className="absolute w-2 h-2 rounded-full bg-blue-400 opacity-20"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animation: `float ${3 + i}s ease-in-out infinite`,
              }}
            />
          ))}
        </div>

        <div className="max-w-7xl mx-auto relative z-10">
          <div className="space-y-6 max-w-3xl">
            <h1 className="text-6xl md:text-7xl font-bold bg-gradient-to-r from-blue-600 to-blue-400 bg-clip-text text-transparent leading-tight">
              Scientific Investing
            </h1>
            <p className="text-2xl text-gray-600 leading-relaxed">
              Where quantitative research meets institutional investment management
            </p>
          </div>
        </div>

        <style jsx>{`
          @keyframes float {
            0%, 100% { transform: translateY(0) translateX(0); }
            25% { transform: translateY(-20px) translateX(10px); }
            50% { transform: translateY(-40px) translateX(-10px); }
            75% { transform: translateY(-20px) translateX(10px); }
          }
        `}</style>
      </section>

      {/* Philosophy Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-7xl mx-auto space-y-12">
          <ScrollReveal>
            <div>
              <SectionHeader
                title="Our Philosophy"
                description="Three core pillars that drive our investment approach"
              />
            </div>
          </ScrollReveal>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <ScrollReveal>
              <PhilosophyCard
                icon={<Brain className="w-6 h-6" />}
                title="Data-Driven"
                description="We process billions of data points across fixed income markets, credit spreads, yield curves, and macroeconomic indicators"
              />
            </ScrollReveal>

            <ScrollReveal>
              <PhilosophyCard
                icon={<Zap className="w-6 h-6" />}
                title="Systematic"
                description="Rules-based portfolio construction removes emotional bias, ensuring consistent execution across all market conditions"
              />
            </ScrollReveal>

            <ScrollReveal>
              <PhilosophyCard
                icon={<TrendingUp className="w-6 h-6" />}
                title="Adaptive"
                description="Machine learning models classify market regimes in real-time, dynamically adjusting strategy parameters"
              />
            </ScrollReveal>
          </div>
        </div>
      </section>

      {/* Process Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gray-50">
        <div className="max-w-7xl mx-auto space-y-12">
          <ScrollReveal>
            <div>
              <SectionHeader
                title="Our Process"
                description="A systematic investment pipeline from research to execution"
              />
            </div>
          </ScrollReveal>

          <ScrollReveal>
            <div className="relative">
              <div className="grid grid-cols-1 md:grid-cols-5 gap-6 relative z-10">
                <ProcessStep
                  number={1}
                  title="Data Ingestion"
                  icon={<Database className="w-5 h-5" />}
                  bullets={[
                    'Aggregate market data from 50+ sources',
                    'Real-time processing of 1M+ data points',
                    'Cross-validation and quality checks',
                  ]}
                />

                <ProcessStep
                  number={2}
                  title="Signal Generation"
                  icon={<Code2 className="w-5 h-5" />}
                  bullets={[
                    'Extract predictive signals from patterns',
                    'Regime classification algorithms',
                    'Factor decomposition models',
                  ]}
                />

                <ProcessStep
                  number={3}
                  title="Portfolio Construction"
                  icon={<Network className="w-5 h-5" />}
                  bullets={[
                    'Optimal weight allocation',
                    'Correlation analysis',
                    'Constraint management',
                  ]}
                />

                <ProcessStep
                  number={4}
                  title="Risk Management"
                  icon={<Microscope className="w-5 h-5" />}
                  bullets={[
                    'Stress testing across scenarios',
                    'Value-at-risk calculations',
                    'Diversification monitoring',
                  ]}
                />

                <ProcessStep
                  number={5}
                  title="Execution"
                  icon={<TrendingUp className="w-5 h-5" />}
                  bullets={[
                    'Algorithmic trading optimization',
                    'Liquidity-aware execution',
                    'Performance tracking',
                  ]}
                />
              </div>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* Technology Stack Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-7xl mx-auto space-y-12">
          <ScrollReveal>
            <div>
              <SectionHeader
                title="Technology Stack"
                description="Enterprise-grade infrastructure powering our systematic approach"
              />
            </div>
          </ScrollReveal>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <ScrollReveal>
              <TechCard
                icon={<Brain className="w-5 h-5" />}
                title="Machine Learning"
                description="Deep learning models for pattern recognition, anomaly detection, and predictive analytics"
              />
            </ScrollReveal>

            <ScrollReveal>
              <TechCard
                icon={<Code2 className="w-5 h-5" />}
                title="Statistical Modeling"
                description="Advanced econometric methods including GARCH, VAR, and copula models"
              />
            </ScrollReveal>

            <ScrollReveal>
              <TechCard
                icon={<Zap className="w-5 h-5" />}
                title="Real-Time Analytics"
                description="Sub-millisecond latency processing with streaming data pipelines"
              />
            </ScrollReveal>

            <ScrollReveal>
              <TechCard
                icon={<Network className="w-5 h-5" />}
                title="Cloud Infrastructure"
                description="Scalable distributed computing across multi-region cloud deployments"
              />
            </ScrollReveal>
          </div>
        </div>
      </section>

      {/* Research Culture Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-gray-50 to-white">
        <div className="max-w-4xl mx-auto">
          <ScrollReveal>
            <div className="space-y-8">
              <SectionHeader
                title="Research Culture"
                description="Driven by academic rigor and decades of market experience"
              />

              <Card className="p-12 bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200">
                <div className="space-y-6">
                  <p className="text-lg text-gray-800 leading-relaxed">
                    Our team includes <span className="font-semibold">PhDs in physics and mathematics</span>,{' '}
                    <span className="font-semibold">financial engineers</span>, and{' '}
                    <span className="font-semibold">seasoned portfolio managers</span> with combined experience
                    exceeding 200 years in capital markets.
                  </p>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-6">
                    <div className="p-6 bg-white rounded-lg">
                      <h4 className="font-semibold text-gray-900 mb-2">Quantitative Excellence</h4>
                      <p className="text-sm text-gray-600">
                        Rigorous peer-reviewed research methodology applied to investment strategy development
                      </p>
                    </div>

                    <div className="p-6 bg-white rounded-lg">
                      <h4 className="font-semibold text-gray-900 mb-2">Market Expertise</h4>
                      <p className="text-sm text-gray-600">
                        Navigated multiple market cycles, credit crises, and macroeconomic shocks
                      </p>
                    </div>

                    <div className="p-6 bg-white rounded-lg">
                      <h4 className="font-semibold text-gray-900 mb-2">Continuous Learning</h4>
                      <p className="text-sm text-gray-600">
                        Ongoing research in machine learning, alternative data, and emerging market opportunities
                      </p>
                    </div>

                    <div className="p-6 bg-white rounded-lg">
                      <h4 className="font-semibold text-gray-900 mb-2">Collaborative Approach</h4>
                      <p className="text-sm text-gray-600">
                        Cross-disciplinary teams combining academia, technology, and finance
                      </p>
                    </div>
                  </div>

                  <div className="pt-4">
                    <a
                      href="/team"
                      className="inline-flex items-center text-blue-600 font-semibold hover:text-blue-700"
                    >
                      Meet our team <ArrowUpRight className="ml-2 w-4 h-4" />
                    </a>
                  </div>
                </div>
              </Card>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* Track Record Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-4xl mx-auto">
          <ScrollReveal>
            <div className="space-y-12">
              <SectionHeader
                title="Proven Track Record"
                description="Tested through multiple market cycles and stress scenarios"
              />

              <Card className="p-12 bg-gradient-to-br from-gray-50 to-gray-100 border border-gray-200">
                <div className="space-y-8">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    <div className="text-center">
                      <p className="text-4xl font-bold text-blue-600 mb-2">10+</p>
                      <p className="text-gray-700 font-medium">Years of Track Record</p>
                    </div>

                    <div className="text-center border-l border-r border-gray-300">
                      <p className="text-4xl font-bold text-blue-600 mb-2">$1.5B+</p>
                      <p className="text-gray-700 font-medium">Assets Under Management</p>
                    </div>

                    <div className="text-center">
                      <p className="text-4xl font-bold text-blue-600 mb-2">4</p>
                      <p className="text-gray-700 font-medium">Market Cycle Tests</p>
                    </div>
                  </div>

                  <div className="pt-6 border-t border-gray-300">
                    <p className="text-lg text-gray-800 leading-relaxed">
                      Our systematic approach has been rigorously tested and proven effective through:
                    </p>
                    <ul className="mt-4 space-y-3 text-gray-700">
                      <li className="flex items-start gap-3">
                        <span className="text-blue-600 font-bold mt-1">•</span>
                        <span>COVID-19 pandemic and sharp market recovery</span>
                      </li>
                      <li className="flex items-start gap-3">
                        <span className="text-blue-600 font-bold mt-1">•</span>
                        <span>Federal Reserve rate hiking cycle and yield curve inversions</span>
                      </li>
                      <li className="flex items-start gap-3">
                        <span className="text-blue-600 font-bold mt-1">•</span>
                        <span>Credit market stress events and widening spreads</span>
                      </li>
                      <li className="flex items-start gap-3">
                        <span className="text-blue-600 font-bold mt-1">•</span>
                        <span>Geopolitical shocks and macro regime shifts</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </Card>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* Bottom CTA */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-blue-500 to-blue-600">
        <div className="max-w-4xl mx-auto text-center space-y-8">
          <ScrollReveal>
            <div>
              <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">Ready to invest systematically?</h2>
              <p className="text-xl text-blue-100 max-w-2xl mx-auto">
                Discover how our research-driven approach can optimize your portfolio
              </p>
            </div>
          </ScrollReveal>

          <ScrollReveal>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href="/strategies"
                className="inline-flex items-center justify-center px-8 py-4 rounded-lg bg-white text-blue-600 font-semibold hover:bg-blue-50 transition-colors"
              >
                Explore Strategies <ArrowUpRight className="ml-2 w-5 h-5" />
              </a>
              <a
                href="/solutions"
                className="inline-flex items-center justify-center px-8 py-4 rounded-lg border border-white text-white font-semibold hover:bg-blue-700 transition-colors"
              >
                Tailored Solutions <ArrowUpRight className="ml-2 w-5 h-5" />
              </a>
            </div>
          </ScrollReveal>
        </div>
      </section>
    </div>
  );
}