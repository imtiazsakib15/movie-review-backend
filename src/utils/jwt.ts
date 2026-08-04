import jwt, { JwtPayload, SignOptions } from "jsonwebtoken";
import { ApiError } from "../errors/apiError";
import httpStatus from "http-status";
import { env } from "../config/env";

export const generateToken = (
  payload: Record<string, unknown>,
  secret: string,
  expiresIn: string,
): string => {
  try {
    return jwt.sign(payload, secret, { expiresIn } as SignOptions);
  } catch (error) {
    throw new ApiError(
      httpStatus.INTERNAL_SERVER_ERROR,
      "Error signing JWT token",
    );
  }
};

export const verifyToken = (token: string, secret: string): JwtPayload => {
  try {
    const decoded = jwt.verify(token, secret);
    return decoded as JwtPayload;
  } catch (error) {
    throw new ApiError(httpStatus.UNAUTHORIZED, "Invalid or expired token");
  }
};

export const generateTokenPair = (payload: JwtPayload) => ({
  accessToken: generateToken(
    payload,
    env.ACCESS_TOKEN_SECRET,
    env.ACCESS_TOKEN_EXPIRY,
  ),
  refreshToken: generateToken(
    payload,
    env.REFRESH_TOKEN_SECRET,
    env.REFRESH_TOKEN_EXPIRY,
  ),
});
