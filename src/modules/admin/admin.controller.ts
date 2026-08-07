import { Request, Response } from "express";
import { adminService } from "./admin.service";
import catchAsync from "../../utils/catchAsync";
import { sendSuccess } from "../../utils/apiResponse";

export const adminController = {
  getStats: catchAsync(async (_req: Request, res: Response) => {
    const stats = await adminService.getStats();
    sendSuccess(res, 200, "Dashboard stats retrieved successfully", stats);
  }),
};
