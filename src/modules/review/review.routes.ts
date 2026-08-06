import { Router } from "express";
import { authenticate } from "../../middlewares/authenticate";
import { validate } from "../../middlewares/validate";
import {
  createReviewSchema,
  listModerationQuerySchema,
  listMyReviewsQuerySchema,
  listReviewsForMediaQuerySchema,
  reviewMediaIdParamSchema,
} from "./review.validation";
import { reviewController } from "./review.controller";
import { authorize } from "../../middlewares/authorize";

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

// Admin only — moderation queue, defaults to PENDING.
router.get(
  "/moderation",
  authenticate,
  authorize("ADMIN"),
  validate({ query: listModerationQuerySchema }),
  reviewController.listForModeration,
);

export default router;
