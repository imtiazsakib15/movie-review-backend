import { Router } from "express";
const router = Router();

interface ModuleRoute {
  path: string;
  route: Router;
}

const moduleRoutes: ModuleRoute[] = [];

moduleRoutes.forEach((route) => router.use(route.path, route.route));

export default router;
