import { Request, Response } from "express";
import { sendSuccess } from "../../utils/apiResponse";
import catchAsync from "../../utils/catchAsync";
import { mediaService } from "./media.service";

export const mediaController = {
  create: catchAsync(async (req: Request, res: Response) => {
    const media = await mediaService.create(req.body);
    sendSuccess(res, 201, "Media created successfully", media);
  }),
};
