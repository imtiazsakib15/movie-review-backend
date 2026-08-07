import { prisma } from "../../config/database";
import { ApiError } from "../../errors/apiError";
import {
  buildPaginationMeta,
  getPaginationParams,
  PaginationMeta,
} from "../../utils/pagination";
import { MediaSummary, mediaSummarySelect } from "../media/media.types";
import {
  AddToWatchlistInput,
  ListWatchlistQuery,
} from "./watchlist.validation";

export interface WatchlistEntry {
  mediaId: string;
  createdAt: Date;
  media: MediaSummary;
}

const watchlistEntrySelect = {
  mediaId: true,
  createdAt: true,
  media: { select: mediaSummarySelect },
};

export const watchlistService = {
  async add(
    userId: string | undefined,
    input: AddToWatchlistInput,
  ): Promise<WatchlistEntry> {
    if (!userId) {
      throw ApiError.unauthorized("Authentication required");
    }

    const media = await prisma.media.findUnique({
      where: { id: input.mediaId },
    });
    if (!media || media.deletedAt || !media.isPublished) {
      throw ApiError.notFound("Media not found");
    }

    const existing = await prisma.watchlist.findUnique({
      where: { userId_mediaId: { userId, mediaId: input.mediaId } },
    });
    if (existing) {
      throw ApiError.conflict("This media is already in your watchlist");
    }

    return prisma.watchlist.create({
      data: { userId, mediaId: input.mediaId },
      select: watchlistEntrySelect,
    });
  },

  async list(
    userId: string | undefined,
    query: ListWatchlistQuery,
  ): Promise<{ items: WatchlistEntry[]; meta: PaginationMeta }> {
    if (!userId) {
      throw ApiError.unauthorized("Authentication required");
    }

    const where = { userId };
    const { skip, take } = getPaginationParams(query);

    const [items, total] = await Promise.all([
      prisma.watchlist.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip,
        take,
        select: watchlistEntrySelect,
      }),
      prisma.watchlist.count({ where }),
    ]);

    return { items, meta: buildPaginationMeta(query, total) };
  },
};
