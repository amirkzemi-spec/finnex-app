// lib/types.ts

export type Currency = "USD" | "EUR" | "GBP" | "AED";

export type ProjectStage =
  | "Sourcing"
  | "Due diligence"
  | "Fundraising"
  | "Active"
  | "Completed"
  | "Paused";

export type MilestoneStatus = "Planned" | "In review" | "Approved" | "Paid" | "Blocked";

export type RiskBand = "Low" | "Medium" | "High";

export interface Milestone {
  id: string;
  title: string;
  description?: string;
  target_date: string;
  amount: number;
  status: MilestoneStatus;
  evidence?: string[];
}

export interface ScoreBreakdown {
  overall: number;
  risk_band: RiskBand;
  dimensions: Array<{
    key: "Agronomy" | "Operator" | "Market" | "Finance" | "Monitoring" | "Impact";
    score: number;
    notes?: string;
  }>;
}

export interface ProjectLocation {
  region: string;
  lat: number;
  lng: number;
  nearest_market: string;
}

export interface FarmStats {
  land_area_ha: number;
  farmer_count: number;
  avg_plot_size_ha: number;
  water_source: string;
  soil_type: string;
  elevation_m: number;
}

export interface ProjectPhoto {
  url: string;
  caption: string;
  type: "field" | "farmers" | "operations" | "infrastructure" | "monitoring";
}

export interface Project {
  id: string;
  name: string;
  country: string;
  crop_or_value_chain: string;
  stage: ProjectStage;

  requested_amount: number;
  committed_amount: number;
  currency: Currency;

  score: ScoreBreakdown;

  summary: string;
  thesis: string[];

  monitoring: {
    method: "Field agent" | "IoT" | "Satellite" | "Hybrid";
    frequency: "Weekly" | "Biweekly" | "Monthly";
    last_update: string;
  };

  milestones: Milestone[];

  location?: ProjectLocation;
  farm_stats?: FarmStats;
  photos?: ProjectPhoto[];

  tags?: string[];
  created_at: string;
}