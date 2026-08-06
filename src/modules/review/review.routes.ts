import { Router } from "express";
import { authenticate } from "../../middlewares/authenticate";
import { validate } from "../../middlewares/validate";
import {
  createReviewSchema,
  listMyReviewsQuerySchema,
  listReviewsForMediaQuerySchema,
  reviewMediaIdParamSchema,
} from "./review.validation";
import { reviewController } from "./review.controller";

const router = Router();

// Any authenticated user
router.post(
  "/",
  authenticate,
  validate({ body: createReviewSchema }),
  reviewController.create,
);

// Public
router.get(
  "/media/:mediaId",
  validate({
    params: reviewMediaIdParamSchema,
    query: listReviewsForMediaQuerySchema,
  }),
  reviewController.listForMedia,
);

// Auth required — the current user's own reviews, any status.
router.get(
  "/mine",
  authenticate,
  validate({ query: listMyReviewsQuerySchema }),
  reviewController.listMine,
);

export default router;
