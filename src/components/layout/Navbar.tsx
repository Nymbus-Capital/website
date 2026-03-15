'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';

const navLinks = [
  { label: 'Solutions', href: '/solutions' },
  { label: 'Strategies', href: '/strategies' },
  { label: 'Sustainability', href: '/sustainability' },
  { label: 'Team', href: '/team' },
  { label: 'Contact', href: '/contact' },
];

export function Navbar() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const [hasScrolled, setHasScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setHasScrolled(window.scrollY > 50);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const isActive = (href: string) => {
    if (href === '/') return pathname === '/';
    return pathname.startsWith(href);
  };

  return (
    <nav
      className={cn(
        'fixed top-0 left-0 right-0 z-50 bg-white transition-all duration-300',
        hasScrolled && 'shadow-md'
      )}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 group">
            <span className="font-bold tracking-[0.3em] text-sm text-slate-900">
              NYMBUS
            </span>
            <div className="w-2 h-2 rounded-full bg-[#4285F4] group-hover:scale-125 transition-transform duration-200" />
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  'text-sm font-medium transition-colors duration-200',
                  isActive(link.href)
                    ? 'text-[#4285F4]'
                    : 'text-slate-600 hover:text-slate-900'
                )}
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Mobile Hamburger */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="md:hidden flex flex-col gap-1.5 w-6 h-6 justify-center items-center group"
          >
            <span
              className={cn(
                'w-5 h-0.5 bg-slate-900 transition-all duration-300 group-hover:bg-[#4285F4]',
                isOpen && 'rotate-45 translate-y-2'
              )}
            />
            <span
              className={cn(
                'w-5 h-0.5 bg-slate-900 transition-all duration-300 group-hover:bg-[#4285F4]',
                isOpen && 'opacity-0'
              )}
            />
            <span
              className={cn(
                'w-5 h-0.5 bg-slate-900 transition-all duration-300 group-hover:bg-[#4285F4]',
                isOpen && '-rotate-45 -translate-y-2'
              )}
            />
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="md:hidden border-t border-slate-100 bg-white"
          >
            <div className="px-4 py-4 space-y-3">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setIsOpen(false)}
                  className={cn(
                    'block px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200',
                    isActive(link.href)
                      ? 'bg-blue-50 text-[#4285F4]'
                      : 'text-slate-600 hover:bg-slate-50'
                  )}
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}