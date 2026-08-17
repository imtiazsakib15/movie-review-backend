import { Prisma } from "../../../generated/prisma/client";
import { PublicUser } from "../auth/auth.types";

export const userActivityCountsInclude = {
  _count: {
    select: { reviews: true, watchlistItems: true, completedMedia: true },
  },
} satisfies Prisma.UserInclude;

export interface UserActivityCounts {
  reviews: number;
  watchlistItems: number;
  completedMedia: number;
}

export type UserWithActivityCounts = PublicUser & {
  _count: UserActivityCounts;
};
