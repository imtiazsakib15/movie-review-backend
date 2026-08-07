import { Router } from "express";
import { authenticate } from "../../middlewares/authenticate";
import { validate } from "../../middlewares/validate";
import { markCompletedSchema } from "./completed-media.validation";
import { completedMediaController } from "./completed-media.controller";

const router = Router();

router.post(
  "/",
  authenticate,
  validate({ body: markCompletedSchema }),
  completedMediaController.add,
);

export default router;
