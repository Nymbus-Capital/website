'use client';

import { useRef, useEffect, useState, useMemo, ReactNode } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis,
  CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from 'recharts';
import {
  ArrowUpRight, ArrowDownRight, TrendingUp, Shield, Calendar,
  FileText, Download, ChevronRight, Info, DollarSign, BarChart3,
  PieChart as PieChartIcon, Clock, Target, Award, Building2,
  Globe, CreditCard, Percent, Users,
} from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { ScrollReveal } from '@/components/animations/ScrollReveal';
import AnimatedCounter from '@/components/animations/AnimatedCounter';
import { cn } from '@/lib/utils';
import type { Fund } from '@/data/funds';

gsap.registerPlugin(ScrollTrigger);

/* ──────────────────────────────────────────────────────────────
 * COLOR THEMES
 * ────────────────────────────────────────────────────────────── */
export interface FundTheme {
  primary: string;       // e.g. '#2563eb'
  primaryLight: string;  // e.g. '#dbeafe'
  primaryDark: string;   // e.g. '#1e40af'
  gradient: string;      // tailwind gradient class
  chartColors: string[];
  accentText: string;    // tailwind text class
  accentBg: string;      // tailwind bg class
  accentBorder: string;  // tailwind border class
  accentRing: string;    // tailwind ring class
}

export const themes: Record<string, FundTheme> = {
  blue: {
    primary: '#2563eb',
    primaryLight: '#dbeafe',
    primaryDark: '#1e40af',
    gradient: 'from-blue-600 to-blue-800',
    chartColors: ['#2563eb', '#3b82f6', '#60a5fa', '#93c5fd', '#bfdbfe', '#dbeafe'],
    accentText: 'text-blue-600',
    accentBg: 'bg-blue-600',
    accentBorder: 'border-blue-600',
    accentRing: 'ring-blue-600',
  },
  emerald: {
    primary: '#059669',
    primaryLight: '#d1fae5',
    primaryDark: '#047857',
    gradient: 'from-emerald-600 to-emerald-800',
    chartColors: ['#059669', '#10b981', '#34d399', '#6ee7b7', '#a7f3d0', '#d1fae5'],
    accentText: 'text-emerald-600',
    accentBg: 'bg-emerald-600',
    accentBorder: 'border-emerald-600',
    accentRing: 'ring-emerald-600',
  },
  violet: {
    primary: '#7c3aed',
    primaryLight: '#ede9fe',
    primaryDark: '#6d28d9',
    gradient: 'from-violet-600 to-violet-800',
    chartColors: ['#7c3aed', '#8b5cf6', '#a78bfa', '#c4b5fd', '#ddd6fe', '#ede9fe'],
    accentText: 'text-violet-600',
    accentBg: 'bg-violet-600',
    accentBorder: 'border-violet-600',
    accentRing: 'ring-violet-600',
  },
};

export interface FundDetailLayoutProps {
  fund: Fund;
  theme?: FundTheme;
  children?: ReactNode;
}

export default function FundDetailLayout({
  fund,
  theme = themes.blue,
  children,
}: FundDetailLayoutProps) {
  return (
    <div className="min-h-screen bg-slate-50">
      <HeroSection fund={fund} theme={theme} />
    </div>
  );
}

function HeroSection({ fund, theme }: { fund: Fund; theme: FundTheme }) {
  const titleRef = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    if (titleRef.current) {
      gsap.from(titleRef.current, {
        opacity: 0,
        y: 20,
        duration: 0.8,
        ease: 'power2.out',
      });
    }
  }, []);

  return (
    <div className={cn('relative bg-gradient-to-br text-white py-20 md:py-32')} style={{
      background: `linear-gradient(135deg, ${theme.primary} 0%, ${theme.primaryDark} 100%)`,
    }}>
      <div className="relative max-w-6xl mx-auto px-4 md:px-6 lg:px-8">
        <h1 ref={titleRef} className="text-5xl md:text-6xl font-bold mb-6 leading-tight">
          {fund.name}
        </h1>
        <p className="text-xl text-white/80 max-w-3xl leading-relaxed mb-12">
          {fund.description}
        </p>
      </div>
    </div>
  );
}