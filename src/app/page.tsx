'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { Card } from '@/components/ui/Card';
import { ScrollReveal } from '@/components/animations/ScrollReveal';
import TypewriterEffect from '@/components/animations/TypewriterEffect';
import AnimatedCounter from '@/components/animations/AnimatedCounter';
import { funds } from '@/data/funds';
import { formatPercent } from '@/lib/utils';
import { TrendingUp, BarChart3, Shield, ArrowRight, Newspaper, Calendar, ChevronRight, Database, Zap, Layout, Lock } from 'lucide-react';
import gsap from 'gsap';

const newsItems = [
  { date: '2024', title: 'Nymbus Capital Reaches $1 Billion in Assets Under Management', category: 'Milestone', description: 'A significant milestone reflecting institutional trust and investment excellence.' },
  { date: '2023', title: 'Launch of Sustainable Bond Funds with Fondaction', category: 'Product Launch', description: 'New sustainable bond fund collaboration focused on ESG-forward fixed income investing.' },
  { date: '2023', title: 'Machine Learning Integration in Market Regime Classification', category: 'Innovation', description: 'Cutting-edge ML models now drive dynamic asset allocation across strategies.' },
  { date: '2023', title: 'Zero Fossil Fuel Achievement in Credit Portfolio', category: 'ESG', description: 'Full elimination of fossil fuel exposure from credit holdings, leading Canadian fixed income managers.' },
  { date: '2022', title: 'New Institutional Mandate with FMOQ', category: 'Growth', description: "Awarded mandate from the Quebec medical professionals' investment fund." },
  { date: '2020', title: 'Historic Three-Firm Merger', category: 'Milestone', description: 'Union of Nymbus Capital (2013), Gestion de portefeuille Landry (2002), and Perseus Capital (2005).' },
];

// Investment Capabilities Pipeline Component
function InvestmentCapabilities() {