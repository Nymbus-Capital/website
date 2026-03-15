"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { funds } from "@/data/funds";
import BackgroundBeams from "@/components/animations/BackgroundBeams";
import AnimatedCounter from "@/components/animations/AnimatedCounter";
import { Card } from "@/components/ui/Card";
import { ScrollReveal } from "@/components/animations/ScrollReveal";
import { InvestorLogos } from "@/components/animations/InvestorLogos";

export default function Home() {
  const stats = [
    { value: 1.5, suffix: "B+", label: "AUM" },
    { value: 12, suffix: "+", label: "Years" },
    { value: 14, suffix: "", label: "Professionals" },
    { value: 4, suffix: "", label: "Strategies" },
  ];

  const segments = [
    {
      id: "institutional",
      title: "Institutional Investors",
      description: "Direct access to sophisticated strategies with institutional minimums and dedicated support.",
      link: "/solutions#institutional",
      icon: "🏛️",
    },
    {
      id: "family-office",
      title: "Family Offices",
      description: "Customized solutions for multi-generational wealth management and portfolio optimization.",
      link: "/solutions#family-office",
      icon: "👨‍👩‍👧‍👦",
    },
    {
      id: "advisors",
      title: "Investment Advisors",
      description: "Comprehensive platform tools and research support for advisor recommendations.",
      link: "/solutions#advisors",
      icon: "📊",
    },
  ];

  const featuredFunds = funds.slice(0, 3);

  return (
    <main className="w-full overflow-hidden">
      {/* Hero Section */}
      <section className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden px-4 py-20">
        <BackgroundBeams />
        <div className="absolute inset-0 z-0" />

        <div className="relative z-10 max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h1 className="text-6xl md:text-8xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-blue-600 via-blue-400 to-cyan-400 text-shimmer">
              Scientific Investing
            </h1>
          </motion.div>

          <motion.p
            className="text-xl md:text-2xl text-gray-300 mb-8 max-w-2xl mx-auto"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            Systematic fixed income & managed futures overlays designed for institutional excellence
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
          >
            <Link
              href="/strategies"
              className="inline-block px-8 py-4 bg-gradient-to-r from-blue-600 to-cyan-400 text-white font-semibold rounded-lg hover:shadow-lg hover:shadow-blue-500/50 transition-all duration-300 transform hover:scale-105"
            >
              Explore Strategies
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Stats Section */}
      <ScrollReveal>
        <section className="py-20 px-4 bg-gradient-to-b from-gray-950 to-gray-900">
          <div className="max-w-6xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {stats.map((stat, index) => (
                <motion.div
                  key={index}
                  className="text-center"
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  viewport={{ once: true }}
                >
                  <div className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent mb-2">
                    <AnimatedCounter target={stat.value} />
                    {stat.suffix}
                  </div>
                  <p className="text-gray-400 text-lg">{stat.label}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      </ScrollReveal>

      {/* Featured Strategies Section */}
      <ScrollReveal>
        <section className="py-20 px-4 bg-gray-900">
          <div className="max-w-6xl mx-auto">
            <motion.div
              className="mb-12"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
            >
              <h2 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
                Featured Strategies
              </h2>
              <p className="text-gray-400 text-lg">
                Explore our core investment strategies designed for consistent performance
              </p>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {featuredFunds.map((fund, index) => (
                <motion.div
                  key={fund.slug}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  viewport={{ once: true }}
                >
                  <Link href={`/strategies/${fund.slug}`}>
                    <Card className="h-full hover:shadow-lg hover:shadow-blue-500/20 transition-all duration-300 cursor-pointer transform hover:-translate-y-1">
                      <div className="p-6">
                        <div className="inline-block px-3 py-1 bg-blue-500/20 text-blue-400 rounded-full text-sm font-semibold mb-4">
                          {fund.assetClass}
                        </div>
                        <h3 className="text-2xl font-bold text-white mb-2">{fund.shortName}</h3>
                        <p className="text-gray-300 mb-6 text-sm leading-relaxed">
                          {fund.description.substring(0, 120)}...
                        </p>
                        <div className="space-y-3 text-sm">
                          <div className="flex justify-between">
                            <span className="text-gray-400">1-Year Return</span>
                            <span className="text-cyan-400 font-semibold">{fund.returns.oneYear.toFixed(1)}%</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-400">Since Inception</span>
                            <span className="text-cyan-400 font-semibold">
                              {fund.returns.sinceInception.toFixed(1)}%
                            </span>
                          </div>
                          {fund.sharpe && (
                            <div className="flex justify-between">
                              <span className="text-gray-400">Sharpe Ratio</span>
                              <span className="text-cyan-400 font-semibold">{fund.sharpe.toFixed(2)}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </Card>
                  </Link>
                </motion.div>
              ))}
            </div>

            <motion.div
              className="mt-12 text-center"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              viewport={{ once: true }}
            >
              <Link
                href="/strategies"
                className="inline-block px-6 py-3 border border-blue-500 text-blue-400 font-semibold rounded-lg hover:bg-blue-500/10 transition-all duration-300"
              >
                View All Strategies
              </Link>
            </motion.div>
          </div>
        </section>
      </ScrollReveal>

      {/* Investor Logos Section */}
      <ScrollReveal>
        <section className="py-20 px-4 bg-gradient-to-b from-gray-900 to-gray-950">
          <div className="max-w-6xl mx-auto">
            <motion.div
              className="mb-12 text-center"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
            >
              <h2 className="text-4xl font-bold text-white mb-4">Trusted by Leading Investors</h2>
              <p className="text-gray-400">Join a community of institutional investors and advisors</p>
            </motion.div>
            <InvestorLogos />
          </div>
        </section>
      </ScrollReveal>

      {/* Segment Selector Section */}
      <ScrollReveal>
        <section className="py-20 px-4 bg-gray-950">
          <div className="max-w-6xl mx-auto">
            <motion.div
              className="mb-12 text-center"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
            >
              <h2 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
                Tailored Solutions
              </h2>
              <p className="text-gray-400 text-lg">
                Discover how Nymbus Capital serves your investment needs
              </p>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {segments.map((segment, index) => (
                <motion.div
                  key={segment.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  viewport={{ once: true }}
                >
                  <Link href={segment.link}>
                    <Card className="h-full hover:shadow-lg hover:shadow-blue-500/20 transition-all duration-300 cursor-pointer transform hover:-translate-y-1 bg-gradient-to-br from-gray-900 to-gray-800 border border-gray-700">
                      <div className="p-8">
                        <div className="text-5xl mb-4">{segment.icon}</div>
                        <h3 className="text-2xl font-bold text-white mb-3">{segment.title}</h3>
                        <p className="text-gray-300 mb-6 leading-relaxed">{segment.description}</p>
                        <div className="flex items-center text-blue-400 font-semibold group">
                          Learn more
                          <span className="ml-2 group-hover:translate-x-1 transition-transform">→</span>
                        </div>
                      </div>
                    </Card>
                  </Link>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      </ScrollReveal>
    </main>
  );
}