import { z } from "zod";

export const createGenreSchema = z.object({
  name: z.string().trim().min(1, "Name is required").max(100),
  slug: z
    .string()
    .trim()
    .toLowerCase()
    .regex(
      /^[a-z0-9-]+$/,
      "Slug may only contain lowercase letters, numbers, and hyphens",
    )
    .max(120)
    .optional(),
});

export const updateGenreSchema = createGenreSchema.partial();

export const genreIdParamSchema = z.object({
  id: z.string().uuid("Invalid genre id"),
});

export type CreateGenreInput = z.infer<typeof createGenreSchema>;
export type UpdateGenreInput = z.infer<typeof updateGenreSchema>;
