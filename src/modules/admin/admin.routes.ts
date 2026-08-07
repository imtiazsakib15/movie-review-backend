import { Router } from "express";
import { authenticate } from "../../middlewares/authenticate";
import { authorize } from "../../middlewares/authorize";
import { adminController } from "./admin.controller";

const router = Router();

router.use(authenticate, authorize("ADMIN"));

router.get("/stats", adminController.getStats);

export default router;
