import { z } from "zod";

export const contextSchema = z.object({
  name: z.string().min(1, "Name is required").max(100),
  userType: z.string().optional(),
  city: z.string().optional(),
  mainActivity: z.string().optional(),
  sector: z.string().optional(),
  previousExperience: z.string().optional(),
  currentAssets: z.string().optional(),
  mainPains: z.string().optional(),
  repetitiveTasks: z.string().optional(),
  detectedOpportunities: z.string().optional(),
  approxBudget: z.string().optional(),
  urgency: z.enum(["low", "medium", "high", "critical"]).optional(),
  digitalChannels: z.array(z.string()).optional(),
  tools: z.array(z.string()).optional(),
  technicalLevel: z
    .enum(["basic", "intermediate", "advanced"])
    .optional(),
  availableTime: z.string().optional(),
  objectives: z.string().optional(),
  restrictions: z.string().optional(),
  notes: z.string().optional(),
  status: z.enum(["active", "archived", "draft"]).optional(),
});

export type ContextInput = z.infer<typeof contextSchema>;
