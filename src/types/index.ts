import type { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
    } & DefaultSession["user"];
  }
}

export interface ApiResponse<T = unknown> {
  data?: T;
  error?: string;
  message?: string;
}

export type OpportunityStatus =
  | "identified"
  | "validated"
  | "prioritized"
  | "in_progress"
  | "done"
  | "discarded";

export type BacklogStatus =
  | "draft"
  | "ready"
  | "in_progress"
  | "blocked"
  | "done";

export type BacklogPriority = "critical" | "high" | "medium" | "low";

export type ContextUrgency = "low" | "medium" | "high" | "critical";

export type TechnicalLevel = "basic" | "intermediate" | "advanced";

export type OpportunityCategory =
  | "automation"
  | "acquisition"
  | "sales"
  | "reporting"
  | "operations"
  | "internal_control"
  | "content"
  | "digital_presence"
  | "digital_product"
  | "service";

export type ValueType =
  | "time_saving"
  | "revenue"
  | "cost_reduction"
  | "risk_reduction"
  | "quality"
  | "visibility";
