import { Response } from "express";

interface SendResponseOptions<T> {
  statusCode: number;
  success: boolean;
  message: string;
  meta?: object;
  data?: T;
}

const sendResponse = <T>(
  res: Response,
  { statusCode, success, message, meta, data }: SendResponseOptions<T>
) => {
  return res.status(statusCode).json({
    success,
    message,
    meta,
    data,
  });
};

export default sendResponse;
