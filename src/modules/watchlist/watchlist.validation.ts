import { z } from "zod";
import { paginationSchema } from "../../utils/pagination";

export const addToWatchlistSchema = z.object({
  mediaId: z.string().uuid("Invalid media id"),
});

export const watchlistMediaIdParamSchema = z.object({
  mediaId: z.string().uuid("Invalid media id"),
});

export const listWatchlistQuerySchema = paginationSchema;

export type AddToWatchlistInput = z.infer<typeof addToWatchlistSchema>;
export type ListWatchlistQuery = z.infer<typeof listWatchlistQuerySchema>;
