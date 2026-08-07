import { Router } from "express";
import AuthRoutes from "../modules/auth/auth.routes";
import MediaRoutes from "../modules/media/media.routes";
import GenreRoutes from "../modules/genre/genre.routes";
import ReviewRoutes from "../modules/review/review.routes";
import WatchlistRoutes from "../modules/watchlist/watchlist.routes";
import CompletedMediaRoutes from "../modules/completed-media/completed-media.routes";

interface ModuleRoute {
  path: string;
  route: Router;
}

const router = Router();

const moduleRoutes: ModuleRoute[] = [
  {
    path: "/auth",
    route: AuthRoutes,
  },
  {
    path: "/media",
    route: MediaRoutes,
  },
  {
    path: "/genres",
    route: GenreRoutes,
  },
  {
    path: "/reviews",
    route: ReviewRoutes,
  },
  {
    path: "/watchlist",
    route: WatchlistRoutes,
  },
  {
    path: "/completed",
    route: CompletedMediaRoutes,
  },
];

moduleRoutes.forEach((route) => router.use(route.path, route.route));

export default router;
