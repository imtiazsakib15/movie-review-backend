import { z } from "zod";

export const sourceSchema = z.object({
  type: z.enum(["media", "review"]),
  id: z.string(),
  mediaId: z.string(),
  title: z.string(),
  rating: z.number().nullable(),
  snippet: z.string(),
});

export const ragResponseSchema = z.object({
  answer: z.string(),
  sources: z.array(sourceSchema),
});
