import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
});

export const metadata: Metadata = {
  title: 'CommitGuard | Embedded Pre-Commitment Interceptor',
  description:
    'Track 3: Payments & Embedded Finance — Deterministic trade-off clarity at the exact moment of financial commitment.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={inter.variable}>
      <body className={`${inter.className} antialiased bg-slate-100 text-slate-900`}>
        <div className="relative min-h-screen flex flex-col bg-slate-100">
          {/* Subtle ambient lighting effects */}
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-brand-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute top-1/3 right-1/4 w-96 h-96 bg-accent-emerald/10 rounded-full blur-3xl pointer-events-none" />

          {/* Main content viewport */}
          <main className="relative z-10 flex-1">{children}</main>

          {/* Mandatory compliance safe-harbor footer */}
          <footer className="relative z-10 border-t border-white/5 py-6 px-4 text-center text-xs text-slate-500">
            <div className="max-w-5xl mx-auto space-y-2">
              <p>
                🛡️ <strong>CommitGuard Safe-Harbor Notice:</strong> Provides deterministic mathematical trade-off simulations and objective statutory translations for educational clarity. CommitGuard is not a SEBI-registered investment advisor and does not provide financial recommendations or product placement.
              </p>
              <p className="text-slate-600">
                100% On-Device Privacy Guaranteed • Zero Telemetry • Pure Deterministic Math Engine (&lt;5ms)
              </p>
            </div>
          </footer>
        </div>
      </body>
    </html>
  );
}
