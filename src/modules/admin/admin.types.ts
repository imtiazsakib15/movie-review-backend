import { UserRole } from "../../../generated/prisma/client";
import { MediaSummary } from "../media/media.types";
import { ReviewWithAuthorAndMedia } from "../review/review.types";

export interface DashboardStats {
  users: { total: number; admins: number; regular: number };
  media: {
    total: number;
    published: number;
    unpublished: number;
    movies: number;
    series: number;
  };
  genres: { total: number };
  reviews: {
    total: number;
    pending: number;
    approved: number;
    rejected: number;
  };
  watchlist: { totalEntries: number };
  completedMedia: { totalEntries: number };
}

export interface RecentUserSummary {
  id: string;
  name: string | null;
  email: string;
  role: UserRole;
  createdAt: Date;
}

export interface RecentActivity {
  pendingReviews: ReviewWithAuthorAndMedia[];
  recentUsers: RecentUserSummary[];
  recentMedia: MediaSummary[];
}
