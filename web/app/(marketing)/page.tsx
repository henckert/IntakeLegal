"use client";

import Button from '../../components/ui/Button';
import Link from 'next/link';
import { COPY } from '../../lib/copy';
import { telemetry } from '../../lib/telemetry';

export default function MarketingPage() {
  return (
    <>
      {/* Unified Hero Section */}
      <section className="relative py-20 bg-brand-gradient overflow-hidden">
        <div className="mx-auto max-w-5xl relative z-10 px-6">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6 font-heading">
            {COPY.home?.hero?.heading || 'IntakeLegal'}
          </h1>
          <p className="text-lg md:text-xl text-white/90 max-w-3xl mb-8 font-body">
            {COPY.home?.hero?.subtext || 'AI-powered client intake and triage for small law firms.'}
          </p>
          <div className="flex flex-col sm:flex-row gap-4">
            <Link href="/builder">
              <Button
                onClick={() => telemetry.track(COPY.events?.heroCta?.uploadClicked || 'hero_cta_clicked')}
                className="bg-brand-accentYellow text-brand-primaryDark hover:bg-brand-accentYellow2 font-medium px-8 py-4 rounded-xl shadow-lg transition-all hover:shadow-xl hover:scale-105"
              >
                {COPY.cta?.primary || 'Get Started'}
              </Button>
            </Link>
            <Link href="/intake/demo">
              <Button variant="outline" className="bg-white text-brand-primary hover:bg-surface border-2 border-white font-medium px-8 py-4 rounded-xl shadow-md transition-all">
                {COPY.home?.hero?.secondaryCta || 'Try Demo Form'}
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Combined Features Section */}
      <section className="py-16 bg-brand-backgroundSoft">
        <div className="mx-auto grid max-w-6xl grid-cols-1 gap-8 md:grid-cols-3 px-6">
          {COPY.home?.features?.length
            ? COPY.home.features.map((feature: any, idx: number) => (
                <div key={idx} className="bg-white rounded-2xl shadow-md hover:shadow-lg transition-shadow p-8 border border-brand-borderSoft">
                  <h3 className="text-xl font-bold text-brand-primaryDark mb-3 font-heading">{feature.title}</h3>
                  <p className="text-brand-textMuted font-body">{feature.description}</p>
                </div>
              ))
            : [
                { title: 'Zero-Friction Builder', description: 'Presets and toggles to publish in minutes.' },
                { title: 'AI Triage', description: 'Summary, classification, follow-ups, and SOL.' },
                { title: 'Compliance-Friendly', description: 'GDPR consent & retention baked in.' }
              ].map((feature, idx) => (
                <div key={idx} className="card p-6">
                  <h3 className="heading-serif text-lg">{feature.title}</h3>
                  <p className="mt-2 text-sm text-text-secondary">{feature.description}</p>
                </div>
              ))}
        </div>
      </section>
    </>
  );
}
