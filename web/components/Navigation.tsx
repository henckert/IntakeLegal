'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import Image from 'next/image';
import { COPY } from '../lib/copy';
import { BRAND } from '../lib/brand';

const navItems = [
  { name: COPY.nav.tryDemo, href: '/workspace' as const },
  { name: COPY.nav.myIntakes, href: '/intakes' as const },
  { name: COPY.nav.pricing, href: '/pricing' as const },
  { name: COPY.nav.security, href: '/security' as const },
  { name: COPY.nav.support, href: '/support' as const },
  { name: COPY.nav.about, href: '/about' as const }
];

export default function Navigation() {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <nav className="border-b border-white/20">
      <div className="mx-auto max-w-7xl px-6">
        {/* Desktop Navigation */}
        <div className="hidden md:flex md:items-center md:justify-between md:py-3">
          {/* Logo */}
          <Link href="/" className="flex-shrink-0">
            <Image
              src={BRAND.wordmark}
              alt="IntakeLegal"
              width={160}
              height={BRAND.logoHeight.header}
              priority
              className="h-8 w-auto"
            />
          </Link>

          <div className="flex items-center space-x-8">
            {navItems.map((item) => {
              const isActive = pathname === item.href || pathname?.startsWith(item.href + '/');
              return (
                <Link
                  key={item.name}
                  href={item.href as any}
                  className={`text-sm font-medium transition-colors hover:text-brand-accentYellow ${
                    isActive ? 'text-brand-accentYellow border-b-2 border-brand-accentYellow pb-1' : 'text-white/90'
                  }`}
                >
                  {item.name}
                </Link>
              );
            })}
          </div>

          <div>
            <Link href="/sign-in" className="text-sm font-medium text-white/90 hover:text-brand-accentYellow">
              {COPY.nav.signIn}
            </Link>
          </div>
        </div>

        {/* Mobile Navigation */}
        <div className="md:hidden">
          <div className="flex items-center justify-between py-3">
            {/* Mobile Logo */}
            <Link href="/" className="flex-shrink-0">
              <Image
                src={BRAND.wordmark}
                alt="IntakeLegal"
                width={120}
                height={24}
                priority
                className="h-6 w-auto"
              />
            </Link>

            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="text-white hover:text-accent2 transition-colors"
              aria-label="Toggle menu"
            >
              <svg
                className="h-6 w-6"
                fill="none"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                {mobileMenuOpen ? (
                  <path d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>

          {/* Mobile Menu */}
          {mobileMenuOpen && (
            <div className="pb-4 space-y-2">
              {navItems.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.name}
                    href={item.href as any}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`block px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                      isActive
                        ? 'bg-white/20 text-brand-accentYellow'
                        : 'text-white/90 hover:bg-white/10 hover:text-white'
                    }`}
                  >
                    {item.name}
                  </Link>
                );
              })}

              <div className="px-4">
                <Link href="/sign-in" className="text-sm font-medium text-white/90 hover:text-brand-accentYellow">
                  {COPY.nav.signIn}
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}
