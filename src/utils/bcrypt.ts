import bcrypt from "bcrypt";
import { AppError } from "../errors/apiError";
import httpStatus from "http-status";
import {env} from "../config/env";

const hashPassword = async (plainPassword: string): Promise<string> => {
  try {
  const hashedPassword = await bcrypt.hash(
      plainPassword,
      env.SALT_ROUNDS
    );
    return hashedPassword;
  } catch (error) {
    throw new AppError(
      httpStatus.INTERNAL_SERVER_ERROR,
      "Error hashing password"
    );
  }
};

const comparePassword = async (
  plainPassword: string,
  hashedPassword: string
): Promise<boolean> => {
  try {
    return await bcrypt.compare(plainPassword, hashedPassword);
  } catch (error) {
    throw new AppError(
      httpStatus.INTERNAL_SERVER_ERROR,
      "Error comparing password"
    );
  }
};

export const BcryptHelper = {
  hashPassword,
  comparePassword,
};
