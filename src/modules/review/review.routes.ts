import { Router } from "express";
import { authenticate } from "../../middlewares/authenticate";
import { validate } from "../../middlewares/validate";
import { createReviewSchema } from "./review.validation";
import { reviewController } from "./review.controller";

const router = Router();

// Any authenticated user
router.post(
  "/",
  authenticate,
  validate({ body: createReviewSchema }),
  reviewController.create,
);

export default router;
