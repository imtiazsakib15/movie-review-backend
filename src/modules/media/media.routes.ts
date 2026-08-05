import { Router } from "express";
import { authenticate } from "../../middlewares/authenticate";
import { authorize } from "../../middlewares/authorize";
import { validate } from "../../middlewares/validateRequest";
import { createMediaSchema } from "./media.validation";
import { mediaController } from "./media.controller";

const router = Router();

router.post(
  "/",
  authenticate,
  authorize("ADMIN"),
  validate({ body: createMediaSchema }),
  mediaController.create,
);

export default router;
