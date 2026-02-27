// app/basket/page.tsx

import Link from "next/link";
import AppShell from "@/components/AppShell";
import Badge from "@/components/Badge";

export default function BasketPage() {
  return (
    <AppShell>
      <div className="flex flex-col gap-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="text-xl font-semibold text-gray-900">Basket</h1>
            <p className="mt-1 text-sm text-gray-600">
              Placeholder for investor interest / allocation workflow.
            </p>
          </div>
          <Badge className="bg-gray-100 text-gray-700">MVP</Badge>
        </div>

        <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
          <div className="text-sm font-semibold text-gray-900">
            Basket feature is not connected yet
          </div>
          <div className="mt-2 max-w-2xl text-sm text-gray-600">
            In the next phase, basket will let investors express interest, request
            a data room, and submit allocation intent. For now, it’s UI-only.
          </div>

          <div className="mt-5 flex flex-wrap gap-3">
            <Link
              href="/projects"
              className="inline-flex rounded-xl bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-800"
            >
              Browse projects
            </Link>
            <Link
              href="/coming-soon"
              className="inline-flex rounded-xl border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-900 hover:bg-gray-50"
            >
              See roadmap
            </Link>
          </div>

          <div className="mt-6 rounded-xl border border-gray-100 bg-gray-50 p-4">
            <div className="text-xs font-semibold text-gray-900">Planned workflow</div>
            <ol className="mt-2 list-decimal space-y-1 pl-5 text-sm text-gray-700">
              <li>Add projects to basket</li>
              <li>Select ticket size / tranche preference</li>
              <li>Request data room access</li>
              <li>Submit allocation intent (non-binding)</li>
              <li>Admin review + milestone-linked allocation agreement</li>
            </ol>
          </div>
        </div>
      </div>
    </AppShell>
  );
}