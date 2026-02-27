// lib/utils.ts

import { Currency } from "./types";

/**
 * Format currency with basic Intl formatting
 */
export function formatCurrency(
  amount: number,
  currency: Currency = "USD"
): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(amount);
}

/**
 * Format percentage (0–100 scale)
 */
export function formatPercent(value: number): string {
  return `${Math.round(value)}%`;
}

/**
 * Simple date formatting (ISO → readable)
 */
export function formatDate(date: string): string {
  const d = new Date(date);
  return d.toLocaleDateString("en-GB", {
    year: "numeric",
    month: "short",
    day: "2-digit",
  });
}

/**
 * Funding progress (0–100)
 */
export function calculateFundingProgress(
  committed: number,
  requested: number
): number {
  if (!requested || requested <= 0) return 0;
  return Math.min(100, (committed / requested) * 100);
}

/**
 * Risk band color mapping (Tailwind classes)
 */
export function riskColor(band: "Low" | "Medium" | "High"): string {
  switch (band) {
    case "Low":
      return "bg-green-100 text-green-700";
    case "Medium":
      return "bg-yellow-100 text-yellow-700";
    case "High":
      return "bg-red-100 text-red-700";
    default:
      return "bg-gray-100 text-gray-700";
  }
}

/**
 * Stage color mapping
 */
export function stageColor(stage: string): string {
  switch (stage) {
    case "Active":
      return "bg-emerald-100 text-emerald-700";
    case "Fundraising":
      return "bg-blue-100 text-blue-700";
    case "Due diligence":
      return "bg-purple-100 text-purple-700";
    case "Completed":
      return "bg-gray-200 text-gray-700";
    case "Paused":
      return "bg-red-100 text-red-700";
    default:
      return "bg-gray-100 text-gray-700";
  }
}