import Link from 'next/link';
import { NymbusLogo } from './NymbusLogo';
import { MapPin, Phone, Mail, ArrowUpRight } from 'lucide-react';

const footerLinks = {
  Strategies: [
    { label: 'Sustainable Enhanced Bonds', href: '/strategies/sustainable-enhanced-bonds' },
    { label: 'Monthly Income', href: '/strategies/sustainable-enhanced-short-term-bonds' },
    { label: 'Multi-Strategy', href: '/strategies/multi-strategy' },
    { label: 'Global Min. Volatility', href: '/strategies/global-minimum-volatility' },
  ],
  Company: [
    { label: 'About & Team', href: '/team' },
    { label: 'Our Approach', href: '/approach' },
    { label: 'Sustainability', href: '/sustainability' },
    { label: 'Solutions', href: '/solutions' },
  ],
  Resources: [
    { label: 'Contact', href: '/contact' },
    { label: 'Privacy Policy', href: '/privacy' },
    { label: 'Legal', href: '/legal' },
  ],
};

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-slate-950 text-white relative overflow-hidden">
      {/* Subtle gradient accent */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-blue-500/50 to-transparent" />

      <div className="max-w-7xl mx-auto px-6 pt-20 pb-12">
        {/* Top section: Logo + Info */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-12 mb-16">
          <div className="lg:col-span-2">
            <NymbusLogo height={28} variant="light" className="mb-6" />
            <p className="text-slate-400 text-sm leading-relaxed mb-6 max-w-sm">
              Montreal-based quantitative investment firm delivering systematic fixed income and multi-asset strategies with scientific precision.
            </p>
            <div className="space-y-3 text-sm text-slate-400">
              <div className="flex items-start gap-2">
                <MapPin className="w-4 h-4 mt-0.5 text-blue-400 flex-shrink-0" />
                <span>1002 Sherbrooke West, Suite 1900<br />Montreal, QC H3A 3L6</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-blue-400" />
                <a href="tel:+15149851138" className="hover:text-white transition-colors">514-985-1138</a>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-blue-400" />
                <a href="mailto:info@nymbus.ca" className="hover:text-white transition-colors">info@nymbus.ca</a>
              </div>
            </div>
          </div>

          {Object.entries(footerLinks).map(([category, links]) => (
            <div key={category}>
              <h3 className="text-sm font-semibold text-white mb-4 uppercase tracking-wider">{category}</h3>
              <ul className="space-y-2.5">
                {links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-sm text-slate-400 hover:text-white transition-colors flex items-center gap-1 group"
                    >
                      {link.label}
                      <ArrowUpRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom section */}
        <div className="border-t border-white/10 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <p className="text-xs text-slate-500">&copy; {currentYear} Nymbus Capital Inc. All rights reserved.</p>
              <p className="text-xs text-slate-600 mt-2 max-w-lg leading-relaxed">
                This website is for informational purposes only and does not constitute investment advice, an offer to sell, or a solicitation to buy any security. Past performance is not indicative of future results.
              </p>
            </div>
            <div className="flex items-center gap-4">
              <a href="https://www.linkedin.com/company/nymbus-capital/" target="_blank" rel="noopener noreferrer" className="text-slate-500 hover:text-white transition-colors text-xs">
                LinkedIn
              </a>
              <span className="text-slate-700">|</span>
              <span className="text-xs text-slate-600">PRI Signatory</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}