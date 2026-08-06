import { prisma } from "../../config/database";
import { ApiError } from "../../errors/apiError";
import { ReviewWithAuthor, reviewWithAuthorInclude } from "./review.types";
import { CreateReviewInput } from "./review.validation";

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
        tags: input.tags,
        hasSpoiler: input.hasSpoiler,
      },
      include: reviewWithAuthorInclude,
    });

    return review;
  },
};
