'use client';

import { useState } from 'react';
import { COPY } from '../../lib/copy';

export default function SupportPage() {
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-4xl md:text-5xl font-bold text-text-main mb-6 font-heading">
        {COPY.support.heading}
      </h1>

      <div className="space-y-8">
        {/* Getting Started */}
        <section className="bg-surface rounded-2xl shadow-md p-8 border border-border">
          <h2 className="text-2xl font-semibold text-text-main mb-4 font-heading">
            {COPY.support.gettingStarted.title}
          </h2>
          <ol className="space-y-3 text-text-muted list-decimal list-inside font-body">
            {COPY.support.gettingStarted.steps.map((step: string, idx: number) => (
              <li key={idx} dangerouslySetInnerHTML={{ __html: step.replace(
                /\[(.+?)\]\((.+?)\)/g, 
                '<a href="$2" class="text-accent hover:underline">$1</a>'
              )}} />
            ))}
          </ol>
        </section>

        {/* FAQ */}
        <section className="bg-surface rounded-2xl shadow-md p-8 border border-border">
          <h2 className="text-2xl font-semibold text-text-main mb-6 font-heading">
            Frequently Asked Questions
          </h2>
          <div className="space-y-4">
            {COPY.support.faqs.map((faq: any, idx: number) => (
              <div key={idx} className="border-b border-border last:border-0 pb-4 last:pb-0">
                <button
                  onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                  className="w-full flex items-center justify-between text-left py-2 hover:text-accent transition-colors group"
                >
                  <span className="font-semibold text-text-main">{faq.question}</span>
                  <svg
                    className={`w-5 h-5 text-accent transition-transform duration-200 ${openFaq === idx ? 'rotate-180' : ''}`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                {openFaq === idx && (
                  <p className="text-text-muted mt-3 pl-4 border-l-2 border-accent font-body">
                    {faq.answer}
                  </p>
                )}
              </div>
            ))}
          </div>
        </section>

        {/* Contact */}
        <section className="bg-gradient-to-br from-primary to-primary-light text-white rounded-2xl shadow-lg p-8">
          <h2 className="text-2xl font-semibold mb-4 font-heading">
            {COPY.support.contact.title}
          </h2>
          <p className="mb-6 text-white/90 font-body">
            {COPY.support.contact.content}
          </p>
          <div className="space-y-3">
            <div className="flex items-center space-x-3">
              <span className="text-xl">📧</span>
              <a href={`mailto:${COPY.support.contact.email}`} className="hover:underline">
                {COPY.support.contact.email}
              </a>
            </div>
            <div className="flex items-center space-x-3">
              <span className="text-xl">💬</span>
              <span>Live chat available Mon-Fri, 9am-5pm GMT</span>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
