import { z } from "zod";
import { paginationSchema } from "../../utils/pagination";

export const markCompletedSchema = z.object({
  mediaId: z.string().uuid("Invalid media id"),
});

export const completedMediaIdParamSchema = z.object({
  mediaId: z.string().uuid("Invalid media id"),
});

export const listCompletedMediaQuerySchema = paginationSchema;

export type MarkCompletedInput = z.infer<typeof markCompletedSchema>;
export type ListCompletedMediaQuery = z.infer<
  typeof listCompletedMediaQuerySchema
>;
