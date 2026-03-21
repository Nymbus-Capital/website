'use client';

import Link from 'next/link';
import { NymbusLogo } from './NymbusLogo';
import { MapPin, Phone, Mail, ArrowUpRight } from 'lucide-react';
import { useTranslation } from '@/lib/i18n';

export function Footer() {
  const { t, locale } = useTranslation();
  const fr = locale === 'fr';
  const currentYear = new Date().getFullYear();

  const footerLinks = {
    [fr ? 'Stratégies' : 'Strategies']: [
      { label: fr ? 'Obligations durables bonifiées' : 'Sustainable Enhanced Bonds', href: '/strategies/sustainable-enhanced-bonds' },
      { label: fr ? 'Revenu Mensuel' : 'Monthly Income', href: '/strategies/sustainable-enhanced-short-term-bonds' },
      { label: fr ? 'Multi-stratégies' : 'Multi-Strategy', href: '/strategies/multi-strategy' },
      { label: fr ? 'Global Min. Volatilité' : 'Global Min. Volatility', href: '/strategies/global-minimum-volatility' },
    ],
    [fr ? 'Entreprise' : 'Company']: [
      { label: fr ? 'À propos et équipe' : 'About & Team', href: '/team' },
      { label: fr ? 'Notre approche' : 'Our Approach', href: '/approach' },
      { label: fr ? 'Développement durable' : 'Sustainability', href: '/sustainability' },
      { label: 'Solutions', href: '/solutions' },
    ],
    [fr ? 'Ressources' : 'Resources']: [
      { label: 'Contact', href: '/contact' },
      { label: fr ? 'Politique de confidentialité' : 'Privacy Policy', href: '/privacy' },
      { label: fr ? 'Juridique' : 'Legal', href: '/legal' },
    ],
  };

  return (
    <footer className="bg-white text-slate-900 relative overflow-hidden">
      <style>{`
        @keyframes gradient-shimmer {
          0% { background-position: -1000px 0; }
          100% { background-position: 1000px 0; }
        }
        .animated-gradient-line {
          background: linear-gradient(90deg, transparent 0%, rgb(59, 130, 246) 25%, rgb(59, 130, 246) 75%, transparent 100%);
          background-size: 1000px 100%;
          animation: gradient-shimmer 3s infinite;
          height: 2px;
        }
      `}</style>

      <div className="animated-gradient-line" />
      <div className="border-t border-slate-100" />

      <div className="max-w-7xl mx-auto px-6 pt-20 pb-12">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-12 mb-16">
          <div className="lg:col-span-2">
            <NymbusLogo height={28} variant="dark" className="mb-6" />
            <p className="text-slate-600 text-sm leading-relaxed mb-6 max-w-sm">
              {t('footer.description')}
            </p>
            <div className="space-y-3 text-sm text-slate-600">
              <div className="flex items-start gap-2">
                <MapPin className="w-4 h-4 mt-0.5 text-blue-500 flex-shrink-0" />
                <span>{t('footer.address')}</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-blue-500" />
                <a href="tel:+15149851138" className="hover:text-slate-900 transition-colors">{t('footer.phone')}</a>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-blue-500" />
                <a href="mailto:info@nymbus.ca" className="hover:text-slate-900 transition-colors">{t('footer.email')}</a>
              </div>
            </div>
          </div>

          {Object.entries(footerLinks).map(([category, links]) => (
            <div key={category}>
              <h3 className="text-sm font-semibold text-slate-900 mb-4 uppercase tracking-wider">{category}</h3>
              <ul className="space-y-2.5">
                {links.map((link) => (
                  <li key={link.href}>
                    <Link href={link.href} className="text-sm text-slate-600 hover:text-blue-500 transition-colors flex items-center gap-1 group">
                      {link.label}
                      <ArrowUpRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="border-t border-slate-200 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <p className="text-xs text-slate-500">&copy; {currentYear} {t('footer.copyright')}</p>
              <p className="text-xs text-slate-600 mt-2 max-w-lg leading-relaxed">{t('footer.disclaimer')}</p>
            </div>
            <div className="flex items-center gap-4">
              <a href="https://www.linkedin.com/company/nymbus-capital/" target="_blank" rel="noopener noreferrer" className="text-slate-500 hover:text-blue-500 transition-colors text-xs">
                LinkedIn
              </a>
              <span className="text-slate-300">|</span>
              <span className="text-xs text-slate-600">{fr ? 'Signataire des PRI' : 'PRI Signatory'}</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
