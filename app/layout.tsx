import './globals.css';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'PriceCraft — Pricing Decision Lab',
  description: 'Explainable pricing analytics and scenario planning from your own sales data.'
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return <html lang="en"><body>{children}</body></html>;
}
