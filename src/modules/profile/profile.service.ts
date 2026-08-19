import { ReviewStatus, User } from "../../../generated/prisma/client";
import { prisma } from "../../config/database";
import { ApiError } from "../../errors/apiError";
import { PublicUser } from "../auth/auth.types";
import { mediaSummarySelect } from "../media/media.types";
import { reviewWithAuthorAndMediaInclude } from "../review/review.types";
import { ProfileOverview } from "./profile.types";

const RECENT_LIMIT = 5;

/** Same shape watchlist/completed-media use for their own list responses — kept in sync manually since it's simple. */
const entrySelect = {
  mediaId: true,
  createdAt: true,
  media: { select: mediaSummarySelect },
};

const toPublicUser = (user: User): PublicUser => {
  const { password, ...publicUser } = user;
  return publicUser;
};

export const profileService = {
  async getOverview(userId: string | undefined): Promise<ProfileOverview> {
    if (!userId) {
      throw ApiError.unauthorized("Authentication required");
    }

    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      throw ApiError.notFound("User not found");
    }

    const [
      totalReviews,
      pendingReviews,
      approvedReviews,
      rejectedReviews,
      watchlistCount,
      completedCount,
      recentReviews,
      recentWatchlist,
      recentCompleted,
    ] = await Promise.all([
      prisma.review.count({ where: { userId, deletedAt: null } }),
      prisma.review.count({
        where: { userId, deletedAt: null, status: ReviewStatus.PENDING },
      }),
      prisma.review.count({
        where: { userId, deletedAt: null, status: ReviewStatus.APPROVED },
      }),
      prisma.review.count({
        where: { userId, deletedAt: null, status: ReviewStatus.REJECTED },
      }),
      prisma.watchlist.count({ where: { userId } }),
      prisma.completedMedia.count({ where: { userId } }),
      prisma.review.findMany({
        where: { userId, deletedAt: null },
        orderBy: { createdAt: "desc" },
        take: RECENT_LIMIT,
        include: reviewWithAuthorAndMediaInclude,
      }),
      prisma.watchlist.findMany({
        where: { userId },
        orderBy: { createdAt: "desc" },
        take: RECENT_LIMIT,
        select: entrySelect,
      }),
      prisma.completedMedia.findMany({
        where: { userId },
        orderBy: { createdAt: "desc" },
        take: RECENT_LIMIT,
        select: entrySelect,
      }),
    ]);

    return {
      user: toPublicUser(user),
      stats: {
        totalReviews,
        pendingReviews,
        approvedReviews,
        rejectedReviews,
        watchlistCount,
        completedCount,
      },
      recentReviews,
      recentWatchlist,
      recentCompleted,
    };
  },
};
