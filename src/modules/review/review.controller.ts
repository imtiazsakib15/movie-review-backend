import { Request, Response } from "express";
import catchAsync from "../../utils/catchAsync";
import { reviewService } from "./review.service";
import {
  CreateReviewInput,
  ListReviewsForMediaQuery,
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
};
