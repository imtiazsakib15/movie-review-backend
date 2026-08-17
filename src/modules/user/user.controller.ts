import { Request, Response } from "express";
import { sendSuccess } from "../../utils/apiResponse";
import { userService } from "./user.service";
import { ListUsersQuery, UpdateUserRoleInput } from "./user.validation";
import catchAsync from "../../utils/catchAsync";

export const userController = {
  list: catchAsync(async (req: Request, res: Response) => {
    const { items, meta } = await userService.list(
      req.query as unknown as ListUsersQuery,
    );
    sendSuccess(res, 200, "Users retrieved successfully", items, meta);
  }),

  getById: catchAsync(async (req: Request, res: Response) => {
    const user = await userService.getById(req.params.id);
    sendSuccess(res, 200, "User retrieved successfully", user);
  }),
};
