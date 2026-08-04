import { Response } from 'express';

interface ApiResponsePayload<T> {
  success: true;
  message: string;
  data: T;
  meta?: Record<string, unknown>;
}


export const sendSuccess = <T>(
  res: Response,
  statusCode: number,
  message: string,
  data: T,
  meta?: Record<string, unknown>
): Response<ApiResponsePayload<T>> => {
  return res.status(statusCode).json({
    success: true,
    message,
    data,
    ...(meta ? { meta } : {}),
  });
};
