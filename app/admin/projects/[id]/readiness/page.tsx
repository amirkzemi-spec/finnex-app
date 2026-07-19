"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";

const API_BASE = "https://finnex-api-production.up.railway.app/api";

type DimensionKey = "agronomy" | "operator" | "market" | "finance" | "monitoring" | "impact";

type Dimension = {
  score: number;
  weight: number;
  notes: string[];
  limited_data: boolean;
};

type ReadinessDoc = {
  project: {
    id: string;
    project_name: string | null;
    country: string | null;
    region: string | null;
    crop_type: string | null;
    land_area_ha: number | null;
    experience_years: string | null;
    gps_lat: number | null;
    gps_lng: number | null;
    full_name: string | null;
    capital_requested: number | null;
    capital_need: string | null;
    created_at: string | null;
    status: string;
    source: string;
  };
  narrative: string;
  photos: { available: boolean; items: unknown[]; note: string };
  scoring: {
    overall_score: number;
    risk_band: string;
    data_completeness_pct: number;
    summary: string;
    recomputed_notice: string;
    dimensions: Record<DimensionKey, Dimension>;
  };
  lgd: {
    recovery_table: { input_type: string; recovery_pct: number }[];
    non_guarantee_statement: string;
  };
  repayment: { tenor_months: number | null; repayment_structure: string | null; note: string };
  verification: { available: boolean; note: string };
  cohort: { note: string };
  impact: { farmer_count: number; farmer_count_defaulted: boolean; sdg_alignment: { number: number; name: string }[] };
  fee_disclosure: string;
  legal_disclosure: { text: string; reviewed: boolean };
  diversification: { applicable: boolean; note: string };
  readiness_data: {
    in_kind_breakdown: string | null;
    failure_scenario: string | null;
    jobs_supported: number | null;
    environmental_practice: string | null;
    updated_at: string | null;
  };
};

const DIMENSIONS: { key: DimensionKey; code: string; label: string }[] = [
  { key: "agronomy",   code: "D1", label: "Agronomy" },
  { key: "operator",   code: "D2", label: "Operator" },
  { key: "market",     code: "D3", label: "Market" },
  { key: "finance",    code: "D4", label: "Finance" },
  { key: "monitoring", code: "D5", label: "Monitoring" },
  { key: "impact",     code: "D6", label: "Impact" },
];

function riskStyle(band: string): { background: string; color: string } {
  if (band === "Low") return { background: "rgba(74,222,128,0.15)", color: "#4ADE80" };
  if (band === "Medium") return { background: "rgba(251,191,36,0.15)", color: "#FBBF24" };
  return { background: "rgba(248,113,113,0.15)", color: "#F87171" };
}

function scoreColor(v: number): string {
  return v >= 70 ? "#4ADE80" : v >= 50 ? "#F59E0B" : "#EF4444";
}

function fmtMoney(v: number | null): string {
  if (v == null) return "—";
  return `$${v.toLocaleString(undefined, { maximumFractionDigits: 0 })}`;
}

function fmtDate(v: string | null): string {
  if (!v) return "—";
  return new Date(v).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
}

function Tag({ kind, children }: { kind: "manual" | "derived" | "fixed" | "limited"; children: React.ReactNode }) {
  const styles: Record<string, { background: string; color: string }> = {
    manual:  { background: "rgba(251,191,36,0.12)", color: "#FBBF24" },
    derived: { background: "rgba(184,212,192,0.1)", color: "#B8D4C0" },
    fixed:   { background: "rgba(184,212,192,0.1)", color: "#7A9E87" },
    limited: { background: "rgba(251,191,36,0.12)", color: "#FBBF24" },
  };
  return <span className="rd-tag" style={styles[kind]}>{children}</span>;
}

export default function ReadinessDocPage() {
  const params = useParams();
  const id = params?.id as string;

  const [doc, setDoc] = useState<ReadinessDoc | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  const [inKind, setInKind] = useState("");
  const [failureScenario, setFailureScenario] = useState("");
  const [jobsSupported, setJobsSupported] = useState("");
  const [envPractice, setEnvPractice] = useState("");
  const [saving, setSaving] = useState(false);
  const [savedAt, setSavedAt] = useState<string | null>(null);
  const [dirty, setDirty] = useState(false);

  useEffect(() => {
    if (!id) return;
    (async () => {
      setLoading(true);
      try {
        const res = await fetch(`${API_BASE}/projects/${id}/readiness`);
        if (res.status === 404) {
          setNotFound(true);
          return;
        }
        const data: ReadinessDoc = await res.json();
        setDoc(data);
        setInKind(data.readiness_data.in_kind_breakdown ?? "");
        setFailureScenario(data.readiness_data.failure_scenario ?? "");
        setJobsSupported(data.readiness_data.jobs_supported != null ? String(data.readiness_data.jobs_supported) : "");
        setEnvPractice(data.readiness_data.environmental_practice ?? "");
        setSavedAt(data.readiness_data.updated_at);
      } catch {
        setNotFound(true);
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  const markDirty = (setter: (v: string) => void) => (v: string) => {
    setter(v);
    setDirty(true);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch(`${API_BASE}/projects/${id}/readiness`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          in_kind_breakdown: inKind || null,
          failure_scenario: failureScenario || null,
          jobs_supported: jobsSupported ? parseInt(jobsSupported, 10) : null,
          environmental_practice: envPractice || null,
        }),
      });
      if (res.ok) {
        const updated = await res.json();
        setSavedAt(updated.updated_at);
        setDirty(false);
      }
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@600;700&family=Inter:wght@400;500;600&family=JetBrains+Mono:wght@400;600&display=swap');

        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        .rd-root {
          min-height: 100vh;
          background: #0A1A0F;
          color: #B8D4C0;
          font-family: 'Inter', sans-serif;
          padding: 0 0 100px;
        }

        .rd-nav {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 20px 40px;
          border-bottom: 1px solid rgba(184,212,192,0.1);
        }
        .rd-logo {
          font-family: 'Playfair Display', serif;
          font-size: 1.4rem;
          font-weight: 700;
          color: #4ADE80;
          letter-spacing: 0.04em;
          text-decoration: none;
        }
        .rd-back {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          font-family: 'JetBrains Mono', monospace;
          font-size: 0.72rem;
          letter-spacing: 0.08em;
          color: #4ADE80;
          text-decoration: none;
          opacity: 0.75;
        }
        .rd-back:hover { opacity: 1; }

        .rd-actionbar {
          position: sticky;
          top: 0;
          z-index: 10;
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 12px 40px;
          background: rgba(15,45,26,0.92);
          border-bottom: 1px solid rgba(184,212,192,0.1);
          backdrop-filter: blur(6px);
        }
        .rd-save-btn {
          background: #4ADE80;
          border: none;
          border-radius: 8px;
          color: #0A1A0F;
          cursor: pointer;
          font-family: 'JetBrains Mono', monospace;
          font-size: 0.68rem;
          font-weight: 600;
          letter-spacing: 0.08em;
          padding: 9px 16px;
          text-transform: uppercase;
          transition: opacity 0.2s;
        }
        .rd-save-btn:disabled { opacity: 0.4; cursor: not-allowed; }
        .rd-print-btn {
          background: none;
          border: 1px solid rgba(184,212,192,0.2);
          border-radius: 8px;
          color: #B8D4C0;
          cursor: pointer;
          font-family: 'JetBrains Mono', monospace;
          font-size: 0.68rem;
          font-weight: 600;
          letter-spacing: 0.08em;
          padding: 9px 16px;
          text-transform: uppercase;
        }
        .rd-save-status {
          font-family: 'JetBrains Mono', monospace;
          font-size: 0.68rem;
          color: #B8D4C0;
          opacity: 0.5;
        }
        .rd-save-status.dirty { color: #FBBF24; opacity: 0.9; }

        .rd-header { padding: 40px 40px 0; }
        .rd-title {
          font-family: 'Playfair Display', serif;
          font-size: 2rem;
          font-weight: 700;
          color: #E8F4EC;
          margin-bottom: 8px;
        }
        .rd-sub {
          font-size: 0.85rem;
          color: #B8D4C0;
          opacity: 0.55;
          margin-bottom: 8px;
        }

        .rd-body { padding: 32px 40px 0; max-width: 920px; }

        .rd-section {
          margin-bottom: 44px;
          padding-bottom: 40px;
          border-bottom: 1px solid rgba(184,212,192,0.08);
        }
        .rd-section:last-child { border-bottom: none; }
        .rd-section-num {
          font-family: 'JetBrains Mono', monospace;
          font-size: 0.68rem;
          letter-spacing: 0.1em;
          color: #4ADE80;
          opacity: 0.7;
          margin-bottom: 4px;
        }
        .rd-section-title {
          font-family: 'Playfair Display', serif;
          font-size: 1.3rem;
          font-weight: 600;
          color: #E8F4EC;
          margin-bottom: 16px;
        }

        .rd-narrative {
          font-size: 0.95rem;
          line-height: 1.7;
          color: #E8F4EC;
          margin-bottom: 16px;
        }

        .rd-meta-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 1px;
          background: rgba(184,212,192,0.08);
          border: 1px solid rgba(184,212,192,0.08);
          border-radius: 14px;
          overflow: hidden;
          margin-bottom: 16px;
        }
        .rd-meta-cell { background: #0F2D1A; padding: 12px 16px; }
        .rd-meta-key {
          font-family: 'JetBrains Mono', monospace;
          font-size: 0.62rem;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          color: #B8D4C0;
          opacity: 0.4;
          margin-bottom: 4px;
        }
        .rd-meta-val { font-size: 0.85rem; color: #E8F4EC; }

        .rd-flag-box {
          background: rgba(184,212,192,0.05);
          border: 1px dashed rgba(184,212,192,0.2);
          border-radius: 10px;
          padding: 14px 16px;
          font-family: 'JetBrains Mono', monospace;
          font-size: 0.72rem;
          color: #B8D4C0;
          opacity: 0.6;
          line-height: 1.6;
        }

        .rd-field { margin-bottom: 18px; }
        .rd-field-label {
          display: flex;
          align-items: center;
          gap: 8px;
          font-family: 'JetBrains Mono', monospace;
          font-size: 0.68rem;
          letter-spacing: 0.06em;
          text-transform: uppercase;
          color: #B8D4C0;
          opacity: 0.6;
          margin-bottom: 8px;
        }
        .rd-textarea, .rd-number-input {
          width: 100%;
          background: #0F2D1A;
          border: 1px solid rgba(184,212,192,0.15);
          border-radius: 10px;
          color: #E8F4EC;
          font-family: 'Inter', sans-serif;
          font-size: 0.88rem;
          padding: 12px 14px;
          outline: none;
          resize: vertical;
          transition: border-color 0.2s;
        }
        .rd-textarea { min-height: 80px; line-height: 1.6; }
        .rd-number-input { width: 160px; }
        .rd-textarea::placeholder, .rd-number-input::placeholder { color: #B8D4C0; opacity: 0.3; }
        .rd-textarea:focus, .rd-number-input:focus { border-color: #4ADE80; }

        .rd-print-value { display: none; }

        .rd-tag {
          font-family: 'JetBrains Mono', monospace;
          font-size: 0.6rem;
          font-weight: 600;
          letter-spacing: 0.06em;
          text-transform: uppercase;
          padding: 3px 8px;
          border-radius: 5px;
          white-space: nowrap;
        }

        .rd-score-row {
          display: flex;
          align-items: center;
          gap: 16px;
          margin-bottom: 8px;
          flex-wrap: wrap;
        }
        .rd-overall-score {
          font-family: 'JetBrains Mono', monospace;
          font-size: 2.4rem;
          font-weight: 600;
          color: #4ADE80;
          line-height: 1;
        }
        .rd-badge {
          font-family: 'JetBrains Mono', monospace;
          font-size: 0.7rem;
          font-weight: 600;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          padding: 5px 12px;
          border-radius: 6px;
        }
        .rd-recompute-note {
          font-size: 0.72rem;
          color: #B8D4C0;
          opacity: 0.45;
          margin-bottom: 20px;
          line-height: 1.6;
        }

        .rd-dim-table { width: 100%; border-collapse: collapse; margin-bottom: 8px; }
        .rd-dim-table th {
          text-align: left;
          font-family: 'JetBrains Mono', monospace;
          font-size: 0.62rem;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          color: #B8D4C0;
          opacity: 0.4;
          padding: 8px 10px;
          border-bottom: 1px solid rgba(184,212,192,0.1);
        }
        .rd-dim-table td {
          padding: 12px 10px;
          border-bottom: 1px solid rgba(184,212,192,0.06);
          font-size: 0.8rem;
          vertical-align: top;
        }
        .rd-dim-name { font-weight: 600; color: #E8F4EC; white-space: nowrap; }
        .rd-dim-score { font-family: 'JetBrains Mono', monospace; font-weight: 600; white-space: nowrap; }
        .rd-dim-notes { color: #B8D4C0; opacity: 0.7; line-height: 1.5; }
        .rd-dim-notes li { margin-bottom: 3px; list-style: none; }

        .rd-simple-table { width: 100%; border-collapse: collapse; margin-bottom: 8px; }
        .rd-simple-table th {
          text-align: left;
          font-family: 'JetBrains Mono', monospace;
          font-size: 0.62rem;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          color: #B8D4C0;
          opacity: 0.4;
          padding: 8px 10px;
          border-bottom: 1px solid rgba(184,212,192,0.1);
        }
        .rd-simple-table td {
          padding: 9px 10px;
          border-bottom: 1px solid rgba(184,212,192,0.06);
          font-size: 0.8rem;
          color: #E8F4EC;
        }

        .rd-static-text {
          font-size: 0.85rem;
          line-height: 1.7;
          color: #B8D4C0;
          opacity: 0.85;
          background: #0F2D1A;
          border: 1px solid rgba(184,212,192,0.1);
          border-radius: 12px;
          padding: 16px 18px;
          margin-top: 10px;
        }

        .rd-sdg-pills { display: flex; gap: 8px; flex-wrap: wrap; margin-top: 6px; }
        .rd-sdg-pill {
          font-family: 'JetBrains Mono', monospace;
          font-size: 0.68rem;
          font-weight: 600;
          color: #4ADE80;
          background: rgba(74,222,128,0.1);
          border: 1px solid rgba(74,222,128,0.2);
          padding: 5px 10px;
          border-radius: 6px;
        }

        .rd-draft-banner {
          display: flex;
          align-items: center;
          gap: 10px;
          background: rgba(239,68,68,0.12);
          border: 1px solid rgba(239,68,68,0.35);
          border-radius: 10px;
          padding: 12px 16px;
          margin-bottom: 14px;
          font-family: 'JetBrains Mono', monospace;
          font-size: 0.72rem;
          font-weight: 600;
          letter-spacing: 0.04em;
          color: #F87171;
        }

        .rd-center {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          min-height: 60vh;
          gap: 16px;
        }
        .rd-spinner-ring {
          width: 36px;
          height: 36px;
          border: 2px solid rgba(74,222,128,0.15);
          border-top-color: #4ADE80;
          border-radius: 50%;
          animation: rd-spin 0.8s linear infinite;
        }
        @keyframes rd-spin { to { transform: rotate(360deg); } }

        @media (max-width: 768px) {
          .rd-nav, .rd-actionbar, .rd-header, .rd-body { padding-left: 20px; padding-right: 20px; }
          .rd-meta-grid { grid-template-columns: 1fr; }
        }

        @media print {
          .rd-nav, .rd-actionbar, .rd-textarea, .rd-number-input { display: none !important; }
          .rd-print-value { display: block !important; }
          .rd-root { background: #fff !important; color: #111 !important; }
          .rd-title, .rd-section-title, .rd-dim-name, .rd-meta-val, .rd-narrative { color: #111 !important; }
          .rd-section { break-inside: avoid; border-bottom-color: #ddd; }
          .rd-static-text, .rd-meta-cell, .rd-flag-box { background: #f7f7f7 !important; border-color: #ddd !important; }
        }
      `}</style>

      <div className="rd-root">
        <nav className="rd-nav">
          <Link href="/admin" className="rd-logo">FINNEX.</Link>
          <Link href="/admin" className="rd-back">&larr; Back to Admin</Link>
        </nav>

        {!loading && doc && (
          <div className="rd-actionbar">
            <button className="rd-save-btn" onClick={handleSave} disabled={saving}>
              {saving ? "Saving…" : "Save manual fields"}
            </button>
            <button className="rd-print-btn" onClick={() => window.print()}>Print / Export PDF</button>
            <span className={`rd-save-status${dirty ? " dirty" : ""}`}>
              {dirty ? "Unsaved changes" : savedAt ? `Saved ${fmtDate(savedAt)}` : "Not yet saved"}
            </span>
          </div>
        )}

        {loading && (
          <div className="rd-center"><div className="rd-spinner-ring" /></div>
        )}

        {!loading && notFound && (
          <div className="rd-center">
            <div style={{ fontFamily: "'Playfair Display', serif", fontSize: "1.5rem", color: "#E8F4EC" }}>
              Project not found
            </div>
            <Link href="/admin" className="rd-back">&larr; Back to Admin</Link>
          </div>
        )}

        {!loading && doc && (
          <>
            <div className="rd-header">
              <h1 className="rd-title">{doc.project.project_name || doc.project.full_name || "Unnamed Project"}</h1>
              <p className="rd-sub">Investor Readiness Document — internal FINNEX working draft, not for investor distribution</p>
            </div>

            <div className="rd-body">
              {/* 1. IDENTITY & NARRATIVE */}
              <section className="rd-section">
                <div className="rd-section-num">SECTION 1</div>
                <h2 className="rd-section-title">Project Identity &amp; Narrative</h2>
                <div className="rd-meta-grid">
                  <div className="rd-meta-cell"><div className="rd-meta-key">Country</div><div className="rd-meta-val">{doc.project.country || "—"}</div></div>
                  <div className="rd-meta-cell"><div className="rd-meta-key">Region</div><div className="rd-meta-val">{doc.project.region || "—"}</div></div>
                  <div className="rd-meta-cell"><div className="rd-meta-key">Crop Type</div><div className="rd-meta-val">{doc.project.crop_type || "—"}</div></div>
                  <div className="rd-meta-cell"><div className="rd-meta-key">Land Area</div><div className="rd-meta-val">{doc.project.land_area_ha != null ? `${doc.project.land_area_ha} ha` : "—"}</div></div>
                  <div className="rd-meta-cell"><div className="rd-meta-key">Experience</div><div className="rd-meta-val">{doc.project.experience_years ? `${doc.project.experience_years} yrs` : "—"}</div></div>
                  <div className="rd-meta-cell"><div className="rd-meta-key">GPS</div><div className="rd-meta-val">{doc.project.gps_lat != null && doc.project.gps_lng != null ? `${doc.project.gps_lat}, ${doc.project.gps_lng}` : "—"}</div></div>
                </div>
                <p className="rd-narrative">{doc.narrative}</p>
                <div className="rd-field-label">Photos</div>
                {doc.photos.available ? (
                  <div>{/* items would render here once a photo source exists */}</div>
                ) : (
                  <div className="rd-flag-box">{doc.photos.note}</div>
                )}
              </section>

              {/* 2. CAPITAL ASK & PURPOSE */}
              <section className="rd-section">
                <div className="rd-section-num">SECTION 2</div>
                <h2 className="rd-section-title">Capital Ask &amp; Purpose</h2>
                <div className="rd-meta-grid">
                  <div className="rd-meta-cell"><div className="rd-meta-key">Capital Requested</div><div className="rd-meta-val">{fmtMoney(doc.project.capital_requested)}</div></div>
                  <div className="rd-meta-cell" style={{ gridColumn: "span 2" }}><div className="rd-meta-key">Capital Need</div><div className="rd-meta-val">{doc.project.capital_need || "—"}</div></div>
                </div>
                <div className="rd-field">
                  <div className="rd-field-label">In-Kind Item Breakdown <Tag kind="manual">To be filled manually by FINNEX team</Tag></div>
                  <textarea
                    className="rd-textarea"
                    placeholder="To be filled manually by FINNEX team"
                    value={inKind}
                    onChange={e => markDirty(setInKind)(e.target.value)}
                  />
                  <div className="rd-print-value rd-static-text">{inKind || "To be filled manually by FINNEX team"}</div>
                </div>
              </section>

              {/* 3. RISK RATING */}
              <section className="rd-section">
                <div className="rd-section-num">SECTION 3</div>
                <h2 className="rd-section-title">Risk Rating — Six-Dimension Breakdown</h2>
                <div className="rd-score-row">
                  <span className="rd-overall-score">{doc.scoring.overall_score.toFixed(1)}</span>
                  <span className="rd-badge" style={riskStyle(doc.scoring.risk_band)}>{doc.scoring.risk_band} Risk</span>
                  <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "0.72rem", opacity: 0.5 }}>
                    {doc.scoring.data_completeness_pct}% data completeness
                  </span>
                </div>
                <p className="rd-recompute-note">{doc.scoring.recomputed_notice}</p>
                <table className="rd-dim-table">
                  <thead>
                    <tr>
                      <th>Dimension</th>
                      <th>Weight</th>
                      <th>Score</th>
                      <th>Notes</th>
                    </tr>
                  </thead>
                  <tbody>
                    {DIMENSIONS.map(d => {
                      const dim = doc.scoring.dimensions[d.key];
                      return (
                        <tr key={d.key}>
                          <td className="rd-dim-name">{d.code} {d.label}{dim.limited_data && <div style={{ marginTop: 4 }}><Tag kind="limited">Limited data</Tag></div>}</td>
                          <td>{(dim.weight * 100).toFixed(0)}%</td>
                          <td className="rd-dim-score" style={{ color: scoreColor(dim.score) }}>{dim.score.toFixed(1)}</td>
                          <td className="rd-dim-notes"><ul>{dim.notes.map((n, i) => <li key={i}>{n}</li>)}</ul></td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </section>

              {/* 4. WHAT HAPPENS IF IT FAILS */}
              <section className="rd-section">
                <div className="rd-section-num">SECTION 4</div>
                <h2 className="rd-section-title">What Happens If It Fails (Loss Given Default)</h2>
                <div className="rd-field-label">Estimated Recovery by Input Type <Tag kind="fixed">Fixed values</Tag></div>
                <table className="rd-simple-table">
                  <thead><tr><th>Input Type</th><th>Est. Recovery %</th></tr></thead>
                  <tbody>
                    {doc.lgd.recovery_table.map(r => (
                      <tr key={r.input_type}><td>{r.input_type}</td><td>{r.recovery_pct}%</td></tr>
                    ))}
                  </tbody>
                </table>
                <div className="rd-field">
                  <div className="rd-field-label">Failure Scenario For This Project Type <Tag kind="manual">To be filled manually by FINNEX team</Tag></div>
                  <textarea
                    className="rd-textarea"
                    placeholder="To be filled manually by FINNEX team"
                    value={failureScenario}
                    onChange={e => markDirty(setFailureScenario)(e.target.value)}
                  />
                  <div className="rd-print-value rd-static-text">{failureScenario || "To be filled manually by FINNEX team"}</div>
                </div>
                <div className="rd-field">
                  <div className="rd-field-label">Standard Non-Guarantee Statement <Tag kind="fixed">Fixed values</Tag></div>
                  <div className="rd-static-text">{doc.lgd.non_guarantee_statement}</div>
                </div>
              </section>

              {/* 5. REPAYMENT SCHEDULE */}
              <section className="rd-section">
                <div className="rd-section-num">SECTION 5</div>
                <h2 className="rd-section-title">Repayment Schedule &amp; Timeline</h2>
                <div className="rd-field-label">Derived from crop-type lookup <Tag kind="derived">{doc.repayment.note}</Tag></div>
                <div className="rd-meta-grid">
                  <div className="rd-meta-cell"><div className="rd-meta-key">Tenor</div><div className="rd-meta-val">{doc.repayment.tenor_months != null ? `${doc.repayment.tenor_months} months` : "—"}</div></div>
                  <div className="rd-meta-cell" style={{ gridColumn: "span 2" }}><div className="rd-meta-key">Repayment Structure</div><div className="rd-meta-val">{doc.repayment.repayment_structure || "—"}</div></div>
                </div>
              </section>

              {/* 6. VERIFICATION EVIDENCE */}
              <section className="rd-section">
                <div className="rd-section-num">SECTION 6</div>
                <h2 className="rd-section-title">Verification Evidence</h2>
                <div className="rd-flag-box">{doc.verification.note}</div>
              </section>

              {/* 7. HISTORICAL COHORT PERFORMANCE */}
              <section className="rd-section">
                <div className="rd-section-num">SECTION 7</div>
                <h2 className="rd-section-title">Historical Cohort Performance</h2>
                <div className="rd-static-text">{doc.cohort.note}</div>
              </section>

              {/* 8. IMPACT METRICS */}
              <section className="rd-section">
                <div className="rd-section-num">SECTION 8</div>
                <h2 className="rd-section-title">Impact Metrics</h2>
                <div className="rd-meta-grid">
                  <div className="rd-meta-cell">
                    <div className="rd-meta-key">Farmer Count</div>
                    <div className="rd-meta-val">
                      {doc.impact.farmer_count}
                      {doc.impact.farmer_count_defaulted && <span style={{ opacity: 0.5, fontSize: "0.72rem" }}> (defaulted — no count on file)</span>}
                    </div>
                  </div>
                </div>
                <div className="rd-field">
                  <div className="rd-field-label">Jobs Supported <Tag kind="manual">To be filled manually by FINNEX team</Tag></div>
                  <input
                    className="rd-number-input"
                    type="number"
                    placeholder="e.g. 6"
                    value={jobsSupported}
                    onChange={e => markDirty(setJobsSupported)(e.target.value)}
                  />
                  <div className="rd-print-value rd-static-text">{jobsSupported || "To be filled manually by FINNEX team"}</div>
                </div>
                <div className="rd-field">
                  <div className="rd-field-label">Environmental Practice <Tag kind="manual">To be filled manually by FINNEX team</Tag></div>
                  <textarea
                    className="rd-textarea"
                    placeholder="To be filled manually by FINNEX team"
                    value={envPractice}
                    onChange={e => markDirty(setEnvPractice)(e.target.value)}
                  />
                  <div className="rd-print-value rd-static-text">{envPractice || "To be filled manually by FINNEX team"}</div>
                </div>
                <div className="rd-field-label">SDG Alignment <Tag kind="fixed">Fixed values</Tag></div>
                <div className="rd-sdg-pills">
                  {doc.impact.sdg_alignment.map(s => (
                    <span key={s.number} className="rd-sdg-pill">SDG {s.number} · {s.name}</span>
                  ))}
                </div>
              </section>

              {/* 9. FEE & RETURN DISCLOSURE */}
              <section className="rd-section">
                <div className="rd-section-num">SECTION 9</div>
                <h2 className="rd-section-title">Fee &amp; Return Disclosure</h2>
                <div className="rd-field-label"><Tag kind="fixed">Fixed values</Tag></div>
                <div className="rd-static-text">{doc.fee_disclosure}</div>
              </section>

              {/* 10. LEGAL & RISK DISCLOSURE */}
              <section className="rd-section">
                <div className="rd-section-num">SECTION 10</div>
                <h2 className="rd-section-title">Legal &amp; Risk Disclosure</h2>
                {!doc.legal_disclosure.reviewed && (
                  <div className="rd-draft-banner">
                    DRAFT — NOT LEGALLY REVIEWED, DO NOT SHOW TO REAL INVESTORS
                  </div>
                )}
                <div className="rd-field-label"><Tag kind="fixed">Fixed values</Tag></div>
                <div className="rd-static-text">{doc.legal_disclosure.text}</div>
              </section>

              {/* 11. DIVERSIFICATION OPTION */}
              <section className="rd-section">
                <div className="rd-section-num">SECTION 11</div>
                <h2 className="rd-section-title">Diversification Option</h2>
                <div className="rd-static-text">{doc.diversification.note}</div>
              </section>
            </div>
          </>
        )}
      </div>
    </>
  );
}
