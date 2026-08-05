import { Router } from "express";
import { authenticate } from "../../middlewares/authenticate";
import { authorize } from "../../middlewares/authorize";
import { validate } from "../../middlewares/validate";
import {
  createMediaSchema,
  listMediaQuerySchema,
  mediaSlugParamSchema,
} from "./media.validation";
import { mediaController } from "./media.controller";

const router = Router();

// Public
router.get(
  "/",
  validate({ query: listMediaQuerySchema }),
  mediaController.list,
);

router.get(
  "/slug/:slug",
  validate({ params: mediaSlugParamSchema }),
  mediaController.getBySlug,
);

// Admin-only
router.post(
  "/",
  authenticate,
  authorize("ADMIN"),
  validate({ body: createMediaSchema }),
  mediaController.create,
);

export default router;
