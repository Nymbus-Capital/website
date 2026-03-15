import Link from 'next/link';

export function Footer() {
  return (
    <footer className="relative bg-white border-t border-slate-100">
      {/* Main Footer Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
          {/* Strategies Column */}
          <div>
            <h3 className="text-sm font-bold tracking-wider text-slate-900 mb-6">
              STRATEGIES
            </h3>
            <nav className="space-y-3 text-sm">
              <Link
                href="/strategies/multi-strategy"
                className="text-slate-500 hover:text-slate-700 transition-colors"
              >
                Multi-Strategy
              </Link>
              <br />
              <Link
                href="/strategies/sustainable-enhanced-bonds"
                className="text-slate-500 hover:text-slate-700 transition-colors"
              >
                Sustainable Enhanced Bonds
              </Link>
              <br />
              <Link
                href="/strategies/sustainable-enhanced-short-term-bonds"
                className="text-slate-500 hover:text-slate-700 transition-colors"
              >
                Sustainable Enhanced Short-Term Bonds
              </Link>
              <br />
              <Link
                href="/strategies/global-minimum-volatility"
                className="text-slate-500 hover:text-slate-700 transition-colors"
              >
                Global Minimum Volatility
              </Link>
            </nav>
          </div>

          {/* Company Column */}
          <div>
            <h3 className="text-sm font-bold tracking-wider text-slate-900 mb-6">
              COMPANY
            </h3>
            <nav className="space-y-3 text-sm">
              <Link
                href="/team"
                className="text-slate-500 hover:text-slate-700 transition-colors block"
              >
                Team
              </Link>
              <Link
                href="/sustainability"
                className="text-slate-500 hover:text-slate-700 transition-colors block"
              >
                Sustainability
              </Link>
              <Link
                href="/contact"
                className="text-slate-500 hover:text-slate-700 transition-colors block"
              >
                Contact
              </Link>
              <Link
                href="/legal"
                className="text-slate-500 hover:text-slate-700 transition-colors block"
              >
                Legal
              </Link>
            </nav>
          </div>

          {/* Connect Column */}
          <div>
            <h3 className="text-sm font-bold tracking-wider text-slate-900 mb-6">
              CONNECT
            </h3>
            <nav className="space-y-3 text-sm">
              <a
                href="tel:+1-416-555-0100"
                className="text-slate-500 hover:text-slate-700 transition-colors block"
              >
                +1 (416) 555-0100
              </a>
              <a
                href="mailto:hello@nymbus.com"
                className="text-slate-500 hover:text-slate-700 transition-colors block"
              >
                hello@nymbus.com
              </a>
            </nav>
          </div>
        </div>
      </div>

      {/* Bottom Section with Gradient Fade */}
      <div className="relative bg-gradient-to-b from-white via-white to-white border-t border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-4">
          <p className="text-xs text-slate-500">
            © 2026 Nymbus Capital Inc. All rights reserved.
          </p>
          <p className="text-xs leading-relaxed" style={{ color: '#cbd5e1' }}>
            This website is for informational purposes only and does not constitute an offer to sell or a solicitation to buy any security or investment product. Past performance is not indicative of future results. All investments involve risk, including possible loss of principal. Please read our legal disclaimer and privacy policy.
          </p>
        </div>
      </div>
    </footer>
  );
}