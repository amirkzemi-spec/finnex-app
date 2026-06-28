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

    // Location & farm details
    location: {
      region: "Northern Region, Ghana",
      lat: 9.4034,
      lng: -0.8424,
      nearest_market: "Tamale Central Market",
    },
    farm_stats: {
      land_area_ha: 480,
      farmer_count: 320,
      avg_plot_size_ha: 1.5,
      water_source: "Rain-fed + borehole irrigation",
      soil_type: "Sandy loam",
      elevation_m: 183,
    },
    photos: [
      {
        url: "https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=800&q=80",
        caption: "Maize fields — Northern Ghana",
        type: "field",
      },
      {
        url: "https://images.unsplash.com/photo-1464226184884-fa280b87c399?w=800&q=80",
        caption: "Farmer cooperative meeting",
        type: "farmers",
      },
      {
        url: "https://images.unsplash.com/photo-1574943320219-553eb213f72d?w=800&q=80",
        caption: "Input distribution — seeds & fertilizer",
        type: "operations",
      },
      {
        url: "https://images.unsplash.com/photo-1625246333195-78d9c38ad449?w=800&q=80",
        caption: "Field monitoring visit",
        type: "monitoring",
      },
    ],
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

    // Location & farm details
    location: {
      region: "Murang'a County, Kenya",
      lat: -0.7167,
      lng: 37.1500,
      nearest_market: "Murang'a Town Market",
    },
    farm_stats: {
      land_area_ha: 310,
      farmer_count: 210,
      avg_plot_size_ha: 1.48,
      water_source: "Drip irrigation + seasonal rainfall",
      soil_type: "Red volcanic loam",
      elevation_m: 1520,
    },
    photos: [
      {
        url: "https://images.unsplash.com/photo-1601493700631-2851526337da?w=800&q=80",
        caption: "Avocado orchard — Murang'a County",
        type: "field",
      },
      {
        url: "https://images.unsplash.com/photo-1518568814500-bf0f8d125f46?w=800&q=80",
        caption: "Harvest & grading operations",
        type: "operations",
      },
      {
        url: "https://images.unsplash.com/photo-1559827291-72ee739d0d9a?w=800&q=80",
        caption: "Cold-chain storage facility",
        type: "infrastructure",
      },
      {
        url: "https://images.unsplash.com/photo-1542838132-92c53300491e?w=800&q=80",
        caption: "Export-grade packaging",
        type: "operations",
      },
    ],
  },
];

export function getProjectById(id: string) {
  return projects.find((p) => p.id === id);
}