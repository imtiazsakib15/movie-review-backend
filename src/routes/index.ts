import { Router } from "express";
import AuthRoutes from "../modules/auth/auth.routes";
import MediaRoutes from "../modules/media/media.routes";
import GenreRoutes from "../modules/genre/genre.routes";

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
];

moduleRoutes.forEach((route) => router.use(route.path, route.route));

export default router;
