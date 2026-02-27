// app/settings/page.tsx

import AppShell from "@/components/AppShell";
import Badge from "@/components/Badge";

export default function SettingsPage() {
  return (
    <AppShell>
      <div className="flex flex-col gap-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="text-xl font-semibold text-gray-900">Settings</h1>
            <p className="mt-1 text-sm text-gray-600">
              UI placeholder — authentication and user preferences come later.
            </p>
          </div>
          <Badge className="bg-gray-100 text-gray-700">No auth yet</Badge>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
            <div className="text-sm font-semibold text-gray-900">Profile</div>
            <div className="mt-2 text-sm text-gray-600">
              In the next phase, this will show your organization, role, and permissions.
            </div>
            <div className="mt-4 rounded-xl border border-gray-100 bg-gray-50 p-4">
              <div className="text-xs text-gray-500">Current (MVP)</div>
              <div className="mt-1 text-sm font-medium text-gray-900">
                Role: Investor (placeholder)
              </div>
              <div className="mt-1 text-sm text-gray-700">Email: —</div>
            </div>
          </div>

          <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
            <div className="text-sm font-semibold text-gray-900">Preferences</div>
            <div className="mt-2 text-sm text-gray-600">
              Language, currency display, and notification preferences.
            </div>

            <div className="mt-4 space-y-3">
              <div className="rounded-xl border border-gray-100 p-4">
                <div className="text-xs text-gray-500">Language</div>
                <div className="mt-1 text-sm font-medium text-gray-900">English</div>
              </div>

              <div className="rounded-xl border border-gray-100 p-4">
                <div className="text-xs text-gray-500">Default currency</div>
                <div className="mt-1 text-sm font-medium text-gray-900">USD</div>
              </div>

              <div className="rounded-xl border border-gray-100 p-4">
                <div className="text-xs text-gray-500">Notifications</div>
                <div className="mt-1 text-sm font-medium text-gray-900">
                  Disabled (MVP)
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
          <div className="text-sm font-semibold text-gray-900">Roadmap</div>
          <div className="mt-2 text-sm text-gray-600">
            Settings will be activated after we add authentication + backend.
          </div>
          <div className="mt-4 flex flex-wrap gap-2">
            <Badge className="bg-blue-100 text-blue-700">Auth + Roles</Badge>
            <Badge className="bg-purple-100 text-purple-700">API Integration</Badge>
            <Badge className="bg-emerald-100 text-emerald-700">Notifications</Badge>
          </div>
        </div>
      </div>
    </AppShell>
  );
}