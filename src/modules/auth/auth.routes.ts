import { Router } from "express";
import { authController } from "./auth.controller";
import { loginSchema, registerSchema } from "./auth.validation";
import { validate } from "../../middlewares/validateRequest";

const router = Router();

router.post(
  "/register",
  validate({ body: registerSchema }),
  authController.register,
);

router.post("/login", validate({ body: loginSchema }), authController.login);

export default router;
