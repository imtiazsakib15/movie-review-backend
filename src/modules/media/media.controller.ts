import { Request, Response } from "express";
import { sendSuccess } from "../../utils/apiResponse";
import catchAsync from "../../utils/catchAsync";
import { mediaService } from "./media.service";
import { ListMediaQuery } from "./media.validation";

export const mediaController = {
  create: catchAsync(async (req: Request, res: Response) => {
    const media = await mediaService.create(req.body);
    sendSuccess(res, 201, "Media created successfully", media);
  }),

  list: catchAsync(async (req: Request, res: Response) => {
    const { items, meta } = await mediaService.list(
      req.query as unknown as ListMediaQuery,
      req.user?.role,
    );
    sendSuccess(res, 200, "Media retrieved successfully", items, meta);
  }),
};
