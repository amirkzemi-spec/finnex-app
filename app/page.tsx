// app/page.tsx

import AppShell from "@/components/AppShell";
import StatCard from "@/components/StatCard";
import Badge from "@/components/Badge";
import { projects } from "@/lib/mock";
import {
  calculateFundingProgress,
  formatCurrency,
  formatDate,
  formatPercent,
  riskColor,
} from "@/lib/utils";

export default function Page() {
  const totalRequested = projects.reduce((sum, p) => sum + p.requested_amount, 0);
  const totalCommitted = projects.reduce((sum, p) => sum + p.committed_amount, 0);
  const avgScore =
    projects.reduce((sum, p) => sum + p.score.overall, 0) / Math.max(1, projects.length);
  const progress = calculateFundingProgress(totalCommitted, totalRequested);

  const lastUpdate = projects
    .map((p) => p.monitoring.last_update)
    .sort()
    .slice(-1)[0];

  return (
    <AppShell>
      <div className="flex flex-col gap-6">
        <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <h1 className="text-xl font-semibold text-gray-900">
                Investor / Partner Overview
              </h1>
              <p className="mt-2 max-w-2xl text-sm text-gray-600">
                FINNEX makes smallholder agriculture investable by solving trust,
                risk, and monitoring using structured intelligence and
                milestone-based capital control.
              </p>

              <div className="mt-4 flex flex-wrap gap-2">
                <Badge className="bg-blue-100 text-blue-700">Milestone control</Badge>
                <Badge className="bg-purple-100 text-purple-700">AI scoring</Badge>
                <Badge className="bg-emerald-100 text-emerald-700">Monitoring</Badge>
                <Badge className="bg-gray-100 text-gray-700">Investor-ready pipeline</Badge>
              </div>
            </div>

            <div className="rounded-xl border border-gray-200 bg-gray-50 px-4 py-3">
              <div className="text-xs font-semibold text-gray-900">Latest monitoring</div>
              <div className="mt-1 text-sm font-medium text-gray-900">
                {lastUpdate ? formatDate(lastUpdate) : "—"}
              </div>
              <div className="mt-1 text-xs text-gray-500">Across active pipeline</div>
            </div>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-4">
          <StatCard
            label="Pipeline projects"
            value={projects.length}
            helper={<span className="text-xs text-gray-500">Mock dataset (MVP)</span>}
          />
          <StatCard
            label="Capital requested"
            value={formatCurrency(totalRequested, "USD")}
            helper={<span className="text-xs text-gray-500">Across all projects</span>}
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
          <StatCard
            label="Avg score"
            value={
              <span className="inline-flex items-center gap-2">
                {Math.round(avgScore)}
                <Badge className={riskColor(avgScore >= 80 ? "Low" : avgScore >= 70 ? "Medium" : "High")}>
                  {avgScore >= 80 ? "Low" : avgScore >= 70 ? "Medium" : "High"}
                </Badge>
              </span>
            }
            helper={<span className="text-xs text-gray-500">0–100 scoring scale</span>}
          />
        </div>

        <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-sm font-semibold text-gray-900">What’s next</h2>
              <p className="mt-1 text-sm text-gray-600">
                Backend + auth comes next. Current UI is investor-first with mock data.
              </p>
            </div>
            <Badge className="bg-gray-100 text-gray-700">No backend yet</Badge>
          </div>

          <div className="mt-4 grid gap-3 md:grid-cols-3">
            <div className="rounded-xl border border-gray-100 p-4">
              <div className="text-sm font-medium text-gray-900">1) Add Auth</div>
              <div className="mt-1 text-sm text-gray-600">
                Investor / Partner / Admin roles.
              </div>
            </div>
            <div className="rounded-xl border border-gray-100 p-4">
              <div className="text-sm font-medium text-gray-900">2) Connect API</div>
              <div className="mt-1 text-sm text-gray-600">
                Replace mock data with FastAPI + Postgres.
              </div>
            </div>
            <div className="rounded-xl border border-gray-100 p-4">
              <div className="text-sm font-medium text-gray-900">3) Monitoring log</div>
              <div className="mt-1 text-sm text-gray-600">
                Evidence uploads + event timeline per milestone.
              </div>
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  );
}