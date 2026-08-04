import bcrypt from "bcrypt";
import { ApiError } from "../errors/apiError";
import { env } from "../config/env";

export const hashPassword = async (plainPassword: string): Promise<string> => {
  try {
    const hashedPassword = await bcrypt.hash(plainPassword, env.SALT_ROUNDS);
    return hashedPassword;
  } catch (error) {
    throw ApiError.internal("Error hashing password");
  }
};

export const comparePassword = async (
  plainPassword: string,
  hashedPassword: string,
): Promise<boolean> => {
  try {
    return await bcrypt.compare(plainPassword, hashedPassword);
  } catch (error) {
    throw ApiError.internal("Error comparing password");
  }
};
