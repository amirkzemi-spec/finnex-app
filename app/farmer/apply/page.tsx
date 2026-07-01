"use client";

import React, { useState } from "react";

// ── Types ──────────────────────────────────────────────
type FormData = {
  // Step 1 — Farm Basics
  project_name: string;
  country: string;
  region: string;
  gps_lat: string;
  gps_lng: string;
  land_area_ha: string;
  crop_type: string;

  // Step 2 — Farmer Profile
  full_name: string;
  email: string;
  phone: string;
  experience_years: string;
  is_cooperative: string;
  farmer_count: string;
  certifications: string;

  // Step 3 — Resources & Market
  water_source: string;
  soil_type: string;
  equipment: string;
  labour_type: string;
  buyer_type: string;
  has_offtake_contract: string;
  pricing_model: string;

  // Step 4 — Finance
  capital_requested: string;
  currency: string;
  repayment_plan: string;
  loan_duration_months: string;
  has_previous_loans: string;
  previous_loan_details: string;
};

const empty: FormData = {
  project_name: "", country: "", region: "", gps_lat: "", gps_lng: "",
  land_area_ha: "", crop_type: "",
  full_name: "", email: "", phone: "", experience_years: "",
  is_cooperative: "", farmer_count: "", certifications: "",
  water_source: "", soil_type: "", equipment: "", labour_type: "",
  buyer_type: "", has_offtake_contract: "", pricing_model: "",
  capital_requested: "", currency: "USD", repayment_plan: "",
  loan_duration_months: "", has_previous_loans: "", previous_loan_details: "",
};

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
        Step {step} of 4
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
      <SectionTitle step={1} title="Farm Basics" subtitle="Tell us about the land and what you grow." />
      <div className="grid gap-4 md:grid-cols-2">
        <Field>
          <Label required>Project / Farm name</Label>
          <Input placeholder="e.g. Tamale Maize Cluster" value={data.project_name} onChange={e => set("project_name", e.target.value)} />
        </Field>
        <Field>
          <Label required>Crop type</Label>
          <Select value={data.crop_type} onChange={e => set("crop_type", e.target.value)}>
            <option value="">Select crop</option>
            {["Maize", "Rice", "Cassava", "Soybean", "Avocado", "Cocoa", "Coffee", "Tomato", "Onion", "Groundnut", "Other"].map(c => (
              <option key={c} value={c}>{c}</option>
            ))}
          </Select>
        </Field>
        <Field>
          <Label required>Country</Label>
          <Select value={data.country} onChange={e => set("country", e.target.value)}>
            <option value="">Select country</option>
            {["Ghana", "Kenya", "Nigeria", "Ethiopia", "Tanzania", "Uganda", "Rwanda", "Senegal", "Côte d'Ivoire", "Zambia", "Mozambique", "Other"].map(c => (
              <option key={c} value={c}>{c}</option>
            ))}
          </Select>
        </Field>
        <Field>
          <Label required>Region / District</Label>
          <Input placeholder="e.g. Northern Region" value={data.region} onChange={e => set("region", e.target.value)} />
        </Field>
        <Field>
          <Label>GPS Latitude</Label>
          <Input type="number" step="any" placeholder="e.g. 9.4034" value={data.gps_lat} onChange={e => set("gps_lat", e.target.value)} />
        </Field>
        <Field>
          <Label>GPS Longitude</Label>
          <Input type="number" step="any" placeholder="e.g. -0.8424" value={data.gps_lng} onChange={e => set("gps_lng", e.target.value)} />
        </Field>
        <Field className="md:col-span-2">
          <Label required>Total land area (hectares)</Label>
          <Input type="number" min="0" step="0.1" placeholder="e.g. 120" value={data.land_area_ha} onChange={e => set("land_area_ha", e.target.value)} />
        </Field>
      </div>
    </>
  );
}

function Step2({ data, set }: { data: FormData; set: (k: keyof FormData, v: string) => void }) {
  return (
    <>
      <SectionTitle step={2} title="Farmer Profile" subtitle="Help us understand who is behind this project." />
      <div className="grid gap-4 md:grid-cols-2">
        <Field>
          <Label required>Full name</Label>
          <Input placeholder="Your full name" value={data.full_name} onChange={e => set("full_name", e.target.value)} />
        </Field>
        <Field>
          <Label required>Email address</Label>
          <Input type="email" placeholder="you@example.com" value={data.email} onChange={e => set("email", e.target.value)} />
        </Field>
        <Field>
          <Label>Phone number</Label>
          <Input type="tel" placeholder="+233 xx xxx xxxx" value={data.phone} onChange={e => set("phone", e.target.value)} />
        </Field>
        <Field>
          <Label required>Years of farming experience</Label>
          <Select value={data.experience_years} onChange={e => set("experience_years", e.target.value)}>
            <option value="">Select range</option>
            <option value="0-2">Less than 2 years</option>
            <option value="2-5">2–5 years</option>
            <option value="5-10">5–10 years</option>
            <option value="10-20">10–20 years</option>
            <option value="20+">20+ years</option>
          </Select>
        </Field>
        <Field>
          <Label required>Are you part of a cooperative?</Label>
          <Select value={data.is_cooperative} onChange={e => set("is_cooperative", e.target.value)}>
            <option value="">Select</option>
            <option value="yes">Yes — registered cooperative</option>
            <option value="informal">Yes — informal group</option>
            <option value="no">No — individual farmer</option>
          </Select>
        </Field>
        <Field>
          <Label>Number of farmers in your group</Label>
          <Input type="number" min="1" placeholder="e.g. 50" value={data.farmer_count} onChange={e => set("farmer_count", e.target.value)} />
        </Field>
        <Field className="md:col-span-2">
          <Label>Certifications (if any)</Label>
          <Select value={data.certifications} onChange={e => set("certifications", e.target.value)}>
            <option value="">None</option>
            <option value="organic">Organic certified</option>
            <option value="fairtrade">Fairtrade</option>
            <option value="globalgap">GlobalG.A.P.</option>
            <option value="rainforest">Rainforest Alliance</option>
          </Select>
        </Field>
      </div>
    </>
  );
}

function Step3({ data, set }: { data: FormData; set: (k: keyof FormData, v: string) => void }) {
  return (
    <>
      <SectionTitle step={3} title="Resources & Market" subtitle="Tell us about your farming conditions and how you sell." />
      <div className="grid gap-4 md:grid-cols-2">
        <Field>
          <Label required>Water source</Label>
          <Select value={data.water_source} onChange={e => set("water_source", e.target.value)}>
            <option value="">Select</option>
            <option value="rain">Rain-fed only</option>
            <option value="irrigation">Full irrigation</option>
            <option value="hybrid">Rain + supplemental irrigation</option>
            <option value="borehole">Borehole</option>
            <option value="river">River / stream</option>
          </Select>
        </Field>
        <Field>
          <Label>Soil type</Label>
          <Select value={data.soil_type} onChange={e => set("soil_type", e.target.value)}>
            <option value="">Select</option>
            <option value="sandy_loam">Sandy loam</option>
            <option value="clay">Clay</option>
            <option value="loam">Loam</option>
            <option value="volcanic">Volcanic / red loam</option>
            <option value="sandy">Sandy</option>
            <option value="unknown">Not sure</option>
          </Select>
        </Field>
        <Field>
          <Label>Equipment available</Label>
          <Select value={data.equipment} onChange={e => set("equipment", e.target.value)}>
            <option value="">Select</option>
            <option value="none">None — manual only</option>
            <option value="basic">Basic tools</option>
            <option value="tractor_shared">Shared tractor access</option>
            <option value="tractor_owned">Own tractor</option>
            <option value="full">Full mechanisation</option>
          </Select>
        </Field>
        <Field>
          <Label>Labour type</Label>
          <Select value={data.labour_type} onChange={e => set("labour_type", e.target.value)}>
            <option value="">Select</option>
            <option value="family">Family labour</option>
            <option value="hired">Hired labour</option>
            <option value="mixed">Mixed</option>
            <option value="cooperative">Cooperative shared labour</option>
          </Select>
        </Field>
        <Field>
          <Label required>Primary buyer type</Label>
          <Select value={data.buyer_type} onChange={e => set("buyer_type", e.target.value)}>
            <option value="">Select</option>
            <option value="local_market">Local market / spot sales</option>
            <option value="aggregator">Aggregator / middleman</option>
            <option value="processor">Processor / miller</option>
            <option value="exporter">Export buyer</option>
            <option value="government">Government offtake</option>
            <option value="ngo">NGO / aid programme</option>
          </Select>
        </Field>
        <Field>
          <Label required>Do you have an offtake contract?</Label>
          <Select value={data.has_offtake_contract} onChange={e => set("has_offtake_contract", e.target.value)}>
            <option value="">Select</option>
            <option value="yes_signed">Yes — signed contract</option>
            <option value="yes_verbal">Yes — verbal agreement</option>
            <option value="in_negotiation">In negotiation</option>
            <option value="no">No contract yet</option>
          </Select>
        </Field>
        <Field className="md:col-span-2">
          <Label>Pricing model</Label>
          <Select value={data.pricing_model} onChange={e => set("pricing_model", e.target.value)}>
            <option value="">Select</option>
            <option value="spot">Spot / market price</option>
            <option value="fixed">Fixed price contract</option>
            <option value="floor">Floor price guarantee</option>
            <option value="revenue_share">Revenue sharing</option>
            <option value="unknown">Not yet determined</option>
          </Select>
        </Field>
      </div>
    </>
  );
}

function Step4({ data, set }: { data: FormData; set: (k: keyof FormData, v: string) => void }) {
  return (
    <>
      <SectionTitle step={4} title="Finance" subtitle="Help us understand your capital needs and repayment capacity." />
      <div className="grid gap-4 md:grid-cols-2">
        <Field>
          <Label required>Capital requested</Label>
          <Input type="number" min="0" placeholder="e.g. 50000" value={data.capital_requested} onChange={e => set("capital_requested", e.target.value)} />
        </Field>
        <Field>
          <Label required>Currency</Label>
          <Select value={data.currency} onChange={e => set("currency", e.target.value)}>
            <option value="USD">USD — US Dollar</option>
            <option value="EUR">EUR — Euro</option>
            <option value="GBP">GBP — British Pound</option>
            <option value="AED">AED — UAE Dirham</option>
          </Select>
        </Field>
        <Field>
          <Label required>Preferred repayment plan</Label>
          <Select value={data.repayment_plan} onChange={e => set("repayment_plan", e.target.value)}>
            <option value="">Select</option>
            <option value="post_harvest">Lump sum after harvest</option>
            <option value="milestone">Milestone-linked repayment</option>
            <option value="monthly">Monthly instalments</option>
            <option value="revenue_share">Revenue-share model</option>
          </Select>
        </Field>
        <Field>
          <Label required>Loan duration needed</Label>
          <Select value={data.loan_duration_months} onChange={e => set("loan_duration_months", e.target.value)}>
            <option value="">Select</option>
            <option value="6">6 months</option>
            <option value="12">12 months</option>
            <option value="18">18 months</option>
            <option value="24">24 months</option>
            <option value="36">36 months</option>
          </Select>
        </Field>
        <Field className="md:col-span-2">
          <Label required>Have you taken agricultural loans before?</Label>
          <Select value={data.has_previous_loans} onChange={e => set("has_previous_loans", e.target.value)}>
            <option value="">Select</option>
            <option value="yes_repaid">Yes — fully repaid</option>
            <option value="yes_ongoing">Yes — currently active</option>
            <option value="yes_defaulted">Yes — had difficulties repaying</option>
            <option value="no">No — first time</option>
          </Select>
        </Field>
        {data.has_previous_loans && data.has_previous_loans !== "no" && (
          <Field className="md:col-span-2">
            <Label>Brief details on previous loans</Label>
            <textarea
              rows={3}
              placeholder="e.g. $10,000 from local bank in 2023, repaid in full after harvest..."
              value={data.previous_loan_details}
              onChange={e => set("previous_loan_details", e.target.value)}
              className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm text-gray-900 placeholder-gray-400 outline-none focus:border-gray-400 focus:bg-white transition resize-none"
            />
          </Field>
        )}
      </div>
    </>
  );
}

// ── Validation ─────────────────────────────────────────
function validate(step: number, data: FormData): string | null {
  if (step === 1) {
    if (!data.project_name.trim()) return "Please enter a project name.";
    if (!data.crop_type) return "Please select a crop type.";
    if (!data.country) return "Please select a country.";
    if (!data.region.trim()) return "Please enter your region.";
    if (!data.land_area_ha) return "Please enter your land area.";
  }
  if (step === 2) {
    if (!data.full_name.trim()) return "Please enter your full name.";
    if (!data.email.trim()) return "Please enter your email.";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) return "Please enter a valid email.";
    if (!data.experience_years) return "Please select your experience level.";
    if (!data.is_cooperative) return "Please indicate cooperative status.";
  }
  if (step === 3) {
    if (!data.water_source) return "Please select your water source.";
    if (!data.buyer_type) return "Please select your buyer type.";
    if (!data.has_offtake_contract) return "Please indicate offtake contract status.";
  }
  if (step === 4) {
    if (!data.capital_requested) return "Please enter the capital amount requested.";
    if (!data.repayment_plan) return "Please select a repayment plan.";
    if (!data.loan_duration_months) return "Please select a loan duration.";
    if (!data.has_previous_loans) return "Please indicate previous loan history.";
  }
  return null;
}

// ── Progress bar ───────────────────────────────────────
function ProgressBar({ step }: { step: number }) {
  return (
    <div className="flex items-center gap-2 mb-8">
      {[1, 2, 3, 4].map((s) => (
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
              {["Farm", "Profile", "Resources", "Finance"][s - 1]}
            </span>
          </div>
          {s < 4 && <div className={["flex-1 h-px transition-all", s < step ? "bg-gray-900" : "bg-gray-200"].join(" ")} />}
        </React.Fragment>
      ))}
    </div>
  );
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
          A confirmation will be sent to <span className="font-medium">{email}</span>.
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
    const err = validate(4, data);
    if (err) { setError(err); return; }
    setSubmitting(true);

    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/farmer/apply`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...data,
        land_area_ha: data.land_area_ha ? parseFloat(data.land_area_ha) : null,
        gps_lat: data.gps_lat ? parseFloat(data.gps_lat) : null,
        gps_lng: data.gps_lng ? parseFloat(data.gps_lng) : null,
        capital_requested: data.capital_requested ? parseFloat(data.capital_requested) : null,
        farmer_count: data.farmer_count ? parseInt(data.farmer_count) : null,
        loan_duration_months: data.loan_duration_months ? parseInt(data.loan_duration_months) : null,
        certifications: data.certifications ? [data.certifications] : [],
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
                Apply to list your project on FINNEX. Takes about 5 minutes. Our team reviews every application.
              </p>
            </div>
          )}

          <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
            {submitted ? (
              <SuccessScreen name={data.full_name} email={data.email} />
            ) : (
              <>
                <ProgressBar step={step} />

                {step === 1 && <Step1 data={data} set={set} />}
                {step === 2 && <Step2 data={data} set={set} />}
                {step === 3 && <Step3 data={data} set={set} />}
                {step === 4 && <Step4 data={data} set={set} />}

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

                  <div className="text-xs text-gray-400">{step} / 4</div>

                  {step < 4 ? (
                    <button
                      onClick={next}
                      className="rounded-xl bg-gray-900 px-5 py-2.5 text-sm font-medium text-white hover:bg-gray-800 transition"
                    >
                      Continue →
                    </button>
                  ) : (
                    <button
                      onClick={submit}
                      disabled={submitting}
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
