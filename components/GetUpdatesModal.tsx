"use client";

// components/GetUpdatesModal.tsx

import React, { useState } from "react";

type Step = "idle" | "open" | "submitting" | "success";

type Props = {
  projectName: string;
  projectId: string;
};

export default function GetUpdatesModal({ projectName, projectId }: Props) {
  const [step, setStep] = useState<Step>("idle");
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [type, setType] = useState<"investor" | "partner" | "other">("investor");
  const [error, setError] = useState("");

  function open() {
    setStep("open");
    setError("");
  }

  function close() {
    setStep("idle");
    setEmail("");
    setName("");
    setError("");
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim()) {
      setError("Please enter your email address.");
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError("Please enter a valid email address.");
      return;
    }

    setStep("submitting");

    // Simulate async submission — replace with real API call later
    await new Promise((r) => setTimeout(r, 900));

    // In production: POST /api/updates-signup { email, name, type, projectId }
    console.log("Updates signup:", { email, name, type, projectId });

    setStep("success");
  }

  return (
    <>
      {/* Trigger button */}
      <button
        onClick={open}
        className="inline-flex w-full justify-center rounded-xl bg-gray-900 px-4 py-2.5 text-sm font-medium text-white hover:bg-gray-800 transition"
      >
        Get project updates
      </button>
      <div className="mt-2 text-center text-xs text-gray-500">
        We'll notify you on milestones and key changes.
      </div>

      {/* Backdrop */}
      {step !== "idle" && (
        <div
          className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm"
          onClick={close}
        />
      )}

      {/* Modal */}
      {step !== "idle" && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="w-full max-w-md rounded-2xl border border-gray-200 bg-white p-6 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            {step === "success" ? (
              /* ── Success state ── */
              <div className="flex flex-col items-center gap-4 py-4 text-center">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100">
                  <svg
                    className="h-6 w-6 text-emerald-600"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <div>
                  <div className="text-base font-semibold text-gray-900">You're signed up</div>
                  <p className="mt-1 text-sm text-gray-600">
                    We'll send updates on <span className="font-medium">{projectName}</span> to{" "}
                    <span className="font-medium">{email}</span>.
                  </p>
                </div>
                <p className="text-xs text-gray-500">
                  Expect milestone updates, monitoring reports, and key changes only — no spam.
                </p>
                <button
                  onClick={close}
                  className="mt-2 rounded-xl bg-gray-900 px-5 py-2 text-sm font-medium text-white hover:bg-gray-800 transition"
                >
                  Done
                </button>
              </div>
            ) : (
              /* ── Form state ── */
              <>
                <div className="flex items-start justify-between">
                  <div>
                    <div className="text-base font-semibold text-gray-900">
                      Get project updates
                    </div>
                    <p className="mt-1 text-sm text-gray-600">
                      Follow <span className="font-medium">{projectName}</span> — we'll notify
                      you when milestones are hit or status changes.
                    </p>
                  </div>
                  <button
                    onClick={close}
                    className="ml-4 rounded-lg p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition"
                  >
                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>

                <form onSubmit={submit} className="mt-5 flex flex-col gap-4">
                  {/* Name */}
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      Name <span className="text-gray-400">(optional)</span>
                    </label>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Your name or organization"
                      className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm text-gray-900 placeholder-gray-400 outline-none focus:border-gray-400 focus:bg-white transition"
                    />
                  </div>

                  {/* Email */}
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      Email <span className="text-red-400">*</span>
                    </label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => { setEmail(e.target.value); setError(""); }}
                      placeholder="you@example.com"
                      className={[
                        "w-full rounded-xl border bg-gray-50 px-3 py-2.5 text-sm text-gray-900 placeholder-gray-400 outline-none focus:bg-white transition",
                        error ? "border-red-300 focus:border-red-400" : "border-gray-200 focus:border-gray-400",
                      ].join(" ")}
                    />
                    {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
                  </div>

                  {/* Type */}
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-2">
                      I am a
                    </label>
                    <div className="flex gap-2">
                      {(["investor", "partner", "other"] as const).map((t) => (
                        <button
                          key={t}
                          type="button"
                          onClick={() => setType(t)}
                          className={[
                            "flex-1 rounded-xl border px-3 py-2 text-xs font-medium capitalize transition",
                            type === t
                              ? "border-gray-900 bg-gray-900 text-white"
                              : "border-gray-200 bg-white text-gray-700 hover:bg-gray-50",
                          ].join(" ")}
                        >
                          {t}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* What they'll receive */}
                  <div className="rounded-xl border border-gray-100 bg-gray-50 px-4 py-3">
                    <div className="text-xs font-semibold text-gray-700">What you'll receive</div>
                    <ul className="mt-2 space-y-1 text-xs text-gray-600">
                      <li>• Milestone verified / status change alerts</li>
                      <li>• Monitoring report summaries</li>
                      <li>• Funding progress updates</li>
                    </ul>
                  </div>

                  <button
                    type="submit"
                    disabled={step === "submitting"}
                    className="rounded-xl bg-gray-900 px-4 py-2.5 text-sm font-medium text-white hover:bg-gray-800 disabled:opacity-60 transition"
                  >
                    {step === "submitting" ? "Signing up…" : "Sign me up"}
                  </button>
                </form>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
}
