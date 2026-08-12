import { Router } from "express";
import { authController } from "./auth.controller";
import { loginSchema, registerSchema } from "./auth.validation";
import { validate } from "../../middlewares/validate";
import { authenticate } from "../../middlewares/authenticate";

const router = Router();

router.post(
  "/register",
  validate({ body: registerSchema }),
  authController.register,
);

router.post("/login", validate({ body: loginSchema }), authController.login);

router.get("/me", authenticate, authController.me);

router.post("/logout", authController.logout);

export default router;
