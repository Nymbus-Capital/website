import Link from 'next/link';

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-white border-t border-slate-100">
      <div className="max-w-7xl mx-auto px-6 py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
          <div>
            <h3 className="font-semibold text-slate-900 mb-4">About</h3>
            <p className="text-sm text-slate-500 leading-relaxed">
              Nymbus Capital is Canada's premier quantitative bond shop, delivering systematic fixed income strategies.
            </p>
          </div>

          <div>
            <h3 className="font-semibold text-slate-900 mb-4">Strategies</h3>
            <ul className="space-y-3">
              <li>
                <Link href="/strategies" className="text-sm text-slate-500 hover:text-slate-900 transition-colors">
                  Fixed Income
                </Link>
              </li>
              <li>
                <Link href="/strategies" className="text-sm text-slate-500 hover:text-slate-900 transition-colors">
                  Quantitative
                </Link>
              </li>
              <li>
                <Link href="/strategies" className="text-sm text-slate-500 hover:text-slate-900 transition-colors">
                  Research
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold text-slate-900 mb-4">Company</h3>
            <ul className="space-y-3">
              <li>
                <Link href="/team" className="text-sm text-slate-500 hover:text-slate-900 transition-colors">
                  Team
                </Link>
              </li>
              <li>
                <Link href="/careers" className="text-sm text-slate-500 hover:text-slate-900 transition-colors">
                  Careers
                </Link>
              </li>
              <li>
                <Link href="/sustainability" className="text-sm text-slate-500 hover:text-slate-900 transition-colors">
                  Sustainability
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold text-slate-900 mb-4">Connect</h3>
            <ul className="space-y-3">
              <li>
                <Link href="/contact" className="text-sm text-slate-500 hover:text-slate-900 transition-colors">
                  Contact
                </Link>
              </li>
              <li>
                <a href="mailto:info@nymbus.com" className="text-sm text-slate-500 hover:text-slate-900 transition-colors">
                  Email
                </a>
              </li>
              <li>
                <a href="#" className="text-sm text-slate-500 hover:text-slate-900 transition-colors">
                  LinkedIn
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-slate-100 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 text-xs text-slate-500">
            <div>
              <p>&copy; {currentYear} Nymbus Capital. All rights reserved.</p>
              <p className="mt-2 text-xs text-slate-400 leading-relaxed max-w-md">
                This website is for informational purposes only and does not constitute investment advice or an offer to sell or solicitation to buy any security.
              </p>
            </div>
            <div className="flex gap-6">
              <Link href="/privacy" className="hover:text-slate-900 transition-colors">
                Privacy
              </Link>
              <Link href="/legal" className="hover:text-slate-900 transition-colors">
                Legal
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}