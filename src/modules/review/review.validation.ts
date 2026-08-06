import { z } from "zod";
import { ReviewStatus } from "../../../generated/prisma/client";
import { paginationSchema } from "../../utils/pagination";

export const createReviewSchema = z.object({
  mediaId: z.string().uuid("Invalid media id"),
  rating: z.coerce
    .number()
    .int()
    .min(1, "Rating must be at least 1")
    .max(10, "Rating must be at most 10"),
  content: z
    .string()
    .trim()
    .min(10, "Review must be at least 10 characters")
    .max(5000),
  tags: z.array(z.string().trim().min(1).max(30)).max(10).default([]),
  hasSpoiler: z.boolean().default(false),
});

export const updateReviewSchema = createReviewSchema
  .omit({ mediaId: true })
  .partial();

export const moderateReviewSchema = z.object({
  status: z.enum([ReviewStatus.APPROVED, ReviewStatus.REJECTED], {
    message: "Status must be APPROVED or REJECTED",
  }),
});

export const reviewIdParamSchema = z.object({
  id: z.string().uuid("Invalid review id"),
});

export const reviewMediaIdParamSchema = z.object({
  mediaId: z.string().uuid("Invalid media id"),
});

export const listReviewsForMediaQuerySchema = paginationSchema.extend({
  sortBy: z.enum(["createdAt", "rating"]).default("createdAt"),
  sortOrder: z.enum(["asc", "desc"]).default("desc"),
});

export const listMyReviewsQuerySchema = paginationSchema.extend({
  status: z.nativeEnum(ReviewStatus).optional(),
});

export const listModerationQuerySchema = paginationSchema.extend({
  status: z.nativeEnum(ReviewStatus).default(ReviewStatus.PENDING),
  mediaId: z.string().uuid().optional(),
});

export type CreateReviewInput = z.infer<typeof createReviewSchema>;
export type UpdateReviewInput = z.infer<typeof updateReviewSchema>;
export type ModerateReviewInput = z.infer<typeof moderateReviewSchema>;
export type ListReviewsForMediaQuery = z.infer<
  typeof listReviewsForMediaQuerySchema
>;
export type ListMyReviewsQuery = z.infer<typeof listMyReviewsQuerySchema>;
export type ListModerationQuery = z.infer<typeof listModerationQuerySchema>;
