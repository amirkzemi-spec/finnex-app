// components/MilestoneTimeline.tsx

import React from "react";
import Badge from "./Badge";
import { Milestone } from "@/lib/types";
import { formatCurrency, formatDate } from "@/lib/utils";

function statusStyle(status: Milestone["status"]) {
  switch (status) {
    case "Paid":
      return "bg-emerald-100 text-emerald-700";
    case "Approved":
      return "bg-blue-100 text-blue-700";
    case "In review":
      return "bg-yellow-100 text-yellow-700";
    case "Blocked":
      return "bg-red-100 text-red-700";
    case "Planned":
    default:
      return "bg-gray-100 text-gray-700";
  }
}

type Props = {
  milestones: Milestone[];
  currency: "USD" | "EUR" | "GBP" | "AED";
};

export default function MilestoneTimeline({ milestones, currency }: Props) {
  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-sm font-semibold text-gray-900">Milestones</h3>
        <div className="text-xs text-gray-500">
          Milestone-based capital control
        </div>
      </div>

      <div className="space-y-3">
        {milestones.map((m) => (
          <div
            key={m.id}
            className="flex items-start justify-between gap-3 rounded-xl border border-gray-100 p-3"
          >
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <div className="truncate text-sm font-medium text-gray-900">
                  {m.title}
                </div>
                <Badge className={statusStyle(m.status)}>{m.status}</Badge>
              </div>

              <div className="mt-1 text-xs text-gray-500">
                Target: {formatDate(m.target_date)}
              </div>

              {m.description ? (
                <div className="mt-2 text-sm text-gray-700">{m.description}</div>
              ) : null}
            </div>

            <div className="shrink-0 text-right">
              <div className="text-sm font-semibold text-gray-900">
                {formatCurrency(m.amount, currency)}
              </div>
              <div className="mt-1 text-xs text-gray-500">Disbursement</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}