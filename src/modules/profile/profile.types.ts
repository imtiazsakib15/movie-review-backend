import { PublicUser } from "../auth/auth.types";
import { CompletedMediaEntry } from "../completed-media/completed-media.service";
import { ReviewWithAuthorAndMedia } from "../review/review.types";
import { WatchlistEntry } from "../watchlist/watchlist.service";

export interface ProfileStats {
  totalReviews: number;
  pendingReviews: number;
  approvedReviews: number;
  rejectedReviews: number;
  watchlistCount: number;
  completedCount: number;
}

export interface ProfileOverview {
  user: PublicUser;
  stats: ProfileStats;
  recentReviews: ReviewWithAuthorAndMedia[];
  recentWatchlist: WatchlistEntry[];
  recentCompleted: CompletedMediaEntry[];
}
