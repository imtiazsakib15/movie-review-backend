import jwt, { JwtPayload, SignOptions } from "jsonwebtoken";
import { AppError } from "../errors/apiError";
import httpStatus from "http-status";

const generateToken = (
  payload: Record<string, unknown>,
  secret: string,
  expiresIn: string
): string => {
  try {
    return jwt.sign(payload, secret, { expiresIn } as SignOptions);
  } catch (error) {
    throw new AppError(
      httpStatus.INTERNAL_SERVER_ERROR,
      "Error signing JWT token"
    );
  }
};

const verifyToken = (token: string, secret: string): JwtPayload => {
  try {
    const decoded = jwt.verify(token, secret);
    return decoded as JwtPayload;
  } catch (error) {
    throw new AppError(httpStatus.UNAUTHORIZED, "Invalid or expired token");
  }
};

export const JwtHelper = {
  generateToken,
  verifyToken,
};
