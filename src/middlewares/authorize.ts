import { NextFunction, Request, Response } from "express";
import { UserRole } from "../../generated/prisma/client";
import { ApiError } from "../errors/apiError";

export const authorize =
  (...allowedRoles: UserRole[]) =>
  (req: Request, _res: Response, next: NextFunction): void => {
    if (!req.user) {
      throw ApiError.unauthorized("Authentication required");
    }

    if (!allowedRoles.includes(req.user.role)) {
      throw ApiError.forbidden(
        "You do not have permission to perform this action",
      );
    }

    next();
  };
