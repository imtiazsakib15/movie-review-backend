import { Router } from "express";
import {
  authenticate,
  authenticateOptional,
} from "../../middlewares/authenticate";
import { authorize } from "../../middlewares/authorize";
import { validate } from "../../middlewares/validate";
import {
  createMediaSchema,
  listMediaQuerySchema,
  mediaIdParamSchema,
  mediaSlugParamSchema,
  updateMediaSchema,
} from "./media.validation";
import { mediaController } from "./media.controller";

const router = Router();

// Public
router.get(
  "/",
  authenticateOptional,
  validate({ query: listMediaQuerySchema }),
  mediaController.list,
);

router.get(
  "/slug/:slug",
  authenticateOptional,
  validate({ params: mediaSlugParamSchema }),
  mediaController.getBySlug,
);

router.get(
  "/:id",
  authenticateOptional,
  validate({ params: mediaIdParamSchema }),
  mediaController.getById,
);

// Admin-only
router.post(
  "/",
  authenticate,
  authorize("ADMIN"),
  validate({ body: createMediaSchema }),
  mediaController.create,
);

router.put(
  "/:id",
  authenticate,
  authorize("ADMIN"),
  validate({ params: mediaIdParamSchema, body: updateMediaSchema }),
  mediaController.update,
);

export default router;
