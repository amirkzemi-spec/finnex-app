// app/projects/[id]/page.tsx

import Link from "next/link";
import Image from "next/image";
import AppShell from "@/components/AppShell";
import Badge from "@/components/Badge";
import StatCard from "@/components/StatCard";
import MilestoneTimeline from "@/components/MilestoneTimeline";
import GetUpdatesModal from "@/components/GetUpdatesModal";
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
  params: Promise<{ id: string }>;
};

export default async function ProjectDetailPage({ params }: PageProps) {
  const { id } = await params;
  const project = getProjectById(id);

  if (!project) {
    return (
      <AppShell>
        <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
          <div className="text-sm font-semibold text-gray-900">Project not found</div>
          <div className="mt-2 text-sm text-gray-600">
            The project ID <span className="font-mono">{id}</span> does not exist
            in the current mock dataset.
          </div>
          <Link href="/projects" className="mt-4 inline-flex rounded-xl bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-800">
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

        {/* Header */}
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="min-w-0">
            <Link href="/projects" className="text-sm text-gray-500 hover:text-gray-900 transition">
              ← Back to projects
            </Link>
            <h1 className="mt-2 truncate text-xl font-semibold text-gray-900">{project.name}</h1>
            <div className="mt-2 flex flex-wrap items-center gap-2">
              <Badge className={stageColor(project.stage)}>{project.stage}</Badge>
              <Badge className={riskColor(project.score.risk_band)}>{project.score.risk_band} risk</Badge>
              <Badge className="bg-gray-100 text-gray-700">{project.country}</Badge>
              <Badge className="bg-gray-100 text-gray-700">{project.crop_or_value_chain}</Badge>
            </div>
            <p className="mt-3 max-w-3xl text-sm text-gray-600">{project.summary}</p>
          </div>
          <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
            <div className="text-xs font-semibold text-gray-900">Monitoring</div>
            <div className="mt-2 grid gap-2 text-sm text-gray-700">
              <div><span className="text-xs text-gray-500">Method: </span><span className="font-medium">{project.monitoring.method}</span></div>
              <div><span className="text-xs text-gray-500">Frequency: </span><span className="font-medium">{project.monitoring.frequency}</span></div>
              <div><span className="text-xs text-gray-500">Last update: </span><span className="font-medium">{formatDate(project.monitoring.last_update)}</span></div>
            </div>
          </div>
        </div>

        {/* Stat cards */}
        <div className="grid gap-4 md:grid-cols-4">
          <StatCard label="Score (overall)" value={`${project.score.overall}/100`}
            helper={<span className="text-xs text-gray-500">Risk band: <Badge className={riskColor(project.score.risk_band)}>{project.score.risk_band}</Badge></span>}
          />
          <StatCard label="Funding progress" value={formatPercent(funding)}
            helper={<span className="text-xs text-gray-500">{formatCurrency(project.committed_amount, project.currency)} / {formatCurrency(project.requested_amount, project.currency)}</span>}
          />
          <StatCard label="Created" value={formatDate(project.created_at)}
            helper={<span className="text-xs text-gray-500">Project onboarding</span>}
          />
          <StatCard label="Milestones" value={project.milestones.length}
            helper={<span className="text-xs text-gray-500">Disbursement gates</span>}
          />
        </div>

        {/* Photos */}
        {project.photos && project.photos.length > 0 && (
          <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div>
                <div className="text-sm font-semibold text-gray-900">Project photos</div>
                <div className="mt-0.5 text-xs text-gray-500">Field documentation — updated with each monitoring cycle</div>
              </div>
              <Badge className="bg-emerald-100 text-emerald-700">Verified field docs</Badge>
            </div>
            <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
              {project.photos.map((photo, idx) => (
                <div key={idx} className="group">
                  <div className="relative aspect-[4/3] w-full overflow-hidden rounded-xl bg-gray-100">
                    <Image
                      src={photo.url}
                      alt={photo.caption}
                      fill
                      className="object-cover transition duration-300 group-hover:scale-105"
                      sizes="(max-width: 768px) 50vw, 25vw"
                    />
                  </div>
                  <div className="mt-1.5 text-xs text-gray-500 leading-snug">{photo.caption}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Location + Farm Stats */}
        {(project.location || project.farm_stats) && (
          <div className="grid gap-4 md:grid-cols-2">

            {project.location && (
              <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <div className="text-sm font-semibold text-gray-900">Project location</div>
                    <div className="mt-0.5 text-xs text-gray-500">{project.location.region}</div>
                  </div>
                  <Badge className="bg-blue-100 text-blue-700">GPS verified</Badge>
                </div>
                <div className="overflow-hidden rounded-xl border border-gray-100">
                  <iframe
                    width="100%"
                    height="220"
                    src={`https://www.openstreetmap.org/export/embed.html?bbox=${project.location.lng - 0.5}%2C${project.location.lat - 0.5}%2C${project.location.lng + 0.5}%2C${project.location.lat + 0.5}&layer=mapnik&marker=${project.location.lat}%2C${project.location.lng}`}
                    style={{ border: 0 }}
                    loading="lazy"
                  />
                </div>
                <div className="mt-3 grid grid-cols-2 gap-2">
                  <div className="rounded-xl border border-gray-100 bg-gray-50 px-3 py-2">
                    <div className="text-xs text-gray-500">Coordinates</div>
                    <div className="mt-0.5 text-xs font-medium text-gray-900">{project.location.lat.toFixed(4)}, {project.location.lng.toFixed(4)}</div>
                  </div>
                  <div className="rounded-xl border border-gray-100 bg-gray-50 px-3 py-2">
                    <div className="text-xs text-gray-500">Nearest market</div>
                    <div className="mt-0.5 text-xs font-medium text-gray-900">{project.location.nearest_market}</div>
                  </div>
                </div>
              </div>
            )}

            {project.farm_stats && (
              <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
                <div className="mb-3">
                  <div className="text-sm font-semibold text-gray-900">Farm details</div>
                  <div className="mt-0.5 text-xs text-gray-500">Key agricultural parameters</div>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { label: "Total area", value: `${project.farm_stats.land_area_ha.toLocaleString()} ha` },
                    { label: "Farmers", value: project.farm_stats.farmer_count.toLocaleString() },
                    { label: "Avg plot size", value: `${project.farm_stats.avg_plot_size_ha} ha` },
                    { label: "Elevation", value: `${project.farm_stats.elevation_m.toLocaleString()} m` },
                    { label: "Water source", value: project.farm_stats.water_source },
                    { label: "Soil type", value: project.farm_stats.soil_type },
                  ].map((stat) => (
                    <div key={stat.label} className="rounded-xl border border-gray-100 bg-gray-50 px-3 py-2.5">
                      <div className="text-xs text-gray-500">{stat.label}</div>
                      <div className="mt-0.5 text-sm font-medium text-gray-900">{stat.value}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Milestones + Sidebar */}
        <div className="grid gap-4 md:grid-cols-3">
          <div className="md:col-span-2">
            <MilestoneTimeline milestones={project.milestones} currency={project.currency} />
          </div>

          <div className="flex flex-col gap-4">
            <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
              <h3 className="text-sm font-semibold text-gray-900">Investment thesis</h3>
              <div className="mt-1 text-xs text-gray-500">Why this project is investable under FINNEX controls</div>
              <ul className="mt-4 space-y-2">
                {project.thesis.map((t, idx) => (
                  <li key={idx} className="flex gap-2 text-sm text-gray-700">
                    <span className="mt-1 inline-block h-2 w-2 shrink-0 rounded-full bg-gray-900" />
                    <span>{t}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
              <div className="text-sm font-semibold text-gray-900">Score breakdown</div>
              <div className="mt-1 text-xs text-gray-500">6-dimension intelligence model</div>
              <div className="mt-4 space-y-3">
                {project.score.dimensions.map((d) => (
                  <div key={d.key} className="flex items-center gap-3">
                    <div className="w-20 text-xs font-medium text-gray-700">{d.key}</div>
                    <div className="flex flex-1 items-center gap-2">
                      <div className="h-2 flex-1 overflow-hidden rounded-full bg-gray-100">
                        <div
                          className={["h-full rounded-full", d.score >= 80 ? "bg-emerald-500" : d.score >= 65 ? "bg-yellow-400" : "bg-red-400"].join(" ")}
                          style={{ width: `${Math.min(100, Math.max(0, d.score))}%` }}
                        />
                      </div>
                      <div className="w-8 text-right text-xs font-semibold text-gray-900">{d.score}</div>
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-4 text-xs text-gray-500">Overall score is a weighted index (MVP mock).</div>
            </div>

            <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
              <div className="text-sm font-semibold text-gray-900">Follow this project</div>
              <p className="mt-1 text-xs text-gray-500">Get notified when milestones are verified, funding status changes, or monitoring reports are published.</p>
              <div className="mt-4">
                <GetUpdatesModal projectName={project.name} projectId={project.id} />
              </div>
            </div>
          </div>
        </div>

      </div>
    </AppShell>
  );
}