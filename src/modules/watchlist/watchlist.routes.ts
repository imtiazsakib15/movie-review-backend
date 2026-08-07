import { Router } from "express";
import { authenticate } from "../../middlewares/authenticate";
import { validate } from "../../middlewares/validate";
import {
  addToWatchlistSchema,
  listWatchlistQuerySchema,
} from "./watchlist.validation";
import { watchlistController } from "./watchlist.controller";

const router = Router();

router.post(
  "/",
  authenticate,
  validate({ body: addToWatchlistSchema }),
  watchlistController.add,
);

router.get(
  "/",
  authenticate,
  validate({ query: listWatchlistQuerySchema }),
  watchlistController.list,
);

export default router;
