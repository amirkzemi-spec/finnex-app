// app/projects/page.tsx

import Link from "next/link";
import AppShell from "@/components/AppShell";
import Badge from "@/components/Badge";
import StatCard from "@/components/StatCard";
import { projects } from "@/lib/mock";
import {
  calculateFundingProgress,
  formatCurrency,
  formatDate,
  formatPercent,
  riskColor,
  stageColor,
} from "@/lib/utils";

export default function ProjectsPage() {
  const totalRequested = projects.reduce((sum, p) => sum + p.requested_amount, 0);
  const totalCommitted = projects.reduce((sum, p) => sum + p.committed_amount, 0);
  const progress = calculateFundingProgress(totalCommitted, totalRequested);

  return (
    <AppShell>
      <div className="flex flex-col gap-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="text-xl font-semibold text-gray-900">Projects</h1>
            <p className="mt-1 text-sm text-gray-600">
              Investor-ready pipeline with milestone-based disbursement and monitoring.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Badge className="bg-gray-100 text-gray-700">Mock data</Badge>
            <Link
              href="/coming-soon"
              className="rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm font-medium text-gray-900 hover:bg-gray-50"
            >
              Farmer onboarding
            </Link>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <StatCard
            label="Pipeline projects"
            value={projects.length}
            helper={<span className="text-xs text-gray-500">Investor/partner view</span>}
          />
          <StatCard
            label="Capital requested"
            value={formatCurrency(totalRequested, "USD")}
            helper={<span className="text-xs text-gray-500">Across listed projects</span>}
          />
          <StatCard
            label="Capital committed"
            value={formatCurrency(totalCommitted, "USD")}
            helper={
              <span className="text-xs text-gray-500">
                Progress: {formatPercent(progress)}
              </span>
            }
          />
        </div>

        <div className="rounded-2xl border border-gray-200 bg-white shadow-sm">
          <div className="border-b border-gray-200 p-4">
            <div className="text-sm font-semibold text-gray-900">Project pipeline</div>
            <div className="mt-1 text-xs text-gray-500">
              Click a project to view scoring, milestones, and monitoring cadence.
            </div>
          </div>

          <div className="divide-y divide-gray-100">
            {projects.map((p) => {
              const funding = calculateFundingProgress(p.committed_amount, p.requested_amount);

              return (
                <Link
                  key={p.id}
                  href={`/projects/${p.id}`}
                  className="block p-4 hover:bg-gray-50"
                >
                  <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <div className="truncate text-sm font-semibold text-gray-900">
                          {p.name}
                        </div>
                        <Badge className={stageColor(p.stage)}>{p.stage}</Badge>
                        <Badge className={riskColor(p.score.risk_band)}>{p.score.risk_band} risk</Badge>
                      </div>

                      <div className="mt-1 text-xs text-gray-500">
                        {p.country} • {p.crop_or_value_chain}
                      </div>

                      <div className="mt-2 flex flex-wrap gap-2">
                        {(p.tags ?? []).slice(0, 3).map((t) => (
                          <Badge key={t} className="bg-gray-100 text-gray-700">
                            {t}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    <div className="shrink-0">
                      <div className="grid gap-2 md:grid-cols-3 md:items-end">
                        <div className="text-right">
                          <div className="text-xs text-gray-500">Score</div>
                          <div className="text-sm font-semibold text-gray-900">
                            {p.score.overall}/100
                          </div>
                        </div>

                        <div className="text-right">
                          <div className="text-xs text-gray-500">Funding</div>
                          <div className="text-sm font-semibold text-gray-900">
                            {formatPercent(funding)}
                          </div>
                        </div>

                        <div className="text-right">
                          <div className="text-xs text-gray-500">Last update</div>
                          <div className="text-sm font-semibold text-gray-900">
                            {formatDate(p.monitoring.last_update)}
                          </div>
                        </div>
                      </div>

                      <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-gray-200 md:w-64">
                        <div
                          className="h-full bg-gray-900"
                          style={{ width: `${funding}%` }}
                        />
                      </div>

                      <div className="mt-2 text-right text-xs text-gray-500">
                        {formatCurrency(p.committed_amount, p.currency)} /{" "}
                        {formatCurrency(p.requested_amount, p.currency)}
                      </div>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </AppShell>
  );
}