import { Router } from "express";
import { authenticate } from "../../middlewares/authenticate";
import { authorize } from "../../middlewares/authorize";
import { createGenreSchema, genreIdParamSchema } from "./genre.validation";
import { validate } from "../../middlewares/validate";
import { genreController } from "./genre.controller";

const router = Router();

// Public
router.get("/", genreController.list);
router.get(
  "/:id",
  validate({ params: genreIdParamSchema }),
  genreController.getById,
);

// Admin-only
router.post(
  "/",
  authenticate,
  authorize("ADMIN"),
  validate({ body: createGenreSchema }),
  genreController.create,
);

export default router;
