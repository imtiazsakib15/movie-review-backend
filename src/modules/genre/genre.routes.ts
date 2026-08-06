import { Router } from "express";
import { authenticate } from "../../middlewares/authenticate";
import { authorize } from "../../middlewares/authorize";
import { createGenreSchema } from "./genre.validation";
import { validate } from "../../middlewares/validate";
import { genreController } from "./genre.controller";

const router = Router();

// Admin-only
router.post(
  "/",
  authenticate,
  authorize("ADMIN"),
  validate({ body: createGenreSchema }),
  genreController.create,
);

export default router;
