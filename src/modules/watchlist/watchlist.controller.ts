import { Request, Response } from "express";
import catchAsync from "../../utils/catchAsync";
import { watchlistService } from "./watchlist.service";
import { AddToWatchlistInput } from "./watchlist.validation";
import { sendSuccess } from "../../utils/apiResponse";

export const watchlistController = {
  add: catchAsync(async (req: Request, res: Response) => {
    const entry = await watchlistService.add(
      req.user?.id,
      req.body as AddToWatchlistInput,
    );
    sendSuccess(res, 201, "Added to watchlist", entry);
  }),
};
