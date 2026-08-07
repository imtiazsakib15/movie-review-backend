import { prisma } from "../../config/database";
import { ApiError } from "../../errors/apiError";
import {
  buildPaginationMeta,
  getPaginationParams,
  PaginationMeta,
} from "../../utils/pagination";
import { MediaSummary, mediaSummarySelect } from "../media/media.types";
import {
  ListCompletedMediaQuery,
  MarkCompletedInput,
} from "./completed-media.validation";

export interface CompletedMediaEntry {
  mediaId: string;
  createdAt: Date;
  media: MediaSummary;
}

const completedMediaEntrySelect = {
  mediaId: true,
  createdAt: true,
  media: { select: mediaSummarySelect },
};

export const completedMediaService = {
  async add(
    userId: string | undefined,
    input: MarkCompletedInput,
  ): Promise<CompletedMediaEntry> {
    if (!userId) {
      throw ApiError.unauthorized("Authentication required");
    }

    const media = await prisma.media.findUnique({
      where: { id: input.mediaId },
    });
    if (!media || media.deletedAt || !media.isPublished) {
      throw ApiError.notFound("Media not found");
    }

    const existing = await prisma.completedMedia.findUnique({
      where: { userId_mediaId: { userId, mediaId: input.mediaId } },
    });
    if (existing) {
      throw ApiError.conflict("This media is already marked as completed");
    }

    return prisma.completedMedia.create({
      data: { userId, mediaId: input.mediaId },
      select: completedMediaEntrySelect,
    });
  },

  async list(
    userId: string | undefined,
    query: ListCompletedMediaQuery,
  ): Promise<{ items: CompletedMediaEntry[]; meta: PaginationMeta }> {
    if (!userId) {
      throw ApiError.unauthorized("Authentication required");
    }

    const where = { userId };
    const { skip, take } = getPaginationParams(query);

    const [items, total] = await Promise.all([
      prisma.completedMedia.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip,
        take,
        select: completedMediaEntrySelect,
      }),
      prisma.completedMedia.count({ where }),
    ]);

    return { items, meta: buildPaginationMeta(query, total) };
  },
};
