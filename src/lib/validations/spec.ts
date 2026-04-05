import { z } from "zod";

export const specSchema = z.object({
  opportunityId: z.string().min(1, "Opportunity is required"),
  problem: z.string().min(1, "Problem is required"),
  targetUser: z.string().min(1, "Target user is required"),
  mvpObjective: z.string().min(1, "MVP objective is required"),
  scope: z.string().min(1, "Scope is required"),
  outOfScope: z.string().optional(),
  features: z.string().min(1, "Features are required"),
  mainFlow: z.string().min(1, "Main flow is required"),
  requiredData: z.string().optional(),
  metrics: z.string().optional(),
  risks: z.string().optional(),
  assumptions: z.string().optional(),
  suggestedStack: z.string().optional(),
  nextIteration: z.string().optional(),
  markdownContent: z.string().min(1, "Markdown content is required"),
  generatedBy: z.enum(["mock", "openai"]).optional(),
});

export type SpecInput = z.infer<typeof specSchema>;
