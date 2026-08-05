import { Media, Prisma, UserRole } from "../../../generated/prisma/client";
import { prisma } from "../../config/database";
import { ApiError } from "../../errors/apiError";
import {
  buildPaginationMeta,
  getPaginationParams,
  PaginationMeta,
} from "../../utils/pagination";
import { slugify } from "../../utils/slugify";
import { MediaResponse, MediaWithGenres } from "./media.types";
import { CreateMediaInput, ListMediaQuery } from "./media.validation";

const toMediaResponse = (media: MediaWithGenres): MediaResponse => {
  const { mediaGenres, ...rest } = media;
  return { ...rest, genres: mediaGenres.map((mg) => mg.genre) };
};

const withGenresInclude = {
  mediaGenres: {
    include: { genre: true },
  },
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
      include: withGenresInclude,
    });

    return toMediaResponse(created);
  },

  async list(
    query: ListMediaQuery,
    requesterRole?: UserRole,
  ): Promise<{ items: MediaResponse[]; meta: PaginationMeta }> {
    const isAdmin = requesterRole === "ADMIN";
    const where: Prisma.MediaWhereInput = {
      deletedAt: null,
      ...(isAdmin ? {} : { isPublished: true }),
      ...(query.type ? { type: query.type } : {}),
      ...(query.access ? { access: query.access } : {}),
      ...(query.isFeatured !== undefined
        ? { isFeatured: query.isFeatured }
        : {}),
      ...(query.genreId
        ? { mediaGenres: { some: { genreId: query.genreId } } }
        : {}),
      ...(query.search
        ? { title: { contains: query.search, mode: "insensitive" } }
        : {}),
    };

    const { skip, take } = getPaginationParams(query);
    const orderBy: Prisma.MediaOrderByWithRelationInput = {
      [query.sortBy]: query.sortOrder,
    };

    const [items, total] = await Promise.all([
      prisma.media.findMany({
        where,
        orderBy,
        skip,
        take,
        include: withGenresInclude,
      }),
      prisma.media.count({ where }),
    ]);

    return {
      items: items.map(toMediaResponse),
      meta: buildPaginationMeta(query, total),
    };
  },

  async getBySlug(
    slug: string,
    requesterRole?: UserRole,
  ): Promise<MediaResponse> {
    const isAdmin = requesterRole === "ADMIN";
    const media = await prisma.media.findUnique({
      where: { slug },
      include: withGenresInclude,
    });
    if (!media || media.deletedAt || (!isAdmin && !media.isPublished)) {
      throw ApiError.notFound("Media not found");
    }
    return toMediaResponse(media);
  },
};
