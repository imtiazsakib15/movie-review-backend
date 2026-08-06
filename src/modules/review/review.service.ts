import { Prisma, ReviewStatus } from "../../../generated/prisma/client";
import { prisma } from "../../config/database";
import { ApiError } from "../../errors/apiError";
import {
  buildPaginationMeta,
  getPaginationParams,
  PaginationMeta,
} from "../../utils/pagination";
import {
  ReviewWithAuthor,
  ReviewWithAuthorAndMedia,
  reviewWithAuthorAndMediaInclude,
  reviewWithAuthorInclude,
} from "./review.types";
import {
  CreateReviewInput,
  ListModerationQuery,
  ListMyReviewsQuery,
  ListReviewsForMediaQuery,
} from "./review.validation";

export const reviewService = {
  async create(
    userId: string | undefined,
    input: CreateReviewInput,
  ): Promise<ReviewWithAuthor> {
    if (!userId) {
      throw ApiError.unauthorized("Authentication required");
    }

    const media = await prisma.media.findUnique({
      where: { id: input.mediaId },
    });
    if (!media || media.deletedAt || !media.isPublished) {
      throw ApiError.notFound("Media not found");
    }

    const existing = await prisma.review.findUnique({
      where: { userId_mediaId: { userId, mediaId: input.mediaId } },
    });
    if (existing) {
      throw ApiError.conflict(
        existing.deletedAt
          ? "You previously reviewed this media; a deleted review still blocks a new one for the same media."
          : "You have already reviewed this media",
      );
    }

    const review = await prisma.review.create({
      data: {
        userId,
        mediaId: input.mediaId,
        rating: input.rating,
        content: input.content,
        hasSpoiler: input.hasSpoiler,
      },
      include: reviewWithAuthorInclude,
    });

    return review;
  },

  async listForMedia(
    mediaId: string,
    query: ListReviewsForMediaQuery,
  ): Promise<{ items: ReviewWithAuthor[]; meta: PaginationMeta }> {
    const where: Prisma.ReviewWhereInput = {
      mediaId,
      status: ReviewStatus.APPROVED,
      deletedAt: null,
    };

    const { skip, take } = getPaginationParams(query);
    const orderBy: Prisma.ReviewOrderByWithRelationInput = {
      [query.sortBy]: query.sortOrder,
    };

    const [items, total] = await Promise.all([
      prisma.review.findMany({
        where,
        orderBy,
        skip,
        take,
        include: reviewWithAuthorInclude,
      }),
      prisma.review.count({ where }),
    ]);

    return { items, meta: buildPaginationMeta(query, total) };
  },

  async listMine(
    userId: string | undefined,
    query: ListMyReviewsQuery,
  ): Promise<{ items: ReviewWithAuthorAndMedia[]; meta: PaginationMeta }> {
    if (!userId) {
      throw ApiError.unauthorized("Authentication required");
    }

    const where: Prisma.ReviewWhereInput = {
      userId,
      deletedAt: null,
      ...(query.status ? { status: query.status } : {}),
    };

    const { skip, take } = getPaginationParams(query);

    const [items, total] = await Promise.all([
      prisma.review.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip,
        take,
        include: reviewWithAuthorAndMediaInclude,
      }),
      prisma.review.count({ where }),
    ]);

    return { items, meta: buildPaginationMeta(query, total) };
  },

  async listForModeration(
    query: ListModerationQuery,
  ): Promise<{ items: ReviewWithAuthorAndMedia[]; meta: PaginationMeta }> {
    const where: Prisma.ReviewWhereInput = {
      deletedAt: null,
      status: query.status,
      ...(query.mediaId ? { mediaId: query.mediaId } : {}),
    };

    const { skip, take } = getPaginationParams(query);

    const [items, total] = await Promise.all([
      prisma.review.findMany({
        where,
        orderBy: { createdAt: "asc" },
        skip,
        take,
        include: reviewWithAuthorAndMediaInclude,
      }),
      prisma.review.count({ where }),
    ]);

    return { items, meta: buildPaginationMeta(query, total) };
  },
};
