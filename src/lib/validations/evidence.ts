import { z } from "zod";

export const evidenceSchema = z.object({
  contextId: z.string().min(1, "Context is required"),
  type: z.enum([
    "link",
    "note",
    "observation",
    "finding",
    "competitor",
    "manual_process",
    "idea",
    "screenshot_desc",
  ]),
  title: z.string().min(1, "Title is required").max(200),
  content: z.string().min(1, "Content is required"),
  url: z.string().url().optional().or(z.literal("")),
  tags: z.array(z.string()).optional(),
});

export type EvidenceInput = z.infer<typeof evidenceSchema>;
