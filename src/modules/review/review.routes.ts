import { Router } from "express";
import { authenticate } from "../../middlewares/authenticate";
import { validate } from "../../middlewares/validate";
import {
  createReviewSchema,
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

export default router;
