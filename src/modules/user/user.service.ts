import { Prisma, User } from "../../../generated/prisma/client";
import { prisma } from "../../config/database";
import { ApiError } from "../../errors/apiError";
import {
  buildPaginationMeta,
  getPaginationParams,
  PaginationMeta,
} from "../../utils/pagination";
import { PublicUser } from "../auth/auth.types";
import {
  userActivityCountsInclude,
  UserWithActivityCounts,
} from "./user.types";
import { ListUsersQuery, UpdateUserRoleInput } from "./user.validation";

const toPublicUser = (user: User): PublicUser => {
  const { password, ...publicUser } = user;
  return publicUser;
};

const toPublicUserWithCounts = (
  user: User & { _count: UserWithActivityCounts["_count"] },
): UserWithActivityCounts => {
  const { password, ...rest } = user;
  return rest;
};

export const userService = {
  async list(
    query: ListUsersQuery,
  ): Promise<{ items: UserWithActivityCounts[]; meta: PaginationMeta }> {
    const where: Prisma.UserWhereInput = {
      ...(query.role ? { role: query.role } : {}),
      ...(query.search
        ? {
            OR: [
              { name: { contains: query.search, mode: "insensitive" } },
              { email: { contains: query.search, mode: "insensitive" } },
            ],
          }
        : {}),
    };

    const { skip, take } = getPaginationParams(query);

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip,
        take,
        include: userActivityCountsInclude,
      }),
      prisma.user.count({ where }),
    ]);

    return {
      items: users.map(toPublicUserWithCounts),
      meta: buildPaginationMeta(query, total),
    };
  },

  async getById(id: string): Promise<UserWithActivityCounts> {
    const user = await prisma.user.findUnique({
      where: { id },
      include: userActivityCountsInclude,
    });
    if (!user) {
      throw ApiError.notFound("User not found");
    }
    return toPublicUserWithCounts(user);
  },

  async updateRole(
    id: string,
    requesterId: string | undefined,
    input: UpdateUserRoleInput,
  ): Promise<PublicUser> {
    if (!requesterId) {
      throw ApiError.unauthorized("Authentication required");
    }
    if (id === requesterId) {
      throw ApiError.badRequest("You cannot change your own role");
    }

    const existing = await prisma.user.findUnique({ where: { id } });
    if (!existing) {
      throw ApiError.notFound("User not found");
    }
    if (existing.role === input.role) {
      throw ApiError.badRequest(`User is already ${input.role}`);
    }

    const updated = await prisma.user.update({
      where: { id },
      data: { role: input.role },
    });
    return toPublicUser(updated);
  },
};
