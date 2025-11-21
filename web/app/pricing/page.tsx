import { COPY } from '../../lib/copy';

export default function PricingPage() {
  const plans = [
    {
      name: COPY.pricing.plans.free.name,
      price: '€0',
      period: '/month',
      description: COPY.pricing.plans.free.description,
      features: COPY.pricing.plans.free.features,
      cta: 'Get Started',
      ctaLink: '/sign-up',
      highlighted: false
    },
    {
      name: COPY.pricing.plans.professional.name,
      price: '€99',
      period: '/month',
      description: COPY.pricing.plans.professional.description,
      features: COPY.pricing.plans.professional.features,
      cta: 'Start Free Trial',
      ctaLink: '/sign-up?plan=professional',
      highlighted: true
    },
    {
      name: COPY.pricing.plans.enterprise.name,
      price: 'Custom',
      period: '',
      description: COPY.pricing.plans.enterprise.description,
      features: COPY.pricing.plans.enterprise.features,
      cta: 'Contact Sales',
      ctaLink: 'mailto:sales@intakelegal.com',
      highlighted: false
    }
  ];

  return (
    <div className="max-w-7xl mx-auto">
      <div className="text-center mb-12">
        <h1 className="text-4xl md:text-5xl font-bold text-text-main mb-4 font-heading">
          {COPY.pricing.heading}
        </h1>
        <p className="text-lg text-text-muted max-w-2xl mx-auto font-body">
          {COPY.pricing.subtext}
        </p>
      </div>

      <div className="grid md:grid-cols-3 gap-8">
        {plans.map((plan, idx) => (
          <div
            key={idx}
            className={`relative bg-surface rounded-2xl shadow-md p-8 border-2 transition-all hover:shadow-xl ${
              plan.highlighted
                ? 'border-2 border-transparent bg-gradient-to-br from-accent/10 to-primary/10 transform md:-translate-y-2'
                : 'border-border'
            }`}
          >
            {plan.highlighted && (
              <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-accent text-white px-4 py-1 rounded-full text-sm font-semibold shadow-md">
                Most Popular
              </div>
            )}

            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold text-text-main mb-2 font-heading">{plan.name}</h2>
              <p className="text-text-muted text-sm mb-4">{plan.description}</p>
              <div className="flex items-baseline justify-center">
                <span className="text-5xl font-bold text-text-main">{plan.price}</span>
                <span className="text-text-muted ml-1">{plan.period}</span>
              </div>
            </div>

            <ul className="space-y-3 mb-8">
              {plan.features.map((feature: string, featureIdx: number) => (
                <li key={featureIdx} className="flex items-start space-x-3">
                  <span className="text-accent text-xl flex-shrink-0">✓</span>
                  <span className="text-text-muted">{feature}</span>
                </li>
              ))}
            </ul>

            <a
              href={plan.ctaLink}
              className={`block w-full text-center py-3 rounded-xl font-semibold transition-colors shadow-md ${
                plan.highlighted
                  ? 'bg-accent text-white hover:bg-primary-light'
                  : 'bg-background text-text-main hover:bg-border/30 border border-border'
              }`}
            >
              {plan.cta}
            </a>
          </div>
        ))}
      </div>

      {/* Features Comparison */}
      <div className="mt-16 bg-surface rounded-2xl shadow-md p-8 border border-border">
        <h2 className="text-2xl font-semibold text-text-main mb-6 text-center font-heading">
          All Plans Include
        </h2>
        <div className="grid md:grid-cols-3 gap-6">
          <div className="text-center">
            <div className="text-4xl mb-3">🔒</div>
            <h3 className="font-semibold text-text-main mb-2">Bank-Level Security</h3>
            <p className="text-text-muted text-sm">End-to-end encryption and GDPR compliance</p>
          </div>
          <div className="text-center">
            <div className="text-4xl mb-3">⚡</div>
            <h3 className="font-semibold text-text-main mb-2">Lightning Fast</h3>
            <p className="text-text-muted text-sm">Process intakes in under 60 seconds</p>
          </div>
          <div className="text-center">
            <div className="text-4xl mb-3">🎯</div>
            <h3 className="font-semibold text-text-main mb-2">95%+ Accuracy</h3>
            <p className="text-text-muted text-sm">AI extraction trained on real legal intakes</p>
          </div>
        </div>
      </div>

      {/* FAQ Link */}
      <div className="mt-8 text-center">
        <p className="text-text-muted">
          Have questions?{' '}
          <a href="/support" className="text-accent hover:underline font-semibold">
            Visit our Help Centre
          </a>
        </p>
      </div>
    </div>
  );
}
