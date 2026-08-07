import {
  MediaType,
  ReviewStatus,
  UserRole,
} from "../../../generated/prisma/enums";
import { prisma } from "../../config/database";
import { DashboardStats } from "./admin.types";

export const adminService = {
  async getStats(): Promise<DashboardStats> {
    const [
      totalUsers,
      adminUsers,
      totalMedia,
      publishedMedia,
      movieCount,
      seriesCount,
      totalGenres,
      totalReviews,
      pendingReviews,
      approvedReviews,
      rejectedReviews,
      totalWatchlistEntries,
      totalCompletedEntries,
    ] = await Promise.all([
      prisma.user.count(),
      prisma.user.count({ where: { role: UserRole.ADMIN } }),
      prisma.media.count({ where: { deletedAt: null } }),
      prisma.media.count({ where: { deletedAt: null, isPublished: true } }),
      prisma.media.count({ where: { deletedAt: null, type: MediaType.MOVIE } }),
      prisma.media.count({
        where: { deletedAt: null, type: MediaType.SERIES },
      }),
      prisma.genre.count(),
      prisma.review.count({ where: { deletedAt: null } }),
      prisma.review.count({
        where: { deletedAt: null, status: ReviewStatus.PENDING },
      }),
      prisma.review.count({
        where: { deletedAt: null, status: ReviewStatus.APPROVED },
      }),
      prisma.review.count({
        where: { deletedAt: null, status: ReviewStatus.REJECTED },
      }),
      prisma.watchlist.count(),
      prisma.completedMedia.count(),
    ]);

    return {
      users: {
        total: totalUsers,
        admins: adminUsers,
        regular: totalUsers - adminUsers,
      },
      media: {
        total: totalMedia,
        published: publishedMedia,
        unpublished: totalMedia - publishedMedia,
        movies: movieCount,
        series: seriesCount,
      },
      genres: { total: totalGenres },
      reviews: {
        total: totalReviews,
        pending: pendingReviews,
        approved: approvedReviews,
        rejected: rejectedReviews,
      },
      watchlist: { totalEntries: totalWatchlistEntries },
      completedMedia: { totalEntries: totalCompletedEntries },
    };
  },
};
