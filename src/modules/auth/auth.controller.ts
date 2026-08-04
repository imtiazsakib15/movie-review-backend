import { Request, Response } from "express";
import { authService } from "./auth.service";
import catchAsync from "../../utils/catchAsync";
import { sendSuccess } from "../../utils/apiResponse";

export const authController = {
  register: catchAsync(async (req: Request, res: Response) => {
    const result = await authService.register(req.body);
    sendSuccess(res, 201, "Account created successfully", result);
  }),

  login: catchAsync(async (req: Request, res: Response) => {
    const result = await authService.login(req.body);
    sendSuccess(res, 200, "Logged in successfully", result);
  }),
};
