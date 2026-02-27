// app/projects/[id]/page.tsx

import Link from "next/link";
import AppShell from "@/components/AppShell";
import Badge from "@/components/Badge";
import StatCard from "@/components/StatCard";
import MilestoneTimeline from "@/components/MilestoneTimeline";
import { getProjectById } from "@/lib/mock";
import {
  calculateFundingProgress,
  formatCurrency,
  formatDate,
  formatPercent,
  riskColor,
  stageColor,
} from "@/lib/utils";

type PageProps = {
  params: { id: string };
};

export default function ProjectDetailPage({ params }: PageProps) {
  const project = getProjectById(params.id);

  if (!project) {
    return (
      <AppShell>
        <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
          <div className="text-sm font-semibold text-gray-900">Project not found</div>
          <div className="mt-2 text-sm text-gray-600">
            The project ID <span className="font-mono">{params.id}</span> does not exist
            in the current mock dataset.
          </div>
          <Link
            href="/projects"
            className="mt-4 inline-flex rounded-xl bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-800"
          >
            Back to projects
          </Link>
        </div>
      </AppShell>
    );
  }

  const funding = calculateFundingProgress(project.committed_amount, project.requested_amount);

  return (
    <AppShell>
      <div className="flex flex-col gap-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="min-w-0">
            <Link href="/projects" className="text-sm text-gray-600 hover:text-gray-900">
              ← Back to projects
            </Link>

            <h1 className="mt-2 truncate text-xl font-semibold text-gray-900">
              {project.name}
            </h1>

            <div className="mt-2 flex flex-wrap items-center gap-2">
              <Badge className={stageColor(project.stage)}>{project.stage}</Badge>
              <Badge className={riskColor(project.score.risk_band)}>
                {project.score.risk_band} risk
              </Badge>
              <Badge className="bg-gray-100 text-gray-700">{project.country}</Badge>
              <Badge className="bg-gray-100 text-gray-700">
                {project.crop_or_value_chain}
              </Badge>
            </div>

            <p className="mt-3 max-w-3xl text-sm text-gray-600">{project.summary}</p>
          </div>

          <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
            <div className="text-xs font-semibold text-gray-900">Monitoring</div>
            <div className="mt-2 grid gap-2 text-sm text-gray-700">
              <div>
                <span className="text-xs text-gray-500">Method:</span>{" "}
                <span className="font-medium">{project.monitoring.method}</span>
              </div>
              <div>
                <span className="text-xs text-gray-500">Frequency:</span>{" "}
                <span className="font-medium">{project.monitoring.frequency}</span>
              </div>
              <div>
                <span className="text-xs text-gray-500">Last update:</span>{" "}
                <span className="font-medium">{formatDate(project.monitoring.last_update)}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-4">
          <StatCard
            label="Score (overall)"
            value={`${project.score.overall}/100`}
            helper={
              <span className="text-xs text-gray-500">
                Risk band:{" "}
                <Badge className={riskColor(project.score.risk_band)}>
                  {project.score.risk_band}
                </Badge>
              </span>
            }
          />
          <StatCard
            label="Funding progress"
            value={formatPercent(funding)}
            helper={
              <span className="text-xs text-gray-500">
                {formatCurrency(project.committed_amount, project.currency)} /{" "}
                {formatCurrency(project.requested_amount, project.currency)}
              </span>
            }
          />
          <StatCard
            label="Created"
            value={formatDate(project.created_at)}
            helper={<span className="text-xs text-gray-500">Project onboarding</span>}
          />
          <StatCard
            label="Milestones"
            value={project.milestones.length}
            helper={<span className="text-xs text-gray-500">Disbursement gates</span>}
          />
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <div className="md:col-span-2">
            <MilestoneTimeline milestones={project.milestones} currency={project.currency} />
          </div>

          <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
            <h3 className="text-sm font-semibold text-gray-900">Investment thesis</h3>
            <div className="mt-1 text-xs text-gray-500">
              Why this project is investable under FINNEX controls
            </div>

            <ul className="mt-4 space-y-2">
              {project.thesis.map((t, idx) => (
                <li key={idx} className="flex gap-2 text-sm text-gray-700">
                  <span className="mt-1 inline-block h-2 w-2 shrink-0 rounded-full bg-gray-900" />
                  <span>{t}</span>
                </li>
              ))}
            </ul>

            <div className="mt-6 rounded-xl border border-gray-100 bg-gray-50 p-3">
              <div className="text-xs font-semibold text-gray-900">Score breakdown</div>

              <div className="mt-3 space-y-2">
                {project.score.dimensions.map((d) => (
                  <div key={d.key} className="flex items-center justify-between gap-3">
                    <div className="text-xs font-medium text-gray-700">{d.key}</div>
                    <div className="flex items-center gap-2">
                      <div className="h-2 w-28 overflow-hidden rounded-full bg-gray-200">
                        <div
                          className="h-full bg-gray-900"
                          style={{ width: `${Math.min(100, Math.max(0, d.score))}%` }}
                        />
                      </div>
                      <div className="w-10 text-right text-xs font-semibold text-gray-900">
                        {d.score}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-4 text-xs text-gray-500">
                Overall score is a weighted index (MVP mock).
              </div>
            </div>

            <div className="mt-6">
              <Link
                href="/basket"
                className="inline-flex w-full justify-center rounded-xl bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-800"
              >
                Add to basket (placeholder)
              </Link>
              <div className="mt-2 text-center text-xs text-gray-500">
                Basket is MVP UI only — backend comes later.
              </div>
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  );
}