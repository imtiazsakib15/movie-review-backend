import { Request, Response } from "express";
import catchAsync from "../../utils/catchAsync";
import { reviewService } from "./review.service";
import {
  CreateReviewInput,
  ListModerationQuery,
  ListMyReviewsQuery,
  ListReviewsForMediaQuery,
  ModerateReviewInput,
  UpdateReviewInput,
} from "./review.validation";
import { sendSuccess } from "../../utils/apiResponse";

export const reviewController = {
  create: catchAsync(async (req: Request, res: Response) => {
    const review = await reviewService.create(
      req.user?.id,
      req.body as CreateReviewInput,
    );
    sendSuccess(res, 201, "Review submitted for moderation", review);
  }),

  listForMedia: catchAsync(async (req: Request, res: Response) => {
    const { items, meta } = await reviewService.listForMedia(
      req.params.mediaId,
      req.query as unknown as ListReviewsForMediaQuery,
    );
    sendSuccess(res, 200, "Reviews retrieved successfully", items, meta);
  }),

  listMine: catchAsync(async (req: Request, res: Response) => {
    const { items, meta } = await reviewService.listMine(
      req.user?.id,
      req.query as unknown as ListMyReviewsQuery,
    );
    sendSuccess(res, 200, "Your reviews retrieved successfully", items, meta);
  }),

  listForModeration: catchAsync(async (req: Request, res: Response) => {
    const { items, meta } = await reviewService.listForModeration(
      req.query as unknown as ListModerationQuery,
    );
    sendSuccess(
      res,
      200,
      "Moderation queue retrieved successfully",
      items,
      meta,
    );
  }),

  getById: catchAsync(async (req: Request, res: Response) => {
    const review = await reviewService.getById(
      req.params.id,
      req.user?.id,
      req.user?.role,
    );
    sendSuccess(res, 200, "Review retrieved successfully", review);
  }),

  update: catchAsync(async (req: Request, res: Response) => {
    const review = await reviewService.update(
      req.params.id,
      req.user?.id,
      req.body as UpdateReviewInput,
    );
    sendSuccess(res, 200, "Review updated successfully", review);
  }),

  updateStatus: catchAsync(async (req: Request, res: Response) => {
    const review = await reviewService.updateStatus(
      req.params.id,
      req.body as ModerateReviewInput,
    );
    sendSuccess(res, 200, `Review ${review.status.toLowerCase()}`, review);
  }),
};
