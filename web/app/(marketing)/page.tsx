import Button from '../../components/ui/Button';

export default function MarketingPage() {
  return (
    <>
      <section className="py-12">
        <div className="mx-auto max-w-5xl">
          <h1 className="heading-serif text-4xl font-semibold text-text-primary">IntakeLegal</h1>
          <p className="mt-3 max-w-2xl text-text-secondary">
            AI-powered client intake and triage for small law firms. Publish branded forms,
            auto-summarise submissions, estimate Statute of Limitations, and triage faster.
          </p>
          <div className="mt-6 flex gap-3">
            <a href="/builder">
              <Button>Open Form Builder</Button>
            </a>
            <a href="/intake/demo">
              <Button variant="outline">Try Demo Form</Button>
            </a>
          </div>
        </div>
      </section>

      <section className="py-10">
        <div className="mx-auto grid max-w-5xl grid-cols-1 gap-6 md:grid-cols-3">
          <div className="card p-6">
            <h3 className="heading-serif text-lg">Zero-Friction Builder</h3>
            <p className="mt-2 text-sm text-text-secondary">Presets and toggles to publish in minutes.</p>
          </div>
          <div className="card p-6">
            <h3 className="heading-serif text-lg">AI Triage</h3>
            <p className="mt-2 text-sm text-text-secondary">Summary, classification, follow-ups, and SOL.</p>
          </div>
          <div className="card p-6">
            <h3 className="heading-serif text-lg">Compliance-Friendly</h3>
            <p className="mt-2 text-sm text-text-secondary">GDPR consent and retention options baked in.</p>
          </div>
        </div>
      </section>
    </>
  );
}
