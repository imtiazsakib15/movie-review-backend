import { z } from "zod";
import { UserRole } from "../../../generated/prisma/client";
import { paginationSchema } from "../../utils/pagination";

export const listUsersQuerySchema = paginationSchema.extend({
  role: z.enum(UserRole).optional(),
  search: z.string().trim().min(1).optional(),
});

export const userIdParamSchema = z.object({
  id: z.string().uuid("Invalid user id"),
});

export const updateUserRoleSchema = z.object({
  role: z.enum(UserRole),
});

export type ListUsersQuery = z.infer<typeof listUsersQuerySchema>;
export type UpdateUserRoleInput = z.infer<typeof updateUserRoleSchema>;
