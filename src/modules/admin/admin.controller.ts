import { Request, Response } from "express";
import { adminService } from "./admin.service";
import catchAsync from "../../utils/catchAsync";
import { sendSuccess } from "../../utils/apiResponse";
import { RecentActivityQuery } from "./admin.validation";

export const adminController = {
  getStats: catchAsync(async (_req: Request, res: Response) => {
    const stats = await adminService.getStats();
    sendSuccess(res, 200, "Dashboard stats retrieved successfully", stats);
  }),

  getRecentActivity: catchAsync(async (req: Request, res: Response) => {
    const { limit } = req.query as unknown as RecentActivityQuery;
    const activity = await adminService.getRecentActivity(limit);
    sendSuccess(res, 200, "Recent activity retrieved successfully", activity);
  }),
};
