"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

const API = "https://finnex-api-production.up.railway.app/api/projects";

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
};

const DIMENSIONS: { key: keyof Project; label: string }[] = [
  { key: "score_agronomy",   label: "Agronomy"   },
  { key: "score_operator",   label: "Operator"   },
  { key: "score_market",     label: "Market"     },
  { key: "score_finance",    label: "Finance"    },
  { key: "score_monitoring", label: "Monitoring" },
  { key: "score_impact",     label: "Impact"     },
];

function riskStyle(band: string): { background: string; color: string } {
  if (band === "Low")    return { background: "rgba(74,222,128,0.15)", color: "#4ADE80" };
  if (band === "Medium") return { background: "rgba(251,191,36,0.15)", color: "#FBBF24" };
  return                        { background: "rgba(248,113,113,0.15)", color: "#F87171" };
}

function ScoreBar({ value }: { value: number }) {
  const pct = Math.min(100, Math.max(0, value));
  const color =
    pct >= 70 ? "#4ADE80" :
    pct >= 50 ? "#FBBF24" : "#F87171";
  return (
    <div style={{ background: "#0A1A0F", borderRadius: 4, height: 5, width: "100%", overflow: "hidden" }}>
      <div style={{ width: `${pct}%`, height: "100%", background: color, borderRadius: 4, transition: "width 0.6s ease" }} />
    </div>
  );
}

function ProjectCard({ p }: { p: Project }) {
  const name   = p.project_name || p.full_name || "Unnamed Project";
  const badge  = riskStyle(p.risk_band);

  return (
    <Link href={`/dashboard/${p.id}`} style={{ textDecoration: "none" }}>
    <div className="fn-card">
      <div className="fn-card-header">
        <div>
          <div className="fn-project-name">{name}</div>
          <div className="fn-meta">
            {[p.country, p.crop_type].filter(Boolean).join(" · ")}
          </div>
        </div>
        <span className="fn-badge" style={badge}>{p.risk_band}</span>
      </div>

      <div className="fn-score-block">
        <span className="fn-score-number">{p.overall_score?.toFixed(1)}</span>
        <span className="fn-score-label">/ 100</span>
      </div>

      {p.data_completeness_pct != null && (
        <div className="fn-completeness">{p.data_completeness_pct}% data complete</div>
      )}

      <div className="fn-dims">
        {DIMENSIONS.map(({ key, label }) => {
          const val = p[key] as number;
          return (
            <div key={key} className="fn-dim-row">
              <span className="fn-dim-label">{label}</span>
              <ScoreBar value={val} />
              <span className="fn-dim-val">{val?.toFixed(0)}</span>
            </div>
          );
        })}
      </div>
    </div>
    </Link>
  );
}

export default function DashboardPage() {
  const [projects, setProjects]     = useState<Project[]>([]);
  const [loading, setLoading]       = useState(true);
  const [bannerDismissed, setBannerDismissed] = useState(false);
  const [country, setCountry]       = useState("");
  const [riskBand, setRiskBand]     = useState("");
  const [cropType, setCropType]     = useState("");

  /* unique option sets */
  const [countries, setCountries]   = useState<string[]>([]);
  const [riskBands, setRiskBands]   = useState<string[]>([]);
  const [cropTypes, setCropTypes]   = useState<string[]>([]);

  const fetchProjects = async (c: string, r: string, ct: string) => {
    setLoading(true);
    const params = new URLSearchParams({ status: "approved" });
    if (c)  params.set("country",   c);
    if (r)  params.set("risk_band", r);
    if (ct) params.set("crop_type", ct);
    const url = `${API}?${params}`;
    const res  = await fetch(url);
    const data: Project[] = await res.json();
    setProjects(data);
    setLoading(false);
  };

  /* initial load — also build filter option lists from full dataset */
  useEffect(() => {
    (async () => {
      setLoading(true);
      const res  = await fetch(`${API}?status=approved`);
      const data: Project[] = await res.json();
      setProjects(data);
      setCountries([...new Set(data.map(p => p.country).filter(Boolean) as string[])].sort());
      setRiskBands([...new Set(data.map(p => p.risk_band).filter(Boolean))].sort());
      setCropTypes([...new Set(data.map(p => p.crop_type).filter(Boolean) as string[])].sort());
      setLoading(false);
    })();
  }, []);

  const handleFilter = (c: string, r: string, ct: string) => {
    setCountry(c); setRiskBand(r); setCropType(ct);
    fetchProjects(c, r, ct);
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@600;700&family=Inter:wght@400;500;600&family=JetBrains+Mono:wght@400;600&display=swap');

        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        .fn-root {
          min-height: 100vh;
          background: #0A1A0F;
          color: #B8D4C0;
          font-family: 'Inter', sans-serif;
          padding: 0 0 64px;
        }

        /* NAV */
        .fn-nav {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 20px 40px;
          border-bottom: 1px solid rgba(184,212,192,0.1);
        }
        .fn-logo {
          font-family: 'Playfair Display', serif;
          font-size: 1.4rem;
          font-weight: 700;
          color: #4ADE80;
          letter-spacing: 0.04em;
        }
        .fn-nav-label {
          font-family: 'JetBrains Mono', monospace;
          font-size: 0.7rem;
          letter-spacing: 0.12em;
          color: #B8D4C0;
          opacity: 0.5;
          text-transform: uppercase;
        }

        /* PAGE HEADER */
        .fn-page-header {
          padding: 48px 40px 32px;
        }
        .fn-page-title {
          font-family: 'Playfair Display', serif;
          font-size: 2rem;
          font-weight: 700;
          color: #E8F4EC;
          line-height: 1.15;
        }
        .fn-page-title em {
          font-style: normal;
          color: #4ADE80;
        }
        .fn-page-sub {
          margin-top: 10px;
          font-size: 0.875rem;
          color: #B8D4C0;
          opacity: 0.65;
        }

        /* FILTER BAR */
        .fn-filters {
          display: flex;
          gap: 12px;
          padding: 0 40px 32px;
          flex-wrap: wrap;
          align-items: center;
        }
        .fn-filter-label {
          font-family: 'JetBrains Mono', monospace;
          font-size: 0.65rem;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          color: #B8D4C0;
          opacity: 0.5;
          margin-right: 4px;
        }
        .fn-select {
          appearance: none;
          background: #0F2D1A;
          border: 1px solid rgba(184,212,192,0.15);
          border-radius: 8px;
          color: #B8D4C0;
          font-family: 'Inter', sans-serif;
          font-size: 0.8rem;
          padding: 8px 32px 8px 12px;
          cursor: pointer;
          background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='8' viewBox='0 0 12 8'%3E%3Cpath d='M1 1l5 5 5-5' stroke='%234ADE80' stroke-width='1.5' fill='none' stroke-linecap='round'/%3E%3C/svg%3E");
          background-repeat: no-repeat;
          background-position: right 10px center;
          transition: border-color 0.2s;
        }
        .fn-select:focus {
          outline: none;
          border-color: #4ADE80;
        }
        .fn-select option { background: #0F2D1A; }

        .fn-clear-btn {
          background: none;
          border: 1px solid rgba(248,113,113,0.3);
          border-radius: 8px;
          color: #F87171;
          font-family: 'JetBrains Mono', monospace;
          font-size: 0.7rem;
          letter-spacing: 0.08em;
          padding: 8px 14px;
          cursor: pointer;
          transition: border-color 0.2s, background 0.2s;
        }
        .fn-clear-btn:hover { background: rgba(248,113,113,0.08); border-color: #F87171; }

        /* COUNT */
        .fn-count {
          padding: 0 40px 20px;
          font-family: 'JetBrains Mono', monospace;
          font-size: 0.7rem;
          letter-spacing: 0.08em;
          color: #B8D4C0;
          opacity: 0.4;
        }

        /* GRID */
        .fn-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
          gap: 20px;
          padding: 0 40px;
        }

        /* CARD */
        .fn-card {
          background: #0F2D1A;
          border: 1px solid rgba(184,212,192,0.1);
          border-radius: 16px;
          padding: 24px;
          transition: border-color 0.2s, transform 0.15s;
        }
        .fn-card:hover {
          border-color: rgba(74,222,128,0.3);
          transform: translateY(-2px);
        }
        .fn-card-header {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          gap: 12px;
          margin-bottom: 20px;
        }
        .fn-project-name {
          font-family: 'Playfair Display', serif;
          font-size: 1rem;
          font-weight: 600;
          color: #E8F4EC;
          line-height: 1.3;
        }
        .fn-meta {
          margin-top: 4px;
          font-size: 0.75rem;
          color: #B8D4C0;
          opacity: 0.55;
        }
        .fn-badge {
          flex-shrink: 0;
          font-family: 'JetBrains Mono', monospace;
          font-size: 0.65rem;
          font-weight: 600;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          padding: 4px 10px;
          border-radius: 6px;
        }

        /* COMPLETENESS */
        .fn-completeness {
          font-family: 'JetBrains Mono', monospace;
          font-size: 0.62rem;
          letter-spacing: 0.06em;
          color: #7A9E87;
          margin-top: -12px;
          margin-bottom: 16px;
        }

        /* SCORE */
        .fn-score-block {
          display: flex;
          align-items: baseline;
          gap: 6px;
          margin-bottom: 20px;
        }
        .fn-score-number {
          font-family: 'JetBrains Mono', monospace;
          font-size: 2.5rem;
          font-weight: 600;
          color: #4ADE80;
          line-height: 1;
        }
        .fn-score-label {
          font-family: 'JetBrains Mono', monospace;
          font-size: 0.8rem;
          color: #B8D4C0;
          opacity: 0.4;
        }

        /* DIMENSION BARS */
        .fn-dims {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }
        .fn-dim-row {
          display: grid;
          grid-template-columns: 72px 1fr 30px;
          align-items: center;
          gap: 8px;
        }
        .fn-dim-label {
          font-family: 'JetBrains Mono', monospace;
          font-size: 0.65rem;
          letter-spacing: 0.06em;
          color: #B8D4C0;
          opacity: 0.55;
          text-transform: uppercase;
        }
        .fn-dim-val {
          font-family: 'JetBrains Mono', monospace;
          font-size: 0.65rem;
          color: #B8D4C0;
          opacity: 0.55;
          text-align: right;
        }

        /* EMPTY / LOADING */
        .fn-empty {
          grid-column: 1 / -1;
          text-align: center;
          padding: 80px 0;
          font-family: 'JetBrains Mono', monospace;
          font-size: 0.8rem;
          letter-spacing: 0.1em;
          color: #B8D4C0;
          opacity: 0.35;
        }
        .fn-spinner {
          grid-column: 1 / -1;
          display: flex;
          justify-content: center;
          align-items: center;
          padding: 80px 0;
        }
        .fn-spinner-ring {
          width: 36px;
          height: 36px;
          border: 2px solid rgba(74,222,128,0.15);
          border-top-color: #4ADE80;
          border-radius: 50%;
          animation: fn-spin 0.8s linear infinite;
        }
        @keyframes fn-spin { to { transform: rotate(360deg); } }

        /* DEMO BANNER */
        .fn-demo-banner {
          display: flex;
          align-items: flex-start;
          gap: 12px;
          margin: 16px 40px 0;
          padding: 10px 14px;
          background: rgba(245,158,11,0.08);
          border-left: 3px solid #F59E0B;
          border-radius: 0 8px 8px 0;
        }
        .fn-demo-banner-text {
          flex: 1;
          font-family: 'JetBrains Mono', monospace;
          font-size: 0.65rem;
          letter-spacing: 0.04em;
          color: #F59E0B;
          line-height: 1.5;
        }
        .fn-demo-banner-close {
          background: none;
          border: none;
          color: #F59E0B;
          cursor: pointer;
          font-size: 0.85rem;
          line-height: 1;
          opacity: 0.6;
          padding: 0;
          flex-shrink: 0;
          transition: opacity 0.15s;
        }
        .fn-demo-banner-close:hover { opacity: 1; }

        @media (max-width: 600px) {
          .fn-nav, .fn-page-header, .fn-filters, .fn-count, .fn-grid {
            padding-left: 20px;
            padding-right: 20px;
          }
          .fn-demo-banner { margin-left: 20px; margin-right: 20px; }
          .fn-page-title { font-size: 1.5rem; }
          .fn-score-number { font-size: 2rem; }
        }
      `}</style>

      <div className="fn-root">
        <nav className="fn-nav">
          <span className="fn-logo">FINNEX.</span>
          <span className="fn-nav-label">Investor Dashboard</span>
        </nav>

        {!bannerDismissed && (
          <div className="fn-demo-banner">
            <span className="fn-demo-banner-text">
              DEMO DATA — This pipeline currently includes synthetic test projects for demonstration. Production data begins once farmer onboarding launches.
            </span>
            <button className="fn-demo-banner-close" onClick={() => setBannerDismissed(true)} aria-label="Dismiss">×</button>
          </div>
        )}

        <div className="fn-page-header">
          <h1 className="fn-page-title">
            Live Project <em>Pipeline</em>
          </h1>
          <p className="fn-page-sub">
            Scored applications from the Supabase database, ordered by overall score.
          </p>
        </div>

        <div className="fn-filters">
          <span className="fn-filter-label">Filter</span>

          <select
            className="fn-select"
            value={country}
            onChange={e => handleFilter(e.target.value, riskBand, cropType)}
          >
            <option value="">All Countries</option>
            {countries.map(c => <option key={c} value={c}>{c}</option>)}
          </select>

          <select
            className="fn-select"
            value={riskBand}
            onChange={e => handleFilter(country, e.target.value, cropType)}
          >
            <option value="">All Risk Bands</option>
            {riskBands.map(r => <option key={r} value={r}>{r}</option>)}
          </select>

          <select
            className="fn-select"
            value={cropType}
            onChange={e => handleFilter(country, riskBand, e.target.value)}
          >
            <option value="">All Crop Types</option>
            {cropTypes.map(c => <option key={c} value={c}>{c}</option>)}
          </select>

          {(country || riskBand || cropType) && (
            <button
              className="fn-clear-btn"
              onClick={() => handleFilter("", "", "")}
            >
              Clear
            </button>
          )}
        </div>

        {!loading && (
          <div className="fn-count">
            {projects.length} {projects.length === 1 ? "project" : "projects"}
          </div>
        )}

        <div className="fn-grid">
          {loading ? (
            <div className="fn-spinner"><div className="fn-spinner-ring" /></div>
          ) : projects.length === 0 ? (
            <div className="fn-empty">No projects found</div>
          ) : (
            projects.map(p => <ProjectCard key={p.id} p={p} />)
          )}
        </div>
      </div>
    </>
  );
}
