import { Router } from "express";
import {
  authenticate,
  authenticateOptional,
} from "../../middlewares/authenticate";
import { validate } from "../../middlewares/validate";
import {
  createReviewSchema,
  listModerationQuerySchema,
  listMyReviewsQuerySchema,
  listReviewsForMediaQuerySchema,
  moderateReviewSchema,
  reviewIdParamSchema,
  reviewMediaIdParamSchema,
  updateReviewSchema,
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

// Optional Authentication
router.get(
  "/:id",
  authenticateOptional,
  validate({ params: reviewIdParamSchema }),
  reviewController.getById,
);

// Author only — edit own review (blocked once APPROVED; ownership checked in service).
router.patch(
  "/:id",
  authenticate,
  validate({ params: reviewIdParamSchema, body: updateReviewSchema }),
  reviewController.update,
);

// Admin only — approve/reject, transactionally updates Media rating aggregates.
router.patch(
  "/:id/status",
  authenticate,
  authorize("ADMIN"),
  validate({ params: reviewIdParamSchema, body: moderateReviewSchema }),
  reviewController.updateStatus,
);

// Author or admin — soft delete (ownership/role checked in service).
router.delete(
  "/:id",
  authenticate,
  validate({ params: reviewIdParamSchema }),
  reviewController.remove,
);

export default router;
