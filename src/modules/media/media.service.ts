import { Media, Prisma } from "../../../generated/prisma/client";
import { prisma } from "../../config/database";
import { ApiError } from "../../errors/apiError";
import { slugify } from "../../utils/slugify";
import { MediaResponse, MediaWithGenres } from "./media.types";
import { CreateMediaInput } from "./media.validation";

const toMediaResponse = (media: MediaWithGenres): MediaResponse => {
  const { mediaGenres, ...rest } = media;
  return { ...rest, genres: mediaGenres.map((mg) => mg.genre) };
};

const findBySlugExcludingId = (
  slug: string,
  excludeId?: string,
): Promise<Media | null> => {
  return prisma.media.findFirst({
    where: { slug, ...(excludeId ? { id: { not: excludeId } } : {}) },
  });
};

const ensureUniqueSlug = async (
  baseSlug: string,
  excludeId?: string,
): Promise<string> => {
  let candidate = baseSlug;
  let attempt = 1;

  while (await findBySlugExcludingId(candidate, excludeId)) {
    attempt += 1;
    candidate = `${baseSlug}-${attempt}`;
  }

  return candidate;
};

const validateGenreIds = async (genreIds: string[]): Promise<void> => {
  if (genreIds.length === 0) return;
  const existingCount = await prisma.genre.count({
    where: { id: { in: genreIds } },
  });
  if (existingCount !== genreIds.length) {
    throw ApiError.badRequest("One or more genreIds do not exist");
  }
};

export const mediaService = {
  async create(input: CreateMediaInput): Promise<MediaResponse> {
    await validateGenreIds(input.genreIds);

    const baseSlug = slugify(input.slug ?? input.title);
    if (!baseSlug) {
      throw ApiError.badRequest("Could not derive a valid slug from the title");
    }
    const slug = await ensureUniqueSlug(baseSlug);

    const { genreIds, ...mediaData } = input;
    const data: Prisma.MediaCreateInput = { ...mediaData, slug };

    const created = await prisma.media.create({
      data: {
        ...data,
        mediaGenres: genreIds.length
          ? {
              create: genreIds.map((genreId) => ({
                genre: { connect: { id: genreId } },
              })),
            }
          : undefined,
      },
      include: {
        mediaGenres: {
          include: { genre: true },
        },
      },
    });

    return toMediaResponse(created);
  },
};
