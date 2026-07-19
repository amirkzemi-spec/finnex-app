"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase";

const API_BASE = "https://finnex-api-production.up.railway.app/api";
const API = `${API_BASE}/projects`;

type Project = {
  id: string;
  created_at: string;
  status: string;
  overall_score: number;
  risk_band: string;
  full_name: string | null;
  project_name: string | null;
  country: string | null;
  crop_type: string | null;
  source: string;
};

type StatusFilter = "all" | "pending" | "approved" | "rejected";

function statusBadgeStyle(status: string): { background: string; color: string } {
  if (status === "approved") return { background: "rgba(74,222,128,0.15)", color: "#4ADE80" };
  if (status === "rejected") return { background: "rgba(239,68,68,0.12)", color: "#F87171" };
  return { background: "rgba(251,191,36,0.12)", color: "#FBBF24" };
}

function statusLabel(status: string): string {
  if (status === "submitted") return "Pending";
  return status.charAt(0).toUpperCase() + status.slice(1);
}

function sourceBadgeStyle(source: string): { background: string; color: string } {
  if (source === "synthetic") return { background: "rgba(245,158,11,0.12)", color: "#F59E0B" };
  return { background: "rgba(74,222,128,0.12)", color: "#4ADE80" };
}

function sourceLabel(source: string): string {
  return source === "synthetic" ? "Synthetic" : "Real";
}

export default function AdminPage() {
  const router = useRouter();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<StatusFilter>("all");
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteLoading, setInviteLoading] = useState(false);
  const [inviteMsg, setInviteMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const [bannerDismissed, setBannerDismissed] = useState(false);

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const res = await fetch(API);
        const data: Project[] = await res.json();
        setProjects(data);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const handleSignOut = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
  };

  const updateStatus = async (id: string, newStatus: "approved" | "rejected") => {
    setActionLoading(id + newStatus);
    try {
      const res = await fetch(`${API_BASE}/projects/${id}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      if (res.ok) {
        setProjects(prev =>
          prev.map(p => (p.id === id ? { ...p, status: newStatus } : p))
        );
      }
    } finally {
      setActionLoading(null);
    }
  };

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    setInviteLoading(true);
    setInviteMsg(null);
    try {
      const res = await fetch("/api/admin/invite", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: inviteEmail }),
      });
      const data = await res.json();
      if (data.error) {
        setInviteMsg({ ok: false, text: data.error });
      } else {
        setInviteMsg({ ok: true, text: `Invite sent to ${inviteEmail}` });
        setInviteEmail("");
      }
    } catch {
      setInviteMsg({ ok: false, text: "Failed to send invite" });
    } finally {
      setInviteLoading(false);
    }
  };

  const visible = projects.filter(p => {
    if (filter === "all") return true;
    return p.status === filter;
  });

  const counts = {
    all:      projects.length,
    pending:  projects.filter(p => p.status === "pending").length,
    approved: projects.filter(p => p.status === "approved").length,
    rejected: projects.filter(p => p.status === "rejected").length,
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@600;700&family=Inter:wght@400;500;600&family=JetBrains+Mono:wght@400;600&display=swap');

        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        .adm-root {
          min-height: 100vh;
          background: #0A1A0F;
          color: #B8D4C0;
          font-family: 'Inter', sans-serif;
          padding-bottom: 80px;
        }

        /* NAV */
        .adm-nav {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 20px 40px;
          border-bottom: 1px solid rgba(184,212,192,0.1);
        }
        .adm-logo {
          font-family: 'Playfair Display', serif;
          font-size: 1.4rem;
          font-weight: 700;
          color: #4ADE80;
          letter-spacing: 0.04em;
          text-decoration: none;
        }
        .adm-nav-right {
          display: flex;
          align-items: center;
          gap: 20px;
        }
        .adm-nav-label {
          font-family: 'JetBrains Mono', monospace;
          font-size: 0.65rem;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          background: rgba(251,191,36,0.12);
          color: #FBBF24;
          padding: 4px 10px;
          border-radius: 6px;
        }
        .adm-signout {
          background: none;
          border: 1px solid rgba(184,212,192,0.15);
          border-radius: 8px;
          color: #B8D4C0;
          cursor: pointer;
          font-family: 'JetBrains Mono', monospace;
          font-size: 0.65rem;
          letter-spacing: 0.08em;
          padding: 6px 14px;
          text-transform: uppercase;
          transition: border-color 0.2s;
        }
        .adm-signout:hover { border-color: rgba(184,212,192,0.4); }

        /* PAGE HEADER */
        .adm-header {
          padding: 40px 40px 0;
        }
        .adm-title {
          font-family: 'Playfair Display', serif;
          font-size: 2rem;
          font-weight: 700;
          color: #E8F4EC;
          margin-bottom: 8px;
        }
        .adm-title em { font-style: normal; color: #4ADE80; }
        .adm-sub {
          font-size: 0.875rem;
          color: #B8D4C0;
          opacity: 0.55;
          margin-bottom: 32px;
        }

        /* FILTER TABS */
        .adm-tabs {
          display: flex;
          gap: 8px;
          padding: 0 40px;
          margin-bottom: 24px;
          flex-wrap: wrap;
        }
        .adm-tab {
          background: none;
          border: 1px solid rgba(184,212,192,0.12);
          border-radius: 8px;
          color: #B8D4C0;
          cursor: pointer;
          font-family: 'JetBrains Mono', monospace;
          font-size: 0.68rem;
          letter-spacing: 0.08em;
          padding: 7px 14px;
          text-transform: uppercase;
          transition: border-color 0.2s, color 0.2s;
          opacity: 0.6;
        }
        .adm-tab:hover { opacity: 1; border-color: rgba(184,212,192,0.3); }
        .adm-tab.active {
          border-color: #4ADE80;
          color: #4ADE80;
          opacity: 1;
        }
        .adm-tab-count {
          margin-left: 6px;
          opacity: 0.5;
        }

        /* PROJECT LIST */
        .adm-list {
          padding: 0 40px;
          display: flex;
          flex-direction: column;
          gap: 12px;
          margin-bottom: 56px;
        }

        .adm-row {
          background: #0F2D1A;
          border: 1px solid rgba(184,212,192,0.1);
          border-radius: 14px;
          padding: 18px 22px;
          display: grid;
          grid-template-columns: 1fr auto;
          gap: 16px;
          align-items: center;
          transition: border-color 0.2s;
        }
        .adm-row:hover { border-color: rgba(184,212,192,0.2); }

        .adm-row-main { min-width: 0; }

        .adm-row-name {
          font-family: 'Playfair Display', serif;
          font-size: 1rem;
          font-weight: 600;
          color: #E8F4EC;
          margin-bottom: 4px;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        .adm-row-meta {
          font-size: 0.75rem;
          color: #B8D4C0;
          opacity: 0.5;
          display: flex;
          gap: 10px;
          flex-wrap: wrap;
          align-items: center;
        }
        .adm-row-badge {
          font-family: 'JetBrains Mono', monospace;
          font-size: 0.62rem;
          font-weight: 600;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          padding: 3px 8px;
          border-radius: 5px;
        }

        .adm-row-actions {
          display: flex;
          gap: 8px;
          align-items: center;
          flex-shrink: 0;
        }
        .adm-action-btn {
          border: none;
          border-radius: 8px;
          cursor: pointer;
          font-family: 'JetBrains Mono', monospace;
          font-size: 0.65rem;
          font-weight: 600;
          letter-spacing: 0.08em;
          padding: 8px 14px;
          text-transform: uppercase;
          transition: opacity 0.2s;
        }
        .adm-action-btn:disabled { opacity: 0.35; cursor: not-allowed; }
        .adm-approve {
          background: rgba(74,222,128,0.12);
          color: #4ADE80;
          border: 1px solid rgba(74,222,128,0.25);
        }
        .adm-approve:hover:not(:disabled) { background: rgba(74,222,128,0.2); }
        .adm-reject {
          background: rgba(239,68,68,0.1);
          color: #F87171;
          border: 1px solid rgba(239,68,68,0.2);
        }
        .adm-reject:hover:not(:disabled) { background: rgba(239,68,68,0.18); }
        .adm-view {
          background: none;
          color: #B8D4C0;
          border: 1px solid rgba(184,212,192,0.15);
          text-decoration: none;
          display: inline-flex;
          align-items: center;
          border-radius: 8px;
          font-family: 'JetBrains Mono', monospace;
          font-size: 0.65rem;
          font-weight: 600;
          letter-spacing: 0.08em;
          padding: 8px 14px;
          text-transform: uppercase;
          transition: border-color 0.2s;
        }
        .adm-view:hover { border-color: rgba(184,212,192,0.35); }

        /* EMPTY / LOADING */
        .adm-empty {
          text-align: center;
          padding: 60px 0;
          font-family: 'JetBrains Mono', monospace;
          font-size: 0.75rem;
          letter-spacing: 0.1em;
          color: #B8D4C0;
          opacity: 0.3;
        }
        .adm-spinner {
          display: flex;
          justify-content: center;
          padding: 60px 0;
        }
        .adm-spinner-ring {
          width: 32px;
          height: 32px;
          border: 2px solid rgba(74,222,128,0.15);
          border-top-color: #4ADE80;
          border-radius: 50%;
          animation: adm-spin 0.8s linear infinite;
        }
        @keyframes adm-spin { to { transform: rotate(360deg); } }

        /* INVITE SECTION */
        .adm-invite-section {
          padding: 0 40px;
        }
        .adm-invite-card {
          background: #0F2D1A;
          border: 1px solid rgba(184,212,192,0.1);
          border-radius: 16px;
          padding: 28px;
          max-width: 520px;
        }
        .adm-invite-title {
          font-family: 'Playfair Display', serif;
          font-size: 1.15rem;
          font-weight: 600;
          color: #E8F4EC;
          margin-bottom: 6px;
        }
        .adm-invite-sub {
          font-size: 0.78rem;
          color: #B8D4C0;
          opacity: 0.45;
          margin-bottom: 20px;
        }
        .adm-invite-row {
          display: flex;
          gap: 10px;
        }
        .adm-invite-input {
          flex: 1;
          background: #0A1A0F;
          border: 1px solid rgba(184,212,192,0.15);
          border-radius: 10px;
          color: #E8F4EC;
          font-family: 'Inter', sans-serif;
          font-size: 0.875rem;
          padding: 11px 14px;
          outline: none;
          transition: border-color 0.2s;
        }
        .adm-invite-input::placeholder { color: #B8D4C0; opacity: 0.25; }
        .adm-invite-input:focus { border-color: #4ADE80; }
        .adm-invite-btn {
          background: #4ADE80;
          border: none;
          border-radius: 10px;
          color: #0A1A0F;
          cursor: pointer;
          font-family: 'JetBrains Mono', monospace;
          font-size: 0.7rem;
          font-weight: 600;
          letter-spacing: 0.08em;
          padding: 11px 18px;
          text-transform: uppercase;
          transition: opacity 0.2s;
          white-space: nowrap;
        }
        .adm-invite-btn:disabled { opacity: 0.4; cursor: not-allowed; }
        .adm-invite-btn:hover:not(:disabled) { opacity: 0.85; }
        .adm-invite-msg {
          margin-top: 12px;
          font-size: 0.78rem;
          padding: 9px 12px;
          border-radius: 8px;
        }
        .adm-invite-msg.ok {
          background: rgba(74,222,128,0.1);
          color: #4ADE80;
          border: 1px solid rgba(74,222,128,0.2);
        }
        .adm-invite-msg.err {
          background: rgba(239,68,68,0.1);
          color: #F87171;
          border: 1px solid rgba(239,68,68,0.2);
        }

        /* SECTION DIVIDER */
        .adm-divider {
          font-family: 'Playfair Display', serif;
          font-size: 1.35rem;
          font-weight: 600;
          color: #E8F4EC;
          padding: 0 40px;
          margin-bottom: 20px;
        }

        /* DEMO BANNER */
        .adm-demo-banner {
          display: flex;
          align-items: flex-start;
          gap: 12px;
          margin: 16px 40px 0;
          padding: 10px 14px;
          background: rgba(245,158,11,0.08);
          border-left: 3px solid #F59E0B;
          border-radius: 0 8px 8px 0;
        }
        .adm-demo-banner-text {
          flex: 1;
          font-family: 'JetBrains Mono', monospace;
          font-size: 0.65rem;
          letter-spacing: 0.04em;
          color: #F59E0B;
          line-height: 1.5;
        }
        .adm-demo-banner-close {
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
        .adm-demo-banner-close:hover { opacity: 1; }

        @media (max-width: 640px) {
          .adm-nav, .adm-header, .adm-tabs, .adm-list, .adm-invite-section, .adm-divider, .adm-demo-banner {
            padding-left: 20px;
            padding-right: 20px;
          }
          .adm-demo-banner { margin-left: 20px; margin-right: 20px; }
          .adm-row { grid-template-columns: 1fr; }
          .adm-row-actions { justify-content: flex-end; }
          .adm-invite-row { flex-direction: column; }
        }
      `}</style>

      <div className="adm-root">
        <nav className="adm-nav">
          <Link href="/dashboard" className="adm-logo">FINNEX.</Link>
          <div className="adm-nav-right">
            <span className="adm-nav-label">Admin</span>
            <button className="adm-signout" onClick={handleSignOut}>Sign out</button>
          </div>
        </nav>

        {!bannerDismissed && (
          <div className="adm-demo-banner">
            <span className="adm-demo-banner-text">
              DEMO DATA — Some projects in this pipeline are synthetic test entries generated for demonstration purposes, not real farmer submissions.
            </span>
            <button className="adm-demo-banner-close" onClick={() => setBannerDismissed(true)} aria-label="Dismiss">×</button>
          </div>
        )}

        <div className="adm-header">
          <h1 className="adm-title">Project <em>Review</em></h1>
          <p className="adm-sub">Approve or reject submitted projects before they appear in the investor dashboard.</p>
        </div>

        {/* FILTER TABS */}
        <div className="adm-tabs">
          {(["all", "pending", "approved", "rejected"] as StatusFilter[]).map(f => (
            <button
              key={f}
              className={`adm-tab${filter === f ? " active" : ""}`}
              onClick={() => setFilter(f)}
            >
              {f === "pending" ? "Pending" : f.charAt(0).toUpperCase() + f.slice(1)}
              <span className="adm-tab-count">{counts[f]}</span>
            </button>
          ))}
        </div>

        {/* PROJECT LIST */}
        <div className="adm-list">
          {loading ? (
            <div className="adm-spinner"><div className="adm-spinner-ring" /></div>
          ) : visible.length === 0 ? (
            <div className="adm-empty">No projects in this category</div>
          ) : (
            visible.map(p => {
              const name = p.project_name || p.full_name || "Unnamed Project";
              const badge = statusBadgeStyle(p.status || "submitted");
              const isApproved = p.status === "approved";
              const isRejected = p.status === "rejected";
              return (
                <div key={p.id} className="adm-row">
                  <div className="adm-row-main">
                    <div className="adm-row-name">{name}</div>
                    <div className="adm-row-meta">
                      {[p.country, p.crop_type].filter(Boolean).join(" · ")}
                      {p.overall_score != null && (
                        <span style={{ fontFamily: "'JetBrains Mono', monospace", color: "#4ADE80" }}>
                          {p.overall_score.toFixed(1)}
                        </span>
                      )}
                      <span className="adm-row-badge" style={badge}>
                        {statusLabel(p.status || "submitted")}
                      </span>
                      <span className="adm-row-badge" style={sourceBadgeStyle(p.source)}>
                        {sourceLabel(p.source)}
                      </span>
                    </div>
                  </div>
                  <div className="adm-row-actions">
                    <Link href={`/dashboard/${p.id}`} className="adm-view">View</Link>
                    <Link href={`/admin/projects/${p.id}/readiness`} className="adm-view">View Readiness Doc</Link>
                    {!isApproved && (
                      <button
                        className="adm-action-btn adm-approve"
                        disabled={actionLoading === p.id + "approved"}
                        onClick={() => updateStatus(p.id, "approved")}
                      >
                        {actionLoading === p.id + "approved" ? "…" : "Approve"}
                      </button>
                    )}
                    {!isRejected && (
                      <button
                        className="adm-action-btn adm-reject"
                        disabled={actionLoading === p.id + "rejected"}
                        onClick={() => updateStatus(p.id, "rejected")}
                      >
                        {actionLoading === p.id + "rejected" ? "…" : "Reject"}
                      </button>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* INVITE SECTION */}
        <div className="adm-divider">Invite <em style={{ fontStyle: "normal", color: "#4ADE80" }}>Investor</em></div>
        <div className="adm-invite-section">
          <div className="adm-invite-card">
            <div className="adm-invite-title">Send invite link</div>
            <div className="adm-invite-sub">
              The investor will receive an email with a magic link to set their password and access the dashboard.
            </div>
            <form onSubmit={handleInvite}>
              <div className="adm-invite-row">
                <input
                  className="adm-invite-input"
                  type="email"
                  placeholder="investor@example.com"
                  value={inviteEmail}
                  onChange={e => setInviteEmail(e.target.value)}
                  required
                />
                <button className="adm-invite-btn" type="submit" disabled={inviteLoading}>
                  {inviteLoading ? "Sending…" : "Send invite"}
                </button>
              </div>
              {inviteMsg && (
                <div className={`adm-invite-msg ${inviteMsg.ok ? "ok" : "err"}`}>
                  {inviteMsg.text}
                </div>
              )}
            </form>
          </div>
        </div>
      </div>
    </>
  );
}
