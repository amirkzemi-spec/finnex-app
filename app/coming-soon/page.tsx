// app/coming-soon/page.tsx

import Link from "next/link";
import AppShell from "@/components/AppShell";
import Badge from "@/components/Badge";

export default function ComingSoonPage() {
  return (
    <AppShell>
      <div className="flex flex-col gap-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="text-xl font-semibold text-gray-900">Farmer onboarding</h1>
            <p className="mt-1 text-sm text-gray-600">
              Coming soon — the onboarding pipeline that turns farms into investable projects.
            </p>
          </div>
          <Badge className="bg-yellow-100 text-yellow-700">Coming soon</Badge>
        </div>

        <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
          <div className="text-sm font-semibold text-gray-900">
            What will be included
          </div>

          <div className="mt-4 grid gap-4 md:grid-cols-2">
            <div className="rounded-xl border border-gray-100 p-4">
              <div className="text-sm font-medium text-gray-900">
                1) Intake + eligibility
              </div>
              <div className="mt-1 text-sm text-gray-600">
                Farm profile, location, crop cycle, operator history, and baseline risk checks.
              </div>
            </div>

            <div className="rounded-xl border border-gray-100 p-4">
              <div className="text-sm font-medium text-gray-900">
                2) AI scoring draft
              </div>
              <div className="mt-1 text-sm text-gray-600">
                Generate an investability score + missing data list for due diligence.
              </div>
            </div>

            <div className="rounded-xl border border-gray-100 p-4">
              <div className="text-sm font-medium text-gray-900">
                3) Milestone plan
              </div>
              <div className="mt-1 text-sm text-gray-600">
                Convert the farm cycle into auditable milestones and disbursement gates.
              </div>
            </div>

            <div className="rounded-xl border border-gray-100 p-4">
              <div className="text-sm font-medium text-gray-900">
                4) Monitoring setup
              </div>
              <div className="mt-1 text-sm text-gray-600">
                Select monitoring method (field agents, satellite, IoT, hybrid) + cadence.
              </div>
            </div>
          </div>

          <div className="mt-6 rounded-xl border border-gray-100 bg-gray-50 p-4">
            <div className="text-xs font-semibold text-gray-900">Build sequence</div>
            <ol className="mt-2 list-decimal space-y-1 pl-5 text-sm text-gray-700">
              <li>Auth + roles (Admin / Partner / Investor)</li>
              <li>FastAPI + Postgres (projects, milestones, monitoring logs)</li>
              <li>Onboarding form + file uploads (evidence, docs)</li>
              <li>Scoring engine v1 (rule-based, then ML/fine-tuned later)</li>
              <li>Milestone approvals + disbursement tracking</li>
            </ol>
          </div>

          <div className="mt-6 flex flex-wrap gap-3">
            <Link
              href="/projects"
              className="inline-flex rounded-xl bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-800"
            >
              View projects
            </Link>
            <Link
              href="/"
              className="inline-flex rounded-xl border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-900 hover:bg-gray-50"
            >
              Back to overview
            </Link>
          </div>
        </div>
      </div>
    </AppShell>
  );
}