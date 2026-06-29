"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const supabase = createClient();
    const { error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (authError) {
      setError(authError.message);
      setLoading(false);
      return;
    }

    router.push("/dashboard");
    router.refresh();
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@600;700&family=Inter:wght@400;500;600&family=JetBrains+Mono:wght@400;600&display=swap');

        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        .lg-root {
          min-height: 100vh;
          background: #0A1A0F;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          font-family: 'Inter', sans-serif;
          padding: 24px;
        }

        .lg-card {
          width: 100%;
          max-width: 400px;
          background: #0F2D1A;
          border: 1px solid rgba(184,212,192,0.12);
          border-radius: 20px;
          padding: 40px;
        }

        .lg-logo {
          font-family: 'Playfair Display', serif;
          font-size: 1.6rem;
          font-weight: 700;
          color: #4ADE80;
          letter-spacing: 0.04em;
          margin-bottom: 8px;
        }

        .lg-tagline {
          font-family: 'JetBrains Mono', monospace;
          font-size: 0.65rem;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          color: #B8D4C0;
          opacity: 0.4;
          margin-bottom: 36px;
        }

        .lg-title {
          font-family: 'Playfair Display', serif;
          font-size: 1.5rem;
          font-weight: 600;
          color: #E8F4EC;
          margin-bottom: 6px;
        }

        .lg-subtitle {
          font-size: 0.8rem;
          color: #B8D4C0;
          opacity: 0.5;
          margin-bottom: 28px;
        }

        .lg-field {
          margin-bottom: 16px;
        }

        .lg-label {
          display: block;
          font-family: 'JetBrains Mono', monospace;
          font-size: 0.65rem;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          color: #B8D4C0;
          opacity: 0.5;
          margin-bottom: 8px;
        }

        .lg-input {
          width: 100%;
          background: #0A1A0F;
          border: 1px solid rgba(184,212,192,0.15);
          border-radius: 10px;
          color: #E8F4EC;
          font-family: 'Inter', sans-serif;
          font-size: 0.9rem;
          padding: 12px 14px;
          outline: none;
          transition: border-color 0.2s;
        }
        .lg-input::placeholder { color: #B8D4C0; opacity: 0.25; }
        .lg-input:focus { border-color: #4ADE80; }

        .lg-error {
          background: rgba(239,68,68,0.1);
          border: 1px solid rgba(239,68,68,0.25);
          border-radius: 8px;
          color: #F87171;
          font-size: 0.78rem;
          padding: 10px 14px;
          margin-bottom: 20px;
        }

        .lg-btn {
          width: 100%;
          background: #4ADE80;
          border: none;
          border-radius: 10px;
          color: #0A1A0F;
          cursor: pointer;
          font-family: 'JetBrains Mono', monospace;
          font-size: 0.8rem;
          font-weight: 600;
          letter-spacing: 0.1em;
          padding: 14px;
          text-transform: uppercase;
          transition: opacity 0.2s, transform 0.15s;
          margin-top: 8px;
        }
        .lg-btn:hover:not(:disabled) { opacity: 0.88; transform: translateY(-1px); }
        .lg-btn:disabled { opacity: 0.45; cursor: not-allowed; }

        .lg-invite-note {
          text-align: center;
          margin-top: 24px;
          font-size: 0.72rem;
          color: #B8D4C0;
          opacity: 0.35;
          font-family: 'JetBrains Mono', monospace;
          letter-spacing: 0.06em;
        }
      `}</style>

      <div className="lg-root">
        <div className="lg-card">
          <div className="lg-logo">FINNEX.</div>
          <div className="lg-tagline">Investor Portal</div>

          <h1 className="lg-title">Sign in</h1>
          <p className="lg-subtitle">Access is by invitation only.</p>

          <form onSubmit={handleSubmit}>
            <div className="lg-field">
              <label className="lg-label" htmlFor="email">Email</label>
              <input
                id="email"
                className="lg-input"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                autoComplete="email"
              />
            </div>

            <div className="lg-field">
              <label className="lg-label" htmlFor="password">Password</label>
              <input
                id="password"
                className="lg-input"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
                autoComplete="current-password"
              />
            </div>

            {error && <div className="lg-error">{error}</div>}

            <button className="lg-btn" type="submit" disabled={loading}>
              {loading ? "Signing in…" : "Sign in →"}
            </button>
          </form>

          <p className="lg-invite-note">Don&apos;t have access? Contact your FINNEX admin.</p>
        </div>
      </div>
    </>
  );
}
