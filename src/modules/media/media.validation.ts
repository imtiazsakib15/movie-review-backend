import { z } from "zod";
import { MediaAccess, MediaType } from "../../../generated/prisma/client";
import { paginationSchema } from "../../utils/pagination";

const urlField = z
  .string()
  .trim()
  .url("Must be a valid URL")
  .max(500)
  .optional();

const descriptionField = z
  .string()
  .trim()
  .max(10000, "Description must not exceed 10,000 characters")
  .optional();

const languageField = z
  .string()
  .trim()
  .max(100, "Language must not exceed 100 characters")
  .optional();

const runtimeField = z.coerce
  .number()
  .int("Runtime must be a whole number")
  .positive("Runtime must be greater than 0")
  .optional();

export const createMediaSchema = z.object({
  title: z.string().trim().min(1, "Title is required").max(255),
  slug: z
    .string()
    .trim()
    .toLowerCase()
    .regex(
      /^[a-z0-9-]+$/,
      "Slug may only contain lowercase letters, numbers, and hyphens",
    )
    .max(300)
    .optional(),
  type: z.enum(MediaType),
  access: z.enum(MediaAccess).default(MediaAccess.FREE),
  description: descriptionField,
  releaseYear: z.coerce
    .number()
    .int("Release year must be a whole number")
    .min(1888, "Release year is invalid")
    .max(new Date().getFullYear() + 5, "Release year is invalid"),
  runtimeMinutes: runtimeField,
  language: languageField,
  posterUrl: urlField,
  trailerUrl: urlField,
  streamingUrl: urlField,
  isFeatured: z.boolean().default(false),
  isPublished: z.boolean().default(true),
  genreIds: z
    .array(z.string().uuid("Each genreId must be a valid UUID"))
    .default([]),
});

export const updateMediaSchema = createMediaSchema.partial();

export const listMediaQuerySchema = paginationSchema.extend({
  type: z.enum(MediaType).optional(),
  access: z.enum(MediaAccess).optional(),
  genreId: z.string().uuid("Invalid genre id").optional(),
  search: z
    .string()
    .trim()
    .min(1, "Search query cannot be empty")
    .max(255)
    .optional(),
  releaseYear: z.coerce
    .number()
    .int()
    .min(1888, "Release year is invalid")
    .max(new Date().getFullYear() + 5, "Release year is invalid")
    .optional(),
  isFeatured: z.coerce.boolean().optional(),
  sortBy: z
    .enum(["createdAt", "releaseYear", "avgRating", "reviewCount", "title"])
    .default("createdAt"),
  sortOrder: z.enum(["asc", "desc"]).default("desc"),
});

export const mediaSlugParamSchema = z.object({
  slug: z.string().trim().min(1, "Slug is required"),
});

export const mediaIdParamSchema = z.object({
  id: z.string().uuid("Invalid media id"),
});

export type CreateMediaInput = z.infer<typeof createMediaSchema>;
export type UpdateMediaInput = z.infer<typeof updateMediaSchema>;
export type ListMediaQuery = z.infer<typeof listMediaQuerySchema>;
export type MediaSlugParam = z.infer<typeof mediaSlugParamSchema>;
export type MediaIdParam = z.infer<typeof mediaIdParamSchema>;
