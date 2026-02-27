// lib/mock.ts

import { Project } from "./types";

export const projects: Project[] = [
  {
    id: "ghana-maize-01",
    name: "Northern Ghana Maize Cluster",
    country: "Ghana",
    crop_or_value_chain: "Maize (Smallholder Cluster)",
    stage: "Fundraising",

    requested_amount: 250000,
    committed_amount: 90000,
    currency: "USD",

    summary:
      "Structured working capital facility for a 320-farmer maize cluster with milestone-based disbursement and hybrid monitoring.",

    thesis: [
      "Strong historical yield data across 3 seasons",
      "Anchor offtaker agreement secured",
      "Blended monitoring: field agents + satellite crop health",
      "Capital disbursed in 4 performance milestones",
    ],

    score: {
      overall: 78,
      risk_band: "Medium",
      dimensions: [
        { key: "Agronomy", score: 82 },
        { key: "Operator", score: 75 },
        { key: "Market", score: 80 },
        { key: "Finance", score: 72 },
        { key: "Monitoring", score: 85 },
        { key: "Impact", score: 88 },
      ],
    },

    monitoring: {
      method: "Hybrid",
      frequency: "Monthly",
      last_update: "2026-02-10",
    },

    milestones: [
      {
        id: "m1",
        title: "Input procurement & distribution",
        description: "Seeds and fertilizer distributed to 320 farmers.",
        target_date: "2026-03-15",
        amount: 80000,
        status: "Approved",
      },
      {
        id: "m2",
        title: "Mid-season crop health validation",
        description: "Satellite NDVI and field inspection validation.",
        target_date: "2026-05-30",
        amount: 60000,
        status: "Planned",
      },
      {
        id: "m3",
        title: "Pre-harvest yield assessment",
        target_date: "2026-07-20",
        amount: 60000,
        status: "Planned",
      },
      {
        id: "m4",
        title: "Post-harvest repayment & distribution",
        target_date: "2026-09-10",
        amount: 50000,
        status: "Planned",
      },
    ],

    tags: ["Food security", "Smallholder", "Working capital"],
    created_at: "2026-01-20",
  },

  {
    id: "kenya-avocado-02",
    name: "Kenya Avocado Export Partnership",
    country: "Kenya",
    crop_or_value_chain: "Avocado (Export-Oriented)",
    stage: "Active",

    requested_amount: 400000,
    committed_amount: 400000,
    currency: "USD",

    summary:
      "Expansion capital for smallholder avocado aggregation linked to certified EU export contracts.",

    thesis: [
      "Export-grade certification already obtained",
      "3-year off-take contract with EU buyer",
      "Digital traceability implemented",
      "Revenue-sharing repayment model",
    ],

    score: {
      overall: 86,
      risk_band: "Low",
      dimensions: [
        { key: "Agronomy", score: 84 },
        { key: "Operator", score: 90 },
        { key: "Market", score: 92 },
        { key: "Finance", score: 80 },
        { key: "Monitoring", score: 83 },
        { key: "Impact", score: 88 },
      ],
    },

    monitoring: {
      method: "Field agent",
      frequency: "Biweekly",
      last_update: "2026-02-18",
    },

    milestones: [
      {
        id: "m1",
        title: "Cold-chain expansion",
        target_date: "2026-02-01",
        amount: 150000,
        status: "Paid",
      },
      {
        id: "m2",
        title: "New farmer onboarding (120 farmers)",
        target_date: "2026-03-10",
        amount: 100000,
        status: "Approved",
      },
      {
        id: "m3",
        title: "EU shipment batch #1",
        target_date: "2026-04-25",
        amount: 150000,
        status: "In review",
      },
    ],

    tags: ["Export", "Value chain upgrade", "Traceability"],
    created_at: "2025-12-05",
  },
];

/**
 * Helper to get project by id
 */
export function getProjectById(id: string) {
  return projects.find((p) => p.id === id);
}