import { z } from "zod";

export const backlogItemSchema = z.object({
  opportunityId: z.string().optional(),
  title: z.string().min(1, "Title is required").max(200),
  description: z.string().min(1, "Description is required"),
  type: z.enum([
    "feature",
    "improvement",
    "integration",
    "automation",
    "experiment",
    "data",
    "content",
    "ops",
  ]),
  priority: z.enum(["critical", "high", "medium", "low"]).optional(),
  status: z
    .enum(["draft", "ready", "in_progress", "blocked", "done"])
    .optional(),
  acceptanceCriteria: z.string().optional(),
  dependencies: z.string().optional(),
  effort: z.enum(["xs", "s", "m", "l", "xl"]).optional(),
  technicalNotes: z.string().optional(),
});

export type BacklogItemInput = z.infer<typeof backlogItemSchema>;
