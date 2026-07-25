"use client";

import React, { useEffect, useRef, useState } from "react";

declare global {
  interface Window {
    turnstile?: {
      render: (container: HTMLElement, options: Record<string, unknown>) => string;
      remove: (widgetId: string) => void;
    };
  }
}

// ── Types ──────────────────────────────────────────────
type FormData = {
  // Step 1 — Farmer & Farm
  project_name: string;
  phone_number: string;
  email: string;
  country: string;
  region: string;
  crop_type: string;

  // Step 2 — Farm & Financing
  land_area_ha: string;
  experience_years: string;
  land_ownership_status: string;
  has_offtake_contract: string;
  capital_requested: string;
  currency: string;
  capital_need: string;
};

const empty: FormData = {
  project_name: "", phone_number: "", email: "", country: "Kenya", region: "", crop_type: "",
  land_area_ha: "", experience_years: "", land_ownership_status: "", has_offtake_contract: "",
  capital_requested: "", currency: "EUR", capital_need: "",
};

// Self-reported at intake. Step 3 field verification will separately
// confirm this on the ground later — kept as a distinct field, not merged.
const LAND_OWNERSHIP_OPTIONS = [
  { label: "Formal title", value: "formal_title" },
  { label: "Lease/rental agreement", value: "lease_rental" },
  { label: "Customary/communal rights", value: "customary_communal" },
  { label: "Informal/undocumented", value: "informal_undocumented" },
];

// Value differs from label for "Horticulture" so it matches finnex-api's
// existing MODERATE_CROPS scorer bucket ("vegetables") instead of falling
// into the generic unrecognised-crop fallback.
const CROP_OPTIONS = [
  { label: "Maize", value: "maize" },
  { label: "Tea", value: "tea" },
  { label: "Coffee", value: "coffee" },
  { label: "Dairy", value: "dairy" },
  { label: "Macadamia", value: "macadamia" },
  { label: "Horticulture", value: "vegetables" },
  { label: "Sugarcane", value: "sugarcane" },
  { label: "Other", value: "other" },
];

// ── Small reusable field components ───────────────────
function Label({ children, required }: { children: React.ReactNode; required?: boolean }) {
  return (
    <label className="block text-xs font-medium text-gray-700 mb-1">
      {children}
      {required && <span className="ml-0.5 text-red-400">*</span>}
    </label>
  );
}

function Input({ ...props }: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm text-gray-900 placeholder-gray-400 outline-none focus:border-gray-400 focus:bg-white transition"
    />
  );
}

function Select({ children, ...props }: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select
      {...props}
      className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm text-gray-900 outline-none focus:border-gray-400 focus:bg-white transition"
    >
      {children}
    </select>
  );
}

function Field({ children, className }: { children: React.ReactNode; className?: string }) {
  return <div className={`flex flex-col gap-1 ${className ?? ""}`}>{children}</div>;
}

function SectionTitle({ step, title, subtitle }: { step: number; title: string; subtitle: string }) {
  return (
    <div className="mb-6">
      <div className="inline-flex items-center gap-2 rounded-full border border-gray-200 bg-gray-50 px-3 py-1 text-xs text-gray-500 mb-3">
        Step {step} of 2
      </div>
      <h2 className="text-lg font-semibold text-gray-900">{title}</h2>
      <p className="mt-1 text-sm text-gray-500">{subtitle}</p>
    </div>
  );
}

// ── Step components ────────────────────────────────────
function Step1({ data, set }: { data: FormData; set: (k: keyof FormData, v: string) => void }) {
  return (
    <>
      <SectionTitle step={1} title="Farmer & Farm" subtitle="Tell us who you are and what you grow." />
      <div className="grid gap-4 md:grid-cols-2">
        <Field className="md:col-span-2">
          <Label required>Cooperative / Farmer name</Label>
          <Input placeholder="e.g. Tamale Maize Cooperative" value={data.project_name} onChange={e => set("project_name", e.target.value)} />
        </Field>
        <Field>
          <Label required>Phone number</Label>
          <Input type="tel" placeholder="+233 xx xxx xxxx" value={data.phone_number} onChange={e => set("phone_number", e.target.value)} />
        </Field>
        <Field>
          <Label>Email address</Label>
          <Input type="email" placeholder="you@example.com (optional)" value={data.email} onChange={e => set("email", e.target.value)} />
        </Field>
        <Field>
          <Label required>Country</Label>
          <Select value={data.country} onChange={e => set("country", e.target.value)}>
            {["Kenya", "Uganda", "Tanzania", "Ethiopia", "Rwanda"].map(c => (
              <option key={c} value={c}>{c}</option>
            ))}
            <option value="Other">Other (outside current markets)</option>
          </Select>
        </Field>
        <Field>
          <Label required>County / Region</Label>
          <Input placeholder="e.g. Northern Region" value={data.region} onChange={e => set("region", e.target.value)} />
        </Field>
        <Field className="md:col-span-2">
          <Label required>Primary crop</Label>
          <Select value={data.crop_type} onChange={e => set("crop_type", e.target.value)}>
            <option value="">Select crop</option>
            {CROP_OPTIONS.map(({ label, value }) => (
              <option key={value} value={value}>{label}</option>
            ))}
          </Select>
        </Field>
      </div>
    </>
  );
}

function Step2({ data, set }: { data: FormData; set: (k: keyof FormData, v: string) => void }) {
  return (
    <>
      <SectionTitle step={2} title="Farm & Financing" subtitle="Help us understand your land, experience, and funding need." />
      <div className="grid gap-4 md:grid-cols-2">
        <Field>
          <Label required>Total land area (hectares)</Label>
          <Input type="number" min="0" step="0.1" placeholder="e.g. 120" value={data.land_area_ha} onChange={e => set("land_area_ha", e.target.value)} />
        </Field>
        <Field>
          <Label required>Years farming this crop</Label>
          <Select value={data.experience_years} onChange={e => set("experience_years", e.target.value)}>
            <option value="">Select range</option>
            <option value="0-2">Less than 2 years</option>
            <option value="2-5">2–5 years</option>
            <option value="5-10">5–10 years</option>
            <option value="10-20">10–20 years</option>
            <option value="20+">20+ years</option>
          </Select>
        </Field>
        <Field className="md:col-span-2">
          <Label required>Land ownership status</Label>
          <Select value={data.land_ownership_status} onChange={e => set("land_ownership_status", e.target.value)}>
            <option value="">Select</option>
            {LAND_OWNERSHIP_OPTIONS.map(({ label, value }) => (
              <option key={value} value={value}>{label}</option>
            ))}
          </Select>
        </Field>
        <Field className="md:col-span-2">
          <Label required>Do you have an existing offtake contract?</Label>
          <Select value={data.has_offtake_contract} onChange={e => set("has_offtake_contract", e.target.value)}>
            <option value="">Select</option>
            <option value="yes">Yes</option>
            <option value="no">No</option>
          </Select>
        </Field>
        <Field className="md:col-span-2">
          <Label required>Capital requested</Label>
          <div className="flex gap-2">
            <div className="w-28 flex-shrink-0">
              <Select value={data.currency} onChange={e => set("currency", e.target.value)}>
                <option value="EUR">EUR</option>
                <option value="USD">USD</option>
              </Select>
            </div>
            <div className="flex-1">
              <Input type="number" min="0" placeholder="e.g. 50000" value={data.capital_requested} onChange={e => set("capital_requested", e.target.value)} />
            </div>
          </div>
        </Field>
        <Field className="md:col-span-2">
          <Label required>What do you need the funding for?</Label>
          <textarea
            rows={3}
            placeholder="e.g. Certified seed and fertilizer for the next planting season"
            value={data.capital_need}
            onChange={e => set("capital_need", e.target.value)}
            className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm text-gray-900 placeholder-gray-400 outline-none focus:border-gray-400 focus:bg-white transition resize-none"
          />
        </Field>
      </div>
    </>
  );
}

// ── Validation ─────────────────────────────────────────
function validate(step: number, data: FormData): string | null {
  if (step === 1) {
    if (!data.project_name.trim()) return "Please enter a cooperative/farmer name.";
    if (!data.phone_number.trim()) return "Please enter a phone number.";
    if (data.email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) return "Please enter a valid email.";
    if (!data.region.trim()) return "Please enter your county/region.";
    if (!data.crop_type) return "Please select a crop type.";
  }
  if (step === 2) {
    if (!data.land_area_ha) return "Please enter your land area.";
    if (!data.experience_years) return "Please select your years of experience.";
    if (!data.land_ownership_status) return "Please select your land ownership status.";
    if (!data.has_offtake_contract) return "Please indicate whether you have an offtake contract.";
    if (!data.capital_requested) return "Please enter the capital amount requested.";
    if (!data.capital_need.trim()) return "Please describe what the funding is for.";
  }
  return null;
}

// ── Progress bar ───────────────────────────────────────
function ProgressBar({ step }: { step: number }) {
  return (
    <div className="flex items-center gap-2 mb-8">
      {[1, 2].map((s) => (
        <React.Fragment key={s}>
          <div className="flex items-center gap-2">
            <div className={[
              "flex h-7 w-7 items-center justify-center rounded-full text-xs font-semibold transition-all",
              s < step ? "bg-gray-900 text-white" :
              s === step ? "bg-gray-900 text-white ring-4 ring-gray-200" :
              "bg-gray-100 text-gray-400",
            ].join(" ")}>
              {s < step ? (
                <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              ) : s}
            </div>
            <span className={["text-xs font-medium hidden md:block", s === step ? "text-gray-900" : "text-gray-400"].join(" ")}>
              {["Farmer & Farm", "Financing"][s - 1]}
            </span>
          </div>
          {s < 2 && <div className={["flex-1 h-px transition-all", s < step ? "bg-gray-900" : "bg-gray-200"].join(" ")} />}
        </React.Fragment>
      ))}
    </div>
  );
}

// ── Turnstile widget ───────────────────────────────────
// Explicit render (not the implicit script-tag form) so the widget survives
// this component mounting/unmounting as the user moves between steps.
function TurnstileWidget({ onVerify }: { onVerify: (token: string) => void }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const widgetId = useRef<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    function render() {
      if (cancelled || !containerRef.current || !window.turnstile) return;
      widgetId.current = window.turnstile.render(containerRef.current, {
        sitekey: process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY || "",
        callback: onVerify,
      });
    }

    if (window.turnstile) {
      render();
    } else {
      const script = document.createElement("script");
      script.src = "https://challenges.cloudflare.com/turnstile/v0/api.js";
      script.async = true;
      script.defer = true;
      script.onload = render;
      document.body.appendChild(script);
    }

    return () => {
      cancelled = true;
      if (widgetId.current && window.turnstile) {
        window.turnstile.remove(widgetId.current);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return <div ref={containerRef} className="mt-4" />;
}

// ── Success screen ─────────────────────────────────────
function SuccessScreen({ name, email }: { name: string; email: string }) {
  return (
    <div className="flex flex-col items-center gap-4 py-10 text-center">
      <div className="flex h-14 w-14 items-center justify-center rounded-full bg-emerald-100">
        <svg className="h-7 w-7 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
        </svg>
      </div>
      <div>
        <div className="text-xl font-semibold text-gray-900">Application submitted!</div>
        <p className="mt-2 text-sm text-gray-600 max-w-md">
          Thank you, <span className="font-medium">{name}</span>. We've received your application and will review it shortly.
          {email && <> A confirmation will be sent to <span className="font-medium">{email}</span>.</>}
        </p>
      </div>
      <div className="mt-2 rounded-2xl border border-gray-200 bg-gray-50 p-5 text-left max-w-sm w-full">
        <div className="text-xs font-semibold text-gray-900 mb-3">What happens next</div>
        <div className="space-y-3">
          {[
            { step: "1", text: "Our team reviews your submission (2–5 business days)" },
            { step: "2", text: "AI scoring model assesses your project profile" },
            { step: "3", text: "You receive a decision + feedback by email" },
            { step: "4", text: "If approved, your project is listed for investors" },
          ].map((item) => (
            <div key={item.step} className="flex gap-3 text-sm text-gray-700">
              <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-gray-200 text-xs font-semibold text-gray-700">
                {item.step}
              </div>
              {item.text}
            </div>
          ))}
        </div>
      </div>
      <a
        href="https://finnex.capital"
        className="mt-4 inline-flex rounded-xl border border-gray-200 bg-white px-5 py-2.5 text-sm font-medium text-gray-900 hover:bg-gray-50 transition"
      >
        Back to FINNEX
      </a>
    </div>
  );
}

// ── Main component ─────────────────────────────────────
export default function FarmerApplyPage() {
  const [step, setStep] = useState(1);
  const [data, setData] = useState<FormData>(empty);
  const [error, setError] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Honeypot — invisible to real farmers; a bot's autofill will populate it.
  const [website, setWebsite] = useState("");
  const [turnstileToken, setTurnstileToken] = useState("");

  function set(key: keyof FormData, value: string) {
    setData((prev) => ({ ...prev, [key]: value }));
    setError("");
  }

  function next() {
    const err = validate(step, data);
    if (err) { setError(err); return; }
    setError("");
    setStep((s) => s + 1);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function back() {
    setError("");
    setStep((s) => s - 1);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function submit() {
    const err = validate(2, data);
    if (err) { setError(err); return; }
    if (!turnstileToken) { setError("Please complete the verification check."); return; }
    setSubmitting(true);

    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/farmer/apply`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        project_name: data.project_name,
        phone_number: data.phone_number,
        email: data.email || null,
        country: data.country,
        region: data.region,
        crop_type: data.crop_type,
        land_area_ha: data.land_area_ha ? parseFloat(data.land_area_ha) : null,
        experience_years: data.experience_years,
        land_ownership_status: data.land_ownership_status,
        has_offtake_contract: data.has_offtake_contract,
        capital_requested: data.capital_requested ? parseFloat(data.capital_requested) : null,
        currency: data.currency,
        capital_need: data.capital_need,
        website,
        turnstile_token: turnstileToken,
      }),
    });
    if (!res.ok) {
      const err = await res.json();
      setError(err.detail || "Submission failed. Please try again.");
      setSubmitting(false);
      return;
    }

    setSubmitting(false);
    setSubmitted(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700&display=swap');
        .fn-apply-logo {
          font-family: 'Playfair Display', serif;
          font-size: 1.35rem;
          font-weight: 700;
          color: #15803d;
          letter-spacing: 0.04em;
        }
      `}</style>

      <div className="min-h-screen bg-gray-50">
        <nav className="border-b border-gray-100 bg-white px-6 py-4">
          <span className="fn-apply-logo">FINNEX.</span>
        </nav>

        <main className="mx-auto max-w-2xl p-6">
          {!submitted && (
            <div className="mb-6">
              <h1 className="text-xl font-semibold text-gray-900">Farmer Onboarding</h1>
              <p className="mt-1 text-sm text-gray-600">
                Apply to list your project on FINNEX. Takes about 2 minutes. Our team reviews every application.
              </p>
            </div>
          )}

          <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
            {submitted ? (
              <SuccessScreen name={data.project_name} email={data.email} />
            ) : (
              <>
                <ProgressBar step={step} />

                {/* Honeypot — visually hidden, never shown to a real farmer */}
                <div style={{ position: "absolute", left: "-9999px", top: 0 }} aria-hidden="true">
                  <label htmlFor="website">Website</label>
                  <input
                    type="text"
                    id="website"
                    name="website"
                    tabIndex={-1}
                    autoComplete="off"
                    value={website}
                    onChange={(e) => setWebsite(e.target.value)}
                  />
                </div>

                {step === 1 && <Step1 data={data} set={set} />}
                {step === 2 && <Step2 data={data} set={set} />}
                {step === 2 && <TurnstileWidget onVerify={setTurnstileToken} />}

                {error && (
                  <div className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-2.5 text-sm text-red-600">
                    {error}
                  </div>
                )}

                <div className="mt-6 flex items-center justify-between">
                  <button
                    onClick={back}
                    disabled={step === 1}
                    className="rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-30 transition"
                  >
                    ← Back
                  </button>

                  <div className="text-xs text-gray-400">{step} / 2</div>

                  {step < 2 ? (
                    <button
                      onClick={next}
                      className="rounded-xl bg-gray-900 px-5 py-2.5 text-sm font-medium text-white hover:bg-gray-800 transition"
                    >
                      Continue →
                    </button>
                  ) : (
                    <button
                      onClick={submit}
                      disabled={submitting || !turnstileToken}
                      className="rounded-xl bg-emerald-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-emerald-500 disabled:opacity-60 transition"
                    >
                      {submitting ? "Submitting…" : "Submit application"}
                    </button>
                  )}
                </div>
              </>
            )}
          </div>
        </main>
      </div>
    </>
  );
}
