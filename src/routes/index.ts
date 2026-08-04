import { Router } from "express";
import AuthRoutes from "../modules/auth/auth.routes";

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
];

moduleRoutes.forEach((route) => router.use(route.path, route.route));

export default router;
