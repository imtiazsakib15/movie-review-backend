import { Router } from "express";
import { authenticate } from "../../middlewares/authenticate";
import { authorize } from "../../middlewares/authorize";
import { adminController } from "./admin.controller";
import { recentActivityQuerySchema } from "./admin.validation";
import { validate } from "../../middlewares/validate";

const router = Router();

router.use(authenticate, authorize("ADMIN"));

router.get("/stats", adminController.getStats);

router.get(
  "/recent-activity",
  validate({ query: recentActivityQuerySchema }),
  adminController.getRecentActivity,
);

export default router;
