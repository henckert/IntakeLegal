import { COPY } from '../../lib/copy';

export default function SecurityPage() {
  const sections = [
    COPY.security.sections.overview,
    COPY.security.sections.dataHandling,
    COPY.security.sections.retention,
    COPY.security.sections.encryption,
    COPY.security.sections.hosting,
    COPY.security.sections.dpa,
    COPY.security.sections.contact,
  ];

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-4xl md:text-5xl font-bold text-text-main mb-4 font-heading">
        {COPY.security.heading}
      </h1>
      <p className="text-lg text-text-muted mb-12 font-body">
        {COPY.security.subtext}
      </p>
      
      <div className="space-y-8">
        {sections.map((section, idx) => (
          <section key={idx} className="bg-surface rounded-2xl shadow-md p-8 border border-border">
            <h2 className="text-2xl font-semibold text-text-main mb-4 font-heading">
              {COPY.security.sectionTitles[idx]}
            </h2>
            <p className="text-text-muted mb-4 font-body leading-relaxed">
              {section.content}
            </p>
            {('email' in section && section.email) && (
              <a 
                href={`mailto:${section.email}`} 
                className="text-accent hover:underline font-medium inline-flex items-center space-x-2"
              >
                <span>📧</span>
                <span>{section.email}</span>
              </a>
            )}
          </section>
        ))}
      </div>

      {/* CTA Section */}
      <div className="mt-12 bg-gradient-to-br from-primary to-primary-light text-white rounded-2xl shadow-lg p-8">
        <h3 className="text-2xl font-semibold mb-3 font-heading">Questions About Data Security?</h3>
        <p className="text-white/90 mb-6 font-body">
          Our team is happy to discuss our security practices and compliance measures in detail.
        </p>
        <a
          href="mailto:security@intakelegal.com"
          className="inline-block px-6 py-3 bg-white text-primary font-semibold rounded-xl hover:bg-background transition-colors shadow-md"
        >
          Contact Security Team
        </a>
      </div>
    </div>
  );
}
