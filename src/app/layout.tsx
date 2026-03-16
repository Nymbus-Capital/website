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
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700&display=swap" rel="stylesheet" />
      </head>
      <body className="bg-white text-slate-900 antialiased" style={{ fontFamily: "'Poppins', system-ui, sans-serif" }}>
        <Navbar />
        <main className="pt-16">{children}</main>
        <Footer />
      </body>
    </html>
  );
}