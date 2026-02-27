// components/StatCard.tsx

import React from "react";

type StatCardProps = {
  label: string;
  value: React.ReactNode;
  helper?: React.ReactNode;
};

export default function StatCard({ label, value, helper }: StatCardProps) {
  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
      <div className="text-xs font-medium text-gray-500">{label}</div>
      <div className="mt-1 text-2xl font-semibold text-gray-900">{value}</div>
      {helper ? <div className="mt-2 text-sm text-gray-600">{helper}</div> : null}
    </div>
  );
}