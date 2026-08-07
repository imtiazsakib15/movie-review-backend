import { z } from "zod";

export const recentActivityQuerySchema = z.object({
  limit: z.coerce.number().int().min(1).max(20).default(5),
});

export type RecentActivityQuery = z.infer<typeof recentActivityQuerySchema>;
