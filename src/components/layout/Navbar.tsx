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
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);
  const pathname = usePathname();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const isActive = (href: string) => pathname === href;

  return (
    <>
      <style>{`
        @keyframes dock-float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-8px); }
        }

        .dock-float {
          animation: dock-float 3s ease-in-out infinite;
        }

        @keyframes scale-in-center {
          0% { transform: scale(1); }
          100% { transform: scale(1.15); }
        }

        .scale-icon {
          transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
        }

        .nav-item-tooltip {
          opacity: 0;
          transform: translateY(-8px);
          transition: all 0.3s ease;
          pointer-events: none;
        }

        .nav-item:hover .nav-item-tooltip {
          opacity: 1;
          transform: translateY(28px);
        }

        .nav-item-bg {
          transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
        }

        .nav-item:hover .nav-item-bg {
          transform: scaleX(1.2) scaleY(1.3);
        }

        .nav-item:hover .scale-icon {
          transform: scale(1.25);
        }
      `}</style>

      <nav className={cn(
        "fixed top-4 left-1/2 -translate-x-1/2 z-50 transition-all duration-500",
        "dock-float"
      )}>
        <div className={cn(
          "flex items-center gap-1 px-5 py-3 rounded-full border",
          "backdrop-blur-xl bg-white/70 border-white/30 shadow-lg",
          scrolled && "bg-white/80 border-white/40 shadow-2xl"
        )}>
          <Link href="/" className="flex-shrink-0 mr-2 hover:opacity-80 transition-opacity">
            <NymbusLogo height={20} variant="dark" />
          </Link>

          <div className="hidden lg:flex items-center gap-0.5">
            {navItems.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.href);
              
              return (
                <div
                  key={item.href}
                  className="nav-item relative"
                  onMouseEnter={() => setHoveredItem(item.href)}
                  onMouseLeave={() => setHoveredItem(null)}
                >
                  <div className="absolute inset-0 rounded-full nav-item-bg" />
                  
                  <Link
                    href={item.href}
                    className={cn(
                      "relative flex items-center gap-1.5 px-3 py-2 rounded-full text-sm font-medium transition-all duration-300",
                      active
                        ? "text-white z-10"
                        : "text-slate-600 hover:text-slate-900"
                    )}
                  >
                    <div className="relative">
                      <div className={cn(
                        "absolute inset-0 rounded-full transition-all duration-300",
                        active ? "bg-slate-900 scale-100" : "bg-slate-200 scale-0 group-hover:scale-100"
                      )} />
                      <Icon className={cn(
                        "w-4 h-4 relative scale-icon transition-transform duration-300",
                        active && "text-white"
                      )} />
                    </div>
                    <span className="relative">
                      {item.label}
                    </span>
                  </Link>

                  {active && (
                    <div className="absolute inset-0 rounded-full bg-slate-900 -z-10" />
                  )}

                  {hoveredItem === item.href && !active && (
                    <div className="absolute inset-0 rounded-full bg-slate-100 -z-10 animate-pulse" />
                  )}

                  <div className="nav-item-tooltip absolute top-full left-1/2 -translate-x-1/2 whitespace-nowrap mt-1">
                    <div className="bg-slate-900 text-white text-xs px-2.5 py-1 rounded-md shadow-lg">
                      {item.label}
                    </div>
                  </div>
                </div>
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