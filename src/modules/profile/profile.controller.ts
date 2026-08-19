import { Request, Response } from "express";
import { sendSuccess } from "../../utils/apiResponse";
import { profileService } from "./profile.service";
import catchAsync from "../../utils/catchAsync";

export const profileController = {
  getOverview: catchAsync(async (req: Request, res: Response) => {
    const overview = await profileService.getOverview(req.user?.id);
    sendSuccess(res, 200, "Profile overview retrieved successfully", overview);
  }),
};
