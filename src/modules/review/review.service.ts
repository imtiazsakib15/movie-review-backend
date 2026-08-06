import {
  Prisma,
  ReviewStatus,
  UserRole,
} from "../../../generated/prisma/client";
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
  UpdateReviewInput,
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

  async getById(
    id: string,
    requesterId: string | undefined,
    requesterRole: UserRole | undefined,
  ): Promise<ReviewWithAuthorAndMedia> {
    const review = await prisma.review.findUnique({
      where: { id },
      include: reviewWithAuthorAndMediaInclude,
    });

    if (!review || review.deletedAt) {
      throw ApiError.notFound("Review not found");
    }

    const isVisibleToPublic = review.status === ReviewStatus.APPROVED;
    const isOwner = review.userId === requesterId;
    const isAdmin = requesterRole === UserRole.ADMIN;

    if (!isVisibleToPublic && !isOwner && !isAdmin) {
      throw ApiError.notFound("Review not found");
    }

    return review;
  },

  async update(
    id: string,
    userId: string | undefined,
    input: UpdateReviewInput,
  ): Promise<ReviewWithAuthor> {
    if (!userId) {
      throw ApiError.unauthorized("Authentication required");
    }

    const existing = await prisma.review.findUnique({ where: { id } });
    if (!existing || existing.deletedAt) {
      throw ApiError.notFound("Review not found");
    }
    if (existing.userId !== userId) {
      throw ApiError.forbidden("You can only edit your own reviews");
    }
    if (existing.status === ReviewStatus.APPROVED) {
      throw ApiError.conflict(
        "Approved reviews cannot be edited. Delete it and contact an admin if a correction is needed.",
      );
    }

    // A previously-rejected review goes back into the moderation queue once
    // the author edits and resubmits it.
    const resubmitting = existing.status === ReviewStatus.REJECTED;

    const review = await prisma.review.update({
      where: { id },
      data: {
        ...input,
        ...(resubmitting ? { status: ReviewStatus.PENDING } : {}),
      },
      include: reviewWithAuthorInclude,
    });

    return review;
  },
};
