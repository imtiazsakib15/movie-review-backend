import { ErrorRequestHandler, NextFunction, Request, Response } from "express";
import {env} from "../config/env";
import { ApiError } from "../errors/apiError";
import { ZodError } from "zod";
import { Prisma } from "../../generated/prisma/client";

type ErrorSource = {
  path: string;
  message: string;
};
const globalErrorHandler: ErrorRequestHandler = (err, req, res, next) => {
  if (env.NODE_ENV === "development") {
    console.error("Global Error 💥", err);
  }

  let statusCode = err.statusCode || 500;
  let message = err.message || "Internal Server Error";

    if (err instanceof ApiError) {
    statusCode = err.statusCode;
    message = err.message;
  } else if (err instanceof ZodError) {
    statusCode = 400;
    message = 'Validation failed';
  } else if (err instanceof Prisma.PrismaClientKnownRequestError) {
    if (err.code === 'P2002') {
      statusCode = 409;
      message = `Duplicate value for field(s): ${(err.meta?.target as string[])?.join(', ') ?? 'unknown'}`;
    } else if (err.code === 'P2025') {
      statusCode = 404;
      message = 'Record not found';
    } else {
      statusCode = 400;
      message = 'Database request error';
    }
  } else if (err instanceof Error) {
    message = err.message;
  }

  if (statusCode === 500) {
    console.error('[UNHANDLED ERROR]', err);
  }

  res.status(statusCode).json({ statusCode, message, 
        ...(env.NODE_ENV === "production" && err instanceof Error ? { stack: err.stack } : {}),

   });
};

export default globalErrorHandler;
