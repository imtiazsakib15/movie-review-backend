import { z } from "zod";
import { MediaAccess, MediaType } from "../../../generated/prisma/client";

const urlField = z
  .string()
  .trim()
  .url("Must be a valid URL")
  .max(500)
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
  type: z.nativeEnum(MediaType),
  access: z.nativeEnum(MediaAccess).default("FREE"),
  releaseYear: z.coerce
    .number()
    .int()
    .min(1888, "Release year is invalid")
    .max(new Date().getFullYear() + 5),
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

export type CreateMediaInput = z.infer<typeof createMediaSchema>;
export type UpdateMediaInput = z.infer<typeof updateMediaSchema>;
