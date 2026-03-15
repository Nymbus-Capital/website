import type { Metadata } from 'next';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import '@/app/globals.css';

export const metadata: Metadata = {
  title: 'Nymbus Capital | Scientific Investing',
  description:
    'Nymbus Capital is Canada\'s premier quantitative bond shop, delivering systematic fixed income strategies with scientific precision.',
  metadataBase: new URL('https://nymbus.com'),
  openGraph: {
    title: 'Nymbus Capital | Scientific Investing',
    description:
      'Nymbus Capital is Canada\'s premier quantitative bond shop, delivering systematic fixed income strategies with scientific precision.',
    type: 'website',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-white text-slate-900 antialiased">
        <Navbar />
        <main className="pt-16">{children}</main>
        <Footer />
      </body>
    </html>
  );
}