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
  target_date: string; // ISO date string
  amount: number; // in minor units? (we'll treat as major currency for MVP)
  status: MilestoneStatus;
  evidence?: string[]; // urls or filenames
}

export interface ScoreBreakdown {
  overall: number; // 0-100
  risk_band: RiskBand;
  dimensions: Array<{
    key: "Agronomy" | "Operator" | "Market" | "Finance" | "Monitoring" | "Impact";
    score: number; // 0-100
    notes?: string;
  }>;
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
    last_update: string; // ISO date string
  };

  milestones: Milestone[];

  tags?: string[];
  created_at: string; // ISO date string
}