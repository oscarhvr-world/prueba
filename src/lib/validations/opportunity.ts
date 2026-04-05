import { z } from "zod";

export const opportunitySchema = z.object({
  contextId: z.string().min(1, "Context is required"),
  title: z.string().min(1, "Title is required").max(200),
  description: z.string().min(1, "Description is required"),
  category: z.enum([
    "automation",
    "acquisition",
    "sales",
    "reporting",
    "operations",
    "internal_control",
    "content",
    "digital_presence",
    "digital_product",
    "service",
  ]),
  impact: z.number().min(1).max(10),
  effort: z.number().min(1).max(10),
  urgency: z.number().min(1).max(10),
  confidence: z.number().min(1).max(10),
  pain: z.number().min(1).max(10),
  painResolved: z.string().optional(),
  valueType: z
    .enum([
      "time_saving",
      "revenue",
      "cost_reduction",
      "risk_reduction",
      "quality",
      "visibility",
    ])
    .optional(),
  affectedChannel: z.string().optional(),
  solutionProposal: z.string().optional(),
  status: z
    .enum([
      "identified",
      "validated",
      "prioritized",
      "in_progress",
      "done",
      "discarded",
    ])
    .optional(),
});

export type OpportunityInput = z.infer<typeof opportunitySchema>;
