import { Request, Response } from "express";
import catchAsync from "../../utils/catchAsync";
import { watchlistService } from "./watchlist.service";
import {
  AddToWatchlistInput,
  ListWatchlistQuery,
} from "./watchlist.validation";
import { sendSuccess } from "../../utils/apiResponse";

export const watchlistController = {
  add: catchAsync(async (req: Request, res: Response) => {
    const entry = await watchlistService.add(
      req.user?.id,
      req.body as AddToWatchlistInput,
    );
    sendSuccess(res, 201, "Added to watchlist", entry);
  }),

  list: catchAsync(async (req: Request, res: Response) => {
    const { items, meta } = await watchlistService.list(
      req.user?.id,
      req.query as unknown as ListWatchlistQuery,
    );
    sendSuccess(res, 200, "Watchlist retrieved successfully", items, meta);
  }),
};
