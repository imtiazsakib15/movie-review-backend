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
  ModerateReviewInput,
  UpdateReviewInput,
} from "./review.validation";

/** Rounds to 2 decimal places so avgRating doesn't drift into long floats. */
const round2 = (value: number): number => Math.round(value * 100) / 100;

/**
 * Applies the rating delta for a single review joining or leaving the
 * APPROVED pool. `sign` is +1 when a review becomes approved, -1 when an
 * approved review is un-approved (rejected or deleted). Must run inside
 * the same transaction as the Review status/deletedAt change it accompanies.
 */

const applyRatingDelta = async (
  tx: Prisma.TransactionClient,
  mediaId: string,
  rating: number,
  sign: 1 | -1,
): Promise<void> => {
  const media = await tx.media.findUniqueOrThrow({ where: { id: mediaId } });

  const newRatingCount = media.ratingCount + sign;
  const newAvgRating =
    newRatingCount > 0
      ? round2(
          (media.avgRating * media.ratingCount + rating * sign) /
            newRatingCount,
        )
      : 0;

  await tx.media.update({
    where: { id: mediaId },
    data: {
      ratingCount: newRatingCount,
      avgRating: newAvgRating,
      reviewCount: media.reviewCount + sign,
    },
  });
};

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

  async updateStatus(
    id: string,
    input: ModerateReviewInput,
  ): Promise<ReviewWithAuthorAndMedia> {
    const existing = await prisma.review.findUnique({ where: { id } });
    if (!existing || existing.deletedAt) {
      throw ApiError.notFound("Review not found");
    }
    if (existing.status === input.status) {
      throw ApiError.badRequest(`Review is already ${input.status}`);
    }

    return prisma.$transaction(async (tx) => {
      if (input.status === ReviewStatus.APPROVED) {
        await applyRatingDelta(tx, existing.mediaId, existing.rating, 1);
      } else if (existing.status === ReviewStatus.APPROVED) {
        // Only REJECTED remains as a target; un-approving a previously
        // approved review removes its rating from the aggregate.
        await applyRatingDelta(tx, existing.mediaId, existing.rating, -1);
      }

      return tx.review.update({
        where: { id },
        data: {
          status: input.status,
          publishedAt:
            input.status === ReviewStatus.APPROVED ? new Date() : null,
        },
        include: reviewWithAuthorAndMediaInclude,
      });
    });
  },
};
