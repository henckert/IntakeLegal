import { COPY } from '../../lib/copy';

export default function AboutPage() {
  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-4xl md:text-5xl font-bold text-text-main mb-6 font-heading">
        {COPY.about.heading}
      </h1>

      <div className="space-y-8">
        {/* Mission */}
        <section className="bg-surface rounded-2xl shadow-md p-8 border border-border">
          <h2 className="text-2xl font-semibold text-text-main mb-4 font-heading">
            {COPY.about.mission.title}
          </h2>
          <p className="text-text-muted leading-relaxed font-body">
            {COPY.about.mission.content}
          </p>
        </section>

        {/* Gradient Divider */}
        <div className="h-px bg-gradient-to-r from-transparent via-border to-transparent"></div>

        {/* Why Choose IntakeLegal */}
        <section className="bg-surface rounded-2xl shadow-md p-8 border border-border">
          <h2 className="text-2xl font-semibold text-text-main mb-6 font-heading">
            {COPY.about.whyChoose.title}
          </h2>
          <ul className="space-y-4">
            {COPY.about.whyChoose.points.map((point: string, idx: number) => (
              <li key={idx} className="flex items-start space-x-3">
                <span className="text-accent text-2xl flex-shrink-0">✓</span>
                <span className="text-text-muted font-body">{point}</span>
              </li>
            ))}
          </ul>
        </section>

        {/* Gradient Divider */}
        <div className="h-px bg-gradient-to-r from-transparent via-border to-transparent"></div>

        {/* How It Works */}
        <section className="bg-surface rounded-2xl shadow-md p-8 border border-border">
          <h2 className="text-2xl font-semibold text-text-main mb-6 font-heading">
            {COPY.about.howItWorks.title}
          </h2>
          <div className="space-y-6">
            {COPY.about.howItWorks.steps.map((step: any, idx: number) => (
              <div key={idx} className="flex items-start space-x-4">
                <div className="flex-shrink-0 w-12 h-12 bg-accent text-white rounded-full flex items-center justify-center font-bold text-lg">
                  {idx + 1}
                </div>
                <div>
                  <h3 className="font-semibold text-text-main mb-2">{step.title}</h3>
                  <p className="text-text-muted font-body">{step.description}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* CTA */}
        <div className="text-center pt-6">
          <a
            href="/workspace"
            className="inline-block px-8 py-4 bg-accent text-white font-semibold rounded-xl hover:bg-primary-light transition-colors text-lg shadow-lg"
          >
            {COPY.cta.primary}
          </a>
        </div>
      </div>
    </div>
  );
}
