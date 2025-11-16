import '../styles/globals.css';
import { Inter, DM_Serif_Display } from 'next/font/google';
import { ClerkProvider } from '@clerk/nextjs';
import Navigation from '../components/Navigation';
import { BRAND } from '../lib/brand';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });
const dmSerif = DM_Serif_Display({ subsets: ['latin'], weight: '400', variable: '--font-dm-serif' });

export const metadata = {
  title: 'IntakeLegal — AI-Powered Client Intake for Law Firms',
  description: 'Automate client intake, summaries, and limitation analysis with GDPR-compliant AI.',
  icons: {
    icon: [
      { url: BRAND.favicon.svg, type: 'image/svg+xml' },
      { url: BRAND.favicon.ico, sizes: '32x32', type: 'image/x-icon' },
    ],
    shortcut: BRAND.favicon.ico,
    apple: BRAND.favicon.ico,
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const isLocal = process.env.NEXT_PUBLIC_APP_ENV === 'local';
  const publishableKey = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY || process.env.CLERK_PUBLISHABLE_KEY;
  return (
    <html lang="en">
      <body className={`${inter.variable} ${dmSerif.variable} min-h-screen bg-background text-text-primary`}>
        {isLocal || !publishableKey ? (
          <>
            <header className="header-gradient text-white">
              <div className="mx-auto max-w-7xl px-6 py-4">
                <a href="/" className="font-bold text-2xl" style={{ fontFamily: 'var(--font-dm-serif), serif' }}>IntakeLegal</a>
              </div>
              <Navigation />
            </header>
            <main className="mx-auto max-w-7xl px-6 py-8">{children}</main>
          </>
        ) : (
          <ClerkProvider publishableKey={publishableKey}>
            <header className="header-gradient text-white">
              <div className="mx-auto max-w-7xl px-6 py-4">
                <a href="/" className="font-bold text-2xl" style={{ fontFamily: 'var(--font-dm-serif), serif' }}>IntakeLegal</a>
              </div>
              <Navigation />
            </header>
            <main className="mx-auto max-w-7xl px-6 py-8">{children}</main>
          </ClerkProvider>
        )}
      </body>
    </html>
  );
}
