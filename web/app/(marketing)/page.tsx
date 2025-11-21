'use client';

import Button from '../../components/ui/Button';
import Link from 'next/link';
import { COPY } from '../../lib/copy';
import { telemetry } from '../../lib/telemetry';

export default function MarketingPage() {
  return (
    <>
      {/* Hero Section with Gradient */}
      <section className="relative py-20 bg-gradient-to-r from-[#0C3C78] to-[#135A9E] overflow-hidden">
        <div className="absolute inset-0 opacity-10 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAxMCAwIEwgMCAwIDAgMTAiIGZpbGw9Im5vbmUiIHN0cm9rZT0id2hpdGUiIHN0cm9rZS13aWR0aD0iMSIvPjwvcGF0dGVybj48L2RlZnM+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0idXJsKCNncmlkKSIvPjwvc3ZnPg==')]"></div>
        
        <div className="mx-auto max-w-5xl relative z-10 px-6">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6 font-heading">
            {COPY.home.hero.heading}
          </h1>
          <p className="text-lg md:text-xl text-white/90 max-w-3xl mb-8 font-body">
            {COPY.home.hero.subtext}
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4">
            <Link href="/workspace">
              <Button 
                onClick={() => telemetry.track(COPY.events.heroCta.uploadClicked)}
                className="bg-accent text-white hover:bg-primary-light font-medium px-8 py-4 rounded-xl shadow-lg transition-all hover:shadow-xl hover:scale-105"
              >
                {COPY.cta.primary}
              </Button>
            </Link>
            <Link href="/pricing">
              <Button 
                variant="outline"
                className="bg-white text-primary hover:bg-background font-medium px-8 py-4 rounded-xl shadow-md transition-all"
              >
                {COPY.home.hero.secondaryCta}
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-background">
        <div className="mx-auto grid max-w-6xl grid-cols-1 gap-8 md:grid-cols-3 px-6">
          {COPY.home.features.map((feature, idx) => (
            <div key={idx} className="bg-surface rounded-2xl shadow-md hover:shadow-lg transition-shadow p-8 border border-border">
              <h3 className="text-xl font-bold text-text-main mb-3 font-heading">{feature.title}</h3>
              <p className="text-text-muted font-body">{feature.description}</p>
            </div>
          ))}
        </div>
      </section>
    </>
  );
}
