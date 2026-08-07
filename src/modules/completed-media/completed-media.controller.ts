import { Request, Response } from "express";
import catchAsync from "../../utils/catchAsync";
import { completedMediaService } from "./completed-media.service";
import { MarkCompletedInput } from "./completed-media.validation";
import { sendSuccess } from "../../utils/apiResponse";

export const completedMediaController = {
  add: catchAsync(async (req: Request, res: Response) => {
    const entry = await completedMediaService.add(
      req.user?.id,
      req.body as MarkCompletedInput,
    );
    sendSuccess(res, 201, "Marked as completed", entry);
  }),
};
