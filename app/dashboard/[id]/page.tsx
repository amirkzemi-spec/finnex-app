"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase";

const API = "https://finnex-api-production.up.railway.app/api/projects";

async function authHeaders(): Promise<Record<string, string>> {
  const supabase = createClient();
  const { data: { session } } = await supabase.auth.getSession();
  return session?.access_token ? { Authorization: `Bearer ${session.access_token}` } : {};
}

type Project = {
  id: string;
  created_at: string;
  status: string;
  overall_score: number;
  risk_band: string;
  score_agronomy: number;
  score_operator: number;
  score_market: number;
  score_finance: number;
  score_monitoring: number;
  score_impact: number;
  data_completeness_pct: number | null;
  full_name: string | null;
  project_name: string | null;
  country: string | null;
  crop_type: string | null;
  [key: string]: unknown;
};

const DIMENSIONS = [
  {
    key: "score_agronomy" as keyof Project,
    code: "D1",
    label: "Agronomy",
    desc: "Soil health, irrigation, crop variety, and agronomic practice quality",
  },
  {
    key: "score_operator" as keyof Project,
    code: "D2",
    label: "Operator",
    desc: "Farmer experience, training, cooperative membership, and management capacity",
  },
  {
    key: "score_market" as keyof Project,
    code: "D3",
    label: "Market",
    desc: "Offtake agreements, buyer quality, price stability, and market access",
  },
  {
    key: "score_finance" as keyof Project,
    code: "D4",
    label: "Finance",
    desc: "Input cost coverage, repayment history, collateral, and financial management",
  },
  {
    key: "score_monitoring" as keyof Project,
    code: "D5",
    label: "Monitoring",
    desc: "IoT sensor coverage, data collection frequency, and field visit cadence",
  },
  {
    key: "score_impact" as keyof Project,
    code: "D6",
    label: "Impact",
    desc: "Employment, women's inclusion, environmental practices, and ESG alignment",
  },
];

const SCORE_KEYS = new Set([
  "score_agronomy",
  "score_operator",
  "score_market",
  "score_finance",
  "score_monitoring",
  "score_impact",
  "data_completeness_pct",  // shown near overall score, not in raw metadata
]);

function riskStyle(band: string): { background: string; color: string } {
  if (band === "Low") return { background: "rgba(74,222,128,0.15)", color: "#4ADE80" };
  if (band === "Medium") return { background: "rgba(251,191,36,0.15)", color: "#FBBF24" };
  return { background: "rgba(248,113,113,0.15)", color: "#F87171" };
}

function scoreColor(v: number): string {
  return v >= 70 ? "#4ADE80" : v >= 50 ? "#F59E0B" : "#EF4444";
}

function formatKey(k: string): string {
  return k
    .replace(/_/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

function formatValue(v: unknown): string {
  if (v === null || v === undefined || v === "") return "—";
  if (typeof v === "number") return Number.isInteger(v) ? String(v) : v.toFixed(2);
  if (typeof v === "string" && v.match(/^\d{4}-\d{2}-\d{2}T/)) {
    return new Date(v).toLocaleDateString("en-GB", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  }
  return String(v);
}

export default function ProjectDetailPage() {
  const params = useParams();
  const id = params?.id as string;

  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (!id) return;
    (async () => {
      setLoading(true);
      try {
        const res = await fetch(API, { headers: await authHeaders() });
        const data: Project[] = await res.json();
        const found = data.find((p) => p.id === id);
        if (found) {
          setProject(found);
        } else {
          setNotFound(true);
        }
      } catch {
        setNotFound(true);
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  const name = project
    ? project.project_name || project.full_name || "Unnamed Project"
    : "";

  const badge = project ? riskStyle(project.risk_band) : { background: "", color: "" };

  const submittedDate = project?.created_at
    ? new Date(project.created_at).toLocaleDateString("en-GB", {
        day: "numeric",
        month: "short",
        year: "numeric",
      })
    : null;

  const metaEntries = project
    ? Object.entries(project).filter(([k]) => !SCORE_KEYS.has(k))
    : [];

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@600;700&family=Inter:wght@400;500;600&family=JetBrains+Mono:wght@400;600&display=swap');

        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        .dp-root {
          min-height: 100vh;
          background: #0A1A0F;
          color: #B8D4C0;
          font-family: 'Inter', sans-serif;
          padding: 0 0 80px;
        }

        /* NAV */
        .dp-nav {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 20px 40px;
          border-bottom: 1px solid rgba(184,212,192,0.1);
        }
        .dp-logo {
          font-family: 'Playfair Display', serif;
          font-size: 1.4rem;
          font-weight: 700;
          color: #4ADE80;
          letter-spacing: 0.04em;
          text-decoration: none;
        }
        .dp-nav-label {
          font-family: 'JetBrains Mono', monospace;
          font-size: 0.7rem;
          letter-spacing: 0.12em;
          color: #B8D4C0;
          opacity: 0.5;
          text-transform: uppercase;
        }

        /* HEADER */
        .dp-header {
          padding: 40px 40px 32px;
          border-bottom: 1px solid rgba(184,212,192,0.08);
        }
        .dp-back {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          font-family: 'JetBrains Mono', monospace;
          font-size: 0.72rem;
          letter-spacing: 0.08em;
          color: #4ADE80;
          text-decoration: none;
          opacity: 0.75;
          margin-bottom: 24px;
          transition: opacity 0.15s;
        }
        .dp-back:hover { opacity: 1; }
        .dp-back-arrow {
          width: 18px;
          height: 18px;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .dp-title {
          font-family: 'Playfair Display', serif;
          font-size: 2.25rem;
          font-weight: 700;
          color: #E8F4EC;
          line-height: 1.2;
          margin-bottom: 10px;
        }
        .dp-subtitle {
          font-size: 0.875rem;
          color: #B8D4C0;
          opacity: 0.55;
          margin-bottom: 20px;
        }
        .dp-header-score-row {
          display: flex;
          align-items: center;
          gap: 16px;
          flex-wrap: wrap;
        }
        .dp-badge {
          font-family: 'JetBrains Mono', monospace;
          font-size: 0.7rem;
          font-weight: 600;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          padding: 5px 12px;
          border-radius: 6px;
        }
        .dp-overall-score {
          font-family: 'JetBrains Mono', monospace;
          font-size: 3rem;
          font-weight: 600;
          color: #4ADE80;
          line-height: 1;
        }
        .dp-overall-label {
          font-family: 'JetBrains Mono', monospace;
          font-size: 0.85rem;
          color: #B8D4C0;
          opacity: 0.4;
        }
        .dp-completeness {
          font-family: 'JetBrains Mono', monospace;
          font-size: 0.72rem;
          letter-spacing: 0.06em;
          color: #7A9E87;
          margin-top: 10px;
        }

        /* CONTENT AREA */
        .dp-body {
          padding: 40px 40px 0;
        }

        /* SECTION TITLE */
        .dp-section-title {
          font-family: 'Playfair Display', serif;
          font-size: 1.35rem;
          font-weight: 600;
          color: #E8F4EC;
          margin-bottom: 24px;
        }

        /* DIMENSION GRID */
        .dp-dim-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 16px;
          margin-bottom: 56px;
        }
        .dp-dim-card {
          background: #0F2D1A;
          border: 1px solid rgba(184,212,192,0.1);
          border-radius: 14px;
          padding: 20px;
        }
        .dp-dim-header {
          display: flex;
          align-items: baseline;
          justify-content: space-between;
          margin-bottom: 14px;
        }
        .dp-dim-name {
          font-family: 'JetBrains Mono', monospace;
          font-size: 0.72rem;
          font-weight: 600;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          color: #B8D4C0;
          opacity: 0.7;
        }
        .dp-dim-score {
          font-family: 'JetBrains Mono', monospace;
          font-size: 2rem;
          font-weight: 600;
          line-height: 1;
        }
        .dp-dim-out {
          font-family: 'JetBrains Mono', monospace;
          font-size: 0.7rem;
          color: #B8D4C0;
          opacity: 0.35;
        }
        .dp-bar-track {
          background: rgba(184,212,192,0.08);
          border-radius: 4px;
          height: 6px;
          width: 100%;
          overflow: hidden;
          margin: 12px 0 10px;
        }
        .dp-bar-fill {
          height: 100%;
          border-radius: 4px;
          transition: width 0.6s ease;
        }
        .dp-dim-desc {
          font-size: 0.72rem;
          color: #B8D4C0;
          opacity: 0.45;
          line-height: 1.5;
        }

        /* METADATA GRID */
        .dp-meta-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 1px;
          background: rgba(184,212,192,0.08);
          border: 1px solid rgba(184,212,192,0.08);
          border-radius: 14px;
          overflow: hidden;
        }
        .dp-meta-cell {
          background: #0F2D1A;
          padding: 14px 18px;
        }
        .dp-meta-key {
          font-family: 'JetBrains Mono', monospace;
          font-size: 0.65rem;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          color: #B8D4C0;
          opacity: 0.4;
          margin-bottom: 4px;
        }
        .dp-meta-val {
          font-family: 'Inter', sans-serif;
          font-size: 0.85rem;
          color: #E8F4EC;
          word-break: break-word;
        }

        /* LOADING / NOT FOUND */
        .dp-center {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          min-height: 60vh;
          gap: 16px;
        }
        .dp-spinner-ring {
          width: 36px;
          height: 36px;
          border: 2px solid rgba(74,222,128,0.15);
          border-top-color: #4ADE80;
          border-radius: 50%;
          animation: dp-spin 0.8s linear infinite;
        }
        @keyframes dp-spin { to { transform: rotate(360deg); } }
        .dp-not-found-title {
          font-family: 'Playfair Display', serif;
          font-size: 1.5rem;
          color: #E8F4EC;
        }
        .dp-not-found-sub {
          font-family: 'JetBrains Mono', monospace;
          font-size: 0.75rem;
          letter-spacing: 0.08em;
          color: #B8D4C0;
          opacity: 0.4;
        }

        @media (max-width: 768px) {
          .dp-nav, .dp-header, .dp-body { padding-left: 20px; padding-right: 20px; }
          .dp-title { font-size: 1.6rem; }
          .dp-dim-grid { grid-template-columns: repeat(2, 1fr); }
          .dp-meta-grid { grid-template-columns: 1fr; }
        }
        @media (max-width: 480px) {
          .dp-dim-grid { grid-template-columns: 1fr; }
        }
      `}</style>

      <div className="dp-root">
        <nav className="dp-nav">
          <Link href="/dashboard" className="dp-logo">FINNEX.</Link>
          <span className="dp-nav-label">Project Detail</span>
        </nav>

        {loading && (
          <div className="dp-center">
            <div className="dp-spinner-ring" />
          </div>
        )}

        {!loading && notFound && (
          <div className="dp-center">
            <div className="dp-not-found-title">Project not found</div>
            <div className="dp-not-found-sub">No project matches ID: {id}</div>
            <Link href="/dashboard" className="dp-back" style={{ marginBottom: 0 }}>
              <span className="dp-back-arrow">
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                  <path d="M9 2L4 7l5 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </span>
              Back to Dashboard
            </Link>
          </div>
        )}

        {!loading && project && (
          <>
            {/* ── HEADER ── */}
            <div className="dp-header">
              <Link href="/dashboard" className="dp-back">
                <span className="dp-back-arrow">
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                    <path d="M9 2L4 7l5 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </span>
                Back to Dashboard
              </Link>

              <h1 className="dp-title">{name}</h1>
              <div className="dp-subtitle">
                {[project.country, project.crop_type, submittedDate && `Submitted ${submittedDate}`]
                  .filter(Boolean)
                  .join(" · ")}
              </div>

              <div className="dp-header-score-row">
                <span className="dp-badge" style={badge}>{project.risk_band}</span>
                <span className="dp-overall-score">{project.overall_score?.toFixed(1)}</span>
                <span className="dp-overall-label">/ 100 overall</span>
              </div>
              {project.data_completeness_pct != null && (
                <div className="dp-completeness">
                  Based on {project.data_completeness_pct}% of scoring inputs
                </div>
              )}
            </div>

            <div className="dp-body">
              {/* ── SIX-DIMENSION ASSESSMENT ── */}
              <h2 className="dp-section-title">Six-Dimension Assessment</h2>
              <div className="dp-dim-grid">
                {DIMENSIONS.map(({ key, code, label, desc }) => {
                  const val = (project[key] as number) ?? 0;
                  const color = scoreColor(val);
                  return (
                    <div key={key} className="dp-dim-card">
                      <div className="dp-dim-header">
                        <span className="dp-dim-name">{code} {label}</span>
                      </div>
                      <div>
                        <span className="dp-dim-score" style={{ color }}>{val.toFixed(0)}</span>
                        <span className="dp-dim-out"> / 100</span>
                      </div>
                      <div className="dp-bar-track">
                        <div
                          className="dp-bar-fill"
                          style={{ width: `${Math.min(100, Math.max(0, val))}%`, background: color }}
                        />
                      </div>
                      <div className="dp-dim-desc">{desc}</div>
                    </div>
                  );
                })}
              </div>

              {/* ── PROJECT METADATA ── */}
              <h2 className="dp-section-title">Project Metadata</h2>
              <div className="dp-meta-grid">
                {metaEntries.map(([k, v]) => (
                  <div key={k} className="dp-meta-cell">
                    <div className="dp-meta-key">{formatKey(k)}</div>
                    <div className="dp-meta-val">{formatValue(v)}</div>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}
      </div>
    </>
  );
}
