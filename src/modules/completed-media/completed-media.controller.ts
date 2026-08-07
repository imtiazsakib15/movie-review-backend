import { Request, Response } from "express";
import catchAsync from "../../utils/catchAsync";
import { completedMediaService } from "./completed-media.service";
import {
  ListCompletedMediaQuery,
  MarkCompletedInput,
} from "./completed-media.validation";
import { sendSuccess } from "../../utils/apiResponse";

export const completedMediaController = {
  add: catchAsync(async (req: Request, res: Response) => {
    const entry = await completedMediaService.add(
      req.user?.id,
      req.body as MarkCompletedInput,
    );
    sendSuccess(res, 201, "Marked as completed", entry);
  }),

  list: catchAsync(async (req: Request, res: Response) => {
    const { items, meta } = await completedMediaService.list(
      req.user?.id,
      req.query as unknown as ListCompletedMediaQuery,
    );
    sendSuccess(
      res,
      200,
      "Completed media retrieved successfully",
      items,
      meta,
    );
  }),

  remove: catchAsync(async (req: Request, res: Response) => {
    await completedMediaService.remove(req.user?.id, req.params.mediaId);
    sendSuccess(res, 200, "Removed from completed media", null);
  }),
};
