import '../styles/globals.css';
import { Inter, DM_Serif_Display } from 'next/font/google';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });
const dmSerif = DM_Serif_Display({ subsets: ['latin'], weight: '400', variable: '--font-dm-serif' });
export const metadata = {
  title: 'IntakeLegal',
  description: 'AI-powered client intake for law firms',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={`${inter.variable} ${dmSerif.variable} min-h-screen bg-background text-text-primary`}>
        <header className="header-gradient text-white">
          <div className="mx-auto max-w-5xl px-6 py-4">
            <a href="/" className="font-bold text-xl" style={{ fontFamily: 'var(--font-dm-serif), serif' }}>IntakeLegal</a>
          </div>
        </header>
        <main className="mx-auto max-w-5xl px-6 py-6">{children}</main>
      </body>
    </html>
  );
}
