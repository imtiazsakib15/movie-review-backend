import { Router } from "express";
import { authenticate } from "../../middlewares/authenticate";
import { validate } from "../../middlewares/validate";
import { addToWatchlistSchema } from "./watchlist.validation";
import { watchlistController } from "./watchlist.controller";

const router = Router();

router.post(
  "/",
  authenticate,
  validate({ body: addToWatchlistSchema }),
  watchlistController.add,
);

export default router;
