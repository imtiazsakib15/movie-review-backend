import { User } from "../../../generated/prisma/client";
import { prisma } from "../../config/database";
import { env } from "../../config/env";
import { ApiError } from "../../errors/apiError";
import { comparePassword, hashPassword } from "../../utils/bcrypt";
import { generateTokenPair, verifyToken } from "../../utils/jwt";
import { AuthResult, AuthTokens, PublicUser } from "./auth.types";
import { LoginInput, RegisterInput } from "./auth.validation";

const toPublicUser = (user: User): PublicUser => {
  const { password, ...publicUser } = user;
  return publicUser;
};

export const authService = {
  async register(input: RegisterInput): Promise<AuthResult> {
    const existingUser = await prisma.user.findUnique({
      where: { email: input.email },
    });
    if (existingUser) {
      throw ApiError.conflict("An account with this email already exists");
    }

    const hashedPassword = await hashPassword(input.password);

    const user = await prisma.user.create({
      data: {
        name: input.name,
        email: input.email,
        password: hashedPassword,
      },
    });

    const tokens: AuthTokens = generateTokenPair({
      sub: user.id,
      role: user.role,
    });

    return { user: toPublicUser(user), tokens };
  },

  async login(input: LoginInput): Promise<AuthResult> {
    const user = await prisma.user.findUnique({
      where: { email: input.email },
    });
    if (!user) {
      throw ApiError.unauthorized("Invalid email or password");
    }

    const isPasswordValid = await comparePassword(
      input.password,
      user.password,
    );
    if (!isPasswordValid) {
      throw ApiError.unauthorized("Invalid email or password");
    }

    const tokens: AuthTokens = generateTokenPair({
      sub: user.id,
      role: user.role,
    });

    return { user: toPublicUser(user), tokens };
  },

  async getProfile(userId?: string): Promise<PublicUser> {
    if (!userId) {
      throw ApiError.unauthorized("Authentication required");
    }
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      throw ApiError.notFound("User not found");
    }
    return toPublicUser(user);
  },
};
