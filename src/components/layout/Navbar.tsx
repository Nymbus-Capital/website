'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { NymbusLogo } from './NymbusLogo';
import { BarChart3, Compass, Users, Briefcase, Leaf, Mail, Menu, X } from 'lucide-react';
import { cn } from '@/lib/utils';

const navItems = [
  { label: 'Strategies', href: '/strategies', icon: BarChart3 },
  { label: 'Approach', href: '/approach', icon: Compass },
  { label: 'About', href: '/team', icon: Users },
  { label: 'Solutions', href: '/solutions', icon: Briefcase },
  { label: 'Sustainability', href: '/sustainability', icon: Leaf },
  { label: 'Contact', href: '/contact', icon: Mail },
];

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const isActive = (href: string) => pathname === href;

  return (
    <>
      <nav className={cn(
        "fixed top-4 left-1/2 -translate-x-1/2 z-50 transition-all duration-500",
        "rounded-2xl border border-white/20 shadow-lg",
        scrolled
          ? "bg-white/90 backdrop-blur-xl shadow-xl border-slate-200/50"
          : "bg-white/70 backdrop-blur-lg"
      )}>
        <div className="flex items-center gap-1 px-4 py-2.5">
          <Link href="/" className="flex-shrink-0 mr-4 hover:opacity-80 transition-opacity">
            <NymbusLogo height={22} variant="dark" />
          </Link>

          <div className="hidden lg:flex items-center gap-0.5">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "relative flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-sm font-medium transition-all duration-200",
                    isActive(item.href)
                      ? "bg-slate-900 text-white shadow-md"
                      : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                  )}
                >
                  <Icon className="w-3.5 h-3.5" />
                  {item.label}
                </Link>
              );
            })}
          </div>

          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="lg:hidden ml-2 p-1.5 text-slate-600 hover:text-slate-900 rounded-lg hover:bg-slate-100 transition-colors"
            aria-label="Menu"
          >
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </nav>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div className="absolute inset-0 bg-black/20 backdrop-blur-sm" onClick={() => setMobileOpen(false)} />
          <div className="absolute top-20 left-4 right-4 bg-white rounded-2xl shadow-2xl border border-slate-200 p-4">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileOpen(false)}
                  className={cn(
                    "flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors",
                    isActive(item.href)
                      ? "bg-slate-900 text-white"
                      : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                  )}
                >
                  <Icon className="w-4 h-4" />
                  {item.label}
                </Link>
              );
            })}
          </div>
        </div>
      )}
    </>
  );
}