"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Stepper from "@/components/Stepper";
import Card from "@/components/Card";
import Tooltip from "@/components/Tooltip";
import Input from "@/components/ui/Input";
import TextArea from "@/components/ui/TextArea";
import Select from "@/components/ui/Select";
import Button from "@/components/ui/Button";
import { apiPost } from "@/lib/api";

const CLAIM_TYPES = [
  "Personal Injury",
  "Defamation",
  "Contract",
  "Negligence",
  "Family",
  "Conveyancing",
  "Commercial",
  "Employment",
];

const STEPS = ["Your details", "Case info", "Consent", "Review"];

export default function IntakePage({ params }: { params: { slug: string } }) {
  const router = useRouter();
  const { slug } = params;

  const [step, setStep] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<{ intakeId: string } | null>(null);

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");

  const [claimType, setClaimType] = useState<string>("");
  const [eventDate, setEventDate] = useState("");
  const [location, setLocation] = useState("");
  const [narrative, setNarrative] = useState("");

  const [consent, setConsent] = useState(false);

  const canNext = useMemo(() => {
    if (step === 0) return firstName && lastName && email;
    if (step === 1) return claimType && narrative.length > 20;
    if (step === 2) return consent;
    return true;
  }, [step, firstName, lastName, email, claimType, narrative, consent]);

  const next = () => setStep((s: number) => Math.min(STEPS.length - 1, s + 1));
  const prev = () => setStep((s: number) => Math.max(0, s - 1));

  async function handleSubmit() {
    setSubmitting(true);
    setError(null);
    try {
      const body = {
        slug,
        client: { firstName, lastName, email, phone },
        case: { claimType, eventDate, location, narrative },
        consent: { gdpr: consent, consentText: DEFAULT_GDPR_TEXT },
      };

      const useMock = process.env.NEXT_PUBLIC_APP_ENV === "mock" || slug === "demo";
      let res: any;
      if (useMock) {
        // Simulate network latency
        await new Promise((r) => setTimeout(r, 600));
        res = { intakeId: `mock-${Date.now()}` };
      } else {
        res = await apiPost<{ intakeId: string }>(`/api/intake/${slug}/submit`, body);
      }
      setSuccess({ intakeId: res.intakeId });
      // Optionally navigate to a success route later
      // router.push(`/intake/${slug}/success?intakeId=${res.intakeId}`)
    } catch (e: any) {
      setError(e?.message ?? "Submission failed");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="mx-auto max-w-2xl p-6">
      <header className="mb-6">
        <h1 className="text-2xl font-semibold text-text-primary">Client Intake</h1>
        <p className="text-sm text-text-secondary">Securely share the details of your matter.</p>
      </header>

      <Stepper steps={STEPS} current={Math.min(step, STEPS.length - 1)} className="mb-6" />

      <Card className="p-6">
        {success ? (
          <div className="text-center">
            <h2 className="mb-2 text-xl font-semibold text-text-primary">Thank you</h2>
            <p className="mb-4 text-text-secondary">
              Your information has been submitted successfully. Your reference is
              <span className="font-mono"> {success.intakeId}</span>.
            </p>
            <Button onClick={() => router.push("/")} className="mt-2">Return home</Button>
          </div>
        ) : (
          <div className="space-y-6">
            {step === 0 && (
              <section className="space-y-4">
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <div>
                    <label className="mb-1 block text-sm font-medium text-text-primary">First name</label>
                    <Input value={firstName} onChange={(e) => setFirstName(e.target.value)} placeholder="Jane" />
                  </div>
                  <div>
                    <label className="mb-1 block text-sm font-medium text-text-primary">Last name</label>
                    <Input value={lastName} onChange={(e) => setLastName(e.target.value)} placeholder="Doe" />
                  </div>
                </div>
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <div>
                    <label className="mb-1 block text-sm font-medium text-text-primary">Email</label>
                    <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="jane@example.com" />
                  </div>
                  <div>
                    <label className="mb-1 block text-sm font-medium text-text-primary">Phone</label>
                    <Input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+353 87 123 4567" />
                  </div>
                </div>
              </section>
            )}

            {step === 1 && (
              <section className="space-y-4">
                <div>
                  <label className="mb-1 block text-sm font-medium text-text-primary">Claim type</label>
                  <Select value={claimType} onChange={(e) => setClaimType(e.target.value)}>
                    <option value="">Select a category</option>
                    {CLAIM_TYPES.map((t) => (
                      <option key={t} value={t}>
                        {t}
                      </option>
                    ))}
                  </Select>
                </div>
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <div>
                    <div className="mb-1 flex items-center gap-2">
                      <label className="text-sm font-medium text-text-primary">Event date</label>
                      <Tooltip text="When did the key event occur? This helps calculate limitation periods.">
                        <span className="cursor-help text-xs text-text-secondary">(why?)</span>
                      </Tooltip>
                    </div>
                    <Input type="date" value={eventDate} onChange={(e) => setEventDate(e.target.value)} />
                  </div>
                  <div>
                    <label className="mb-1 block text-sm font-medium text-text-primary">Location</label>
                    <Input value={location} onChange={(e) => setLocation(e.target.value)} placeholder="City / County" />
                  </div>
                </div>
                <div>
                  <div className="mb-1 flex items-center gap-2">
                    <label className="text-sm font-medium text-text-primary">What happened?</label>
                    <Tooltip text="Please include key facts, dates, and any parties involved.">
                      <span className="cursor-help text-xs text-text-secondary">(tips)</span>
                    </Tooltip>
                  </div>
                  <TextArea rows={6} value={narrative} onChange={(e) => setNarrative(e.target.value)} placeholder="Describe your situation..." />
                </div>
              </section>
            )}

            {step === 2 && (
              <section className="space-y-4">
                <div className="rounded-2xl bg-slate-50 p-4 text-sm leading-relaxed text-text-secondary">
                  {DEFAULT_GDPR_TEXT}
                </div>
                <label className="flex items-center gap-3 text-sm text-text-primary">
                  <input type="checkbox" className="h-4 w-4" checked={consent} onChange={(e) => setConsent(e.target.checked)} />
                  I agree to the above and consent to processing my data.
                </label>
              </section>
            )}

            {step === 3 && (
              <section className="space-y-4">
                <div className="rounded-2xl border border-slate-200 p-4">
                  <h3 className="mb-2 font-medium text-text-primary">Review</h3>
                  <ul className="space-y-1 text-sm text-text-secondary">
                    <li>
                      <span className="font-medium text-text-primary">Name:</span> {firstName} {lastName}
                    </li>
                    <li>
                      <span className="font-medium text-text-primary">Email:</span> {email}
                    </li>
                    <li>
                      <span className="font-medium text-text-primary">Phone:</span> {phone || "—"}
                    </li>
                    <li>
                      <span className="font-medium text-text-primary">Claim:</span> {claimType || "—"}
                    </li>
                    <li>
                      <span className="font-medium text-text-primary">Event date:</span> {eventDate || "—"}
                    </li>
                    <li>
                      <span className="font-medium text-text-primary">Location:</span> {location || "—"}
                    </li>
                    <li>
                      <span className="font-medium text-text-primary">Narrative:</span> {narrative ? narrative.slice(0, 120) + (narrative.length > 120 ? "…" : "") : "—"}
                    </li>
                  </ul>
                </div>
              </section>
            )}

            {error && <p className="text-sm text-red-600">{error}</p>}

            <div className="flex items-center justify-between">
              <Button variant="outline" onClick={prev} disabled={step === 0 || submitting}>
                Back
              </Button>
              {step < STEPS.length - 1 ? (
                <Button onClick={next} disabled={!canNext || submitting}>
                  Next
                </Button>
              ) : (
                <Button onClick={handleSubmit} disabled={!consent || submitting}>
                  {submitting ? "Submitting…" : "Submit"}
                </Button>
              )}
            </div>
          </div>
        )}
      </Card>

      <p className="mt-4 text-center text-xs text-text-secondary">
        Powered by IntakeLegal • Secure & GDPR-compliant
      </p>
    </div>
  );
}

const DEFAULT_GDPR_TEXT = `By submitting this form, you consent to the processing of your personal data for the
purpose of assessing your legal matter and contacting you. We will retain your data in accordance with the
firm's data retention policy (typically 30–365 days unless we proceed further). You may withdraw consent at
any time by contacting us.`;
