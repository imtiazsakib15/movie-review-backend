import { Router } from "express";
import { userController } from "./user.controller";
import { validate } from "../../middlewares/validate";
import { authenticate } from "../../middlewares/authenticate";
import { authorize } from "../../middlewares/authorize";
import {
  listUsersQuerySchema,
  updateUserRoleSchema,
  userIdParamSchema,
} from "./user.validation";

const router = Router();

router.use(authenticate, authorize("ADMIN"));

router.get("/", validate({ query: listUsersQuerySchema }), userController.list);

export default router;
