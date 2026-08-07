import { Router } from "express";
import { authenticate } from "../../middlewares/authenticate";
import { validate } from "../../middlewares/validate";
import {
  listCompletedMediaQuerySchema,
  markCompletedSchema,
} from "./completed-media.validation";
import { completedMediaController } from "./completed-media.controller";

const router = Router();

router.post(
  "/",
  authenticate,
  validate({ body: markCompletedSchema }),
  completedMediaController.add,
);

router.get(
  "/",
  authenticate,
  validate({ query: listCompletedMediaQuerySchema }),
  completedMediaController.list,
);

export default router;
