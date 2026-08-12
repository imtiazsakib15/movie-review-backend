import { Request, Response } from "express";
import { authService } from "./auth.service";
import catchAsync from "../../utils/catchAsync";
import { sendSuccess } from "../../utils/apiResponse";
import { env } from "../../config/env";

export const authController = {
  register: catchAsync(async (req: Request, res: Response) => {
    const result = await authService.register(req.body);

    const tokens = result.tokens;
    const accessTokenMaxAge = 1 * 24 * 60 * 60 * 1000;
    const refreshTokenMaxAge = 7 * 24 * 60 * 60 * 1000;

    res
      .cookie("accessToken", tokens.accessToken, {
        httpOnly: true,
        secure: env.NODE_ENV === "production",
        sameSite: env.NODE_ENV === "production" ? "none" : "lax",
        maxAge: accessTokenMaxAge,
      })
      .cookie("refreshToken", tokens.refreshToken, {
        httpOnly: true,
        secure: env.NODE_ENV === "production",
        sameSite: env.NODE_ENV === "production" ? "none" : "lax",
        maxAge: refreshTokenMaxAge,
      });

    sendSuccess(res, 201, "Account created successfully", result.user);
  }),

  login: catchAsync(async (req: Request, res: Response) => {
    const result = await authService.login(req.body);

    const tokens = result.tokens;
    const accessTokenMaxAge = 1 * 24 * 60 * 60 * 1000;
    const refreshTokenMaxAge = 7 * 24 * 60 * 60 * 1000;

    res
      .cookie("accessToken", tokens.accessToken, {
        httpOnly: true,
        secure: env.NODE_ENV === "production",
        sameSite: env.NODE_ENV === "production" ? "none" : "lax",
        maxAge: accessTokenMaxAge,
      })
      .cookie("refreshToken", tokens.refreshToken, {
        httpOnly: true,
        secure: env.NODE_ENV === "production",
        sameSite: env.NODE_ENV === "production" ? "none" : "lax",
        maxAge: refreshTokenMaxAge,
      });
    sendSuccess(res, 200, "Logged in successfully", result.user);
  }),

  me: catchAsync(async (req: Request, res: Response) => {
    const user = await authService.getProfile(req.user?.id);
    sendSuccess(res, 200, "Profile retrieved successfully", user);
  }),

  logout: catchAsync(async (_req: Request, res: Response) => {
    const isProduction = env.NODE_ENV === "production";

    res
      .clearCookie("accessToken", {
        httpOnly: true,
        secure: isProduction,
        sameSite: isProduction ? "none" : "lax",
      })
      .clearCookie("refreshToken", {
        httpOnly: true,
        secure: isProduction,
        sameSite: isProduction ? "none" : "lax",
      })
      .status(200)
      .json({
        success: true,
        message: "Logged out successfully",
        data: null,
      });
  }),
};
