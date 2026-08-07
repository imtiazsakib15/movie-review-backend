import { Media, Genre, Prisma } from "../../../generated/prisma/client";

export type MediaWithGenres = Media & {
  mediaGenres: { genre: Genre }[];
};

export interface MediaResponse extends Omit<Media, never> {
  genres: Genre[];
}

export const mediaSummarySelect = {
  id: true,
  title: true,
  slug: true,
  type: true,
  posterUrl: true,
  releaseYear: true,
  avgRating: true,
} satisfies Prisma.MediaSelect;

export type MediaSummary = Prisma.MediaGetPayload<{
  select: typeof mediaSummarySelect;
}>;
