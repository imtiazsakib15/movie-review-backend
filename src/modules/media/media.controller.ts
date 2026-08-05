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

  getBySlug: catchAsync(async (req: Request, res: Response) => {
    const media = await mediaService.getBySlug(req.params.slug, req.user?.role);
    sendSuccess(res, 200, "Media retrieved successfully", media);
  }),

  getById: catchAsync(async (req: Request, res: Response) => {
    const media = await mediaService.getById(req.params.id, req.user?.role);
    sendSuccess(res, 200, "Media retrieved successfully", media);
  }),

  update: catchAsync(async (req: Request, res: Response) => {
    const media = await mediaService.update(req.params.id, req.body);
    sendSuccess(res, 200, "Media updated successfully", media);
  }),
};
