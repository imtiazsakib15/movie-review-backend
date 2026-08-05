import { Response } from "express";
import { PaginationMeta } from "./pagination";

interface ApiResponsePayload<T, M = undefined> {
  success: true;
  message: string;
  data: T;
  meta?: M;
}

export const sendSuccess = <T, M>(
  res: Response,
  statusCode: number,
  message: string,
  data: T,
  meta?: M,
): Response<ApiResponsePayload<T, M>> => {
  return res.status(statusCode).json({
    success: true,
    message,
    data,
    ...(meta ? { meta } : {}),
  });
};
